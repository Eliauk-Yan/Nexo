declare namespace API {
    /**
     * 通用返回结果
     */
    type Result<T> = {
        code: string;
        message: string;
        success: boolean;
        data: T;
    };

    /**
     * 分页请求参数
     */
    type PageParams = {
        current?: number;
        pageSize?: number;
    };
}
