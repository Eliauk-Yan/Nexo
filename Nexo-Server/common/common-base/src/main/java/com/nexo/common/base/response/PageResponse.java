package com.nexo.common.base.response;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.util.List;

@Getter
@Setter
public class PageResponse<T> extends MultiResponse<T> {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 当前页
     */
    private int current;

    /**
     * 每页大小
     */
    private int size;

    /**
     * 总页数
     */
    private int totalPage;

    /**
     * 总数
     */
    private int total;

    public static <T> PageResponse<T> success(List<T> data, int total, int size, int current) {
        PageResponse<T> pageResponse = new PageResponse<>();
        pageResponse.setSuccess(true);
        pageResponse.setData(data);
        pageResponse.setTotal(total);
        pageResponse.setSize(size);
        pageResponse.setCurrent(current);
        pageResponse.setTotalPage((size + total - 1) / size);
        return pageResponse;
    }
}
