import { deleteAccount } from '@/services/mj/api';
import { Button, Popconfirm, notification } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { useIntl } from '@umijs/max';

// 定义 DelButton 接受的 props 类型
interface DelButtonProps {
  record: Record<string, string>;
  onSuccess: () => void;
}

const DelButton: React.FC<DelButtonProps> = ({ record, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const intl = useIntl();

  const showPopconfirm = () => {
    setOpen(true);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    try {
      const res = await deleteAccount(record.id);
      setOpen(false);
      if (res.success) {
        api.success({
          message: 'success',
          description: intl.formatMessage({ id: 'pages.account.deleteSuccess' })
        });
        onSuccess();
      } else {
        api.error({
          message: 'error',
          description: res.message
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Popconfirm
      title={intl.formatMessage({ id: 'pages.account.delete' })}
      description={intl.formatMessage({ id: 'pages.account.deleteTitle' })}
      open={open}
      onConfirm={handleOk}
      okButtonProps={{ loading: confirmLoading }}
      onCancel={handleCancel}
    >
      {contextHolder}
      <Button danger icon={<DeleteOutlined />} onClick={showPopconfirm}>
      </Button>
    </Popconfirm>
  );
};

export default DelButton;
