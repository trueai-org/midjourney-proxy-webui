import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Switch,
} from 'antd';
import { useEffect, useState } from 'react';

import { allDomain } from '@/services/mj/api';
import { FullscreenOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';

const ReconnectContent = ({
  form,
  onSubmit,
  record,
  r,
}: {
  form: FormInstance;
  onSubmit: (values: any) => void;
  record: Record<string, any>;
  r: any;
}) => {
  const intl = useIntl();

  useEffect(() => {
    form.setFieldsValue(record);
  }, []);

  useEffect(() => {
    form.setFieldsValue(record);
  }, [r]);

  const [opts, setOpts] = useState([]);
  useEffect(() => {
    allDomain().then((res) => {
      if (res.success) {
        setOpts(res.data);
      }
    });
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [subChannels, setSubChannels] = useState('');

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    record.subChannels = subChannels.split('\n');
    form.setFieldsValue({ subChannels: subChannels.split('\n') });
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Form
      form={form}
      labelAlign="left"
      layout="horizontal"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onFinish={onSubmit}
    >
      {record.isYouChuan || record.isOfficial ? (
        <>
          <Row gutter={16}>
            <Col span={8}>
              <Card type="inner" title={intl.formatMessage({ id: 'pages.account.info' })}>
                <Form.Item label="id" name="id" hidden>
                  <Input />
                </Form.Item>
                <Form.Item label="isYouChuan" name="isYouChuan" hidden>
                  <Input />
                </Form.Item>
                <Form.Item label="isOfficial" name="isOfficial" hidden>
                  <Input />
                </Form.Item>
                

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.loginAccount' })}
                  name="loginAccount"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.loginPassword' })}
                  name="loginPassword"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.userToken' })}
                  name="userToken"
                
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
                  help={intl.formatMessage({ id: 'pages.account.allowModesTip' })}
                >
                  <Select allowClear mode="multiple">
                    <Select.Option value="RELAX">RELAX</Select.Option>
                    <Select.Option value="FAST">FAST</Select.Option>
                    <Select.Option value="TURBO">TURBO</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.enableAutoSetRelax' })}
                  name="enableAutoSetRelax"
                  valuePropName="checked"
                  help={intl.formatMessage({ id: 'pages.account.enableAutoSetRelaxTips' })}
                >
                  <Switch />
                </Form.Item>
              </Card>
            </Col>
            <Col span={8}>
              <Card type="inner" title={intl.formatMessage({ id: 'pages.account.poolsize' })}>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.coreSize' })}
                  name="coreSize"
                >
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.queueSize' })}
                  name="queueSize"
                >
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.relaxCoreSize' })}
                  name="relaxCoreSize"
                >
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.relaxQueueSize' })}
                  name="relaxQueueSize"
                >
                  <InputNumber min={1} />
                </Form.Item>
             
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.interval' })}
                  name="interval"
                >
                  <InputNumber min={0} />
                </Form.Item>

                <Form.Item label={intl.formatMessage({ id: 'pages.account.intervalAfter' })}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Space>
                      <Form.Item name="afterIntervalMin" style={{ margin: 0 }}>
                        <InputNumber min={0} placeholder="Min" />
                      </Form.Item>
                      ~
                      <Form.Item name="afterIntervalMax" style={{ margin: 0 }}>
                        <InputNumber min={0} placeholder="Max" />
                      </Form.Item>
                    </Space>
                  </div>
                </Form.Item>

                <Form.Item label={intl.formatMessage({ id: 'pages.account.weight' })} name="weight">
                  <InputNumber min={1} />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.isBlend' })}
                  name="isBlend"
                >
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
                        {intl.formatMessage({ id: 'pages.account.dayDrawCount' })}{' '}
                        {record.dayDrawCount}
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
                <Form.Item label={intl.formatMessage({ id: 'pages.account.sort' })} name="sort">
                  <InputNumber />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.timeoutMinutes' })}
                  name="timeoutMinutes"
                >
                  <InputNumber min={1} suffix={intl.formatMessage({ id: 'pages.minutes' })} />
                </Form.Item>

                <Form.Item label={intl.formatMessage({ id: 'pages.account.remark' })} name="remark">
                  <Input.TextArea autoSize={{ minRows: 1, maxRows: 6 }} />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.workTime' })}
                  name="workTime"
                >
                  <Input placeholder="09:00-17:00, 18:00-22:00" />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.fishingTime' })}
                  help={intl.formatMessage({ id: 'pages.account.fishingTimeTips' })}
                  name="fishingTime"
                >
                  <Input placeholder="23:30-09:00, 00:00-10:00" />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <>
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
                  label={intl.formatMessage({ id: 'pages.account.enableFastToRelax' })}
                  name="enableFastToRelax"
                  valuePropName="checked"
                  tooltip={intl.formatMessage({ id: 'pages.account.enableFastToRelaxTips' })}
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.enableRelaxToFast' })}
                  name="enableRelaxToFast"
                  valuePropName="checked"
                  tooltip={intl.formatMessage({ id: 'pages.account.enableRelaxToFastTips' })}
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
                  help={intl.formatMessage({ id: 'pages.account.allowModesTip' })}
                >
                  <Select allowClear mode="multiple">
                    <Select.Option value="RELAX">RELAX</Select.Option>
                    <Select.Option value="FAST">FAST</Select.Option>
                    <Select.Option value="TURBO">TURBO</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.enableAutoSetRelax' })}
                  name="enableAutoSetRelax"
                  valuePropName="checked"
                  help={intl.formatMessage({ id: 'pages.account.enableAutoSetRelaxTips' })}
                >
                  <Switch />
                </Form.Item>
              </Card>
            </Col>
            <Col span={8}>
              <Card type="inner" title={intl.formatMessage({ id: 'pages.account.poolsize' })}>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.coreSize' })}
                  name="coreSize"
                >
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.queueSize' })}
                  name="queueSize"
                >
                  <InputNumber min={1} />
                </Form.Item>
            
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.interval' })}
                  name="interval"
                >
                  <InputNumber min={0} />
                </Form.Item>

                <Form.Item label={intl.formatMessage({ id: 'pages.account.intervalAfter' })}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Space>
                      <Form.Item name="afterIntervalMin" style={{ margin: 0 }}>
                        <InputNumber min={0} placeholder="Min" />
                      </Form.Item>
                      ~
                      <Form.Item name="afterIntervalMax" style={{ margin: 0 }}>
                        <InputNumber min={0} placeholder="Max" />
                      </Form.Item>
                    </Space>
                  </div>
                </Form.Item>

                <Form.Item label={intl.formatMessage({ id: 'pages.account.weight' })} name="weight">
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.enableMj' })}
                  name="enableMj"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.enableNiji' })}
                  name="enableNiji"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.isBlend' })}
                  name="isBlend"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.isDescribe' })}
                  name="isDescribe"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.isShorten' })}
                  name="isShorten"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.dayDrawLimit' })}
                  name="dayDrawLimit"
                  extra={
                    record.dayDrawCount > 0 && (
                      <span>
                        {intl.formatMessage({ id: 'pages.account.dayDrawCount' })}{' '}
                        {record.dayDrawCount}
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
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.permanentInvitationLink' })}
                  name="permanentInvitationLink"
                >
                  <Input />
                </Form.Item>
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
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.sponsor' })}
                  name="sponsor"
                >
                  <Input />
                </Form.Item>
                <Form.Item label={intl.formatMessage({ id: 'pages.account.remark' })} name="remark">
                  <Input.TextArea autoSize={{ minRows: 1, maxRows: 6 }} />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.workTime' })}
                  name="workTime"
                >
                  <Input placeholder="09:00-17:00, 18:00-22:00" />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.fishingTime' })}
                  help={intl.formatMessage({ id: 'pages.account.fishingTimeTips' })}
                  name="fishingTime"
                >
                  <Input placeholder="23:30-09:00, 00:00-10:00" />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.subChannels' })}
                  name="subChannels"
                  extra={
                    <Button
                      type="primary"
                      onClick={() => {
                        setSubChannels(form.getFieldValue('subChannels').join('\n'));
                        showModal();
                      }}
                      icon={<FullscreenOutlined />}
                    ></Button>
                  }
                >
                  <Input.TextArea disabled autoSize={{ minRows: 1, maxRows: 1 }} />
                </Form.Item>

                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.loginAccount' })}
                  name="loginAccount"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.loginPassword' })}
                  name="loginPassword"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({ id: 'pages.account.login2fa' })}
                  name="login2fa"
                >
                  <Input />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </>
      )}

      <Modal
        title={intl.formatMessage({ id: 'pages.account.subChannels' })}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={960}
      >
        <div>
          <Alert
            message={intl.formatMessage({ id: 'pages.account.subChannelsHelp' })}
            type="info"
            style={{ marginBottom: '10px' }}
          />
        </div>
        <Input.TextArea
          placeholder="https://discord.com/channels/xxx/xxx"
          autoSize={{ minRows: 10, maxRows: 24 }}
          style={{ width: '100%' }}
          value={subChannels}
          onChange={(e) => {
            // 设置 form 的值
            setSubChannels(e.target.value);
          }}
        />
      </Modal>

      <Alert
        message={intl.formatMessage({ id: 'pages.account.updateNotice' })}
        type="warning"
        style={{ marginTop: '10px' }}
      />
    </Form>
  );
};

export default ReconnectContent;
