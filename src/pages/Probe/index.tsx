import { downloadLogs, probe } from '@/services/mj/api';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Card, message, Select, Space } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';

const { Option } = Select;

const Probe: React.FC = () => {
  const [logContent, setLogContent] = useState<string>('');
  const [refreshInterval, setRefreshInterval] = useState<number>(5);
  const logCardRef = useRef<HTMLDivElement>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const intl = useIntl();
  const [level, setLevel] = useState(0);

  const fetchLogContent = async (l = 0) => {
    return await probe(1000, l);
  };

  useEffect(() => {
    const tailLog = async () => {
      const res = await fetchLogContent(level);
      const logCardElement = logCardRef.current || document.body;
      const scrollN =
        logCardElement.scrollHeight - logCardElement.scrollTop - logCardElement.clientHeight;
      setLogContent(res);
      if (scrollN < 50) {
        logCardElement.scrollTop = logCardElement.scrollHeight - logCardElement.clientHeight;
      }
    };

    tailLog().then(() => {
      setTimeout(() => {
        const logCardElement = logCardRef.current || document.body;
        logCardElement.scrollTop = logCardElement.scrollHeight - logCardElement.clientHeight;
      }, 100);
    });

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    if (refreshInterval > 0) {
      const newIntervalId = setInterval(tailLog, refreshInterval * 1000);
      intervalIdRef.current = newIntervalId;
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [refreshInterval, level]);

  const handleRefreshChange = (value: number) => {
    setRefreshInterval(value);
  };

  const handleLevelChange = (value: number) => {
    setLevel(value);
  };

  const toggleFullscreen = () => {
    if (logCardRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        logCardRef.current.requestFullscreen();
      }
    }
  };

  const [loading, setLoading] = useState(false);
  const handleDownloadLogs = async () => {
    try {
      setLoading(true);
      const response = await downloadLogs(10);
      
      // 判断是否为 Blob 对象
      if (response instanceof Blob) {
        if (response.type === 'text/plain') {
          const text = await response.text();
          message.error(text || '下载失败');
          return;
        }

        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        message.error('下载错误');
      }
    } catch (error) {
      console.error('Error downloading logs:', error);
      message.error('下载日志失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Space style={{ marginBottom: '10px' }}>
        <Button type={'primary'} onClick={toggleFullscreen}>
          {document.fullscreenElement ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          {document.fullscreenElement
            ? intl.formatMessage({ id: 'pages.probe.fullscreenExit' })
            : intl.formatMessage({ id: 'pages.probe.fullscreen' })}
        </Button>
        <Select defaultValue={5} onChange={handleRefreshChange} style={{ width: 150 }}>
          <Option value={5}>5 {intl.formatMessage({ id: 'pages.seconds' })}</Option>
          <Option value={10}>10 {intl.formatMessage({ id: 'pages.seconds' })}</Option>
          <Option value={30}>30 {intl.formatMessage({ id: 'pages.seconds' })}</Option>
          <Option value={0}>{intl.formatMessage({ id: 'pages.probe.stopRefresh' })}</Option>
        </Select>
        <Select defaultValue={level} onChange={handleLevelChange} style={{ width: 150 }}>
          <Option value={0}> Info </Option>
          <Option value={1}> Error </Option>
        </Select>
        <Button loading={loading} type="default" onClick={handleDownloadLogs}>
          {intl.formatMessage({ id: 'pages.probe.downloadLogs' })}
        </Button>
        {/* <Button
          type="default"
          onClick={() => {
            const link = document.createElement('a');
            link.href = '/mj/admin/download-logs';
            link.download = `probe_log_${new Date().toISOString()}.txt`;
            link.click();
            URL.revokeObjectURL(link.href);
          }}
        >
          下载日志
        </Button> */}
      </Space>
      <Card className={styles.logCard} ref={logCardRef}>
        <div>
          <pre className={styles.logContent}>{logContent}</pre>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Probe;
