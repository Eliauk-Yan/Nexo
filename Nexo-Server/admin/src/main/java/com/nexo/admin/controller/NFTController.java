package com.nexo.admin.controller;

import com.nexo.admin.domain.dto.NFTCreateDTO;
import com.nexo.admin.domain.dto.NFTQueryDTO;
import com.nexo.admin.domain.dto.NFTUpdateDTO;
import com.nexo.admin.domain.vo.NFTVO;
import com.nexo.admin.service.NFTService;
import com.nexo.common.web.result.MultiResult;
import com.nexo.common.web.result.Result;
import jakarta.validation.Valid;
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

    /**
     * 获取数字藏品列表
     * @param dto 查询条件
     * @return 数字藏品列表
     */
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
    public Result<Boolean> add(@Valid @RequestBody NFTCreateDTO dto) {
        return Result.success(nftService.addNFT(dto));
    }

    /**
     * 修改数字藏品
     * @param dto 数字藏品信息
     * @return 结果
     */
    @PutMapping
    public Result<Boolean> update(@Valid @RequestBody NFTUpdateDTO dto) {
        return Result.success(nftService.updateNFT(dto));
    }

    /**
     * 删除数字藏品
     * @param id 数字藏品ID
     * @return 结果
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(nftService.deleteNFT(id));
    }

    /**
     * 修改数字藏品状态
     * @param id 数字藏品ID
     * @param state 状态
     * @return 结果
     */
    @PutMapping("/{id}/status/{state}")
    public Result<Boolean> updateState(@PathVariable Long id, @PathVariable String state) {
        return Result.success(nftService.updateState(id, state));
    }

}
