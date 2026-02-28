import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
    ProTable,
} from '@ant-design/pro-components';
import { Image } from 'antd';
import { message, Popconfirm } from 'antd';
import { useRef } from 'react';
import { getUserList, freezeUser, unfreezeUser } from '@/services/api/user';

export type User = {
    id: number;
    nickName: string;
    phone: string;
    email: string;
    role: 'ADMIN' | 'USER';
    state: 'INIT' | 'AUTHENTICATED' | 'ACTIVE' | 'FROZEN';
    avatarUrl: string;
    loginTime: string;
    createdAt: string;
};

export default () => {
    const actionRef = useRef<ActionType>(null);

    const handleFreeze = async (id: number) => {
        try {
            const res = await freezeUser(id);
            if (res.success) {
                message.success('冻结成功');
                return true;
            }
            message.error(res.message || '冻结失败');
            return false;
        } catch (error) {
            message.error('冻结失败');
            return false;
        }
    };

    const handleUnfreeze = async (id: number) => {
        try {
            const res = await unfreezeUser(id);
            if (res.success) {
                message.success('解冻成功');
                return true;
            }
            message.error(res.message || '解冻失败');
            return false;
        } catch (error) {
            message.error('解冻失败');
            return false;
        }
    };

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
                ADMIN: { text: '管理员', status: 'Warning' },
                COLLECTOR: { text: '收藏家', status: 'Success' },
            },
        },
        {
            title: '状态',
            dataIndex: 'state',
            valueType: 'select',
            search: false,
            valueEnum: {
                INIT: { text: '初始化', status: 'Default' },
                AUTHENTICATED: { text: '已实名', status: 'Processing' },
                ACTIVE: { text: '正常', status: 'Success' },
                FROZEN: { text: '冻结', status: 'Error' },
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
            render: (text, record, _, action) => {
                // INIT 和 AUTHENTICATED 状态不显示冻结/解冻操作
                if (record.state === 'INIT' || record.state === 'AUTHENTICATED') {
                    return [<span key="no-op" style={{ color: '#999' }}>-</span>];
                }
                return [
                    <Popconfirm
                        key="freeze"
                        title={record.state === 'ACTIVE' ? '确定冻结该用户吗?' : '确定解冻该用户吗?'}
                        onConfirm={async () => {
                            const success = record.state === 'ACTIVE' ? await handleFreeze(record.id) : await handleUnfreeze(record.id);
                            if (success) {
                                actionRef.current?.reload();
                            }
                        }}
                    >
                        <a style={{ color: record.state === 'ACTIVE' ? 'red' : 'green' }}>
                            {record.state === 'ACTIVE' ? '冻结' : '解冻'}
                        </a>
                    </Popconfirm>,
                ];
            },
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
                ]}
            />
        </>
    );
};
