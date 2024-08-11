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

/**  POST /mj/account/query */
export async function queryAccount(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/mj/admin/accounts', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function queryAccounts(data: any, options?: { [key: string]: any }) {
  return request<Record<string, any>>('/mj/admin/accounts', {
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

/**  POST /mj/account/{id}/sync-info */
export async function refreshAccount(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/mj/admin/account-sync/${id}`, {
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
/** 所有领域 */
export async function allDomain(options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/domain-tags', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 创建/编辑领域 */
export async function createDomain(data: object, options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/domain-tag', {
    method: 'POST',
    data: data,
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

export async function probe(tail: number, options?: { [key: string]: any }) {
  return request<any>('/mj/admin/probe?tail=' + tail, {
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

// 修改配置
export async function updateConfig(data: object, options?: { [key: string]: any }) {
  return request<API.Result>('/mj/admin/setting', {
    method: 'POST',
    data: data,
    ...(options || {}),
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
