package com.yupi.springbootinit.manager;

import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.exception.BusinessException;
import org.redisson.api.RRateLimiter;
import org.redisson.api.RateIntervalUnit;
import org.redisson.api.RateType;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

/**
 * 专门提供 RedisLimiter 基础服务的（提供通用能力）
 */
@Service
public class RedisLimiterManager {

    @Resource
    private RedissonClient redisson;

    // 固定的限流速率（每秒允许的请求数）
    private static final long RATE = 2;

    // 固定的最大请求数
    private static final long BURST = 1;

    /**
     * 限流操作
     * @param key 区分不同的限流器，比如不同用户 id 应该分别统计
     * @return true 表示允许通过，false 表示限流
     */
    public void doRateLimit(String key) {
        // 获取或创建限流器
        RRateLimiter rateLimiter = redisson.getRateLimiter(key);

        // 设置限流器的速率和最大允许的请求数
        rateLimiter.trySetRate(RateType.OVERALL, RATE, BURST, RateIntervalUnit.SECONDS);

        // 尝试获取一个许可
        boolean getPermission = rateLimiter.tryAcquire(1);
        if (!getPermission) {
            throw new BusinessException(ErrorCode.TOO_MANY_REQUEST);
        }
    }
}