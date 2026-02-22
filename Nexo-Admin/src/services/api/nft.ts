import { request } from '@umijs/max';

export async function getNFTList(params: API.NFTListParams, options?: { [key: string]: any }) {
    return request<any>('/admin/nft/list', {
        method: 'GET',
        params: {
            ...params,
        },
        ...(options || {}),
    });
}

export async function addNFT(body: any, options?: { [key: string]: any }) {
    return request<any>('/admin/nft', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function updateNFT(body: any, options?: { [key: string]: any }) {
    return request<any>('/admin/nft', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function removeNFT(id: number, options?: { [key: string]: any }) {
    return request<any>(`/admin/nft/${id}`, {
        method: 'DELETE',
        ...(options || {}),
    });
}

/** 更新NFT状态 PUT /api/nft/:id/status/:state */
export async function updateNFTState(id: number, state: string, options?: { [key: string]: any }) {
    return request<any>(`/admin/nft/${id}/status/${state}`, {
        method: 'PUT',
        ...(options || {}),
    });
}
