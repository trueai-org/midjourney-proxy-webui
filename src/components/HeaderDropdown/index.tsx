import { Dropdown, Tag } from 'antd';
import type { DropDownProps } from 'antd/es/dropdown';
import React from 'react';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import classNames from 'classnames';
import { useModel } from '@umijs/max';

export type HeaderDropdownProps = {
  overlayClassName?: string;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight' | 'bottomCenter';
} & Omit<DropDownProps, 'overlay'>;

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({ overlayClassName: cls, ...restProps }) => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const className = useEmotionCss(({ token }) => {
    return {
      [`@media screen and (max-width: ${token.screenXS})`]: {
        width: '100%',
      },
    };
  });
  return <><Tag bordered={false} style={{fontSize: '15px'}}>{currentUser?.version}</Tag><Dropdown overlayClassName={classNames(className, cls)} {...restProps} /></>;
};

export default HeaderDropdown;
