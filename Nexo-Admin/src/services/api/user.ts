import { request } from '@umijs/max';

export async function getUserList(params: any, options?: { [key: string]: any }) {
    return request<any>('/admin/user/list', {
        method: 'GET',
        params: {
            ...params,
        },
        ...(options || {}),
    });
}

export async function freezeUser(userId: number, options?: { [key: string]: any }) {
    return request<any>('/admin/user/freeze', {
        method: 'POST',
        params: {
            userId,
        },
        ...(options || {}),
    });
}

export async function unfreezeUser(userId: number, options?: { [key: string]: any }) {
    return request<any>('/admin/user/unfreeze', {
        method: 'POST',
        params: {
            userId,
        },
        ...(options || {}),
    });
}
