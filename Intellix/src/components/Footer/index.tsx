import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      links={[
        {
          key: 'Intellix BI',
          title: 'Intellix BI',
          href: 'https://github.com/Jerrylingj/Intellix',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/Jerrylingj/Intellix',
          blankTarget: true,
        },
        {
          key: 'Intellix BI',
          title: 'Intellix BI',
          href: 'https://github.com/Jerrylingj/Intellix',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
