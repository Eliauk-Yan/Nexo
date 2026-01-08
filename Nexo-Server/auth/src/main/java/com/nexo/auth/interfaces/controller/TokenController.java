package com.nexo.auth.interfaces.controller;

import com.nexo.auth.interfaces.dto.TokenDTO;
import com.nexo.auth.service.TokenService;
import com.nexo.common.web.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @classname TokenController
 * @description TODO
 * @date 2026/01/08 23:03
 */
@RestController
@RequestMapping("token")
@RequiredArgsConstructor
public class TokenController {

    private final TokenService tokenService;

    @GetMapping("get")
    public Result<String> getToken(TokenDTO dto) {
        return Result.success(tokenService.getToken(dto.getScene(), dto.getId()));
    }

}
