package com.nexo.admin.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.lang.UUID;
import com.nexo.admin.domain.param.NFTCreateParam;
import com.nexo.admin.domain.param.NFTQueryParam;
import com.nexo.admin.domain.exception.AdminException;
import com.nexo.admin.domain.param.NFTUpdateParam;
import com.nexo.admin.domain.vo.NFTVO;
import com.nexo.admin.service.NFTService;
import com.nexo.common.api.nft.NFTFacade;
import com.nexo.common.api.nft.request.*;
import com.nexo.common.api.nft.response.NFTResponse;
import com.nexo.common.api.nft.response.data.NFTDTO;
import com.nexo.common.base.response.PageResponse;
import com.nexo.common.file.service.FileService;
import com.nexo.common.web.result.MultiResult;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

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
     * 藏品模块接口
     */
    @DubboReference(version = "1.0.0")
    private NFTFacade nftFacade;

    /**
     * 文件存储服务
     */
    private final FileService fileService;

    @Override
    public MultiResult<NFTVO> getNFTList(NFTQueryParam dto) {
        // 1. 构造分页查询请求
        NFTPageQueryRequest request = new NFTPageQueryRequest();
        request.setCurrent(dto.getCurrent());
        request.setSize(dto.getSize());
        request.setKeyword(dto.getName());
        request.setState(dto.getState());
        // 2. 调用藏品服务进行查询
        PageResponse<NFTDTO> response = nftFacade.queryPage(request);
        if (!response.getSuccess() || response.getData() == null) {
            throw new AdminException(GET_NFT_FAILED);
        }
        // 3. DTO → VO
        List<NFTVO> voList = response.getData().stream().map(nftDTO -> {
            NFTVO vo = new NFTVO();
            BeanUtils.copyProperties(nftDTO, vo);
            return vo;
        }).collect(Collectors.toList());
        // 4. 返回数据
        return MultiResult.multiSuccess(voList, response.getTotal(), response.getCurrent(), response.getSize());
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

    @Override
    public Boolean addNFT(NFTCreateParam dto) {
        // 1. 构造藏品创建请求
        NFTCreateRequest request = new NFTCreateRequest();
        request.setName(dto.getName());
        request.setCover(dto.getCover());
        request.setPrice(dto.getPrice());
        request.setQuantity(dto.getQuantity());
        request.setDescription(dto.getDescription());
        request.setIdentifier(UUID.randomUUID().toString());
        request.setSaleTime(dto.getSaleTime());
        request.setCreatorId(StpUtil.getLoginIdAsLong());
        // 2. 调用藏品服务创建藏品
        NFTResponse<Boolean> response = nftFacade.addNFT(request);
        if (!response.getSuccess() || response.getData() == null) {
            throw new AdminException(CREATE_NFT_ERROR);
        }
        // 3. 返回结果
        return response.getData();
    }

    @Override
    public Boolean deleteNFT(Long id) {
        // 1. 创建删除请求
        NFTRemoveRequest nftRemoveRequest = new NFTRemoveRequest();
        nftRemoveRequest.setNFTId(id);
        nftRemoveRequest.setIdentifier(UUID.randomUUID().toString());
        // 2. 调用藏品服务
        NFTResponse<Long> response = nftFacade.removeNFT(nftRemoveRequest);
        return response.getSuccess();
    }

    @Override
    public Boolean updatePrice(NFTUpdateParam param) {
        // 创建更新价格请求
        NFTUpdatePriceRequest request = new NFTUpdatePriceRequest();
        request.setNFTId(param.getNftId());
        request.setPrice(param.getPrice());
        request.setIdentifier(UUID.randomUUID().toString());
        // 2. 调用藏品服务更新价格
        NFTResponse<Long> response = nftFacade.updatePrice(request);
        return response.getSuccess();
    }

    @Override
    public Boolean updateInventory(NFTUpdateParam param) {
        // 1. 创建更新库存请求
        NFTUpdateInventoryRequest request = new NFTUpdateInventoryRequest();
        request.setNFTId(param.getNftId());
        request.setQuantity(param.getQuantity());
        request.setIdentifier(UUID.randomUUID().toString());
        // 2. 调用藏品服务更新库存
        NFTResponse<Long> response = nftFacade.updateInventory(request);
        return response.getSuccess();
    }

}
