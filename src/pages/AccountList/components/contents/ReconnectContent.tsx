import { Card, Alert, Row, Col, Form, FormInstance, Input, Switch, InputNumber, Select } from 'antd';
import { useEffect } from 'react';

import { useIntl } from '@umijs/max';

const ReconnectContent = ({
  form,
  onSubmit,
  record,
}: {
  form: FormInstance;
  onSubmit: (values: any) => void;
  record: Record<string, any>;
}) => {
  const intl = useIntl();
  // 当组件挂载或者record更新时，设置表单的初始值
  useEffect(() => {
    form.setFieldsValue(record);
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
            <Form.Item label="id" name="id" hidden>
              <Input />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.guildId' })} name="guildId" rules={[{ required: true}]}>
              <Input />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.channelId' })} name="channelId" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.userToken' })} name="userToken" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.botToken' })} name="botToken" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.mjChannelId' })} name="privateChannelId">
              <Input />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.nijiChannelId' })} name="nijiBotChannelId">
              <Input />
            </Form.Item>
            <Form.Item label="User Agent" name="userAgent">
              <Input />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.enable' })} name="enable" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.remixAutoSubmit' })} name="remixAutoSubmit" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Card>
        </Col>
        <Col span={12}>
          <Card type="inner" title={intl.formatMessage({ id: 'pages.account.otherInfo' })}>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.coreSize' })} name="coreSize">
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.queueSize' })} name="queueSize">
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.maxQueueSize' })} name="maxQueueSize">
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.mode' })} name="mode">
              <Select allowClear>
                <Select.Option value="RELAX">RELAX</Select.Option>
                <Select.Option value="FAST">FAST</Select.Option>
                <Select.Option value="TURBO">TURBO</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.timeoutMinutes' })} name="timeoutMinutes">
              <InputNumber min={1} suffix={intl.formatMessage({ id: 'pages.minutes' })} />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.weight' })} name="weight">
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.remark' })} name="remark">
              <Input />
            </Form.Item>
          </Card>
        </Col>
      </Row>
      <Alert message={intl.formatMessage({ id: 'pages.account.updateNotice' })} type="warning" style={{ marginTop: '10px' }} />
    </Form>
  );
};

export default ReconnectContent;
