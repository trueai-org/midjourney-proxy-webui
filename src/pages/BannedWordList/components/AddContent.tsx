import { Card, Col, Form, FormInstance, Input, InputNumber, Row, Switch } from 'antd';
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
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      onFinish={onSubmit}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Card type="inner">
            <Form.Item label="id" name="id" hidden>
              <Input />
            </Form.Item>
            <Form.Item required label={intl.formatMessage({ id: 'pages.word.name' })} name="name">
              <Input />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.word.description' })}
              name="description"
            >
              <Input />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.word.enable' })} name="enable">
              <Switch />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.word.sort' })} name="sort">
              <InputNumber />
            </Form.Item>

            <Form.Item
              label={intl.formatMessage({ id: 'pages.word.keywords' })}
              name="keywords"
              tooltip={intl.formatMessage({ id: 'pages.word.keywords.tooltip' })}
            >
              <Input.TextArea
                placeholder="sexy, 18xxx, 18+"
                autoSize={{ minRows: 1, maxRows: 20 }}
                allowClear
              />
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

export default UpdateContent;
