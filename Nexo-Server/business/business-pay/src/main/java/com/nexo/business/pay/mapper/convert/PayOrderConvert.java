package com.nexo.business.pay.mapper.convert;

import com.nexo.business.pay.domain.entity.PayOrder;
import com.nexo.common.api.pay.response.PayOrderDTO;
import com.nexo.common.api.pay.response.data.PayOrderVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PayOrderConvert {

    @Mapping(target = "payState", source = "orderState")
    PayOrderVO toVO(PayOrder payOrder);

    List<PayOrderVO> toVOs(List<PayOrder> payOrders);

    PayOrderDTO toDTO(PayOrder payOrder);

    List<PayOrderDTO> toDTOs(List<PayOrder> payOrders);
}
