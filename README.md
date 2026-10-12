# CanDo · 我的厨房

一款个人菜谱管理微信小程序，帮你把「会做的菜」记录下来：菜品图片、食材清单、制作步骤一站式管理，支持分类、搜索、收藏与置顶。基于 **Taro 4 + React 18** 开发，数据存储使用**微信云开发**（云函数 + 云数据库），无需自建服务器。

## 功能特性

### 🍳 菜谱管理（MVP）
- **菜品列表**：卡片式展示封面、菜名、简介，支持分类筛选
- **添加/编辑菜品**：菜名、封面图（上传至云存储）、分类、简介、食材清单、纯文字制作步骤（步骤可增删排序）
- **菜品详情**：封面大图、食材清单、分步骤展示
- **删除菜品**：二次确认，同步清理云存储中的封面图文件

### ⭐ 扩展功能
- **模糊搜索**：按菜名、简介、食材实时模糊匹配，300ms 防抖
- **自定义分类**：新增 / 重命名 / 删除分类（内置系统分类不可删；重命名时自动迁移该分类下的菜品）
- **收藏 / 置顶 / 标签**：详情页一键收藏、置顶，列表页置顶优先展示；标签支持编辑与筛选

### 🚀 性能与体验
- 分类级内存缓存 + 静默刷新（SWR）：切换分类、返回首页瞬间展示，30s TTL 内不发重复请求，并发请求自动去重
- 组件按需注入（`lazyCodeLoading: 'requiredComponents'`），优化启动耗时
- 完善的错误态：加载失败区分「空数据」与「网络异常」，支持一键重试；关键写操作均有防重复提交保护

## 项目截图

| 菜谱首页 | 新增菜品 | 我的 |
| --- | --- | --- |
| ![菜谱首页](docs/index.jpg) | ![新增菜品](docs/increase.jpg) | ![我的](docs/personal.jpg) |

## 技术栈

| 层次 | 技术 |
| --- | --- |
| 前端框架 | Taro 4（微信小程序端）+ React 18 + TypeScript |
| 状态管理 | Zustand |
| 样式 | SCSS Modules |
| 后端 | 微信云开发（云函数 11 个 + 云数据库 + 云存储） |
| 工程化 | miniprogram-ci 自动化上传脚本、云函数一键部署脚本 |

## 快速开始

### 1. 环境准备
- Node.js 18+
- 微信开发者工具（开启服务端口）
- 已开通微信云开发的小程序 AppID

### 2. 安装依赖并构建
```bash
npm install
npm run dev:weapp   # 开发模式（watch）
npm run build:weapp # 生产构建
```

### 3. 云开发环境配置
1. 在 `src/app.tsx` 中将云环境 ID 替换为你自己的
2. 部署云函数（11 个）：
   ```bash
   node scripts/deploy-functions.js
   ```
3. 在云开发控制台创建 `dishes`、`categories` 两个数据库集合，权限设为「仅创建者可读写」

### 4. 发布
```bash
node scripts/upload.js              # 自动递增版本号并上传体验版
node scripts/upload.js 1.1.0 "描述" # 指定版本号上传
```

## 项目结构

```
├── src/
│   ├── app.config.ts          # 全局配置（页面路由、TabBar）
│   ├── store/useDishStore.ts  # Zustand 全局状态（数据缓存、静默刷新）
│   ├── services/cloud.ts      # 云函数调用封装
│   ├── utils/                 # 搜索匹配等纯函数
│   ├── components/            # DishForm、InputModal 等通用组件
│   └── pages/
│       ├── home/              # 菜谱首页（列表、分类筛选）
│       ├── create/            # 新增菜品
│       ├── edit/              # 编辑菜品
│       ├── detail/            # 菜品详情
│       ├── search/            # 搜索
│       ├── category-manage/   # 分类管理
│       └── mine/              # 我的
├── cloudfunctions/            # 云函数（增删改查、搜索、分类管理）
├── scripts/
│   ├── deploy-functions.js    # 云函数一键部署
│   └── upload.js              # miniprogram-ci 版本上传
└── docs/                      # 项目文档与截图
```

## License

MIT
