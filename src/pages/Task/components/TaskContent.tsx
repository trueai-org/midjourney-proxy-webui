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

  const getVideoContent = () => {
    if (!record.videoUrls || record.videoUrls.length === 0) return null;

    return (
      <div className="video-task-detail">
        <div className="video-info" style={{ marginBottom: '16px' }}>
          <Tag color="blue">时长: {record.videoDuration}s</Tag>
          <Tag color="green">帧数: {record.frameCount}</Tag>
        </div>

        <div
          className="videos-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {record.videoUrls.map((videoItem: any, index: number) => (
            <div key={index} className="video-detail-item">
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <video
                  controls
                  loop
                  muted
                  style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                  poster={record.videoGenOriginImageUrl}
                >
                  <source src={videoItem.url} type="video/mp4" />
                  您的浏览器不支持视频播放。
                </video>
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  #{index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>

        {record.videoGenOriginImageUrl && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>原始图片:</div>
            {getImage(record.videoGenOriginImageUrl)}
          </div>
        )}
      </div>
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

  const renderMediaContent = () => {
    // 视频任务
    if (record.action === 'VIDEO' || record.action === 'VIDEO_EXTEND') {
      return (
        <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.video' })}>
          {getVideoContent()}
        </Descriptions.Item>
      );
    }
    // 视频换脸任务
    else if (record.action === 'SWAP_VIDEO_FACE') {
      return (
        <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.video' })}>
          <Flex vertical>
            {/* <Flex>
                  <div>{getImage(record.replicateSource)}</div>
                  <div>{getVideo(record.replicateTarget)}</div>
                </Flex> */}
            {getVideo(record.imageUrl)}
          </Flex>
        </Descriptions.Item>
      );
    }
    // 普通图片任务
    else {
      return (
        <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.image' })}>
          {getImage(record.imageUrl)}
        </Descriptions.Item>
      );
    }
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

          {renderMediaContent()}

          {/* 视频任务的额外信息 */}
          {(record.action === 'VIDEO' || record.action === 'VIDEO_EXTEND') &&
            record.videoDuration && (
              <>
                <Descriptions.Item label="视频时长">{record.videoDuration}s</Descriptions.Item>
                <Descriptions.Item label="帧数">{record.frameCount}</Descriptions.Item>
              </>
            )}

          {/* {record.action === 'SWAP_VIDEO_FACE' ? (
            <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.video' })}>
              <Flex vertical>
 
                {getVideo(record.imageUrl)}
              </Flex>
            </Descriptions.Item>
          ) : (
            <Descriptions.Item label={intl.formatMessage({ id: 'pages.task.image' })}>
              {getImage(record.imageUrl)}
            </Descriptions.Item>
          )} */}
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
