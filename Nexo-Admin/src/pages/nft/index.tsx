
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Image, Space, Tag } from 'antd';
import { useRef } from 'react';

// Define the Artwork type based on the database schema provided
export type Artwork = {
  id: number;
  name: string;
  cover: string;
  class_id: string;
  price: number;
  quantity: number; // Total quantity issued
  description: string;
  saleable_inventory: number;
  occupied_inventory: number;
  frozen_inventory: number;
  identifier: string; // Unique identifier/Token ID
  state: 'pending' | 'success' | 'archived'; // pending: 待上链/待发布, success: 已发布, archived: 已归档
  sale_time: string;
  sync_chain_time?: string;
  book_start_time?: string;
  book_end_time?: string;
  can_book: number; // 0: No, 1: Yes
  created_at: string;
  updated_at: string;
};

// Mock Data
const mockDataSource: Artwork[] = [
  {
    id: 1,
    name: 'Cyberpunk 2077 限定收藏',
    cover: 'https://gw.alipayobjects.com/zos/antfincdn/xaDPEACOBV/file.png', // Placeholder image
    class_id: 'CLS-001',
    price: 99.99,
    quantity: 1000,
    description: 'A limited edition cyberpunk style NFT.',
    saleable_inventory: 800,
    occupied_inventory: 100,
    frozen_inventory: 0,
    identifier: 'NFT-CP-2077-001',
    state: 'success',
    sale_time: '2023-11-01 10:00:00',
    can_book: 0,
    creator_id: '1001',
    created_at: '2023-10-25 10:00:00',
    updated_at: '2023-10-25 10:00:00',
  },
  {
    id: 2,
    name: 'Future Mecha 02',
    cover: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    class_id: 'CLS-002',
    price: 199.50,
    quantity: 500,
    description: 'High detailed mecha design.',
    saleable_inventory: 500,
    occupied_inventory: 0,
    frozen_inventory: 0,
    identifier: 'NFT-MECHA-002',
    state: 'pending',
    sale_time: '2023-12-12 12:00:00',
    can_book: 1,
    creator_id: '1002',
    created_at: '2023-11-15 09:30:00',
    updated_at: '2023-11-15 09:30:00',
  },
  {
    id: 3,
    name: 'Abstract Art #5',
    cover: 'https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg',
    class_id: 'CLS-003',
    price: 50.00,
    quantity: 2000,
    description: 'Abstract generative art.',
    saleable_inventory: 0,
    occupied_inventory: 0,
    frozen_inventory: 0,
    identifier: 'NFT-ABS-005',
    state: 'archived',
    sale_time: '2023-01-01 00:00:00',
    can_book: 0,
    creator_id: '1001',
    created_at: '2022-12-20 14:15:00',
    updated_at: '2023-06-01 10:00:00',
  },
];

export const waitTimePromise = async (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const waitTime = async (time: number = 100) => {
  await waitTimePromise(time);
};

const columns: ProColumns<Artwork>[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 60,
    search: false,
  },
  {
    title: '封面',
    dataIndex: 'cover',
    search: false,
    render: (_, record) => (
      <Image
        width={50}
        src={record.cover}
        placeholder={
          <Image
            preview={false}
            src="https://gw.alipayobjects.com/zos/antfincdn/xaDPEACOBV/file.png?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200"
            width={50}
          />
        }
      />
    ),
  },
  {
    title: '藏品名称',
    dataIndex: 'name',
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
    title: '唯一标识',
    dataIndex: 'identifier',
    ellipsis: true,
  },
  {
    title: '价格',
    dataIndex: 'price',
    valueType: 'money',
    sorter: (a, b) => a.price - b.price,
  },
  {
    title: '库存概览',
    search: false,
    render: (_, record) => (
      <Space direction="vertical" size={0}>
        <Tag color="geekblue">总量: {record.quantity}</Tag>
        <Tag color="green">可售: {record.saleable_inventory}</Tag>
        <Tag color="gold">占用: {record.occupied_inventory}</Tag>
      </Space>
    ),
  },
  {
    title: '状态',
    dataIndex: 'state',
    filters: true,
    onFilter: true,
    valueType: 'select',
    valueEnum: {
      pending: {
        text: '待发布',
        status: 'Processing',
      },
      success: {
        text: '已发布',
        status: 'Success',
      },
      archived: {
        text: '已归档',
        status: 'Default',
      },
    },
  },
  {
    title: '发售时间',
    dataIndex: 'sale_time',
    valueType: 'dateTime',
    sorter: (a, b) => new Date(a.sale_time).getTime() - new Date(b.sale_time).getTime(),
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    valueType: 'dateTime',
    hideInTable: true,
    search: {
      transform: (value) => {
        return {
          startTime: value[0],
          endTime: value[1],
        };
      },
    },
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
      <a href={`/nft/detail/${record.id}`} key="view">
        查看
      </a>,
      <TableDropdown
        key="actionGroup"
        onSelect={() => action?.reload()}
        menus={[
          { key: 'copy', name: '复制' },
          { key: 'delete', name: '删除' },
        ]}
      />,
    ],
  },
];

export default () => {
  const actionRef = useRef<ActionType>();
  return (
    <ProTable<Artwork>
      columns={columns}
      actionRef={actionRef}
      cardBordered
      request={async (params, sort, filter) => {
        console.log(params, sort, filter);
        await waitTime(1000); // Simulate network delay

        // Simple client-side filtering logic for mock data
        let filteredData = mockDataSource;

        if (params.name) {
          filteredData = filteredData.filter(item => item.name.includes(params.name!));
        }
        if (params.identifier) {
          filteredData = filteredData.filter(item => item.identifier.includes(params.identifier!));
        }
        if (params.state) {
          filteredData = filteredData.filter(item => item.state === params.state);
        }

        return {
          data: filteredData,
          success: true,
          total: filteredData.length,
        };
      }}
      editable={{
        type: 'multiple',
      }}
      columnsState={{
        persistenceKey: 'pro-table-nft-list',
        persistenceType: 'localStorage',
        defaultValue: {
          option: { fixed: 'right', disable: true },
        },
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      options={{
        setting: {
          listsHeight: 400,
        },
      }}
      form={{
        syncToUrl: (values, type) => {
          if (type === 'get') {
            return {
              ...values,
              created_at: [values.startTime, values.endTime],
            };
          }
          return values;
        },
      }}
      pagination={{
        pageSize: 10,
        onChange: (page) => console.log(page),
      }}
      dateFormatter="string"
      headerTitle="NFT 藏品列表"
      toolBarRender={() => [
        <Button
          key="button"
          icon={<PlusOutlined />}
          onClick={() => {
            actionRef.current?.reload();
          }}
          type="primary"
        >
          新建藏品
        </Button>,
      ]}
    />
  );
};
