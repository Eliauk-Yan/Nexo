package com.nexo.business.artwork.interfaces.facade;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.nexo.business.artwork.domain.entity.ArtWork;
import com.nexo.business.artwork.domain.entity.ArtworkInventoryStream;
import com.nexo.business.artwork.domain.exception.ArtWorkException;
import com.nexo.business.artwork.mapper.concert.ArtWorkConvertor;
import com.nexo.business.artwork.mapper.concert.ArtworkInventoryStreamConvert;
import com.nexo.business.artwork.mapper.mybatis.ArtworkMapper;
import com.nexo.business.artwork.mapper.mybatis.ArtworkInventoryStreamMapper;
import com.nexo.business.artwork.service.ArtWorkService;
import com.nexo.business.artwork.service.ArtworkInventoryStreamService;
import com.nexo.common.api.artwork.ArtWorkFacade;
import com.nexo.common.api.artwork.response.ArtWorkQueryResponse;
import com.nexo.common.api.artwork.response.data.ArtWorkDTO;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryDTO;
import com.nexo.common.api.artwork.response.data.ArtworkInventoryStreamDTO;
import com.nexo.common.api.common.response.ResponseCode;
import com.nexo.common.api.product.request.ProductSaleRequest;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboService;
import org.springframework.transaction.annotation.Transactional;

import static com.nexo.business.artwork.domain.exception.ArtWorkErrorCode.ARTWORK_INVENTORY_STREAM_SAVE_FAILED;
import static com.nexo.business.artwork.domain.exception.ArtWorkErrorCode.ARTWORK_UPDATE_FAILED;

/**
 * @classname ArtWorkFacadeImpl
 * @description 藏品模块对外接口实现类
 * @date 2026/01/09 10:14
 */
@DubboService(version = "1.0.0")
@RequiredArgsConstructor
public class ArtWorkFacadeImpl implements ArtWorkFacade {

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
                // 已售出库存 + 冻结库存（占用） + 变化量 <= 总库存
                .apply("saleable_inventory + frozen_inventory + {0} <= quantity", saleRequest.getQuantity()));
        if (updateRow <= 0) {
            throw new ArtWorkException(ARTWORK_UPDATE_FAILED);
        }
        return true;
    }
}
