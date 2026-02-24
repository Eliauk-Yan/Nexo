import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
    ModalForm,
    ProFormText,
    ProFormSelect,
    ProTable,
    ProFormUploadButton,
} from '@ant-design/pro-components';
import { Button, Image, Popconfirm, message } from 'antd';
import { useRef, useState } from 'react';
import { getUserList, addUser, updateUser, removeUser } from '@/services/api/user';

export type User = {
    id: number;
    nickName: string;
    phone: string;
    email: string;
    role: 'ADMIN' | 'USER';
    state: 'NORMAL' | 'BANNED';
    avatarUrl: string;
    loginTime: string;
    createdAt: string;
};

export default () => {
    const actionRef = useRef<ActionType>(null);
    const [createModalVisible, handleModalVisible] = useState<boolean>(false);

    const columns: ProColumns<User>[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 60,
            search: false,
        },
        {
            title: '头像',
            dataIndex: 'avatarUrl',
            search: false,
            render: (_, record) => (
                <Image
                    width={50}
                    src={record.avatarUrl}
                    fallback="https://gw.alipayobjects.com/zos/antfincdn/xaDPEACOBV/file.png?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200"
                />
            ),
        },
        {
            title: '昵称',
            dataIndex: 'nickName',
            copyable: true,
            ellipsis: true,
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            copyable: true,
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            search: false,
        },
        {
            title: '角色',
            dataIndex: 'role',
            valueType: 'select',
            search: false,
            valueEnum: {
                ADMIN: { text: '管理员', status: 'Success' },
                USER: { text: '普通用户', status: 'Default' },
            },
        },
        {
            title: '状态',
            dataIndex: 'state',
            valueType: 'select',
            search: false,
            valueEnum: {
                NORMAL: { text: '正常', status: 'Success' },
                BANNED: { text: '封禁', status: 'Error' },
            },
        },
        {
            title: '注册时间',
            dataIndex: 'createdAt',
            valueType: 'dateTime',
            search: false,
        },
        {
            title: '最后登录时间',
            dataIndex: 'loginTime',
            valueType: 'dateTime',
            search: false,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <a
                    key="editable"
                    onClick={() => {
                        action?.startEditable?.(record.id);
                    }}
                >
                    编辑
                </a>,
                <Popconfirm
                    key="delete"
                    title="删除确认"
                    description="您确定要删除这个用户吗？此操作无法恢复。"
                    onConfirm={async () => {
                        const success = await removeUser(record.id);
                        if (success) {
                            message.success('删除成功');
                            action?.reload();
                        }
                    }}
                    okText="确定"
                    cancelText="取消"
                >
                    <a style={{ color: 'red' }}>删除</a>
                </Popconfirm>,
            ],
        },
    ];

    return (
        <>
            <ProTable<User>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params) => {
                    const APIParams = {
                        current: params.current,
                        size: params.pageSize,
                        nickName: params.nickName,
                        phone: params.phone,
                    };
                    const res = await getUserList(APIParams);
                    return {
                        data: res.data,
                        success: true,
                        total: res.total,
                    };
                }}
                editable={{
                    type: 'multiple',
                    onSave: async (key, row) => {
                        await updateUser(row);
                        message.success('保存成功');
                    }
                }}
                columnsState={{
                    persistenceKey: 'pro-table-user-list',
                    persistenceType: 'localStorage',
                    defaultValue: {
                        option: { fixed: 'right', disable: true },
                    },
                }}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                }}
                pagination={{
                    pageSize: 10,
                }}
                dateFormatter="string"
                headerTitle="用户列表"
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            handleModalVisible(true);
                        }}
                        type="primary"
                    >
                        新建用户
                    </Button>,
                ]}
            />

            <ModalForm
                title="新建用户"
                width="500px"
                visible={createModalVisible}
                onVisibleChange={handleModalVisible}
                onFinish={async (value) => {
                    const avatarUrl = value.avatarUrl && value.avatarUrl[0] ? value.avatarUrl[0].response?.url || value.avatarUrl[0].thumbUrl || '' : '';
                    const submitData = {
                        ...value,
                        avatarUrl
                    };

                    const success = await addUser(submitData);
                    if (success) {
                        message.success('创建成功');
                        handleModalVisible(false);
                        actionRef.current?.reload();
                        return true;
                    }
                    message.error('创建失败');
                    return false;
                }}
            >
                <ProFormText
                    name="nickName"
                    label="昵称"
                    placeholder="请输入昵称"
                    rules={[{ required: true, message: '昵称不能为空' }]}
                />

                <ProFormText
                    name="phone"
                    label="手机号"
                    placeholder="请输入手机号"
                    rules={[{ required: true, message: '手机号不能为空' }]}
                />

                <ProFormText
                    name="email"
                    label="邮箱"
                    placeholder="请输入邮箱"
                />

                {/* @ts-ignore */}
                <ProFormUploadButton
                    name="avatarUrl"
                    label="用户头像"
                    title="上传头像"
                    max={1}
                    fieldProps={{
                        name: 'file',
                        listType: 'picture-card',
                    }}
                    action="/api/upload"
                />

                <ProFormSelect
                    name="role"
                    label="角色"
                    valueEnum={{
                        ADMIN: '管理员',
                        USER: '普通用户',
                    }}
                    initialValue="USER"
                    rules={[{ required: true }]}
                />

                <ProFormSelect
                    name="state"
                    label="状态"
                    valueEnum={{
                        NORMAL: '正常',
                        BANNED: '封禁',
                    }}
                    initialValue="NORMAL"
                    rules={[{ required: true }]}
                />
            </ModalForm>
        </>
    );
};
