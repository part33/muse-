import React from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { ArrowLeft, ArrowUpRight, ExternalLink, FolderGit2, Mail } from 'lucide-react';
import SpotlightCard from './SpotlightCard';
import { articles } from './data/articles';
import './styles.css';

const baseUrl = import.meta.env.BASE_URL;
const openingStorageKey = 'parthPortfolioOpeningPlayed';

function hasPlayedOpening() {
  try {
    return window.sessionStorage.getItem(openingStorageKey) === 'true';
  } catch {
    return false;
  }
}

function markOpeningPlayed() {
  try {
    window.sessionStorage.setItem(openingStorageKey, 'true');
  } catch {
    // Storage can be unavailable in strict browser modes; the animation can still run normally.
  }
}

/* ---------------- data ---------------- */

const viewpoints = [
  { no: '01', text: '直觉做假设，数据做裁判' },
  { no: '02', text: '用确定性，收敛不确定性' },
  { no: '03', text: '为 AI 找场景，不如为场景找 AI' },
  { no: '04', text: 'AI 干活，人拍板' },
];

const projects = [
  {
    tag: 'Harness / AI PM',
    title: 'PM Harness',
    repo: 'part33/-skill',
    url: 'https://github.com/part33/-skill',
    desc: 'AI 产品经理的自我 harness：用阶段化澄清、范围控制、独立评审和决策留痕，把模糊的产品想法变成可评审、可交接的产品文档。',
    lang: 'HTML',
    updated: '2026-06',
    caseUrl: 'pm-harness/index.html',
  },
  {
    tag: 'Agent / Platform',
    title: 'AgentForge',
    repo: 'part33/agentforge',
    url: 'https://github.com/part33/agentforge',
    desc: '基于 Pi 扩展的软件工程 Agent 工作流平台：探索→规划→审批→执行→验证→评估，让 Agent 的每一次执行可追踪、可复盘、可评分。',
    lang: 'JavaScript',
    updated: '2026-07',
  },
  {
    tag: 'AIGC / 创作工具',
    title: 'Video Mind AI',
    repo: 'part33/video-mind',
    url: 'https://github.com/part33/video-mind',
    desc: '面向短视频创作者的 AI 视频解析与创作工作台：视频导入→内容摘要→场景拆解→脚本改写→分镜与提示词输出。',
    lang: 'Vue',
    updated: '2026-07',
  },
  {
    tag: 'Harness / 内容',
    title: 'Article Harness',
    repo: 'part33/-skills',
    url: 'https://github.com/part33/-skills',
    desc: '文章生成 Harness：把零散素材整理成 Markdown 主稿，再渲染为可分享页面，用规划、审查和修补控制内容质量。',
    lang: 'TypeScript',
    updated: '2026-06',
    caseUrl: 'article-pipeline/index.html',
  },
  {
    tag: 'Skill / 工作流',
    title: '设计前置 Skill',
    repo: 'part33/skillskills',
    url: 'https://github.com/part33/skillskills',
    desc: '为 Codex 设计的中文工作流 Skill：编码前先澄清需求、比较方案，把模糊想法整理成可批准的设计方案——先设计，后实现。',
    lang: 'HTML',
    updated: '2026-06',
    caseUrl: 'she-ji-qian-zhi/portfolio-case-study.html',
  },
];

/* ---------------- helpers ---------------- */

function useHash() {
  const [hash, setHash] = React.useState(() => window.location.hash);
  React.useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('isVisible');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('isVisible');
            io.disconnect();
          }
        });
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------------- app ---------------- */

function App() {
  const hash = useHash();
  const articleMatch = hash.match(/^#\/article\/([\w-]+)/);
  const activeSlug = articleMatch ? articleMatch[1] : null;

  // Anchor scrolling for in-page links (kept from the original site).
  React.useEffect(() => {
    if (activeSlug) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }
    if (!window.location.hash || window.location.hash.startsWith('#/')) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      try {
        const id = decodeURIComponent(window.location.hash.slice(1));
        document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      } catch {
        // Leave malformed fragment identifiers untouched instead of breaking the page.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeSlug]);

  // Opening cinematic (kept from the original site).
  React.useLayoutEffect(() => {
    if (activeSlug) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shouldPlayOpening = !reduceMotion && !window.location.hash && !hasPlayedOpening();

    const ctx = gsap.context(() => {
      if (shouldPlayOpening) {
        markOpeningPlayed();
        gsap.set(document.body, { overflow: 'hidden' });
        gsap.set('.siteHeader', { autoAlpha: 0, y: -96 });
        gsap.set('.heroBackground', { scale: 1.08 });
        gsap.set('.heroTitle', {
          clipPath: 'inset(0 100% 0 0)',
          filter: 'blur(10px)',
          scaleX: 0.72,
          transformOrigin: 'left center',
          yPercent: 42,
        });
        gsap.set('.heroActions a', { clipPath: 'inset(0 100% 0 0)', x: -28 });
        gsap.set('.heroReadmeBlock span, .heroTagline, .heroMeta span', {
          clipPath: 'inset(0 0 100% 0)',
          y: 44,
        });

        const opening = gsap.timeline({ defaults: { ease: 'expo.out' } });

        opening
          .to('.openingRule', { duration: 0.95, scaleX: 1, ease: 'power4.inOut' })
          .to('.openingWord', { duration: 1.05, clipPath: 'inset(0 0% 0 0)', y: 0 }, 0.18)
          .to('.heroBackground', { duration: 2.2, scale: 1, ease: 'power3.out' }, 0.22)
          .to(
            '.heroTitle',
            {
              clipPath: 'inset(0 0% 0 0)',
              duration: 1.75,
              filter: 'blur(0px)',
              scaleX: 1,
              yPercent: 0,
            },
            0.62,
          )
          .to('.openingPanel.top', { duration: 1.2, ease: 'power4.inOut', yPercent: -100 }, 0.82)
          .to('.openingPanel.bottom', { duration: 1.2, ease: 'power4.inOut', yPercent: 100 }, 0.82)
          .to('.siteHeader', { autoAlpha: 1, duration: 1.1, y: 0 }, 1.32)
          .to(
            '.heroActions a',
            { clipPath: 'inset(0 0% 0 0)', duration: 1.05, stagger: 0.12, x: 0 },
            1.46,
          )
          .to(
            '.heroReadmeBlock span, .heroTagline, .heroMeta span',
            { clipPath: 'inset(0 0 0% 0)', duration: 1.12, stagger: 0.08, y: 0 },
            1.56,
          )
          .set(document.body, { clearProps: 'overflow' }, 2.2)
          .set('.openingLayer', { display: 'none' }, 2.35);
      } else {
        gsap.set('.openingLayer', { display: 'none' });
        gsap.set('.siteHeader', { autoAlpha: 1, y: 0 });
        gsap.set('.heroBackground', { scale: 1 });
        gsap.set('.heroTitle', {
          clipPath: 'inset(0 0% 0 0)',
          filter: 'blur(0px)',
          scaleX: 1,
          yPercent: 0,
        });
      }
    });

    return () => ctx.revert();
  }, [activeSlug]);

  if (activeSlug) {
    const article = articles.find((a) => a.slug === activeSlug);
    return (
      <main>
        <Header />
        {article ? (
          <ArticleReader article={article} />
        ) : (
          <section className="section">
            <div className="container">
              <p className="sectionKicker">404</p>
              <h2>这篇文章不存在</h2>
              <p><a href="#articles">← 返回文章列表</a></p>
            </div>
          </section>
        )}
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <div className="openingLayer" aria-hidden="true">
        <div className="openingPanel top">
          <span className="openingWord">PARTH</span>
          <span className="openingRule" />
        </div>
        <div className="openingPanel bottom" />
      </div>
      <Header />
      <Hero />
      <div className="belowHero">
        <div className="staticBackdrop" aria-hidden="true" />
        <Viewpoints />
        <Articles />
        <Projects />
        <Contact />
      </div>
      <Footer />
    </main>
  );
}

/* ---------------- sections ---------------- */

function Header() {
  return (
    <header className="siteHeader">
      <a className="brand brandName" href="#home">
        <span>Parth</span>
      </a>
      <nav>
        <a href="#viewpoints">观点</a>
        <a href="#articles">文章</a>
        <a href="#projects">项目</a>
        <a href="#contact">联系</a>
      </nav>
      <a className="contactButton" href="mailto:3271408034@qq.com">
        <Mail size={17} strokeWidth={1.8} />
        <span>联系</span>
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="heroBackground" aria-hidden="true" />
      <div className="heroShade" />
      <div className="container heroFrame minimalHero">
        <div className="heroInner">
          <h1 className="heroTitle">Parth</h1>
        </div>
        <div className="heroBottom">
          <div className="heroActions">
            <a className="primaryButton" href="#viewpoints">
              开始查看
              <ArrowUpRight size={18} strokeWidth={1.8} />
            </a>
            <a className="ghostButton" href="mailto:3271408034@qq.com">
              3271408034@qq.com
            </a>
          </div>
          <div className="heroReadmeBlock">
            <span>README</span>
            <p className="heroTagline">一个在自我 harness 的 AI 产品经理</p>
          </div>
        </div>
      </div>
      <div className="heroMeta">
        <span>Parth</span>
        <span>Guangdong, China</span>
        <span>AI Product Manager</span>
      </div>
    </section>
  );
}

function Viewpoints() {
  return (
    <section className="section viewpoints" id="viewpoints">
      <p className="sectionDisplayTitle">VIEW</p>
      <div className="container">
        <Reveal>
          <p className="sectionKicker">POINT OF VIEW</p>
          <h2 className="sectionTitle">四个判断</h2>
          <p className="sectionLead">做 AI 产品时反复验证过的几句话，先亮出来，再看文章和项目。</p>
        </Reveal>
        <div className="viewpointGrid">
          {viewpoints.map((v, i) => (
            <Reveal key={v.no} delay={i * 90}>
              <SpotlightCard className="viewpointCard" spotlightColor="rgba(188, 168, 255, 0.2)">
                <span className="viewpointNo">{v.no}</span>
                <p className="viewpointText">{v.text}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Articles() {
  return (
    <section className="section articles" id="articles">
      <p className="sectionDisplayTitle">WRITE</p>
      <div className="container">
        <Reveal>
          <p className="sectionKicker">ARTICLES / 2026.01 — 2026.09</p>
          <h2 className="sectionTitle">十四篇文章</h2>
          <p className="sectionLead">
            每月两篇，观点先行：每个选题都先有一句反共识的判断，新闻只是论据。
          </p>
        </Reveal>
        <div className="articleGrid">
          {articles.map((a, i) => (
            <Reveal key={a.slug} delay={(i % 3) * 80}>
              <a className="articleCard" href={`#/article/${a.slug}`}>
                <div className={`articleCover coverV${i % 5}`} aria-hidden="true">
                  <span className="articleCoverMonth">{a.month}</span>
                  <span className="articleCoverNo">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="articleBody">
                  <h3>{a.title}</h3>
                  <p>{a.excerpt}</p>
                  <span className="articleMeta">
                    {a.date} · {a.words} · 阅读 →
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArticleReader({ article }) {
  const index = articles.findIndex((a) => a.slug === article.slug);
  const prev = articles[index - 1];
  const next = articles[index + 1];

  // Gracefully hide images that are not shipped with this build.
  React.useEffect(() => {
    const onError = (e) => {
      const t = e.target;
      if (t && t.tagName === 'IMG' && t.hasAttribute('data-article-img')) {
        t.closest('figure')?.remove();
      }
    };
    document.addEventListener('error', onError, true);
    return () => document.removeEventListener('error', onError, true);
  }, [article.slug]);

  return (
    <article className="reader" id="reader">
      <div className="container readerInner">
        <a className="readerBack" href="#articles">
          <ArrowLeft size={16} strokeWidth={1.8} />
          <span>全部文章</span>
        </a>
        <p className="sectionKicker">{article.month} · {article.date}</p>
        <h1 className="readerTitle">{article.title}</h1>
        <p className="readerExcerpt">{article.excerpt}</p>
        <div className="readerBody" dangerouslySetInnerHTML={{ __html: article.html }} />
        <nav className="readerNav">
          {prev ? (
            <a href={`#/article/${prev.slug}`}>
              <span>← 上一篇</span>
              <strong>{prev.title}</strong>
            </a>
          ) : <span />}
          {next ? (
            <a href={`#/article/${next.slug}`}>
              <span>下一篇 →</span>
              <strong>{next.title}</strong>
            </a>
          ) : <span />}
        </nav>
      </div>
    </article>
  );
}

function Projects() {
  return (
    <section className="section projects" id="projects">
      <p className="sectionDisplayTitle">BUILD</p>
      <div className="container">
        <Reveal>
          <p className="sectionKicker">PROJECTS / GITHUB</p>
          <h2 className="sectionTitle">五个项目</h2>
          <p className="sectionLead">
            都是进行中的个人项目：Harness 三部曲 + Agent 平台 + AI 视频工作台。先看仓库，案例页随后补。
          </p>
        </Reveal>
        <div className="repoGrid">
          {projects.map((p, i) => (
            <Reveal key={p.repo} delay={(i % 2) * 90}>
              <SpotlightCard className="repoCard" spotlightColor="rgba(188, 168, 255, 0.18)">
                <div className="repoTop">
                  <span className="repoTag">{p.tag}</span>
                  <span className="statusTag">开发中</span>
                </div>
                <h3>{p.title}</h3>
                <p className="repoDesc">{p.desc}</p>
                <p className="repoMeta">
                  {p.repo} · {p.lang} · 更新 {p.updated}
                </p>
                <div className="repoLinks">
                  <a href={p.url} target="_blank" rel="noreferrer">
                    <FolderGit2 size={15} strokeWidth={1.8} />
                    <span>GitHub 仓库</span>
                    <ExternalLink size={13} strokeWidth={1.8} />
                  </a>
                  {p.caseUrl && (
                    <a href={`${baseUrl}${p.caseUrl}`}>
                      <span>案例页</span>
                      <ArrowUpRight size={14} strokeWidth={1.8} />
                    </a>
                  )}
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contactEnd" id="contact">
      <p className="sectionDisplayTitle contactDisplayTitle">CONTACT</p>
      <div className="container contactEndInner">
        <Reveal>
          <p className="sectionKicker">CONTACT</p>
          <h2>保持联系。</h2>
          <p>
            对 AI 产品、Agent 工作流，或者文章里的某个判断有不同看法——欢迎交流。
          </p>
          <div className="contactLine">
            <a href="mailto:3271408034@qq.com">
              <Mail size={16} strokeWidth={1.8} />
              <span>3271408034@qq.com</span>
            </a>
            <a href="https://github.com/part33" target="_blank" rel="noreferrer">
              <FolderGit2 size={16} strokeWidth={1.8} />
              <span>github.com/part33</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="siteFooter">
      <div className="container">
        <span>© 2026 Parth</span>
        <span>观点 · 文章 · 项目</span>
      </div>
    </footer>
  );
}

createRoot(document.getElementById('root')).render(<App />);
