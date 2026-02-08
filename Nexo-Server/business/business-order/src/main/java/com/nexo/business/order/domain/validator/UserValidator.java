package com.nexo.business.order.domain.validator;

import com.nexo.business.order.domain.exception.OrderException;
import com.nexo.common.api.order.request.OrderCreateRequest;
import com.nexo.common.api.user.UserFacade;
import com.nexo.common.api.user.constant.UserRole;
import com.nexo.common.api.user.constant.UserState;
import com.nexo.common.api.user.request.UserQueryRequest;
import com.nexo.common.api.user.request.condition.UserQueryById;
import com.nexo.common.api.user.response.UserQueryResponse;
import com.nexo.common.api.user.response.data.UserInfo;
import lombok.RequiredArgsConstructor;

import static com.nexo.business.order.domain.exception.OrderErrorCode.*;

/**
 * @classname UserValidator
 * @description 用户校验器
 * @date 2026/02/07 18:35
 */
@RequiredArgsConstructor
public class UserValidator extends BaseOrderCreateValidator {

    private final UserFacade userFacade;

    @Override
    protected void doValidate(OrderCreateRequest request) throws OrderException {
        // 1. 根据ID调用用户服务查询用户
        // 1.1 创建Dubbo请求
        UserQueryRequest userQueryRequest = new UserQueryRequest();
        userQueryRequest.setCondition(new UserQueryById(Long.parseLong(request.getBuyerId())));
        // 1.2 调用用户服务
        UserQueryResponse<UserInfo> response = userFacade.userQuery(userQueryRequest);
        if (response.getSuccess() && response.getData() != null) {
            UserInfo userInfo = response.getData();
            // 1.3 判断买家角色是否合法
            if (userInfo.getRole() != null && userInfo.getRole() != UserRole.COLLECTOR) {
                throw new OrderException(BUYER_IS_PLATFORM_USER);
            }
            // 1.4 判断买家状态是否合法
            if (userInfo.getState() != null && userInfo.getState() != UserState.ACTIVE) {
                throw new OrderException(BUYER_STATUS_ABNORMAL);
            }
            // 1.5 判断买家是否实名认证
            if (!userInfo.getCertification()) {
                throw new OrderException(BUYER_NOT_AUTH);
            }
        }
    }
}
