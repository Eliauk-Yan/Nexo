package com.nexo.business.artwork.interfaces.facade;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexo.business.artwork.domain.entity.ArtWork;
import com.nexo.business.artwork.domain.entity.ArtworkInventoryStream;
import com.nexo.business.artwork.domain.entity.ArtworkSnapshot;
import com.nexo.business.artwork.domain.entity.ArtworkStream;
import com.nexo.business.artwork.domain.exception.ArtWorkException;
import com.nexo.business.artwork.mapper.concert.ArtWorkConvertor;
import com.nexo.business.artwork.mapper.concert.ArtworkInventoryStreamConvert;
import com.nexo.business.artwork.mapper.mybatis.ArtworkMapper;
import com.nexo.business.artwork.mapper.mybatis.ArtworkInventoryStreamMapper;
import com.nexo.business.artwork.mapper.mybatis.ArtworkSnapshotMapper;
import com.nexo.business.artwork.mapper.mybatis.ArtworkStreamMapper;
import com.nexo.business.artwork.service.ArtWorkService;
import com.nexo.business.artwork.service.ArtworkInventoryStreamService;
import com.nexo.common.api.artwork.ArtWorkFacade;
import com.nexo.common.api.artwork.constant.ArtWorkState;
import com.nexo.common.api.artwork.request.ArtWorkQueryRequest;
import com.nexo.common.api.artwork.request.NFTCreateRequest;
import com.nexo.common.api.artwork.response.ArtWorkQueryResponse;
import com.nexo.common.api.artwork.response.NFTResponse;
import com.nexo.common.api.artwork.response.data.ArtWorkDTO;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryDTO;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryStreamDTO;
import com.nexo.common.api.blockchain.ChainFacade;
import com.nexo.common.api.blockchain.constant.ChainOperationBizType;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainOperationData;
import com.nexo.common.api.common.response.ResponseCode;
import com.nexo.common.api.product.request.ProductSaleRequest;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboReference;
import org.apache.dubbo.config.annotation.DubboService;
import org.springframework.beans.BeanUtils;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.nexo.business.artwork.domain.exception.ArtWorkErrorCode.*;

/**
 * @classname ArtWorkFacadeImpl
 * @description 藏品模块对外接口实现类
 * @date 2026/01/09 10:14
 */
@DubboService(version = "1.0.0")
@RequiredArgsConstructor
public class ArtWorkFacadeImpl implements ArtWorkFacade {

    /**
     * 藏品门面服务
     */
    @DubboReference(version = "1.0.0")
    private ChainFacade chainFacade;

    /**
     * 藏品服务
     */
    private final ArtWorkService artWorkService;

    /**
     * 藏品转换器
     */
    private final ArtWorkConvertor artWorkConvertor;

    /**
     * 藏品库存流水服务
     */
    private final ArtworkInventoryStreamService artworkInventoryStreamService;

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
    private final ArtworkMapper artWorkMapper;

    /**
     * 藏品快照Mapper
     */
    private final ArtworkSnapshotMapper artworkSnapshotMapper;

    /**
     * 藏品操作流水Mapper
     */
    private final ArtworkStreamMapper artworkStreamMapper;

    @Override
    public ArtWorkQueryResponse<ArtWorkDTO> getArtWorkById(Long id) {
        // 1. 查询藏品
        ArtWork artwork = artWorkService.getArtWorkById(id);
        // 2. 转换数据
        ArtWorkDTO data = artWorkConvertor.toDTO(artwork);
        // 3. 封装并返回数据
        ArtWorkQueryResponse<ArtWorkDTO> response = new ArtWorkQueryResponse<>();
        response.setSuccess(true);
        response.setCode(ResponseCode.SUCCESS.name());
        response.setMessage(ResponseCode.SUCCESS.getMessage());
        response.setData(data);
        return response;
    }

    @Override
    public ArtWorkQueryResponse<ArtworkInventoryDTO> getArtworkInventory(Long id) {
        // 1. 查询藏品
        ArtWork artwork = artWorkService.getArtWorkById(id);
        // 2. 构造数据
        ArtworkInventoryDTO dto = new ArtworkInventoryDTO();
        dto.setQuantity(artwork.getQuantity());
        // TODO 临时处理 后续需要从Redis中获取可售库存
        dto.setSaleableInventory(artwork.getSaleableInventory());
        // 3. 封装并返回数据
        ArtWorkQueryResponse<ArtworkInventoryDTO> response = new ArtWorkQueryResponse<>();
        response.setSuccess(true);
        response.setCode(ResponseCode.SUCCESS.name());
        response.setMessage(ResponseCode.SUCCESS.getMessage());
        response.setData(dto);
        return response;
    }

    @Override
    public ArtworkInventoryStreamDTO getArtworkInventoryStream(Long productId, String identifier) {
        // 1. 查询商品库存流水
        ArtworkInventoryStream stream = artworkInventoryStreamService.getOne(
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
        ArtWork artWork = artWorkMapper.selectById(saleRequest.getProductId());
        // 3. 新增库存流水
        ArtworkInventoryStream inventoryStream = new ArtworkInventoryStream();
        inventoryStream.setArtworkId(artWork.getId());
        inventoryStream.setPrice(artWork.getPrice());
        inventoryStream.setQuantity(artWork.getQuantity());
        inventoryStream.setSaleableInventory(artWork.getSaleableInventory());
        inventoryStream.setFrozenInventory(artWork.getFrozenInventory());
        inventoryStream.setState(artWork.getState());
        inventoryStream.setVersion(artWork.getVersion());
        inventoryStream.setDeleted(artWork.getDeleted());
        inventoryStream.setStreamType(saleRequest.getEventType());
        inventoryStream.setIdentifier(saleRequest.getIdentifier());
        inventoryStream.setChangedQuantity(saleRequest.getQuantity());
        int insertRow = artworkInventoryStreamMapper.insert(inventoryStream);
        if (insertRow <= 0) {
            throw new ArtWorkException(ARTWORK_INVENTORY_STREAM_SAVE_FAILED);
        }
        // 4. 更新数据库库存
        artWork.setSaleableInventory(artWork.getSaleableInventory() - saleRequest.getQuantity());
        int updateRow = artWorkMapper.update(artWork, new LambdaQueryWrapper<ArtWork>()
                .eq(ArtWork::getId, artWork.getId())
                // 可售库存必须大于等于扣减数量（乐观锁防止超卖）
                .apply("saleable_inventory >= {0}", saleRequest.getQuantity()));
        if (updateRow <= 0) {
            throw new ArtWorkException(NFT_UPDATE_FAILED);
        }
        return true;
    }

    @Override
    public ArtWorkQueryResponse<Page<ArtWorkDTO>> getNFTList(ArtWorkQueryRequest request) {
        // 1. 查询藏品
        Page<ArtWork> page = new Page<>(request.getCurrent(), request.getSize());

        LambdaQueryWrapper<ArtWork> wrapper = new LambdaQueryWrapper<>();

        if (request.getName() != null && !request.getName().isEmpty()) {
            wrapper.like(ArtWork::getName, request.getName());
        }

        if (request.getState() != null && !request.getState().isEmpty()) {
            wrapper.eq(ArtWork::getState,
                    com.nexo.common.api.artwork.constant.ArtWorkState.valueOf(request.getState()));
        }
        wrapper.orderByDesc(ArtWork::getSaleTime);
        Page<ArtWork> artWorkPage = artWorkService.page(page, wrapper);
        // 2. 转换数据
        List<ArtWorkDTO> data = artWorkConvertor.toDTOs(artWorkPage.getRecords());
        // 3. 构造分页数据
        Page<ArtWorkDTO> artWorkDTOPage = new Page<>(request.getCurrent(), request.getSize());
        artWorkDTOPage.setRecords(data);
        artWorkDTOPage.setTotal(artWorkPage.getTotal());
        // 4. 封装并返回数据
        ArtWorkQueryResponse<Page<ArtWorkDTO>> response = new ArtWorkQueryResponse<>();
        response.setSuccess(true);
        response.setCode(ResponseCode.SUCCESS.name());
        response.setMessage(ResponseCode.SUCCESS.getMessage());
        response.setData(artWorkDTOPage);
        return response;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public NFTResponse<Boolean> addNFT(NFTCreateRequest request) {
        // 1. 创建藏品
        ArtWork artWork = new ArtWork();
        BeanUtils.copyProperties(request, artWork);
        artWork.setSaleableInventory(request.getQuantity());
        artWork.setFrozenInventory(0L);
        artWork.setState(ArtWorkState.PENDING);
        // 2. 保存藏品
        int insertArtworkRow = artWorkMapper.insert(artWork);
        if (insertArtworkRow != 1) {
            throw new ArtWorkException(NFT_CREATE_FAILED);
        }
        // 3. 保存藏品快照
        ArtworkSnapshot snapshot = artWorkConvertor.toSnapshot(artWork);
        snapshot.setArtworkId(artWork.getId());
        snapshot.setCreatorId(request.getCreatorId());
        int insertSnapshotRow = artworkSnapshotMapper.insert(snapshot);
        if (insertSnapshotRow != 1) {
            throw new ArtWorkException(NFT_CREATE_FAILED);
        }
        // 4. 保存藏品操作流水
        ArtworkStream stream = artWorkConvertor.toStream(artWork);
        stream.setStreamType(request.getEventType().getCode());
        stream.setArtworkId(artWork.getId());
        int insertStreamRow = artworkStreamMapper.insert(stream);
        if (insertStreamRow != 1) {
            throw new ArtWorkException(NFT_CREATE_FAILED);
        }
        // 5. 藏品上链
        ChainRequest chainRequest = new ChainRequest();
        chainRequest.setIdentifier(request.getIdentifier());
        chainRequest.setClassName(request.getName());
        chainRequest.setBizType(ChainOperationBizType.ARTWORK.getCode());
        chainRequest.setBizId(artWork.getId().toString());
        ChainResponse<ChainOperationData> chainResponse = chainFacade.onChain(chainRequest);
        if (!chainResponse.getSuccess() || chainResponse.getData() == null) {
            throw new ArtWorkException(NFT_ON_CHAIN_FAILED);
        }
        // 6. 构造响应并返回
        NFTResponse<Boolean> response = new NFTResponse<>();
        response.setSuccess(true);
        response.setCode(ResponseCode.SUCCESS.name());
        response.setMessage(ResponseCode.SUCCESS.getMessage());
        response.setData(true);
        return response;
    }

    @Override
    public Boolean updateNFT(ArtWorkDTO artWorkDTO) {
        ArtWork artWork = artWorkService.getById(artWorkDTO.getId());
        if (artWork != null) {
            org.springframework.beans.BeanUtils.copyProperties(artWorkDTO, artWork, "id", "identifier", "state",
                    "saleableInventory", "occupiedInventory", "frozenInventory", "version");
            return artWorkService.updateById(artWork);
        }
        return false;
    }

    @Override
    public Boolean deleteNFT(Long id) {
        return artWorkService.removeById(id);
    }

    @Override
    public Boolean updateState(Long id, String state) {
        ArtWork artWork = new ArtWork();
        artWork.setId(id);
        artWork.setState(com.nexo.common.api.artwork.constant.ArtWorkState.valueOf(state));
        return artWorkService.updateById(artWork);
    }
}
