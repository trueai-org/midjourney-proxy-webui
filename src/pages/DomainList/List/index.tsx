import MyModal from '@/pages/components/Modal';
import AddContent from '@/pages/DomainList/components/AddContent';
import { createDomain, deleteDomain, queryDomain } from '@/services/mj/api';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Card, Form, notification, Popconfirm, Space, Switch } from 'antd';
import React, { useRef, useState } from 'react';

const UserList: React.FC = () => {
  // 初始化 dataSource 状态为空数组
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [title, setTitle] = useState<string>('');
  const [footer, setFooter] = useState({});
  const [modalWidth, setModalWidth] = useState(1000);
  const [form] = Form.useForm();
  const intl = useIntl();

  const [api, contextHolder] = notification.useNotification();

  const actionRef = useRef();

  const hideModal = () => {
    setModalContent({});
    setFooter({});
    setModalVisible(false);
  };
  const [modalSubmitLoading, setModalSubmitLoading] = useState(false);
  const modalFooter = (
    <>
      <Button key="back" onClick={hideModal}>
        {intl.formatMessage({ id: 'pages.cancel' })}
      </Button>
      <Button
        key="submit"
        type="primary"
        loading={modalSubmitLoading}
        onClick={() => form.submit()}
      >
        {intl.formatMessage({ id: 'pages.submit' })}
      </Button>
    </>
  );

  const handleAdd = async (values: Record<any, any>) => {
    setModalSubmitLoading(true);

    // 判断如果 keywords 为空，则设置为空数组
    if (!values.keywords) {
      values.keywords = [];
    }
    
    // 如果是字符串，则转换为数组
    if (typeof values.keywords === 'string') {
      values.keywords = values.keywords.split(',');
    }

    const res = await createDomain(values);
    if (res.success) {
      api.success({
        message: 'success',
        description: res.message,
      });
      hideModal();
      actionRef.current?.reload();
    } else {
      api.error({
        message: 'error',
        description: res.message,
      });
    }
    setModalSubmitLoading(false);
  };

  const openModal = (title: string, content: any, footer: any, modalWidth: number) => {
    form.resetFields();
    setTitle(title);
    setModalContent(content);
    setFooter(footer);
    setModalWidth(modalWidth);
    setModalVisible(true);
  };

  const onDelete = async (id: string) => {
    try {
      const res = await deleteDomain(id);
      if (res.success) {
        api.success({
          message: 'success',
          description: intl.formatMessage({ id: 'pages.task.deleteSuccess' }),
        });
        actionRef.current?.reload();
      } else {
        api.error({
          message: 'error',
          description: res.message,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  const columns = [
    {
      title: intl.formatMessage({ id: 'pages.domain.name' }),
      dataIndex: 'name',
      width: 160,
      align: 'left',
      fixed: 'left',
    },
    {
      title: intl.formatMessage({ id: 'pages.domain.description' }),
      dataIndex: 'description',
      width: 160,
      align: 'left',
    },
    {
      title: intl.formatMessage({ id: 'pages.domain.keywords' }),
      dataIndex: 'keywords',
      width: 120,
      align: 'left',
      // 弹出显示纯文本
      render: (text, record) => {
        return <span>{record?.keywords.length || '0'} {intl.formatMessage({ id: 'pages.domain.keywords' })}</span>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.domain.enable' }),
      dataIndex: 'enable',
      width: 80,
      showInfo: false,
      hideInSearch: true,
      align: 'left',
      render: (text, record) => {
        return <Switch disabled checked={record.enable} />;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.domain.weight' }),
      dataIndex: 'weight',
      width: 80,
      align: 'left',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.domain.createTime' }),
      dataIndex: 'createTimeFormat',
      width: 140,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.domain.updateTime' }),
      dataIndex: 'updateTimeFormat',
      width: 140,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.operation' }),
      dataIndex: 'operation',
      width: 140,
      key: 'operation',
      fixed: 'right',
      align: 'center',
      hideInSearch: true,
      render: (_, record) => {
        return (
          <Space>
            <Button
              key="Update"
              icon={<EditOutlined />}
              onClick={() =>
                openModal(
                  intl.formatMessage({ id: 'pages.domain.update' }),
                  <AddContent form={form} record={record} onSubmit={handleAdd} />,
                  modalFooter,
                  1000,
                )
              }
            />
            <Popconfirm
              title={intl.formatMessage({ id: 'pages.domain.delete' })}
              description={intl.formatMessage({ id: 'pages.domain.deleteTitle' })}
              onConfirm={() => onDelete(record.id)}
            >
              <Button danger icon={<DeleteOutlined />}></Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer>
      {contextHolder}
      <Card>
        <ProTable
          columns={columns}
          scroll={{ x: 1000 }}
          search={{ defaultCollapsed: true }}
          pagination={{
            pageSize: 10,
            showQuickJumper: false,
            showSizeChanger: false,
          }}
          rowKey="id"
          actionRef={actionRef}
          toolBarRender={() => [
            <Button
              key="primary"
              type={'primary'}
              icon={<PlusOutlined />}
              onClick={() =>
                openModal(
                  intl.formatMessage({ id: 'pages.domain.add' }),
                  <AddContent form={form} record={{}} onSubmit={handleAdd} />,
                  modalFooter,
                  1000,
                )
              }
            >
              {intl.formatMessage({ id: 'pages.add' })}
            </Button>,
          ]}
          request={async (params) => {
            // 如果 params.keywords 是 string 转为 array
            if (params.keywords) {
              if (typeof params.keywords === 'string') {
                params.keywords = params.keywords.split(',');
              }
            }
            const res = await queryDomain({ ...params, pageNumber: params.current! - 1 });
            return {
              data: res.list,
              total: res.pagination.total,
              success: true,
            };
          }}
        />
      </Card>
      <MyModal
        title={title}
        modalVisible={modalVisible}
        hideModal={hideModal}
        modalContent={modalContent}
        footer={footer}
        modalWidth={modalWidth}
      ></MyModal>
    </PageContainer>
  );
};

export default UserList;
