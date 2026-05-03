package com.nexo.business.pay.api.service;

import com.nexo.business.pay.api.request.IapPayRequest;
import com.nexo.business.pay.api.response.IapPayResponse;

public interface AppStoreServerApiService {

    IapPayResponse pay(IapPayRequest request);
}
