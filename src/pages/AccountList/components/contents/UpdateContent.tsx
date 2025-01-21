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
  Switch,
} from 'antd';
import { useEffect, useState } from 'react';

import { allDomain } from '@/services/mj/api';
import { FullscreenOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';

const UpdateContent = ({
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

  // // 当组件挂载或者record更新时，设置表单的初始值
  // useEffect(() => {
  //   form.setFieldsValue(record);
  // });

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
      <Row gutter={16}>
        <Col span={12}>
          <Card type="inner" title={intl.formatMessage({ id: 'pages.account.info' })}>
            <Form.Item label="id" name="id" hidden>
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
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.remixAutoSubmit' })}
              name="remixAutoSubmit"
              valuePropName="checked"
            >
              <Switch />
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
                    {intl.formatMessage({ id: 'pages.account.dayDrawCount' })} {record.dayDrawCount}
                  </span>
                )
              }
            >
              <InputNumber min={-1} />
            </Form.Item>
          </Card>
        </Col>
        <Col span={12}>
          <Card type="inner" title={intl.formatMessage({ id: 'pages.account.otherInfo' })}>
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
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.timeoutMinutes' })}
              name="timeoutMinutes"
            >
              <InputNumber min={1} suffix={intl.formatMessage({ id: 'pages.minutes' })} />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.weight' })} name="weight">
              <InputNumber min={1} />
            </Form.Item>

            <Form.Item label={intl.formatMessage({ id: 'pages.account.sponsor' })} name="sponsor">
              <Input />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.remark' })} name="remark">
              <Input.TextArea autoSize={{ minRows: 1, maxRows: 6 }} />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.sort' })} name="sort">
              <InputNumber />
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
              label={intl.formatMessage({ id: 'pages.account.logiln2fa' })}
              name="logiln2fa"
            >
              <Input />
            </Form.Item>
          </Card>
        </Col>
      </Row>

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
    </Form>
  );
};

export default UpdateContent;
