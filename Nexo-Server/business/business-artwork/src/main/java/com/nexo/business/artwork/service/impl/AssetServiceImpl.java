package com.nexo.business.artwork.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.artwork.domain.entity.Asset;
import com.nexo.business.artwork.mapper.mybatis.AssetMapper;
import com.nexo.business.artwork.service.AssetService;
import org.springframework.stereotype.Service;

/**
 * @classname AssetServiceImpl
 * @description 资产服务实现类
 * @date 2026/02/08 17:55
 */
@Service
public class AssetServiceImpl extends ServiceImpl<AssetMapper, Asset> implements AssetService {

}
