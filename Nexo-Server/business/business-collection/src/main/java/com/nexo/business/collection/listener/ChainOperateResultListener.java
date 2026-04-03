package com.nexo.business.collection.listener;

import com.nexo.business.collection.domain.entity.Asset;
import com.nexo.business.collection.domain.entity.NFT;
import com.nexo.business.collection.domain.exception.NFTException;
import com.nexo.business.collection.service.AssetService;
import com.nexo.business.collection.service.NFTService;
import com.nexo.common.api.blockchain.constant.ChainOperationBizType;
import com.nexo.common.api.blockchain.model.ChainOperateBody;
import com.nexo.common.api.blockchain.response.data.ChainResultData;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.nft.constant.NFTState;
import com.nexo.common.api.nft.constant.NFTType;
import com.nexo.common.api.order.OrderFacade;
import com.nexo.common.api.order.request.OrderFinishRequest;
import com.nexo.common.api.user.constant.UserType;
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

import static com.nexo.business.collection.domain.exception.ArtWorkErrorCode.NFT_INVENTORY_INIT_FAILED;
import static com.nexo.business.collection.domain.exception.ArtWorkErrorCode.NFT_QUERY_FAILED;
import static com.nexo.business.collection.domain.exception.ArtWorkErrorCode.NFT_UPDATE_FAILED;

/**
 * 链上操作结果监听器
 */
@RequiredArgsConstructor
@Component
@Slf4j
public class ChainOperateResultListener extends StreamConsumer {

    private final NFTService NFTService;

    private final AssetService assetService;

    @DubboReference(version = "1.0.0")
    private InventoryFacade inventoryFacade;

    @DubboReference(version = "1.0.0")
    private OrderFacade orderFacade;

    @Bean
    Consumer<Message<MessageBody>> chain() {
        return msg -> {
            ChainOperateBody chainOperateBody = getMessage(msg, ChainOperateBody.class);
            ChainResultData chainResultData = chainOperateBody.getChainResultData();

            switch (chainOperateBody.getOperateType()) {
                case NFT_ON_CHAIN:
                case NFT_MINT:
                    if (chainOperateBody.getBizType() == ChainOperationBizType.ASSET) {
                        handleAssetActivated(chainOperateBody, chainResultData);
                    } else if (chainOperateBody.getBizType() == ChainOperationBizType.NFT) {
                        handleNftActivated(chainOperateBody, chainResultData);
                    } else {
                        log.warn("未处理的链回调业务类型, bizType={}, operateType={}",
                                chainOperateBody.getBizType(), chainOperateBody.getOperateType());
                    }
                    break;
                default:
                    log.warn("未处理的链回调操作类型, bizType={}, operateType={}",
                            chainOperateBody.getBizType(), chainOperateBody.getOperateType());
            }
        };
    }

    private void handleNftActivated(ChainOperateBody chainOperateBody, ChainResultData chainResultData) {
        NFT nft = NFTService.getById(chainOperateBody.getBizId());
        if (nft == null) {
            Long bizId = parseBizId(chainOperateBody.getBizId());
            Asset asset = bizId == null ? null : assetService.getById(bizId);
            if (asset != null) {
                log.warn("链回调业务类型与数据不一致, bizId={}, declaredBizType={}, fallback=ASSET",
                        chainOperateBody.getBizId(), chainOperateBody.getBizType());
                handleAssetActivated(chainOperateBody, chainResultData);
                return;
            }
            log.error("链回调未找到对应NFT或资产记录, bizId={}, operateType={}, bizType={}",
                    chainOperateBody.getBizId(), chainOperateBody.getOperateType(), chainOperateBody.getBizType());
            return;
        }
        initInventory(nft.getId().toString(), NFTType.NFT, nft.getQuantity(), nft.getIdentifier());
        nft.setState(NFTState.SUCCESS);
        nft.setSyncChainTime(LocalDateTime.now());
        if (!NFTService.updateById(nft)) {
            throw new NFTException(NFT_UPDATE_FAILED);
        }
    }

    private void handleAssetActivated(ChainOperateBody chainOperateBody, ChainResultData chainResultData) {
        Long assetId = parseBizId(chainOperateBody.getBizId());
        if (assetId == null) {
            log.error("链回调资产业务ID非法, bizId={}, operateType={}",
                    chainOperateBody.getBizId(), chainOperateBody.getOperateType());
            return;
        }
        boolean activated = assetService.activateAsset(assetId, chainResultData != null ? chainResultData.getTxHash() : null);
        if (!activated) {
            throw new NFTException(NFT_UPDATE_FAILED);
        }

        Asset asset = assetService.getById(assetId);
        if (asset == null) {
            throw new NFTException(NFT_QUERY_FAILED);
        }
        if (asset.getBusinessNo() == null || asset.getBusinessNo().isBlank()) {
            return;
        }

        OrderFinishRequest request = new OrderFinishRequest();
        request.setIdentifier("asset_finish_" + assetId);
        request.setOrderId(asset.getBusinessNo());
        request.setOperateTime(LocalDateTime.now());
        request.setOperator(UserType.PLATFORM.getCode());
        request.setOperatorType(UserType.PLATFORM);

        var response = orderFacade.finish(request);
        if (!response.getSuccess()) {
            throw new NFTException(NFT_UPDATE_FAILED);
        }
    }

    private void initInventory(String productId, NFTType nftType, Long inventory, String identifier) {
        InventoryRequest inventoryRequest = new InventoryRequest();
        inventoryRequest.setNftId(productId);
        inventoryRequest.setNFTType(nftType);
        inventoryRequest.setInventory(inventory);
        inventoryRequest.setIdentifier(identifier);
        InventoryResponse<Boolean> inventoryResponse = inventoryFacade.init(inventoryRequest);
        if (!inventoryResponse.getSuccess()) {
            throw new NFTException(NFT_INVENTORY_INIT_FAILED);
        }
    }

    private Long parseBizId(String bizId) {
        try {
            return Long.valueOf(bizId);
        } catch (Exception e) {
            return null;
        }
    }
}
