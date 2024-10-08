import { useIntl } from '@umijs/max';
import { Card, Descriptions, Flex, Image, Progress, Spin, Tag, Tooltip } from 'antd';

const TaskContent = ({ record }: { record: Record<string, any> }) => {
  const intl = useIntl();
  const imagePrefix = sessionStorage.getItem('mj-image-prefix') || '';

  const getStatusTag = (text: string) => {
    let color = 'default';
    if (text == 'NOT_START') {
      color = 'default';
    } else if (text == 'SUBMITTED') {
      color = 'lime';
    } else if (text == 'MODAL') {
      color = 'warning';
    } else if (text == 'IN_PROGRESS') {
      color = 'processing';
    } else if (text == 'FAILURE') {
      color = 'error';
    } else if (text == 'SUCCESS') {
      color = 'success';
    } else if (text == 'CANCEL') {
      color = 'magenta';
    }
    return <Tag color={color}>{record['displays']['status']}</Tag>;
  };

  const getProgress = (text: string) => {
    let percent = 0;
    if (text && text.indexOf('%') > 0) {
      percent = parseInt(text.substring(0, text.indexOf('%')));
    }
    let status = 'normal';
    if (record['status'] == 'SUCCESS') {
      status = 'success';
    } else if (record['status'] == 'FAILURE') {
      status = 'exception';
    }
    return (
      <div style={{ width: 200 }}>
        <Progress percent={percent} status={status} />
      </div>
    );
  };

  const getTooltip = (text: string) => {
    if (!text || text.length < 30) return text;
    return <Tooltip title={text}>{text.substring(0, 30) + '...'}</Tooltip>;
  };

  const getImage = (url: string) => {
    if (!url) return url;
    return (
      <Image
        width={200}
        src={imagePrefix + url}
        placeholder={<Spin tip="Loading" size="large"></Spin>}
      />
    );
  };

  // get Video
  const getVideo = (url: string) => {
    if (!url) return url;
    return (
      <video
        width="200"
        controls
        src={imagePrefix + url}
        placeholder={<Spin tip="Loading" size="large"></Spin>}
      ></video>
    );
  };

  const getBotTypeTag = (botType: string) => {
    if (botType == 'NIJI_JOURNEY') {
      return <Tag color="green">niji・journey</Tag>;
    } else if (
      botType == 'INSIGHT_FACE' ||
      botType == 'FACE_SWAP' ||
      botType == 'FACE_SWAP_VIDEO'
    ) {
      return <Tag color="volcano">InsightFace</Tag>;
    } else if (botType == 'MID_JOURNEY') {
      return <Tag color="blue">Midjourney</Tag>;
    } else {
      return '-';
    }
  };

  const getModalTag = (enable: boolean) => {
    if (enable == null || !enable) return;
    return <Tag color="green">{intl.formatMessage({ id: 'pages.yes' })}</Tag>;
  };

  return (
    <>
      <Card
        type="inner"
        title={intl.formatMessage({ id: 'pages.account.basicInfo' })}
        style={{ margin: '10px' }}
      >
        <Descriptions column={2}>
          <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.type' })}>
            {record['displays']['action']}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.status' })}>
            {getStatusTag(record.status)}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.progress' })}>
            {getProgress(record.progress)}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.prompt' })}>
            {getTooltip(record.prompt)}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.promptEn' })}>
            {getTooltip(record.promptEn)}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.description' })}>
            {getTooltip(record.description)}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.submitTime' })}>
            {record['displays']['submitTime']}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.startTime' })}>
            {record['displays']['startTime']}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.finishTime' })}>
            {record['displays']['finishTime']}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.failReason' })}>
            {getTooltip(record.failReason)}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.state' })}>
            {getTooltip(record.state)}
          </Descriptions.Item>

          {record.action === 'SWAP_VIDEO_FACE' ? (
            <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.video' })}>
              <Flex vertical>
                {/* <Flex>
                  <div>{getImage(record.replicateSource)}</div>
                  <div>{getVideo(record.replicateTarget)}</div>
                </Flex> */}
                {getVideo(record.imageUrl)}
              </Flex>
            </Descriptions.Item>
          ) : (
            <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.image' })}>
              {getImage(record.imageUrl)}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
      <Card
        type="inner"
        title={intl.formatMessage({ id: 'pages.task.extendedInfo' })}
        style={{ margin: '10px' }}
      >
        <Descriptions column={2}>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.botType' })}>
            {getBotTypeTag(record.botType)}
          </Descriptions.Item>
          <Descriptions.Item label="Nonce">{record.nonce}</Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.account.channelId' })}>
            {record['properties']['discordInstanceId']}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.instanceId' })}>
            {record['properties']['discordInstanceId']}
          </Descriptions.Item>
          <Descriptions.Item label="Hash">{record['properties']['messageHash']}</Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.messageContent' })}>
            {getTooltip(record['properties']['messageContent'])}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.finalPrompt' })}>
            {getTooltip(record['properties']['finalPrompt'])}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.finalPromptZh' })}>
            {getTooltip(record.promptCn || '-')}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.actionId' })}>
            {getTooltip(record['properties']['custom_id'] || '-')}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.modalConfirm' })}>
            {getModalTag(record['properties']['needModel']) || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.imageSeed' })}>
            {record.seed || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.notifyHook' })}>
            {getTooltip(record['properties']['notifyHook'] || '-')}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.ip' })}>
            {record.clientIp || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </>
  );
};

export default TaskContent;
