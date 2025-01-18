package com.yupi.springbootinit.mapper;

import com.yupi.springbootinit.model.entity.Chart;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

import java.util.List;
import java.util.Map;

/**
* @author 49853
* @description 针对表【chart(图表信息)】的数据库操作Mapper
* @createDate 2025-01-15 13:45:44
* @Entity com.yupi.springbootinit.model.entity.Chart
*/
public interface ChartMapper extends BaseMapper<Chart> {
    List<Map<String, Object>> queryChartData(String querySql);

//    void createChartData(String subTableSql);
    void executeSql(String sql);
}





