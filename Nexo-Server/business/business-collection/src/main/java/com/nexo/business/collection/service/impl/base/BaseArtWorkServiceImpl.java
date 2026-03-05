package com.nexo.business.collection.service.impl.base;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.collection.domain.entity.ArtWork;
import com.nexo.business.collection.mapper.mybatis.NFTMapper;
import com.nexo.business.collection.service.ArtWorkService;

/**
 * @classname BaseArtWorkServiceImpl
 * @description 实现 DB 与 ES 的动态切换
 * @date 2025/12/23 21:50
 */
public abstract class BaseArtWorkServiceImpl extends ServiceImpl<NFTMapper, ArtWork> implements ArtWorkService {

}
