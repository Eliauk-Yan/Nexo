package com.nexo.business.artwork.service.impl.base;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.artwork.domain.entity.ArtWork;
import com.nexo.business.artwork.mapper.mybatis.ArtWorkMapper;
import com.nexo.business.artwork.service.ArtWorkService;

/**
 * @classname BaseArtWorkServiceImpl
 * @description 实现 DB 与 ES 的动态切换
 * @date 2025/12/23 21:50
 */
public abstract class BaseArtWorkServiceImpl extends ServiceImpl<ArtWorkMapper, ArtWork> implements ArtWorkService {

}
