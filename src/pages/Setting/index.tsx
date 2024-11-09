import JsonEditor from '@/components/JsonEditor';
import { getConfig, migrateAccountAndTasks, updateConfig } from '@/services/mj/api';
import { SaveOutlined } from '@ant-design/icons';
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
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Tooltip,
} from 'antd';
import React, { useEffect, useState } from 'react';

const Setting: React.FC = () => {
  const [form] = Form.useForm();

  const intl = useIntl();
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    setLoading(true);
    getConfig().then((c) => {
      setLoading(false);
      if (c.success) {
        form.setFieldsValue(c.data);
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
            <Alert
              type="info"
              style={{ paddingTop: '4px', paddingBottom: '4px' }}
              description={intl.formatMessage({ id: 'pages.setting.tips' })}
            />
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

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.mongoDefaultConnectionString' })}
                  name="mongoDefaultConnectionString"
                >
                  <Input placeholder="mongodb://mongoadmin:***admin@192.168.x.x" />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.mongoDefaultDatabase' })}
                  name="mongoDefaultDatabase"
                >
                  <Input placeholder="mj" />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.isMongoAutoMigrate' })}
                  name="isMongoAutoMigrate"
                  tooltip={intl.formatMessage({ id: 'pages.setting.isMongoAutoMigrateTips' })}
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
                  label={intl.formatMessage({ id: 'pages.setting.aliyunOss' })}
                  name="aliyunOss"
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
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.captchaNotifyHook' })}
                  name="captchaNotifyHook"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.captchaNotifySecret' })}
                  name="captchaNotifySecret"
                  tooltip={intl.formatMessage({ id: 'pages.setting.captchaNotifySecretTip' })}
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
              </Card>
            </Col>
          </Row>
        </Spin>
      </Form>
    </PageContainer>
  );
};

export default Setting;
