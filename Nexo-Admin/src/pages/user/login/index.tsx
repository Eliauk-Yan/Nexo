import { LockOutlined, MobileOutlined } from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import {
  FormattedMessage,
  Helmet,
  SelectLang,
  useIntl,
  useModel,
} from '@umijs/max';
import { Alert, App, Form } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { Footer } from '@/components';
import { login, sendVerifyCode } from '@/services/api/auth';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => {
  return {
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

type LoginFailure = {
  status?: string;
  message?: string;
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<LoginFailure>({});
  const [form] = Form.useForm();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.AdminLoginParams) => {
    try {
      const msg = await login({
        phone: values.phone,
        verifyCode: values.verifyCode,
        autoLogin: values.autoLogin,
      });
      if (msg.success) {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);

        if (msg.data?.token) {
          localStorage.setItem('token', msg.data.token);
          localStorage.setItem('satoken', msg.data.token);
        }

        await fetchUserInfo();

        const urlParams = new URL(window.location.href).searchParams;
        window.location.href = urlParams.get('redirect') || '/';
        return;
      }
      setUserLoginState({
        status: 'error',
        message: msg.message,
      });
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };

  const { status } = userLoginState;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          form={form}
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="NEXO 后台管理系统"
          subTitle={intl.formatMessage({
            id: 'pages.layouts.userLayout.title',
          })}
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.AdminLoginParams);
          }}
        >
          {status === 'error' && (
            <LoginMessage
              content={
                userLoginState.message ||
                intl.formatMessage({
                  id: 'pages.login.phoneLogin.errorMessage',
                  defaultMessage: '验证码错误',
                })
              }
            />
          )}

          <ProFormText
            fieldProps={{
              size: 'large',
              prefix: <MobileOutlined />,
            }}
            name="phone"
            placeholder={intl.formatMessage({
              id: 'pages.login.phoneNumber.placeholder',
              defaultMessage: '请输入手机号',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.phoneNumber.required"
                    defaultMessage="请输入手机号！"
                  />
                ),
              },
              {
                pattern: /^1\d{10}$/,
                message: (
                  <FormattedMessage
                    id="pages.login.phoneNumber.invalid"
                    defaultMessage="手机号格式错误！"
                  />
                ),
              },
            ]}
          />
          <ProFormCaptcha
            phoneName="phone"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            captchaProps={{
              size: 'large',
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.captcha.placeholder',
              defaultMessage: '请输入验证码',
            })}
            captchaTextRender={(timing, count) => {
              if (timing) {
                return `${count} ${intl.formatMessage({
                  id: 'pages.getCaptchaSecondText',
                  defaultMessage: '秒后重新获取',
                })}`;
              }
              return intl.formatMessage({
                id: 'pages.login.phoneLogin.getVerificationCode',
                defaultMessage: '获取验证码',
              });
            }}
            name="verifyCode"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.captcha.required"
                    defaultMessage="请输入验证码！"
                  />
                ),
              },
            ]}
            onGetCaptcha={async () => {
              const phone = form.getFieldValue('phone');
              if (!phone || !/^1\d{10}$/.test(phone)) {
                message.error(
                  intl.formatMessage({
                    id: 'pages.login.phoneNumber.invalid',
                    defaultMessage: '请先输入正确的手机号！',
                  }),
                );
                throw new Error('invalid phone');
              }
              await sendVerifyCode(phone);
              message.success(
                intl.formatMessage({
                  id: 'pages.login.phoneLogin.captchaSent',
                  defaultMessage: '验证码已发送',
                }),
              );
            }}
          />

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage
                id="pages.login.rememberMe"
                defaultMessage="自动登录"
              />
            </ProFormCheckbox>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
