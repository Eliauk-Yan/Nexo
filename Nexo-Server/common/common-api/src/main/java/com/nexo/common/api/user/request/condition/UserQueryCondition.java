package com.nexo.common.api.user.request.condition;

import java.io.Serializable;

public sealed interface UserQueryCondition extends Serializable
        permits UserQueryByPhone  {
}
