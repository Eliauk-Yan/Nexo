package com.nexo.business.collection.listener;


import com.nexo.business.collection.domain.entity.NFT;
import com.nexo.business.collection.domain.exception.NFTException;
import com.nexo.business.collection.service.NFTService;
import com.nexo.common.api.nft.constant.NFTState;
import com.nexo.common.api.blockchain.model.ChainOperateBody;
import com.nexo.common.api.blockchain.response.data.ChainResultData;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.nft.constant.NFTType;
import com.nexo.common.mq.consumer.StreamConsumer;
import com.nexo.common.mq.message.MessageBody;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.context.annotation.Bean;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.function.Consumer;

import static com.nexo.business.collection.domain.exception.ArtWorkErrorCode.*;

/**
 * @classname ChainOperateResultListener
 * @description 链操作结果监听器
 * @date 2026/02/25 01:18
 */
@RequiredArgsConstructor
@Component
@Slf4j
public class ChainOperateResultListener extends StreamConsumer {

    /**
     * 藏品服务
     */
    private final NFTService NFTService;

    /**
     * 库存服务门面
     */
    @DubboReference(version = "1.0.0")
    private InventoryFacade inventoryFacade;

    @Bean
    Consumer<Message<MessageBody>> chain() {
        return msg -> {
            // 1. 获取MQ消息并反序列化为对象
            ChainOperateBody chainOperateBody = getMessage(msg, ChainOperateBody.class);
            // 2. 获取链结果信息
            ChainResultData chainResultData = chainOperateBody.getChainResultData();
            // 3. 成功情况处理
            switch (chainOperateBody.getOperateType()) {
                // 3.1 藏品上链
                case NFT_ON_CHAIN:
                    // 3.1.1 获取藏品 藏品上链成功更新,只有一个txHash
                    NFT nft = NFTService.getById(chainOperateBody.getBizId());
                    if (null == nft) {
                        throw new NFTException(NFT_QUERY_FAILED);
                    }
                    // 3.1.2 先写缓存，写成功再更新状态
                    initInventory(nft.getId().toString(), NFTType.NFT,  nft.getQuantity(), nft.getIdentifier());
                    // 3.1.3 更新状态
                    nft.setState(NFTState.SUCCESS);
                    nft.setSyncChainTime(LocalDateTime.now());
                    boolean result = NFTService.updateById(nft);
                    if (!result) {
                        throw new NFTException(NFT_UPDATE_FAILED);
                    }
                    break;
                default:
                    throw new IllegalStateException("Unexpected value: " + chainOperateBody.getBizType().getCode());
            }
        };
    }

    private void initInventory(String productId, NFTType nftType, Long inventory, String identifier) {
        // 1. 构造库存请求
        InventoryRequest inventoryRequest = new InventoryRequest();
        inventoryRequest.setNftId(productId);
        inventoryRequest.setNFTType(nftType);
        inventoryRequest.setInventory(inventory);
        inventoryRequest.setIdentifier(identifier);
        // 2. 初始化Redis库存
        InventoryResponse<Boolean> inventoryResponse = inventoryFacade.init(inventoryRequest);
        // 3. 请求失败，抛出异常
        if (!inventoryResponse.getSuccess()) {
            throw new NFTException(NFT_INVENTORY_INIT_FAILED);
        }
    }

}
