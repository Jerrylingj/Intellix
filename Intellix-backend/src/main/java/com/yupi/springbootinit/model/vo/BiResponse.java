package com.yupi.springbootinit.model.vo;

import lombok.Data;

/**
 * BI 返回结果
 */
@Data
public class BiResponse {
    private Long id;
    private String status;
    private String genChart;
    private String genResult;
    private String execMessage;
}
