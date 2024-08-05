import { Card, Col, Form, FormInstance, Input, InputNumber, Row, Select } from 'antd';
import { useEffect, useState } from 'react';

import { useIntl } from '@umijs/max';

const UpdateContent = ({
  form,
  onSubmit,
  record,
}: {
  form: FormInstance;
  onSubmit: (values: any) => void;
  record: Record<string, any>;
}) => {
  const intl = useIntl();
  const [disabledRole, setDisabledRole] = useState(false);

  // 当组件挂载或者record更新时，设置表单的初始值
  useEffect(() => {
    form.setFieldsValue(record);

    // 如果是管理员，则禁用角色选择
    if (record.id == 'admin') {
      setDisabledRole(true);
    } else {
      setDisabledRole(false);
    }
    console.log('record', record);
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
          <Card type="inner">
            <Form.Item label="id" name="id" hidden>
              <Input />
            </Form.Item>
            <Form.Item required label={intl.formatMessage({ id: 'pages.user.name' })} name="name">
              <Input />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.user.email' })} name="email">
              <Input />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.user.phone' })} name="phone">
              <Input />
            </Form.Item>

            <Form.Item required label={intl.formatMessage({ id: 'pages.user.status' })} name="status">
              <Select>
                <Select.Option value="NORMAL">
                  {intl.formatMessage({ id: 'pages.user.normal' })}
                </Select.Option>
                <Select.Option value="DISABLED">
                  {intl.formatMessage({ id: 'pages.user.disabled' })}
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item required  label={intl.formatMessage({ id: 'pages.user.role' })} name="role">
              <Select disabled={disabledRole}>
                <Select.Option value="ADMIN">
                  {intl.formatMessage({ id: 'pages.user.admin' })}
                </Select.Option>
                <Select.Option value="USER">
                  {intl.formatMessage({ id: 'pages.user.user' })}
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.user.token' })}
              name="token"
              required
              extra={
                <a
                  onClick={() => {
                    // 128 位随机字符串
                    const token = Array.from({ length: 32 }, () =>
                      Math.random().toString(36).charAt(2),
                    ).join('');
                    form.setFieldsValue({ token });
                  }}
                >
                  {intl.formatMessage({ id: 'pages.user.refreshToken' })}
                </a>
              }
            >
              <Input />
            </Form.Item>
          </Card>
        </Col>
        <Col span={12}>
          <Card type="inner">
            <Form.Item
              label={intl.formatMessage({ id: 'pages.user.dayDrawLimit' })}
              name="dayDrawLimit"
            >
              <InputNumber min={0} />
            </Form.Item>

            <Form.Item
              label={intl.formatMessage({ id: 'pages.user.registerTime' })}
              name="registerTimeFormat"
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.user.registerIp' })}
              name="registerIp"
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.user.lastLoginTime' })}
              name="lastLoginTimeFormat"
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.user.lastLoginIp' })}
              name="lastLoginIp"
            >
              <Input disabled />
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

export default UpdateContent;
