# 项目架构

依据：2026-10-18 整理后的代码、配置与 Git 信息。线上版本以托管平台构建记录为准。

## 架构边界与入口

网站有两个首页实现，共用项目数据和案例来源；没有业务服务端、数据库、认证或模型调用层。

| 层次 | React 版本 | 静态版本 |
| --- | --- | --- |
| 入口 | 根 `index.html` → `src/main.jsx` | `docs/index.html` → `docs/script.js` |
| 布局样式 | `src/styles.css`、SpotlightCard | `docs/styles.css` |
| 项目数据 | 导入 `src/data/projects.js` | 导入生成的 `docs/project-data.js` |
| 案例/资源 | `public/` | 从 `public/` 复制的对应文件 |
| 发布文件 | Vite 生成 `dist/` | `docs/`；GitHub Pages 使用 `master/docs` |

`scripts/sync-static-site.mjs` 读取共享数据，复制 3 个案例目录及选定公共资源到 `docs/`；不生成两套首页，也不清除所有历史副本文件。整站 Markdown 不属于同步覆盖范围。

## React 模块

`createRoot` 挂载 App，组合 Header、Hero、Projects、About、Strengths 与 ContactEnd。

| 模块 | 数据/协作 |
| --- | --- |
| Header、Hero | 锚点导航、简历、邮件入口；静态 `heroBackground` |
| Projects | 共享 `categories` / `projectGroups` / `allProjects` → 分类状态 → 卡片 |
| About、Strengths、ContactEnd | `main.jsx` 的经历、能力、联系方式；About 复用 SpotlightCard |
| GSAP、SpotlightCard | 开场时间线；鼠标位置更新卡片 CSS 变量 |

未接入的 Galaxy/OGL、旧项目数组、无处理逻辑的动效属性及隐藏统计已移除。

## 主要流程

### 访问与锚点

1. 读取 `prefers-reduced-motion`、`sessionStorage.parthPortfolioOpeningPlayed` 和当前 hash。
2. 无 hash、没有减少动画偏好、当前会话未播放时执行 GSAP 开场，期间锁定滚动；结束后恢复。
3. 其余情况跳过开场。挂载时保留 hash，在下一帧定位对应元素；无 hash 时回顶。
4. 会话存储失败和无效编码 hash 有兜底；卸载执行 `ctx.revert()`。CSS 还限制减少动画模式下的过渡与悬停位移。

静态首页使用原生锚点与浏览器定位，不使用 React 开场。

### 分类与案例

1. 共享数据包含 5 个实际分类、7 张项目卡；React 默认「全部」，静态首页默认 `Harness`。
2. 筛选按钮更新列表和 `aria-pressed`；两站「全部」均展示完整 7 卡。
3. 3 个 `href` 打开静态案例；其余 4 张显示「联系了解」并定位 `#contact`。
4. 案例通过共享 `case-theme.css/js` 展示主题和 `../#projects` 返回入口。

| 案例路径 | 内容 |
| --- | --- |
| `she-ji-qian-zhi/portfolio-case-study.html` | 设计前置工作流说明及外部仓库入口 |
| `pm-harness/index.html` | PM Harness 案例、阶段说明与 Markdown 文件 |
| `article-pipeline/index.html` | 内嵌打包代码及阶段样例；不执行真实文章生成 |

### 开发、构建与预览

1. `npm run dev`：`predev` 同步静态站，再启动 Vite；`public/` 按原路径访问。
2. `npm run build`：`prebuild` 同步静态站，再生成 `dist/index.html`、`dist/assets/` 并复制 `public/`。
3. `npm run preview`：只服务已有 `dist/`；静态首页另用 Vite 的 `docs` 根目录预览。
4. 自定义预览默认从脚本位置解析 `dist/`，监听 `127.0.0.1:5175`，支持 GET/HEAD、目录索引、MIME 和 400/403/404/405/500；文件流异常不会作为未处理错误终止服务。
5. `npm test` 使用 Node 内置测试，验证预览的正常页面、编码、越界、链接目录和中断下载等边界。

## 仍需注意

- **首页仍有两份：** 个人经历、首页布局、背景和动效仍需分别维护；共享项目与案例不再手工重复更新。
- **部署子路径：** 静态站以相对路径为主；React CSS 仍有根资源路径，Vite 未设置 `base`。改变发布位置需复核。
- **源工程缺口：** 文章演示为打包 HTML，独立源工程位置「待确认」。
- **发布没有统一配置：** Pages 来源已核实；Vercel/Cloudflare 的发布源与完整步骤仍「待确认」，未发现已跟踪 CI 工作流。
