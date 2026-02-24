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

export async function addUser(body: any, options?: { [key: string]: any }) {
    return request<any>('/admin/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function updateUser(body: any, options?: { [key: string]: any }) {
    return request<any>('/admin/user', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function removeUser(id: number, options?: { [key: string]: any }) {
    return request<any>(`/admin/user/${id}`, {
        method: 'DELETE',
        ...(options || {}),
    });
}
