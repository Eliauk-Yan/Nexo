package com.nexo.business.collection.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexo.business.collection.domain.entity.ArtWork;
import com.nexo.business.collection.interfaces.dto.ArtWorkQueryDTO;
import com.nexo.business.collection.interfaces.vo.NFTDetailVO;
import com.nexo.business.collection.interfaces.vo.ArtWorkVO;
import com.nexo.business.collection.service.impl.base.BaseArtWorkServiceImpl;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * @classname ArtWorkESServiceImpl
 * @description TODO 使用ES 实现的藏品服务实现类
 * @date 2025/12/23 21:49
 */
@Service
@ConditionalOnProperty(name = "spring.elasticsearch.enable", havingValue = "true")
public class ArtWorkESServiceImpl extends BaseArtWorkServiceImpl {

    @Override
    public Page<ArtWorkVO> getArtWorkVOList(ArtWorkQueryDTO queryDTO) {
        return null;
    }

    @Override
    public ArtWork getArtWorkById(Long id) {
        return null;
    }

    @Override
    public NFTDetailVO getNFTDetailById(Long id) {
        return null;
    }

}
