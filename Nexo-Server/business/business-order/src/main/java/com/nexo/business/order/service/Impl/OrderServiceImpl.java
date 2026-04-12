package com.nexo.business.order.service.Impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.order.domain.entity.TradeOrder;
import com.nexo.business.order.domain.entity.TradeOrderStream;
import com.nexo.business.order.domain.exception.OrderException;
import com.nexo.business.order.interfaces.vo.OrderVO;
import com.nexo.business.order.mapper.convert.OrderConvertor;
import com.nexo.business.order.mapper.mybatis.OrderMapper;
import com.nexo.business.order.mapper.mybatis.OrderStreamMapper;
import com.nexo.business.order.service.OrderService;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.nft.NFTFacade;
import com.nexo.common.api.nft.request.AssetAllocateRequest;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.order.request.*;
import com.nexo.common.api.order.response.OrderResponse;
import com.nexo.common.base.response.ResponseCode;
import com.nexo.common.web.result.MultiResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.function.Consumer;

import static com.nexo.business.order.domain.exception.OrderErrorCode.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl extends ServiceImpl<OrderMapper, TradeOrder> implements OrderService {

    /**
     * 订单Mapper
     */
    private final OrderMapper orderMapper;

    /**
     * 订单流水Mapper
     */
    private final OrderStreamMapper orderStreamMapper;

    /**
     * 订单Convertor
     */
    private final OrderConvertor orderConvertor;

    /**
     * 库存接口
     */
    @DubboReference(version = "1.0.0")
    private InventoryFacade inventoryFacade;

    /**
     * 藏品接口
     */
    @DubboReference(version = "1.0.0")
    private NFTFacade nftFacade;

    @Override
    public MultiResult<OrderVO> getOrderList(TradeOrderState state, Long current, Long size) {
        Page<TradeOrder> blankPage = new Page<>(current, size);
        LambdaQueryWrapper<TradeOrder> wrapper = new LambdaQueryWrapper<TradeOrder>()
                .eq(TradeOrder::getBuyerId, StpUtil.getLoginIdAsLong());
        if (state != null) {
            wrapper.eq(TradeOrder::getOrderState, state);
        }
        wrapper.orderByDesc(TradeOrder::getCreatedAt);
        Page<TradeOrder> orderPage = orderMapper.selectPage(blankPage, wrapper);
        return MultiResult.multiSuccess(
                orderConvertor.toVOs(orderPage.getRecords()),
                orderPage.getTotal(),
                orderPage.getPages(),
                orderPage.getSize());
    }

    @Override
    public TradeOrder getOrder(String orderId, Long userId) {
        return orderMapper.selectOne(new LambdaQueryWrapper<TradeOrder>()
                .eq(TradeOrder::getOrderId, orderId)
                .eq(userId != null, TradeOrder::getBuyerId, userId));
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public OrderResponse<Boolean> createAndConfirm(OrderCreateAndConfirmRequest request) {
        OrderResponse<Boolean> response = new OrderResponse<>();
        // 1. 查询订单，幂等验证
        TradeOrder existOrder = orderMapper.selectOne(new LambdaQueryWrapper<TradeOrder>().eq(TradeOrder::getIdentifier, request.getIdentifier()).eq(TradeOrder::getBuyerId, request.getBuyerId()));
        if (existOrder != null) {
            response.setSuccess(true);
            response.setOrderId(existOrder.getOrderId());
            return response;
        }
        // 2. 创建订单
        TradeOrder tradeOrder = new TradeOrder();
        tradeOrder.create(request);
        OrderConfirmRequest confirmRequest = new OrderConfirmRequest();
        BeanUtils.copyProperties(request, confirmRequest);
        confirmRequest.setOrderId(tradeOrder.getOrderId());
        tradeOrder.confirm(confirmRequest);
        boolean result = orderMapper.insert(tradeOrder) == 1;
        if (!result) {
            throw new OrderException(INSERT_ORDER_FAILED);
        }
        TradeOrderStream tradeOrderStream = new TradeOrderStream();
        BeanUtils.copyProperties(tradeOrder, tradeOrderStream);
        tradeOrderStream.setStreamType(request.getOrderEvent());
        tradeOrderStream.setStreamIdentifier(request.getIdentifier());
        result = orderStreamMapper.insert(tradeOrderStream) == 1;
        if (!result) {
            throw new OrderException(ORDER_STREAM_INSERT_FAILED);
        }
        response.setSuccess(true);
        response.setOrderId(tradeOrder.getOrderId());
        return response;
    }


    @Override
    public boolean paySuccess(OrderPayRequest request) {
        TradeOrder order = orderMapper.selectOne(new LambdaQueryWrapper<TradeOrder>().eq(TradeOrder::getOrderId, request.getOrderId()));
        if (order == null) {
            log.error("订单不存在, orderId={}", request.getOrderId());
            return false;
        }
        if (order.getOrderState() != TradeOrderState.CONFIRM) {
            log.warn("订单状态不允许支付, orderId={}, state={}", request.getOrderId(), order.getOrderState());
            return order.getOrderState() == TradeOrderState.PAID;
        }
        LambdaUpdateWrapper<TradeOrder> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(TradeOrder::getOrderId, request.getOrderId())
                .eq(TradeOrder::getOrderState, TradeOrderState.CONFIRM)
                .set(TradeOrder::getOrderState, TradeOrderState.PAID)
                .set(TradeOrder::getPaymentAmount, request.getPaymentAmount())
                .set(TradeOrder::getPaymentTime, request.getOperateTime())
                .set(TradeOrder::getPaymentMethod, request.getPaymentMethod() != null ? request.getPaymentMethod().getCode() : null)
                .set(TradeOrder::getPaymentStreamId, request.getPaymentStreamId());
        boolean result = this.update(updateWrapper);
        log.info("订单支付推进结果, orderId={}, result={}", request.getOrderId(), result);
        if (result) {
            try {
                AssetAllocateRequest allocateRequest = new AssetAllocateRequest();
                allocateRequest.setBusinessNo(order.getOrderId());
                allocateRequest.setBusinessType(order.getNftType().name());
                allocateRequest.setBuyerId(Long.parseLong(order.getBuyerId()));
                allocateRequest.setArtworkId(Long.parseLong(order.getProductId()));
                allocateRequest.setNftType(order.getNftType());
                allocateRequest.setPurchasePrice(request.getPaymentAmount());
                allocateRequest.setIdentifier(order.getIdentifier());
                Boolean allocateResult = nftFacade.allocateAsset(allocateRequest);
                if (Boolean.TRUE.equals(allocateResult)) {
                    log.info("向买家发放数字资产成功, orderId={}, artworkId={}", order.getOrderId(), order.getProductId());
                } else {
                    log.error("向买家发放数字资产失败, orderId={}, artworkId={}", order.getOrderId(), order.getProductId());
                }
            } catch (Exception e) {
                log.error("调用资产发放服务异常, orderId={}", order.getOrderId(), e);
            }
        }

        return result;
    }

    @Override
    public boolean finish(OrderFinishRequest request) {
        TradeOrder order = orderMapper.selectOne(new LambdaQueryWrapper<TradeOrder>().eq(TradeOrder::getOrderId, request.getOrderId()));
        // 订单校验
        if (order == null) {
            log.error("订单不存在, orderId={}", request.getOrderId());
            return false;
        }
        if (order.getOrderState() == TradeOrderState.FINISH) {
            return true;
        }
        if (order.getOrderState() != TradeOrderState.PAID) {
            log.warn("订单状态不允许完成, orderId={}, state={}", request.getOrderId(), order.getOrderState());
            return false;
        }
        // 状态转移
        order.finish();
        // 更新状态
        return this.updateById(order);
    }

    @Override
    public OrderResponse<Boolean> cancel(OrderCancelRequest cancelRequest) {
        return doExecute(cancelRequest, tradeOrder -> tradeOrder.close(cancelRequest.getOperateTime(), cancelRequest.getOrderEvent().getCode()));
    }

    @Override
    public List<TradeOrder> pageQueryTimeoutOrders(int pageSize, String buyerIdTailNumber, Long minId) {
        Date timeoutLine = DateUtils.addMinutes(new Date(), -TradeOrder.DEFAULT_TIME_OUT_MINUTES);
        LambdaQueryWrapper<TradeOrder> wrapper = Wrappers.lambdaQuery();
        wrapper.in(TradeOrder::getOrderState,
                        TradeOrderState.CONFIRM.name(),
                        TradeOrderState.CREATE.name())
                .lt(TradeOrder::getCreatedAt, timeoutLine)
                .orderByAsc(TradeOrder::getId)
                .last("limit " + pageSize);

        if (StringUtils.isNotBlank(buyerIdTailNumber)) {
            wrapper.apply("right(buyer_id, 2) = {0}", buyerIdTailNumber);
        }
        if (minId != null) {
            wrapper.ge(TradeOrder::getId, minId);
        }
        return this.list(wrapper);
    }

    @Override
    public OrderResponse<Boolean> timeout(OrderTimeoutRequest timeoutRequest) {
        return doExecute(timeoutRequest, tradeOrder -> tradeOrder.close(timeoutRequest.getOperateTime(), timeoutRequest.getOrderEvent().getCode()));
    }

    protected OrderResponse<Boolean> doExecute(OrderUpdateRequest updateRequest, Consumer<TradeOrder> consumer) {
        // 1. 从数据库查询最新订单消息
        TradeOrder tradeOrder = this.getOrder(updateRequest.getOrderId(), null);
        // 2. 订单校验
        // 2.1 非空校验
        if (tradeOrder == null) {
            throw new OrderException(ORDER_NOT_EXIST);
        }
        // 2.2 权限校验 只能取消自己的订单
        if (updateRequest instanceof OrderCancelRequest
                && !Objects.equals(tradeOrder.getBuyerId(), updateRequest.getOperator())) {
            throw new OrderException(PERMISSION_DENIED);
        }
        // 2.3 状态校验
        if (tradeOrder.getOrderState() != TradeOrderState.CONFIRM) {
            throw new OrderException(ORDER_STATE_ILLEGAL);
        }
        // 3. 幂等判断
        TradeOrderStream tradeOrderStream = orderStreamMapper.selectOne(
                new LambdaQueryWrapper<TradeOrderStream>()
                        .eq(TradeOrderStream::getOrderId, updateRequest.getOrderId())
                        .eq(TradeOrderStream::getStreamIdentifier, updateRequest.getIdentifier())
                        .eq(TradeOrderStream::getStreamType, updateRequest.getOrderEvent().getCode())
        );
        if (tradeOrderStream != null) {
            OrderResponse<Boolean> orderResponse = new OrderResponse<>();
            orderResponse.setOrderId(updateRequest.getOrderId());
            orderResponse.setStreamId(tradeOrderStream.getId());
            orderResponse.setSuccess(true);
            orderResponse.setCode(ResponseCode.DUPLICATED.getCode());
            orderResponse.setMessage(ResponseCode.DUPLICATED.getMessage());
            return orderResponse;
        }
        // 4. 业务处理
        consumer.accept(tradeOrder);
        // 5. 持久化到数据库
        // 5.1 跟新订单状态
        boolean result = orderMapper.updateById(tradeOrder) == 1;
        if (!result) {
            throw new OrderException(UPDATE_ORDER_FAILED);
        }
        // 5.2 持久化操作流水
        TradeOrderStream orderStream = new TradeOrderStream();
        orderStream.setOrderId(tradeOrder.getOrderId());
        orderStream.setBuyerId(tradeOrder.getBuyerId());
        orderStream.setBuyerType(tradeOrder.getBuyerType());
        orderStream.setSellerId(tradeOrder.getSellerId());
        orderStream.setSellerType(tradeOrder.getSellerType());
        orderStream.setIdentifier(tradeOrder.getIdentifier());
        orderStream.setTotalPrice(tradeOrder.getTotalPrice());
        orderStream.setPaymentAmount(tradeOrder.getPaymentAmount());
        orderStream.setCompletionTime(tradeOrder.getCompletionTime());
        orderStream.setCosingTime(tradeOrder.getClosingTime());
        orderStream.setConfirmedTime(tradeOrder.getConfirmedTime());
        orderStream.setPaymentTime(tradeOrder.getPaymentTime());
        orderStream.setProductId(tradeOrder.getProductId());
        orderStream.setProductName(tradeOrder.getProductName());
        orderStream.setNftType(tradeOrder.getNftType());
        orderStream.setProductCoverUrl(tradeOrder.getProductCoverUrl());
        orderStream.setPaymentMethod(tradeOrder.getPaymentMethod());
        orderStream.setPaymentStreamId(tradeOrder.getPaymentStreamId());
        orderStream.setOrderState(tradeOrder.getOrderState());
        orderStream.setCloseType(tradeOrder.getCloseType());
        orderStream.setSnapshotVersion(tradeOrder.getSnapshotVersion());
        orderStream.setUnitPrice(tradeOrder.getUnitPrice());
        orderStream.setQuantity(tradeOrder.getQuantity());
        orderStream.setStreamType(updateRequest.getOrderEvent());
        orderStream.setStreamIdentifier(updateRequest.getIdentifier());
        result = orderStreamMapper.insert(orderStream) == 1;
        if (!result) {
            throw new OrderException(ORDER_STREAM_INSERT_FAILED);
        }
        OrderResponse<Boolean> response = new OrderResponse<>();
        response.setOrderId(tradeOrder.getOrderId());
        response.setStreamId(orderStream.getId());
        response.setSuccess(true);
        return response;
    }

}
