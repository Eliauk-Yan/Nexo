package com.nexo.business.user.mapper.mybatis;

import com.alicp.jetcache.anno.CacheRefresh;
import com.alicp.jetcache.anno.CacheType;
import com.alicp.jetcache.anno.Cached;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.nexo.business.user.domain.entity.User;
import com.nexo.business.user.interfaces.vo.UserProfileVO;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

import java.util.concurrent.TimeUnit;

@Repository
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
              u.avatar_url as avatarUrl,
              u.nick_name  as nickName,
              u.phone      as phone,
              u.password   as password,
              exists(
                select 1
                from nexo.certifications k
                where k.deleted = 0
                  and k.user_id = u.id
              ) as realNameAuth
            from users u
            where u.deleted = 0
              and u.id = #{userId}
            """)
    UserProfileVO selectUserProfileById(long userId);
}
