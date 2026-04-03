package com.nexo.business.order.service.Impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.order.domain.entity.TradeOrder;
import com.nexo.business.order.interfaces.vo.OrderVO;
import com.nexo.business.order.mapper.convert.OrderConvertor;
import com.nexo.business.order.mapper.mybatis.OrderMapper;
import com.nexo.business.order.service.OrderService;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.nft.NFTFacade;
import com.nexo.common.api.nft.request.AssetAllocateRequest;
import com.nexo.common.api.nft.request.NFTSaleRequest;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.order.request.OrderFinishRequest;
import com.nexo.common.api.order.request.OrderPayRequest;
import com.nexo.common.web.result.MultiResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl extends ServiceImpl<OrderMapper, TradeOrder> implements OrderService {

    private final OrderMapper orderMapper;

    private final OrderConvertor orderConvertor;

    @DubboReference(version = "1.0.0")
    private InventoryFacade inventoryFacade;

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
                .eq(TradeOrder::getBuyerId, userId));
    }

    @Override
    public boolean paySuccess(OrderPayRequest request) {
        TradeOrder order = orderMapper.selectOne(
                new LambdaQueryWrapper<TradeOrder>().eq(TradeOrder::getOrderId, request.getOrderId()));

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
                .set(
                        TradeOrder::getPaymentMethod,
                        request.getPaymentMethod() != null ? request.getPaymentMethod().getCode() : null)
                .set(TradeOrder::getPaymentStreamId, request.getPaymentStreamId());

        boolean result = this.update(updateWrapper);
        log.info("订单支付推进结果, orderId={}, result={}", request.getOrderId(), result);

        if (result) {
            try {
                AssetAllocateRequest allocateRequest = new AssetAllocateRequest();
                allocateRequest.setBusinessNo(order.getOrderId());
                allocateRequest.setBusinessType(order.getNFTType().name());
                allocateRequest.setBuyerId(Long.parseLong(order.getBuyerId()));
                allocateRequest.setArtworkId(Long.parseLong(order.getProductId()));
                allocateRequest.setNFTType(order.getNFTType());
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
        TradeOrder order = orderMapper.selectOne(
                new LambdaQueryWrapper<TradeOrder>().eq(TradeOrder::getOrderId, request.getOrderId()));

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

        LambdaUpdateWrapper<TradeOrder> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(TradeOrder::getOrderId, request.getOrderId())
                .eq(TradeOrder::getOrderState, TradeOrderState.PAID)
                .set(TradeOrder::getOrderState, TradeOrderState.FINISH)
                .set(TradeOrder::getCompletionTime, request.getOperateTime());
        boolean result = this.update(updateWrapper);
        log.info("订单完成推进结果, orderId={}, result={}", request.getOrderId(), result);
        return result;
    }

    @Override
    public boolean cancelOrder(String orderId, Long userId) {
        TradeOrder order = orderMapper.selectOne(new LambdaQueryWrapper<TradeOrder>()
                .eq(TradeOrder::getOrderId, orderId)
                .eq(TradeOrder::getBuyerId, userId));
        if (order == null) {
            log.error("订单不存在或不属于当前用户, orderId={}, userId={}", orderId, userId);
            return false;
        }

        if (order.getOrderState() != TradeOrderState.CREATE && order.getOrderState() != TradeOrderState.CONFIRM) {
            log.warn("订单状态不允许取消, orderId={}, state={}", orderId, order.getOrderState());
            return order.getOrderState() == TradeOrderState.CLOSED;
        }

        LambdaUpdateWrapper<TradeOrder> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(TradeOrder::getOrderId, orderId)
                .in(TradeOrder::getOrderState, TradeOrderState.CREATE, TradeOrderState.CONFIRM)
                .set(TradeOrder::getOrderState, TradeOrderState.CLOSED)
                .set(TradeOrder::getClosingTime, LocalDateTime.now())
                .set(TradeOrder::getCloseType, "CANCEL");
        boolean result = this.update(updateWrapper);
        log.info("订单取消结果, orderId={}, result={}", orderId, result);
        if (result) {
            try {
                InventoryRequest inventoryRequest = new InventoryRequest();
                inventoryRequest.setNftId(order.getProductId());
                inventoryRequest.setNFTType(order.getNFTType());
                inventoryRequest.setIdentifier(order.getIdentifier());
                inventoryRequest.setInventory((long) order.getQuantity());
                var inventoryResponse = inventoryFacade.increaseInventory(inventoryRequest);
                if (inventoryResponse.getSuccess() && Boolean.TRUE.equals(inventoryResponse.getData())) {
                    log.info("Redis库存回滚成功, orderId={}, productId={}", orderId, order.getProductId());
                } else {
                    log.error("Redis库存回滚失败, orderId={}, productId={}, response={}",
                            orderId, order.getProductId(), inventoryResponse);
                }
            } catch (Exception e) {
                log.error("Redis库存回滚异常, orderId={}", orderId, e);
            }

            try {
                NFTSaleRequest saleRequest = new NFTSaleRequest();
                saleRequest.setUserId(userId.toString());
                saleRequest.setQuantity((long) order.getQuantity());
                saleRequest.setBizNo(orderId);
                saleRequest.setNftType(order.getNFTType());
                saleRequest.setIdentifier(order.getIdentifier());
                saleRequest.setNFTId(Long.parseLong(order.getProductId()));
                nftFacade.unsale(saleRequest);
                log.info("数据库库存回推请求已完成, orderId={}", orderId);
            } catch (Exception e) {
                log.error("数据库库存回推异常, orderId={}", orderId, e);
            }
        }
        return result;
    }
}
