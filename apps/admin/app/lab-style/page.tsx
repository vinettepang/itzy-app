'use client';

import { ArrowRightOutlined, ExperimentOutlined } from '@ant-design/icons';
import { Button, Card, Input, Space, Typography } from 'antd';

import styles from './lab-style.module.css';

const { Title, Paragraph, Text } = Typography;

export default function LabStylePage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topLine}>
          <div className={styles.meta}>
            <span className={styles.metaDot} />
            <span className={styles.metaText}>Concept · Lab-style UI kit</span>
          </div>
          <div className={styles.tag}>
            <span className={styles.tagDot} />
            <span>Unseen-ish</span>
          </div>
        </div>

        <div className={styles.hero}>
          <div>
            <h1 className={styles.title}>
              <span className={styles.chromeText}>Creating the Unexpected</span>
            </h1>
            <p className={styles.subtitle}>
              这是一个用于 Admin 的实验性视觉语言：天空蓝渐变底、玻璃卡片、金属感按钮与
              轻盈的高对比排版。你可以把这些 class 复用到任意页面或组件中。
            </p>

            <div className={styles.hint}>
              <span className={styles.hintKbd}>CLICK + HOLD</span>
              <span className={styles.hintText}>用于强调交互与触感的 microcopy 风格</span>
            </div>
          </div>

          <div className={styles.orbWrap} aria-hidden="true">
            <div className={styles.orb}>
              <div className={styles.orbInner} />
            </div>
          </div>
        </div>

        <div className={styles.sectionGrid}>
          <Card
            className={styles.chromeCard}
            title={
              <Space size={10}>
                <ExperimentOutlined />
                <span className={styles.cardTitle}>Cards</span>
                <Text className={styles.small}>(玻璃 + 轻边框 + 大阴影)</Text>
              </Space>
            }
          >
            <Paragraph style={{ marginBottom: 10, color: 'rgba(8,10,20,0.72)' }}>
              适合承载设置项、表单分组、数据摘要。默认用柔和半透明白做底，靠阴影拉开层级。
            </Paragraph>
            <div className={styles.divider} />
            <ul className={styles.specList}>
              <li>圆角 18px，边框 1px（冷色弱对比）</li>
              <li>背景 48% 透明白，配合 backdrop blur</li>
              <li>阴影偏大、偏软，营造“实验室泡泡”氛围</li>
            </ul>
          </Card>

          <Card
            className={styles.chromeCard}
            title={
              <Space size={10}>
                <ArrowRightOutlined />
                <span className={styles.cardTitle}>Buttons / Inputs</span>
                <Text className={styles.small}>(金属气泡)</Text>
              </Space>
            }
          >
            <Paragraph style={{ marginBottom: 12, color: 'rgba(8,10,20,0.72)' }}>
              下面是按钮与输入框的组合示例。按钮不依赖 antd 的 primary 配色，而是用自定义渐变与
              高光塑形。
            </Paragraph>

            <div className={styles.controls}>
              <Button className={`${styles.chromeButton} ${styles.chromeButtonPrimary}`} icon={<ArrowRightOutlined />}>
                Primary
              </Button>
              <Button className={styles.chromeButton}>Default</Button>
              <Button className={`${styles.chromeButton} ${styles.chromeButtonGhost}`}>Ghost</Button>
            </div>

            <div style={{ height: 10 }} />

            <Input
              className={styles.input}
              placeholder="Type something…"
              allowClear
              suffix={<Text style={{ color: 'rgba(8,10,20,0.5)' }}>LAB</Text>}
            />

            <div style={{ height: 12 }} />

            <Space wrap>
              <span className={styles.tag}>
                <span className={styles.tagDot} />
                <span>Refractive</span>
              </span>
              <span className={styles.tag}>
                <span className={styles.tagDot} />
                <span>Glass</span>
              </span>
              <span className={styles.tag}>
                <span className={styles.tagDot} />
                <span>Chrome</span>
              </span>
            </Space>
          </Card>
        </div>

        <div style={{ marginTop: 18 }}>
          <Card className={styles.chromeCard}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 8, fontWeight: 750 }}>
              如何复用到其它页面
            </Title>
            <Paragraph style={{ marginBottom: 0, color: 'rgba(8,10,20,0.72)' }}>
              直接复制 `lab-style.module.css` 里的 class（例如 `chromeCard`、`chromeButton`、`tag`），
              或把它抽成通用样式文件/组件。该页面本身就是一套可预览的 UI 基线。
            </Paragraph>
          </Card>
        </div>
      </div>
    </div>
  );
}

