// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前的用户 GET /mj/admin/current */
export async function currentUser(options?: { [key: string]: any }) {
  return request<API.CurrentUser>('/mj/admin/current', {
    method: 'GET',
    ...(options || {}),
  }).then((response) => {
    if (response && response.apiSecret) {
      sessionStorage.setItem('mj-api-secret', response.apiSecret);
    }
    if (response.imagePrefix) {
      sessionStorage.setItem('mj-image-prefix', response.imagePrefix);
    } else {
      sessionStorage.removeItem('mj-image-prefix');
    }
    return response;
  });
}

/** 退出登录接口 POST /mj/admin/logout */
export async function outLogin(options?: { [key: string]: any }) {
  return request<API.ReturnMessage>('/mj/admin/logout', {
    method: 'POST',
    ...(options || {}),
  }).then((response) => {
    sessionStorage.removeItem('mj-api-secret');
    sessionStorage.removeItem('mj-image-prefix');
    return response;
  });
}

/** 登录接口 POST /mj/admin/login */
export async function login(body: any, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/mj/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

// 通过邮件注册接口
export async function register(body: any, options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

// 首页信息
export async function getIndex(options?: { [key: string]: any }) {
  return request<API.Result>('/mj/home', {
    method: 'GET',
    ...(options || {}),
  });
}

/**  MJ 接口 */

/**  POST /mj/account/create */
export async function createAccount(data: object, options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/account', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

/**
 * 预览悠船账号 Excel 导入。
 * 以 multipart/form-data 上传 .xlsx，后端只解析并返回新增/更新/无效标记，不写数据库。
 */
export async function previewYouChuanAccountImport(
  data: FormData,
  options?: { [key: string]: any },
) {
  return request<API.Result>('/mj/admin/account-import/youchuan/preview', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/**
 * 导入悠船账号。
 * 后端按虚拟号匹配：重复账号更新凭证和账号池参数，新账号新增并启用；返回逐行成功/失败统计。
 */
export async function importYouChuanAccounts(data: object, options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/account-import/youchuan', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/**  POST /mj/account/query */
export async function queryAccount(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/mj/admin/accounts', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function queryAccounts(
  data: any,
  predicate?: string,
  descend?: boolean,
  options?: { [key: string]: any },
) {
  return request<Record<string, any>>('/mj/admin/accounts', {
    method: 'POST',
    data: {
      pagination: {
        current: data?.current || 1,
        pageSize: data?.pageSize || 10,
      },
      sort: {
        predicate: predicate || '',
        reverse: descend,
      },
      search: {
        ...data,
      },
    },
    ...(options || {}),
  });
}

export async function accountsEnable(ids: string[], options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/accounts-enable', {
    method: 'POST',
    data: ids,
    ...(options || {}),
  });
}

/**  POST /mj/account/{id}/sync-info */
export async function refreshAccount(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/mj/admin/account-sync/${id}`, {
    method: 'POST',
    ...(options || {}),
  });
}

// loginAccountGetToken
export async function loginAccountGetToken(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/mj/admin/account-login/${id}`, {
    method: 'POST',
    ...(options || {}),
  });
}

/**  PUT */
export async function updateAndReconnect(
  id: string,
  data: object,
  options?: { [key: string]: any },
) {
  return request<API.Result>(`/mj/admin/account-reconnect/${id}`, {
    method: 'PUT',
    data: data,
    ...(options || {}),
  });
}

export async function update(id: string, data: object, options?: { [key: string]: any }) {
  return request<API.Result>(`/mj/admin/account/${id}`, {
    method: 'PUT',
    data: data,
    ...(options || {}),
  });
}

// CF 标记验证通过
export async function accountCfOk(id: string, data?: object, options?: { [key: string]: any }) {
  return request<API.Result>(`/mj/admin/account-cf/${id}`, {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

// CF 刷新链接
export async function accountCfUrl(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/mj/admin/account-cf/${id}?refresh=true`, {
    method: 'GET',
    ...(options || {}),
  });
}

/**  DELETE */
export async function deleteAccount(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/mj/admin/account/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/**  DELETE */
export async function deleteTask(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/mj/admin/task/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function accountChangeVersion(
  id: string,
  version: string,
  options?: { [key: string]: any },
) {
  return request<API.Result>(`/mj/admin/account-change-version/${id}?version=${version}`, {
    method: 'POST',
    ...(options || {}),
  });
}

export async function accountAction(
  id: string,
  botType: string,
  customId: string,
  options?: { [key: string]: any },
) {
  return request<API.Result>(
    `/mj/admin/account-action/${id}?customId=${customId}&botType=${botType}`,
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}

export async function queryTask(data: any, options?: { [key: string]: any }) {
  return request<Record<string, any>>('/mj/admin/tasks', {
    method: 'POST',
    data: {
      pagination: {
        current: data?.current || 1,
        pageSize: data?.pageSize || 10,
      },
      sort: {
        predicate: '',
        reverse: true,
      },
      search: {
        ...data,
      },
    },
    ...(options || {}),
  });
}

/** 用户列表 */
export async function queryUser(data: any, options?: { [key: string]: any }) {
  return request<Record<string, any>>('/mj/admin/users', {
    method: 'POST',
    data: {
      pagination: {
        current: data?.current || 1,
        pageSize: data?.pageSize || 10,
      },
      sort: {
        predicate: '',
        reverse: true,
      },
      search: {
        ...data,
      },
    },
    ...(options || {}),
  });
}

/** 删除用户 */
export async function deleteUser(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/mj/admin/user/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 创建/编辑用户 */
export async function createUser(data: object, options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/user', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

/** 领域列表 */
export async function queryDomain(data: any, options?: { [key: string]: any }) {
  return request<Record<string, any>>('/mj/admin/domain-tags', {
    method: 'POST',
    data: {
      pagination: {
        current: data?.current || 1,
        pageSize: data?.pageSize || 10,
      },
      sort: {
        predicate: '',
        reverse: true,
      },
      search: {
        ...data,
      },
    },
    ...(options || {}),
  });
}

/** 删除领域 */
export async function deleteDomain(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/mj/admin/domain-tag/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

// /** 所有领域 */
// export async function allDomain(options?: { [key: string]: any }) {
//   return request<API.Result>('/mj/admin/domain-tags', {
//     method: 'GET',
//     ...(options || {}),
//   });
// }

/** 创建/编辑领域 */
export async function createDomain(data: object, options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/domain-tag', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

/**
 * 违规词
 * @param data
 * @param options
 * @returns
 */
export async function queryIllegalWord(data: any, options?: { [key: string]: any }) {
  return request<Record<string, any>>('/mj/admin/banned-words', {
    method: 'POST',
    data: {
      pagination: {
        current: data?.current || 1,
        pageSize: data?.pageSize || 10,
      },
      sort: {
        predicate: '',
        reverse: true,
      },
      search: {
        ...data,
      },
    },
    ...(options || {}),
  });
}

/**
 * 删除违规词
 * @param id
 * @param options
 * @returns
 */
export async function deleteIllegalWord(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/mj/admin/banned-word/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/**
 * 创建违规词
 * @param data
 * @param options
 * @returns
 */
export async function createIllegalWord(data: object, options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/banned-word', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

/**
 * 创建违规词测试批次
 * @param data 违规词、提示词模板、并发数
 * @param options
 * @returns 批次 ID 与新增任务数
 */
export async function createBannedWordTest(
  data: { words: string[]; template?: string; concurrency?: number },
  options?: { [key: string]: any },
) {
  return request<API.Result>('/mj/admin/banned-word-test', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

/**
 * 查询违规词测试任务
 * @param data 分页、敏感词、状态筛选条件
 * @param options
 * @returns 测试任务分页与全量统计
 */
export async function queryBannedWordTests(data: any, options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/banned-word-tests', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

/**
 * 重试所有测试失败的任务
 * @param options
 * @returns
 */
export async function retryFailedBannedWordTests(options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/banned-word-test/retry-failed', {
    method: 'POST',
    ...(options || {}),
  });
}

/**
 * 清空所有违规词测试记录
 * @param options
 * @returns
 */
export async function clearBannedWordTests(options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/banned-word-test', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/**
 * 删除单条违规词测试任务记录
 * @param taskId 测试任务 ID
 * @param options
 * @returns
 */
export async function deleteBannedWordTest(taskId: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/mj/admin/banned-word-test/${taskId}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function queryTaskByIds(ids: string[], options?: { [key: string]: any }) {
  return request<any>('/mj/task/list-by-ids', {
    method: 'POST',
    data: { ids: ids },
    ...(options || {}),
  });
}

export async function getTask(id: string, options?: { [key: string]: any }) {
  return request<any>(`/mj/task-admin/${id}/fetch`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function submitTask(action: string, data: object, options?: { [key: string]: any }) {
  return request<any>(`/mj/submit/${action}`, {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

export async function submitShow(action: string, data: object, options?: { [key: string]: any }) {
  return request<any>(`/mj/submit/${action}`, {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

export async function cancelTask(id: string, options?: { [key: string]: any }) {
  return request<API.ReturnMessage>(`/mj/task/${id}/cancel`, {
    method: 'POST',
    ...(options || {}),
  });
}

export async function swapFace(data: object, options?: { [key: string]: any }) {
  return request<any>('/mj/insight-face/swap', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

export async function swapVideoFace(data: object, options?: { [key: string]: any }) {
  return request<any>('/mj/insight-face/video-swap', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

export async function probe(tail: number, level = 0, options?: { [key: string]: any }) {
  return request<any>('/mj/admin/probe?tail=' + tail + '&level=' + level, {
    method: 'GET',
    ...(options || {}),
  });
}

// 获取配置
export async function getConfig(options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/setting', {
    method: 'GET',
    ...(options || {}),
  });
}
// 从 Consul 加载配置
export async function getConsulConfig(data: object, options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/load-consul-setting', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

// 下载文件
export async function downloadLogs(top: number, options?: { [key: string]: any }) {
  return request(`/mj/admin/download-logs?top=${top}`, {
    method: 'GET',
    responseType: 'blob', // 以 blob 格式返回
    ...(options || {}),
  });
}

// 修改配置
export async function updateConfig(data: object, options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/setting', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

// 重启
export async function restart(all = false, options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/restart?all=' + (all ? 'true' : 'false'), {
    method: 'POST',
    ...(options || {}),
  });
}

// 检查更新
export async function checkUpdate(options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/check', {
    method: 'GET',
    ...(options || {}),
  });
}

// 取消更新
export async function cancelUpdate(options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/cancel-update', {
    method: 'POST',
    ...(options || {}),
  });
}

// mongo db 连接
export async function mongoConnect() {
  return request<API.Result>('/mj/admin/verify-mongo', {
    method: 'POST',
    timeout: 1000 * 60 * 10, // 10 分钟
  });
}

// 数据库连接验证
export async function databaseConnect(data?: any) {
  return request<API.Result>('/mj/admin/validate-database-connection', {
    method: 'POST',
    timeout: 1000 * 60 * 10, // 10 分钟
    data: data,
  });
}

// 一键迁移
export async function migrateAccountAndTasks(data: object, options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/mjplus-migration', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}
