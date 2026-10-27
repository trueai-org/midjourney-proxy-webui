// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    name?: string;
    apiSecret?: string;
    imagePrefix?: string;
    active?: boolean = false;
    version?: string;
    avatar?: string;
    userid?: string;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
  };

  type LoginResult = {
    code?: number;
    apiSecret?: string;
    description?: string;
  };

  type ReturnMessage = {
    code?: number;
    description?: string;
    result?: any;
  };

  type Result<T = any> = {
    code: number;
    message?: string;
    data?: T;
    success?: boolean;
    timestamp?: string;
  }

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };

  /** 首页实时并发与队列概览（GET /mj/home 的 runtimeOverview 字段），每组均为「可用 / 已用 / 总数」。 */
  type HomeRuntimeOverview = {
    /** 已用快速并发数：所有启用账号已占用的快速并发槽位数之和 */
    fastConcurrency?: number;
    /** 快速总并发数：所有启用账号 CoreSize 之和 */
    fastConcurrencyTotal?: number;
    /** 可用快速并发数：快速剩余次数 >= 8 次的账号按 (CoreSize - 已用) 累加 */
    fastConcurrencyAvailable?: number;
    /** 已用快速队列数：所有启用账号快速队列待处理任务数之和 */
    fastQueueCount?: number;
    /** 快速总队列数：所有启用账号 QueueSize 之和 */
    fastQueueCountTotal?: number;
    /** 可用快速队列数：快速剩余次数 >= 8 次的账号按 (QueueSize - 已用) 累加 */
    fastQueueAvailable?: number;
    /** 已用悠船慢速并发数：仅悠船账号，已占用的慢速并发槽位数之和 */
    youChuanRelaxConcurrency?: number;
    /** 悠船总慢速并发数：仅悠船账号，RelaxCoreSize 之和 */
    youChuanRelaxConcurrencyTotal?: number;
    /** 可用悠船慢速并发数：悠船慢速剩余次数 > 0 的账号按 (RelaxCoreSize - 已用) 累加 */
    youChuanRelaxConcurrencyAvailable?: number;
    /** 已用悠船慢速队列数：仅悠船账号，慢速队列待处理任务数之和 */
    youChuanRelaxQueueCount?: number;
    /** 悠船总慢速队列数：仅悠船账号，RelaxQueueSize 之和 */
    youChuanRelaxQueueCountTotal?: number;
    /** 可用悠船慢速队列数：悠船慢速剩余次数 > 0 的账号按 (RelaxQueueSize - 已用) 累加 */
    youChuanRelaxQueueAvailable?: number;
  };
}
