package com.nexo.business.order.service.Impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.order.domain.entity.TradeOrderStream;
import com.nexo.business.order.mapper.mybatis.OrderStreamMapper;
import com.nexo.business.order.service.OrderStreamService;
import org.springframework.stereotype.Service;

/**
 * @classname OrderStreamServiceImpl
 * @description 订单流水服务实现类
 * @date 2026/02/08 16:23
 */
@Service
public class OrderStreamServiceImpl extends ServiceImpl<OrderStreamMapper, TradeOrderStream> implements OrderStreamService {



}
