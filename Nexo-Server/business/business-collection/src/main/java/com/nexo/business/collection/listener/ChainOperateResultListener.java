package com.nexo.business.collection.listener;

import com.nexo.business.collection.domain.entity.Asset;
import com.nexo.business.collection.domain.entity.NFT;
import com.nexo.business.collection.domain.exception.NFTException;
import com.nexo.business.collection.service.AssetService;
import com.nexo.business.collection.service.NFTService;
import com.nexo.common.api.blockchain.model.ChainOperateBody;
import com.nexo.common.api.blockchain.response.data.ChainResultData;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.nft.constant.AssetState;
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

import static com.nexo.business.collection.domain.exception.NFTErrorCode.*;
import static com.nexo.common.api.nft.constant.AssetState.DESTROYED;
import static com.nexo.common.api.nft.constant.AssetState.DESTROYING;

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
                    // 藏品上链
                    // 1. 根据id查找藏品
                    NFT nft = NFTService.getById(chainOperateBody.getBizId());
                    if (nft == null) {
                        log.error("链回调未找到对应NFT或资产记录, bizId={}, operateType={}, bizType={}", chainOperateBody.getBizId(), chainOperateBody.getOperateType(), chainOperateBody.getBizType());
                        return;
                    }
                    // 2. 初始化库存
                    initInventory(nft.getId().toString(), nft.getQuantity(), nft.getIdentifier());
                    // 3. 状态转移
                    nft.success();
                    if (!NFTService.updateById(nft)) {
                        throw new NFTException(NFT_UPDATE_FAILED);
                    }
                    break;
                case NFT_MINT:
                    // 藏品铸造
                    handleAssetActivated(chainOperateBody, chainResultData);
                    break;
                case NFT_DESTROY:
                    // 资产销毁
                    handleAssetDestroyed(chainOperateBody);
                    break;
                case NFT_TRANSFER:
                    // 资产转增
                    handleAssetTransfer(chainOperateBody, chainResultData);
                    break;
                default:
                    log.warn("未处理的链回调操作类型, bizType={}, operateType={}", chainOperateBody.getBizType(), chainOperateBody.getOperateType());
            }
        };
    }

    private void handleAssetActivated(ChainOperateBody chainOperateBody, ChainResultData chainResultData) {
        // 1. 根据资产ID查找资产
        Long assetId = Long.parseLong(chainOperateBody.getBizId());
        Asset asset = assetService.getById(assetId);
        if (asset == null) {
            throw new NFTException(NFT_QUERY_FAILED);
        }
        // 2. 状态激活
        asset.active(chainResultData.getTxid(), chainResultData.getAssetId());
        boolean activated = assetService.updateById(asset);
        if (!activated) {
            throw new NFTException(NFT_UPDATE_FAILED);
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

    private void handleAssetDestroyed(ChainOperateBody chainOperateBody) {
        Long assetId = Long.parseLong(chainOperateBody.getBizId());
        Asset asset = assetService.getById(assetId);
        if (asset == null) {
            throw new NFTException(ASSET_QUERY_FAILED);
        }
        if (DESTROYED.equals(asset.getState())) {
            return;
        }
        if (!DESTROYING.equals(asset.getState())) {
            log.warn("资产销毁链回调状态不匹配, assetId={}, state={}", assetId, asset.getState());
            throw new NFTException(NFT_UPDATE_FAILED);
        }
        asset.destroyed();
        if (!assetService.updateById(asset)) {
            throw new NFTException(NFT_UPDATE_FAILED);
        }
    }

    private void handleAssetTransfer(ChainOperateBody chainOperateBody, ChainResultData chainResultData) {
        //藏品铸造成功有nftId和txHash
        Asset newAsset = assetService.getById(Long.valueOf(chainOperateBody.getBizId()));
        if (newAsset == null || !newAsset.getState().equals(AssetState.INIT)) {
            throw new NFTException(ASSET_QUERY_FAILED);
        }
        newAsset.active(chainResultData.getAssetId(), chainResultData.getTxid());
        boolean result = assetService.updateById(newAsset);
        if (!result) {
            throw new NFTException(NFT_UPDATE_FAILED);
        }
    }

    private void initInventory(String productId, Long inventory, String identifier) {
        InventoryRequest inventoryRequest = new InventoryRequest();
        inventoryRequest.setNftId(productId);
        inventoryRequest.setNftType(NFTType.NFT);
        inventoryRequest.setInventory(inventory);
        inventoryRequest.setIdentifier(identifier);
        InventoryResponse<Boolean> inventoryResponse = inventoryFacade.init(inventoryRequest);
        if (!inventoryResponse.getSuccess()) {
            throw new NFTException(NFT_INVENTORY_INIT_FAILED);
        }
    }
}
