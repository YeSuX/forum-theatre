# 快速启动指南

## 5 分钟快速开始

### 步骤 1: 克隆项目（如果还没有）

```bash
git clone <your-repo-url>
cd forum-theatre
```

### 步骤 2: 安装依赖

```bash
npm install
```

### 步骤 3: 配置 API Key

```bash
# 复制环境变量模板
cp .env.local.example .env.local

# 编辑 .env.local，填入你的 Kimi API Key
# MOONSHOT_API_KEY=your_api_key_here
```

**获取 Kimi API Key**:
1. 访问 https://platform.moonshot.cn/
2. 注册并登录
3. 创建 API Key
4. 复制到 `.env.local`

### 步骤 4: 启动开发服务器

```bash
npm run dev
```

### 步骤 5: 打开浏览器

访问 http://localhost:3000

## 体验流程

1. **选择剧本**: 点击"城里的月光"卡片
2. **了解背景**: 查看剧本介绍和角色信息
3. **开始观演**: 点击"开始体验"，观看对话自动播放
4. **角色解构**: 深入了解每个角色的内心世界
5. **小丑提问**: 回答 3 个思辨问题（可跳过）
6. **选择介入点**: 选择一个关键时刻介入
7. **开始对话**: 与 AI 角色进行真实对话
8. **查看报告**: 获得你的沟通分析报告

## 常见问题

### Q: npm install 失败？

```bash
# 清除缓存重试
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Q: 启动失败？

检查端口 3000 是否被占用：

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Q: API 调用失败？

1. 检查 `.env.local` 文件是否存在
2. 检查 `MOONSHOT_API_KEY` 是否正确
3. 检查网络连接
4. 查看浏览器控制台错误信息

### Q: 页面显示异常？

```bash
# 清除 Next.js 缓存
rm -rf .next
npm run dev
```

## 生产构建

```bash
# 构建
npm run build

# 启动生产服务器
npm start
```

## 项目结构速览

```
forum-theatre/
├── app/                    # 页面和 API
│   ├── page.tsx           # 首页
│   ├── script/[id]/       # 剧本相关页面
│   └── api/               # API 路由
├── components/            # React 组件
├── lib/                   # 核心逻辑
│   ├── engines/          # 引擎（剧本、AI、分析、报告）
│   ├── stores/           # 状态管理
│   └── types/            # 类型定义
└── data/                  # 剧本数据
    └── scripts/
```

## 下一步

- 阅读 [USAGE.md](./USAGE.md) 了解详细使用方法
- 阅读 [docs/plan.md](./docs/plan.md) 了解技术实现
- 阅读 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) 了解项目总结

## 技术支持

如有问题，请查看：
1. 浏览器控制台错误信息
2. 终端错误日志
3. `.env.local` 配置

## 许可证

MIT
