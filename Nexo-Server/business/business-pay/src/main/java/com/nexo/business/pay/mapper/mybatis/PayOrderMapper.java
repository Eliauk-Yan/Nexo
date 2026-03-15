package com.nexo.business.pay.mapper.mybatis;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.nexo.business.pay.domain.entity.PayOrder;
import org.apache.ibatis.annotations.Mapper;

/**
 * 支付单Mapper
 */
@Mapper
public interface PayOrderMapper extends BaseMapper<PayOrder> {
}
