package com.nexo.admin.controller;

import com.nexo.admin.domain.dto.NFTQueryDTO;
import com.nexo.admin.domain.vo.NFTVO;
import com.nexo.admin.service.NFTService;
import com.nexo.common.web.result.MultiResult;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * @classname NFTController
 * @description 数字藏品控制器
 * @date 2026/02/19 03:36
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/nft")
public class NFTController {

    private final NFTService nftService;

    @GetMapping("/list")
    public MultiResult<NFTVO> list(NFTQueryDTO dto) {
        return nftService.getNFTList(dto);
    }

    /**
     * 添加数字藏品
     * @param dto 数字藏品信息
     * @return 结果
     */
    @PostMapping
    public com.nexo.common.web.result.Result<Boolean> add(
            @org.springframework.web.bind.annotation.RequestBody @jakarta.validation.Valid com.nexo.admin.domain.dto.NFTCreateDTO dto) {
        return com.nexo.common.web.result.Result.success(nftService.addNFT(dto));
    }

    /**
     * 修改数字藏品
     * @param dto 数字藏品信息
     * @return 结果
     */
    @PutMapping
    public com.nexo.common.web.result.Result<Boolean> update(
            @org.springframework.web.bind.annotation.RequestBody @jakarta.validation.Valid com.nexo.admin.domain.dto.NFTUpdateDTO dto) {
        return com.nexo.common.web.result.Result.success(nftService.updateNFT(dto));
    }

    /**
     * 删除数字藏品
     * @param id 数字藏品ID
     * @return 结果
     */
    @DeleteMapping("/{id}")
    public com.nexo.common.web.result.Result<Boolean> delete(
            @org.springframework.web.bind.annotation.PathVariable Long id) {
        return com.nexo.common.web.result.Result.success(nftService.deleteNFT(id));
    }

    /**
     * 修改数字藏品状态
     * @param id 数字藏品ID
     * @param state 状态
     * @return 结果
     */
    @PutMapping("/{id}/status/{state}")
    public com.nexo.common.web.result.Result<Boolean> updateState(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @org.springframework.web.bind.annotation.PathVariable String state) {
        return com.nexo.common.web.result.Result.success(nftService.updateState(id, state));
    }

}
