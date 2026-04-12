package com.nexo.common.api.order.request;

import com.nexo.common.api.nft.constant.NFTType;
import com.nexo.common.api.order.constant.TradeOrderEvent;

public class OrderConfirmRequest extends OrderUpdateRequest{

    /**
     * 买家Id
     */
    private String buyerId;

    /**
     * 商品Id
     */
    private String productId;

    /**
     * 商品类型
     */
    private NFTType nftType;

    /**
     * 数量
     */
    private Integer itemCount;


    @Override
    public TradeOrderEvent getOrderEvent() {
        return TradeOrderEvent.CONFIRM;
    }
}
