import { getConfig } from '@/services/mj/api';
import { NotificationOutlined, SoundOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Badge, Button, Modal, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import './index.less';

const { Title } = Typography;

const STORAGE_KEY = 'global_announcement_dismissed';

const GlobalAnnouncement: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<string>('');
  const [hasNew, setHasNew] = useState(false);
  const intl = useIntl();

  // 检查今日是否已经点击过"今日不再提醒"
  const isDismissedToday = (): boolean => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) return false;

    const today = new Date().toDateString();
    return dismissed === today;
  };

  // 设置今日不再提醒
  const dismissToday = () => {
    const today = new Date().toDateString();
    localStorage.setItem(STORAGE_KEY, today);
    setVisible(false);
    setHasNew(false);
  };

  // 获取公告内容
  const fetchAnnouncement = async () => {
    try {
      const res = await getConfig();
      if (res.success && res.data?.notify) {
        setContent(res.data.notify);
        // 如果今日未点击过"今日不再提醒"，则自动显示
        if (!isDismissedToday()) {
          setVisible(true);
          setHasNew(true);
        }
      }
    } catch (error) {
      console.error('获取公告失败:', error);
    }
  };

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  // 手动打开公告
  const showAnnouncement = () => {
    if (content) {
      setVisible(true);
    }
  };

  // 关闭弹窗
  const handleClose = () => {
    setVisible(false);
  };

  // 我已知晓
  const handleAcknowledged = () => {
    setVisible(false);
    setHasNew(false);
  };

  // 如果没有公告内容，不渲染任何内容
  if (!content) {
    return null;
  }

  return (
    <>
      {/* 顶部公告按钮 - 与语言切换同一行样式 */}
      <span className="global-announcement-action" onClick={showAnnouncement}>
        <Badge dot={hasNew} offset={[-2, 2]}>
          <SoundOutlined className="announcement-icon" />
        </Badge>
      </span>

      {/* 公告弹窗 */}
      <Modal
        title={null}
        open={visible}
        onCancel={handleClose}
        maskClosable={true}
        footer={null}
        width={800}
        maxWidth="80vw"
        className="global-announcement-modal"
        centered
      >
        {/* 自定义头部 */}
        <div className="announcement-header">
          <div className="header-icon">
            <NotificationOutlined />
          </div>
          <Title level={4} className="header-title">
            {intl.formatMessage({ id: 'component.globalAnnouncement.title' })}
          </Title>
        </div>

        {/* 内容区域 */}
        <div className="announcement-body">
          <Markdown>{content}</Markdown>
        </div>

        {/* 底部按钮 */}
        <div className="announcement-footer">
          <Space>
            <Button onClick={dismissToday}>
              {intl.formatMessage({ id: 'component.globalAnnouncement.dismissToday' })}
            </Button>
            <Button type="primary" onClick={handleAcknowledged}>
              {intl.formatMessage({ id: 'component.globalAnnouncement.acknowledged' })}
            </Button>
          </Space>
        </div>
      </Modal>
    </>
  );
};

export default GlobalAnnouncement;