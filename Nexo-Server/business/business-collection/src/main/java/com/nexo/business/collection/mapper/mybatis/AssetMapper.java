package com.nexo.business.collection.mapper.mybatis;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexo.business.collection.domain.entity.Asset;
import com.nexo.business.collection.interfaces.vo.AssetVO;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;


@Repository
public interface AssetMapper extends BaseMapper<Asset> {

    @Select("""
            <script>
            SELECT
                a.id,
                a.nft_id AS nftId,
                n.name AS nftName,
                n.cover AS nftCover,
                a.purchase_price AS purchasePrice,
                a.serial_number AS serialNumber,
                a.state AS state,
                a.transaction_hash AS transactionHash,
                a.created_at AS createdAt
            FROM assets a
            LEFT JOIN nft n ON a.nft_id = n.id
            WHERE a.current_holder_id = #{userId}
              AND a.deleted = 0
            <if test="keyword != null and keyword != ''">
                AND (
                    n.name LIKE CONCAT('%', #{keyword}, '%')
                    OR a.serial_number LIKE CONCAT('%', #{keyword}, '%')
                )
            </if>
            <if test="state != null and state != ''">
                AND a.state = #{state}
            </if>
            ORDER BY a.created_at DESC
            </script>
            """)
    Page<AssetVO> getAssetList(@Param("page") Page<AssetVO> page,
                               @Param("userId") Long userId,
                               @Param("keyword") String keyword,
                               @Param("state") String state);
}
