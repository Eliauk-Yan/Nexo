# Mock 系统说明

## 概述

Mock 系统用于在后端 API 未开发完成时，提供模拟数据支持前端开发和测试。

## 使用方法

### 1. 开启/关闭 Mock 模式

在 `src/config/env.ts` 中修改 `USE_MOCK` 配置：

```typescript
export const USE_MOCK = __DEV__ && true // 开发环境使用 mock
```

- `true`: 使用 Mock API
- `false`: 使用真实 API

### 2. Mock 数据说明

#### 用户数据
- 默认用户：`CryptoArtist` (id: '1')
- 验证码：`123456`（所有验证码都使用此值）

#### NFT 数据
- 100 个模拟 NFT
- 包含多个收藏集：CyberPunk, Bored Ape, Azuki, Doodle, Cool Cats
- 随机生成属性、价格、状态等

#### 其他数据
- 收藏集：5 个
- 交易记录：50 条
- 通知：20 条
- 市场统计：模拟数据

## Mock API 特性

### 1. 网络延迟模拟
- 随机延迟 300-1500ms，模拟真实网络请求
- 使用 `randomDelay()` 函数

### 2. 分页支持
- 支持 `page` 和 `pageSize` 参数
- 自动计算 `total` 和 `totalPages`

### 3. 搜索和过滤
- 支持关键词搜索（名称、描述、收藏集）
- 支持价格范围过滤
- 支持分类过滤
- 支持排序（价格、时间、热度）

### 4. 数据操作
- 创建、更新、删除操作会修改内存中的数据
- 点赞/取消点赞会实时更新数据
- 通知已读状态会实时更新

## 测试账号

### 登录测试
- 手机号：任意 11 位数字
- 验证码：`123456`

### 注册测试
- 用户名：任意
- 手机号：任意 11 位数字
- 验证码：`123456`
- 密码：至少 8 位

## 注意事项

1. **验证码**：Mock 模式下，所有验证码都使用 `123456`
2. **数据持久化**：Mock 数据存储在内存中，刷新应用会重置
3. **图片上传**：Mock 模式下，图片上传会返回模拟 URL
4. **错误处理**：Mock API 会模拟一些错误场景（如验证码错误）

## 扩展 Mock 数据

### 添加新的 Mock 数据

1. 在 `src/mock/data/` 目录下创建新的数据文件
2. 在 `src/mock/api.ts` 中添加对应的 API 方法
3. 在 `src/services/api.ts` 中添加 Mock 模式判断

### 示例

```typescript
// src/mock/data/custom.ts
export const mockCustomData = [
  { id: '1', name: 'Custom Item' },
  // ...
]

// src/mock/api.ts
export const mockCustomApi = {
  getList: async () => {
    await randomDelay()
    return mockCustomData
  },
}

// src/services/api.ts
export const customApi = {
  getList: () => {
    if (USE_MOCK) {
      return getMockApi()?.mockCustomApi.getList()
    }
    return request.get(API_ENDPOINTS.CUSTOM.LIST)
  },
}
```

## 调试技巧

1. **查看 Mock 数据**：在控制台查看 `[Mock]` 开头的日志
2. **验证码提示**：发送验证码时会在控制台输出验证码
3. **延迟调整**：修改 `src/mock/utils.ts` 中的延迟时间

## 切换到真实 API

当后端开发完成后：

1. 修改 `src/config/env.ts` 中的 `USE_MOCK = false`
2. 确保 `API_BASE_URL` 配置正确
3. 测试所有 API 接口

