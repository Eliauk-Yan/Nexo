package com.nexo.business.user.mapper.mybatis;

import com.alicp.jetcache.anno.CacheRefresh;
import com.alicp.jetcache.anno.CacheType;
import com.alicp.jetcache.anno.Cached;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.nexo.business.user.domain.entity.User;
import com.nexo.business.user.interfaces.vo.UserProfileVO;
import org.apache.ibatis.annotations.Select;

import java.util.concurrent.TimeUnit;

public interface UserMapper extends BaseMapper<User> {

    /**
     * 根据用户ID 查询账户信息
     *
     * @param userId 用户 ID
     * @return 账户信息
     */
    @Cached(name = ":user:cache:id:", cacheType = CacheType.BOTH, key = "#userId", cacheNullValue = true) // 缓存空值防止缓存穿透
    @CacheRefresh(refresh = 60, timeUnit = TimeUnit.MINUTES)
    @Select("""
            select
                users.avatar_url as avatarUrl,
                users.nick_name as nickName,
                users.phone as phone,
                users.password as password
            from users
            where deleted = '0'
            and id = #{userId}
            """)
    UserProfileVO selectUserProfileById(long userId);
}
