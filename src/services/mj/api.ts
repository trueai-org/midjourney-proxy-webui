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

/**  POST /mj/account/{id}/sync-info */
export async function refreshAccount(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/mj/admin/account-sync/${id}`, {
    method: 'POST',
    ...(options || {}),
  });
}

/**  PUT /mj/account/{id}/update-reconnect */
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

/**  DELETE /mj/account/{id}/delete */
export async function deleteAccount(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/mj/admin/account/${id}`, {
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
  return request<API.Result>(`/mj/admin/account-action/${id}?customId=${customId}&botType=${botType}`, {
    method: 'POST',
    ...(options || {}),
  });
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
      search: {},
    },
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
