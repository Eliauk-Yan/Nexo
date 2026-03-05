package com.nexo.business.collection.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nexo.business.collection.domain.entity.Asset;
import com.nexo.business.collection.mapper.mybatis.AssetMapper;
import com.nexo.business.collection.service.AssetService;
import org.springframework.stereotype.Service;

/**
 * @classname AssetServiceImpl
 * @description 资产服务实现类
 * @date 2026/02/08 17:55
 */
@Service
public class AssetServiceImpl extends ServiceImpl<AssetMapper, Asset> implements AssetService {

}
