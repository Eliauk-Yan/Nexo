package com.nexo.business.collection.interfaces.facade;

import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.nexo.business.collection.domain.entity.*;
import com.nexo.business.collection.domain.entity.NFT;
import com.nexo.business.collection.domain.enums.AssetState;
import com.nexo.business.collection.domain.exception.NFTException;
import com.nexo.business.collection.mapper.convert.NFTConvertor;
import com.nexo.business.collection.mapper.convert.ArtworkInventoryStreamConvert;
import com.nexo.business.collection.mapper.mybatis.NFTMapper;
import com.nexo.business.collection.mapper.mybatis.NFTInventoryStreamMapper;
import com.nexo.business.collection.service.NFTService;
import com.nexo.business.collection.service.AssetService;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.nft.NFTFacade;
import com.nexo.common.api.nft.constant.NFTType;
import com.nexo.common.api.nft.request.*;
import com.nexo.common.api.nft.response.NFTResponse;
import com.nexo.common.api.nft.response.NFTUpdateInventoryResponse;
import com.nexo.common.api.nft.response.data.NFTDTO;
import com.nexo.common.api.nft.response.data.NFTInventoryStreamDTO;
import com.nexo.common.api.blockchain.ChainFacade;
import com.nexo.common.api.blockchain.constant.ChainOperationBizType;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainOperationData;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.nft.response.data.NFTInfo;
import com.nexo.common.api.user.UserFacade;
import com.nexo.common.api.user.request.UserQueryRequest;
import com.nexo.common.api.user.response.UserQueryResponse;
import com.nexo.common.api.user.response.data.UserInfo;
import com.nexo.common.base.response.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.apache.dubbo.config.annotation.DubboService;
import org.springframework.transaction.annotation.Transactional;

import static com.nexo.business.collection.domain.exception.NFTErrorCode.*;
import static com.nexo.common.api.nft.constant.NFTInventoryUpdateType.INCREASE;
import static com.nexo.common.api.nft.constant.NFTInventoryUpdateType.UNMODIFIED;

/**
 * @classname ArtWorkFacadeImpl
 * @description 藏品模块对外接口实现�?
 * @date 2026/01/09 10:14
 */
@Slf4j
@DubboService(version = "1.0.0")
@RequiredArgsConstructor
public class NFTFacadeImpl implements NFTFacade {

    /**
     * 链服务接口
     */
    @DubboReference(version = "1.0.0")
    private ChainFacade chainFacade;

    /**
     * 库存服务接口
     */
    @DubboReference(version = "1.0.0")
    private InventoryFacade inventoryFacade;

    /**
     * 用户服务接口
     */
    @DubboReference(version = "1.0.0")
    private UserFacade userFacade;

    /**
     * 藏品服务
     */
    private final NFTService nftService;

    /**
     * 资产服务
     */
    private final AssetService assetService;

    /**
     * 藏品库存流水Mapper
     */
    private final NFTInventoryStreamMapper nftInventoryStreamMapper;

    /**
     * 藏品Mapper
     */
    private final NFTMapper nftMapper;

    /**
     * NFT Convertor
     */
    private final NFTConvertor NFTConvertor;

    /**
     * 藏品库存流水转换
     */
    private final ArtworkInventoryStreamConvert artworkInventoryStreamConvert;


    @Override
    public Boolean allocateAsset(AssetAllocateRequest request) {
        // 1. 幂等判断
        long count = assetService.count(new LambdaQueryWrapper<Asset>()
                .eq(Asset::getBusinessNo, request.getBusinessNo())
                .eq(Asset::getBusinessType, request.getBusinessType()));
        if (count > 0) {
            return true;
        }
        // 2. 获取藏品信息
        NFT nft = nftService.getById(request.getArtworkId());
        if (nft == null) {
            return false;
        }
        // 3. 获取买家用户信息
        UserQueryRequest userQueryRequest = new UserQueryRequest();
        userQueryRequest.setId(request.getBuyerId());
        UserQueryResponse<UserInfo> userQueryResponse = userFacade.userQuery(userQueryRequest);
        UserInfo buyer = userQueryResponse != null ? userQueryResponse.getData() : null;
        if (userQueryResponse == null || !userQueryResponse.getSuccess() || buyer == null || buyer.getAddress() == null || buyer.getAddress().isBlank()) {
            return false;
        }
        // 4. 构造资产
        Asset asset = new Asset();
        asset.setNftId(request.getArtworkId());
        asset.setPurchasePrice(request.getPurchasePrice());
        asset.setSerialNumber(java.util.UUID.randomUUID().toString().replace("-", ""));
        asset.setNftIdentifier(request.getIdentifier());
        asset.setCurrentHolderId(request.getBuyerId());
        asset.setState(AssetState.INIT);
        asset.setReferencePrice(nft.getPrice());
        asset.setRarity(null);
        asset.setBusinessNo(request.getBusinessNo());
        asset.setBusinessType(request.getBusinessType());
        boolean saveResult = assetService.save(asset);
        if (!saveResult) {
            return false;
        }
        try {
            ChainRequest chainRequest = new ChainRequest();
            chainRequest.setIdentifier(request.getIdentifier());
            chainRequest.setClassId(request.getArtworkId().toString());
            chainRequest.setClassName(nft.getName());
            chainRequest.setSerialNo(asset.getSerialNumber());
            chainRequest.setRecipient(buyer.getAddress());
            chainRequest.setBizType(ChainOperationBizType.ASSET.getCode());
            chainRequest.setBizId(asset.getId().toString());
            ChainResponse<ChainOperationData> chainResponse = chainFacade.mint(chainRequest);
            if (chainResponse.getSuccess() && chainResponse.getData() != null) {
                log.info("资产铸造请求已提交, assetId={}", asset.getId());
            } else {
                log.error("资产铸造请求提交失败, assetId={}, message={}", asset.getId(), chainResponse.getMessage());
                return false;
            }
        } catch (Exception e) {
            log.error("资产铸造请求异常, assetId={}", asset.getId(), e);
            return false;
        }
        return true;
    }

    @Override
    public PageResponse<NFTDTO> queryPage(NFTPageQueryRequest request) {
        // 1. 查询藏品
        PageResponse<NFT> queryResult = nftService.pageQueryByState(request.getState(), request.getKeyword(), request.getCurrent(), request.getSize());
        // 2. 构�?
        PageResponse<NFTDTO> response = new PageResponse<>();
        if (!queryResult.getSuccess()) {
            response.setSuccess(false);
            return response;
        }
        response.setSuccess(true);
        response.setData(NFTConvertor.toDTOs(queryResult.getData()));
        response.setCurrent(queryResult.getCurrent());
        response.setSize(queryResult.getSize());
        response.setTotal(queryResult.getTotal());
        return response;
    }

    @Override
    public NFTResponse<Boolean> addNFT(NFTCreateRequest request) {
        // 1. 创建藏品
        NFT nft = nftService.create(request);
        // 2. 藏品上链
        ChainRequest chainRequest = new ChainRequest();
        chainRequest.setIdentifier(request.getIdentifier());
        chainRequest.setClassName(request.getName());
        chainRequest.setBizType(ChainOperationBizType.NFT.getCode());
        chainRequest.setBizId(nft.getId().toString());
        ChainResponse<ChainOperationData> chainResponse = chainFacade.onChain(chainRequest);
        // 3. 构造并返回结果
        NFTResponse<Boolean> response = new NFTResponse<>();
        if (!chainResponse.getSuccess()) {
            response.setSuccess(false);
            response.setData(false);
            return response;
        }
        response.setSuccess(true);
        response.setData(false);
        return response;
    }

    @Override
    public NFTResponse<Long> removeNFT(NFTRemoveRequest request) {
        // 1. 删除藏品
        NFTResponse<Long> response = new NFTResponse<>();
        Boolean result = nftService.removeNFT(request);
        // 2. 删除藏品Redis库存
        if (result) {
            InventoryRequest inventoryRequest = new InventoryRequest();
            inventoryRequest.setNftId(request.getNFTId().toString());
            inventoryRequest.setNftType(NFTType.NFT);
            InventoryResponse<Boolean> invalid = inventoryFacade.invalid(inventoryRequest);
            log.info("Redis库存删除结果 : {}", invalid.getSuccess());
        }
        // 3. 返回响应
        response.setSuccess(result);
        response.setData(request.getNFTId());
        return response;
    }

    @Override
    public NFTResponse<Long> updatePrice(NFTUpdatePriceRequest request) {
        // 1. 修改藏品价格
        Boolean result = nftService.updatePrice(request);
        // 2. 构造并返回结果
        NFTResponse<Long> response = new NFTResponse<>();
        response.setSuccess(result);
        response.setData(request.getNFTId());
        return response;
    }

    @Override
    public NFTResponse<Long> updateInventory(NFTUpdateInventoryRequest request) {
        NFTResponse<Long> response = new NFTResponse<>();
        response.setData(request.getNFTId());
        // 1. 修改藏品库存
        NFTUpdateInventoryResponse modifyResponse = nftService.updateInventory(request);
        // 2. 构造并返回特殊情况结果
        if (!modifyResponse.getSuccess()) {
            response.setSuccess(false);
            response.setCode(NFT_INVENTORY_UPDATE_FAILED.getCode());
            response.setMessage(NFT_INVENTORY_UPDATE_FAILED.getMessage());
            return response;
        }
        if (modifyResponse.getUpdateType() == UNMODIFIED) {
            response.setSuccess(true);
            return response;
        }
        // 3. 构造库存请�?
        InventoryRequest inventoryRequest = new InventoryRequest();
        inventoryRequest.setNftId(request.getNFTId().toString());
        inventoryRequest.setNftType(NFTType.NFT);
        inventoryRequest.setIdentifier(request.getIdentifier());
        inventoryRequest.setInventory(modifyResponse.getQuantityModified());
        InventoryResponse<Boolean> inventoryResponse;
        if (modifyResponse.getUpdateType() == INCREASE) {
            inventoryResponse = inventoryFacade.increaseInventory(inventoryRequest);
        } else {
            inventoryResponse = inventoryFacade.decreaseInventory(inventoryRequest);
        }
        if (!inventoryResponse.getSuccess()) {
            log.error("库存更新失败 : {}", JSON.toJSONString(inventoryResponse));
            throw new NFTException(NFT_INVENTORY_UPDATE_FAILED);
        }
        response.setSuccess(true);
        return response;
    }

    @Override
    public NFTResponse<NFTInfo> getNFTInfoById(Long id) {
        // 1. 查询藏品
        NFTInfo nftInfo = nftService.getNFTInfo(id);
        // 2. 封装并返回数�?
        return NFTResponse.success(nftInfo);
    }

    @Override
    public NFTResponse<NFTInventoryStreamDTO> getNFTInventoryStream(Long productId, String identifier) {
        // 1. 查询商品库存流水
        NFTInventoryStream stream = nftInventoryStreamMapper.selectOne(new LambdaQueryWrapper<NFTInventoryStream>().eq(NFTInventoryStream::getNftId, productId).eq(NFTInventoryStream::getIdentifier, identifier));
        // 2. 转换并返�?
        return NFTResponse.success(artworkInventoryStreamConvert.toDTO(stream));
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public NFTResponse<Boolean> sale(NFTSaleRequest request) {
        // 1. 查询商品库存流水 防止重复扣除
        NFTInventoryStream InventoryStream = nftInventoryStreamMapper.selectOne(new LambdaQueryWrapper<NFTInventoryStream>().eq(NFTInventoryStream::getNftId, request.getNFTId()).eq(NFTInventoryStream::getIdentifier, request.getIdentifier()));
        if (InventoryStream != null) {
            return NFTResponse.success(true);
        }
        // 2. 查询出最新的�?
        NFT nft = nftMapper.selectById(request.getNFTId());
        // 3. 新增库存流水
        NFTInventoryStream inventoryStream = new NFTInventoryStream();
        inventoryStream.setNftId(nft.getId());
        inventoryStream.setPrice(nft.getPrice());
        inventoryStream.setQuantity(nft.getQuantity());
        inventoryStream.setSaleableInventory(nft.getSaleableInventory());
        inventoryStream.setFrozenInventory(nft.getFrozenInventory());
        inventoryStream.setState(nft.getState());
        inventoryStream.setVersion(nft.getVersion());
        inventoryStream.setDeleted(nft.getDeleted());
        inventoryStream.setStreamType(request.getEventType());
        inventoryStream.setIdentifier(request.getIdentifier());
        inventoryStream.setChangedQuantity(request.getQuantity());
        boolean insertRes = nftInventoryStreamMapper.insert(inventoryStream) == 1;
        if (!insertRes) {
            throw new NFTException(NFT_INVENTORY_STREAM_SAVE_FAILED);
        }
        // 4. 更新数据库库�?
        nft.setSaleableInventory(nft.getSaleableInventory() - request.getQuantity());
        boolean updateRes = nftMapper.update(nft, new LambdaQueryWrapper<NFT>().eq(NFT::getId, nft.getId()).apply("saleable_inventory >= {0}", request.getQuantity())) == 1;
        if (!updateRes) {
            throw new NFTException(NFT_UPDATE_FAILED);
        }
        return NFTResponse.success(true);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public NFTResponse<Long> cancelSale(NFTCancelSaleRequest saleRequest) {
        // 1. 幂等校验
        NFTInventoryStream existStream = nftInventoryStreamMapper.selectOne(
                new LambdaQueryWrapper<NFTInventoryStream>()
                        .eq(NFTInventoryStream::getIdentifier, saleRequest.getIdentifier())
                        .eq(NFTInventoryStream::getStreamType, saleRequest.getEventType().getCode())
                        .eq(NFTInventoryStream::getNftId, saleRequest.getNFTId())
        );
        if (null != existStream) {
            return NFTResponse.success(existStream.getId());
        }
        // 2.查询出最新的值
        NFT nft = nftService.getById(saleRequest.getNFTId());
        // 3. 新增库存流水
        NFTInventoryStream nftInventoryStream = new NFTInventoryStream();
        nftInventoryStream.setNftId(nft.getId());
        nftInventoryStream.setPrice(nft.getPrice());
        nftInventoryStream.setQuantity(nft.getQuantity());
        nftInventoryStream.setSaleableInventory(nft.getSaleableInventory());
        nftInventoryStream.setFrozenInventory(nft.getFrozenInventory());
        nftInventoryStream.setState(nft.getState());
        nftInventoryStream.setStreamType(saleRequest.getEventType());
        nftInventoryStream.setIdentifier(saleRequest.getIdentifier());
        nftInventoryStream.setChangedQuantity(saleRequest.getQuantity().longValue());
        boolean insertRes = nftInventoryStreamMapper.insert(nftInventoryStream) == 1;
        if (!insertRes) {
            throw new NFTException(NFT_INVENTORY_STREAM_SAVE_FAILED);
        }
        boolean updateRes = nftService.lambdaUpdate()
                .setSql("saleable_inventory = saleable_inventory + " + saleRequest.getQuantity())
                .eq(NFT::getId, saleRequest.getNFTId())
                .apply("saleable_inventory + frozen_inventory + {0} <= quantity", saleRequest.getQuantity())
                .update();
        if (!updateRes) {
            throw new NFTException(NFT_UPDATE_FAILED);
        }
        return NFTResponse.success(nftInventoryStream.getId());
    }


}
