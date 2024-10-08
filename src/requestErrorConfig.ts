﻿import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { getLocale } from '@umijs/max';
import { message, notification } from 'antd';
import { history } from '@umijs/max';

const loginPath = '/user/login';


// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        console.error('BizError', success, data, errorCode, errorMessage, showType, error);
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              if (errorMessage) {
                message.error(errorMessage);
              }
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        if (error.response.status === 403) {
          message.error('Forbidden, please login again.');
        } 
        else if (error.response.status === 401) {
          message.error('Unauthorized, please login again.');
          // 去登录
          history.push(loginPath);
        } 
        else if (error.response.status === 429) {
          message.error('Too many requests, please retry later.');
        } else {
          message.error(`Response status:${error.response.status}`);
        }
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      const MJ_API_SECRET = sessionStorage.getItem('mj-api-secret') || ''; // 获取保存的密码
      const locale = getLocale();
      config.headers = {
        ...config.headers,
        'mj-api-secret': MJ_API_SECRET, // 将密码作为自定义头部
        'Accept-Language': locale === 'zh-CN' ? 'zh-CN' : 'en-US',
      };
      return { ...config };
    },
  ],

  timeout: 1000 * 60,

  responseInterceptors: [
    (response) => {
      // 你可以在这里添加响应拦截逻辑，移除默认的拦截逻辑
      const { data } = response;
      // 自定义拦截逻辑
      if (data && data?.success === false) {
        // 这里是你的自定义处理逻辑，可以根据需求进行调整
        message.error(data?.message || 'Request failed');
      }
      return response;
    },
  ],
};
