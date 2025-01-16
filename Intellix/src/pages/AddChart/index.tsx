import {
  InboxOutlined,
} from '@ant-design/icons';
import { Button, Card, Form, Input, message, Select, Space, Upload, Row, Col } from 'antd';
import React, { useState } from 'react';
import { genChartByAiUsingPost } from "@/services/intellixbi/chartController";
import TextArea from "antd/es/input/TextArea";
import ReactECharts from 'echarts-for-react';

/**
 * 添加图表页面
 * @constructor
 */
const AddChart: React.FC = () => {
  const [chart, setChart] = useState<API.BiResponse>(); // 用于存储图表数据
  const [option, setOption] = useState<any>();
  const [submitting, setSubmmitting] = useState<boolean>(false);

  // 修改 normFile 函数，确保返回的是一个数组
  const normFile = (e: any) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList ? [e.fileList[0]] : []; // 确保返回的是一个数组
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
      console.log('res.data.genChart:', res.data?.genChart);
      console.log('typeof res.data.genChart:', typeof res.data?.genChart);
      if (!res?.data) {
        message.error('分析失败');
      } else {
        const chartOption = JSON.parse(res.data.genChart ?? '');
        if (!chartOption) {
          throw new Error('图表代码解析错误！');
        } else {
          setChart(res.data); // 更新图表数据
          setOption(chartOption);
          message.success('分析成功');
        }
      }
    } catch (e: any) {
      message.error('分析失败，' + e.message);
    }
    setSubmmitting(false);
  };

  return (
    <div className="add-chart" style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* 表单部分 */}
        <Col xs={24} md={12}>
          <Card title="添加图表" bordered={false} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <Form
              name="add-chart"
              onFinish={onFinish}
              initialValues={{}}
              layout="vertical"
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
                  <Button htmlType="reset">清空</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 图表和分析结论部分 */}
        <Col xs={24} md={12}>
          <Card title="生成图表" bordered={false} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ marginBottom: '24px' }}>
              {option ? <ReactECharts option={option} style={{ height: '400px' }}/> : <div>请先提交图表数据</div>}
            </div>
          </Card>

          <Card
            title="分析结论"
            bordered={false}
            style={{ marginTop: '24px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
          >
            <div style={{ whiteSpace: 'pre-line' }}>{chart?.genResult ?? '请先提交图表数据'}</div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddChart;
