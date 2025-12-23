# Nexo - 数字藏品交易平台

一个基于 React Native 和 Expo 构建的数字藏品（NFT）交易平台前端应用。

## 项目结构

```
src/
├── app/                    # 页面路由（Expo Router）
│   ├── (tabs)/            # 底部导航页面
│   │   ├── home.tsx      # 首页
│   │   ├── market.tsx     # NFT 市场
│   │   ├── mint.tsx       # 铸造页面
│   │   ├── notifications.tsx  # 通知页面
│   │   └── profile.tsx    # 个人中心
│   └── auth/              # 认证相关页面
│       ├── login.tsx      # 登录
│       └── register.tsx   # 注册
├── components/            # 组件
│   ├── business/         # 业务组件
│   │   ├── NFTCard/      # NFT 卡片
│   │   └── NFTList/      # NFT 列表
│   └── ui/               # 基础 UI 组件
│       ├── Avatar/       # 头像组件
│       ├── LiquidGlassButton/  # 玻璃态按钮
│       └── NexoInput/     # 输入框组件
├── config/               # 配置文件
│   ├── env.ts           # 环境变量配置
│   └── theme.ts         # 主题配置
├── constants/           # 常量定义
│   ├── api.ts          # API 端点
│   ├── messages.ts     # 消息常量
│   └── routes.ts       # 路由常量
├── hooks/              # 自定义 Hooks
│   ├── useAuth.ts     # 认证相关
│   ├── useNFT.ts      # NFT 相关
│   └── useMarket.ts   # 市场相关
├── services/          # API 服务层
│   └── api.ts         # API 请求封装（支持 Mock 模式）
├── mock/             # Mock 数据系统
│   ├── data/         # Mock 数据
│   │   ├── users.ts  # 用户数据
│   │   ├── nfts.ts   # NFT 数据
│   │   ├── collections.ts # 收藏集数据
│   │   ├── transactions.ts # 交易数据
│   │   ├── notifications.ts # 通知数据
│   │   └── market.ts # 市场数据
│   ├── api.ts        # Mock API 服务
│   ├── utils.ts      # Mock 工具函数
│   └── README.md      # Mock 系统文档
├── types/             # TypeScript 类型定义
│   └── index.ts       # 类型导出
└── utils/            # 工具函数
    ├── storage.ts    # 本地存储
    ├── request.ts    # HTTP 请求
    ├── validation.ts # 表单验证
    ├── logger.ts     # 日志工具
    └── errorHandler.ts # 错误处理
```

## 技术栈

- **框架**: React Native + Expo
- **路由**: Expo Router (文件系统路由)
- **语言**: TypeScript
- **状态管理**: React Hooks
- **UI 库**: Expo 官方组件 + 自定义组件
- **代码规范**: ESLint + Prettier

## 功能特性

### 已实现功能

- ✅ 用户认证（登录/注册）
- ✅ NFT 市场浏览
- ✅ NFT 详情查看
- ✅ NFT 铸造
- ✅ 个人中心
- ✅ 通知系统
- ✅ 收藏/点赞功能
- ✅ 图片上传

### 核心模块

1. **认证系统** (`useAuth`)
   - 登录/注册
   - Token 管理
   - 用户信息存储

2. **NFT 管理** (`useNFT`)
   - NFT 列表获取
   - NFT 详情
   - 点赞/取消点赞

3. **市场功能** (`useMarket`)
   - 市场列表
   - 热门推荐
   - 搜索功能
   - 市场统计

4. **API 服务层**
   - 统一的请求封装
   - 错误处理
   - Token 自动注入

5. **工具函数**
   - 本地存储封装
   - 表单验证
   - 数据格式化
   - 错误处理

## 开始使用

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 启动开发服务器

```bash
# 启动 Expo 开发服务器
npm start

# 或使用特定平台
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

### Mock 模式（后端未开发时）

项目内置了完整的 Mock 系统，可以在后端未开发完成时使用模拟数据：

1. **开启 Mock 模式**：在 `src/config/env.ts` 中设置 `USE_MOCK = true`
2. **测试账号**：
   - 手机号：任意 11 位数字
   - 验证码：`123456`（Mock 模式下所有验证码都使用此值）
3. **Mock 数据**：包含 100+ NFT、用户、交易、通知等模拟数据

详细说明请查看 [Mock 系统文档](./src/mock/README.md)

### 环境配置

在 `src/config/env.ts` 中配置 API 地址和其他环境变量：

```typescript
// Mock 模式开关
export const USE_MOCK = __DEV__ && true // 开发环境默认使用 mock

// API 配置
export const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
  },
  // ...
}
```

## 代码规范

### 命名规范

- **组件**: PascalCase (如 `NFTCard`)
- **文件**: camelCase (如 `useAuth.ts`)
- **常量**: UPPER_SNAKE_CASE (如 `API_ENDPOINTS`)
- **类型/接口**: PascalCase (如 `User`, `NFT`)

### 代码风格

项目使用 Prettier 进行代码格式化：

```bash
# 格式化代码
npm run format

# 检查代码规范
npm run lint
```

## 项目规范

### 1. 组件开发

- 使用 TypeScript 定义 Props 类型
- 组件文件放在对应的目录下
- 每个组件一个文件夹，包含 `home.tsx`

### 2. API 调用

- 所有 API 调用通过 `services/api.ts` 中的方法
- 使用自定义 Hooks 管理数据状态
- 统一错误处理

### 3. 状态管理

- 使用 React Hooks 管理组件状态
- 全局状态通过 Context 或自定义 Hooks 共享
- 本地状态使用 `useState` 或 `useReducer`

### 4. 样式管理

- 使用 StyleSheet 创建样式
- 主题配置在 `src/config/theme.ts`
- 统一使用主题中的颜色、间距等

### 5. 路由管理

- 使用 Expo Router 文件系统路由
- 路由常量定义在 `src/constants/routes.ts`
- 使用 `useRouter` Hook 进行导航

## 开发指南

### 添加新页面

1. 在 `src/app` 目录下创建新文件
2. 导出默认组件
3. 在 `src/constants/routes.ts` 中添加路由常量

### 添加新 API

1. 在 `src/constants/api.ts` 中添加端点
2. 在 `src/services/api.ts` 中添加方法
3. 在 `src/types/index.ts` 中添加类型定义

### 添加新组件

1. 在 `src/components` 下创建组件文件夹
2. 创建 `home.tsx` 文件
3. 在对应的 `index.ts` 中导出

## 注意事项

1. **AsyncStorage**: 需要安装 `@react-native-async-storage/async-storage`
2. **图片选择**: 需要安装 `expo-image-picker`
3. **环境变量**: 根据实际环境修改 `src/config/env.ts`
4. **API 地址**: 确保后端 API 地址正确配置
5. **Mock 模式**: 开发时默认开启 Mock 模式，后端开发完成后可关闭

## 待办事项

- [ ] 添加钱包连接功能
- [ ] 实现 NFT 详情页
- [ ] 添加交易历史
- [ ] 实现搜索功能
- [ ] 添加收藏集功能
- [ ] 优化性能
- [ ] 添加单元测试

## 许可证

MIT
