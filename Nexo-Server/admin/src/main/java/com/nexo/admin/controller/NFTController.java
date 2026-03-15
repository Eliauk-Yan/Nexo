package com.nexo.admin.controller;

import com.nexo.admin.domain.param.NFTCreateParam;
import com.nexo.admin.domain.param.NFTQueryParam;
import com.nexo.admin.domain.param.NFTUpdateParam;
import com.nexo.admin.domain.vo.NFTVO;
import com.nexo.admin.service.NFTService;
import com.nexo.common.web.result.MultiResult;
import com.nexo.common.web.result.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
     */
    @GetMapping("/list")
    public MultiResult<NFTVO> list(NFTQueryParam dto) {
        return nftService.getNFTList(dto);
    }

    /**
     * 上传数字藏品封面
     */
    @PostMapping("/upload")
    public Result<String> uploadNFT(@RequestParam("file") MultipartFile file) {
        return Result.success(nftService.uploadNFT(file));
    }

    /**
     * 添加数字藏品
     */
    @PostMapping
    public Result<Boolean> add(@Valid @RequestBody NFTCreateParam dto) {
        return Result.success(nftService.addNFT(dto));
    }

    /**
     * 删除数字藏品
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(nftService.deleteNFT(id));
    }

    /**
     * 修改价格
     */
    @PutMapping("/price")
    public Result<Boolean> updatePrice(@RequestBody NFTUpdateParam param) {
        return Result.success(nftService.updatePrice(param));
    }

    /**
     * 修改库存
     */
    @PutMapping("/inventory")
    public Result<Boolean> updateInventory(@RequestBody NFTUpdateParam param) {
        return Result.success(nftService.updateInventory(param));
    }



}
