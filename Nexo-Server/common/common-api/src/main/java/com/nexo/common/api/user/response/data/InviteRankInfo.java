package com.nexo.common.api.user.response.data;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

/**
 * 排行榜信息
 */
@Getter
@Setter
public class InviteRankInfo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 用户昵称
     */
    private String nickName;

    /**
     * 邀请积分
     */
    private Integer inviteScore;

    /**
     * 用户头像
     */
    private String avatar;

    /**
     * 邀请码
     */
    private String inviteCode;

}
