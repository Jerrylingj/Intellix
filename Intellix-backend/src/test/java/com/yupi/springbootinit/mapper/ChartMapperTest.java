package com.yupi.springbootinit.mapper;

import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.exception.ThrowUtils;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import javax.annotation.Resource;

import java.util.*;

@SpringBootTest
class ChartMapperTest {

    @Resource
    private ChartMapper chartMapper;

    @Test
    void queryChartData() {
        String querySql = "select * from chart_1879911545509801986";
        List<Map<String, Object>> resultData = chartMapper.queryChartData(querySql);
        System.out.println(resultData);
    }

    @Test
    public void createChartData() {
        // 先写死
        String chartId = "1879911545509801986";
        String chartData = "name,age,city\n" +
                "Alice,30,\"New York\"\n" +
                "Bob,25,\"San Francisco\"\n" +
                "\"Charlie, Jr.\",35,\"Los Angeles\"";

        // 1. 解析 CSV 数据
        List<String> headers = Arrays.asList(chartData.split("\n")[0].split(",")); // 获取 CSV 列名
        List<Map<String, String>> rows = parseCsvRows(chartData); // 获取 CSV 数据行

        // 2. 生成创建分表的 SQL
        String createTableSql = generateCreateTableSql(chartId, headers);
        chartMapper.executeSql(createTableSql);

        // 3. 生成插入数据的 SQL 并执行
        for (Map<String, String> row : rows) {
            String insertSql = generateInsertSql(chartId, headers, row);
            chartMapper.executeSql(insertSql);
        }
    }

    /**
     * 解析 CSV 数据行
     */
    private List<Map<String, String>> parseCsvRows(String chartData) {
        String[] lines = chartData.split("\r?\n");
        List<String> headers = Arrays.asList(lines[0].split(","));
        List<Map<String, String>> rows = new ArrayList<>();

        for (int i = 1; i < lines.length; i++) {
            String line = lines[i];
            if (line.trim().isEmpty()) {
                continue; // 跳过空行
            }

            String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
            Map<String, String> row = new HashMap<>();

            for (int j = 0; j < headers.size(); j++) {
                String value = (j < values.length) ? values[j].trim() : ""; // 处理列数不足的情况
                row.put(headers.get(j), value);
            }
            rows.add(row);
        }

        return rows;
    }

    /**
     * 生成创建分表的 SQL
     */
    private String generateCreateTableSql(String chartId, List<String> headers) {
        StringBuilder sql = new StringBuilder();
        sql.append("CREATE TABLE IF NOT EXISTS chart_").append(chartId).append(" (");
        for (String header : headers) {
            sql.append(header).append(" VARCHAR(255), ");
        }
        sql.delete(sql.length() - 2, sql.length()); // 去掉最后一个逗号
        sql.append(")");
        return sql.toString();
    }

    /**
     * 生成插入数据的 SQL
     */
    private String generateInsertSql(String chartId, List<String> headers, Map<String, String> row) {
        StringBuilder sql = new StringBuilder();
        sql.append("INSERT INTO chart_").append(chartId).append(" (");
        for (String header : headers) {
            sql.append(header).append(", ");
        }
        sql.delete(sql.length() - 2, sql.length()); // 去掉最后一个逗号
        sql.append(") VALUES (");

        for (String header : headers) {
            String value = row.get(header);
            sql.append("'").append(value.replace("'", "''")).append("', "); // 处理单引号
        }
        sql.delete(sql.length() - 2, sql.length()); // 去掉最后一个逗号
        sql.append(")");
        return sql.toString();
    }

}