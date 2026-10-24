import { importYouChuanAccounts, previewYouChuanAccountImport } from '@/services/mj/api';
import { InboxOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  InputNumber,
  notification,
  Row,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  theme,
  Typography,
  Upload,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';

/** localStorage 键：保存上一次确认导入的悠船参数，下次打开弹窗时回填 */
const IMPORT_OPTIONS_STORAGE_KEY = 'youchuan_import_options';

/** 与后端 YouChuanImportOptions 默认值保持一致（截图：并发 12、队列 48、慢速 3/12、权重 1、超时 20 分钟） */
const DEFAULT_IMPORT_OPTIONS = {
  coreSize: 12,
  queueSize: 48,
  relaxCoreSize: 3,
  relaxQueueSize: 12,
  weight: 1,
  isBlend: true,
  isDescribe: true,
  dayDrawLimit: -1,
  dayRelaxDrawLimit: -1,
  timeoutMinutes: 20,
};

/** 文件大小上限，必须与后端 YouChuanImportLimits.MaxFileBytes 保持一致 */
const MAX_IMPORT_FILE_BYTES = 20 * 1024 * 1024;

/** 预览表每页行数 */
const IMPORT_PAGE_SIZE = 10;

/** 导入参数表单值，字段与后端 YouChuanImportOptions 对齐 */
type ImportOptions = typeof DEFAULT_IMPORT_OPTIONS;

/** add = 新增，update = 更新已有账号，invalid = 无效行（不可勾选） */
type ImportRowStatus = 'add' | 'update' | 'invalid';

/** 悠船导入预览行，对应后端 YouChuanImportRow */
type ImportRow = {
  /** Excel 行号（1 开始），用于定位和错误提示 */
  rowNumber: number;
  /** 规范化后的虚拟号，用于重复账号匹配 */
  loginAccount: string;
  /** 虚拟 SmsCode/登录密码；纯数字时悠船按短信验证码登录 */
  loginPassword?: string;
  /** 套餐名称，仅用于展示和新建账号备注 */
  planName?: string;
  /** 套餐周期，仅用于展示和新建账号备注 */
  planCycle?: string;
  /** 预览状态 */
  status: ImportRowStatus;
  /** 无效原因或更新说明 */
  message?: string;
  /** 已存在的悠船账号 ID，仅更新行有值 */
  existingAccountId?: string;
};

/** 导入结果：failed 用于父组件选择 success/warning，description 用于通知内容 */
type ImportOutcome = {
  failed: number;
  description: string;
};

/** 导入弹窗内容组件属性 */
type ImportContentProps = {
  /** 取消导入并关闭弹窗 */
  onCancel: () => void;
  /** 导入完成回调；由父组件关闭弹窗并展示结果通知，避免通知随弹窗卸载 */
  onSuccess: (outcome: ImportOutcome) => void;
};

const toNumber = (value: unknown, fallback: number) => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * 读取上次保存的导入参数。
 * 浏览器记录可能来自旧版本或被手工改过，这里做类型收敛和范围限制，避免把字符串/null 直接提交给后端。
 */
const loadImportOptions = (): ImportOptions => {
  try {
    const raw = localStorage.getItem(IMPORT_OPTIONS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_IMPORT_OPTIONS;
    }

    const parsed = JSON.parse(raw) as Partial<ImportOptions>;
    return {
      coreSize: clamp(toNumber(parsed.coreSize, DEFAULT_IMPORT_OPTIONS.coreSize), 1, 12),
      queueSize: clamp(toNumber(parsed.queueSize, DEFAULT_IMPORT_OPTIONS.queueSize), 1, 100),
      relaxCoreSize: clamp(
        toNumber(parsed.relaxCoreSize, DEFAULT_IMPORT_OPTIONS.relaxCoreSize),
        1,
        12,
      ),
      relaxQueueSize: clamp(
        toNumber(parsed.relaxQueueSize, DEFAULT_IMPORT_OPTIONS.relaxQueueSize),
        1,
        100,
      ),
      weight: Math.max(toNumber(parsed.weight, DEFAULT_IMPORT_OPTIONS.weight), 1),
      isBlend:
        typeof parsed.isBlend === 'boolean' ? parsed.isBlend : DEFAULT_IMPORT_OPTIONS.isBlend,
      isDescribe:
        typeof parsed.isDescribe === 'boolean'
          ? parsed.isDescribe
          : DEFAULT_IMPORT_OPTIONS.isDescribe,
      dayDrawLimit: Math.max(
        toNumber(parsed.dayDrawLimit, DEFAULT_IMPORT_OPTIONS.dayDrawLimit),
        -1,
      ),
      dayRelaxDrawLimit: Math.max(
        toNumber(parsed.dayRelaxDrawLimit, DEFAULT_IMPORT_OPTIONS.dayRelaxDrawLimit),
        -1,
      ),
      timeoutMinutes: clamp(
        toNumber(parsed.timeoutMinutes, DEFAULT_IMPORT_OPTIONS.timeoutMinutes),
        1,
        1440,
      ),
    };
  } catch {
    return DEFAULT_IMPORT_OPTIONS;
  }
};

/**
 * 悠船账号 Excel 导入内容。
 * 负责文件预览、有效行勾选和账号池参数确认；导入结果交给父组件展示。
 */
const ImportContent = ({ onCancel, onSuccess }: ImportContentProps) => {
  const intl = useIntl();
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const initialOptions = useMemo(loadImportOptions, []);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parseError, setParseError] = useState<string>();

  // 按预览状态统计，用于顶部摘要；无效行也会展示，但不参与默认勾选。
  const counts = useMemo(
    () =>
      rows.reduce(
        (acc, row) => {
          acc[row.status] += 1;
          return acc;
        },
        { add: 0, update: 0, invalid: 0 } as Record<ImportRowStatus, number>,
      ),
    [rows],
  );

  /**
   * 选择文件后立即调用预览接口解析，不保存文件本身；确认导入时提交的是解析后的行数据。
   * 解析成功后默认勾选所有非无效行，用户仍可手动取消。
   */
  const handleFile = async (file: File) => {
    if (!/\.xlsx$/i.test(file.name || '')) {
      setFileName('');
      setRows([]);
      setSelectedRowKeys([]);
      setParseError(intl.formatMessage({ id: 'pages.account.importFileTypeError' }));
      return;
    }

    if (file.size > MAX_IMPORT_FILE_BYTES) {
      setFileName('');
      setRows([]);
      setSelectedRowKeys([]);
      setParseError(intl.formatMessage({ id: 'pages.account.importFileSizeError' }));
      return;
    }

    setParsing(true);
    setParseError(undefined);
    setRows([]);
    setSelectedRowKeys([]);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await previewYouChuanAccountImport(formData);
      if (res.success && res.data) {
        const parsedRows: ImportRow[] = res.data.rows || [];
        setRows(parsedRows);
        setSelectedRowKeys(
          parsedRows.filter((row) => row.status !== 'invalid').map((row) => String(row.rowNumber)),
        );
      } else {
        setParseError(res.message || intl.formatMessage({ id: 'pages.account.importParseFailed' }));
      }
    } catch (error: any) {
      setParseError(
        error?.message || intl.formatMessage({ id: 'pages.account.importParseFailed' }),
      );
    } finally {
      setParsing(false);
    }
  };

  /**
   * 确认导入：校验参数、保存浏览器记录，只提交当前勾选的行。
   * 结果通知由父组件展示，避免弹窗关闭后通知随 contextHolder 一起卸载。
   */
  const handleImport = async () => {
    // 双保险：即使表格全选把无效行带进来，也不提交无效行。
    const selectedRows = rows.filter(
      (row) => row.status !== 'invalid' && selectedRowKeys.includes(String(row.rowNumber)),
    );

    if (!selectedRows.length) {
      api.warning({
        message: intl.formatMessage({ id: 'pages.account.importConfirm' }),
        description: intl.formatMessage({ id: 'pages.account.importNoSelection' }),
      });
      return;
    }

    let options: ImportOptions;
    try {
      options = (await form.validateFields()) as ImportOptions;
    } catch {
      return;
    }

    setImporting(true);
    try {
      // 参数先落浏览器记录；即使导入失败也保留用户本次确认的参数，方便重试。
      try {
        localStorage.setItem(IMPORT_OPTIONS_STORAGE_KEY, JSON.stringify(options));
      } catch {
        // 忽略浏览器存储不可用的情况，不影响导入
      }

      const res = await importYouChuanAccounts({ rows: selectedRows, options });
      if (!res.success) {
        api.error({
          message: intl.formatMessage({ id: 'pages.account.importConfirm' }),
          description: res.message || intl.formatMessage({ id: 'pages.account.importFailed' }),
        });
        return;
      }

      const data = res.data || {};
      const created = data.created || 0;
      const updated = data.updated || 0;
      const failed = data.failed || 0;
      const description = intl.formatMessage(
        { id: 'pages.account.importResultSummary' },
        { created, updated, failed },
      );

      const errors = failed > 0 ? (data.errors || []).slice(0, 3).join('；') : '';
      onSuccess({
        failed,
        description: errors ? `${description} ${errors}` : description,
      });
    } catch (error: any) {
      api.error({
        message: intl.formatMessage({ id: 'pages.account.importConfirm' }),
        description: error?.message || intl.formatMessage({ id: 'pages.account.importFailed' }),
      });
    } finally {
      setImporting(false);
    }
  };

  /** 预览状态到 Tag 颜色/i18n key 的映射；后端状态值不变，只在这里做展示转换 */
  const statusMap: Record<ImportRowStatus, { color: string; messageId: string }> = {
    add: { color: 'success', messageId: 'pages.account.importNew' },
    update: { color: 'processing', messageId: 'pages.account.importUpdate' },
    invalid: { color: 'error', messageId: 'pages.account.importInvalid' },
  };

  // 预览列包含虚拟号和 SmsCode，仅管理员可见；导入接口本身也在 /mj/admin 鉴权范围内。
  const columns: ColumnsType<ImportRow> = [
    {
      title: intl.formatMessage({ id: 'pages.account.importRow' }),
      dataIndex: 'rowNumber',
      width: 60,
      align: 'center',
    },
    {
      title: intl.formatMessage({ id: 'pages.account.importPhone' }),
      dataIndex: 'loginAccount',
      width: 130,
    },
    {
      title: intl.formatMessage({ id: 'pages.account.importSmsCode' }),
      dataIndex: 'loginPassword',
      width: 110,
    },
    {
      title: intl.formatMessage({ id: 'pages.account.importPlanName' }),
      dataIndex: 'planName',
      width: 110,
    },
    {
      title: intl.formatMessage({ id: 'pages.account.importPlanCycle' }),
      dataIndex: 'planCycle',
      width: 80,
    },
    {
      title: intl.formatMessage({ id: 'pages.account.importStatus' }),
      dataIndex: 'status',
      width: 90,
      align: 'center',
      render: (status: ImportRowStatus) => {
        const config = statusMap[status] || statusMap.invalid;
        return <Tag color={config.color}>{intl.formatMessage({ id: config.messageId })}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.account.importMessage' }),
      dataIndex: 'message',
      ellipsis: true,
    },
  ];

  const youChuanContent = (
    <>
      {/* 仅用于选择文件并触发预览，文件不会直接上传保存；返回 false 阻止 antd 自动上传 */}
      <Upload.Dragger
        accept=".xlsx"
        maxCount={1}
        showUploadList={false}
        disabled={parsing}
        beforeUpload={(file) => {
          void handleFile(file);
          return false;
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          {parsing
            ? intl.formatMessage({ id: 'pages.account.importParsing' })
            : fileName || intl.formatMessage({ id: 'pages.account.importDropText' })}
        </p>
        <p className="ant-upload-hint">
          {intl.formatMessage({ id: 'pages.account.importDropHint' })}
        </p>
      </Upload.Dragger>

      {parseError && <Alert type="error" showIcon style={{ marginTop: 16 }} message={parseError} />}

      {rows.length > 0 && (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            <Typography.Text strong>
              {intl.formatMessage({ id: 'pages.account.importPreview' })}
            </Typography.Text>
            <Space size={12}>
              <Typography.Text type="secondary">{fileName}</Typography.Text>
              <Typography.Text type="secondary">
                {intl.formatMessage(
                  { id: 'pages.account.importSummary' },
                  {
                    add: counts.add,
                    update: counts.update,
                    invalid: counts.invalid,
                  },
                )}
              </Typography.Text>
            </Space>
          </div>

          <Table<ImportRow>
            size="small"
            rowKey={(record) => String(record.rowNumber)}
            columns={columns}
            dataSource={rows}
            scroll={{ x: 800 }}
            pagination={{
              pageSize: IMPORT_PAGE_SIZE,
              showSizeChanger: false,
              showTotal: (total) =>
                intl.formatMessage({ id: 'pages.account.importTotal' }, { total }),
            }}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
              // 无效行（缺少虚拟号/SmsCode 或文件内重复）不允许勾选，避免提交必然失败的数据。
              getCheckboxProps: (record) => ({
                disabled: record.status === 'invalid',
              }),
            }}
          />
        </>
      )}

      {/* 账号池参数：默认值来自截图/后端，确认导入时保存到 localStorage 供下次回填 */}
      <Card
        type="inner"
        title={intl.formatMessage({ id: 'pages.account.importParams' })}
        style={{ marginTop: 16 }}
      >
        <Form form={form} layout="vertical" initialValues={initialOptions}>
          {/* 快速模式：并发、队列、日限额放在同一组，避免与慢速参数混排 */}
          <Divider orientation="left" plain style={{ margin: '0 0 12px' }}>
            {intl.formatMessage({ id: 'pages.account.importGroupFast' })}
          </Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label={intl.formatMessage({ id: 'pages.account.coreSize' })}
                name="coreSize"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={12} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label={intl.formatMessage({ id: 'pages.account.queueSize' })}
                name="queueSize"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label={intl.formatMessage({ id: 'pages.account.dayDrawLimitFast' })}
                name="dayDrawLimit"
                extra={intl.formatMessage({ id: 'pages.account.importDayDrawLimitHelp' })}
                rules={[{ required: true }]}
              >
                <InputNumber min={-1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {/* 慢速模式：与快速模式字段一一对应，标签已带“慢速”后缀 */}
          <Divider orientation="left" plain style={{ margin: '8px 0 12px' }}>
            {intl.formatMessage({ id: 'pages.account.importGroupRelax' })}
          </Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label={intl.formatMessage({ id: 'pages.account.relaxCoreSize' })}
                name="relaxCoreSize"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={12} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label={intl.formatMessage({ id: 'pages.account.relaxQueueSize' })}
                name="relaxQueueSize"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label={intl.formatMessage({ id: 'pages.account.dayDrawLimitRelax' })}
                name="dayRelaxDrawLimit"
                extra={intl.formatMessage({ id: 'pages.account.importDayDrawLimitHelp' })}
                rules={[{ required: true }]}
              >
                <InputNumber min={-1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {/* 通用设置：账号选择、超时和功能开关，不属于某一速度模式 */}
          <Divider orientation="left" plain style={{ margin: '8px 0 12px' }}>
            {intl.formatMessage({ id: 'pages.account.importGroupCommon' })}
          </Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label={intl.formatMessage({ id: 'pages.account.weight' })}
                name="weight"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label={intl.formatMessage({ id: 'pages.account.timeoutMinutes' })}
                name="timeoutMinutes"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  addonAfter={intl.formatMessage({ id: 'pages.minutes' })}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label={intl.formatMessage({ id: 'pages.account.isBlend' })}
                name="isBlend"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label={intl.formatMessage({ id: 'pages.account.isDescribe' })}
                name="isDescribe"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </>
  );

  return (
    <>
      {contextHolder}
      {/* 目前仅实现悠船 Excel 导入；Discord/Midjourney 先保留入口占位，因此禁用 */}
      <Tabs
        items={[
          {
            key: 'youchuan',
            label: intl.formatMessage({ id: 'pages.account.importYouchuanTab' }),
            children: youChuanContent,
          },
          {
            key: 'discord',
            label: intl.formatMessage({ id: 'pages.account.importDiscordTab' }),
            disabled: true,
            children: null,
          },
          {
            key: 'midjourney',
            label: intl.formatMessage({ id: 'pages.account.importMidjourneyTab' }),
            disabled: true,
            children: null,
          },
        ]}
      />

      {/* 底部操作栏固定在滚动容器底部，不随预览和参数表单滚动 */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          marginTop: 16,
          paddingTop: 12,
          paddingBottom: 4,
          textAlign: 'right',
          background: token.colorBgElevated,
          borderTop: `1px solid ${token.colorSplit}`,
        }}
      >
        <Space>
          <Button onClick={onCancel}>{intl.formatMessage({ id: 'pages.cancel' })}</Button>
          <Button
            type="primary"
            loading={importing}
            disabled={parsing || !rows.length || !selectedRowKeys.length}
            onClick={handleImport}
          >
            {intl.formatMessage({ id: 'pages.account.importConfirm' })}
          </Button>
        </Space>
      </div>
    </>
  );
};

export default ImportContent;
