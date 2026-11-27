import { LineReveal } from '../components/LineReveal';

type Props = {
  title: string;
};

export default function NothPlaceholderPage({ title }: Props) {
  return (
    <div className="section-w">
      <section className="section">
        <div className="container">
          <div className="space-150" />
          <LineReveal as="h1" className="h1-home" lines={[title]} />
          <p className="p-m" style={{ marginTop: '2rem', opacity: 1 }}>
            React 页面占位 — 动效与版式将按归档 HTML 继续补齐。
          </p>
        </div>
      </section>
    </div>
  );
}
