
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
  ProFormDependency,
  ProTable,
  TableDropdown,
} from '@ant-design/pro-components';
import { Button, Image, Space, Tag, message, Modal, Typography, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import { getNFTList, addNFT, updateNFT, removeNFT } from '@/services/api/nft';

// Define the Artwork type based on the database schema provided
export type Artwork = {
  id: number;
  name: string;
  cover: string;
  class_id: string;
  price: number;
  quantity: number; // Total quantity issued
  description: string;
  saleableInventory: number;
  frozenInventory: number;
  state: 'PENDING' | 'SUCCESS' | 'ARCHIVED';
  saleTime: string;
  syncChainTime?: string;
  bookStartTime?: string;
  bookEndTime?: string;
  canBook: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId?: string;
};

export default () => {
  const actionRef = useRef<ActionType>(null);
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [currentDetail, setCurrentDetail] = useState<Artwork | null>(null);

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
          <Tag color="green">可售: {record.saleableInventory}</Tag>
          <Tag color="gold">冻结: {record.frozenInventory}</Tag>
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
        PENDING: {
          text: '未处理',
          status: 'Processing',
        },
        SUCCESS: {
          text: '上链成功',
          status: 'Success',
        },
        ARCHIVED: {
          text: '已下架',
          status: 'Default',
        },
      },
    },
    {
      title: '发售时间',
      dataIndex: 'saleTime',
      valueType: 'dateTime',
      sorter: (a, b) => new Date(a.saleTime).getTime() - new Date(b.saleTime).getTime(),
    },
    {
      title: '上链时间',
      dataIndex: 'syncChainTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '可否预约',
      dataIndex: 'canBook',
      valueType: 'select',
      valueEnum: {
        true: { text: '是', status: 'Success' },
        false: { text: '否', status: 'Default' },
      },
    },
    {
      title: '预约开始',
      dataIndex: 'bookStartTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '预约结束',
      dataIndex: 'bookEndTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '创建者ID',
      dataIndex: 'creatorId',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
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
        <a
          key="view"
          onClick={() => {
            setCurrentDetail(record);
            setDetailModalVisible(true);
          }}
        >
          查看
        </a>,
        <Popconfirm
          key="delete"
          title="删除确认"
          description="您确定要删除这个藏品吗？此操作无法恢复。"
          onConfirm={async () => {
            const success = await removeNFT(record.id);
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
      <ProTable<Artwork>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          console.log(params, sort, filter);
          const APIParams = {
            current: params.current,
            size: params.pageSize,
            name: params.name,

            state: params.state,
          };
          const msg = await getNFTList(APIParams);
          return {
            data: msg.data,
            success: true,
            total: msg.total,
          };
        }}
        editable={{
          type: 'multiple',
          onSave: async (key, row) => {
            await updateNFT(row);
            message.success('保存成功');
          }
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

          const cover = value.cover && value.cover[0] ? value.cover[0].response?.url || value.cover[0].thumbUrl || '' : '';

          const submitData = {
            ...value,
            cover
          };

          const success = await addNFT(submitData);
          if (success) {
            message.success('提交成功');
            handleModalVisible(false);
            actionRef.current?.reload();
            return true;
          }
          message.error('提交失败');
          return false;
        }}
      >
        <ProFormText
          name="name"
          label="藏品名称"
          placeholder="请输入藏品名称"
          rules={[{ required: true, message: '藏品名称不能为空' }]}
        />

        {/* @ts-ignore */}
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
        <ProFormDependency name={['canBook']}>
          {({ canBook }) => {
            if (!canBook) return null;
            return (
              <>
                <ProFormDateTimePicker
                  name="bookStartTime"
                  label="预约开始时间"
                  width="md"
                  rules={[{ required: true, message: '预约开始时间不能为空' }]}
                />
                <ProFormDateTimePicker
                  name="bookEndTime"
                  label="预约结束时间"
                  width="md"
                  rules={[{ required: true, message: '预约结束时间不能为空' }]}
                />
              </>
            );
          }}
        </ProFormDependency>

      </ModalForm>

      <Modal
        title="商品详情"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
      >
        {currentDetail ? (
          <Typography.Paragraph>
            {currentDetail.description || '暂无描述'}
          </Typography.Paragraph>
        ) : null}
      </Modal>
    </>
  );
};
