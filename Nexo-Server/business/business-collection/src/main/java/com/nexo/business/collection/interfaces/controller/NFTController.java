package com.nexo.business.collection.interfaces.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexo.business.collection.domain.entity.NFT;
import com.nexo.business.collection.interfaces.dto.NFTPageQueryDTO;
import com.nexo.business.collection.interfaces.vo.NFTDetailVO;
import com.nexo.business.collection.interfaces.vo.NFTVO;
import com.nexo.business.collection.interfaces.vo.AssetVO;
import com.nexo.business.collection.mapper.convert.NFTConvertor;
import com.nexo.business.collection.service.NFTService;
import com.nexo.business.collection.service.AssetService;
import com.nexo.common.web.result.MultiResult;
import com.nexo.common.web.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @classname ArtWorkController
 * @description 藏品控制器
 * @date 2025/12/21 15:08
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/artwork")
public class NFTController {

    private final NFTService NFTService;

    private final NFTConvertor nftConvertor;

    private final AssetService assetService;

    /**
     * 获取藏品
     */
    @GetMapping("/list")
    public MultiResult<NFTVO> getNFTList(NFTPageQueryDTO queryDTO) {
        Page<NFT> page = NFTService.queryPage(queryDTO);
        return MultiResult.multiSuccess(nftConvertor.toVOs(page.getRecords()), page.getTotal(), page.getCurrent(), page.getSize());
    }

    /**
     * 获取藏品详情
     */
    @GetMapping("/{id}")
    public Result<NFTDetailVO> getNFTDetail(@PathVariable Long id) {
        return Result.success(NFTService.getNFTDetail(id));
    }

    /**
     * 获取资产
     */
    @GetMapping("/myAssets")
    public MultiResult<AssetVO> getMyAssets(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size) {
        Page<AssetVO> page = assetService.getMyAssets(current, size);
        return MultiResult.multiSuccess(page.getRecords(), page.getTotal(), page.getCurrent(), page.getSize());
    }
}
