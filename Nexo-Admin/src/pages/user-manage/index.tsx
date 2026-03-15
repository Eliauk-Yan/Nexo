import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
    ProTable,
} from '@ant-design/pro-components';
import { Image, Tag, Switch } from 'antd';
import { message } from 'antd';
import React, { useRef, useState } from 'react';
import { getUserList, freezeUser, unfreezeUser } from '@/services/api/user';

const ActiveSwitch: React.FC<{
    record: User;
    onFreeze: (id: number) => Promise<boolean>;
    onUnfreeze: (id: number) => Promise<boolean>;
    onSuccess: () => void;
}> = ({ record, onFreeze, onUnfreeze, onSuccess }) => {
    const [checked, setChecked] = useState(record.state === 'ACTIVE');
    const [loading, setLoading] = useState(false);

    return (
        <Switch
            checked={checked}
            loading={loading}
            checkedChildren="正常"
            unCheckedChildren="冻结"
            onChange={async (value) => {
                setChecked(value);
                setLoading(true);
                const success = value
                    ? await onUnfreeze(record.id)
                    : await onFreeze(record.id);
                setLoading(false);
                if (success) {
                    onSuccess();
                } else {
                    setChecked(!value);
                }
            }}
        />
    );
};

export type User = {
    id: number;
    nickName: string;
    phone: string;
    email: string;
    role: 'ADMIN' | 'COLLECTOR';
    state: 'INIT' | 'AUTHENTICATED' | 'ACTIVE' | 'FROZEN';
    avatarUrl: string;
    address?: string;
    certification?: boolean;
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
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            copyable: true,
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            search: false,
        },
        {
            title: '地址',
            dataIndex: 'address',
            search: false,
            ellipsis: true,
        },
        {
            title: '角色',
            dataIndex: 'role',
            valueType: 'select',
            valueEnum: {
                ADMIN: { text: '管理员' },
                COLLECTOR: { text: '收藏家' },
            },
            render: (_, record) => (
                <Tag color={record.role === 'ADMIN' ? 'gold' : 'green'}>
                    {record.role === 'ADMIN' ? '管理员' : '收藏家'}
                </Tag>
            ),
        },
        {
            title: '实名认证',
            dataIndex: 'certification',
            valueType: 'select',
            valueEnum: {
                true: { text: '已认证' },
                false: { text: '未认证' },
            },
            render: (_, record) => (
                <Tag color={record.certification ? 'blue' : 'default'}>
                    {record.certification ? '已认证' : '未认证'}
                </Tag>
            ),
        },
        {
            title: '状态',
            dataIndex: 'state',
            valueType: 'select',
            valueEnum: {
                INIT: { text: '初始化' },
                AUTHENTICATED: { text: '已实名' },
                ACTIVE: { text: '正常' },
                FROZEN: { text: '冻结' },
            },
            render: (_, record) => {
                let color: string = 'default';
                let text: string = '';
                switch (record.state) {
                    case 'INIT':
                        color = 'default';
                        text = '初始化';
                        break;
                    case 'AUTHENTICATED':
                        color = 'processing';
                        text = '已实名';
                        break;
                    case 'ACTIVE':
                        color = 'success';
                        text = '正常';
                        break;
                    case 'FROZEN':
                        color = 'error';
                        text = '冻结';
                        break;
                    default:
                        text = record.state;
                }
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: '激活',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => {
                // 未实名认证或处于 INIT / AUTHENTICATED 状态，不显示操作
                if (!record.certification || record.state === 'INIT' || record.state === 'AUTHENTICATED') {
                    return [<span key="no-op" style={{ color: '#999' }}>-</span>];
                }
                return [
                    <ActiveSwitch
                        key="freeze-switch"
                        record={record}
                        onFreeze={handleFreeze}
                        onUnfreeze={handleUnfreeze}
                        onSuccess={() => actionRef.current?.reload()}
                    />,
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
                        role: params.role,
                        certification: params.certification,
                        state: params.state,
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
