# 项目开发上下文

基准：2026-10-18 整理后的项目；维护分支为 `master`，清理基线为 `d0038c4`。本批次整合此前页面修改、项目文档和遗留清理，线上版本以托管构建记录为准。

## 背景与边界

- 页面自述为 Parth 的 AI 产品经理个人作品集，关注 Agent、AIGC、Coding Harness 与产品原型，展示实习求职方向。
- 可确认的用途是浏览经历/案例、下载简历和联系本人；招聘方、面试官或合作方是根据文案推测的读者，正式受众「待确认」。
- 网站是静态展示。PM Harness 文档描述子案例，文章工作流页面展示内置样例，均不能当作本站后台或实际模型服务。

## 技术栈

以下为当前 `package.json` 与锁文件中的精确版本，不表示最新版本。

| 技术 | 版本 | 职责 |
| --- | --- | --- |
| React / React DOM | 19.2.7 | 首页渲染、分类状态 |
| GSAP | 3.15.0 | 会话开场动画 |
| lucide-react | 1.20.0 | 首页图标 |
| Vite / React 插件 | 8.0.16 / 6.0.2 | 开发、JSX 转换、构建；开发依赖 |
| Wrangler | 4.103.0 | Cloudflare 部署工具；开发依赖 |
| Node.js | >=22.12.0 | `engines` 要求；脚本和内置测试运行环境 |

JavaScript/JSX、ES Modules、原生 CSS；未发现 TypeScript、业务 API、路由库或全局状态库。闲置的 Galaxy 组件和 OGL 依赖已移除。

## 核心维护位置

| 位置 | 责任 |
| --- | --- |
| `src/main.jsx` | App、导航、首屏、经历、优势、联系区及开场；项目组件读取共享数据 |
| `src/data/projects.js` | 唯一项目数据源：5 类、7 卡、3 个案例入口 |
| `src/styles.css`、`src/SpotlightCard.*` | React 布局、手机断点、开场、高光和减少动画样式 |
| `public/` | 资源与 3 个案例的维护来源；Vite 构建原样复制到 `dist/` |
| `docs/index.html`、`script.js`、`styles.css` | 另一套独立首页；数据从生成的 `project-data.js` 读取 |
| `scripts/sync-static-site.mjs` | 将项目数据、案例目录和选定公共资源同步到 `docs/` |
| `public/case-theme.*` | 案例共用主题与 `../#projects` 返回导航；同步至静态站 |
| `scripts/preview-server.mjs`、`.test.mjs` | 本地文件预览与 9 项边界回归；不是业务后端 |

## 后续 AI 维护约定

未发现根级 `AGENTS.md` 或正式团队规范；以下根据实现与本次整理给出维护建议。

1. 先检查 `git status` 和差异，保留用户未提交工作。不要将本地状态写成已发布版本。
2. 项目卡只改 `src/data/projects.js`；案例与公共资源只改 `public/`。运行 `npm run sync:static` 更新副本；`dev`、`build` 已自动执行同步。
3. 不直接编辑 `docs/project-data.js` 或复制的案例文件。静态首页本身仍单独维护；同步不会生成首页、样式或个人经历。
4. 共享数据变动后确认两站分类和总览一致；没有 `href` 的项目使用「联系了解」，不要虚构详情页、成果或服务能力。
5. React 资源链接使用 `import.meta.env.BASE_URL`；CSS 仍有根路径资源且 Vite 未配置 `base`。更换部署子路径时需统一验证，不能假定任意子路径已适配。
6. 保留 hash 返回定位、首访/重复访问与减少动画行为。视觉变动检查手机布局、键盘操作、分类状态及案例往返。
7. 修改预览脚本后运行 `npm test`；一般改动运行 `npm run build`，并分别检查 React 与静态站。构建通过不能替代浏览器验收。
8. 依赖固定精确版本，修改时同步锁文件；安装用 `npm ci`。不要重新加入未使用组件、资源或本机辅助资料。

主源码使用函数组件、Hooks、PascalCase 组件名、单引号和分号。两个首页仍存在独立文案与布局；是否整合「待确认」。

## 发布与人工补充

- GitHub 仓库为 `part33/parth-`，已核实 Pages 来源 `master/docs`；Vercel、Cloudflare Pages 和 GitHub Pages 均有可访问站点。新提交是否上线需按各平台构建记录核验。
- 正式域名、保留哪些托管平台、Vercel/Cloudflare 发布源及操作步骤「待确认」。
- 本人需核实履历、年龄、年级、求职状态、简历、联系方式和案例成果；为 4 个无详情项目补充真实展示材料。
- 文章演示的独立源工程、图片来源/公开许可、目标浏览器及发布优先级「待确认」。
- 辅助资料已移至项目外同级 `part3-资料归档`；不要把本机路径作为网站可访问链接。
