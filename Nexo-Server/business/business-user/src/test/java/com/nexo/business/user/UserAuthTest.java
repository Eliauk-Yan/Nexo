package com.nexo.business.user;

import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;
import com.nexo.business.user.service.UserAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * @classname UserAuthTest
 * @description 用户认证测试
 * @date 2026/01/04 13:42
 */
@SpringBootTest
public class UserAuthTest {

    @Autowired
    private UserAuthService userAuthService;

    @Test
    void realNameAuthTest() {
        RealNameAuthDTO dto = new RealNameAuthDTO();
        // 输入测试的实名和身份证号
        dto.setRealName("闫世杰");
        dto.setIdCardNo("152801200501245911");
        boolean result = userAuthService.realNameAuth(dto);
        System.out.println(result);
    }

}
