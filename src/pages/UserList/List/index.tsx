import MyModal from '@/pages/components/Modal';
import AddContent from '@/pages/UserList/components/AddContent';
import { createUser, deleteUser, queryUser } from '@/services/mj/api';
import { DeleteOutlined, EditOutlined, UserAddOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Card, Checkbox, Form, notification, Popconfirm, Space, Tag } from 'antd';
import moment from 'moment';
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

  const handleAdd = async (values: Record<string, string>) => {
    setModalSubmitLoading(true);
    const res = await createUser(values);
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
      const res = await deleteUser(id);
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
      title: intl.formatMessage({ id: 'pages.user.name' }),
      dataIndex: 'name',
      width: 140,
      align: 'center',
      fixed: 'left',
    },
    {
      title: intl.formatMessage({ id: 'pages.user.email' }),
      dataIndex: 'email',
      width: 140,
      align: 'center',
    },
    {
      title: intl.formatMessage({ id: 'pages.user.isWhite' }),
      dataIndex: 'isWhite',
      width: 90,
      align: 'center',
      render: (text) => {
        return <Checkbox checked={text} disabled />;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.user.status' }),
      dataIndex: 'status',
      width: 90,
      align: 'center',
      request: async () => [
        {
          label: intl.formatMessage({ id: 'pages.user.normal' }),
          value: 'NORMAL',
        },
        {
          label: intl.formatMessage({ id: 'pages.user.disabled' }),
          value: 'DISABLED',
        },
      ],
      render: (text, record) => {
        let color = 'default';
        if (text == 'NORMAL') {
          color = 'default';
        } else if (text == 'DISABLED') {
          color = 'error';
        }
        return <Tag color={color}>{record.status}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.user.role' }),
      dataIndex: 'role',
      width: 140,
      showInfo: false,
      align: 'center',
      request: async () => [
        {
          label: intl.formatMessage({ id: 'pages.user.user' }),
          value: 'USER',
        },
        {
          label: intl.formatMessage({ id: 'pages.user.admin' }),
          value: 'ADMIN',
        },
      ],
      render: (text, record) => {
        let color = 'default';
        if (text == 'USER') {
          color = 'default';
        } else if (text == 'ADMIN') {
          color = 'success';
        }
        return <Tag color={color}>{record.role}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.user.dayDrawLimit' }),
      dataIndex: 'dayDrawLimit',
      width: 140,
      align: 'center',
      hideInSearch: true,
      render: (text, record) => {
        if (text <= 0) {
          return intl.formatMessage({ id: 'pages.user.unlimited' });
        } else {
          return text;
        }
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.user.totalDrawLimit' }),
      dataIndex: 'totalDrawLimit',
      width: 140,
      align: 'center',
      hideInSearch: true,
      render: (text, record) => {
        if (text <= 0) {
          return intl.formatMessage({ id: 'pages.user.unlimited' });
        } else {
          return text;
        }
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.user.dayDrawCount' }),
      dataIndex: 'dayDrawCount',
      width: 140,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.user.totalDrawCount' }),
      dataIndex: 'totalDrawCount',
      width: 140,
      ellipsis: true,
      hideInSearch: true,
    },
    // {
    //   title: intl.formatMessage({ id: 'pages.user.lastLoginIp' }),
    //   dataIndex: 'lastLoginIp',
    //   width: 140,
    //   ellipsis: true,
    //   hideInSearch: true,
    // },
    // {
    //   title: intl.formatMessage({ id: 'pages.user.lastLoginTime' }),
    //   dataIndex: 'lastLoginTimeFormat',
    //   width: 140,
    //   ellipsis: true,
    //   hideInSearch: true,
    // },
    // {
    //   title: intl.formatMessage({ id: 'pages.user.registerIp' }),
    //   dataIndex: 'registerIp',
    //   width: 140,
    //   ellipsis: true,
    //   hideInSearch: true,
    // },
    // {
    //   title: intl.formatMessage({ id: 'pages.user.registerTime' }),
    //   dataIndex: 'registerTimeFormat',
    //   width: 140,
    //   ellipsis: true,
    //   hideInSearch: true,
    // },
    {
      title: intl.formatMessage({ id: 'pages.operation' }),
      dataIndex: 'operation',
      width: 140,
      key: 'operation',
      fixed: 'right',
      align: 'center',
      hideInSearch: true,
      render: (_, record: any) => {
        if (record.validStartTime) {
          record.validStartTime = moment(record.validStartTimeFormat, 'YYYY-MM-DD');
        }
        if (record.validEndTime) {
          record.validEndTime = moment(record.validEndTimeFormat, 'YYYY-MM-DD');
        }

        return (
          <Space>
            <Button
              key="Update"
              icon={<EditOutlined />}
              onClick={() =>
                openModal(
                  intl.formatMessage({ id: 'pages.user.update' }),
                  <AddContent form={form} record={record} onSubmit={handleAdd} />,
                  modalFooter,
                  1000,
                )
              }
            />
            <Popconfirm
              title={intl.formatMessage({ id: 'pages.user.delete' })}
              description={intl.formatMessage({ id: 'pages.user.deleteTitle' })}
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
              icon={<UserAddOutlined />}
              onClick={() =>
                openModal(
                  intl.formatMessage({ id: 'pages.user.add' }),
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
            const res = await queryUser({ ...params, pageNumber: params.current! - 1 });
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
