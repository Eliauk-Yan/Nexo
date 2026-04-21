package com.nexo.business.order.job;

import com.alibaba.nacos.common.utils.CollectionUtils;
import com.nexo.business.order.domain.entity.TradeOrder;
import com.nexo.business.order.service.OrderService;
import com.nexo.common.api.order.OrderFacade;
import com.nexo.common.api.order.request.OrderTimeoutRequest;
import com.nexo.common.api.pay.PayFacade;
import com.nexo.common.api.pay.constant.PayState;
import com.nexo.common.api.pay.request.PayQueryRequest;
import com.nexo.common.api.pay.response.data.PayOrderVO;
import com.nexo.common.api.user.constant.UserType;
import com.nexo.common.base.response.MultiResponse;
import com.xxl.job.core.context.XxlJobHelper;
import com.xxl.job.core.handler.annotation.XxlJob;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.LinkedBlockingQueue;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderJob {

    private final OrderService orderService;

    /**
     * 数据分区最大值
     */
    private static final int MAX_TAIL_NUMBER = 99;

    /**
     * 每页大小
     */
    private static final int PAGE_SIZE = 500;

    /**
     * 阻塞队列大小
     */
    private static final int CAPACITY = 2000;

    /**
     * 订单超时阻塞队列 解耦查询和处理 提高并发量
     */
    private final BlockingQueue<TradeOrder> orderTimeoutBlockingQueue = new LinkedBlockingQueue<>(CAPACITY);

    /**
     * Java提供适合批处理的高性能线程池 8核CPU推荐 8 - 16
     */
    private final ForkJoinPool forkJoinPool = new ForkJoinPool(10);

    /**
     * 毒丸对象 通知消费者线程可以安全退出，不要一直阻塞等待。
     */
    private static final TradeOrder POISON = new TradeOrder();

    /**
     * 支付模块接口
     */
    @DubboReference(version = "1.0.0")
    private PayFacade payFacade;

    /**
     * 订单模块接口
     */
    @DubboReference(version = "1.0.0")
    private OrderFacade orderFacade;

    @XxlJob("testJob")
    public void testJob() {
        log.info("测试任务执行成功...");
    }

    @XxlJob("orderTimeOutExecute")
    public void orderTimeOutExecute() {
        try {
            // 1. 获取当前分片索引
            int shardIndex = XxlJobHelper.getShardIndex();
            // 2. 获取分片总数
            int shardTotal = XxlJobHelper.getShardTotal();
            log.info("订单超时执行器 开始执行 , 当前分片索引：{} , 分片总数：{}", shardIndex, shardTotal);
            // 3. 筛选当前分片要执行的数据
            List<String> buyerIdTailList = new ArrayList<>();
            for (int i = 0; i <= MAX_TAIL_NUMBER; i++) { // 00 - 99 平均分配给每个执行器
                if (i % shardTotal == shardIndex) {
                    buyerIdTailList.add(StringUtils.leftPad(String.valueOf(i), 2, "0"));
                }
            }
            // 4. 遍历当前分片要处理的数据尾号
            buyerIdTailList.forEach(buyerIdTailNumber -> {
                try {
                    // 4.1 批量查询超时订单
                    List<TradeOrder> tradeOrders = orderService.pageQueryTimeoutOrders(PAGE_SIZE, buyerIdTailNumber, null);
                    // 4.2 加入阻塞队列
                    orderTimeoutBlockingQueue.addAll(tradeOrders);
                    // 4.3 线程池执行
                    forkJoinPool.execute(this::executeTimeout);
                    while (CollectionUtils.isNotEmpty(tradeOrders)) {
                        // 4.4 标记目前已处理最大的订单ID
                        long maxId = tradeOrders.stream().mapToLong(TradeOrder::getId).max().orElse(Long.MAX_VALUE);
                        tradeOrders = orderService.pageQueryTimeoutOrders(PAGE_SIZE, buyerIdTailNumber, maxId + 1);
                        orderTimeoutBlockingQueue.addAll(tradeOrders);
                    }
                } finally {
                    orderTimeoutBlockingQueue.add(POISON);
                    log.debug("毒丸对象已经添加到阻塞队列 ，买家ID尾号 是 {}", buyerIdTailNumber);
                }
            });
        } catch (Exception e) {
            log.error("订单超时执行器 失败", e);
            throw e;
        }
    }

    private void executeTimeout() {
        TradeOrder tradeOrder = null;
        try {
            while (true) {
                // 从阻塞队列中获取订单，若队列为空则阻塞等待
                tradeOrder = orderTimeoutBlockingQueue.take();
                // 收到毒丸对象，表示没有更多数据，退出循环
                if (tradeOrder == POISON) {
                    log.debug("从阻塞队列中获取到结束标识（POISON），消费者线程准备退出");
                    break;
                }
                // 打印当前处理的订单ID
                log.info("开始处理超时订单，订单ID：{}", tradeOrder.getId());
                // 执行单个订单超时处理逻辑
                executeTimeoutSingle(tradeOrder);
            }
        } catch (InterruptedException e) {
            log.error("订单超时处理线程被中断", e);
            Thread.currentThread().interrupt(); // 建议补上，恢复中断状态
        }

        log.debug("订单超时处理线程执行结束");
    }
    private void executeTimeoutSingle(TradeOrder tradeOrder) {
        // 查询支付单，判断是否已经支付成功。防止用户正在支付被取消
        PayQueryRequest request = new PayQueryRequest();
        request.setPayerId(tradeOrder.getBuyerId());
        request.setPayState(PayState.PAID);
        request.setBizNo(tradeOrder.getOrderId());
        request.setBizType("TRADE_ORDER");
        MultiResponse<PayOrderVO> payQueryResponse = payFacade.queryPayOrders(request);
        if (payQueryResponse.getSuccess() && CollectionUtils.isEmpty(payQueryResponse.getData())) {
            log.info("开始执行订单超时 , 订单： {}", tradeOrder.getOrderId());
            OrderTimeoutRequest orderTimeoutRequest = new OrderTimeoutRequest();
            orderTimeoutRequest.setOrderId(tradeOrder.getOrderId());
            orderTimeoutRequest.setOperateTime(LocalDateTime.now());
            orderTimeoutRequest.setOperator(UserType.PLATFORM.getCode());
            orderTimeoutRequest.setOperatorType(UserType.PLATFORM);
            orderTimeoutRequest.setIdentifier(tradeOrder.getOrderId());
            orderFacade.timeout(orderTimeoutRequest);
        }
    }

}
