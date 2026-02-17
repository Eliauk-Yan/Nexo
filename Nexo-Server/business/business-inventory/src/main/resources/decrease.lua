-- 1. 幂等性检查
if redis.call('hexists', KEYS[2], ARGV[2]) == 1 then
    return redis.error_reply('OPERATION_ALREADY_EXECUTED')
end
-- 2. 获取当前库存值 (KEYS[1])
local current = redis.call('get', KEYS[1])
-- 如果 Key 不存在，返回错误回复
if current == false then
    return redis.error_reply('KEY_NOT_FOUND')
end
-- 如果获取到的值不是数字，防御性报错
if tonumber(current) == nil then
    return redis.error_reply('current value is not a number')
end
-- 如果库存已经是 0，直接返回售罄
if tonumber(current) == 0 then
    return redis.error_reply('INVENTORY_IS_ZERO')
end
-- 如果当前库存小于请求扣减的数量 (ARGV[1])，返回库存不足
if tonumber(current) < tonumber(ARGV[1]) then
    return redis.error_reply('INVENTORY_NOT_ENOUGH')
end
-- 3. 执行扣减逻辑
local new = tonumber(current) - tonumber(ARGV[1])
-- 将扣减后的新库存写回 Redis
redis.call('set', KEYS[1], tostring(new))
-- 4. 记录流水日志（用于对账或回查）
-- 获取Redis服务器的当前时间（秒和微秒）
local time = redis.call("time")
-- 转换为毫秒级时间戳
local currentTimeMillis = (time[1] * 1000) + math.floor(time[2] / 1000)
-- 将操作详情（动作、前值、后值、变更量、操作者、时间戳）以 JSON 格式存入 HASH 结构 (KEYS[2])
redis.call('hset', KEYS[2], ARGV[2], cjson.encode({
    action = "decrease",
    from = current,
    to = new,
    change = ARGV[1],
    by = ARGV[2],
    timestamp = currentTimeMillis
}))
-- 5. 返回更新后的库存数量
return new