package com.nexo.common.api.artwork.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NFTType {

    NFT("NFT", "藏品");

    private final String code;

    private final String description;

}
