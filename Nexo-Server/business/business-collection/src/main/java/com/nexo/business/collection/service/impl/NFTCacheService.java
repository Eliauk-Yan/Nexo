package com.nexo.business.collection.service.impl;

import com.alicp.jetcache.anno.CacheInvalidate;
import com.alicp.jetcache.anno.CacheRefresh;
import com.alicp.jetcache.anno.CacheType;
import com.alicp.jetcache.anno.Cached;
import com.nexo.business.collection.domain.entity.NFT;
import com.nexo.business.collection.mapper.mybatis.NFTMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class NFTCacheService {

    private final NFTMapper nftMapper;

    @Cached(name = ":nft:cache:id:", expire = 60, localExpire = 10, timeUnit = TimeUnit.MINUTES, cacheType = CacheType.BOTH, key = "#id", cacheNullValue = true)
    @CacheRefresh(refresh = 50, timeUnit = TimeUnit.MINUTES)
    public NFT getNFTById(Long id) {
        return nftMapper.selectById(id);
    }

    @CacheInvalidate(name = ":nft:cache:id:", key = "#nft.id")
    public Boolean updateById(NFT nft) {
        int res = nftMapper.updateById(nft);
        return res == 1;
    }
}
