import JsonEditor from '@/components/JsonEditor';
import {
  cancelUpdate,
  checkUpdate,
  getConfig,
  migrateAccountAndTasks,
  mongoConnect,
  restart,
  updateConfig,
} from '@/services/mj/api';
import { CloudDownloadOutlined, SaveOutlined, SyncOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import './index.less';

const { Text } = Typography;

const Setting: React.FC = () => {
  const [form] = Form.useForm();

  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<any>(null);

  const [host, setHost] = useState('');
  const [token, setToken] = useState('');

  const onMigrate = async (host: string, token: string) => {
    try {
      setLoading(true);
      const migrationData = {
        Host: host,
        ApiSecret: token,
      };

      const res = await migrateAccountAndTasks(migrationData);
      if (res.success) {
        message.success(intl.formatMessage({ id: 'pages.setting.migrateSuccess' }));
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error(error as string);
    } finally {
      setLoading(false);
    }
  };

  const onMigrateClick = () => {
    if (host) {
      onMigrate(host, token);
    } else {
      message.warning(intl.formatMessage({ id: 'pages.setting.migrateTips' }));
    }
  };

  // ----- 检查更新业务 --------

  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateTimer, setUpdateTimer] = useState<NodeJS.Timeout | null>(null);

  const startUpdateMonitoring = () => {
    if (updateTimer) {
      clearInterval(updateTimer);
    }

    const timer = setInterval(async () => {
      try {
        const cfg = await getConfig();
        if (cfg.success) {
          const result = cfg?.data.upgradeInfo || {};
          setUpgradeInfo(result);

          // 如果下载完成或出错，停止定时器
          if (
            result.status === 'ReadyToRestart' ||
            result.status === 'Failed' ||
            result.status === 'Idle' ||
            result.status === 'Success'
          ) {
            clearInterval(timer);
            setUpdateTimer(null);
          }
        }
      } catch (error) {
        console.error('监控更新状态失败:', error);
      }
    }, 2000); // 每2秒检查一次

    setUpdateTimer(timer);
  };

  // 添加更新检查相关方法
  const checkForUpdates = async () => {
    try {
      setIsCheckingUpdate(true);
      const result = await checkUpdate();

      if (result.success) {
        setUpgradeInfo(result.data);

        // 如果正在下载，启动定时器监控进度
        if (result.data.status === 'Downloading') {
          startUpdateMonitoring();
        }
      } else {
        message.error(result.message || '检查更新失败');
      }
    } catch (error) {
      message.error('检查更新失败');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const onCancelUpdate = async () => {
    try {
      const result = await cancelUpdate();

      if (result.success) {
        message.success('已取消更新');
        if (updateTimer) {
          clearInterval(updateTimer);
          setUpdateTimer(null);
        }

        // 重新检查状态
        try {
          const cfg = await getConfig();
          if (cfg.success) {
            const result = cfg?.data.upgradeInfo || {};
            setUpgradeInfo(result);
          }
        } catch (error) {
          console.error('监控更新状态失败:', error);
        }
      } else {
        message.error(result.message || '取消更新失败');
      }
    } catch (error) {
      message.error('取消更新失败');
    }
  };

  const restartApplication = async () => {
    Modal.confirm({
      title: '确认重启',
      content: `新版本 ${upgradeInfo?.latestVersion} 已准备就绪，是否立即重启应用以完成更新？`,
      okText: '立即重启',
      cancelText: '稍后重启',
      onOk: async () => {
        try {
          restart().then((c) => {
            setLoading(false);
            if (c.success) {
              message.success(
                c.message || intl.formatMessage({ id: 'pages.setting.restartSuccess' }),
              );
            } else {
              message.error(c.message || intl.formatMessage({ id: 'pages.setting.error' }));
            }
          });
        } catch (error) {
          message.error('重启失败');
        }
      },
    });
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (updateTimer) {
        clearInterval(updateTimer);
      }
    };
  }, [updateTimer]);

  const loadData = () => {
    setLoading(true);
    getConfig().then((c) => {
      setLoading(false);
      if (c.success) {
        form.setFieldsValue(c.data);

        // 检查更新状态
        setUpgradeInfo(c.data.upgradeInfo || {});

        if (c.data.upgradeInfo.status === 'Downloading') {
          startUpdateMonitoring();
        }
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const onFinish = () => {
    // 提交 form
    form
      .validateFields()
      .then((values) => {
        setLoading(true);
        updateConfig(values).then((c) => {
          setLoading(false);
          if (c.success) {
            // 提示成功
            message.success(intl.formatMessage({ id: 'pages.setting.saveSuccess' }));
            loadData();
          } else {
            // 提示错误
            message.error(c.message || intl.formatMessage({ id: 'pages.setting.error' }));
          }
        });
      })
      .catch(() => {
        message.error(intl.formatMessage({ id: 'pages.setting.error' }));
      });
  };

  return (
    <PageContainer>
      <Form
        form={form}
        labelAlign="left"
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <Spin spinning={loading}>
          <Space style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <Space>
              <Alert
                type="info"
                style={{ paddingTop: '4px', paddingBottom: '4px' }}
                description={intl.formatMessage({ id: 'pages.setting.tips' })}
              />
              <Tooltip
                title={intl.formatMessage({ id: 'pages.setting.restartServiceTips' })}
                placement="bottom"
              >
                <Button
                  loading={loading}
                  type="primary"
                  danger
                  icon={<SyncOutlined spin={loading} />}
                  onClick={() => {
                    setLoading(true);
                    restart().then((c) => {
                      setLoading(false);
                      if (c.success) {
                        message.success(
                          c.message || intl.formatMessage({ id: 'pages.setting.restartSuccess' }),
                        );
                      } else {
                        message.error(
                          c.message || intl.formatMessage({ id: 'pages.setting.error' }),
                        );
                      }
                    });
                  }}
                >
                  {intl.formatMessage({ id: 'pages.setting.restartService' })}
                </Button>
              </Tooltip>

              <Button
                danger
                type="dashed"
                icon={<CloudDownloadOutlined />}
                onClick={checkForUpdates}
                loading={loading}
              >
                {intl.formatMessage({ id: 'pages.setting.checkUpdate' })}
              </Button>
            </Space>

            <Space>
              <Tooltip
                placement="bottom"
                title={
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,

                      padding: 8,
                    }}
                  >
                    <Input
                      style={{ marginBottom: 8 }}
                      placeholder="mjplus host"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                    />
                    <Input
                      placeholder="mj-api-secret"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                    />
                  </div>
                }
              >
                <Button loading={loading} type="primary" ghost onClick={onMigrateClick}>
                  {intl.formatMessage({ id: 'pages.setting.migrate' })}
                </Button>
              </Tooltip>

              <Button loading={loading} icon={<SaveOutlined />} type={'primary'} onClick={onFinish}>
                {intl.formatMessage({ id: 'pages.setting.save' })}
              </Button>
            </Space>
          </Space>

          {/* 更新状态显示区域 */}
          {upgradeInfo && (
            <Card
              style={{ marginTop: 16, marginBottom: 16 }}
              size="small"
              title={
                <Space>
                  <CloudDownloadOutlined />
                  {intl.formatMessage({ id: 'pages.setting.updateStatus' })}
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {upgradeInfo.hasUpdate && <Tag color="green">{upgradeInfo.latestVersion}</Tag>}

                {upgradeInfo.message && (
                  <div>
                    <Text type="secondary">{upgradeInfo.message}</Text>
                  </div>
                )}

                {/* 下载进度条 */}
                {upgradeInfo.status === 'Downloading' && (
                  <div>
                    <Progress
                      percent={upgradeInfo.progress}
                      status="active"
                      format={(percent) => `${percent}%`}
                    />
                    <Button size="small" danger onClick={onCancelUpdate} style={{ marginTop: 8 }}>
                      取消下载
                    </Button>
                  </div>
                )}

                {/* 下载完成提示 */}
                {upgradeInfo.status === 'ReadyToRestart' && (
                  <Alert
                    message={`新版本 ${upgradeInfo.latestVersion} 已准备就绪`}
                    description="点击下方按钮重启应用以完成更新"
                    type="success"
                    showIcon
                    action={
                      <Button type="primary" onClick={restartApplication}>
                        重启应用
                      </Button>
                    }
                  />
                )}

                {/* 错误提示 */}
                {upgradeInfo.status === 'Failed' && upgradeInfo.errorMessage && (
                  <Alert
                    message="更新失败"
                    description={upgradeInfo.errorMessage}
                    type="error"
                    showIcon
                  />
                )}

                {/* 无更新提示 */}
                {!upgradeInfo.hasUpdate && upgradeInfo.status === 'Success' && (
                  <Alert
                    message="已是最新版本"
                    description="当前版本已是最新版本"
                    type="info"
                    showIcon
                  />
                )}

                {/* 平台不支持提示 */}
                {!upgradeInfo.supportedPlatform && (
                  <Alert
                    message="当前平台不支持自动更新"
                    description={`检测到平台: ${upgradeInfo.platform}`}
                    type="warning"
                    showIcon
                  />
                )}

                {upgradeInfo.body && (
                  <div className="markdown-content" style={{ overflowY: 'auto' }}>
                    <Markdown>{upgradeInfo.body}</Markdown>
                  </div>
                )}
              </Space>
            </Card>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Card
                title={intl.formatMessage({ id: 'pages.setting.accountSetting' })}
                bordered={false}
              >
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableSwagger' })}
                  name="enableSwagger"
                  extra={
                    // 如果开启了 swgger 则显示链接
                    form.getFieldValue('enableSwagger') ? (
                      <a href="/swagger" target="_blank" rel="noreferrer">
                        {intl.formatMessage({ id: 'pages.setting.swaggerLink' })}
                      </a>
                    ) : (
                      ''
                    )
                  }
                >
                  <Switch />
                </Form.Item>

                {/* <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.mongoDefaultConnectionString' })}
                  name="mongoDefaultConnectionString"
                  extra={
                    <>
                      <Button
                        style={{ marginTop: 8 }}
                        type="primary"
                        onClick={() => {
                          const mongoDefaultConnectionString = form.getFieldValue(
                            'mongoDefaultConnectionString',
                          );
                          if (mongoDefaultConnectionString) {
                            setLoading(true);
                            mongoConnect().then((c) => {
                              setLoading(false);
                              if (c.success) {
                                message.success(
                                  intl.formatMessage({ id: 'pages.setting.connectSuccess' }),
                                );
                              } else {
                                message.error(
                                  c.message ||
                                    intl.formatMessage({ id: 'pages.setting.connectError' }),
                                );
                              }
                            });
                          } else {
                            message.warning(
                              intl.formatMessage({
                                id: 'pages.setting.mongoDefaultConnectionStringTips',
                              }),
                            );
                          }
                        }}
                      >
                        {intl.formatMessage({ id: 'pages.setting.testConnect' })}
                      </Button>

                      {form && !form.getFieldValue('isMongo') && (
                        <Alert
                          style={{ marginTop: 8 }}
                          message={intl.formatMessage({ id: 'pages.setting.mongoNotUsed' })}
                          type="warning"
                        />
                      )}
                    </>
                  }
                >
                  <Input placeholder="mongodb://mongoadmin:***admin@192.168.x.x" />
                </Form.Item> */}

                {/* <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.mongoDefaultDatabase' })}
                  name="mongoDefaultDatabase"
                >
                  <Input placeholder="mj" />
                </Form.Item> */}

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.databaseType' })}
                  name="databaseType"
                >
                  <Select allowClear>
                    <Select.Option value="LiteDB">LiteDB</Select.Option>
                    <Select.Option value="MongoDB">MongoDB</Select.Option>
                    <Select.Option value="SQLite">SQLite</Select.Option>
                    <Select.Option value="MySQL">MySQL</Select.Option>
                    <Select.Option value="PostgreSQL">PostgreSQL</Select.Option>
                    <Select.Option value="SQLServer">SQLServer</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.databaseConnectionString' })}
                  name="databaseConnectionString"
                  extra={
                    <>
                      <Button
                        style={{ marginTop: 8 }}
                        type="primary"
                        onClick={() => {
                          setLoading(true);
                          mongoConnect().then((c) => {
                            setLoading(false);
                            if (c.success) {
                              message.success(
                                intl.formatMessage({ id: 'pages.setting.connectSuccess' }),
                              );
                            } else {
                              message.error(
                                c.message ||
                                  intl.formatMessage({ id: 'pages.setting.connectError' }),
                              );
                            }
                          });
                        }}
                      >
                        {intl.formatMessage({ id: 'pages.setting.testConnect' })}
                      </Button>

                      {/* {form && !form.getFieldValue('isMongo') && (
                        <Alert
                          style={{ marginTop: 8 }}
                          message={intl.formatMessage({ id: 'pages.setting.mongoNotUsed' })}
                          type="warning"
                        />
                      )} */}
                    </>
                  }
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.databaseName' })}
                  name="databaseName"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.isAutoMigrate' })}
                  name="isAutoMigrate"
                  tooltip={intl.formatMessage({ id: 'pages.setting.isAutoMigrateTips' })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.maxCount' })}
                  name="maxCount"
                >
                  <InputNumber min={-1} />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.accountChooseRule' })}
                  name="accountChooseRule"
                >
                  <Select allowClear>
                    <Select.Option value="BestWaitIdle">BestWaitIdle</Select.Option>
                    <Select.Option value="Random">Random</Select.Option>
                    <Select.Option value="Weight">Weight</Select.Option>
                    <Select.Option value="Polling">Polling</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.discordConfig' })}
                  name="ngDiscord"
                >
                  <JsonEditor />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.proxyConfig' })}
                  name="proxy"
                >
                  <JsonEditor />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.imageStorageType' })}
                  name="imageStorageType"
                >
                  <Select allowClear>
                    <Select.Option value="NONE">NULL</Select.Option>
                    <Select.Option value="LOCAL">LOCAL</Select.Option>
                    <Select.Option value="OSS">Aliyun OSS</Select.Option>
                    <Select.Option value="COS">Tencent COS</Select.Option>
                    <Select.Option value="R2">Cloudflare R2</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.localStorage' })}
                  name="localStorage"
                >
                  <JsonEditor />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.aliyunOss' })}
                  name="aliyunOss"
                >
                  <JsonEditor />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.tencentCos' })}
                  name="tencentCos"
                >
                  <JsonEditor />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.cloudflareR2' })}
                  name="cloudflareR2"
                >
                  <JsonEditor />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.replicate' })}
                  name="replicate"
                >
                  <JsonEditor />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.translate' })}
                  name="translateWay"
                >
                  <Select allowClear>
                    <Select.Option value="NULL">NULL</Select.Option>
                    <Select.Option value="BAIDU">BAIDU</Select.Option>
                    <Select.Option value="GPT">GPT</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.baiduTranslate' })}
                  name="baiduTranslate"
                >
                  <JsonEditor />
                </Form.Item>
                <Form.Item label={intl.formatMessage({ id: 'pages.setting.openai' })} name="openai">
                  <JsonEditor />
                </Form.Item>
                <Form.Item label={intl.formatMessage({ id: 'pages.setting.smtp' })} name="smtp">
                  <JsonEditor />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.notifyHook' })}
                  name="notifyHook"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.notifyPoolSize' })}
                  name="notifyPoolSize"
                >
                  <InputNumber />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.captchaServer' })}
                  name="captchaServer"
                  help={intl.formatMessage({ id: 'pages.setting.captchaServerTip' })}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.captchaNotifyHook' })}
                  name="captchaNotifyHook"
                  help={intl.formatMessage({ id: 'pages.setting.captchaNotifyHookTip' })}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.captchaNotifySecret' })}
                  name="captchaNotifySecret"
                  help={intl.formatMessage({ id: 'pages.setting.captchaNotifySecretTip' })}
                >
                  <Input />
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title={intl.formatMessage({ id: 'pages.setting.otherSetting' })}
                bordered={false}
              >
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableUpdateCheck' })}
                  name="enableUpdateCheck"
                  help={intl.formatMessage({ id: 'pages.setting.enableUpdateCheckTips' })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.licenseKey' })}
                  name="licenseKey"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.isDemoMode' })}
                  name="isDemoMode"
                  help={intl.formatMessage({ id: 'pages.setting.isDemoModeTips' })}
                >
                  <Switch className="demo-mode" />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableAccountSponsor' })}
                  name="enableAccountSponsor"
                  help={intl.formatMessage({ id: 'pages.setting.enableAccountSponsorTips' })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableOfficial' })}
                  name="enableOfficial"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableYouChuan' })}
                  name="enableYouChuan"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.isVerticalDomain' })}
                  name="isVerticalDomain"
                  help={intl.formatMessage({ id: 'pages.setting.isVerticalDomainTips' })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableRegister' })}
                  name="enableRegister"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.registerUserDefaultDayLimit' })}
                  name="registerUserDefaultDayLimit"
                >
                  <InputNumber min={-1} />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.registerUserDefaultTotalLimit' })}
                  name="registerUserDefaultTotalLimit"
                >
                  <InputNumber min={-1} />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.registerUserDefaultCoreSize' })}
                  name="registerUserDefaultCoreSize"
                >
                  <InputNumber min={-1} />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.registerUserDefaultQueueSize' })}
                  name="registerUserDefaultQueueSize"
                >
                  <InputNumber min={-1} />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableGuest' })}
                  name="enableGuest"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.guestDefaultDayLimit' })}
                  name="guestDefaultDayLimit"
                >
                  <InputNumber min={-1} />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.guestDefaultCoreSize' })}
                  name="guestDefaultCoreSize"
                >
                  <InputNumber min={-1} />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.guestDefaultQueueSize' })}
                  name="guestDefaultQueueSize"
                >
                  <InputNumber min={-1} />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.homeDisplayRealIP' })}
                  name="homeDisplayRealIP"
                  valuePropName="checked"
                  help={intl.formatMessage({ id: 'pages.setting.homeDisplayRealIP.tooltip' })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.homeDisplayUserIPState' })}
                  name="homeDisplayUserIPState"
                  valuePropName="checked"
                  help={intl.formatMessage({
                    id: 'pages.setting.homeDisplayUserIPState.tooltip',
                  })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.homeTopCount' })}
                  name="homeTopCount"
                  rules={[
                    {
                      type: 'number',
                      min: 1,
                      max: 100,
                      message: intl.formatMessage({ id: 'pages.setting.homeTopCount.range' }),
                    },
                  ]}
                  help={intl.formatMessage({ id: 'pages.setting.homeTopCount.tooltip' })}
                >
                  <InputNumber
                    min={1}
                    max={100}
                    placeholder={intl.formatMessage({
                      id: 'pages.setting.homeTopCount.placeholder',
                    })}
                    addonAfter="条"
                  />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.consulOptions' })}
                  name="consulOptions"
                >
                  <JsonEditor />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.bannedLimiting' })}
                  name="bannedLimiting"
                >
                  <JsonEditor />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.ipRateLimiting' })}
                  name="ipRateLimiting"
                >
                  <JsonEditor />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.ipBlackRateLimiting' })}
                  name="ipBlackRateLimiting"
                >
                  <JsonEditor />
                </Form.Item>

                <Form.Item label={intl.formatMessage({ id: 'pages.setting.notify' })} name="notify">
                  <Input.TextArea autoSize={{ minRows: 1, maxRows: 10 }} />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: '16px' }}>
            <Col span={12}>
              <Card
                title={intl.formatMessage({ id: 'pages.setting.discordSetting' })}
                bordered={false}
              >
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableAutoGetPrivateId' })}
                  name="enableAutoGetPrivateId"
                  help={intl.formatMessage({ id: 'pages.setting.enableAutoGetPrivateIdTips' })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableAutoVerifyAccount' })}
                  name="enableAutoVerifyAccount"
                  help={intl.formatMessage({ id: 'pages.setting.enableAutoVerifyAccountTips' })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableAutoSyncInfoSetting' })}
                  name="enableAutoSyncInfoSetting"
                  help={intl.formatMessage({ id: 'pages.setting.enableAutoSyncInfoSettingTips' })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableAutoExtendToken' })}
                  name="enableAutoExtendToken"
                  help={intl.formatMessage({ id: 'pages.setting.enableAutoExtendTokenTips' })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableUserCustomUploadBase64' })}
                  name="enableUserCustomUploadBase64"
                  help={intl.formatMessage({
                    id: 'pages.setting.enableUserCustomUploadBase64Tips',
                  })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableSaveUserUploadBase64' })}
                  name="enableSaveUserUploadBase64"
                  help={intl.formatMessage({
                    id: 'pages.setting.enableSaveUserUploadBase64Tips',
                  })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableSaveUserUploadLink' })}
                  name="enableSaveUserUploadLink"
                  help={intl.formatMessage({
                    id: 'pages.setting.enableSaveUserUploadLinkTips',
                  })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableSaveGeneratedImage' })}
                  name="enableSaveGeneratedImage"
                  help={intl.formatMessage({
                    id: 'pages.setting.enableSaveGeneratedImageTips',
                  })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableSaveIntermediateImage' })}
                  name="enableSaveIntermediateImage"
                  help={intl.formatMessage({
                    id: 'pages.setting.enableSaveIntermediateImageTips',
                  })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableConvertOfficialLink' })}
                  name="enableConvertOfficialLink"
                  help={intl.formatMessage({
                    id: 'pages.setting.enableConvertOfficialLinkTips',
                  })}
                >
                  <Switch />
                </Form.Item>

                {/* <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableConvertAliyunLink' })}
                  name="enableConvertAliyunLink"
                  help={intl.formatMessage({
                    id: 'pages.setting.enableConvertAliyunLinkTips',
                  })}
                >
                  <Switch />
                </Form.Item> */}

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableMjTranslate' })}
                  name="enableMjTranslate"
                  help={intl.formatMessage({
                    id: 'pages.setting.enableMjTranslateTips',
                  })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableNijiTranslate' })}
                  name="enableNijiTranslate"
                  help={intl.formatMessage({
                    id: 'pages.setting.enableNijiTranslateTips',
                  })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableConvertNijiToMj' })}
                  name="enableConvertNijiToMj"
                  help={intl.formatMessage({
                    id: 'pages.setting.enableConvertNijiToMjTips',
                  })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableConvertNijiToNijiBot' })}
                  name="enableConvertNijiToNijiBot"
                  help={intl.formatMessage({
                    id: 'pages.setting.enableConvertNijiToNijiBotTips',
                  })}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.enableAutoLogin' })}
                  name="enableAutoLogin"
                  help={intl.formatMessage({
                    id: 'pages.setting.enableAutoLoginTips',
                  })}
                >
                  <Switch />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Spin>
      </Form>
    </PageContainer>
  );
};

export default Setting;
