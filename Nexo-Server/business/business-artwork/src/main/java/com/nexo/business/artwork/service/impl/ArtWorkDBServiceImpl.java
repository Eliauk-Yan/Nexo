package com.nexo.business.artwork.service.impl;

import com.alicp.jetcache.anno.CacheRefresh;
import com.alicp.jetcache.anno.CacheType;
import com.alicp.jetcache.anno.Cached;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexo.business.artwork.interfaces.dto.ArtWorkQueryDTO;
import com.nexo.business.artwork.domain.entity.ArtWork;
import com.nexo.business.artwork.interfaces.vo.ArtWorkDetailVO;
import com.nexo.business.artwork.interfaces.vo.ArtWorkVO;
import com.nexo.business.artwork.mapper.concert.ArtWorkConvertor;
import com.nexo.business.artwork.mapper.mybatis.ArtWorkMapper;
import com.nexo.business.artwork.service.impl.base.BaseArtWorkServiceImpl;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * @classname ArtWorkServiceImpl
 * @description 藏品服务实现类
 * @date 2025/12/21 17:15
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "spring.elasticsearch.enable", havingValue = "false", matchIfMissing = true)
public class ArtWorkDBServiceImpl extends BaseArtWorkServiceImpl {

    private final ArtWorkConvertor artWorkConvertor;

    private final ArtWorkMapper artWorkMapper;

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
        List<ArtWorkVO> artWorkVOList = artWorkConvertor.toArtWorkVOList(records);
        Page<ArtWorkVO> voPage = new Page<>(artWorkPage.getCurrent(), artWorkPage.getSize(), artWorkPage.getTotal());
        voPage.setRecords(artWorkVOList);
        return voPage;
    }

    @Override
    public ArtWorkDetailVO getArtWorkDetailById(Long id) {
        // 1. 查询数据
        ArtWork artWork = getArtWorkById(id);
        // 2. 转换并返回数据
        return artWorkConvertor.toArtWorkDetailVO(artWork);
    }


    @Cached(name = ":artwork:cache:id:", cacheType = CacheType.REMOTE, key = "#id", cacheNullValue = true) // 缓存空值防止缓存穿透
    @CacheRefresh(refresh = 60, timeUnit = TimeUnit.MINUTES)
    public ArtWork getArtWorkById(Long id) {
        return this.getById(id);
    }
}
