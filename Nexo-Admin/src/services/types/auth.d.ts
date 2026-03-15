declare namespace API {
    type CurrentUser = {
        name?: string;
        avatar?: string;
        userid?: string | number;
        access?: string;
    };

    /** 原账户密码登录参数（已废弃，管理端改为手机号验证码） */
    type LoginParams = {
        username?: string;
        password?: string;
        autoLogin?: boolean;
        type?: string;
    };

    /** 管理员登录参数（手机号+验证码） */
    type AdminLoginParams = {
        phone: string;
        verifyCode: string;
        autoLogin?: boolean;
    };

    type UserInfo = {
        userId?: number;
        token?: string;
        tokenExpiration?: number;
        userInfo?: {
            id?: number;
            nickName?: string;
            avatarUrl?: string;
            role?: string;
        };
    };

    type LoginResult = API.Result<UserInfo>;

    type LogoutResult = API.Result<boolean>;
}
