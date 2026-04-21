package com.nexo.business.collection.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexo.business.collection.domain.entity.Asset;
import com.nexo.business.collection.domain.entity.NFT;
import com.nexo.business.collection.interfaces.param.DestroyParam;
import com.nexo.business.collection.interfaces.param.NFTPageQueryParam;
import com.nexo.business.collection.interfaces.vo.NFTVO;
import com.nexo.business.collection.interfaces.vo.AssetVO;
import com.nexo.common.api.blockchain.ChainFacade;
import com.nexo.common.api.blockchain.constant.ChainOperateType;
import com.nexo.common.api.blockchain.constant.ChainOperationBizType;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainOperationData;
import com.nexo.common.api.nft.request.AssetDestroyRequest;
import com.nexo.common.api.nft.response.data.NFTInfo;
import com.nexo.business.collection.mapper.convert.NFTConvertor;
import com.nexo.business.collection.service.NFTService;
import com.nexo.business.collection.service.AssetService;
import com.nexo.common.api.nft.constant.NFTState;
import com.nexo.common.api.user.UserFacade;
import com.nexo.common.api.user.request.UserQueryRequest;
import com.nexo.common.api.user.response.UserQueryResponse;
import com.nexo.common.api.user.response.data.UserInfo;
import com.nexo.common.base.response.PageResponse;
import com.nexo.common.web.result.MultiResult;
import com.nexo.common.web.result.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.web.bind.annotation.*;

import static com.nexo.common.file.constant.FileConstant.SEPARATOR;

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

    @DubboReference(version = "1.0.0")
    private ChainFacade chainFacade;

    @DubboReference(version = "1.0.0")
    private UserFacade userFacade;

    /**
     * 获取藏品
     */
    @GetMapping("/list")
    public MultiResult<NFTVO> getNFTList(NFTPageQueryParam param) {
        PageResponse<NFT> nftPageResponse = NFTService.pageQueryByState(NFTState.SUCCESS.getCode(), param.getKeyword(), param.getCurrentPage(), param.getPageSize());
        return MultiResult.multiSuccess(nftConvertor.toVOs(nftPageResponse.getData()), nftPageResponse.getTotal(), nftPageResponse.getCurrent(), nftPageResponse.getSize());
    }

    /**
     * 获取藏品详情
     */
    @GetMapping("/{id}")
    public Result<NFTInfo> getNFTDetail(@PathVariable Long id) {
        return Result.success(NFTService.getNFTInfo(id));
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

    @PostMapping("/destroy")
    public Result<Boolean> destroy(@RequestBody @Valid DestroyParam param) {
        String userId = (String) StpUtil.getLoginId();
        // 1. 构造资产销毁请求
        AssetDestroyRequest request = new AssetDestroyRequest();
        request.setOperator(userId);
        request.setAssetId(param.getAssetId());
        request.setIdentify(param.getAssetId());
        // 2. 资产服务销毁资产
        Asset asset = assetService.destroy(request);
        if (asset != null) {
            ChainRequest chainRequest = new ChainRequest();
            chainRequest.setBizId(String.valueOf(asset.getId())); // 业务ID
            chainRequest.setBizType(ChainOperationBizType.ASSET.getCode()); // 业务类型
            chainRequest.setIdentifier(asset.getId().toString() + SEPARATOR + ChainOperateType.NFT_DESTROY.getCode()); // 幂等号
            UserInfo user = StpUtil.getSession().getModel("userInfo", UserInfo.class);
            chainRequest.setOwner(user.getAddress());
            chainRequest.setClassId(asset.getNftId().toString());
            chainRequest.setNtfId(String.valueOf(asset.getNftId()));
            ChainResponse<ChainOperationData> response = chainFacade.destroy(chainRequest);
            return Result.success(response.getSuccess());
        }
        return Result.success(false);
    }
}
