# Floatem Website

独立的 Floatem 宣发与技术支持网站，可单独公开到 GitHub，不会泄露主应用仓库。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：`npm run build`。构建产物在 `dist/`，可直接托管到 GitHub Pages。

## 日常更新

- 发布新版本：编辑 `src/content/site.ts` 中的 `release`。这里集中维护版本号、发布日期、下载链接、系统要求和本次更新。
- 修改首页主题或替换主题截图：编辑同文件的 `themes`，并将图片放到 `public/images/`。
- 修改中文、英文文案：分别编辑 `src/locales/zh.ts` 与 `src/locales/en.ts`。两份文件保持相同结构。
- 更新支持邮箱：编辑 `src/content/site.ts` 中的 `support.email`。

## GitHub Pages

将 `website` 文件夹中的内容作为一个单独的 GitHub 仓库根目录。推送到 `main` 后，`.github/workflows/deploy.yml` 会构建并部署网站。

在仓库 **Settings → Pages → Build and deployment** 中选择 **GitHub Actions**。如使用自定义域名，在该页面配置域名即可。Vite 已使用相对资源路径，因此同时兼容 `username.github.io/repository/` 和自定义域名。

> 此工作流面向独立网站仓库；这正好保证公开部署时不会包含 Floatem 的私有主代码。
