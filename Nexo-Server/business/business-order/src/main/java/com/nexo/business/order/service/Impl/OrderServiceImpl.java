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
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.api.order.request.OrderCreateRequest;
import com.nexo.common.api.order.request.OrderPayRequest;
import com.nexo.common.api.product.ProductFacade;
import com.nexo.common.api.product.request.ProductSaleRequest;
import com.nexo.common.api.artwork.ArtWorkFacade;
import com.nexo.common.api.artwork.request.AssetAllocateRequest;
import com.nexo.common.web.result.MultiResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * @classname OrderServiceImpl
 * @description 订单模块服务实现类
 * @date 2026/02/06 22:21
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl extends ServiceImpl<OrderMapper, TradeOrder> implements OrderService {

    /**
     * 订单Mapper
     */
    private final OrderMapper orderMapper;

    /**
     * 订单转换器
     */
    private final OrderConvertor orderConvertor;

    @DubboReference(version = "1.0.0")
    private InventoryFacade inventoryFacade;

    @DubboReference(version = "1.0.0")
    private ProductFacade productFacade;

    @DubboReference(version = "1.0.0")
    private ArtWorkFacade artWorkFacade;

    @Override
    public MultiResult<OrderVO> getOrderList(TradeOrderState state, Long current, Long size) {
        // 1. 构造页面
        Page<TradeOrder> blankPage = new Page<>(current, size);
        // 2. 构造查询条件
        LambdaQueryWrapper<TradeOrder> wrapper = new LambdaQueryWrapper<TradeOrder>().eq(TradeOrder::getBuyerId,
                StpUtil.getLoginIdAsLong());
        if (state != null) {
            wrapper.eq(TradeOrder::getOrderState, state);
        }
        wrapper.orderByDesc(TradeOrder::getCreatedAt);
        // 3. 查询数据
        Page<TradeOrder> orderPage = orderMapper.selectPage(blankPage, wrapper);
        // 4. 返回结果
        return MultiResult.multiSuccess(orderConvertor.toVOs(orderPage.getRecords()), orderPage.getTotal(),
                orderPage.getPages(), orderPage.getSize());
    }

    @Override
    public TradeOrder getOrder(String orderId, Long userId) {
        return orderMapper.selectOne(new LambdaQueryWrapper<TradeOrder>().eq(TradeOrder::getOrderId, orderId)
                .eq(TradeOrder::getBuyerId, userId));
    }

    @Override
    public boolean paySuccess(OrderPayRequest request) {
        // 1. 查询订单
        TradeOrder order = orderMapper.selectOne(
                new LambdaQueryWrapper<TradeOrder>().eq(TradeOrder::getOrderId, request.getOrderId()));

        if (order == null) {
            log.error("订单不存在, orderId={}", request.getOrderId());
            return false;
        }

        // 2. 校验订单状态（只有CONFIRM状态可以推进到PAID）
        if (order.getOrderState() != TradeOrderState.CONFIRM) {
            log.warn("订单状态不允许支付, orderId={}, state={}", request.getOrderId(), order.getOrderState());
            return order.getOrderState() == TradeOrderState.PAID; // 幂等
        }

        // 3. 更新订单支付信息
        LambdaUpdateWrapper<TradeOrder> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(TradeOrder::getOrderId, request.getOrderId())
                .eq(TradeOrder::getOrderState, TradeOrderState.CONFIRM)
                .set(TradeOrder::getOrderState, TradeOrderState.PAID)
                .set(TradeOrder::getPaymentAmount, request.getPaymentAmount())
                .set(TradeOrder::getPaymentTime, request.getOperateTime())
                .set(TradeOrder::getPaymentMethod,
                        request.getPaymentMethod() != null ? request.getPaymentMethod().getCode() : null)
                .set(TradeOrder::getPaymentStreamId, request.getPaymentStreamId());

        boolean result = this.update(updateWrapper);
        log.info("订单支付推进结果, orderId={}, result={}", request.getOrderId(), result);

        // 4. 发放对应的数字资产并请求上链
        if (result) {
            try {
                AssetAllocateRequest allocateRequest = new AssetAllocateRequest();
                allocateRequest.setBusinessNo(order.getOrderId());
                allocateRequest.setBusinessType(order.getNFTType().name()); // 此处如果业务类型不符，可以在Asset表中直接用ProductType
                allocateRequest.setBuyerId(Long.parseLong(order.getBuyerId()));
                allocateRequest.setArtworkId(Long.parseLong(order.getProductId()));
                allocateRequest.setNFTType(order.getNFTType());
                allocateRequest.setPurchasePrice(request.getPaymentAmount());
                allocateRequest.setIdentifier(order.getIdentifier()); // 使用订单的幂等号作为生成资产的追踪

                Boolean allocateResult = artWorkFacade.allocateAsset(allocateRequest);
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
    public boolean cancelOrder(String orderId, Long userId) {
        // 1. 查询订单
        TradeOrder order = orderMapper.selectOne(
                new LambdaQueryWrapper<TradeOrder>()
                        .eq(TradeOrder::getOrderId, orderId)
                        .eq(TradeOrder::getBuyerId, userId));

        if (order == null) {
            log.error("订单不存在或不属于当前用户, orderId={}, userId={}", orderId, userId);
            return false;
        }

        // 2. 校验订单状态（只有 CREATE 或 CONFIRM 状态可以取消）
        if (order.getOrderState() != TradeOrderState.CREATE && order.getOrderState() != TradeOrderState.CONFIRM) {
            log.warn("订单状态不允许取消, orderId={}, state={}", orderId, order.getOrderState());
            return order.getOrderState() == TradeOrderState.CLOSED; // 幂等：已关闭则返回true
        }

        // 3. 更新订单状态为 CLOSED
        LambdaUpdateWrapper<TradeOrder> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(TradeOrder::getOrderId, orderId)
                .in(TradeOrder::getOrderState, TradeOrderState.CREATE, TradeOrderState.CONFIRM)
                .set(TradeOrder::getOrderState, TradeOrderState.CLOSED)
                .set(TradeOrder::getClosingTime, LocalDateTime.now())
                .set(TradeOrder::getCloseType, "CANCEL");

        boolean result = this.update(updateWrapper);
        log.info("订单取消结果, orderId={}, result={}", orderId, result);

        if (result) {
            // 4. Redis库存回滚
            try {
                OrderCreateRequest revertRequest = new OrderCreateRequest();
                revertRequest.setOrderId(orderId);
                revertRequest.setIdentifier(order.getIdentifier());
                revertRequest.setProductId(order.getProductId());
                revertRequest.setNFTType(order.getNFTType());
                revertRequest.setItemCount((long) order.getQuantity());
                inventoryFacade.increaseInventory(revertRequest);
                log.info("Redis库存回推请求已发送, orderId={}", orderId);
            } catch (Exception e) {
                log.error("Redis库存回推异常, orderId={}", orderId, e);
            }

            // 5. 数据库真实库存回滚
            try {
                ProductSaleRequest saleRequest = new ProductSaleRequest();
                saleRequest.setUserId(userId.toString());
                saleRequest.setQuantity((long) order.getQuantity());
                saleRequest.setBizNo(orderId);
                saleRequest.setNFTType(order.getNFTType());
                saleRequest.setIdentifier(order.getIdentifier());
                saleRequest.setProductId(Long.parseLong(order.getProductId()));
                productFacade.unsale(saleRequest);
                log.info("数据库库存回推请求已完成, orderId={}", orderId);
            } catch (Exception e) {
                log.error("数据库库存回推异常, orderId={}", orderId, e);
            }
        }

        return result;
    }
}
