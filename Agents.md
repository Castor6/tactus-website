- When writing code for website development, use the Context7 MCP service whenever you are uncertain about implementation details or need up-to-date documentation.
- When making changes to the website's interface, layout, or any display-related aspects, always follow the Professional style guidelines.
- When tasks involve Cloudflare services (including Workers, Pages, KV, R2, D1, or related configurations), use the corresponding Cloudflare MCP service. Do not rely on assumptions about Cloudflare APIs or platform behavior.

## 开发工作流程

1. **开发分支**: 使用 `openclaw` 分支进行开发
2. **提交规范**: 每完成一个需求就 `git commit`（写有意义的 commit message）
3. **推送**: 所有需求完成后 `git push origin openclaw`
4. **部署预览**: 推送后必须执行以下步骤部署到预览环境：
   ```bash
   npm run cf:build
   npm run cf:pages:prepare
   npx wrangler pages deploy --project-name tactus-website --branch openclaw --commit-dirty=true
   ```
   预览地址：https://openclaw.tactus-website.pages.dev/ （**唯一的预览地址，不要创建其他 alias**）

## 部署上线

当要求部署上线时：
1. 将 `openclaw` 分支合并到 `main` 分支
2. 推送 `main` 分支
3. 用 wrangler CLI 部署到生产环境 https://tactus.cc.cd/