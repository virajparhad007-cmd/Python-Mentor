import { Bot, Code2, Zap, Shield, BookOpen } from 'lucide-react';

const FEATURES = [
  { icon: <Code2 size={20} />, title: 'Python Expert', desc: 'Deep knowledge of Python from basics to advanced AI/ML topics.' },
  { icon: <Zap size={20} />, title: 'Streaming Responses', desc: 'Real-time token streaming powered by the xAI Grok API.' },
  { icon: <Shield size={20} />, title: 'Python-Only', desc: 'Focused exclusively on Python. No distractions, no off-topic answers.' },
  { icon: <BookOpen size={20} />, title: 'Learn & Debug', desc: 'Understand code, fix bugs, and prepare for interviews.' },
];

export function AboutPage() {
  return (
    <div className="about-page inner-page">
      <div className="about-hero">
        <div className="about-logo">
          <Bot size={56} />
        </div>
        <h1 className="about-title">PyMentor AI</h1>
        <p className="about-subtitle">
          An intelligent Python tutor powered by xAI's Grok API. Built for students,
          developers, and AI/ML engineers who want a focused Python learning environment.
        </p>
      </div>

      <div className="about-features">
        {FEATURES.map((f, i) => (
          <div key={i} className="about-feature-card">
            <div className="about-feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="about-stack">
        <h3>Tech Stack</h3>
        <div className="stack-tags">
          {['FastAPI', 'Grok API', 'React', 'TypeScript', 'Vite', 'Tailwind CSS', 'SQLite', 'highlight.js'].map(t => (
            <span key={t} className="stack-tag">{t}</span>
          ))}
        </div>
      </div>

      <div className="about-version">
        <p>Version 1.0.0 · PyMentor AI</p>
      </div>
    </div>
  );
}
