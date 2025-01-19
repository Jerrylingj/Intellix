import {
  InboxOutlined,
} from '@ant-design/icons';
import { Button, Card, Form, Input, message, Select, Space, Upload, Row, Col } from 'antd';
import React, { useState, useEffect } from 'react';
import { genChartByAiUsingPost, getChartStatusUsingGet } from "@/services/intellixbi/chartController";
import TextArea from "antd/es/input/TextArea";
import ReactECharts from 'echarts-for-react';

const AddChart: React.FC = () => {
  const [chart, setChart] = useState<API.BiResponse>();                     // 用于存储图表数据
  const [option, setOption] = useState<any>();
  const [submitting, setSubmmitting] = useState<boolean>(
    localStorage.getItem('submitting') === 'true'
  ); // 提交按钮的加载状态
  const [chartStatus, setChartStatus] = useState<string>('');               // 图表状态
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout>(); // 轮询定时器
  const [form] = Form.useForm();                                           // 表单实例

  // 从 localStorage 恢复状态
  useEffect(() => {
    const savedChart = localStorage.getItem('chart');
    const savedOption = localStorage.getItem('option');
    const savedChartStatus = localStorage.getItem('chartStatus');
    const savedFormData = localStorage.getItem('formData');
    const savedSubmitting = localStorage.getItem('submitting');

    if (savedChart) setChart(JSON.parse(savedChart));
    if (savedOption) setOption(JSON.parse(savedOption));
    if (savedChartStatus) setChartStatus(savedChartStatus);
    if (savedFormData) form.setFieldsValue(JSON.parse(savedFormData));
    if (savedSubmitting) setSubmmitting(savedSubmitting === 'true');
  }, [form]);

  // 监听表单数据变化并保存到 localStorage
  const onFormValuesChange = (changedValues: any, allValues: any) => {
    localStorage.setItem('formData', JSON.stringify(allValues));
  };

  // 保存 submitting 状态到 localStorage
  useEffect(() => {
    localStorage.setItem('submitting', submitting.toString());
  }, [submitting]);

  // 修改 normFile 函数，确保返回的是一个数组
  const normFile = (e: any) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList ? [e.fileList[0]] : []; // 确保返回的是一个数组
  };

  const startPolling = (chartId: number) => {
    // 清除之前的轮询
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    /**
     * 轮询
     */
    const interval = setInterval(async () => {
      try {
        console.log("启动轮询");
        const params = {
          chartId: chartId,
        };

        const res = await getChartStatusUsingGet(params); // 查询任务状态
        console.log("轮询结果：", res);
        if (res?.data) {
          const status = res.data.status ?? 'running';
          setChartStatus(status); // 更新任务状态

          if (status === 'succeed') {
            // 任务成功，展示结果
            clearInterval(interval);
            const chartOption = JSON.parse(res.data.genChart ?? '{}');
            setChart(res.data); // 更新图表数据
            setOption(chartOption);
            message.success('分析成功');
            setSubmmitting(false);

            // 保存状态到 localStorage
            localStorage.setItem('chart', JSON.stringify(res.data));
            localStorage.setItem('option', JSON.stringify(chartOption));
            localStorage.setItem('chartStatus', status);
          } else if (status === 'failed') {
            // 任务失败，显示错误信息
            clearInterval(interval);
            message.error(res.data.execMessage || '任务执行失败');
            setSubmmitting(false);

            // 保存状态到 localStorage
            localStorage.setItem('chartStatus', status);
          }
          // 如果状态是 running 或 wait，继续轮询
        } else {
          // 显示错误信息
          clearInterval(interval);
          message.error('轮询请求失败，请重试');
          setSubmmitting(false);
        }
      } catch (error) {
        // 显示错误信息
        clearInterval(interval);
        message.error('轮询请求失败，请重试');
        setSubmmitting(false);
      }
    }, 1000); // 每秒轮询一次

    setPollingInterval(interval); // 存储定时器
  };

  /**
   * 提交图表生成请求
   * @param values
   */
  const onFinish = async (values: any) => {
    // 避免重复提交
    if (submitting) return;
    setSubmmitting(true);

    console.log('用户上传: ', values);

    // 提取单个文件
    const fileList = values.files;
    if (!fileList || fileList.length === 0) {
      message.error('请上传文件');
      return;
    }

    const file = fileList[0].originFileObj; // 获取第一个文件
    console.log('file ', file);

    const params = {
      name: values.name,
      goal: values.goal,
      chartType: values.chartType,
    };

    try {
      const res = await genChartByAiUsingPost(params, {}, file);
      console.log('res', res);
      if (!res?.data) {
        message.error('分析失败');
      } else {
        const chartId: number = res.data?.id ?? 0;
        const chartStatus: string = res.data.status ?? '';
        console.log("获得图表ID" + chartId);
        console.log("类型" + typeof chartId);
        setChartStatus(chartStatus);
        startPolling(chartId); // 启动轮询
        message.success('任务已提交,请等待');

        // 保存状态到 localStorage
        localStorage.setItem('chartStatus', chartStatus);
      }
    } catch (e: any) {
      message.error('分析失败，' + e.message);
    }
  };

  /**
   * 动态更新图表结果部分
   */
  const renderChartContent = () => {
    if (chartStatus === 'succeed' && option) {
      return <ReactECharts option={option} style={{ height: '400px' }} />;
    } else if (chartStatus === 'failed') {
      return <div>任务失败，请重试</div>;
    } else if (chartStatus === 'running') {
      return <div>任务执行中，请稍候...</div>;
    } else if (chartStatus === 'wait') {
      return <div>任务已提交，请等待</div>;
    } else {
      return <div>请先提交图表数据</div>;
    }
  };

  const renderResultContent = () => {
    if (chartStatus === 'succeed' && chart?.genResult) {
      return <div style={{ whiteSpace: 'pre-line' }}>{chart.genResult}</div>;
    } else if (chartStatus === 'failed') {
      return <div>任务失败，请重试</div>;
    } else if (chartStatus === 'running') {
      return <div>任务执行中，请稍候...</div>;
    } else if (chartStatus === 'wait') {
      return <div>任务已提交，请等待</div>;
    } else {
      return <div>请先提交图表数据</div>;
    }
  };

  /**
   * 重置状态
   */
  const resetState = () => {
    setChart(undefined);
    setOption(undefined);
    setChartStatus('');
    setSubmmitting(false);
    form.resetFields(); // 重置表单数据

    // 清除 localStorage
    localStorage.removeItem('chart');
    localStorage.removeItem('option');
    localStorage.removeItem('chartStatus');
    localStorage.removeItem('formData');
    localStorage.removeItem('submitting');
  };

  return (
    <div className="add-chart" style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* 表单部分 */}
        <Col xs={24} md={12}>
          <Card title="添加图表" bordered={false} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <Form
              form={form}
              name="add-chart"
              onFinish={onFinish}
              initialValues={{}}
              layout="vertical"
              onValuesChange={onFormValuesChange}
            >
              <Form.Item
                name="name"
                label="图表名称"
                rules={[{ required: true, message: '请输入图表名称!' }]}
              >
                <Input placeholder="请输入图表名称" />
              </Form.Item>

              <Form.Item
                name="goal"
                label="分析目标"
                rules={[{ required: true, message: '请输入分析目标!' }]}
              >
                <TextArea placeholder="请输入你的分析需求，例如：分析网站用户增长趋势" rows={4} />
              </Form.Item>

              <Form.Item
                name="chartType"
                label="图表类型"
                rules={[{ required: true, message: '请选择图表类型!' }]}
              >
                <Select placeholder="请选择图表类型">
                  <Select.Option value="折线图">折线图</Select.Option>
                  <Select.Option value="柱状图">柱状图</Select.Option>
                  <Select.Option value="饼图">饼图</Select.Option>
                  <Select.Option value="条形图">条形图</Select.Option>
                  <Select.Option value="散点图">散点图</Select.Option>
                  <Select.Option value="面积图">面积图</Select.Option>
                  <Select.Option value="雷达图">雷达图</Select.Option>
                  <Select.Option value="漏斗图">漏斗图</Select.Option>
                  <Select.Option value="热力图">热力图</Select.Option>
                  <Select.Option value="地图">地图</Select.Option>
                  <Select.Option value="仪表盘">仪表盘</Select.Option>
                  <Select.Option value="树图">树图</Select.Option>
                  <Select.Option value="桑基图">桑基图</Select.Option>
                  <Select.Option value="箱线图">箱线图</Select.Option>
                  <Select.Option value="K线图">K线图</Select.Option>
                  <Select.Option value="关系图">关系图</Select.Option>
                  <Select.Option value="旭日图">旭日图</Select.Option>
                  <Select.Option value="词云图">词云图</Select.Option>
                  <Select.Option value="瀑布图">瀑布图</Select.Option>
                  <Select.Option value="极坐标图">极坐标图</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="上传数据">
                <Form.Item
                  name="files"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  noStyle
                  rules={[{ required: true, message: '请上传文件!' }]}
                >
                  <Upload.Dragger
                    name="file"
                    maxCount={1} // 限制上传文件数量为 1
                    beforeUpload={() => false} // 阻止自动上传
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖动文件到此处上传</p>
                    <p className="ant-upload-hint">支持.xlsx文件上传</p>
                  </Upload.Dragger>
                </Form.Item>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
                    提交
                  </Button>
                  <Button htmlType="reset" onClick={resetState}>清空</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 图表和分析结论部分 */}
        <Col xs={24} md={12}>
          <Card title="生成图表" bordered={false} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ marginBottom: '24px' }}>
              {renderChartContent()}
            </div>
          </Card>

          <Card
            title="分析结论"
            bordered={false}
            style={{ marginTop: '24px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
          >
            {renderResultContent()}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddChart;
