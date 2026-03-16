package com.nexo.business.collection.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.collection.domain.entity.NFT;
import com.nexo.business.collection.domain.entity.NFTInventoryStream;
import com.nexo.business.collection.domain.entity.NFTSnapshot;
import com.nexo.business.collection.domain.entity.NFTStream;
import com.nexo.common.api.nft.response.data.NFTInfo;
import com.nexo.business.collection.domain.exception.NFTException;
import com.nexo.business.collection.mapper.convert.NFTConvertor;
import com.nexo.business.collection.mapper.mybatis.NFTInventoryStreamMapper;
import com.nexo.business.collection.mapper.mybatis.NFTStreamMapper;
import com.nexo.business.collection.mapper.mybatis.NFTSnapshotMapper;
import com.nexo.business.collection.mapper.mybatis.NFTMapper;
import com.nexo.business.collection.service.NFTService;
import com.nexo.common.api.nft.constant.NFTState;
import com.nexo.common.api.nft.request.NFTCreateRequest;
import com.nexo.common.api.nft.request.NFTRemoveRequest;
import com.nexo.common.api.nft.request.NFTUpdateInventoryRequest;
import com.nexo.common.api.nft.request.NFTUpdatePriceRequest;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.nft.constant.NFTType;
import com.nexo.common.api.nft.response.NFTUpdateInventoryResponse;
import com.nexo.common.base.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

import static com.nexo.business.collection.domain.exception.ArtWorkErrorCode.*;
import static com.nexo.common.api.nft.constant.NFTInventoryUpdateType.*;
import static com.nexo.common.api.nft.constant.ProductState.*;
import static com.nexo.common.base.response.ResponseCode.DUPLICATED;

/**
 * @classname ArtWorkServiceImpl
 * @description 藏品服务实现类
 * @date 2025/12/21 17:15
 */
@Service
@RequiredArgsConstructor
public class NFTServiceImpl extends ServiceImpl<NFTMapper, NFT> implements NFTService {

    /**
     * NFT缓存服务
     */
    private final NFTCacheService nftCacheService;

    /**
     * 数字藏品转换器
     */
    private final NFTConvertor NFTConvertor;

    /**
     * 数字藏品Mapper
     */
    private final NFTMapper nftMapper;

    /**
     * 藏品快照Mapper
     */
    private final NFTSnapshotMapper nftSnapshotMapper;

    /**
     * 藏品流水Mapper
     */
    private final NFTStreamMapper nftStreamMapper;

    /**
     * 藏品库存流水Mapper
     */
    private final NFTInventoryStreamMapper nftInventoryStreamMapper;

    /**
     * 库存模块接口
     */
    @DubboReference(version = "1.0.0")
    private InventoryFacade inventoryFacade;

    /**
     * 默认的即将开售时间
     */
    public static final int DEFAULT_COMING_SOON_TIME = 60 * 24;

    @Override
    public NFTInfo getNFTInfo(Long id) {
        // 1. 通过ID查找NFT
        NFT nft = nftCacheService.getNFTById(id);
        if (nft == null) {
            throw new NFTException(NFT_NOT_FOUND);
        }
        // 2. 构造库存模块请求
        InventoryRequest request = new InventoryRequest();
        request.setNftId(nft.getId().toString());
        request.setNFTType(NFTType.NFT);
        // 3. 调用库存服务，获取Redis中的库存
        InventoryResponse<Long> response = inventoryFacade.getInventory(request);
        // 4. 数据库中的库存兜底
        Long inventory = nft.getSaleableInventory();
        if (response.getSuccess() && response.getData() != null) {
            inventory = response.getData();
        }
        // 5. 构造NFT详情VO
        com.nexo.common.api.nft.response.data.NFTInfo detail = NFTConvertor.toInfo(nft);
        // 6. 设置库存
        detail.setInventory(inventory);
        // 7. 设置状态
        LocalDateTime now = LocalDateTime.now();
        if (detail.getSaleTime() == null) {
            detail.setProductState(NOT_FOR_SALE);
        } else if (now.isAfter(detail.getSaleTime())) {
            if (inventory > 0) {
                detail.setProductState(SELLING);
            } else {
                detail.setProductState(SOLD_OUT);
            }
        } else {
            if (Duration.between(now, detail.getSaleTime()).toMinutes() > DEFAULT_COMING_SOON_TIME) {
                detail.setProductState(WAIT_FOR_SALE);
            } else {
                detail.setProductState(COMING_SOON);
            }
        }
        // 8. 返回详细信息
        return detail;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public NFT create(NFTCreateRequest request) {
        // 1. 创建藏品
        NFT nft = new NFT();
        BeanUtils.copyProperties(request, nft);
        nft.setSaleableInventory(request.getQuantity());
        nft.setFrozenInventory(0L);
        nft.setState(NFTState.PENDING);
        // 2. 保存藏品
        boolean insertArtworkRes = nftMapper.insert(nft) == 1;
        if (!insertArtworkRes) {
            throw new NFTException(NFT_CREATE_FAILED);
        }
        // 3. 保存藏品快照
        NFTSnapshot snapshot = NFTConvertor.toSnapshot(nft);
        snapshot.setNftId(nft.getId());
        boolean insertSnapshotRes = nftSnapshotMapper.insert(snapshot) == 1;
        if (!insertSnapshotRes) {
            throw new NFTException(NFT_CREATE_FAILED);
        }
        // 4. 保存藏品操作流水
        NFTStream stream = NFTConvertor.toStream(nft);
        stream.setStreamType(request.getEventType().getCode());
        stream.setNftId(nft.getId());
        boolean insertStreamRes = nftStreamMapper.insert(stream) == 1;
        if (!insertStreamRes) {
            throw new NFTException(NFT_CREATE_FAILED);
        }
        return nft;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Boolean removeNFT(NFTRemoveRequest request) {
        // 1. 查询NFT流水 防止重复删除
        NFTStream nftStream = nftStreamMapper.selectOne(new LambdaQueryWrapper<NFTStream>()
                .eq(NFTStream::getIdentifier, request.getIdentifier())
                .eq(NFTStream::getStreamType, request.getEventType().getCode())
                .eq(NFTStream::getNftId, request.getNFTId()));
        if (nftStream != null) {
            return true;
        }
        // 2. 查询NFT
        NFT nft = nftMapper.selectById(request.getNFTId());
        if (nft == null) {
            throw new NFTException(NFT_NOT_FOUND);
        }
        // 3. 修改状态为已下架
        nft.setState(NFTState.ARCHIVED);
        boolean updateRow = nftCacheService.updateById(nft);
        if (!updateRow) {
            throw new NFTException(NFT_UPDATE_FAILED);
        }
        // 4. 保存NFT流水
        NFTStream stream = new NFTStream();
        stream.setNftId(request.getNFTId());
        stream.setIdentifier(request.getIdentifier());
        stream.setStreamType(request.getEventType().getCode());
        boolean saveResult = nftStreamMapper.insert(stream) == 1;
        if (!saveResult) {
            throw new NFTException(NFT_INSERT_STREAM_FAILED);
        }
        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Boolean updatePrice(NFTUpdatePriceRequest request) {
        // 1. 查询NFT流水 防止重复更新
        NFTStream nftStream = nftStreamMapper.selectOne(new LambdaQueryWrapper<NFTStream>()
                .eq(NFTStream::getIdentifier, request.getIdentifier())
                .eq(NFTStream::getStreamType, request.getEventType().getCode())
                .eq(NFTStream::getNftId, request.getNFTId()));
        if (nftStream != null) {
            return true;
        }
        // 2. 查询NFT
        NFT nft = nftMapper.selectById(request.getNFTId());
        if (nft == null) {
            throw new NFTException(NFT_NOT_FOUND);
        }
        nft.setPrice(request.getPrice());
        Boolean updateRes = nftCacheService.updateById(nft);
        if (!updateRes) {
            throw new NFTException(NFT_UPDATE_FAILED);
        }
        // 3. 报错NFT快照
        NFTSnapshot snapshot = NFTConvertor.toSnapshot(nft);
        snapshot.setNftId(nft.getId());
        boolean insertSnapshotRes = nftSnapshotMapper.insert(snapshot) == 1;
        if (!insertSnapshotRes) {
            throw new NFTException(NFT_CREATE_FAILED);
        }
        // 4. 保存NFT操作流水
        NFTStream stream = NFTConvertor.toStream(nft);
        stream.setStreamType(request.getEventType().getCode());
        stream.setNftId(nft.getId());
        boolean insertStreamRes = nftStreamMapper.insert(stream) == 1;
        if (!insertStreamRes) {
            throw new NFTException(NFT_INSERT_STREAM_FAILED);
        }
        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public NFTUpdateInventoryResponse updateInventory(NFTUpdateInventoryRequest request) {
        NFTUpdateInventoryResponse response = new NFTUpdateInventoryResponse();
        response.setNftId(request.getNFTId());
        // 1. 查询库存修改流水，防止重复修改
        NFTInventoryStream nftInventoryStream = nftInventoryStreamMapper.selectOne(new LambdaQueryWrapper<NFTInventoryStream>()
                .eq(NFTInventoryStream::getIdentifier, request.getIdentifier())
                .eq(NFTInventoryStream::getNftId, request.getNFTId())
                .eq(NFTInventoryStream::getStreamType, request.getEventType().getCode()));
        if (nftInventoryStream != null) {
            response.setSuccess(true);
            response.setCode(DUPLICATED.getCode());
            return response;
        }
        // 2. 查询NFT
        NFT nft = nftMapper.selectById(request.getNFTId());
        if (nft == null) {
            throw new NFTException(NFT_NOT_FOUND);
        }
        // 3. 计算数量差
        long quantityDiff = request.getQuantity() - nft.getQuantity();
        response.setQuantityModified(Math.abs(quantityDiff));
        // 4. 设置修改类型
        if (quantityDiff == 0) {
            response.setUpdateType(UNMODIFIED);
            response.setSuccess(true);
            return response;
        } else if (quantityDiff > 0) {
            response.setUpdateType(INCREASE);
        } else {
            response.setUpdateType(DECREASE);
        }
        // 5. 修改NFT数量和可售数量
        long oldSaleableInventory = nft.getSaleableInventory();
        nft.setQuantity(request.getQuantity());
        nft.setSaleableInventory(oldSaleableInventory + quantityDiff);
        boolean res = nftCacheService.updateById(nft);
        if (!res) {
            throw new NFTException(NFT_UPDATE_FAILED);
        }
        // 6. 保存库存修改流水
        NFTInventoryStream inventoryStream = new NFTInventoryStream();
        inventoryStream.setNftId(nft.getId());
        inventoryStream.setIdentifier(request.getIdentifier());
        inventoryStream.setStreamType(request.getEventType());
        inventoryStream.setChangedQuantity(quantityDiff);
        boolean saveResult = nftInventoryStreamMapper.insert(inventoryStream) == 1;
        if (!saveResult) {
            throw new NFTException(NFT_INVENTORY_UPDATE_FAILED);
        }
        response.setSuccess(true);
        return response;
    }

    @Override
    public PageResponse<NFT> pageQueryByState(String state, String keyword, int current, int size) {
        // 1. 构建页面
        Page<NFT> page = new Page<>(current, size);
        // 2. 构造查询条件
        LambdaQueryWrapper<NFT> condition = new LambdaQueryWrapper<NFT>().eq(StringUtils.isNotBlank(state), NFT::getState, state).like(keyword != null, NFT::getName, keyword).orderByAsc(NFT::getCreatedAt);
        // 3. Mapper查询
        Page<NFT> nftPage = nftMapper.selectPage(page, condition);
        // 4. 返回响应
        return PageResponse.success(nftPage.getRecords(), (int) nftPage.getTotal(), size, current);
    }

}
