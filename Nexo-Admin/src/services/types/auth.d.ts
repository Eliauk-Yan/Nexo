declare namespace API {
    type LoginParams = {
        username?: string;
        password?: string;
        autoLogin?: boolean;
        type?: string;
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
