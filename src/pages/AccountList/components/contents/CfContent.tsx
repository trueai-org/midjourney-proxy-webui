import { Button, Col, Form, FormInstance, notification, Row, Space } from 'antd';
import { useEffect, useState } from 'react';

import { accountCfOk, accountCfUrl } from '@/services/mj/api';
import { useIntl } from '@umijs/max';

const CfContent = ({
  form,
  onSubmit,
  record,
}: {
  form: FormInstance;
  onSubmit: (values: any) => void;
  record: Record<string, any>;
}) => {
  const intl = useIntl();

  const [api, contextHolder] = notification.useNotification();
  const [data, setData] = useState<Record<string, any>>();
  const [loading, setLoading] = useState(false);

  // 当组件挂载或者record更新时，设置表单的初始值
  useEffect(() => {
    setData(record);
  });

  const updateUrl = async () => {
    setLoading(true);
    const res = await accountCfUrl(record.id);
    if (res.success) {
      api.success({
        message: 'success',
        description: res.message,
      });
    } else {
      api.error({
        message: 'error',
        description: res.message,
      });
    }
    setLoading(false);
  };

  const updateOk = async () => {
    setLoading(true);
    const res = await accountCfOk(record.id);
    if (res) {
      setData(res);
    } else {
      api.error({
        message: 'error',
        description: 'error',
      });
    }
    setLoading(false);
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
      {contextHolder}
      <Row gutter={16}>
        <Col span={24} style={{ padding: 12 }}>
          <a target="_blank" rel={'noreferrer'} href={data?.cfUrl}>
            {data?.cfUrl}
          </a>
          <br />
          <Space style={{marginTop:12}}>
            <Button onClick={updateUrl} loading={loading} type="default">
              {intl.formatMessage({ id: 'pages.account.cfRefresh' })}
            </Button>

            <Button onClick={updateOk} loading={loading} type="primary">
              {intl.formatMessage({ id: 'pages.account.cfok' })}
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );
};

export default CfContent;
