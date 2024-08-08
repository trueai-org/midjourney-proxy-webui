import { getIndex, login, register } from '@/services/mj/api';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet, SelectLang, useIntl, useModel } from '@umijs/max';
import { Button, Input, message, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';

const Lang = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  return (
    <div className={langClassName} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const Login: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const intl = useIntl();

  const [isRegister, setIsRegister] = useState(false);
  const [mail, setMail] = useState<string>();
  const [registering, setRegistering] = useState(false);

  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  // register
  const onRegister = () => {
    if (!mail) {
      message.error('Please input email');
      return;
    }

    setRegistering(true);
    register(JSON.stringify({ email: mail })).then((res) => {
      setRegistering(false);
      if (res.success) {
        message.success(
          intl.formatMessage({
            id: 'pages.login.registerSuccess',
          }),
        );
        setIsRegister(false);
      } else {
        message.error(res.message);
      }
    });
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 登录
      const msg = await login(JSON.stringify(values.password || ''));
      if (msg.code === 1) {
        if (msg && msg.apiSecret) {
          sessionStorage.setItem('mj-api-secret', msg.apiSecret);
        }

        message.success(
          intl.formatMessage({
            id: 'pages.login.success',
          }),
        );

        const userInfo = await initialState?.fetchUserInfo?.();
        if (userInfo) {
          flushSync(() => {
            setInitialState((s) => ({
              ...s,
              currentUser: userInfo,
            }));
          });
          location.hash = '#/welcome';
        }
        return;
      }
      message.error(msg.description);
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
      });
      message.error(defaultLoginFailureMessage);
    }
  };

  // 是否显示注册
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    getIndex().then((res) => {
      if (res.success) {
        if (res.data) {
          setShowRegister(res.data.isRegister);
        }
      }
    });
  }, []);

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          {intl.formatMessage({ id: 'menu.login' })} - {Settings.title}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        {isRegister && showRegister ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100vh',
              width: '360px',
              margin: '0 auto',
            }}
          >
            <Input
              name="email"
              size="large"
              prefix={<MailOutlined />}
              placeholder={intl.formatMessage({
                id: 'pages.register.email.placeholder',
                defaultMessage: 'Email',
              })}
              value={mail}
              onChange={(e) => {
                setMail(e.target.value);
              }}
            />
            <Space style={{ marginTop: '16px' }}>
              <Button
                loading={registering}
                style={{ width: 200 }}
                type="primary"
                size="large"
                onClick={onRegister}
              >
                {intl.formatMessage({ id: 'pages.login.register' })}
              </Button>
              <Button
                type="link"
                onClick={() => {
                  setIsRegister(false);
                }}
              >
                {intl.formatMessage({ id: 'pages.login.returnLogin' })}
              </Button>
            </Space>
          </div>
        ) : (
          <LoginForm
            contentStyle={{
              minWidth: 280,
              maxWidth: '75vw',
              height: 'auto',
            }}
            title="Midjourney Proxy Admin"
            subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
            initialValues={{
              autoLogin: true,
            }}
            onFinish={async (values) => {
              await handleSubmit(values as API.LoginParams);
            }}
            actions={
              showRegister && (
                <Button
                  type="link"
                  onClick={() => {
                    setIsRegister(true);
                  }}
                  style={{ paddingLeft: 0 }}
                >
                  {intl.formatMessage({ id: 'pages.login.registerAccount' })}
                </Button>
              )
            }
          >
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.password.placeholder',
                defaultMessage: 'Admin Token',
              })}
            />
          </LoginForm>
        )}
      </div>
    </div>
  );
};

export default Login;
