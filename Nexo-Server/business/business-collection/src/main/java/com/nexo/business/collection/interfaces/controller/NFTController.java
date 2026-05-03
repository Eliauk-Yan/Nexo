package com.nexo.business.collection.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexo.business.collection.domain.entity.Asset;
import com.nexo.business.collection.domain.entity.NFT;
import com.nexo.business.collection.domain.exception.NFTException;
import com.nexo.business.collection.interfaces.param.DestroyParam;
import com.nexo.business.collection.interfaces.param.NFTPageQueryParam;
import com.nexo.business.collection.interfaces.param.TransferParam;
import com.nexo.business.collection.interfaces.vo.NFTVO;
import com.nexo.business.collection.interfaces.vo.AssetVO;
import com.nexo.business.collection.service.impl.AssetCacheService;
import com.nexo.common.api.blockchain.ChainFacade;
import com.nexo.common.api.blockchain.constant.ChainOperateType;
import com.nexo.common.api.blockchain.constant.ChainOperationBizType;
import com.nexo.common.api.blockchain.request.ChainRequest;
import com.nexo.common.api.blockchain.response.ChainResponse;
import com.nexo.common.api.blockchain.response.data.ChainOperationData;
import com.nexo.common.api.nft.constant.AssetState;
import com.nexo.common.api.nft.request.AssetDestroyRequest;
import com.nexo.common.api.nft.request.AssetTransferRequest;
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
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.web.bind.annotation.*;

import static com.nexo.business.collection.domain.exception.NFTErrorCode.*;
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

    private final AssetCacheService assetCacheService;

    @DubboReference(version = "1.0.0")
    private ChainFacade chainFacade;

    @DubboReference(version = "1.0.0")
    private UserFacade userFacade;

    /**
     * 获取藏品
     */
    @GetMapping("/list")
    public MultiResult<NFTVO> getNFTList(NFTPageQueryParam param) {
        PageResponse<NFT> nftPageResponse = NFTService.pageQueryByState(NFTState.SUCCESS.getCode(), param.getKeyword(), param.getClassify(), param.getCurrentPage(), param.getPageSize());
        return MultiResult.multiSuccess(nftConvertor.toVOs(nftPageResponse.getData()), nftPageResponse.getTotal(), nftPageResponse.getCurrent(), nftPageResponse.getSize());
    }

    /**
     * 获取藏品详情
     */
    @GetMapping("/{id:\\d+}")
    public Result<NFTInfo> getNFTDetail(@PathVariable Long id) {
        return Result.success(NFTService.getNFTInfo(id));
    }

    /**
     * 获取资产
     */
    @GetMapping("/asset/list")
    public MultiResult<AssetVO> getAssetList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) AssetState state,
            @RequestParam(defaultValue = "10") long pageSize,
            @RequestParam(defaultValue = "1") long currentPage) {
        Page<AssetVO> page = assetService.getAssetList(keyword, state, currentPage, pageSize);
        return MultiResult.multiSuccess(page.getRecords(), page.getTotal(), page.getCurrent(), page.getSize());
    }

    @PostMapping("/destroy")
    public Result<Boolean> destroy(@RequestBody @Valid DestroyParam param) {
        String userId = (String) StpUtil.getLoginId();
        // 1. 构造资产销毁请求
        AssetDestroyRequest request = new AssetDestroyRequest();
        request.setOperator(userId);
        request.setAssetId(param.getAssetId());
        request.setIdentifier(param.getAssetId());
        // 2. 资产服务销毁资产
        Asset asset = assetService.destroy(request);
        return Result.success(asset != null);
    }

    @PostMapping("/transfer")
    public Result<Boolean> transfer(@RequestBody @Valid TransferParam param) {
        // 1. 校验 不能转让给自己
        String userId = (String) StpUtil.getLoginId();
        if (userId.equals(param.getRecipeId())) {
            throw new NFTException(CANNOT_TRANSFER_TO_YOURSELF);
        }
        // 2. 查询资产
        Asset asset = assetCacheService.getAssetById(Long.parseLong(param.getAssetId()));
        // 3. 查询用户
        UserQueryRequest userQueryRequest = new UserQueryRequest();
        userQueryRequest.setId(Long.parseLong(param.getRecipeId()));
        UserQueryResponse<UserInfo> userQueryResponse = userFacade.userQuery(userQueryRequest);
        UserInfo reciveUserInfo = userQueryResponse.getData();
        // 4. 校验用户是否存在
        if (reciveUserInfo == null || !userQueryResponse.getSuccess()) {
            throw new NFTException(USER_NOT_EXIST);
        }
        // 5. 校验用户是否有权限购买
        if (!reciveUserInfo.canBuy()) {
            throw new NFTException(BUYER_ILLEGAL);
        }
        // 6. 转增
        if (asset != null) {
            // 6.1 本地数据更新
            AssetTransferRequest assetTransferRequest = new AssetTransferRequest();
            assetTransferRequest.setRecipeId(param.getRecipeId()); // 接受人ID
            assetTransferRequest.setAssetId(param.getAssetId()); // 资产ID
            assetTransferRequest.setOperator(userId); // 用户ID
            assetTransferRequest.setIdentifier(param.getAssetId() + SEPARATOR + assetTransferRequest.getEventType().getCode()); // 幂等号
            Asset newAsset = assetService.transfer(assetTransferRequest);
            // 6.2 区块链操作
            ChainRequest chainRequest = new ChainRequest();
            chainRequest.setBizId(String.valueOf(newAsset.getId()));
            chainRequest.setIdentifier(param.getAssetId() + SEPARATOR + param.getRecipeId() + SEPARATOR + ChainOperateType.NFT_TRANSFER.getCode());
            UserInfo currentUser = StpUtil.getSession().getModel("userInfo", UserInfo.class);
            chainRequest.setOwner(currentUser.getAddress());
            chainRequest.setNtfId(String.valueOf(asset.getNftIdentifier()));
            chainRequest.setTo(reciveUserInfo.getAddress());
            ChainResponse<ChainOperationData> response = chainFacade.transfer(chainRequest);
            return Result.success(response.getSuccess());
        }
        return Result.success(false);
    }
}
