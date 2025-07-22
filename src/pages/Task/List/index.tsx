import MyModal from '@/pages/components/Modal';
import TaskContent from '@/pages/Task/components/TaskContent';
import { deleteTask, queryTask } from '@/services/mj/api';
import { DeleteOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Card, Form, Image, notification, Popconfirm, Progress, Spin, Tag } from 'antd';
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
          label: 'Imagine',
          value: 'IMAGINE',
        },
        {
          label: 'Upscale',
          value: 'UPSCALE',
        },
        {
          label: 'Variation',
          value: 'VARIATION',
        },
        {
          label: 'Zoom',
          value: 'ZOOM',
        },
        {
          label: 'Pan',
          value: 'PAN',
        },
        {
          label: 'Describe',
          value: 'DESCRIBE',
        },
        {
          label: 'Blend',
          value: 'BLEND',
        },
        {
          label: 'Shorten',
          value: 'SHORTEN',
        },
        {
          label: 'SwapFace',
          value: 'SWAP_FACE',
        },
        {
          label: 'SwapVideoFace',
          value: 'SWAP_VIDEO_FACE',
        },
        {
          label: 'Video',
          value: 'VIDEO',
        },
        {
          label: 'Video Extend',
          value: 'VIDEO_EXTEND',
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

        return (
          (record.thumbnailUrl || record.imageUrl) && (
            <Image.PreviewGroup items={record.images || []}>
              <Image
                style={{ borderRadius: 0, maxWidth: 120, objectFit: 'cover' }}
                key={index}
                height={60}
                src={record.thumbnailUrl || record.imageUrl}
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
          label: intl.formatMessage({ id: 'pages.task.NOT_START' }),
          value: 'NOT_START',
        },
        {
          label: intl.formatMessage({ id: 'pages.task.SUBMITTED' }),
          value: 'SUBMITTED',
        },
        {
          label: intl.formatMessage({ id: 'pages.task.MODAL' }),
          value: 'MODAL',
        },
        {
          label: intl.formatMessage({ id: 'pages.task.IN_PROGRESS' }),
          value: 'IN_PROGRESS',
        },
        {
          label: intl.formatMessage({ id: 'pages.task.FAILURE' }),
          value: 'FAILURE',
        },
        {
          label: intl.formatMessage({ id: 'pages.task.SUCCESS' }),
          value: 'SUCCESS',
        },
        {
          label: intl.formatMessage({ id: 'pages.task.CANCEL' }),
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
    </PageContainer>
  );
};

export default List;
