import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Select, Space } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { probe } from "@/services/mj/api";
import styles from './index.less';
import { useIntl } from '@umijs/max';

const { Option } = Select;

const fetchLogContent = async () => {
  return await probe(1000);
};

const Probe: React.FC = () => {
  const [logContent, setLogContent] = useState<string>('');
  const [refreshInterval, setRefreshInterval] = useState<number>(5);
  const logCardRef = useRef<HTMLDivElement>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const intl = useIntl();

  useEffect(() => {
    const tailLog = async () => {
      const res = await fetchLogContent();
      const logCardElement = logCardRef.current || document.body;
      const scrollN = logCardElement.scrollHeight - logCardElement.scrollTop - logCardElement.clientHeight;
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
  }, [refreshInterval]);

  const handleRefreshChange = (value: number) => {
    setRefreshInterval(value);
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

  return (
    <PageContainer>
      <Space style={{ marginBottom: '10px' }}>
        <Button type={"primary"} onClick={toggleFullscreen}>
          {document.fullscreenElement ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          {document.fullscreenElement ? intl.formatMessage({ id: 'pages.probe.fullscreenExit' }) : intl.formatMessage({ id: 'pages.probe.fullscreen' })}
        </Button>
        <Select defaultValue={5} onChange={handleRefreshChange} style={{ width: 150 }}>
          <Option value={5}>5 {intl.formatMessage({ id: 'pages.seconds' })}</Option>
          <Option value={10}>10 {intl.formatMessage({ id: 'pages.seconds' })}</Option>
          <Option value={30}>30 {intl.formatMessage({ id: 'pages.seconds' })}</Option>
          <Option value={0}>{intl.formatMessage({ id: 'pages.probe.stopRefresh' })}</Option>
        </Select>
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
