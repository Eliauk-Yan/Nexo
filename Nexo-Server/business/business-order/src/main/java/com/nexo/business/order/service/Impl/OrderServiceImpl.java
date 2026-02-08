package com.nexo.business.order.service.Impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.order.domain.entity.TradeOrder;
import com.nexo.business.order.mapper.mybatis.OrderMapper;
import com.nexo.business.order.service.OrderService;
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


}
