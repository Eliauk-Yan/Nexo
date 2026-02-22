package com.nexo.common.api.artwork.request;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Setter
@Getter
public class ArtWorkQueryRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long current;

    private Long size;

    private String name;

    private String state;

}
