package com.nexo.business.artwork.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexo.business.artwork.domain.dto.ArtWorkQueryDTO;
import com.nexo.business.artwork.domain.vo.ArtWorkVO;
import com.nexo.business.artwork.service.ArtWorkService;
import com.nexo.common.web.vo.MultiResult;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


/**
 * @classname ArtWorkController
 * @description 藏品控制器
 * @date 2025/12/21 15:08
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/artwork")
public class ArtWorkController {

    private final ArtWorkService artWorkService;

    @GetMapping("/list")
    public MultiResult<ArtWorkVO> getArtWorkList(ArtWorkQueryDTO queryDTO) {
        Page<ArtWorkVO> page = artWorkService.getArtWorkList(queryDTO);
        return MultiResult.multiSuccess(page.getRecords(), page.getTotal(), page.getCurrent(), page.getSize());
    }

}
