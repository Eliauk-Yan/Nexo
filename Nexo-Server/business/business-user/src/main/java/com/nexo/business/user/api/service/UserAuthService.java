package com.nexo.business.user.api.service;

import com.nexo.business.user.interfaces.dto.RealNameAuthDTO;

public interface UserAuthService {

    boolean realNameAuth(RealNameAuthDTO dto);

}
