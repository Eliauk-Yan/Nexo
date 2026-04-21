package com.nexo.business.collection.service.impl;

import com.alicp.jetcache.anno.CacheRefresh;
import com.alicp.jetcache.anno.CacheType;
import com.alicp.jetcache.anno.Cached;
import com.nexo.business.collection.domain.entity.Asset;
import com.nexo.business.collection.mapper.mybatis.AssetMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AssetCacheService {

    private final AssetMapper assetMapper;

    @Cached(name = ":asset:cache:id:", expire = 60, localExpire = 10, timeUnit = TimeUnit.MINUTES, cacheType = CacheType.BOTH, key = "#id", cacheNullValue = true)
    @CacheRefresh(refresh = 50, timeUnit = TimeUnit.MINUTES)
    public Asset getAssetById(Long id) {
        return assetMapper.selectById(id);
    }
}
