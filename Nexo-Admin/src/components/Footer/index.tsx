import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright="Powered by YANSHIJIE"
      links={[
        {
          key: 'YANSHIJIE NEXO',
          title: 'YANSHIJIE NEXO',
          href: 'https://pro.ant.design',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/Eliauk-Yan/Nexo.git',
          blankTarget: true,
        },
        {
          key: 'YANSHIJIE',
          title: 'YANSHIJIE',
          href: 'https://ant.design',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
