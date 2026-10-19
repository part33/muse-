// Shared project content for the React site and the generated static site data.
export const categories = ['全部', 'skill', 'rag', 'AIGC', 'Harness', '产品原型'];

export const projectGroups = {
  skill: [
    {
      tag: 'Design Preflight / Skill',
      title: '设计前置工作流',
      desc: '为 Codex 设计中文工作流 skill，在编码前完成需求澄清、方案比较、范围拆分与设计输出。',
      image: 'project-design-preflight.svg',
      href: 'she-ji-qian-zhi/portfolio-case-study.html',
    },
  ],
  rag: [
    {
      tag: 'RAG / Knowledge Base',
      title: 'RAG 知识库问答',
      desc: '围绕文档切分、向量检索和回答生成，梳理可用于业务问答的基础流程。',
      image: 'project-portfolio.svg',
    },
  ],
  AIGC: [
    {
      tag: 'AIGC / Content',
      title: 'AIGC 内容工作流',
      desc: '用模型辅助资料整理、内容生成和版本迭代，提高从想法到成稿的推进效率。',
      image: 'project-agent.svg',
    },
  ],
  Harness: [
    {
      tag: 'AI Product Manager Workflow',
      title: 'PM Harness 案例研究',
      desc: '把模糊想法转成可交接产品文档，包含阶段路由、范围控制、独立评审和决策留痕。',
      image: 'project-harness.svg',
      href: 'pm-harness/index.html',
    },
    {
      tag: 'Article Harness / Workflow',
      title: '文章生成Harness',
      desc: '把零散素材整理成 Markdown 主稿，再渲染为可分享 HTML，并通过规划、审查和修补控制内容质量。',
      image: 'project-article-pipeline.svg',
      href: 'article-pipeline/index.html',
    },
  ],
  产品原型: [
    {
      tag: 'Prototype / React',
      title: '个人作品集网站',
      desc: '用 React + Vite 搭建可持续迭代的作品集，把经历、项目和能力组织成展示界面。',
      image: 'project-portfolio.svg',
    },
    {
      tag: 'Prototype / AI',
      title: 'AI 功能原型',
      desc: '快速搭建交互样稿，用低成本方式验证需求表达、页面结构和关键流程。',
      image: 'project-agent.svg',
    },
  ],
};

export const allProjects = categories
  .filter((category) => category !== '全部')
  .flatMap((category) => projectGroups[category]);
