# Tactus Website - 需求文档

## 项目概述

为 Tactus（首个支持 Agent Skills 的浏览器 AI Agent 扩展）建设官方网站，包含产品落地页和 Skills 分享市场。

**域名：** tactus.cc.cd（已托管在 Cloudflare）

## 技术栈

| 层 | 方案 |
|---|---|
| 框架 | Next.js 16 (App Router) |
| 样式 | Tailwind CSS |
| UI 风格 | 使用 `.agents/skills/design-style/prompts/Professional.md` 中定义的 Professional 设计风格 |
| 认证 | NextAuth.js + GitHub OAuth Provider |
| 数据库 | Cloudflare D1 (SQLite) |
| 文件存储 | Cloudflare R2（存 skill 压缩包） |
| 部署 | Cloudflare Pages（`@cloudflare/next-on-pages`） |

## 页面结构

### 1. 落地页 `/`

基于 Tactus 项目 README（位于 `~/Code/tactus/README_ch.md`）抽取核心功能进行展示：

- **Hero 区**：标语「首个支持 Agent Skills 的浏览器 AI Agent 扩展」+ 产品截图 + CTA 按钮（下载扩展、浏览 Skills）
- **核心特性展示**（从 README 抽取）：
  - 🧩 Agent Skills 系统 — 技能导入、脚本执行、信任机制
  - 🤖 智能对话 — OpenAI 兼容、多模型切换、ReAct 范式、流式响应
  - 🖼️ 图像视觉支持 — 视觉模型、粘贴图片、多模态对话
  - 📄 页面理解 — 智能提取、选中引用、上下文感知
  - 🔌 HTTP MCP 支持 — MCP Server 连接、动态工具发现、多种认证
  - 🎨 主题与个性化 — 主题切换、悬浮球、国际化
- **Skill 文件夹结构说明**（引导开发者制作 skill）
- **快速开始 / 安装步骤**
- **Footer**：GitHub 链接（https://github.com/Castor6/tactus）、License

**产品截图资源位于：** `~/Code/tactus/resources/` 目录下的 png 文件

### 2. Skills 市场 `/skills`

- 列表展示所有已审核通过的 skills
- 每个 skill 卡片：名称、描述、作者头像和名称、下载量、上传时间
- 支持搜索（名称、描述模糊匹配）
- **无需登录即可浏览**

### 3. Skill 详情页 `/skills/[id]`

- Skill 详细信息
- 下载按钮（**无需登录**）
- 下载计数

### 4. 上传页 `/skills/submit`

- **需 GitHub OAuth 登录**
- 表单：名称、描述、上传 zip 压缩包
- 提交后状态为 pending，提示等待审核

### 5. 管理员审核后台 `/admin`

- **需 GitHub 登录 + 管理员权限**
- 管理员判断：GitHub user ID 白名单（管理员 GitHub ID 通过环境变量配置）
- 查看待审核 skill 列表
- 通过 / 拒绝操作

## 认证方案

- NextAuth.js + GitHub OAuth Provider
- 下载、浏览：不需要登录
- 上传：需要 GitHub 登录
- 审核：需要 GitHub 登录 + 管理员权限

## 数据模型（Cloudflare D1）

```sql
CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  file_key TEXT NOT NULL,
  file_size INTEGER,
  status TEXT DEFAULT 'pending',  -- pending / approved / rejected
  downloads INTEGER DEFAULT 0,
  created_at TEXT,
  reviewed_at TEXT
);
```

## API 路由

```
/api/auth/[...nextauth]  → GitHub OAuth
/api/skills              → GET 列表（已审核）/ POST 创建
/api/skills/[id]         → GET 详情
/api/skills/[id]/download → GET 下载（生成 R2 签名 URL，downloads+1）
/api/upload              → POST 上传 zip 到 R2
/api/admin/skills        → GET 待审核列表 / PATCH 审核操作
```

## 核心流程

**上传：** 用户 GitHub 登录 → 填写信息 + 选择 zip → 上传到 R2 + 写入 D1（status=pending）→ 提示等待审核

**审核：** 管理员登录 → 查看待审核列表 → 通过/拒绝 → 更新 D1 status

**下载：** 访客浏览 → 点击下载 → downloads+1 + 返回 R2 签名 URL

## 部署

- Cloudflare Pages + `@cloudflare/next-on-pages`
- 自定义域名：tactus.cc.cd
- 环境变量：GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, NEXTAUTH_SECRET, ADMIN_GITHUB_IDS, R2 绑定, D1 绑定
