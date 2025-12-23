package com.nexo.business.artwork.mapper.mybatis;

import com.alicp.jetcache.anno.CacheRefresh;
import com.alicp.jetcache.anno.CacheType;
import com.alicp.jetcache.anno.Cached;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.nexo.business.artwork.domain.entity.ArtWork;
import org.apache.ibatis.annotations.Param;

import java.io.Serializable;
import java.util.concurrent.TimeUnit;

public interface ArtWorkMapper extends BaseMapper<ArtWork> {

    @Cached(name = ":artwork:cache:id:", cacheType = CacheType.BOTH, key = "#id", cacheNullValue = true) // 缓存空值防止缓存穿透
    @CacheRefresh(refresh = 60, timeUnit = TimeUnit.MINUTES)
    @Override
    ArtWork selectById(@Param("id") Serializable id);
}
