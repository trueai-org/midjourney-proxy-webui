import { DiscordFilled } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Tooltip } from 'antd';
import React from 'react';

/** 账号类型：Discord / 悠船 / Midjourney 官方 */
export type AccountType = 'discord' | 'youChuan' | 'official';

/** 各类型图标主色，便于在账号表格与下拉框中一眼区分 */
const ACCOUNT_TYPE_COLOR: Record<AccountType, string> = {
  discord: '#5865F2',
  youChuan: '#FA8C16',
  official: '#1677FF',
};

/**
 * 从账号记录解析账号类型。
 * 后端 DiscordAccount 中 isYouChuan / isOfficial 互斥，两者都不为 true 时即为普通 Discord 账号。
 * @param record 账号记录（可为空，为空时按 Discord 处理）
 * @returns 账号类型
 */
function resolveAccountType(
  record?: { isYouChuan?: boolean; isOfficial?: boolean } | null,
): AccountType {
  if (record?.isYouChuan === true) {
    return 'youChuan';
  }
  if (record?.isOfficial === true) {
    return 'official';
  }
  return 'discord';
}

/** 悠船图标：船体 + 两道水波，与 Midjourney 的帆船区分 */
const YouChuanIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M12.7 3.2 17.6 12.4h-4.9z" />
    <rect x="11.2" y="3.2" width="1.3" height="9.2" rx="0.4" />
    <path d="M3.2 13.5h17.6l-2.1 3.9H5.3z" />
    <path
      d="M2.6 19.7c1.6 1.2 3.2 1.2 4.7 0 1.5 1.2 3.1 1.2 4.7 0 1.6 1.2 3.2 1.2 4.7 0 1.5 1.2 3.1 1.2 4.7 0"
      fill="none"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

/** Midjourney 图标：双帆 + 船体 */
const MidjourneyIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M13.1 2.2 19.6 15h-6.5z" />
    <path d="M11.3 5v10H5.4z" />
    <path d="M2.6 17h18.8l-2.3 3.6H5z" />
  </svg>
);

interface AccountTypeIconProps {
  /** 账号记录；读取后端 DiscordAccount 的 isYouChuan / isOfficial 字段 */
  record?: { isYouChuan?: boolean; isOfficial?: boolean } | null;
  /** 直接指定类型，优先级高于 record */
  type?: AccountType;
  /** 图标尺寸（px），默认 15 */
  size?: number;
  /** 是否在图标上显示账号类型 Tooltip，默认显示 */
  tooltip?: boolean;
}

/**
 * 账号类型小图标。
 * Discord 使用官方品牌图标，悠船 / Midjourney 官方使用内联 SVG（图标库无对应品牌图标）；
 * 三种类型用不同主色区分，并在 hover 时显示类型名称，避免用户只能靠颜色记忆。
 */
const AccountTypeIcon: React.FC<AccountTypeIconProps> = ({
  record,
  type,
  size = 15,
  tooltip = true,
}) => {
  const intl = useIntl();
  const accountType = type ?? resolveAccountType(record);
  const color = ACCOUNT_TYPE_COLOR[accountType];

  const icon =
    accountType === 'discord' ? (
      <DiscordFilled style={{ fontSize: size, color }} />
    ) : accountType === 'youChuan' ? (
      <YouChuanIcon size={size} color={color} />
    ) : (
      <MidjourneyIcon size={size} color={color} />
    );

  const node = (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        flex: 'none',
      }}
    >
      {icon}
    </span>
  );

  if (!tooltip) {
    return node;
  }

  return (
    <Tooltip title={intl.formatMessage({ id: `pages.account.type.${accountType}` })}>
      {node}
    </Tooltip>
  );
};

export default AccountTypeIcon;
