package com.nexo.business.pay.mapper.convert;

import com.nexo.business.pay.domain.entity.PayOrder;
import com.nexo.common.api.pay.response.PayOrderDTO;
import com.nexo.common.api.pay.response.data.PayOrderVO;
import org.mapstruct.Mapping;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PayOrderConvert {

    @Mapping(target = "payState", source = "orderState")
    PayOrderVO toVO(PayOrder payOrder);

    List<PayOrderVO> toVOs(List<PayOrder> payOrders);

    @Mapping(target = "wechatPayParams", ignore = true)
    PayOrderDTO toDTO(PayOrder payOrder);

    List<PayOrderDTO> toDTOs(List<PayOrder> payOrders);
}
