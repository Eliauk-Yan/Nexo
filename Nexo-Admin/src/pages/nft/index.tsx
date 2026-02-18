
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
  ProFormSwitch,
  ProTable,
  TableDropdown,
} from '@ant-design/pro-components';
import { Button, Image, Space, Tag, message } from 'antd';
import { useRef, useState } from 'react';
import { request } from '@umijs/max';

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

export default () => {
  const actionRef = useRef<ActionType>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);

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

  return (
    <>
      <ProTable<Artwork>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          console.log(params, sort, filter);
          await waitTime(1000);

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
              handleModalVisible(true);
            }}
            type="primary"
          >
            新建藏品
          </Button>,
        ]}
      />

      <ModalForm
        title="新建 NFT 藏品"
        width="600px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          console.log('Submitted values:', value);

          // Formats values to match the Artwork type or backend expectation
          // For now, simple console log and mock success

          // Flatten upload response extracting the url
          const cover = value.cover && value.cover[0] ? value.cover[0].response?.url || value.cover[0].thumbUrl : '';

          const submitData = {
            ...value,
            cover
          };

          console.log('Data to submit:', submitData);

          message.success('提交成功');
          handleModalVisible(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText
          name="name"
          label="藏品名称"
          placeholder="请输入藏品名称"
          rules={[{ required: true, message: '藏品名称不能为空' }]}
        />

        <ProFormUploadButton
          name="cover"
          label="藏品封面"
          title="上传封面"
          max={1}
          fieldProps={{
            name: 'file',
            listType: 'picture-card',
          }}
          action="/api/upload" // Replace with actual upload API
          rules={[{ required: true, message: '藏品封面不能为空' }]}
        />

        <ProFormTextArea
          name="description"
          label="藏品描述"
          placeholder="请输入藏品描述"
        />

        <Space>
          <ProFormDigit
            name="price"
            label="价格 (元)"
            placeholder="请输入价格"
            min={0}
            fieldProps={{ precision: 2 }}
            width="sm"
            rules={[{ required: true, message: '藏品价格不能为空' }]}
          />
          <ProFormDigit
            name="quantity"
            label="发行数量"
            placeholder="请输入数量"
            min={1}
            fieldProps={{ precision: 0 }}
            width="sm"
            rules={[{ required: true, message: '藏品数量不能小于1' }]}
          />
        </Space>

        <ProFormDateTimePicker
          name="saleTime"
          label="发售时间"
          width="md"
          rules={[{ required: true, message: '藏品发售时间不能为空' }]}
        />

        <ProFormSwitch
          name="canBook"
          label="是否开启预约"
          fieldProps={{
            checkedChildren: '开启',
            unCheckedChildren: '关闭'
          }}
          initialValue={false}
          rules={[{ required: true, message: '藏品是否预约不能为空' }]}
        />

        {/* Dependent fields: Show DatePickers only if canBook is true */}
        <ProFormDateTimePicker
          name="bookStartTime"
          label="预约开始时间"
          width="md"
          dependencies={['canBook']}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!getFieldValue('canBook') || value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('预约开始时间不能为空'));
              },
            }),
          ]}
        />
        <ProFormDateTimePicker
          name="bookEndTime"
          label="预约结束时间"
          width="md"
          dependencies={['canBook']}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!getFieldValue('canBook') || value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('预约结束时间不能为空'));
              },
            }),
          ]}
        />

      </ModalForm>
    </>
  );
};
