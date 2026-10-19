# Parth 个人作品集

面向 AI 产品实习方向的个人展示网站，呈现项目案例、个人经历、能力介绍、联系方式与 Word 简历下载。包名 `renpeng-ai-portfolio`，版本 `0.1.0`。

本文描述 **2026-10-18 整理后的项目**；线上版本需以托管平台的构建记录核验。

## 功能与边界

- 首页包含项目、经历、优势、联系区，支持锚点导航与分类筛选。
- 5 个实际项目分类、7 张卡片；3 个独立案例页，其他 4 张卡显示「联系了解」并跳到联系区。
- React 首页有 GSAP 会话开场和卡片鼠标高光；带 hash 访问及减少动画偏好会跳过开场。
- 首屏使用静态图片；两套首页已补充手机断点与减少动画样式。
- 未发现业务后端、数据库、登录、在线联系表单或模型调用；案例介绍和内置演示不等于本站提供 AI 服务。

## 两套网站入口

| 入口 | 实现 | 维护方式 |
| --- | --- | --- |
| 根 `index.html` → `src/main.jsx` | React + Vite，构建到 `dist/` | 维护 `src/`、`public/` |
| `docs/index.html` | 独立 HTML/CSS/JavaScript 首页，GitHub Pages 发布目录 | 维护首页；项目数据和案例由同步脚本生成/复制 |

项目内容统一维护在 `src/data/projects.js`；React 默认「全部」，静态首页默认 `Harness`，两者的「全部」均为 7 张卡。`public/` 是案例与公共资源的维护来源。

`npm run sync:static` 生成 `docs/project-data.js`，并复制 3 个案例目录、共享主题、简历、头像、海报与项目 SVG。**不要直接修改生成的数据或案例副本。** 两套首页仍分别实现，背景、文案、布局和动效没有自动统一；正式保留关系「待确认」。

## 安装与启动

需要 Node.js **22.12.0+** 和 npm。在仓库根目录执行：

```sh
npm ci
npm run dev
```

默认开发地址 `http://127.0.0.1:5173/`，端口占用时以终端输出为准。`predev` 自动同步静态站资源。

```sh
npm test
npm run build
npm run preview
```

`prebuild` 自动同步 `docs/`，随后 Vite 生成 `dist/`。Vite 预览默认地址 `http://127.0.0.1:4173/`；预览不会自动重新构建。

单独预览静态站：

```sh
npm run sync:static
npm exec -- vite docs --host 127.0.0.1 --port 5174
```

也可先构建，再运行 `node scripts/preview-server.mjs` 或 Windows 的 `start-preview.cmd`，在 `http://127.0.0.1:5175/` 访问 `dist/`。自定义预览支持目录索引、GET/HEAD、常用资源 MIME 与准确错误状态；Windows 启动依赖 PATH 中的 `node`。

## 目录导航

```text
src/main.jsx、styles.css          React 首页、个人经历、联系方式与样式
src/data/projects.js              两站共享项目数据
src/SpotlightCard.*               卡片高光组件
public/                          案例、简历与运行所需资源
docs/                            静态首页、同步副本与整站文档
scripts/sync-static-site.mjs       静态站同步工具
scripts/preview-server*.mjs       本地预览服务与回归测试
package*.json、vite.config.js     依赖与构建配置
```

音频、转写、课程纪要、原始素材、安装包与空日志共 30 个辅助文件已移到项目外的同级 `part3-资料归档`，迁移时逐文件校验 SHA-256；网站使用的图片仍在 `public/`。归档是本机资料，不是网站资源。

## 验证与发布

- 本次 `npm run build` 和 9 项预览服务测试通过。两站 6 个筛选按钮、3 个案例往返、文章 5 个阶段切换、简历下载、直接 hash 定位和键盘筛选已通过浏览器检查；React 首次/重复开场、错误编码 hash 检查通过，无页面脚本错误或本地 HTTP 错误。
- 两站在 320/375/768/1024/1440px 下无横向溢出，已检查手机与桌面截图。未做全新依赖安装、读屏和线上新版验收；尚未配置 lint、类型检查或已跟踪的 CI 工作流。
- 源码仓库：[part33/parth-](https://github.com/part33/parth-)，维护分支为 `master`；GitHub Pages 来源为 `master` 的 `/docs`。
- 2026-10-18 已核实 [Vercel](https://parth-five.vercel.app/)、[Cloudflare Pages](https://parth-portfolio-7vc.pages.dev/) 和 [GitHub Pages](https://part33.github.io/parth-/) 首页均返回 HTTP 200；是否包含最新提交需另查构建记录。Vercel/Cloudflare 的正式发布源与复现步骤「待确认」。

开发上下文见 [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)，架构见 [ARCHITECTURE.md](ARCHITECTURE.md)，后续工作见 [ROADMAP.md](ROADMAP.md) 和 [TODO.md](TODO.md)，历史见 [CHANGELOG.md](CHANGELOG.md)。`pm-harness/README.md` 只说明子案例。
