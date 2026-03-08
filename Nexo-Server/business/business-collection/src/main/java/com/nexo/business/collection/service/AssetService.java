package com.nexo.business.collection.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.nexo.business.collection.domain.entity.Asset;
import com.nexo.business.collection.interfaces.vo.AssetVO;

/**
 * @classname AssetService
 * @description 资产服务
 * @date 2026/02/08 17:54
 */
public interface AssetService extends IService<Asset> {

    /**
     * 分页查询当前用户的资产列表
     *
     * @param current 当前页码
     * @param size    每页大小
     * @return 个人资产视图列表
     */
    Page<AssetVO> getMyAssets(Long current, Long size);
}
