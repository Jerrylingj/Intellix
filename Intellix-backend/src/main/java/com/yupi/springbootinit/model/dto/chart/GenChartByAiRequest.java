package com.yupi.springbootinit.model.dto.chart;

import java.io.Serializable;
import lombok.Data;

/**
 * 更新请求
 *
 * @author <a href="https://github.com/liyupi">程序员鱼皮</a>
 * @from <a href="https://yupi.icu">编程导航知识星球</a>
 */
@Data
public class GenChartByAiRequest implements Serializable {

    /**
     * 分析目标
     */
    private String goal;

    /**
     * 图表类型
     */
    private String chartType;

    /**
     * 图表名称
     */
    private String name;


    private static final long serialVersionUID = 1L;
}

