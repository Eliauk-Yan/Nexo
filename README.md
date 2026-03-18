# Nexo - 数藏先锋
> **Nexo** 是一款基于微服务架构的分布式数字藏品（NFT）交易平台，旨在为用户提供安全、高效、透明的数字资产交易体验。

---

## 🌟 项目简介
Nexo 是一款集成了区块链技术、微服务治理和高性能前端框架的数字藏品平台。项目采用了最新的 **Spring Boot 3.5** 和 **Java 25** 技术栈，通过 **Spring Cloud Alibaba** 实现微服务治理，涵盖了从藏品铸造、上链、展示到合规交易的全流程业务逻辑。

## 🚀 核心特性
- **微服务架构**：基于 Spring Cloud Alibaba 实现高可用和可扩展的分布式系统。
- **区块链集成**：底层对接多链协议，支持藏品铸造 (Minting)、上链 (On-chain) 和销毁。
- **全端支持**：
  - **管理端 (Nexo-Admin)**：基于 Ant Design Pro，提供精美的后台管理运营能力。
  - **客户端 (Nexo-Client)**：基于 React Native & Expo，支持 iOS/Android 双端极致体验。
- **高并发治理**：集成 Sentinel 流量治理和 Nacos 服务注册中心，保障系统在高负载下的稳定性。

---

## 🛠️ 技术架构

### 🌐 后端 (Nexo-Server)
基于 **Spring Cloud 2025 & Java 25** 的微服务生态。
- **核心框架**: Spring Boot 3.5, Spring Cloud 2025, Spring Cloud Alibaba 2025
- **服务治理**: Nacos (注册中心/配置中心), Sentinel (流控降级)
- **网关**: Spring Cloud Gateway
- **认证授权**: Spring Security OAuth2 / JWT
- **数据库**: MySQL 8.0+, MyBatis-Plus
- **缓存**: Redis (分布式缓存/分布式锁)
- **消息队列**: RabbitMQ
- **区块链**: 抽象 ChainService 接口，支持 Mock 和真实链环境对接

### 💻 管理后端 (Nexo-Admin)
高性能企业级中后台前端解决方案。
- **框架**: React 19, UmiJS 4
- **UI 组件**: Ant Design 5.0 (v5)
- **脚本**: TypeScript
- **构建工具**: Vite / ESBuild

### 📱 移动客户端 (Nexo-Client)
跨平台应用开发。
- **框架**: React Native, Expo 54
- **导航**: Expo Router (Tree-shaking optimized)
- **交互**: Reanimated, Gesture Handler
- **样式**: Glassmorphism (玻璃拟态) 设计风格

---

## 📂 项目结构
```bash
Nexo/
├── Nexo-Server/               # 后端分布式微服务集群 (Maven)
│   ├── gateway/               # Spring Cloud Gateway [Port: 8080] - 统一网关、Sentinel 流控
│   ├── auth/                  # 认证中心 - 基于 Spring Security OAuth2 / JWT 的身份认证
│   ├── admin/                 # 管理运营模块 - 支撑管理后台的业务逻辑
│   ├── business/              # 核心业务微服务集
│   │   ├── business-blockchain/    # 区块链上链集成服务 (藏品铸造、异步上链、结果轮询)
│   │   ├── business-collection/    # 藏品/合集管理服务 (元数据定义、系列展示)
│   │   ├── business-inventory/     # 库存管理服务 (锁定库存、库存同步)
│   │   ├── business-notification/  # 消息通知服务 (站内信、推送通知)
│   │   ├── business-order/         # 订单生命周期服务 (创建单、超时取消、状态变更)
│   │   ├── business-pay/           # 支付对接服务 (三方支付集成、流水对账)
│   │   ├── business-trade/         # 市场撮合交易服务 (藏品挂售、购买匹配、二级市场)
│   │   └── business-user/          # 用户账户服务 (实名认证、RSA加密、用户画像)
│   └── common/                # 公共核心基础设施模块
│       ├── common-api/        # 统一接口定义、错误码与通用常量
│       ├── common-cache/      # 基于 Redis 的分布式缓存与分布式锁 (Redisson)
│       ├── common-mq/         # 消息队列封装 (RocketMQ/RabbitMQ 适配器)
│       ├── common-file/       # 文件/OSS 对象存储服务封装
│       └── common-web/        # Web 通用组件 (异常处理器、拦截器、请求日志)
├── Nexo-Admin/                # 后台管理系统 (React 19 + UmiJS 4)
│   ├── src/
│   │   ├── api/               # 模块化 API 请求层
│   │   ├── locales/           # i18n 国际化配置 (zh-CN/en-US)
│   │   ├── pages/             # 业务页面 (用户管理、藏品审核、交易流水、系统监控)
│   │   └── components/        # 企业级封装组件 (ProTable, Dashboard Charts)
│   └── config/                # Umi 路由、代理与构建配置
└── Nexo-Client/               # 移动端 APP (Expo 54 + React Native)
    ├── src/
    │   ├── app/               # Expo Router 文件路由系统 (auth/tabs/details)
    │   ├── components/        # 移动端 UI 组件库 (Glassmorphism 玻璃拟态实现)
    │   ├── hooks/             # 自定义 React Hooks (身份状态同步、滚动监听)
    │   └── services/          # 客户端业务 API 封装层
    └── app.json               # Expo 全局应用配置
```

---

## 🎨 设计美学
Nexo 坚持 **Premium UI** 设计理念：
- **Dark Mode**: 系统原生支持暗黑模式，沉浸式交易体验。
- **Micro-interactions**: 精致的微动画效果，提升操作反馈愉悦感。
- **Modern Typography**: 采用 Inter 与 HarmonyOS Sans 字体，展现极致的可读性。

---

## 🏁 快速开始

### 1. 环境准备
- **Java**: 25 (推荐 Oracle GraalVM 25)
- **Node.js**: 20+ (使用 pnpm)
- **MySQL**: 8.0+
- **Redis**: 7.0+
- **Nacos**: 2.x

### 2. 后端启动
```bash
cd Nexo-Server
mvn clean install
# 分别启动 gateway, auth, admin, business 等服务
```

### 3. 管理端启动
```bash
cd Nexo-Admin
pnpm install
pnpm dev
```

### 4. 客户端启动
```bash
cd Nexo-Client
pnpm install
npx expo start
```

---

## 📄 开源协议
本项目采用 [MIT License](LICENSE) 协议开源。

---

**Nexo - 探索数字艺术的无限可能。** 🚀
