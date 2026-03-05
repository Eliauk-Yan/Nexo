package com.nexo.business.order.mapper.mybatis;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.nexo.business.order.domain.entity.TradeOrder;
import org.springframework.stereotype.Repository;

/**
 * @classname OrderMapper
 * @description 订单Mapper
 * @date 2026/02/08 02:32
 */
@Repository
public interface OrderMapper extends BaseMapper<TradeOrder> {

}
