-- 1. 幂等性检查：这里传一个专门的回退标识，比如 INCREASE_ + identifier
if redis.call('hexists', KEYS[2], ARGV[2]) == 1 then
    return redis.error_reply('OPERATION_ALREADY_EXECUTED')
end
-- 2. 获取当前库存值 (KEYS[1])
local current = redis.call('get', KEYS[1])
-- 如果 Key 不存在，说明库存还没初始化或者已经过期丢弃（理论上不该出现）
if current == false then
    return redis.error_reply('KEY_NOT_FOUND')
end
-- 如果获取到的值不是数字，防御性报错
if tonumber(current) == nil then
    return redis.error_reply('current value is not a number')
end
-- 3. 执行加回逻辑 (当前库存 + 还原的数量)
local new = tonumber(current) + tonumber(ARGV[1])
-- 将恢复后的新库存写回 Redis
redis.call('set', KEYS[1], tostring(new))
-- 4. 记录流水日志（用于对账或回查），标明这是 increase 操作
-- 获取Redis服务器的当前时间（秒和微秒）
local time = redis.call("time")
-- 转换为毫秒级时间戳
local currentTimeMillis = (time[1] * 1000) + math.floor(time[2] / 1000)
-- 将操作详情存入 HASH 结构 (KEYS[2])
redis.call('hset', KEYS[2], ARGV[2], cjson.encode({
    action = "increase",
    from = current,
    to = new,
    change = ARGV[1],
    by = ARGV[2],
    timestamp = currentTimeMillis
}))
-- 5. 返回更新后的库存数量
return new
