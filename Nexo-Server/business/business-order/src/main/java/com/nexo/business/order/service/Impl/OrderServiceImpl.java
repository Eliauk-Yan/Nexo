package com.nexo.business.order.service.Impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.order.domain.entity.TradeOrder;
import com.nexo.business.order.interfaces.vo.OrderVO;
import com.nexo.business.order.mapper.convert.OrderConvertor;
import com.nexo.business.order.mapper.mybatis.OrderMapper;
import com.nexo.business.order.service.OrderService;
import com.nexo.common.api.order.constant.TradeOrderState;
import com.nexo.common.web.result.MultiResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * @classname OrderServiceImpl
 * @description 订单模块服务实现类
 * @date 2026/02/06 22:21
 */
@Service
@RequiredArgsConstructor
public class OrderServiceImpl extends ServiceImpl<OrderMapper, TradeOrder> implements OrderService {

    /**
     * 订单Mapper
     */
    private final OrderMapper orderMapper;

    /**
     * 订单转换器
     */
    private final OrderConvertor orderConvertor;

    @Override
    public MultiResult<OrderVO> getOrderList(TradeOrderState state, Long current, Long size) {
        // 1. 构造页面
        Page<TradeOrder> blankPage = new Page<>(current, size);
        // 2. 构造查询条件
        LambdaQueryWrapper<TradeOrder> wrapper = new LambdaQueryWrapper<TradeOrder>().eq(TradeOrder::getBuyerId, StpUtil.getLoginIdAsLong());
        if (state != null) {
            wrapper.eq(TradeOrder::getOrderState, state);
        }
        wrapper.orderByDesc(TradeOrder::getCreatedAt);
        // 3. 查询数据
        Page<TradeOrder> orderPage = orderMapper.selectPage(blankPage, wrapper);
        // 4. 返回结果
        return MultiResult.multiSuccess(orderConvertor.toVOs(orderPage.getRecords()), orderPage.getTotal(), orderPage.getPages(), orderPage.getSize());
    }
}
