package com.nexo.common.api.nft.request;

import com.nexo.common.base.request.PageRequest;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;

@Setter
@Getter
public class NFTPageQueryRequest extends PageRequest {

    @Serial
    private static final long serialVersionUID = 1L;

    private String keyword;

    private String state;

}
