import { refreshAccount } from '@/services/mj/api';
import { SyncOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, notification, Popconfirm } from 'antd';
import React, { useState } from 'react';

interface SyncButtonProps {
  record: Record<string, string>;
  onSuccess: () => void;
}

const SyncButton: React.FC<SyncButtonProps> = ({ record, onSuccess }) => {
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
      const res = await refreshAccount(record.id);
      console.log('resss', res);
      
      setOpen(false);
      if (res.success) {
        api.success({
          message: 'success',
          description: intl.formatMessage({ id: 'pages.account.syncSuccess' }),
        });
        onSuccess();
      } else {
        api.error({
          message: 'error',
          description: res.message,
        });
        onSuccess();
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
      title={intl.formatMessage({ id: 'pages.account.sync' })}
      description={intl.formatMessage({ id: 'pages.account.syncTitle' })}
      open={open}
      onConfirm={handleOk}
      okButtonProps={{ loading: confirmLoading }}
      onCancel={handleCancel}
    >
      {contextHolder}
      <Button icon={<SyncOutlined />} onClick={showPopconfirm}>
        {/* {intl.formatMessage({ id: 'pages.account.sync' })} */}
      </Button>
    </Popconfirm>
  );
};

export default SyncButton;
