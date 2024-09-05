import { getIndex } from '@/services/mj/api';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useModel } from '@umijs/max';
import { Alert, Card, Col, Divider, List, Row, Statistic, Tag, theme } from 'antd';
import React, { useEffect, useState } from 'react';

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
          message={data.notify}
          banner
          closable
          style={{
            marginBottom: 16,
          }}
        />
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
