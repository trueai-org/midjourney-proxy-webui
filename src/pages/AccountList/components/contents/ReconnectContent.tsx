import {
  Alert,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
} from 'antd';
import { useEffect, useState } from 'react';

import { allDomain } from '@/services/mj/api';
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

  const [opts, setOpts] = useState([]);
  useEffect(() => {
    allDomain().then((res) => {
      if (res.success) {
        setOpts(res.data);
      }
    });
  }, []);

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
        <Col span={8}>
          <Card type="inner" title={intl.formatMessage({ id: 'pages.account.info' })}>
            <Form.Item label="id" name="id" hidden>
              <Input />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.guildId' })}
              name="guildId"
              rules={[{ required: true }]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.channelId' })}
              name="channelId"
              rules={[{ required: true }]}
            >
              <Input disabled />
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

            <Form.Item label={intl.formatMessage({ id: 'pages.account.mode' })} name="mode">
              <Select allowClear>
                <Select.Option value="RELAX">RELAX</Select.Option>
                <Select.Option value="FAST">FAST</Select.Option>
                <Select.Option value="TURBO">TURBO</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.allowModes' })}
              name="allowModes"
              tooltip="如果用户指定模式或添加了自定义参数例如 --fast，但是账号不允许 FAST，则自动移除此参数"
            >
              <Select allowClear mode="multiple">
                <Select.Option value="RELAX">RELAX</Select.Option>
                <Select.Option value="FAST">FAST</Select.Option>
                <Select.Option value="TURBO">TURBO</Select.Option>
              </Select>
            </Form.Item>
          </Card>
        </Col>
        <Col span={8}>
          <Card type="inner" title={intl.formatMessage({ id: 'pages.account.poolsize' })}>
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
            <Form.Item label={intl.formatMessage({ id: 'pages.account.interval' })} name="interval">
              <InputNumber min={1.2} />
            </Form.Item>

            <Form.Item label={intl.formatMessage({ id: 'pages.account.weight' })} name="weight">
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.enableMj' })} name="enableMj">
              <Switch />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.enableNiji' })}
              name="enableNiji"
            >
              <Switch />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.isBlend' })} name="isBlend">
              <Switch />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.isDescribe' })}
              name="isDescribe"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.dayDrawLimit' })}
              name="dayDrawLimit"
              extra={
                record.dayDrawCount > 0 && (
                  <span>
                    {intl.formatMessage({ id: 'pages.account.dayDrawCount' })} {record.dayDrawCount}
                  </span>
                )
              }
            >
              <InputNumber min={-1} />
            </Form.Item>
          </Card>
        </Col>
        <Col span={8}>
          <Card type="inner" title={intl.formatMessage({ id: 'pages.account.otherInfo' })}>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.isVerticalDomain' })}
              name="isVerticalDomain"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.verticalDomainIds' })}
              name="verticalDomainIds"
            >
              <Select options={opts} allowClear mode="multiple"></Select>
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.sort' })} name="sort">
              <InputNumber />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.timeoutMinutes' })}
              name="timeoutMinutes"
            >
              <InputNumber min={1} suffix={intl.formatMessage({ id: 'pages.minutes' })} />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.sponsor' })} name="sponsor">
              <Input />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.remark' })} name="remark">
              <Input />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.workTime' })} name="workTime">
              <Input placeholder="09:00-17:00, 18:00-22:00" />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.subChannels' })}
              name="subChannels"
              help={intl.formatMessage({ id: 'pages.account.subChannelsHelp' })}
            >
              <Input.TextArea
                placeholder="https://discord.com/channels/xxx/xxx"
                autoSize={{ minRows: 1, maxRows: 10 }}
              />
            </Form.Item>
          </Card>
        </Col>
      </Row>
      <Alert
        message={intl.formatMessage({ id: 'pages.account.updateNotice' })}
        type="warning"
        style={{ marginTop: '10px' }}
      />
    </Form>
  );
};

export default ReconnectContent;
