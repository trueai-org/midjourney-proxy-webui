import { Card, Col, Form, FormInstance, Input, InputNumber, Row, Select, Switch } from 'antd';
import { useEffect } from 'react';

import { useIntl } from '@umijs/max';

const AddContent = ({
  form,
  onSubmit,
}: {
  form: FormInstance;
  onSubmit: (values: any) => void;
}) => {
  const intl = useIntl();
  // 使用 useEffect 来在组件挂载时设置表单的初始值
  useEffect(() => {
    form.setFieldsValue({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      coreSize: 3,
      queueSize: 10,
      timeoutMinutes: 5,
    });
  });

  return (
    <Form
      form={form}
      labelAlign="left"
      layout="horizontal"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onFinish={onSubmit}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Card type="inner" title={intl.formatMessage({ id: 'pages.account.info' })}>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.guildId' })}
              name="guildId"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.channelId' })}
              name="channelId"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.userToken' })}
              name="userToken"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.botToken' })}
              name="botToken"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.mjChannelId' })}
              name="privateChannelId"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.nijiChannelId' })}
              name="nijiBotChannelId"
            >
              <Input />
            </Form.Item>
            <Form.Item label="User Agent" name="userAgent">
              <Input />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.enable' })}
              name="enable"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.remixAutoSubmit' })}
              name="remixAutoSubmit"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Card>
        </Col>
        <Col span={12}>
          <Card type="inner" title={intl.formatMessage({ id: 'pages.account.otherInfo' })}>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.coreSize' })} name="coreSize">
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.queueSize' })}
              name="queueSize"
            >
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.maxQueueSize' })}
              name="maxQueueSize"
            >
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.mode' })} name="mode">
              <Select allowClear>
                <Select.Option value="RELAX">RELAX</Select.Option>
                <Select.Option value="FAST">FAST</Select.Option>
                <Select.Option value="TURBO">TURBO</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.timeoutMinutes' })}
              name="timeoutMinutes"
            >
              <InputNumber min={1} suffix={intl.formatMessage({ id: 'pages.minutes' })} />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.weight' })} name="weight">
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.remark' })} name="remark">
              <Input />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.sponsor' })} name="sponsor">
              <Input />
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

export default AddContent;
