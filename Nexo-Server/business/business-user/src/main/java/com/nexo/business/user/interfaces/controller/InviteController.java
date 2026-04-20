package com.nexo.business.user.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.nexo.business.user.service.UserService;
import com.nexo.common.api.user.response.data.InviteRankInfo;
import com.nexo.common.api.user.response.data.UserInfo;
import com.nexo.common.web.result.MultiResult;
import com.nexo.common.web.result.Result;
import jakarta.validation.constraints.Max;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/user/invite")
@RequiredArgsConstructor
public class InviteController {

    private final UserService userService;

    @GetMapping("/getTopN")
    public MultiResult<InviteRankInfo> getTopN(@Max(100) Integer topN) {
        if (topN == null) {
            topN = 100;
        }
        List<InviteRankInfo> inviteRankInfos = userService.getTopN(topN);
        return MultiResult.multiSuccess(inviteRankInfos, topN, 1, 10);
    }

    @GetMapping("/getMyRank")
    public Result<Integer> getMyRank() {
        String userId = (String) StpUtil.getLoginId();
        Integer rank = userService.getInviteRank(userId);
        return Result.success(rank);
    }

}
