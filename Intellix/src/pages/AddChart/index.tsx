import {
  InboxOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, message, Select, Space, Upload } from 'antd';
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
    <div className="add-chart">
      添加图表
      <Form
        name="add-chart"
        onFinish={onFinish}
        initialValues={{}}
      >
        <Form.Item name="name" label="图表名称">
          <Input placeholder="请输入图表名称" />
        </Form.Item>

        <Form.Item name="goal" label="分析目标" rules={[{ required: true, message: '请输入分析目标!' }]}>
          <TextArea placeholder="请输入你的分析需求，例如：分析网站用户增长趋势" />
        </Form.Item>

        <Form.Item name="chartType" label="图表类型">
          <Select options={[
            { value: '折线图', label: '折线图' },
            { value: '柱状图', label: '柱状图' },
            { value: '饼图', label: '饼图' },
            { value: '条形图', label: '条形图' },
            { value: '散点图', label: '散点图' },
            { value: '面积图', label: '面积图' },
            { value: '雷达图', label: '雷达图' },
            { value: '漏斗图', label: '漏斗图' },
            { value: '热力图', label: '热力图' },
            { value: '地图', label: '地图' },
            { value: '仪表盘', label: '仪表盘' },
            { value: '树图', label: '树图' },
            { value: '桑基图', label: '桑基图' },
            { value: '箱线图', label: '箱线图' },
            { value: 'K线图', label: 'K线图' },
            { value: '关系图', label: '关系图' },
            { value: '旭日图', label: '旭日图' },
            { value: '词云图', label: '词云图' },
            { value: '瀑布图', label: '瀑布图' },
            { value: '极坐标图', label: '极坐标图' },
          ]}>
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

        <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
              提交
            </Button>
            <Button htmlType="reset">清空</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 图表展示部分 */}
      <div>
        生成图表：
        {
          option && <ReactECharts option={option}/>
        }

      </div>

      {/* 分析结论部分 */}
      <div>
        分析结论：
        {chart?.genResult}
      </div>
    </div>
  );
};

export default AddChart;
