export type SkillRecord = {
  id: string;
  name: string;
  description: string;
  authorName: string;
  authorAvatar: string;
  downloads: number;
  createdAt: string;
  status: "approved" | "pending";
};

export const mockSkills: SkillRecord[] = [
  {
    id: "browser-research",
    name: "Browser Research Assistant",
    description: "自动抓取页面内容并整理为结构化调研摘要。",
    authorName: "Castor",
    authorAvatar: "/images/show-result.png",
    downloads: 1482,
    createdAt: "2026-01-08",
    status: "approved",
  },
  {
    id: "mcp-notion-sync",
    name: "MCP Notion Sync",
    description: "通过 HTTP MCP 工具把网页信息同步到 Notion 数据库。",
    authorName: "Tactus Team",
    authorAvatar: "/images/trust-skill.png",
    downloads: 920,
    createdAt: "2025-12-20",
    status: "approved",
  },
  {
    id: "vision-qa",
    name: "Vision QA Helper",
    description: "读取截图并生成带上下文的视觉问答提示词。",
    authorName: "Lan",
    authorAvatar: "/images/identify-image.png",
    downloads: 672,
    createdAt: "2025-11-29",
    status: "pending",
  },
];
