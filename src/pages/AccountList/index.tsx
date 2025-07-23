import DelButton from '@/pages/AccountList/components/button/DelButton';
import SyncButton from '@/pages/AccountList/components/button/SyncButton';
import AddContent from '@/pages/AccountList/components/contents/AddContent';
import CfContent from '@/pages/AccountList/components/contents/CfContent';
import MoreContent from '@/pages/AccountList/components/contents/MoreContent';
import ReconnectContent from '@/pages/AccountList/components/contents/ReconnectContent';
import UpdateContent from '@/pages/AccountList/components/contents/UpdateContent';
import {
  createAccount,
  loginAccountGetToken,
  queryAccounts,
  update,
  updateAndReconnect,
} from '@/services/mj/api';
import {
  ClockCircleOutlined,
  CrownTwoTone,
  EditOutlined,
  HeartTwoTone,
  LockOutlined,
  LoginOutlined,
  RocketTwoTone,
  SyncOutlined,
  ToolOutlined,
  UnlockOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Card, Form, Modal, notification, Space, Tag, Tooltip } from 'antd';
import { ColumnType } from 'antd/lib/table';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';

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

  const actionRef = useRef();

  // const [data, setData] = useState([]);
  // const [loading, setLoading] = useState(false);

  // const fetchData = async () => {
  //   // setLoading(true);
  //   // actionRef.current?.reload();
  //   // const res = await queryAccount();
  //   // setData(res);
  //   // setLoading(false);
  // };

  const hideModal = () => {
    setModalContent(<></>);
    setModalVisible(false);
    setModalReadonly(false);
  };

  const openModal = (title: string, content: any, modalWidth: number) => {
    form.resetFields();
    setTitle(title);
    setModalContent(content);
    setModalWidth(modalWidth);
    setModalVisible(true);
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
    // fetchData();
    actionRef.current?.reload();
  };

  const handleAdd = async (values: Record<any, any>) => {
    try {
      // 判断如果 subChannels 为空，则设置为空数组
      if (!values.subChannels) {
        values.subChannels = [];
      }

      // 如果是字符串，则转换为数组
      if (typeof values.subChannels === 'string') {
        values.subChannels = values.subChannels.split('\n');
      }

      setModalSubmitLoading(true);
      const res = await createAccount(values);

      // console.log('res', res);
      if (res.success) {
        // 添加成功后，将值保存到缓存中，方便下次自动填充
        // 清空 values 的 id、subChannels、remark、channelId、privateChannelId、nijiBotChannelId、guildId
        // 采用合并的方式，清楚上述字段，其他字段保留
        const prev = {
          ...values,
          id: '',
          userToken: '',
          botToken: '',
          subChannels: [],
          remark: '',
          channelId: '',
          privateChannelId: '',
          nijiBotChannelId: '',
          guildId: '',
          loginAccount: '',
          loginPassword: '',
          login2fa: '',
        };
        localStorage.setItem('account_cache', JSON.stringify(prev));

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
      }
    } finally {
      setModalSubmitLoading(false);
    }
  };

  // 登录并获取 token
  const handleLogin = async (values: Record<any, any>) => {
    try {
      // 验证账号、密码、2fa
      if (!values.loginAccount || !values.loginPassword || !values.login2fa) {
        api.error({
          message: 'error',
          description: intl.formatMessage({ id: 'pages.account.loginAccountGetTokenError' }),
        });
        return;
      }

      const res = await loginAccountGetToken(values.id);
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
      }
    } finally {
    }
  };

  const handleReconnect = async (values: Record<any, any>) => {
    // 判断如果 subChannels 为空，则设置为空数组
    if (!values.subChannels) {
      values.subChannels = [];
    }

    try {
      // 如果是字符串，则转换为数组
      if (typeof values.subChannels === 'string') {
        values.subChannels = values.subChannels.split('\n');
      }

      setModalSubmitLoading(true);
      const res = await updateAndReconnect(values.id, values);
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
      }
    } finally {
      setModalSubmitLoading(false);
    }
  };

  const handleUpdate = async (values: Record<any, any>) => {
    try {
      // 判断如果 subChannels 为空，则设置为空数组
      if (!values.subChannels) {
        values.subChannels = [];
      }

      // 如果是字符串，则转换为数组
      if (typeof values.subChannels === 'string') {
        values.subChannels = values.subChannels.split('\n');
      }

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
    } finally {
      setModalSubmitLoading(false);
    }
  };

  const handleCfOk = async () => {
    try {
      setModalSubmitLoading(true);
      hideModal();
      triggerRefreshAccount();
    } finally {
      setModalSubmitLoading(false);
    }
  };

  const columns = [
    {
      title: intl.formatMessage({ id: 'pages.account.guildId' }),
      dataIndex: 'guildId',
      width: 200,
      align: 'center',
      sorter: true,
      render: (text: string, record: Record<string, any>) =>
        record.isYouChuan || record.isOfficial ? (
          <> {text}</>
        ) : (
          <>
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
          </>
        ),
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.channelId' }),
      dataIndex: 'channelId',
      align: 'center',
      width: 200,
      sorter: true,
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
      sorter: true,
      request: async () => [
        {
          label: intl.formatMessage({ id: 'pages.enable' }),
          value: true,
        },
        {
          label: intl.formatMessage({ id: 'pages.disable' }),
          value: false,
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

            {record.isAutoLogining && (
              <Tag color="orange">{intl.formatMessage({ id: 'pages.account.isAutoLogining' })}</Tag>
            )}

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
      width: 180,
      hideInSearch: true,
      align: 'center',
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.relaxTimeRemaining' }),
      dataIndex: 'relaxTimeRemaining',
      ellipsis: true,
      width: 180,
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
      title: intl.formatMessage({ id: 'pages.account.allowModes' }),
      dataIndex: 'allowModes',
      align: 'center',
      width: 160,
      hideInSearch: true,
      render: (text, record) => {
        return record.allowModes?.join('、') || 'ALL';
      },
    } as ColumnType<Record<string, any>>,

    {
      title: `${intl.formatMessage({ id: 'pages.account.todayDraw' })}`,
      dataIndex: 'todayDraw',
      width: 200,
      align: 'center',
      render: (enable: boolean, record: any) => {
        if (!record.todayDraw || record.todayDraw === '0 / 0 / 0') {
          return '-';
        }
        return (
          <>
            <Tooltip
              placement="top"
              overlayInnerStyle={{ width: 'max-content' }}
              title={Object.entries(record.todayCounter).map(([mode, actions]) => (
                <div key={mode} style={{ marginBottom: 4 }}>
                  <div style={{ fontWeight: 'bold' }}>{mode}</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Object.entries(actions as any).map(([action, count]) => (
                      <div
                        key={action}
                        style={{
                          border: '1px dashed #cfc7c7',
                          borderRadius: 4,
                          padding: '4px',
                        }}
                      >
                        <div style={{ fontSize: 14 }}>{action}</div>
                        <div style={{ fontSize: 14 }}>{count as any}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            >
              {record.todayDraw}
            </Tooltip>
          </>
        );
      },
    } as ColumnType<Record<string, any>>,

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
      sorter: true,
      // 赞助商 - 富文本
      render: (text: string, record: Record<string, any>) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {record.sponsorUserId && (
            <HeartTwoTone twoToneColor="#eb2f96" style={{ marginRight: 2 }} />
          )}

          <div dangerouslySetInnerHTML={{ __html: record.sponsor || '-' }} />
        </div>
      ),
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.remark' }),
      dataIndex: 'remark',
      ellipsis: true,
      sorter: true,
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
      title: intl.formatMessage({ id: 'pages.account.dateCreated' }),
      dataIndex: 'dateCreated',
      ellipsis: true,
      width: 140,
      sorter: true,
      hideInSearch: true,
      renderText: (text: string, record: Record<string, any>) =>
        moment(text).format('YYYY-MM-DD HH:mm'),
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.operation' }),
      dataIndex: 'operation',
      width: 220,
      key: 'operation',
      fixed: 'right',
      align: 'center',
      hideInSearch: true,
      render: (value: any, record: Record<string, any>) => {
        return (
          <Space>
            {record.isYouChuan === true || record.isOfficial === true ? (
              <>
                <Tooltip title={intl.formatMessage({ id: 'pages.account.updateAndReconnect' })}>
                  <Button
                    key="EditAndReconnect"
                    type={'primary'}
                    icon={<ToolOutlined />}
                    onClick={() => {
                      // 传一个随机数，保证每次都渲染

                      openModal(
                        intl.formatMessage({ id: 'pages.account.updateAndReconnect' }),
                        <ReconnectContent
                          r={Math.random()}
                          form={form}
                          record={record}
                          onSubmit={handleReconnect}
                        />,
                        1600,
                      );
                    }}
                  />
                </Tooltip>
              </>
            ) : (
              <>
                {' '}
                <Tooltip title={intl.formatMessage({ id: 'pages.account.loginAccountGetToken' })}>
                  <Button
                    key="login"
                    icon={<LoginOutlined />}
                    type={'dashed'}
                    onClick={() => handleLogin(record)}
                  />
                </Tooltip>
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
                    onClick={() => {
                      // 传一个随机数，保证每次都渲染

                      openModal(
                        intl.formatMessage({ id: 'pages.account.updateAndReconnect' }),
                        <ReconnectContent
                          r={Math.random()}
                          form={form}
                          record={record}
                          onSubmit={handleReconnect}
                        />,
                        1600,
                      );
                    }}
                  />
                </Tooltip>
                <Button
                  key="Update"
                  icon={<EditOutlined />}
                  onClick={() =>
                    openModal(
                      intl.formatMessage({ id: 'pages.account.update' }),
                      <UpdateContent
                        r={Math.random()}
                        form={form}
                        record={record}
                        onSubmit={handleUpdate}
                      />,
                      1000,
                    )
                  }
                />
              </>
            )}

            <DelButton record={record} onSuccess={triggerRefreshAccount} />
          </Space>
        );
      },
    } as ColumnType<Record<string, any>>,
  ];

  useEffect(() => {
    // fetchData();
  }, []);

  return (
    <PageContainer>
      {contextHolder}
      <Card>
        {/* <div
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
                1600,
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
        </div> */}

        {/* <Table
          scroll={{ x: 1000 }}
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
        /> */}

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
              key="official"
              type={'dashed'}
              icon={<CrownTwoTone />}
              onClick={() => {
                openModal(
                  intl.formatMessage({ id: 'pages.account.officialAccountTitle' }),
                  <AddContent
                    r={Math.random()}
                    form={form}
                    onSubmit={(values) => handleAdd({ ...values, isOfficial: true })}
                    isOfficial
                  />,
                  1600,
                );
              }}
            >
              {intl.formatMessage({ id: 'pages.account.officialAccount' })}
            </Button>,

            <Button
              key="youchuan"
              type={'dashed'}
              icon={<RocketTwoTone twoToneColor="#52c41a" />}
              onClick={() => {
                openModal(
                  intl.formatMessage({ id: 'pages.account.youchuanAccountTitle' }),
                  <AddContent
                    r={Math.random()}
                    form={form}
                    onSubmit={(values) => handleAdd({ ...values, isYouChuan: true })}
                    isYouChuan
                  />,
                  1600,
                );
              }}
            >
              {intl.formatMessage({ id: 'pages.account.youchuanAccount' })}
            </Button>,

            <Button
              key="sponsor"
              type={'dashed'}
              icon={<HeartTwoTone twoToneColor="#eb2f96" />}
              onClick={() => {
                openModal(
                  intl.formatMessage({ id: 'pages.account.sponsorAccountTitle' }),
                  <AddContent
                    r={Math.random()}
                    form={form}
                    onSubmit={(values) => handleAdd({ ...values, isSponsor: true })}
                  />,
                  1600,
                );
              }}
            >
              {intl.formatMessage({ id: 'pages.account.sponsorAccount' })}
            </Button>,

            <Button
              key="primary"
              type={'primary'}
              icon={<UserAddOutlined />}
              onClick={() => {
                openModal(
                  intl.formatMessage({ id: 'pages.account.add' }),
                  <AddContent r={Math.random()} form={form} onSubmit={handleAdd} />,
                  1600,
                );
              }}
            >
              {intl.formatMessage({ id: 'pages.add' })}
            </Button>,
          ]}
          request={async (params, sort) => {
            const kys = Object.keys(sort);
            // console.log('params', params, sort, kys.length > 0 ? sort[kys[0]] : '');
            const res = await queryAccounts(
              { ...params, pageNumber: params.current! - 1 },
              kys.length > 0 ? kys[0] : '',
              (kys.length > 0 ? sort[kys[0]] : '') == 'descend',
            );
            return {
              data: res.list,
              total: res.pagination.total,
              success: true,
            };
          }}
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
