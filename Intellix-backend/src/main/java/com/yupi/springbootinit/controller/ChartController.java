package com.yupi.springbootinit.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.annotation.AuthCheck;
import com.yupi.springbootinit.api.DeepSeekApi;
import com.yupi.springbootinit.common.BaseResponse;
import com.yupi.springbootinit.common.DeleteRequest;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.common.ResultUtils;
import com.yupi.springbootinit.constant.CommonConstant;
import com.yupi.springbootinit.constant.FileConstant;
import com.yupi.springbootinit.constant.UserConstant;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.exception.ThrowUtils;
import com.yupi.springbootinit.model.dto.chart.*;
import com.yupi.springbootinit.model.dto.file.UploadFileRequest;
import com.yupi.springbootinit.model.entity.Chart;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.enums.FileUploadBizEnum;
import com.yupi.springbootinit.service.ChartService;
import com.yupi.springbootinit.service.UserService;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import com.yupi.springbootinit.utils.ExcelUtils;
import com.yupi.springbootinit.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

/**
 * 帖子接口
 *
 * @author <a href="https://github.com/liyupi">程序员鱼皮</a>
 * @from <a href="https://yupi.icu">编程导航知识星球</a>
 */
@RestController
@RequestMapping("/chart")
@Slf4j
public class ChartController {

    @Resource
    private ChartService ChartService;

    @Resource
    private UserService userService;

    // region 增删改查

    /**
     * 创建
     *
     * @param ChartAddRequest
     * @param request
     * @return
     */
    @PostMapping("/add")
    public BaseResponse<Long> addChart(@RequestBody ChartAddRequest ChartAddRequest, HttpServletRequest request) {
        if (ChartAddRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Chart Chart = new Chart();
        BeanUtils.copyProperties(ChartAddRequest, Chart);
        User loginUser = userService.getLoginUser(request);
        Chart.setUserId(loginUser.getId());
        boolean result = ChartService.save(Chart);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        long newChartId = Chart.getId();
        return ResultUtils.success(newChartId);
    }

    /**
     * 删除
     *
     * @param deleteRequest
     * @param request
     * @return
     */
    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteChart(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User user = userService.getLoginUser(request);
        long id = deleteRequest.getId();
        // 判断是否存在
        Chart oldChart = ChartService.getById(id);
        ThrowUtils.throwIf(oldChart == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可删除
        if (!oldChart.getUserId().equals(user.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        boolean b = ChartService.removeById(id);
        return ResultUtils.success(b);
    }

    /**
     * 更新（仅管理员）
     *
     * @param ChartUpdateRequest
     * @return
     */
    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateChart(@RequestBody ChartUpdateRequest ChartUpdateRequest) {
        if (ChartUpdateRequest == null || ChartUpdateRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Chart Chart = new Chart();
        BeanUtils.copyProperties(ChartUpdateRequest, Chart);
        long id = ChartUpdateRequest.getId();
        // 判断是否存在
        Chart oldChart = ChartService.getById(id);
        ThrowUtils.throwIf(oldChart == null, ErrorCode.NOT_FOUND_ERROR);
        boolean result = ChartService.updateById(Chart);
        return ResultUtils.success(result);
    }

    /**
     * 根据 id 获取
     *
     * @param id
     * @return
     */
    @GetMapping("/get")
    public BaseResponse<Chart> getChartById(long id, HttpServletRequest request) {
        if (id <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Chart chart = ChartService.getById(id);
        if (chart == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
        }
        return ResultUtils.success(chart);
    }

    /**
     * 分页获取列表（封装类）
     *
     * @param ChartQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/list/page")
    public BaseResponse<Page<Chart>> listChartByPage(@RequestBody ChartQueryRequest ChartQueryRequest,
                                                       HttpServletRequest request) {
        long current = ChartQueryRequest.getCurrent();
        long size = ChartQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        Page<Chart> ChartPage = ChartService.page(new Page<>(current, size),
                getQueryWrapper(ChartQueryRequest));
        return ResultUtils.success(ChartPage);
    }

    /**
     * 分页获取当前用户创建的资源列表
     *
     * @param ChartQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/my/list/page")
    public BaseResponse<Page<Chart>> listMyChartByPage(@RequestBody ChartQueryRequest ChartQueryRequest,
                                                         HttpServletRequest request) {
        if (ChartQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User loginUser = userService.getLoginUser(request);
        ChartQueryRequest.setUserId(loginUser.getId());
        long current = ChartQueryRequest.getCurrent();
        long size = ChartQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        Page<Chart> ChartPage = ChartService.page(new Page<>(current, size),
                getQueryWrapper(ChartQueryRequest));
        return ResultUtils.success(ChartPage);
    }

    // endregion

    /**
     * 编辑（用户）
     *
     * @param ChartEditRequest
     * @param request
     * @return
     */
    @PostMapping("/edit")
    public BaseResponse<Boolean> editChart(@RequestBody ChartEditRequest ChartEditRequest, HttpServletRequest request) {
        if (ChartEditRequest == null || ChartEditRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Chart Chart = new Chart();
        BeanUtils.copyProperties(ChartEditRequest, Chart);
        User loginUser = userService.getLoginUser(request);
        long id = ChartEditRequest.getId();
        // 判断是否存在
        Chart oldChart = ChartService.getById(id);
        ThrowUtils.throwIf(oldChart == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可编辑
        if (!oldChart.getUserId().equals(loginUser.getId()) && !userService.isAdmin(loginUser)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        boolean result = ChartService.updateById(Chart);
        return ResultUtils.success(result);
    }

    /**
     * 获取查询包装类
     *
     * @param chartQueryRequest
     * @return
     */
    private QueryWrapper<Chart> getQueryWrapper(ChartQueryRequest chartQueryRequest) {
        QueryWrapper<Chart> queryWrapper = new QueryWrapper<>();
        if (chartQueryRequest == null) {
            return queryWrapper;
        }
        Long id = chartQueryRequest.getId();
        String goal = chartQueryRequest.getGoal();
        String chartType = chartQueryRequest.getChartType();
        String name = chartQueryRequest.getName();
        Long userId = chartQueryRequest.getUserId();
        String sortField = chartQueryRequest.getSortField();
        String sortOrder = chartQueryRequest.getSortOrder();

        queryWrapper.eq(id != null && id > 0, "id", id);
        queryWrapper.eq(StringUtils.isNotBlank(goal), "goal", goal);
        queryWrapper.like(StringUtils.isNotBlank(name), "name", name);
        queryWrapper.eq(StringUtils.isNotBlank(chartType), "chartType", chartType);
        queryWrapper.eq(ObjectUtils.isNotEmpty(userId), "userId", userId);

        queryWrapper.orderBy(SqlUtils.validSortField(sortField), sortOrder.equals(CommonConstant.SORT_ORDER_ASC),
                sortField);
        return queryWrapper;
    }

    /**
     * 智能分析
     *
     * @param multipartFile
     * @param genChartByAiRequest
     * @param request
     * @return
     */
    @PostMapping("/gen")
    public BaseResponse<String> genChartByAi(@RequestPart("file") MultipartFile multipartFile,
                                             GenChartByAiRequest genChartByAiRequest, HttpServletRequest request) throws FileNotFoundException {
        String goal = genChartByAiRequest.getGoal();
        String chartType = genChartByAiRequest.getChartType();
        String name = genChartByAiRequest.getName();

        // 校验
        ThrowUtils.throwIf(StringUtils.isBlank(goal), ErrorCode.PARAMS_ERROR, "目标为空");
        ThrowUtils.throwIf(StringUtils.isBlank(name) && name.length() > 100, ErrorCode.PARAMS_ERROR, "名称错误");

        // 用户输入
        StringBuilder userInput = new StringBuilder();

        userInput.append("分析目标: ").append(goal).append("\n");
        userInput.append("图表类型: ").append(chartType).append("\n");

        // 压缩后的输入
        String result = ExcelUtils.excelToCsv(multipartFile);
        userInput.append("数据: ").append(result).append("\n");

        DeepSeekApi api = new DeepSeekApi();

        try {
            Response response = api.getContent(userInput);
            if (response.isSuccessful()) {
                System.out.println("Response: " + response.body().string());
            } else {
                System.err.println("Request failed with code: " + response.code());
                System.err.println("Error message: " + response.body().string());
            }
            response.close(); // 手动关闭 Response
        } catch (IOException e) {
            e.printStackTrace();
        }
        return ResultUtils.success(userInput.toString());

//        // 读取用户上传的excel文件进行处理
//        User loginUser = userService.getLoginUser(request);
//        // 文件目录：根据业务、用户来划分
//        String uuid = RandomStringUtils.randomAlphanumeric(8);
//        String filename = uuid + "-" + multipartFile.getOriginalFilename();
//
//        File file = null;
//        try {
//            // 返回可访问地址
//            return ResultUtils.success("");
//        } catch (Exception e) {
////            log.error("file upload error, filepath = " + filepath, e);
//            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "上传失败");
//        } finally {
//            if (file != null) {
//                // 删除临时文件
//                boolean delete = file.delete();
//                if (!delete) {
//                    log.error("file delete error, filepath = {}", filepath);
//                }
//            }
//        }
    }
}
