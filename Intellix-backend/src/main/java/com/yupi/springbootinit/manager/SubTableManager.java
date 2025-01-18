package com.yupi.springbootinit.manager;

import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.exception.BusinessException;
import org.redisson.api.RRateLimiter;
import org.redisson.api.RateIntervalUnit;
import org.redisson.api.RateType;
import org.springframework.stereotype.Service;

/**
 * 实现水平分表
 */
@Service
public class SubTableManager {

    /**
     * 水平分表
     * @param chartId
     * @param chartData
     */
    public void dosubTable(Long chartId, String chartData) {

    }
}
