package com.nexo.business.collection.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.collection.domain.entity.NFT;
import com.nexo.business.collection.domain.entity.NFTSnapshot;
import com.nexo.business.collection.domain.entity.NFTStream;
import com.nexo.business.collection.domain.exception.ArtWorkException;
import com.nexo.business.collection.interfaces.dto.NFTPageQueryDTO;
import com.nexo.business.collection.interfaces.vo.NFTDetailVO;
import com.nexo.business.collection.mapper.convert.NFTConvertor;
import com.nexo.business.collection.mapper.mybatis.NFTStreamMapper;
import com.nexo.business.collection.mapper.mybatis.NFTSnapshotMapper;
import com.nexo.business.collection.mapper.mybatis.NFTMapper;
import com.nexo.business.collection.service.NFTService;
import com.nexo.common.api.artwork.constant.NFTState;
import com.nexo.common.api.artwork.request.NFTCreateRequest;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.artwork.constant.NFTType;
import com.nexo.common.base.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

import static com.nexo.business.collection.domain.exception.ArtWorkErrorCode.ARTWORK_NOT_FOUND;
import static com.nexo.business.collection.domain.exception.ArtWorkErrorCode.NFT_CREATE_FAILED;
import static com.nexo.common.api.artwork.constant.ProductState.*;

/**
 * @classname ArtWorkServiceImpl
 * @description 藏品服务实现类
 * @date 2025/12/21 17:15
 */
@Service
@RequiredArgsConstructor
public class NFTServiceImpl extends ServiceImpl<NFTMapper, com.nexo.business.collection.domain.entity.NFT> implements NFTService {

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
     * 库存模块Dubbo门面
     */
    @DubboReference(version = "1.0.0")
    private InventoryFacade inventoryFacade;

    /**
     * 默认的即将开售时间
     */
    public static final int DEFAULT_COMING_SOON_TIME = 60 * 24;

    @Override
    public NFTDetailVO getNFTDetail(Long id) {
        // 1. 通过ID查找NFT
        NFT nft = nftMapper.selectById(id);
        if (nft == null) {
            throw new ArtWorkException(ARTWORK_NOT_FOUND);
        }
        // 2. 构造库存模块请求
        InventoryRequest request = new InventoryRequest();
        request.setProductId(nft.getId().toString());
        request.setNFTType(NFTType.NFT);
        // 3. 调用库存服务，获取Redis中的库存
        InventoryResponse<Long> response = inventoryFacade.getInventory(request);
        // 4. 数据库中的库存兜底
        Long inventory = nft.getSaleableInventory();
        if (response.getSuccess() && response.getData() != null) {
            inventory = response.getData();
        }
        // 5. 构造NFT详情VO
        NFTDetailVO detail = NFTConvertor.toDetail(nft);
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
    public com.nexo.business.collection.domain.entity.NFT create(NFTCreateRequest request) {
        // 1. 创建藏品
        NFT nft = new NFT();
        BeanUtils.copyProperties(request, nft);
        nft.setSaleableInventory(request.getQuantity());
        nft.setFrozenInventory(0L);
        nft.setState(NFTState.PENDING);
        // 2. 保存藏品
        int insertArtworkRow = nftMapper.insert(nft);
        if (insertArtworkRow != 1) {
            throw new ArtWorkException(NFT_CREATE_FAILED);
        }
        // 3. 保存藏品快照
        NFTSnapshot snapshot = NFTConvertor.toSnapshot(nft);
        snapshot.setNftId(nft.getId());
        int insertSnapshotRow = nftSnapshotMapper.insert(snapshot);
        if (insertSnapshotRow != 1) {
            throw new ArtWorkException(NFT_CREATE_FAILED);
        }
        // 4. 保存藏品操作流水
        NFTStream stream = NFTConvertor.toStream(nft);
        stream.setStreamType(request.getEventType().getCode());
        stream.setNftId(nft.getId());
        int insertStreamRow = nftStreamMapper.insert(stream);
        if (insertStreamRow != 1) {
            throw new ArtWorkException(NFT_CREATE_FAILED);
        }
        return nft;
    }

    @Override
    public Page<NFT> queryPage(NFTPageQueryDTO queryDTO) {
        // 1. 创建分页对象
        Page<NFT> page = new Page<>(queryDTO.getCurrentPage(), queryDTO.getPageSize());
        // 2. 查询数据
        return nftMapper.selectPage(page, new LambdaQueryWrapper<NFT>()
                .like(StringUtils.isNoneBlank(queryDTO.getKeyword()), NFT::getName, queryDTO.getKeyword())
                .orderByDesc(NFT::getCreatedAt));
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
