
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DatabaseOutlined,
  MoneyCollectOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Image, Space, Tag, message, Modal, Typography, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import { getNFTList, addNFT, removeNFT, updateNFT, updateNFTInventory, updateNFTPrice } from '@/services/api/nft';

const classifyOptions = [
  { label: '艺术类', value: '艺术类' },
  { label: '文博类', value: '文博类' },
  { label: '景区类', value: '景区类' },
];

const classifyValueEnum = {
  艺术类: { text: '艺术类' },
  文博类: { text: '文博类' },
  景区类: { text: '景区类' },
};

export type Artwork = {
  id: number;
  name: string;
  cover: string;
  class_id: string;
  classify: string;
  source: string;
  price: number;
  quantity: number; // Total quantity issued
  description: string;
  saleableInventory: number;
  frozenInventory: number;
  state: 'PENDING' | 'SUCCESS' | 'ARCHIVED';
  saleTime: string;
  syncChainTime?: string;
  createdAt: string;
  updatedAt: string;
};

export default () => {
  const actionRef = useRef<ActionType>(null);
  const formRef = useRef<ProFormInstance<any> | null>(null);
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [currentDetail, setCurrentDetail] = useState<Artwork | null>(null);
  const [editPriceModalVisible, setEditPriceModalVisible] = useState<boolean>(false);
  const [editStockModalVisible, setEditStockModalVisible] = useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<Artwork | null>(null);

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
    },
    {
      title: '分类',
      dataIndex: 'classify',
      valueType: 'select',
      valueEnum: classifyValueEnum,
      render: (_, record) => (record.classify ? <Tag color="blue">{record.classify}</Tag> : <Tag>未分类</Tag>),
    },
    {
      title: '来源',
      dataIndex: 'source',
      ellipsis: true,
    },

    {
      title: '价格',
      dataIndex: 'price',
      valueType: 'money',
      search: false,
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
      search: false,
      sorter: (a, b) => new Date(a.saleTime).getTime() - new Date(b.saleTime).getTime(),
    },
    {
      title: '上链时间',
      dataIndex: 'syncChainTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) =>
        record.state === 'ARCHIVED'
          ? []
          : [
        <Button
          key="editPrice"
          size="small"
          color="primary"
          variant="solid"
          icon={<MoneyCollectOutlined />}
          onClick={() => {
            setCurrentRecord(record);
            setEditPriceModalVisible(true);
          }}
        />,
        <Button
          key="editStock"
          size="small"
          color="default"
          variant="outlined"
          icon={<DatabaseOutlined />}
          onClick={() => {
            setCurrentRecord(record);
            setEditStockModalVisible(true);
          }}
        />,
        <Popconfirm
          key="delete"
          title="下架确认"
          description="您确定要下架这个藏品吗？此操作无法恢复。"
          onConfirm={async () => {
            const success = await removeNFT(record.id);
            if (success) {
              message.success('下架成功');
              action?.reload();
            }
          }}
          okText="确定"
          cancelText="取消"
        >
          <Button
            size="small"
            color="danger"
            variant="solid"
            icon={<DeleteOutlined />}
          />
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
          const APIParams = {
            current: params.current,
            size: params.pageSize,
            name: params.name,
            classify: params.classify,
            state: params.state,
          };
          const msg = await getNFTList(APIParams);
          console.log(msg.data);
          return {
            data: msg.data,
            success: true,
            total: msg.total,
          };
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
        formRef={formRef}
        dateFormatter="string"
        modalProps={{
          destroyOnClose: true,
        }}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          console.log('Submitted values:', value);

          const cover = value.cover && value.cover[0] ? value.cover[0].response?.data || value.cover[0].response?.url || value.cover[0].thumbUrl || '' : '';

          const submitData = {
            ...value,
            cover
          };

          const success = await addNFT(submitData);
          if (success) {
            message.success('提交成功');
            handleModalVisible(false);
            actionRef.current?.reload();
            formRef.current?.resetFields();
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
            headers: {
              satoken: localStorage.getItem('satoken') || '',
            },
          }}
          action="/admin/nft/upload" // Replace with actual upload API
          rules={[{ required: true, message: '藏品封面不能为空' }]}
        />

        <ProFormTextArea
          name="description"
          label="藏品描述"
          placeholder="请输入藏品描述"
        />

        <ProFormSelect
          name="classify"
          label="藏品分类"
          placeholder="请选择藏品分类"
          options={classifyOptions}
          rules={[{ required: true, message: '藏品分类不能为空' }]}
        />

        <ProFormText
          name="source"
          label="藏品来源"
          placeholder="请输入藏品来源，如某某博物馆、某某景区"
          rules={[{ required: true, message: '藏品来源不能为空' }]}
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

      </ModalForm>

      <ModalForm
        title="修改价格"
        width="400px"
        visible={editPriceModalVisible}
        key={currentRecord?.id ? `price-${currentRecord.id}` : 'price'}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setEditPriceModalVisible(false),
        }}
        initialValues={{
          price: currentRecord?.price,
        }}
        onFinish={async (value) => {
          if (!currentRecord) return false;
          const success = await updateNFTPrice({
            nftId: currentRecord.id,
            id: currentRecord.id,
            price: value.price,
          });
          if (success) {
            message.success('价格修改成功');
            setEditPriceModalVisible(false);
            actionRef.current?.reload();
            return true;
          }
          message.error('价格修改失败');
          return false;
        }}
      >
        <ProFormDigit
          name="price"
          label="价格 (元)"
          placeholder="请输入新的价格"
          min={0}
          fieldProps={{ precision: 2 }}
          rules={[{ required: true, message: '价格不能为空' }]}
        />
      </ModalForm>

      <ModalForm
        title="修改库存"
        width="400px"
        visible={editStockModalVisible}
        key={currentRecord?.id ? `stock-${currentRecord.id}` : 'stock'}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setEditStockModalVisible(false),
        }}
        initialValues={{
          quantity: currentRecord?.quantity,
        }}
        onFinish={async (value) => {
          if (!currentRecord) return false;
          const success = await updateNFTInventory({
            nftId: currentRecord.id,
            id: currentRecord.id,
            quantity: value.quantity,
          });
          if (success) {
            message.success('库存修改成功');
            setEditStockModalVisible(false);
            actionRef.current?.reload();
            return true;
          }
          message.error('库存修改失败');
          return false;
        }}
      >
        <ProFormDigit
          name="quantity"
          label="发行数量"
          placeholder="请输入新的发行数量"
          min={1}
          fieldProps={{ precision: 0 }}
          rules={[{ required: true, message: '发行数量不能为空' }]}
        />
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
