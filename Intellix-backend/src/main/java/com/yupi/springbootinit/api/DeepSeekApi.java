package com.yupi.springbootinit.api;

import okhttp3.*;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

public class DeepSeekApi {

    public Response getContent(StringBuilder message) throws IOException {
        String url = "https://api.deepseek.com/chat/completions";
        String api_key = "sk-9bdc8373230242ba8e1038d3e3197264";

        // 构建 prompt
        StringBuilder prompt = new StringBuilder();
        prompt.append("您将担任数据科学家和高级前端开发人员，为一家尖端科技公司开发智能 BI 平台。");
        prompt.append("您的任务是根据用户提供的分析目标、图表需求和数据，提取有价值的见解，并生成高质量的图表代码和专业分析结论。");
        prompt.append("请确保输出内容精准、美观，并严格按照以下格式和要求提供结果。\\n\\n");

        prompt.append("### 输入格式\\n\\n");
        prompt.append("```\\n");
        prompt.append("分析目标：\\n");
        prompt.append("{明确描述数据分析的需求或目标}\\n\\n");
        prompt.append("图表类型：\\n");
        prompt.append("{用户需要展示的图表类型，例如：柱状图、折线图、饼图等，支持多图表组合。}\\n\\n");
        prompt.append("数据：\\n");
        prompt.append("{csv格式的原始数据，用,作为分隔符。}\\n\\n");
        prompt.append("需求细化（可选）：\\n");
        prompt.append("{对图表的细化要求，例如颜色主题、交互功能、布局优化等。}\\n");
        prompt.append("```\\n\\n");

        prompt.append("### 输出格式\\n\\n");
        prompt.append("#### 1. 图表代码部分\\n\\n");
        prompt.append("- 使用 **Echarts V5**，生成符合高质量标准的 `option` 配置代码。\\n");
        prompt.append("- **必须包含以下内容：**\\n");
        prompt.append("  - 图表标题：位置居中，使用加粗字体，明确反映主题。\\n");
        prompt.append("  - 坐标轴和数据标签：类别轴标签避免重叠，数值轴需标注单位，标签清晰。\\n");
        prompt.append("  - 数据系列：根据需求绘制适当图表（如柱状图、折线图、饼图等），突出重点数据。\\n");
        prompt.append("  - 动态交互功能：如悬停提示（tooltip）、数据缩放（dataZoom）、动态筛选。\\n");
        prompt.append("  - 视觉优化：提供统一的高对比度配色方案，确保图表美观、直观。\\n");
        prompt.append("- **代码部分不得包含注释或多余说明**，仅输出完整、可用的配置对象。\\n\\n");
        prompt.append("```\\n");
        prompt.append("option = {\\n");
        prompt.append("    // 图表代码\\n");
        prompt.append("};\\n");
        prompt.append("```\\n\\n");

        prompt.append("#### 2. 图表描述与分析结论部分\\n\\n");
        prompt.append("- **图表描述：** 简要概述图表类型及展示的内容，清晰传递图表的关键信息。\\n");
        prompt.append("- **分析结论：** 根据数据分析提供以下三点内容：\\n");
        prompt.append("  1. **趋势描述：** 总结数据中的主要趋势或模式，用简洁语言表述。\\n");
        prompt.append("  2. **异常点：** 列出数据中显著异常或差异点，并简要说明可能原因。\\n");
        prompt.append("  3. **业务洞察：** 提出实际建议或策略，例如决策优化、资源分配等。\\n");
        prompt.append("- 每部分内容应保持简洁、条理清晰，每点不超过 2-3 句话。\\n\\n");
        prompt.append("```\\n");
        prompt.append("图表描述：\\n");
        prompt.append("{简要描述图表展示的内容和关键变量}\\n\\n");
        prompt.append("趋势描述：\\n");
        prompt.append("{总结主要趋势}\\n\\n");
        prompt.append("异常点：\\n");
        prompt.append("{列出关键异常点及原因}\\n\\n");
        prompt.append("业务洞察：\\n");
        prompt.append("{提供实际可用的建议或策略}\\n");
        prompt.append("```\\n\\n");

        prompt.append("### 额外要求\\n\\n");
        prompt.append("1. **格式严格：** 输出必须按照“图表代码部分”和“图表描述与分析结论部分”分段。\\n");
        prompt.append("2. **内容精准：** 避免冗余语言，直接聚焦用户需求，确保分析内容具有实际价值。\\n");
        prompt.append("3. **结果美观：** 生成的图表需在视觉上整洁美观，代码结构清晰，便于复用和扩展。\\n");
        prompt.append("4. **异常处理：** 如数据中存在异常值或缺失值，应在分析中适当反映，并在图表中以合理方式呈现。\\n");

        // 对 message 进行转义处理
        String escapedMessage = escapeJson(message.toString());

        // 构建 JSON 请求体
        String requestBody = String.format(
                "{\n" +
                        "  \"messages\": [\n" +
                        "    {\n" +
                        "      \"content\": \"%s\",\n" +
                        "      \"role\": \"system\"\n" +
                        "    },\n" +
                        "    {\n" +
                        "      \"content\": \"%s\",\n" +
                        "      \"role\": \"user\"\n" +
                        "    }\n" +
                        "  ],\n" +
                        "  \"model\": \"deepseek-chat\",\n" +
                        "  \"frequency_penalty\": 0,\n" +
                        "  \"max_tokens\": 2048,\n" +
                        "  \"presence_penalty\": 0,\n" +
                        "  \"response_format\": {\n" +
                        "    \"type\": \"text\"\n" +
                        "  },\n" +
                        "  \"stop\": null,\n" +
                        "  \"stream\": false,\n" +
                        "  \"stream_options\": null,\n" +
                        "  \"temperature\": 1,\n" +
                        "  \"top_p\": 1,\n" +
                        "  \"tools\": null,\n" +
                        "  \"tool_choice\": \"none\",\n" +
                        "  \"logprobs\": false,\n" +
                        "  \"top_logprobs\": null\n" +
                        "}",
                prompt.toString().replace("\"", "\\\""),
                escapedMessage
        );

        // 创建 OkHttp 客户端
        OkHttpClient client = new OkHttpClient().newBuilder()
                .connectTimeout(30, TimeUnit.SECONDS) // 连接超时时间
                .readTimeout(30, TimeUnit.SECONDS)    // 读取超时时间
                .writeTimeout(30, TimeUnit.SECONDS)   // 写入超时时间
                .build();
        MediaType mediaType = MediaType.parse("application/json");
        RequestBody body = RequestBody.create(requestBody, mediaType);

        // 构建请求
        Request request = new Request.Builder()
                .url(url)
                .method("POST", body)
                .addHeader("Content-Type", "application/json")
                .addHeader("Accept", "application/json")
                .addHeader("Authorization", "Bearer " + api_key)
                .build();

        // 发送请求并返回响应
        return client.newCall(request).execute();
    }

    /**
     * 对字符串进行 JSON 转义处理
     */
    private String escapeJson(String input) {
        return input
                .replace("\\", "\\\\")  // 转义反斜杠
                .replace("\"", "\\\"")  // 转义双引号
                .replace("\n", "\\n")   // 转义换行符
                .replace("\t", "\\t")   // 转义制表符
                .replace("\r", "\\r")   // 转义回车符
                .replace("\b", "\\b")   // 转义退格符
                .replace("\f", "\\f");  // 转义换页符
    }
}