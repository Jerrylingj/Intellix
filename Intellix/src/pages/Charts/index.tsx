import { listMyChartByPageUsingPost } from '@/services/intellixbi/chartController';
import { Avatar, List, message, Space, Card, Spin, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import './Charts.css';
import { useModel } from '@@/exports';
import Search from "antd/es/input/Search";

const { Title, Text } = Typography;

/**
 * 我的图表页面
 * @constructor
 */
const Charts: React.FC = () => {
  const initSearchParams = {
    pageSize: 4,
    current: 1,
  };

  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({ ...initSearchParams });
  const [chartList, setChartList] = useState<API.Chart[]>([]); // 图表列表
  const [total, setTotal] = useState<number>(0); // 图表数量
  const [loading, setLoading] = useState<boolean>(false); // 加载状态
  const [columnCount, setColumnCount] = useState<number>(3); // 默认每行 3 个图表
  const [isScreenTooSmall, setIsScreenTooSmall] = useState<boolean>(false); // 屏幕是否过小
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};

  // 监听窗口宽度变化
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1200) {
        setColumnCount(2); // 大屏幕：每行 2 个图表
        setIsScreenTooSmall(false);
      } else if (width >= 800) {
        setColumnCount(1); // 中等屏幕：每行 1 个图表
        setIsScreenTooSmall(false);
      } else {
        setColumnCount(1); // 小屏幕：每行 1 个图表
        setIsScreenTooSmall(true); // 屏幕过小
      }
    };

    // 初始化时调用一次
    handleResize();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    // 组件卸载时移除监听
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [searchParams]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPost(searchParams);
      if (res.data) {
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
      } else {
        message.error('获取图表失败');
      }
    } catch (e: any) {
      message.error('获取图表失败: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchParams]); // 页面首次渲染、数据变化时调用

  return (
    <div className="charts-page" style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px', color: '#1890ff' }}>
        我的图表
      </Title>
      <Search style={{marginBottom:'20px'}} placeholder="请输入图表名称" enterButton onSearch={(value) => {
        // 设置搜索条件
        setSearchParams({
          ...initSearchParams,
          name: value,
        });
      }

      }/>
      <Spin spinning={loading}>
        <List
          grid={{ gutter: 16, column: columnCount }} // 动态设置列数
          dataSource={chartList}
          pagination={{
            pageSize: initSearchParams.pageSize,
            total,
            onChange: (page) => {
              setSearchParams({ ...searchParams, current: page });
            },
            showSizeChanger: false,
          }}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <Card
                className="chart-card"
                hoverable
                cover={
                  <div style={{ padding: '16px' }}>
                    {isScreenTooSmall ? (
                      <div style={{ textAlign: 'center', padding: '24px' }}>
                        <Text type="warning">屏幕宽度过小，无法展示图像</Text>
                      </div>
                    ) : ( item.genChart ?  (<ReactECharts
                          option={JSON.parse(item.genChart ?? '{}')}
                          style={{ height: '300px', width: '100%' }}
                      />) : (<div style={{ textAlign: 'center', padding: '24px' }}><Text type="warning" style={{ fontSize: '30px', fontWeight: '10px'}}>图表数据丢失……</Text></div>)
                    )}
                  </div>
                }
              >
                <Card.Meta
                  avatar={
                    <Avatar
                      src={currentUser?.userAvatar}
                      size={48}
                    />
                  }
                  title={
                    <Text strong style={{ fontSize: '18px' }}>
                      {item.name}
                    </Text>
                  }
                  description={
                    <Space direction="vertical" style={{ marginTop: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        {'图表类型: ' + (item.chartType || '未指定')}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        {'分析目标: ' + item.goal}
                      </Text>
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Spin>
    </div>
  );
};

export default Charts;
