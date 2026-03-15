package com.nexo.business.collection.interfaces.facade;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.nexo.business.collection.domain.entity.*;
import com.nexo.business.collection.domain.entity.NFT;
import com.nexo.business.collection.domain.enums.AssetState;
import com.nexo.business.collection.domain.exception.ArtWorkException;
import com.nexo.business.collection.mapper.convert.NFTConvertor;
import com.nexo.business.collection.mapper.convert.ArtworkInventoryStreamConvert;
import com.nexo.business.collection.mapper.mybatis.NFTMapper;
import com.nexo.business.collection.mapper.mybatis.ArtworkInventoryStreamMapper;
import com.nexo.business.collection.mapper.mybatis.NFTSnapshotMapper;
import com.nexo.business.collection.mapper.mybatis.NFTStreamMapper;
import com.nexo.business.collection.service.NFTService;
import com.nexo.business.collection.service.AssetService;
import com.nexo.common.api.artwork.ArtWorkFacade;
import com.nexo.common.api.artwork.constant.NFTState;
import com.nexo.common.api.artwork.request.NFTPageQueryRequest;
import com.nexo.common.api.artwork.request.AssetAllocateRequest;
import com.nexo.common.api.artwork.request.NFTCreateRequest;
import com.nexo.common.api.artwork.response.NFTQueryResponse;
import com.nexo.common.api.artwork.response.NFTResponse;
import com.nexo.common.api.artwork.response.data.NFTDTO;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryDTO;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryStreamDTO;
import com.nexo.common.api.blockchain.ChainFacade;
import com.nexo.common.api.blockchain.constant.ChainOperationBizType;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainOperationData;
import com.nexo.common.base.response.PageResponse;
import com.nexo.common.base.response.ResponseCode;
import com.nexo.common.api.product.request.ProductSaleRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.apache.dubbo.config.annotation.DubboService;
import org.springframework.transaction.annotation.Transactional;

import static com.nexo.business.collection.domain.exception.ArtWorkErrorCode.*;

/**
 * @classname ArtWorkFacadeImpl
 * @description 藏品模块对外接口实现类
 * @date 2026/01/09 10:14
 */
@Slf4j
@DubboService(version = "1.0.0")
@RequiredArgsConstructor
public class NFTFacadeImpl implements ArtWorkFacade {

    /**
     * 藏品门面服务
     */
    @DubboReference(version = "1.0.0")
    private ChainFacade chainFacade;

    /**
     * 藏品服务
     */
    private final NFTService nftService;

    /**
     * 资产服务
     */
    private final AssetService assetService;

    /**
     * 藏品库存流水转换器
     */
    private final ArtworkInventoryStreamConvert artworkInventoryStreamConvert;

    /**
     * 藏品库存流水Mapper
     */
    private final ArtworkInventoryStreamMapper artworkInventoryStreamMapper;

    /**
     * 藏品Mapper
     */
    private final NFTMapper artWorkMapper;

    /**
     * 藏品快照Mapper
     */
    private final NFTSnapshotMapper NFTSnapshotMapper;

    /**
     * 藏品操作流水Mapper
     */
    private final NFTStreamMapper NFTStreamMapper;

    /**
     * NFT Convertor
     */
    private final NFTConvertor NFTConvertor;

    @Override
    public NFTQueryResponse<NFTDTO> getArtWorkById(Long id) {
        // 1. 查询藏品
        NFT artwork = nftService.getById(id);
        // 2. 转换数据
        NFTDTO data = NFTConvertor.toDTO(artwork);
        // 3. 封装并返回数据
        NFTQueryResponse<NFTDTO> response = new NFTQueryResponse<>();
        response.setSuccess(true);
        response.setCode(ResponseCode.SUCCESS.name());
        response.setMessage(ResponseCode.SUCCESS.getMessage());
        response.setData(data);
        return response;
    }

    @Override
    public NFTQueryResponse<ArtworkInventoryDTO> getArtworkInventory(Long id) {
        // 1. 查询藏品
        NFT artwork = nftService.getById(id);
        // 2. 构造数据
        ArtworkInventoryDTO dto = new ArtworkInventoryDTO();
        dto.setQuantity(artwork.getQuantity());
        // TODO 临时处理 后续需要从Redis中获取可售库存
        dto.setSaleableInventory(artwork.getSaleableInventory());
        // 3. 封装并返回数据
        NFTQueryResponse<ArtworkInventoryDTO> response = new NFTQueryResponse<>();
        response.setSuccess(true);
        response.setCode(ResponseCode.SUCCESS.name());
        response.setMessage(ResponseCode.SUCCESS.getMessage());
        response.setData(dto);
        return response;
    }

    @Override
    public ArtworkInventoryStreamDTO getArtworkInventoryStream(Long productId, String identifier) {
        // 1. 查询商品库存流水
        ArtworkInventoryStream stream = artworkInventoryStreamMapper.selectOne(
                new LambdaQueryWrapper<ArtworkInventoryStream>()
                        .eq(ArtworkInventoryStream::getArtworkId, productId)
                        .eq(ArtworkInventoryStream::getIdentifier, identifier));
        // 2. 转换并返回
        return artworkInventoryStreamConvert.toDTO(stream);
    }

    @Transactional(rollbackFor = Exception.class) // 设计多表操作添加事务
    @Override
    public Boolean sale(ProductSaleRequest saleRequest) {
        // 1. 查询商品库存流水
        ArtworkInventoryStream InventoryStream = artworkInventoryStreamMapper
                .selectOne(new LambdaQueryWrapper<ArtworkInventoryStream>()
                        .eq(ArtworkInventoryStream::getArtworkId, saleRequest.getProductId())
                        .eq(ArtworkInventoryStream::getIdentifier, saleRequest.getIdentifier()));
        if (InventoryStream != null) {
            return true;
        }
        // 2. 查询出最新的值
        NFT nft = artWorkMapper.selectById(saleRequest.getProductId());
        // 3. 新增库存流水
        ArtworkInventoryStream inventoryStream = new ArtworkInventoryStream();
        inventoryStream.setArtworkId(nft.getId());
        inventoryStream.setPrice(nft.getPrice());
        inventoryStream.setQuantity(nft.getQuantity());
        inventoryStream.setSaleableInventory(nft.getSaleableInventory());
        inventoryStream.setFrozenInventory(nft.getFrozenInventory());
        inventoryStream.setState(nft.getState());
        inventoryStream.setVersion(nft.getVersion());
        inventoryStream.setDeleted(nft.getDeleted());
        inventoryStream.setStreamType(saleRequest.getEventType());
        inventoryStream.setIdentifier(saleRequest.getIdentifier());
        inventoryStream.setChangedQuantity(saleRequest.getQuantity());
        int insertRow = artworkInventoryStreamMapper.insert(inventoryStream);
        if (insertRow <= 0) {
            throw new ArtWorkException(ARTWORK_INVENTORY_STREAM_SAVE_FAILED);
        }
        // 4. 更新数据库库存
        nft.setSaleableInventory(nft.getSaleableInventory() - saleRequest.getQuantity());
        int updateRow = artWorkMapper.update(nft, new LambdaQueryWrapper<NFT>()
                .eq(NFT::getId, nft.getId())
                .eq(NFT::getVersion, nft.getVersion())
                // 可售库存必须大于等于扣减数量（乐观锁防止超卖）
                .apply("saleable_inventory >= {0}", saleRequest.getQuantity()));
        if (updateRow <= 0) {
            throw new ArtWorkException(NFT_UPDATE_FAILED);
        }
        return true;
    }

    @Transactional(rollbackFor = Exception.class) // 设计多表操作添加事务
    @Override
    public Boolean unsale(ProductSaleRequest saleRequest) {
        // 1. 幂等性校验：查询是否已经有回退流向的商品库存流水
        String increaseIdentifier = "UNSALE_" + saleRequest.getIdentifier(); // 使用前缀区分流向
        ArtworkInventoryStream existingStream = artworkInventoryStreamMapper
                .selectOne(new LambdaQueryWrapper<ArtworkInventoryStream>()
                        .eq(ArtworkInventoryStream::getArtworkId, saleRequest.getProductId())
                        .eq(ArtworkInventoryStream::getIdentifier, increaseIdentifier));
        if (existingStream != null) {
            return true; // 已经回退过，直接返回成功
        }

        // 2. 查询出最新的值
        NFT nft = artWorkMapper.selectById(saleRequest.getProductId());

        // 3. 新增库存回退流水
        ArtworkInventoryStream inventoryStream = new ArtworkInventoryStream();
        inventoryStream.setArtworkId(nft.getId());
        inventoryStream.setPrice(nft.getPrice());
        inventoryStream.setQuantity(nft.getQuantity());
        inventoryStream.setSaleableInventory(nft.getSaleableInventory());
        inventoryStream.setFrozenInventory(nft.getFrozenInventory());
        inventoryStream.setState(nft.getState());
        inventoryStream.setVersion(nft.getVersion());
        inventoryStream.setDeleted(nft.getDeleted());
        inventoryStream.setStreamType(saleRequest.getEventType());
        inventoryStream.setIdentifier(increaseIdentifier); // 这是关键，用前缀区别于售卖
        inventoryStream.setChangedQuantity(-saleRequest.getQuantity()); // 回退记录可以记为负数，或者通过其他字段标识
        int insertRow = artworkInventoryStreamMapper.insert(inventoryStream);
        if (insertRow <= 0) {
            throw new ArtWorkException(ARTWORK_INVENTORY_STREAM_SAVE_FAILED);
        }

        // 4. 更新数据库库存 (加回库存)
        nft.setSaleableInventory(nft.getSaleableInventory() + saleRequest.getQuantity());
        int updateRow = artWorkMapper.update(nft, new LambdaQueryWrapper<NFT>()
                .eq(NFT::getId, nft.getId())); // 没有防超卖的限制，因为是加法
        if (updateRow <= 0) {
            throw new ArtWorkException(NFT_UPDATE_FAILED);
        }
        return true;
    }





    @Override
    public Boolean updateNFT(NFTDTO NFTDTO) {
        NFT NFT = nftService.getById(NFTDTO.getId());
        if (NFT != null) {
            org.springframework.beans.BeanUtils.copyProperties(NFTDTO, NFT, "id", "identifier", "state",
                    "saleableInventory", "occupiedInventory", "frozenInventory", "version");
            return nftService.updateById(NFT);
        }
        return false;
    }

    @Override
    public Boolean deleteNFT(Long id) {
        return nftService.removeById(id);
    }

    @Override
    public Boolean updateState(Long id, String state) {
        NFT NFT = new NFT();
        NFT.setId(id);
        NFT.setState(NFTState.valueOf(state));
        return nftService.updateById(NFT);
    }

    @Override
    public Boolean allocateAsset(AssetAllocateRequest request) {
        // 1. 幂等校验
        long count = assetService.count(new LambdaQueryWrapper<Asset>()
                .eq(Asset::getBusinessNo, request.getBusinessNo())
                .eq(Asset::getBusinessType, request.getBusinessType()));
        if (count > 0) {
            log.info("资产已分发过，执行幂等返回, orderId={}", request.getBusinessNo());
            return true;
        }

        // 2. 查询藏品原信息
        NFT NFT = nftService.getById(request.getArtworkId());
        if (NFT == null) {
            log.error("分发资产失败，藏品不存在, artworkId={}", request.getArtworkId());
            return false;
        }

        // 3. 构建并保存资产
        Asset asset = new Asset();
        asset.setArtWorkId(request.getArtworkId());
        asset.setPurchasePrice(request.getPurchasePrice());
        asset.setSerialNumber(java.util.UUID.randomUUID().toString().replace("-", "")); // 临时生成的序列号
        asset.setNftIdentifier(request.getIdentifier());
        asset.setCurrentHolderId(request.getBuyerId());
        asset.setState(AssetState.INIT); // 初始状态，等待上链成功后更新
        asset.setReferencePrice(NFT.getPrice());
        asset.setRarity(null); // 如果后续Artwork表里有对应的字段可以设入
        asset.setBusinessNo(request.getBusinessNo());
        asset.setBusinessType(request.getBusinessType());

        boolean saveResult = assetService.save(asset);
        if (!saveResult) {
            log.error("资产持久化失败, orderId={}", request.getBusinessNo());
            return false;
        }

        // 4. 发起上链请求 (异步，可利用虚拟线程或交给独立的服务内处理以免阻塞)
        Thread.ofVirtual().start(() -> {
            try {
                ChainRequest chainRequest = new ChainRequest();
                chainRequest.setIdentifier(request.getIdentifier());
                chainRequest.setClassName(NFT.getName());
                chainRequest.setBizType(ChainOperationBizType.ASSET.getCode());
                chainRequest.setBizId(asset.getId().toString()); // 将入库后的资产ID填入
                ChainResponse<ChainOperationData> chainResponse = chainFacade.onChain(chainRequest);

                if (chainResponse.getSuccess() && chainResponse.getData() != null) {
                    log.info("数字资产上链请求发送成功, assetId={}", asset.getId());
                } else {
                    log.error("数字资产上链失败, assetId={}, message={}", asset.getId(), chainResponse.getMessage());
                }
            } catch (Exception e) {
                log.error("数字资产上链异常, assetId={}", asset.getId(), e);
            }
        });

        return true;
    }

    @Override
    public PageResponse<NFTDTO> queryPage(NFTPageQueryRequest request) {
        // 1. 查询藏品
        PageResponse<NFT> queryResult = nftService.pageQueryByState(request.getState(), request.getKeyword(), request.getCurrent(), request.getSize());
        // 2. 构造
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
}
