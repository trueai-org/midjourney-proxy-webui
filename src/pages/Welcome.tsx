import { getIndex } from '@/services/mj/api';
import {
  BugOutlined,
  ClockCircleOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  NodeIndexOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useModel } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  List,
  message,
  Row,
  Space,
  Statistic,
  Tag,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { Text, Title } = Typography;

/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */
const InfoCard: React.FC<{
  title: string;
  index: number;
  desc: string;
  href: string;
}> = ({ title, href, index, desc }) => {
  const intl = useIntl();
  const { useToken } = theme;

  const { token } = useToken();

  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
        boxShadow: token.boxShadow,
        borderRadius: '8px',
        fontSize: '14px',
        color: token.colorTextSecondary,
        lineHeight: '22px',
        padding: '16px 19px',
        minWidth: '220px',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            lineHeight: '22px',
            backgroundSize: '100%',
            textAlign: 'center',
            padding: '8px 16px 16px 12px',
            color: '#FFF',
            fontWeight: 'bold',
            backgroundImage:
              "url('https://gw.alipayobjects.com/zos/bmw-prod/daaf8d50-8e6d-4251-905d-676a24ddfa12.svg')",
          }}
        >
          {index}
        </div>
        <div
          style={{
            fontSize: '16px',
            color: token.colorText,
            paddingBottom: 8,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: token.colorTextSecondary,
          textAlign: 'justify',
          lineHeight: '22px',
          marginBottom: 8,
        }}
      >
        {desc}
      </div>
      <a href={href} target="_blank" rel="noreferrer">
        {intl.formatMessage({ id: 'pages.welcome.learnMore' })} {'>'}
      </a>
    </div>
  );
};

/**
 * 节点切换组件
 */
const NodeSwitcher: React.FC<{
  nodes: string[];
  currentNode: string | null;
}> = ({ nodes, currentNode }) => {
  const intl = useIntl();
  const { token } = theme.useToken();

  // 获取当前节点（从 URL 路径中提取）
  const getCurrentNodeFromUrl = (): string | null => {
    const path = window.location.pathname;
    const match = path.match(/^\/ip\/([^/]+)/);
    return match ? match[1] : null;
  };

  const activeNode = getCurrentNodeFromUrl();

  const handleNodeSwitch = (node: string) => {
    // 切换到指定节点
    const newPath = `/ip/${node}/`;
    window.location.href = window.location.origin + newPath;
    message.success(intl.formatMessage({ id: 'pages.welcome.nodeSwitchSuccess' }));
  };

  const handleSwitchToDefault = () => {
    // 返回默认节点
    window.location.href = window.location.origin;
    message.success(intl.formatMessage({ id: 'pages.welcome.nodeSwitchSuccess' }));
  };

  const menuItems = [
    {
      key: 'default',
      label: (
        <Space>
          <SwapOutlined />
          {intl.formatMessage({ id: 'pages.welcome.defaultNode' })}
          {!activeNode && <Tag color="green">当前</Tag>}
        </Space>
      ),
      onClick: handleSwitchToDefault,
    },
    { type: 'divider' as const },
    ...nodes.map((node) => ({
      key: node,
      label: (
        <Space>
          <NodeIndexOutlined />
          {node}
          {activeNode === node && <Tag color="green">当前</Tag>}
        </Space>
      ),
      onClick: () => handleNodeSwitch(node),
    })),
  ];

  return (
    <Card
      style={{
        borderRadius: 8,
        marginBottom: 16,
      }}
      bodyStyle={{ padding: '16px 24px' }}
    >
      <Row align="middle" justify="space-between">
        <Col>
          <Space size="large">
            <Space>
              <NodeIndexOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
              <Text strong style={{ fontSize: 16 }}>
                {intl.formatMessage({ id: 'pages.welcome.nodeSwitch' })}
              </Text>
            </Space>
            <Space>
              <Text type="secondary">
                {intl.formatMessage({ id: 'pages.welcome.currentNode' })}:
              </Text>
              <Tag color="blue" style={{ fontSize: 14, padding: '2px 8px' }}>
                {activeNode || intl.formatMessage({ id: 'pages.welcome.defaultNode' })}
              </Tag>
            </Space>
          </Space>
        </Col>
        <Col>
          <Space>
            <Tooltip title={intl.formatMessage({ id: 'pages.welcome.nodeSwitchTip' })}>
              <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                <Button type="primary" icon={<SwapOutlined />}>
                  {intl.formatMessage({ id: 'pages.welcome.switchNode' })}
                </Button>
              </Dropdown>
            </Tooltip>
            {activeNode && (
              <Button icon={<SwapOutlined />} onClick={handleSwitchToDefault}>
                {intl.formatMessage({ id: 'pages.welcome.switchToDefault' })}
              </Button>
            )}
          </Space>
        </Col>
      </Row>
      <div style={{ marginTop: 12 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {intl.formatMessage({ id: 'pages.welcome.nodeSwitchTip' })}
        </Text>
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {nodes.map((node) => (
            <Tag
              key={node}
              color={activeNode === node ? 'green' : 'default'}
              style={{ cursor: 'pointer', padding: '4px 12px' }}
              onClick={() => handleNodeSwitch(node)}
            >
              <Space size={4}>
                <NodeIndexOutlined />
                {node}
              </Space>
            </Tag>
          ))}
        </div>
      </div>
    </Card>
  );
};

// 系统信息卡片组件
const SystemInfoCard: React.FC<{ systemInfo: any; privateIp: string }> = ({
  systemInfo,
  privateIp,
}) => {
  const { token } = theme.useToken();
  const intl = useIntl();

  if (!systemInfo) return null;

  // 程序信息数据
  const programData = [
    {
      key: 'programStartTime',
      label: intl.formatMessage({ id: 'pages.welcome.programStartTime' }),
      value: systemInfo.programStartTime,
      icon: <ClockCircleOutlined style={{ color: '#52c41a' }} />,
    },
    {
      key: 'programUptime',
      label: intl.formatMessage({ id: 'pages.welcome.programUptime' }),
      value: systemInfo.programUptime,
      icon: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
    },
    {
      key: 'programDirectory',
      label: intl.formatMessage({ id: 'pages.welcome.programDirectory' }),
      value: systemInfo.programDirectory,
      icon: <DatabaseOutlined style={{ color: '#fa8c16' }} />,
    },
    {
      key: 'availableMemory',
      label: intl.formatMessage({ id: 'pages.welcome.availableMemory' }),
      value: systemInfo.availableMemory,
      icon: <DatabaseOutlined style={{ color: '#eb2f96' }} />,
    },
  ];

  // 系统信息数据
  const systemData = [
    {
      key: 'operatingSystem',
      label: intl.formatMessage({ id: 'pages.welcome.operatingSystem' }),
      value: systemInfo.operatingSystem,
      icon: <DesktopOutlined style={{ color: '#52c41a' }} />,
    },
    {
      key: 'architecture',
      label: intl.formatMessage({ id: 'pages.welcome.architecture' }),
      value: systemInfo.architecture,
      icon: <BugOutlined style={{ color: '#1890ff' }} />,
    },
    {
      key: 'systemPlatform',
      label: intl.formatMessage({ id: 'pages.welcome.systemPlatform' }),
      value: systemInfo.systemPlatform,
      icon: <CloudServerOutlined style={{ color: '#722ed1' }} />,
    },
    {
      key: 'hostname',
      label: intl.formatMessage({ id: 'pages.welcome.hostname' }),
      value: systemInfo.hostname,
      icon: <CloudServerOutlined style={{ color: '#fa8c16' }} />,
    },
    {
      key: 'privateIp',
      label: intl.formatMessage({ id: 'pages.welcome.privateIp' }),
      value: privateIp,
      icon: <CloudServerOutlined style={{ color: '#eb2f96' }} />,
    },
    {
      key: 'cpuCores',
      label: intl.formatMessage({ id: 'pages.welcome.cpuCores' }),
      value: `${systemInfo.cpuCores}`,
      icon: <DesktopOutlined style={{ color: '#f5222d' }} />,
    },
  ];

  // 服务器信息数据
  const serverData = [
    {
      key: 'serverStartTime',
      label: intl.formatMessage({ id: 'pages.welcome.serverStartTime' }),
      value: systemInfo.serverStartTime,
      icon: <ClockCircleOutlined style={{ color: '#52c41a' }} />,
    },
    {
      key: 'serverUptime',
      label: intl.formatMessage({ id: 'pages.welcome.serverUptime' }),
      value: systemInfo.serverUptime,
      icon: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
    },
    {
      key: 'totalMemory',
      label: intl.formatMessage({ id: 'pages.welcome.totalMemory' }),
      value: systemInfo.totalMemory,
      icon: <DatabaseOutlined style={{ color: '#722ed1' }} />,
    },
    {
      key: 'freeMemory',
      label: intl.formatMessage({ id: 'pages.welcome.freeMemory' }),
      value: systemInfo.freeMemory,
      icon: <DatabaseOutlined style={{ color: '#fa8c16' }} />,
    },
    {
      key: 'processCount',
      label: intl.formatMessage({ id: 'pages.welcome.processCount' }),
      value: `${systemInfo.processCount}`,
      icon: <BugOutlined style={{ color: '#eb2f96' }} />,
    },
    {
      key: 'isDocker',
      label: intl.formatMessage({ id: 'pages.welcome.runningEnvironment' }),
      value: systemInfo.isDocker
        ? intl.formatMessage({ id: 'pages.welcome.dockerContainer' })
        : intl.formatMessage({ id: 'pages.welcome.physicalMachine' }),
      icon: <CloudServerOutlined style={{ color: systemInfo.isDocker ? '#1890ff' : '#52c41a' }} />,
    },
  ];

  const InfoTable: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
    <div style={{ marginBottom: 24 }}>
      <Title level={5} style={{ marginBottom: 16, color: token.colorTextHeading }}>
        {title}
      </Title>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          backgroundColor: token.colorBgLayout,
          padding: 16,
          borderRadius: 8,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        {data.map((item) => (
          <div
            key={item.key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: token.colorBgContainer,
              borderRadius: 6,
              border: `1px solid ${token.colorBorder}`,
              transition: 'all 0.3s',
            }}
            className="system-info-item"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {item.icon}
              <Text style={{ flex: 'none', color: token.colorText, fontWeight: 500 }}>
                {item.label}
              </Text>
            </div>

            <Tooltip title={item.value} placement="topRight">
              <Text
                ellipsis={{
                  tooltip: false, // 我们使用自定义的 Tooltip
                }}
                style={{
                  color: token.colorTextSecondary,
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  paddingLeft: '80px',
                }}
              >
                {item.value}
              </Text>
            </Tooltip>

            {/* <Text
              style={{
                color: token.colorTextSecondary,
                fontFamily: 'monospace',
                fontSize: '13px',
              }}
            >
              {item.value}
            </Text> */}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card
      // title={
      //   <Space>
      //     <DesktopOutlined />
      //     <span>{intl.formatMessage({ id: 'pages.welcome.systemInfo' })}</span>
      //   </Space>
      // }
      style={{
        borderRadius: 8,
        marginTop: 16,
      }}
      bodyStyle={{
        backgroundImage:
          token.colorBgLayout === '#f5f5f5'
            ? 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)'
            : 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)',
      }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <InfoTable
            data={programData}
            title={`📱 ${intl.formatMessage({ id: 'pages.welcome.programInfo' })}`}
          />
        </Col>
        <Col xs={24} lg={8}>
          <InfoTable
            data={systemData}
            title={`💻 ${intl.formatMessage({ id: 'pages.welcome.systemDetails' })}`}
          />
        </Col>
        <Col xs={24} lg={8}>
          <InfoTable
            data={serverData}
            title={`🖥️ ${intl.formatMessage({ id: 'pages.welcome.serverInfo' })}`}
          />
        </Col>
      </Row>
    </Card>
  );
};

const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const intl = useIntl();

  // 是否显示注册
  const [data, setData] = useState<any>();
  const [tops, setTops] = useState<any[]>();

  useEffect(() => {
    getIndex().then((res) => {
      if (res.success) {
        if (res.data) {
          setData(res.data);
          const vs = Object.keys(res.data.tops).map((x) => {
            return {
              ip: x,
              count: res.data.tops[x],
            };
          });
          setTops(vs);
        }
      }
    });
  }, []);

  return (
    <PageContainer>
      {data && data.notify && (
        <Alert
          description={data.notify}
          banner
          closable
          style={{
            marginBottom: 16,
          }}
        />
      )}

      {/* 节点切换 - 仅在有多个节点时显示 */}
      {data?.nodes && data.nodes.length > 0 && (
        <NodeSwitcher nodes={data.nodes} currentNode={data.privateIp} />
      )}

      <Card
        style={{
          borderRadius: 8,
        }}
        bodyStyle={{
          backgroundImage:
            initialState?.settings?.navTheme === 'realDark'
              ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
              : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
        }}
      >
        <div
          style={{
            backgroundPosition: '100% -30%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '274px auto',
            backgroundImage:
              "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color: token.colorTextHeading,
            }}
          >
            {intl.formatMessage({ id: 'pages.welcome.link' })} Midjourney Proxy Admin
          </div>
          <p
            style={{
              fontSize: '14px',
              color: token.colorTextSecondary,
              lineHeight: '22px',
              marginTop: 16,
              marginBottom: 32,
              width: '65%',
            }}
          >
            {intl.formatMessage({ id: 'pages.welcome.description' })}
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <InfoCard
              index={1}
              href="https://github.com/trueai-org/midjourney-proxy"
              title={intl.formatMessage({ id: 'pages.welcome.learn' }) + ' Midjourney Proxy'}
              desc={intl.formatMessage({ id: 'pages.welcome.midjourney-proxy' })}
            />
            <InfoCard
              index={3}
              title={intl.formatMessage({ id: 'pages.welcome.learn' }) + ' Swagger Api Doc'}
              href="/swagger"
              desc={intl.formatMessage({ id: 'pages.activate.apiDoc' })}
            />
            <InfoCard
              index={2}
              title={intl.formatMessage({ id: 'pages.welcome.learn' }) + ' Midjourney Proxy Web UI'}
              href="https://github.com/trueai-org/midjourney-proxy-webui"
              desc={intl.formatMessage({ id: 'pages.welcome.midjourney-proxy-webui' })}
            />
          </div>
        </div>
      </Card>

      {/* 今日可用剩余额度 */}
      {data && (
        <Card
          title={`今日可用绘图`}
          style={{
            borderRadius: 8,
            marginTop: 16,
          }}
          bodyStyle={{
            backgroundImage:
              initialState?.settings?.navTheme === 'realDark'
                ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
                : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div
                style={{
                  border: '1px dashed #cfc7c7',
                  borderRadius: 6,
                  padding: '8px 12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  width: 150,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 14, color: token.colorText }}>快速可用次数</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: token.colorPrimary }}>
                  {data.fastAvailableCount}
                </div>
              </div>
              <div
                style={{
                  border: '1px dashed #cfc7c7',
                  borderRadius: 6,
                  padding: '8px 12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  width: 150,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 14, color: token.colorText }}>慢速可用次数</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: token.colorPrimary }}>
                  {data.relaxAvailableCount <= -1 ? '∞' : data.relaxAvailableCount}
                </div>
              </div>

              <div
                style={{
                  border: '1px dashed #cfc7c7',
                  borderRadius: 6,
                  padding: '8px 12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  width: 150,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 14, color: token.colorText }}>悠船慢速可用次数</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: token.colorPrimary }}>
                  {data.youChuanRelaxAvailableCount}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 今日成功绘图 */}
      {data && data.todayCounter && (
        <Card
          title={`今日成功绘图 ${data.todayCount}`}
          style={{
            borderRadius: 8,
            marginTop: 16,
          }}
          bodyStyle={{
            backgroundImage:
              initialState?.settings?.navTheme === 'realDark'
                ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
                : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
          }}
        >
          {Object.entries(data.todayCounter).map(([mode, actions]) => (
            <div key={mode} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 'bold', color: token.colorTextSecondary, marginBottom: 8 }}>
                {mode}
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                {Object.entries(actions as any).map(([action, count]) => (
                  <div
                    key={action}
                    style={{
                      border: '1px dashed #cfc7c7',
                      borderRadius: 6,
                      padding: '8px 12px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      minWidth: 80,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 14, color: token.colorText }}>{action}</div>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: token.colorPrimary }}>
                      {count as any}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}
      {/* 今日失败绘图 */}
      {data && data.todayFailCounter && (
        <Card
          title={`今日失败绘图 ${data.todayFailCount}`}
          style={{
            borderRadius: 8,
            marginTop: 16,
          }}
          bodyStyle={{
            backgroundImage:
              initialState?.settings?.navTheme === 'realDark'
                ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
                : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
          }}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            {Object.entries(data.todayFailCounter).map(([action, count]) => (
              <div
                key={action}
                style={{
                  border: '1px dashed #cfc7c7',
                  borderRadius: 6,
                  padding: '8px 12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  minWidth: 80,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 14, color: token.colorText }}>{action}</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: token.colorPrimary }}>
                  {count as any}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {/* 今日取消绘图 */}
      {data && data.todayCancelCounter && (
        <Card
          title={`今日取消绘图 ${data.todayCancelCount}`}
          style={{
            borderRadius: 8,
            marginTop: 16,
          }}
          bodyStyle={{
            backgroundImage:
              initialState?.settings?.navTheme === 'realDark'
                ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
                : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
          }}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            {Object.entries(data.todayCancelCounter).map(([action, count]) => (
              <div
                key={action}
                style={{
                  border: '1px dashed #cfc7c7',
                  borderRadius: 6,
                  padding: '8px 12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  minWidth: 80,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 14, color: token.colorText }}>{action}</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: token.colorPrimary }}>
                  {count as any}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {/* 系统今日错误统计 */}
      {data && (
        <Card
          title={`系统运行统计`}
          style={{
            borderRadius: 8,
            marginTop: 16,
          }}
          bodyStyle={{
            backgroundImage:
              initialState?.settings?.navTheme === 'realDark'
                ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
                : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
          }}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <div
              style={{
                border: '1px dashed #cfc7c7',
                borderRadius: 6,
                padding: '8px 12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                width: 150,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 14, color: token.colorText }}>今日错误数</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: token.colorPrimary }}>
                {data.todayErrorCount}
              </div>
            </div>
            <div
              style={{
                border: '1px dashed #cfc7c7',
                borderRadius: 6,
                padding: '8px 12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                width: 150,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 14, color: token.colorText }}>今日警告数</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: token.colorPrimary }}>
                {data.todayWarningCount}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 系统信息卡片 */}
      {data && data.systemInfo && (
        <SystemInfoCard systemInfo={data.systemInfo} privateIp={data.privateIp} />
      )}

      {/* 统计信息卡片 */}
      {data && (
        <Card
          style={{
            borderRadius: 8,
            marginTop: 16,
          }}
          bodyStyle={{
            backgroundImage:
              initialState?.settings?.navTheme === 'realDark'
                ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
                : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title={intl.formatMessage({ id: 'pages.welcome.todayDraw' })}
                value={data.todayDraw}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={intl.formatMessage({ id: 'pages.welcome.yesterdayDraw' })}
                value={data.yesterdayDraw}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={intl.formatMessage({ id: 'pages.welcome.totalDraw' })}
                value={data.totalDraw}
              />
            </Col>
          </Row>

          <Divider orientation="left">{intl.formatMessage({ id: 'pages.welcome.top5' })}</Divider>
          <List
            dataSource={tops}
            renderItem={(item) => (
              <List.Item>
                <Tag>{item.ip}</Tag> {item.count} {intl.formatMessage({ id: 'pages.welcome.unit' })}
              </List.Item>
            )}
          />
        </Card>
      )}
    </PageContainer>
  );
};

export default Welcome;
