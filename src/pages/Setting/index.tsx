import JsonEditor from '@/components/JsonEditor';
import { getConfig, updateConfig } from '@/services/mj/api';
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
            message.success(intl.formatMessage({ id: 'pages.setting.success' }));
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
            <Alert
              type="info"
              style={{ paddingTop: '4px', paddingBottom: '4px' }}
              description={intl.formatMessage({ id: 'pages.setting.tips' })}
            />
            <Button loading={loading} icon={<SaveOutlined />} type={'primary'} onClick={onFinish}>
              {intl.formatMessage({ id: 'pages.setting.save' })}
            </Button>
          </Space>

          <Row gutter={16}>
            <Col span={12}>
              <Card
                title={intl.formatMessage({ id: 'pages.setting.accountSetting' })}
                bordered={false}
              >
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
                  label={intl.formatMessage({ id: 'pages.setting.translate' })}
                  name="translateWay"
                >
                  <Select allowClear>
                    <Select.Option value="NULL">NULL</Select.Option>
                    <Select.Option value="BAIDU">BAIDU</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.setting.baiduTranslate' })}
                  name="baiduTranslate"
                >
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
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title={intl.formatMessage({ id: 'pages.setting.otherSetting' })}
                bordered={false}
              >
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
              </Card>
            </Col>
          </Row>
        </Spin>
      </Form>
    </PageContainer>
  );
};

export default Setting;
