import Link from "next/link";
import UserMenu from "./user-menu";

const features = [
  {
    icon: "🧩",
    title: "Agent Skills 系统",
    description:
      "导入符合规范的 Skill 文件夹，在页面中安全执行脚本，首次运行需用户确认并可永久信任。",
  },
  {
    icon: "🤖",
    title: "多供应商对话引擎",
    description:
      "原生支持 Anthropic、Gemini 及 OpenAI 兼容接口，多模型随时切换，内置 ReAct 工具调用与流式响应。",
  },
  {
    icon: "🖼️",
    title: "图像视觉支持",
    description:
      "逐模型配置视觉能力，聊天中直接粘贴图片发送，支持图文混合的多模态问答。",
  },
  {
    icon: "📄",
    title: "页面理解能力",
    description:
      "Readability + Turndown 智能提取并转为 Markdown，划词引用、上下文感知，支持原始内容提取模式。",
  },
  {
    icon: "🔌",
    title: "HTTP MCP 支持",
    description:
      "连接 MCP Server 自动发现工具，支持无认证、Bearer Token 与 OAuth 2.1 多种鉴权方式。",
  },
  {
    icon: "💾",
    title: "隐私与本地存储",
    description:
      "会话历史与技能文件全部存储在本地 IndexedDB，支持消息编辑与一键复制，数据绝不上传。",
  },
];

const installSteps = [
  "从 GitHub Releases 下载最新版 tactus.zip。",
  "将压缩包解压到固定目录。",
  "打开 Chrome 扩展管理页并启用开发者模式。",
  "点击「加载未打包的扩展程序」，选择解压目录完成安装。",
];

const skillTree = `my-skill/
├── SKILL.md          # 必需：技能定义和指令
├── scripts/          # 可选：可执行脚本
│   └── fetch-data.js
├── references/       # 可选：参考文档
│   └── api-docs.md
└── assets/           # 可选：资源文件
    └── template.json`;

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-[var(--background)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(rgba(184, 134, 11, 0.08) 0.8px, transparent 0.8px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-20 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.02] blur-3xl" />

      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 sm:px-10">
        <p className="headline-serif text-2xl text-[var(--foreground)]">Tactus</p>
        <nav className="flex items-center gap-6 text-sm text-[var(--muted-foreground)]">
          <Link className="transition-colors hover:text-[var(--accent)]" href="#features">
            核心特性
          </Link>
          <Link className="transition-colors hover:text-[var(--accent)]" href="#quickstart">
            快速开始
          </Link>
          <Link
            className="rounded-md border border-[var(--foreground)] px-4 py-2 text-[var(--foreground)] transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            href="/skills"
          >
            浏览 Skills
          </Link>
          <UserMenu />
        </nav>
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-col gap-32 px-6 pb-32 pt-10 sm:px-10 sm:pt-20">
        {/* ── Hero ────────────────────────────────────────── */}
        <section className="flex flex-col gap-10">
          <div className="flex flex-col items-center text-center">
            <h1 className="headline-serif max-w-3xl text-[2.5rem] leading-[1.1] text-[var(--foreground)] sm:text-7xl">
              首个支持 Agent Skills 的浏览器 AI 扩展
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
              Tactus 将 Agent Skills 规范引入浏览器，通过可扩展的技能系统让 AI Agent 完成复杂任务。常用工作流封装为脚本执行，替代重复自动化操作，更快更省 Token。
            </p>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <a
                className="min-h-[44px] rounded-md bg-[var(--accent)] px-8 py-3 text-center text-sm font-medium tracking-[0.05em] text-white shadow-[0_1px_2px_rgba(184,134,11,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-secondary)] hover:shadow-[0_4px_12px_rgba(184,134,11,0.15)]"
                href="https://github.com/Castor6/tactus/releases"
                rel="noopener noreferrer"
                target="_blank"
              >
                下载扩展
              </a>
              <Link
                className="min-h-[44px] rounded-md border border-[var(--foreground)] px-8 py-3 text-center text-sm font-medium tracking-[0.05em] text-[var(--foreground)] transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href="/skills"
              >
                浏览 Skills
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-6 w-full max-w-4xl overflow-hidden rounded-lg border border-[var(--border)] bg-white p-3 shadow-[0_8px_24px_rgba(26,26,26,0.08)]">
            <video
              autoPlay
              controls
              className="h-auto w-full rounded-md border border-[var(--border)] object-cover"
              loop
              muted
              playsInline
              poster="/images/video-poster.jpg"
              src="/api/video/demo-video.mp4"
            />
          </div>

          <div className="grid gap-6 border-y border-[var(--border)] py-10 sm:grid-cols-3">
            <div className="text-center">
              <p className="small-caps text-[var(--muted-foreground)]">Skills Ready</p>
              <p className="headline-serif mt-1 text-4xl text-[var(--foreground)]">Agent Skills</p>
            </div>
            <div className="text-center">
              <p className="small-caps text-[var(--muted-foreground)]">Multi-Provider</p>
              <p className="headline-serif mt-1 text-4xl text-[var(--foreground)]">Claude · Gemini · OpenAI</p>
            </div>
            <div className="text-center">
              <p className="small-caps text-[var(--muted-foreground)]">Browser Native</p>
              <p className="headline-serif mt-1 text-4xl text-[var(--foreground)]">Context Aware</p>
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────── */}
        <section className="space-y-12" id="features">
          <div className="mb-2 flex items-center gap-4">
            <span className="section-rule" />
            <span className="small-caps whitespace-nowrap text-[var(--accent)]">Core Features</span>
            <span className="section-rule" />
          </div>
          <h2 className="headline-serif max-w-3xl text-4xl leading-tight text-[var(--foreground)] sm:text-5xl">
            核心能力覆盖多模型对话、视觉、页面理解与技能扩展
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                className="group rounded-lg border border-[var(--border)] border-t-2 border-t-[var(--accent)] bg-white p-8 shadow-[0_1px_2px_rgba(26,26,26,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(26,26,26,0.06)]"
                key={feature.title}
              >
                <p className="mb-4 text-2xl">{feature.icon}</p>
                <h3 className="headline-serif text-xl font-semibold leading-snug text-[var(--foreground)]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[var(--muted-foreground)]">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Skill Structure + Quick Start ───────────────── */}
        <section className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="mb-6 flex items-center gap-4">
              <span className="section-rule" />
              <span className="small-caps whitespace-nowrap text-[var(--accent)]">Skill Structure</span>
              <span className="section-rule" />
            </div>
            <h2 className="headline-serif text-4xl leading-tight text-[var(--foreground)]">
              开发者可按规范组织 Skill 文件夹
            </h2>
            <p className="mt-4 max-w-2xl text-[var(--muted-foreground)]">
              Tactus 直接兼容 Agent Skills 规范，你可以把提示词、脚本、参考文档和资源文件封装为可复用技能。
            </p>
            <pre className="mt-6 overflow-x-auto rounded-lg border border-[var(--border)] bg-white p-6 font-mono text-sm leading-7 text-[var(--foreground)] shadow-[0_1px_2px_rgba(26,26,26,0.04)]">
              <code>{skillTree}</code>
            </pre>
          </div>

          <aside
            className="rounded-lg border border-[var(--border)] border-t-2 border-t-[var(--accent)] p-8"
            id="quickstart"
            style={{ backgroundColor: "rgb(184 134 11 / 0.06)" }}
          >
            <p className="small-caps mb-2 text-[var(--accent)]">Quick Start</p>
            <h3 className="headline-serif text-3xl text-[var(--foreground)]">安装只需 4 步</h3>
            <ol className="mt-6 space-y-5 text-[var(--foreground)]">
              {installSteps.map((step, index) => (
                <li className="flex gap-3" key={step}>
                  <span className="small-caps mt-1 text-[var(--accent)]">{String(index + 1).padStart(2, "0")}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </aside>
        </section>
      </main>

      <footer className="relative border-t border-[var(--border)] bg-white/80">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-8 text-sm text-[var(--muted-foreground)] sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>© {new Date().getFullYear()} Tactus. Apache-2.0 License.</p>
          <a
            className="small-caps transition-colors hover:text-[var(--accent)]"
            href="https://github.com/Castor6/tactus"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub Repository
          </a>
        </div>
      </footer>
    </div>
  );
}
