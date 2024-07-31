import DelButton from '@/pages/AccountList/components/button/DelButton';
import SyncButton from '@/pages/AccountList/components/button/SyncButton';
import AddContent from '@/pages/AccountList/components/contents/AddContent';
import CfContent from '@/pages/AccountList/components/contents/CfContent';
import MoreContent from '@/pages/AccountList/components/contents/MoreContent';
import ReconnectContent from '@/pages/AccountList/components/contents/ReconnectContent';
import UpdateContent from '@/pages/AccountList/components/contents/UpdateContent';
import { createAccount, queryAccount, update, updateAndReconnect } from '@/services/mj/api';
import {
  ClockCircleOutlined,
  EditOutlined,
  LockOutlined,
  SyncOutlined,
  ToolOutlined,
  UnlockOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Card, Form, Modal, notification, Space, Table, Tag, Tooltip } from 'antd';
import { ColumnType } from 'antd/lib/table';
import React, { useEffect, useState } from 'react';

const AccountList: React.FC = () => {
  // 初始化 dataSource 状态为空数组
  const [modalVisible, setModalVisible] = useState(false);
  const [modalReadonly, setModalReadonly] = useState(false);
  const [modalContent, setModalContent] = useState(<></>);
  const [title, setTitle] = useState<string>('');
  const [modalWidth, setModalWidth] = useState(1000);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [modalSubmitLoading, setModalSubmitLoading] = useState(false);

  const intl = useIntl();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await queryAccount();
    setData(res);
    setLoading(false);
  };

  const openModal = (title: string, content: any, modalWidth: number) => {
    form.resetFields();
    setTitle(title);
    setModalContent(content);
    setModalWidth(modalWidth);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalContent(<></>);
    setModalVisible(false);
    setModalReadonly(false);
  };

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

  // 定义一个 triggerRefresh 函数，使其增加 refresh 的值，从而触发重新渲染
  const triggerRefreshAccount = () => {
    hideModal();
    fetchData();
  };

  const handleAdd = async (values: Record<string, string>) => {
    setModalSubmitLoading(true);
    const res = await createAccount(values);
    if (res.success) {
      api.success({
        message: 'success',
        description: res.message,
      });
      hideModal();
      triggerRefreshAccount();
    } else {
      api.error({
        message: 'error',
        description: res.message,
      });
      triggerRefreshAccount();
    }
    setModalSubmitLoading(false);
  };

  const handleReconnect = async (values: Record<string, string>) => {
    setModalSubmitLoading(true);
    const res = await updateAndReconnect(values.id, values);
    if (res.success) {
      api.success({
        message: 'success',
        description: res.message,
      });
    } else {
      api.error({
        message: 'error',
        description: res.message,
      });
    }
    hideModal();
    triggerRefreshAccount();
    setModalSubmitLoading(false);
  };

  const handleUpdate = async (values: Record<string, string>) => {
    setModalSubmitLoading(true);
    const res = await update(values.id, values);
    if (res.success) {
      api.success({
        message: 'success',
        description: res.message,
      });
    } else {
      api.error({
        message: 'error',
        description: res.message,
      });
    }
    hideModal();
    triggerRefreshAccount();
    setModalSubmitLoading(false);
  };

  const handleCfOk = async () => {
    setModalSubmitLoading(true);
    hideModal();
    triggerRefreshAccount();
    setModalSubmitLoading(false);
  };

  const columns = [
    {
      title: intl.formatMessage({ id: 'pages.account.guildId' }),
      dataIndex: 'guildId',
      width: 200,
      align: 'center',
      render: (text: string, record: Record<string, any>) => (
        <a
          onClick={() => {
            setModalReadonly(true);
            openModal(
              intl.formatMessage({ id: 'pages.account.info' }) + ' - ' + record.id,
              <MoreContent record={record} onSuccess={triggerRefreshAccount} />,
              1100,
            );
          }}
        >
          {text}
        </a>
      ),
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.channelId' }),
      dataIndex: 'channelId',
      align: 'center',
      width: 200,
    } as ColumnType<Record<string, any>>,
    // {
    //   title: intl.formatMessage({ id: 'pages.account.username' }),
    //   dataIndex: 'name',
    //   width: 120,
    //   ellipsis: true,
    // } as ColumnType<Record<string, any>>,
    {
      title: `${intl.formatMessage({ id: 'pages.account.status' })}`,
      dataIndex: 'enable',
      width: 200,
      align: 'center',
      request: async () => [
        {
          label: intl.formatMessage({ id: 'pages.enable' }),
          value: 'true',
        },
        {
          label: intl.formatMessage({ id: 'pages.disable' }),
          value: 'false',
        },
      ],
      render: (enable: boolean, record) => {
        let color = enable ? 'green' : 'volcano';
        let text = enable
          ? intl.formatMessage({ id: 'pages.enable' })
          : intl.formatMessage({ id: 'pages.disable' });
        return (
          <>
            <Tag color={color}>{text}</Tag>

            {record.lock && (
              <Tag icon={<LockOutlined />} color="warning">
                <Tooltip title={intl.formatMessage({ id: 'pages.account.lockmsg' })}>
                  {intl.formatMessage({ id: 'pages.account.lock' })}
                </Tooltip>
              </Tag>
            )}

            {enable && !record.running && !record.lock && (
              <Tag icon={<SyncOutlined />} color="error">
                {intl.formatMessage({ id: 'pages.account.notRunning' })}
              </Tag>
            )}

            {record?.runningCount > 0 && (
              <Tag icon={<SyncOutlined spin />} color="cyan">
                <Tooltip
                  title={
                    intl.formatMessage({ id: 'pages.account.runningCount' }) +
                    ' ' +
                    record.runningCount
                  }
                >
                  {record?.runningCount || 0}
                </Tooltip>
              </Tag>
            )}

            {record?.queueCount > 0 && (
              <Tag icon={<ClockCircleOutlined />} color="processing">
                <Tooltip
                  title={
                    intl.formatMessage({ id: 'pages.account.queueCount' }) + ' ' + record.queueCount
                  }
                >
                  {record.queueCount || 0}
                </Tooltip>
              </Tag>
            )}
          </>
        );
      },
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.fastTimeRemaining' }),
      dataIndex: 'fastTimeRemaining',
      ellipsis: true,
      width: 200,
      hideInSearch: true,
      align: 'center',
    } as ColumnType<Record<string, any>>,
    // {
    //   title: intl.formatMessage({ id: 'pages.account.subscribePlan' }),
    //   dataIndex: 'subscribePlan',
    //   width: 120,
    //   align: 'center',
    //   request: async () => [
    //     {
    //       label: 'Basic',
    //       value: 'BASIC',
    //     },
    //     {
    //       label: 'Standard',
    //       value: 'STANDARD',
    //     },
    //     {
    //       label: 'Pro',
    //       value: 'PRO',
    //     },
    //     {
    //       label: 'Mega',
    //       value: 'MEGA',
    //     },
    //   ],
    //   render: (text: string, record: Record<string, any>) => record['displays']['subscribePlan'],
    // } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.renewDate' }),
      dataIndex: 'renewDate',
      align: 'center',
      width: 160,
      hideInSearch: true,
      render: (text, record) => record['displays']['renewDate'],
    } as ColumnType<Record<string, any>>,
    // {
    //   title: intl.formatMessage({ id: 'pages.account.mjMode' }),
    //   dataIndex: 'mode',
    //   width: 120,
    //   align: 'center',
    //   hideInSearch: true,
    //   render: (text: string, record: Record<string, any>) => record['displays']['mode'],
    // } as ColumnType<Record<string, any>>,
    // {
    //   title: intl.formatMessage({ id: 'pages.account.nijiMode' }),
    //   dataIndex: 'nijiMode',
    //   width: 120,
    //   align: 'center',
    //   hideInSearch: true,
    //   render: (text: string, record: Record<string, any>) => record['displays']['nijiMode'],
    // } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.sponsor' }),
      dataIndex: 'sponsor',
      ellipsis: true,
      width: 100,
      // 赞助商 - 富文本
      render: (text: string, record: Record<string, any>) => (
        <div dangerouslySetInnerHTML={{ __html: record.sponsor || '-' }} />
      ),
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.remark' }),
      dataIndex: 'remark',
      ellipsis: true,
      width: 150,
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.disabledReason' }),
      dataIndex: 'disabledReason',
      ellipsis: true,
      width: 150,
      hideInSearch: true,
      // renderText: (text: string, record: Record<string, any>) =>
      // record['properties']['disabledReason'],
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.operation' }),
      dataIndex: 'operation',
      width: 220,
      key: 'operation',
      fixed: 'right',
      align: 'center',
      hideInSearch: true,
      render: (value: any, record: Record<string, string>) => {
        return (
          <Space>
            {record.lock && (
              <Button
                key="Lock"
                icon={<UnlockOutlined />}
                type={'dashed'}
                onClick={() =>
                  openModal(
                    intl.formatMessage({ id: 'pages.account.cfmodal' }),
                    <CfContent form={form} record={record} onSubmit={handleCfOk} />,
                    1000,
                  )
                }
              />
            )}

            <SyncButton record={record} onSuccess={triggerRefreshAccount} />
            <Tooltip title={intl.formatMessage({ id: 'pages.account.updateAndReconnect' })}>
              <Button
                key="EditAndReconnect"
                type={'primary'}
                icon={<ToolOutlined />}
                onClick={() =>
                  openModal(
                    intl.formatMessage({ id: 'pages.account.updateAndReconnect' }),
                    <ReconnectContent form={form} record={record} onSubmit={handleReconnect} />,
                    1000,
                  )
                }
              />
            </Tooltip>
            <Button
              key="Update"
              icon={<EditOutlined />}
              onClick={() =>
                openModal(
                  intl.formatMessage({ id: 'pages.account.update' }),
                  <UpdateContent form={form} record={record} onSubmit={handleUpdate} />,
                  1000,
                )
              }
            />
            <DelButton record={record} onSuccess={triggerRefreshAccount} />
          </Space>
        );
      },
    } as ColumnType<Record<string, any>>,
  ];

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageContainer>
      {contextHolder}
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 16,
          }}
        >
          <Button
            key="primary"
            type={'primary'}
            icon={<UserAddOutlined />}
            onClick={() => {
              openModal(
                intl.formatMessage({ id: 'pages.account.add' }),
                <AddContent form={form} onSubmit={handleAdd} />,
                1000,
              );
            }}
          >
            {intl.formatMessage({ id: 'pages.add' })}
          </Button>

          <Button
            type={'default'}
            style={{ marginLeft: 8 }}
            icon={<SyncOutlined />}
            onClick={() => {
              triggerRefreshAccount();
            }}
          ></Button>
        </div>

        <Table
          scroll={{ x: 1000 }}
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
        />
      </Card>
      <Modal
        title={title}
        open={modalVisible}
        onCancel={hideModal}
        footer={modalReadonly ? null : modalFooter}
        width={modalWidth}
      >
        {modalContent}
      </Modal>
    </PageContainer>
  );
};

export default AccountList;
