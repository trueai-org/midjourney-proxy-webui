import {
  clearBannedWordTests,
  createBannedWordTest,
  deleteBannedWordTest,
  queryBannedWordTests,
  retryFailedBannedWordTests,
} from '@/services/mj/api';
import { ClearOutlined, DeleteOutlined, RedoOutlined, ReloadOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Segmented,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useRef, useState } from 'react';

/** 违规词测试状态（与后端 BannedWordTestStatus 字符串枚举保持一致） */
type TestStatus = 'NOT_STARTED' | 'RUNNING' | 'PASSED' | 'VIOLATION' | 'FAILED';

/** 违规词测试任务 */
interface TestTask {
  id: string;
  word: string;
  prompt: string;
  status: TestStatus;
  mjTaskId?: string;
  failReason?: string;
  submitTimeFormat?: string;
  finishTimeFormat?: string;
}

/** 确认违规词记录 */
interface ConfirmedWord {
  word: string;
  count: number;
  reason?: string;
  lastConfirmedTimeFormat: string;
}

/** 违规词测试列表结果 */
interface TestListResult {
  list: TestTask[];
  total: number;
  notStartedCount: number;
  runningCount: number;
  passedCount: number;
  violationCount: number;
  failedCount: number;
  globalConcurrency: number;
  template?: string;
  confirmed: ConfirmedWord[];
}

/** 测试弹窗属性 */
interface BannedWordTestModalProps {
  /** 是否显示 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
}

const EMPTY_RESULT: TestListResult = {
  list: [],
  total: 0,
  notStartedCount: 0,
  runningCount: 0,
  passedCount: 0,
  violationCount: 0,
  failedCount: 0,
  globalConcurrency: 3,
  confirmed: [],
};

const STATUS_COLORS: Record<TestStatus, string> = {
  NOT_STARTED: 'default',
  RUNNING: 'processing',
  PASSED: 'success',
  VIOLATION: 'error',
  FAILED: 'warning',
};

const STATUS_LABEL_KEYS: Record<TestStatus, string> = {
  NOT_STARTED: 'pages.word.test.status.notStarted',
  RUNNING: 'pages.word.test.status.running',
  PASSED: 'pages.word.test.status.passed',
  VIOLATION: 'pages.word.test.status.violation',
  FAILED: 'pages.word.test.status.failed',
};

/**
 * 解析用户输入的违规词
 * 支持英文逗号、中文逗号、分号、换行分隔；去空、去重
 * @param text 用户输入
 * @returns 违规词数组
 */
const parseWords = (text?: string): string[] => {
  if (!text) {
    return [];
  }

  return Array.from(
    new Set(
      text
        .split(/[,，;；\r\n]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  );
};

/**
 * 违规词测试弹窗
 * 支持创建测试批次、查看未开始/进行中/已完成任务、人工删除和继续追加
 */
const BannedWordTestModal: React.FC<BannedWordTestModalProps> = ({ open, onClose }) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [result, setResult] = useState<TestListResult>(EMPTY_RESULT);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<string>('tasks');
  const [retrying, setRetrying] = useState(false);
  const loadingRef = useRef(false);
  const pollingRef = useRef(true);
  const settingsInitializedRef = useRef(false);

  /**
   * 加载测试任务
   * @param silent 静默刷新（轮询时不显示 loading）
   */
  const load = useCallback(
    async (silent: boolean) => {
      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      if (!silent) {
        setLoading(true);
      }

      try {
        const res = await queryBannedWordTests({
          current,
          pageSize,
          keyword: keyword || undefined,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
        });

        if (res?.success && res.data) {
          pollingRef.current = true;
          const data = res.data as TestListResult;
          setResult(data);

          // 首次加载时回填已持久化的提示词模板和并发数，避免覆盖用户正在编辑的内容
          if (!settingsInitializedRef.current) {
            form.setFieldsValue({
              template: data.template || undefined,
              concurrency: data.globalConcurrency || 3,
            });
            settingsInitializedRef.current = true;
          }
        } else {
          pollingRef.current = false;
          if (!silent) {
            message.error(res?.message || intl.formatMessage({ id: 'pages.word.test.loadFailed' }));
          }
        }
      } catch (error: any) {
        pollingRef.current = false;
        if (!silent) {
          message.error(error?.message || intl.formatMessage({ id: 'pages.word.test.loadFailed' }));
        }
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [current, pageSize, keyword, statusFilter, intl, form],
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setCurrent(1);
    setPageSize(10);
    setKeyword('');
    setStatusFilter('ALL');
    setActiveTab('tasks');
    pollingRef.current = true;
    settingsInitializedRef.current = false;

    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    load(false);
    const timer = window.setInterval(() => {
      if (pollingRef.current) {
        load(true);
      }
    }, 3000);

    return () => {
      window.clearInterval(timer);
    };
  }, [open, load]);

  /**
   * 创建测试批次
   */
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const words = parseWords(values.words);

      if (words.length === 0) {
        message.warning(intl.formatMessage({ id: 'pages.word.test.words.required' }));
        return;
      }

      if (words.length > 200) {
        message.warning(intl.formatMessage({ id: 'pages.word.test.words.tooMany' }));
        return;
      }

      setSubmitting(true);
      const res = await createBannedWordTest({
        words,
        template: values.template?.trim() || '',
        concurrency: values.concurrency || 3,
      });

      if (res?.success) {
        const addedCount = (res.data as { addedCount?: number } | undefined)?.addedCount || words.length;
        message.success(
          intl.formatMessage({ id: 'pages.word.test.createSuccess' }, { count: addedCount }),
        );
        form.resetFields(['words']);
        setCurrent(1);
        await load(true);
      } else {
        message.error(res?.message || intl.formatMessage({ id: 'pages.word.test.createFailed' }));
      }
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      message.error(error?.message || intl.formatMessage({ id: 'pages.word.test.createFailed' }));
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 删除单条测试任务记录
   * @param id 测试任务 ID
   */
  const handleDelete = async (id: string) => {
    try {
      const res = await deleteBannedWordTest(id);
      if (res?.success) {
        message.success(intl.formatMessage({ id: 'pages.word.test.deleteSuccess' }));
        await load(true);
      } else {
        message.error(res?.message || intl.formatMessage({ id: 'pages.word.test.deleteFailed' }));
      }
    } catch (error: any) {
      message.error(error?.message || intl.formatMessage({ id: 'pages.word.test.deleteFailed' }));
    }
  };

  /**
   * 清空所有测试记录
   */
  const handleClear = async () => {
    try {
      const res = await clearBannedWordTests();
      if (res?.success) {
        message.success(
          res.message || intl.formatMessage({ id: 'pages.word.test.clearSuccess' }),
        );
        setCurrent(1);
        setKeyword('');
        setStatusFilter('ALL');
        await load(false);
      } else {
        message.error(res?.message || intl.formatMessage({ id: 'pages.word.test.clearFailed' }));
      }
    } catch (error: any) {
      message.error(error?.message || intl.formatMessage({ id: 'pages.word.test.clearFailed' }));
    }
  };

  /**
   * 重试所有测试失败的任务
   */
  const handleRetryFailed = async () => {
    setRetrying(true);
    try {
      const res = await retryFailedBannedWordTests();
      if (res?.success) {
        message.success(
          res.message ||
            intl.formatMessage(
              { id: 'pages.word.test.retrySuccess' },
              { count: result.failedCount },
            ),
        );
        if (statusFilter === 'FAILED') {
          setStatusFilter('NOT_STARTED');
        }
        setCurrent(1);
        await load(true);
      } else {
        message.error(res?.message || intl.formatMessage({ id: 'pages.word.test.retryFailedMessage' }));
      }
    } catch (error: any) {
      message.error(
        error?.message || intl.formatMessage({ id: 'pages.word.test.retryFailedMessage' }),
      );
    } finally {
      setRetrying(false);
    }
  };

  /**
   * 渲染测试结果
   * @param record 测试任务
   * @returns 结果节点
   */
  const renderResult = (record: TestTask) => {
    if (record.status === 'PASSED') {
      return (
        <Typography.Text type="success">
          {intl.formatMessage({ id: 'pages.word.test.passedResult' })}
        </Typography.Text>
      );
    }

    if (record.status === 'VIOLATION' || record.status === 'FAILED') {
      return (
        <Tooltip title={record.failReason || '-'}>
          <Typography.Text
            type={record.status === 'VIOLATION' ? 'danger' : 'warning'}
            ellipsis
            style={{ maxWidth: 240 }}
          >
            {record.failReason || '-'}
          </Typography.Text>
        </Tooltip>
      );
    }

    return <Typography.Text type="secondary">-</Typography.Text>;
  };

  const columns: ColumnsType<TestTask> = [
    {
      title: intl.formatMessage({ id: 'pages.word.test.words' }),
      dataIndex: 'word',
      width: 150,
      render: (_, record) => <Typography.Text strong>{record.word}</Typography.Text>,
    },
    {
      title: intl.formatMessage({ id: 'pages.word.test.status' }),
      dataIndex: 'status',
      width: 110,
      render: (_, record) => (
        <Tag color={STATUS_COLORS[record.status]}>
          {intl.formatMessage({
            id: STATUS_LABEL_KEYS[record.status] || STATUS_LABEL_KEYS.NOT_STARTED,
          })}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.word.test.prompt' }),
      dataIndex: 'prompt',
      width: 360,
      render: (_, record) => (
        <Tooltip
          title={
            <div style={{ maxWidth: 600, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {record.prompt}
            </div>
          }
        >
          <Typography.Text ellipsis style={{ maxWidth: 330 }}>
            {record.prompt}
          </Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.word.test.result' }),
      dataIndex: 'failReason',
      width: 260,
      render: (_, record) => renderResult(record),
    },
    {
      title: intl.formatMessage({ id: 'pages.word.test.executionTime' }),
      dataIndex: 'submitTimeFormat',
      width: 170,
      render: (_, record) => record.submitTimeFormat || '-',
    },
    {
      title: intl.formatMessage({ id: 'pages.operation' }),
      key: 'operation',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Popconfirm
          title={intl.formatMessage({ id: 'pages.word.test.delete' })}
          description={intl.formatMessage({ id: 'pages.word.test.deleteTitle' })}
          onConfirm={() => handleDelete(record.id)}
        >
          <Tooltip title={intl.formatMessage({ id: 'pages.word.test.delete' })}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  const confirmedColumns: ColumnsType<ConfirmedWord> = [
    {
      title: intl.formatMessage({ id: 'pages.word.test.words' }),
      dataIndex: 'word',
      width: 220,
      render: (_, record) => <Typography.Text strong>{record.word}</Typography.Text>,
    },
    {
      title: intl.formatMessage({ id: 'pages.word.test.confirmCount' }),
      dataIndex: 'count',
      width: 100,
      align: 'center',
    },
    {
      title: intl.formatMessage({ id: 'pages.word.test.lastConfirmedTime' }),
      dataIndex: 'lastConfirmedTimeFormat',
      width: 180,
    },
    {
      title: intl.formatMessage({ id: 'pages.word.test.reason' }),
      dataIndex: 'reason',
      render: (_, record) => (
        <Tooltip title={record.reason || '-'}>
          <Typography.Text ellipsis style={{ maxWidth: 520 }}>
            {record.reason || '-'}
          </Typography.Text>
        </Tooltip>
      ),
    },
  ];

  // 状态数量直接并入筛选项，不再额外显示一排 tag 统计
  const totalTaskCount =
    result.notStartedCount +
    result.runningCount +
    result.passedCount +
    result.violationCount +
    result.failedCount;

  const statusOptions = [
    { label: `${intl.formatMessage({ id: 'pages.word.test.status.all' })} (${totalTaskCount})`, value: 'ALL' },
    {
      label: `${intl.formatMessage({ id: 'pages.word.test.status.notStarted' })} (${result.notStartedCount})`,
      value: 'NOT_STARTED',
    },
    {
      label: `${intl.formatMessage({ id: 'pages.word.test.status.running' })} (${result.runningCount})`,
      value: 'RUNNING',
    },
    {
      label: `${intl.formatMessage({ id: 'pages.word.test.status.passed' })} (${result.passedCount})`,
      value: 'PASSED',
    },
    {
      label: `${intl.formatMessage({ id: 'pages.word.test.status.violation' })} (${result.violationCount})`,
      value: 'VIOLATION',
    },
    {
      label: `${intl.formatMessage({ id: 'pages.word.test.status.failed' })} (${result.failedCount})`,
      value: 'FAILED',
    },
  ];

  // 清空按钮按全量统计判断，避免筛选后无结果时误禁用
  const hasAnyTestData =
    result.notStartedCount +
      result.runningCount +
      result.passedCount +
      result.violationCount +
      result.failedCount >
      0 || result.confirmed.length > 0;

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={1280}
        destroyOnClose
        title={intl.formatMessage({ id: 'pages.word.test.title' })}
        styles={{ body: { maxHeight: '76vh', overflowY: 'auto' } }}
      >
        <Form form={form} layout="vertical" initialValues={{ concurrency: 3 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <Form.Item
              name="words"
              label={intl.formatMessage({ id: 'pages.word.test.words' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'pages.word.test.words.required' }),
                },
              ]}
              style={{ flex: 1 }}
              tooltip={intl.formatMessage({ id: 'pages.word.test.words.tooltip' })}
            >
              <Input.TextArea
                rows={3}
                placeholder={intl.formatMessage({ id: 'pages.word.test.words.placeholder' })}
                allowClear
              />
            </Form.Item>

            <Form.Item
              name="template"
              label={intl.formatMessage({ id: 'pages.word.test.template' })}
              style={{ flex: 1.6 }}
              tooltip={intl.formatMessage({ id: 'pages.word.test.template.tooltip' })}
            >
              <Input.TextArea
                rows={3}
                placeholder={intl.formatMessage({ id: 'pages.word.test.template.placeholder' })}
                allowClear
              />
            </Form.Item>

            <Form.Item
              name="concurrency"
              label={intl.formatMessage({ id: 'pages.word.test.concurrency' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'pages.word.test.concurrency.range' }),
                },
              ]}
              style={{ width: 110 }}
              tooltip={intl.formatMessage({ id: 'pages.word.test.concurrency.tooltip' })}
            >
              <InputNumber min={1} max={20} precision={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Space style={{ marginBottom: 12 }}>
            <Button type="primary" loading={submitting} onClick={handleCreate}>
              {intl.formatMessage({ id: 'pages.word.test.start' })}
            </Button>
            <Typography.Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
              {intl.formatMessage({ id: 'pages.word.test.retained' })}
            </Typography.Text>
            <Typography.Text type="warning" style={{ whiteSpace: 'nowrap' }}>
              {intl.formatMessage({ id: 'pages.word.test.warning' })}
            </Typography.Text>
          </Space>
        </Form>

        <Divider style={{ margin: '4px 0 12px' }} />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'tasks',
              label: `${intl.formatMessage({ id: 'pages.word.test.tasks' })} (${totalTaskCount})`,
              children: (
                <>
                  <Space wrap style={{ marginBottom: 12 }}>
                    <Segmented
                      value={statusFilter}
                      options={statusOptions}
                      onChange={(value) => {
                        setStatusFilter(value as string);
                        setCurrent(1);
                      }}
                    />
                    <Input.Search
                      allowClear
                      placeholder={intl.formatMessage({ id: 'pages.word.test.search' })}
                      style={{ width: 240 }}
                      onSearch={(value) => {
                        setKeyword(value.trim());
                        setCurrent(1);
                      }}
                    />
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        pollingRef.current = true;
                        load(false);
                      }}
                    >
                      {intl.formatMessage({ id: 'pages.word.test.refresh' })}
                    </Button>
                    <Popconfirm
                      title={intl.formatMessage({ id: 'pages.word.test.retryConfirmTitle' })}
                      description={intl.formatMessage({ id: 'pages.word.test.retryConfirmDesc' })}
                      okText={intl.formatMessage({ id: 'pages.word.test.retryConfirm' })}
                      onConfirm={handleRetryFailed}
                      disabled={result.failedCount === 0}
                    >
                      <Button
                        icon={<RedoOutlined />}
                        loading={retrying}
                        disabled={result.failedCount === 0}
                      >
                        {intl.formatMessage({ id: 'pages.word.test.retryFailed' })}
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      title={intl.formatMessage({ id: 'pages.word.test.clearConfirmTitle' })}
                      description={intl.formatMessage({ id: 'pages.word.test.clearConfirmDesc' })}
                      onConfirm={handleClear}
                      disabled={!hasAnyTestData}
                    >
                      <Button danger icon={<ClearOutlined />} disabled={!hasAnyTestData}>
                        {intl.formatMessage({ id: 'pages.word.test.clear' })}
                      </Button>
                    </Popconfirm>
                  </Space>

                  <Table<TestTask>
                    rowKey="id"
                    size="small"
                    loading={loading}
                    columns={columns}
                    dataSource={result.list}
                    tableLayout="fixed"
                    locale={{
                      emptyText: intl.formatMessage({ id: 'pages.word.test.empty' }),
                    }}
                    pagination={{
                      current,
                      pageSize,
                      total: result.total,
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '20', '50'],
                      onChange: (page, size) => {
                        setCurrent(page);
                        setPageSize(size);
                      },
                    }}
                  />
                </>
              ),
            },
            {
              key: 'confirmed',
              label: `${intl.formatMessage({ id: 'pages.word.test.confirmed' })} (${result.confirmed.length})`,
              children: (
                <>
                  <Typography.Text
                    type="secondary"
                    style={{ display: 'block', marginBottom: 8, whiteSpace: 'nowrap' }}
                  >
                    {intl.formatMessage({ id: 'pages.word.test.autoAppendTip' })}
                  </Typography.Text>
                  <Table<ConfirmedWord>
                    rowKey="word"
                    size="small"
                    columns={confirmedColumns}
                    dataSource={result.confirmed}
                    tableLayout="fixed"
                    locale={{
                      emptyText: intl.formatMessage({ id: 'pages.word.test.noConfirmed' }),
                    }}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: false,
                      hideOnSinglePage: true,
                    }}
                  />
                </>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
};

export default BannedWordTestModal;
