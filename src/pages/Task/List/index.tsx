import MyModal from '@/pages/components/Modal';
import TaskContent from '@/pages/Task/components/TaskContent';
import { deleteTask, queryTask } from '@/services/mj/api';
import { DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Button,
  Card,
  Form,
  Image,
  Modal,
  notification,
  Popconfirm,
  Progress,
  Spin,
  Tag,
} from 'antd';
import React, { useRef, useState } from 'react';

const List: React.FC = () => {
  // 初始化 dataSource 状态为空数组
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [title, setTitle] = useState<string>('');
  const [footer, setFooter] = useState({});
  const [modalWidth, setModalWidth] = useState(1000);
  const [form] = Form.useForm();
  const intl = useIntl();

  const imagePrefix = sessionStorage.getItem('mj-image-prefix') || '';

  const [api, contextHolder] = notification.useNotification();

  const actionRef = useRef();

  const hideModal = () => {
    setModalContent({});
    setFooter({});
    setModalVisible(false);
  };

  const openModal = (title: string, content: any, footer: any, modalWidth: number) => {
    form.resetFields();
    setTitle(title);
    setModalContent(content);
    setFooter(footer);
    setModalWidth(modalWidth);
    setModalVisible(true);
  };

  const onDelete = async (id: string) => {
    try {
      const res = await deleteTask(id);
      if (res.success) {
        api.success({
          message: 'success',
          description: intl.formatMessage({ id: 'pages.task.deleteSuccess' }),
        });
        actionRef.current?.reload();
      } else {
        api.error({
          message: 'error',
          description: res.message,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  const [loading, setLoading] = useState(true);

  const handleImageLoad = () => {
    setLoading(false);
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

  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 160,
      align: 'center',
      fixed: 'left',
      render: (text, record) => (
        <a
          onClick={() =>
            openModal(
              intl.formatMessage({ id: 'pages.task.info' }),
              <TaskContent record={record} />,
              null,
              1100,
            )
          }
        >
          {text}
        </a>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.task.type' }),
      dataIndex: 'action',
      width: 140,
      align: 'center',
      request: async () => [
        {
          label: 'IMAGINE (想象)',
          value: 'IMAGINE',
        },
        {
          label: 'UPSCALE (放大)',
          value: 'UPSCALE',
        },
        {
          label: 'UPSCALE_HD (高清)',
          value: 'UPSCALE_HD',
        },
        {
          label: 'VARIATION (变化)',
          value: 'VARIATION',
        },
        {
          label: 'ZOOM (变焦)',
          value: 'ZOOM',
        },
        {
          label: 'PAN (平移)',
          value: 'PAN',
        },
        {
          label: 'DESCRIBE (图生文)',
          value: 'DESCRIBE',
        },
        {
          label: 'BLEND (混图)',
          value: 'BLEND',
        },
        {
          label: 'SHORTEN (简化)',
          value: 'SHORTEN',
        },
      
        {
          label: 'VIDEO (视频)',
          value: 'VIDEO',
        },
        {
          label: 'EDIT (编辑)',
          value: 'EDIT',
        },
        {
          label: 'RETEXTURE (转绘)',
          value: 'RETEXTURE',
        },
        {
          label: 'SWAP_FACE (图片换脸)',
          value: 'SWAP_FACE',
        },
        {
          label: 'SWAP_VIDEO_FACE (视频换脸)',
          value: 'SWAP_VIDEO_FACE',
        },
      ],
      render: (text, record) => record['displays']['action'],
    },
    {
      title: intl.formatMessage({ id: 'pages.task.preview' }),
      dataIndex: 'imageUrl',
      width: 80,
      align: 'center',
      hideInSearch: true,
      render: (text, record, index) => {
        if (record.action === 'SWAP_VIDEO_FACE') {
          // 点击图片显示视频
          return (
            record.thumbnailUrl && (
              <Image
                style={{ borderRadius: 0, maxWidth: 120, objectFit: 'cover', cursor: 'pointer' }}
                key={index}
                height={60}
                src={record.thumbnailUrl}
                preview={false}
                onClick={() => {
                  window.open(record.imageUrl);
                }}
                loading="lazy"
                onLoad={handleImageLoad}
                placeholder={
                  <div
                    style={{
                      width: 120,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Spin spinning={loading} />
                  </div>
                }
              />
            )
          );
        }

        // 如果是视频
        if (record.contentType === 'video/mp4') {
          // 点击查看播放视频，使用视频组件
          // 点击才显示视频
          return (
            <div
              style={{
                position: 'relative',
                cursor: 'pointer',
                display: 'inline-block',
              }}
              onClick={() => {
                setCurrentVideoUrl(record.imageUrl || record.url);
                setVideoModalVisible(true);
              }}
            >
              <Button icon={<PlayCircleOutlined />}></Button>
            </div>
          );
        }

        return (
          (record.thumbnailUrl || record.imageUrl) && (
            <Image.PreviewGroup items={record.images || []}>
              <Image
                style={{ borderRadius: 0, maxWidth: 120, objectFit: 'cover' }}
                key={index}
                height={60}
                src={
                  record.action === 'VIDEO'
                    ? record.imageUrl
                    : record.thumbnailUrl || record.imageUrl
                }
                preview={{
                  src: record.imageUrl,
                  mask: <Spin spinning={loading} />,
                }}
                loading="lazy"
                onLoad={handleImageLoad}
                placeholder={
                  <div
                    style={{
                      width: 120,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Spin spinning={loading} />
                  </div>
                }
              />
            </Image.PreviewGroup>
          )
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.task.instanceId' }),
      dataIndex: 'instanceId',
      width: 180,
      align: 'center',
      render: (text, record) => record['properties']['discordInstanceId'],
    },
    {
      title: intl.formatMessage({ id: 'pages.task.submitTime' }),
      dataIndex: 'submitTime',
      width: 160,
      hideInSearch: true,
      align: 'center',
      render: (text, record) => record['displays']['submitTime'],
    },
    {
      title: intl.formatMessage({ id: 'pages.task.status' }),
      dataIndex: 'status',
      width: 90,
      align: 'center',
      request: async () => [
        {
          label: 'NOT_START (未开始)',
          value: 'NOT_START',
        },
        {
          label: 'SUBMITTED (已提交)',
          value: 'SUBMITTED',
        },
        {
          label: 'MODAL (弹窗等待)',
          value: 'MODAL',
        },
        {
          label: 'IN_PROGRESS (执行中)',
          value: 'IN_PROGRESS',
        },
        {
          label: 'FAILURE (失败)',
          value: 'FAILURE',
        },
        {
          label: 'SUCCESS (成功)',
          value: 'SUCCESS',
        },
        {
          label: 'CANCEL (已取消)',
          value: 'CANCEL',
        },
      ],
      render: (text, record) => {
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
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.task.mode' }),
      dataIndex: 'mode',
      width: 90,
      align: 'center',
      request: async () => [
        {
          label: 'RELAX',
          value: 'RELAX',
        },
        {
          label: 'FAST',
          value: 'FAST',
        },
        {
          label: 'TURBO',
          value: 'TURBO',
        },
      ],
      render: (text: string, record: any) => {
        return record.mode || 'FAST';
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.task.progress' }),
      dataIndex: 'progress',
      width: 130,
      showInfo: false,
      hideInSearch: true,
      render: (text, record) => {
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
        return <Progress percent={percent} status={status} size="small" />;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.task.useTime' }),
      dataIndex: 'useTime',
      width: 80,
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.task.description' }),
      dataIndex: 'description',
      width: 250,
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.task.failReason' }),
      dataIndex: 'failReason',
      width: 220,
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.operation' }),
      dataIndex: 'operation',
      width: 100,
      key: 'operation',
      fixed: 'right',
      align: 'center',
      hideInSearch: true,
      render: (_, record) => {
        return (
          <Popconfirm
            title={intl.formatMessage({ id: 'pages.task.delete' })}
            description={intl.formatMessage({ id: 'pages.task.deleteTitle' })}
            onConfirm={() => onDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />}></Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <PageContainer>
      {contextHolder}
      <Card>
        <ProTable
          columns={columns}
          scroll={{ x: 1000 }}
          search={{ defaultCollapsed: true }}
          pagination={{
            pageSize: 10,
            showQuickJumper: false,
            showSizeChanger: false,
          }}
          rowKey="id"
          actionRef={actionRef}
          request={async (params) => {
            const res = await queryTask({ ...params, pageNumber: params.current - 1 });
            const images = res.list.map((item) => item.imageUrl || '').filter((item) => item != '');
            const list = res.list;
            list.forEach((item, index) => {
              item.images = images;
            });
            return {
              data: list,
              total: res.pagination.total,
              success: true,
            };
          }}
        />
      </Card>

      <MyModal
        title={title}
        modalVisible={modalVisible}
        hideModal={hideModal}
        modalContent={modalContent}
        footer={footer}
        modalWidth={modalWidth}
      ></MyModal>

      <Modal
        title="视频播放"
        open={videoModalVisible}
        onCancel={() => setVideoModalVisible(false)}
        footer={null}
        width={800}
        centered
        destroyOnClose
      >
        <video controls autoPlay width="100%" style={{ maxHeight: '400px' }}>
          <source src={currentVideoUrl} type="video/mp4" />
          您的浏览器不支持视频播放
        </video>
      </Modal>
    </PageContainer>
  );
};

export default List;
