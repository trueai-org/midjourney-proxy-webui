import { accountAction, accountChangeVersion } from '@/services/mj/api';
import { useIntl } from '@umijs/max';
import { Button, Card, Descriptions, notification, Select, Space, Tag, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

const { Option } = Select;

interface MoreContentProps {
  record: Record<string, any>;
  onSuccess: () => void;
}

const MoreContent: React.FC<MoreContentProps> = ({ record, onSuccess }) => {
  const [api, contextHolder] = notification.useNotification();
  const [version, setVersion] = useState<string>('');
  const [buttons, setButtons] = useState<Array<any>>([]);
  const [nijiButtons, setNijiButtons] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState('');
  const intl = useIntl();

  useEffect(() => {
    setVersion(record.version);
    setButtons(record.buttons);
    setNijiButtons(record.nijiButtons);
  }, [record]);

  const getStatusTag = (enable: boolean, enableText: string, disableText: string) => {
    let color = enable ? 'green' : 'volcano';
    let text = enable ? enableText : disableText;
    return <Tag color={color}>{text}</Tag>;
  };

  const getTooltip = (text: string) => {
    if (!text || text.length < 25) return text;
    return <Tooltip title={text}>{text.substring(0, 25) + '...'}</Tooltip>;
  };

  const changeDate = (date: string) => {
    return moment(date).format('YYYY-MM-DD HH:mm');
  };

  const versionSelectorOptions = () => {
    return record.versionSelector?.map((option: any) => {
      return (
        <Option key={option.customId} value={option.customId}>
          {option.emoji} {option.label}
        </Option>
      );
    });
  };

  const accountButtons = () => {
    return buttons.map((button: any) => {
      return (
        <Button
          ghost
          key={'MID_JOURNEY:' + button.customId}
          style={{ backgroundColor: button.style == 3 ? '#258146' : 'rgb(131 133 142)' }}
          onClick={() => {
            action('MID_JOURNEY', button.customId);
          }}
          loading={loadingButton == 'MID_JOURNEY:' + button.customId}
        >
          {button.emoji} {button.label}
        </Button>
      );
    });
  };

  const accountNijiButtons = () => {
    return nijiButtons.map((button: any) => {
      return (
        <Button
          ghost
          key={'NIJI_JOURNEY:' + button.customId}
          style={{ backgroundColor: button.style == 3 ? '#258146' : 'rgb(131 133 142)' }}
          onClick={() => {
            action('NIJI_JOURNEY', button.customId);
          }}
          loading={loadingButton == 'NIJI_JOURNEY:' + button.customId}
        >
          {button.emoji} {button.label}
        </Button>
      );
    });
  };

  const versionChange = async (value: string) => {
    setVersion(value);
    setLoading(true);
    const res = await accountChangeVersion(record.id, value);
    if (res.success) {
      setLoading(false);
      api.success({
        message: 'success',
        description: intl.formatMessage({ id: 'pages.account.mjVersionSuccess' }),
      });
      onSuccess();
    } else {
      setVersion(record.version);
      setLoading(false);
      api.error({
        message: 'error',
        description: res.message,
      });
    }
  };

  const action = async (botType: string, customId: string) => {
    if (loadingButton !== '') return;
    setLoadingButton(botType + ':' + customId);
    const res = await accountAction(record.id, botType, customId);
    setLoadingButton('');
    if (res.success) {
      onSuccess();
    } else {
      api.error({
        message: 'error',
        description: res.message,
      });
    }
  };

  return (
    <>
      {contextHolder}
      <Card
        type="inner"
        title={intl.formatMessage({ id: 'pages.account.info' })}
        style={{ margin: '5px' }}
      >
        <Descriptions column={3}>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.guildId' })}>
            {record.guildId}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.channelId' })}>
            {record.channelId}
          </Descriptions.Item>
          {/* <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.username' })}>
            {record.name}
          </Descriptions.Item> */}
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.userToken' })}>
            {getTooltip(record.userToken)}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.botToken' })}>
            {getTooltip(record.botToken)}
          </Descriptions.Item>
          <Descriptions.Item label="User Agent">{getTooltip(record.userAgent)} </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.remixAutoSubmit' })}>
            {getStatusTag(
              record.remixAutoSubmit,
              intl.formatMessage({ id: 'pages.yes' }),
              intl.formatMessage({ id: 'pages.no' }),
            )}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.mjChannelId' })}>
            {record.privateChannelId}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.nijiChannelId' })}>
            {record.nijiBotChannelId}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        type="inner"
        title={intl.formatMessage({ id: 'pages.account.basicInfo' })}
        style={{ margin: '5px' }}
      >
        <Descriptions column={3}>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.status' })}>
            {getStatusTag(
              record.enable,
              intl.formatMessage({ id: 'pages.enable' }),
              intl.formatMessage({ id: 'pages.disable' }),
            )}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.mjMode' })}>
            {record['displays']['mode']}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.nijiMode' })}>
            {record['displays']['nijiMode']}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.subscribePlan' })}>
            {record['displays']['subscribePlan']}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.billedWay' })}>
            {record['displays']['billedWay']}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.renewDate' })}>
            {record['displays']['renewDate']}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.fastTimeRemaining' })}>
            {record.fastTimeRemaining}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.relaxedUsage' })}>
            {record.relaxedUsage}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.fastUsage' })}>
            {record.fastUsage}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.turboUsage' })}>
            {record.turboUsage}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.lifetimeUsage' })}>
            {record.lifetimeUsage}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        type="inner"
        title={intl.formatMessage({ id: 'pages.account.otherInfo' })}
        style={{ margin: '5px' }}
      >
        <Descriptions column={3}>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.coreSize' })}>
            {record.coreSize}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.queueSize' })}>
            {record.queueSize}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.timeoutMinutes' })}>
            {record.timeoutMinutes} {intl.formatMessage({ id: 'pages.minutes' })}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.weight' })}>
            {record.weight}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.dateCreated' })}>
            {changeDate(record.dateCreated)}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.remark' })}>
            {getTooltip(record.remark)}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.disabledReason' })}>
            {getTooltip(record.disabledReason)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        type="inner"
        title={intl.formatMessage({ id: 'pages.account.mjSettings' })}
        style={{ margin: '5px' }}
      >
        <Select
          style={{ width: '35%' }}
          placeholder={record.versionSelector?.placeholder}
          value={version}
          onChange={versionChange}
          loading={loading}
        >
          {versionSelectorOptions()}
        </Select>
        <Space wrap style={{ marginTop: '5px' }}>
          {accountButtons()}
        </Space>
      </Card>
      <Card
        type="inner"
        title={intl.formatMessage({ id: 'pages.account.nijiSettings' })}
        style={{ margin: '5px' }}
      >
        <Space wrap style={{ marginTop: '5px' }}>
          {accountNijiButtons()}
        </Space>
      </Card>
    </>
  );
};

export default MoreContent;
