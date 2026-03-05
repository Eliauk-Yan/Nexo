package com.nexo.business.order.mapper.convert;

import com.nexo.business.order.domain.entity.TradeOrder;
import com.nexo.business.order.interfaces.vo.OrderVO;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * 订单实体转换器
 */
@Mapper(componentModel = "spring")
public interface OrderConvertor {

    OrderVO toVO(TradeOrder order);

    List<OrderVO> toVOs(List<TradeOrder> orders);

}
