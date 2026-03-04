package com.nexo.business.artwork.service.impl;

import com.alicp.jetcache.anno.CacheRefresh;
import com.alicp.jetcache.anno.CacheType;
import com.alicp.jetcache.anno.Cached;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexo.business.artwork.domain.exception.ArtWorkException;
import com.nexo.business.artwork.interfaces.dto.ArtWorkQueryDTO;
import com.nexo.business.artwork.domain.entity.ArtWork;
import com.nexo.business.artwork.interfaces.vo.NFTDetailVO;
import com.nexo.business.artwork.interfaces.vo.ArtWorkVO;
import com.nexo.business.artwork.mapper.concert.ArtWorkConvertor;
import com.nexo.business.artwork.mapper.mybatis.NFTMapper;
import com.nexo.business.artwork.service.impl.base.BaseArtWorkServiceImpl;
import com.nexo.common.api.inventory.InventoryFacade;
import com.nexo.common.api.inventory.request.InventoryRequest;
import com.nexo.common.api.inventory.response.InventoryResponse;
import com.nexo.common.api.product.constant.ProductState;
import com.nexo.common.api.product.constant.ProductType;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static com.nexo.business.artwork.domain.exception.ArtWorkErrorCode.ARTWORK_NOT_FOUND;

/**
 * @classname ArtWorkServiceImpl
 * @description 藏品服务实现类
 * @date 2025/12/21 17:15
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "spring.elasticsearch.enable", havingValue = "false", matchIfMissing = true)
public class ArtWorkDBServiceImpl extends BaseArtWorkServiceImpl {

    /**
     * 数字藏品转换器
     */
    private final ArtWorkConvertor artWorkConvertor;

    /**
     * 数字藏品Mapper
     */
    private final NFTMapper nftMapper;

    /**
     * 库存模块Dubbo门面
     */
    private InventoryFacade inventoryFacade;

    /**
     * 默认的即将开售时间
     */
    public static final int DEFAULT_COMING_SOON_TIME = 60 * 24;

    @Override
    public Page<ArtWorkVO> getArtWorkVOList(ArtWorkQueryDTO queryDTO) {
        // 1. 创建分页对象
        Page<ArtWork> page = new Page<>(queryDTO.getCurrentPage(), queryDTO.getPageSize());
        // 2. 创建查询条件
        LambdaQueryWrapper<ArtWork> condition = new LambdaQueryWrapper<ArtWork>()
                .eq(ArtWork::getDeleted, 0)
                .like(StringUtils.isNoneBlank(queryDTO.getKeyword()), ArtWork::getName, queryDTO.getKeyword())
                .orderByDesc(ArtWork::getCreatedAt);
        // 3. 查询数据
        Page<ArtWork> artWorkPage = this.page(page, condition);
        List<ArtWork> records = artWorkPage.getRecords();
        List<ArtWorkVO> artWorkVOList = artWorkConvertor.toVOs(records);
        Page<ArtWorkVO> voPage = new Page<>(artWorkPage.getCurrent(), artWorkPage.getSize(), artWorkPage.getTotal());
        voPage.setRecords(artWorkVOList);
        return voPage;
    }

    @Cached(name = ":artwork:cache:id:", cacheType = CacheType.REMOTE, key = "#id", cacheNullValue = true) // 缓存空值防止缓存穿透
    @CacheRefresh(refresh = 60, timeUnit = TimeUnit.MINUTES)
    @Override
    public ArtWork getArtWorkById(Long id) {
        return Optional
                .ofNullable(this.getById(id))
                .orElseThrow(() -> new ArtWorkException(ARTWORK_NOT_FOUND));
    }

    @Override
    public NFTDetailVO getNFTDetailById(Long id) {
        // 1. 通过ID查找NFT
        ArtWork nft = nftMapper.selectById(id);
        if (nft == null) {
            throw new ArtWorkException(ARTWORK_NOT_FOUND);
        }
        // 2. 构造库存模块请求
        InventoryRequest request = new InventoryRequest();
        request.setProductId(nft.getId().toString());
        request.setProductType(ProductType.ARTWORK);
        // 3. 调用库存服务，获取Redis中的库存
        InventoryResponse<Long> response = inventoryFacade.getInventory(request);
        // 4. 数据库中的库存兜底
        Long inventory = nft.getSaleableInventory();
        if (response.getSuccess() && response.getData() != null) {
            inventory = response.getData();
        }
        // 5. 构造NFT详情VO
        NFTDetailVO detail = artWorkConvertor.toDetail(nft);
        // 6. 设置库存
        detail.setInventory(inventory);
        // 7. 设置状态
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(detail.getSaleTime())) {
            if (inventory > 0) {
                detail.setState(ProductState.SELLING);
            } else {
                detail.setState(ProductState.SOLD_OUT);
            }
        } else {
            if (Duration.between(now, detail.getSaleTime()).toMinutes() > DEFAULT_COMING_SOON_TIME) {
                detail.setState(ProductState.WAIT_FOR_SALE);
            } else {
                detail.setState(ProductState.COMING_SOON);
            }
        }
        // 8. 返回详细信息
        return detail;
    }

}
