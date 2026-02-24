package com.nexo.admin.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.lang.UUID;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexo.admin.domain.dto.NFTCreateDTO;
import com.nexo.admin.domain.dto.NFTQueryDTO;
import com.nexo.admin.domain.exception.AdminException;
import com.nexo.admin.domain.vo.NFTVO;
import com.nexo.admin.service.NFTService;
import com.nexo.common.api.artwork.ArtWorkFacade;
import com.nexo.common.api.artwork.request.ArtWorkQueryRequest;
import com.nexo.common.api.artwork.request.NFTCreateRequest;
import com.nexo.common.api.artwork.response.ArtWorkQueryResponse;
import com.nexo.common.api.artwork.response.NFTResponse;
import com.nexo.common.api.artwork.response.data.ArtWorkDTO;
import com.nexo.common.file.service.FileService;
import com.nexo.common.web.result.MultiResult;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static com.nexo.admin.domain.exception.AdminErrorCode.*;

/**
 * @classname NFTServiceImpl
 * @description 数字藏品服务实现类
 * @date 2026/02/19 03:37
 */
@Service
@RequiredArgsConstructor
public class NFTServiceImpl implements NFTService {

    /**
     * 藏品服务门面
     */
    @DubboReference(version = "1.0.0")
    private ArtWorkFacade artWorkFacade;

    /**
     * 文件存储服务
     */
    private final FileService fileService;

    @Override
    public MultiResult<NFTVO> getNFTList(NFTQueryDTO dto) {
        // 1. 调用藏品服务获取藏品列表
        ArtWorkQueryRequest request = new ArtWorkQueryRequest();
        request.setCurrent(dto.getCurrent());
        request.setSize(dto.getSize());
        request.setName(dto.getName());
        request.setState(dto.getState());
        ArtWorkQueryResponse<Page<ArtWorkDTO>> response = artWorkFacade.getNFTList(request);
        if (!response.getSuccess() || response.getData() == null) {
            throw new AdminException(GET_NFT_FAILED);
        }
        // 2. 转换并返回藏品列表数据
        List<NFTVO> list = response.getData().getRecords().stream().map(item -> {
            NFTVO nftVO = new NFTVO();
            BeanUtils.copyProperties(item, nftVO);
            return nftVO;
        }).toList();
        return MultiResult.multiSuccess(list, response.getData().getTotal(), response.getData().getCurrent(),
                response.getData().getSize());
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Boolean addNFT(NFTCreateDTO dto) {
        // 1. 构造藏品创建请求
        NFTCreateRequest request = new NFTCreateRequest();
        request.setName(dto.getName());
        request.setCover(dto.getCover());
        request.setPrice(dto.getPrice());
        request.setQuantity(dto.getQuantity());
        request.setDescription(dto.getDescription());
        request.setIdentifier(UUID.randomUUID().toString());
        request.setSaleTime(dto.getSaleTime());
        request.setCanBook(dto.getCanBook());
        request.setBookStartTime(dto.getBookStartTime());
        request.setBookEndTime(dto.getBookEndTime());
        request.setCreatorId(StpUtil.getLoginIdAsLong());
        // 2. 调用藏品服务创建藏品
        NFTResponse<Boolean> response = artWorkFacade.addNFT(request);
        if (!response.getSuccess() || response.getData() == null) {
            throw new AdminException(CREATE_NFT_ERROR);
        }
        // 3. 返回结果
        return response.getData();
    }

    @Override
    public Boolean updateNFT(com.nexo.admin.domain.dto.NFTUpdateDTO dto) {
        ArtWorkDTO artWorkDTO = new ArtWorkDTO();
        BeanUtils.copyProperties(dto, artWorkDTO);
        if (dto.getBookStartTime() != null && !dto.getBookStartTime().isEmpty()) {
            artWorkDTO.setBookStartTime(java.time.LocalDateTime.parse(dto.getBookStartTime(),
                    java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        if (dto.getBookEndTime() != null && !dto.getBookEndTime().isEmpty()) {
            artWorkDTO.setBookEndTime(java.time.LocalDateTime.parse(dto.getBookEndTime(),
                    java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        return artWorkFacade.updateNFT(artWorkDTO);
    }

    @Override
    public Boolean deleteNFT(Long id) {
        return artWorkFacade.deleteNFT(id);
    }

    @Override
    public String uploadNFT(MultipartFile file) {
        // 1. 判断文件是否为空
        if (file.isEmpty()) {
            throw new AdminException(ADMIN_UPLOAD_IMAGE_FAILED);
        }
        // 2. 构造文件路径
        String filePath = "nft/" + StpUtil.getLoginIdAsString() + "/" + file.getOriginalFilename();
        // 3. 上传文件并返回URL
        return fileService.uploadFile(file, filePath);
    }


}
