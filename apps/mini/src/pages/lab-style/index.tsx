import { Input, ScrollView, Text, View } from '@tarojs/components';
import './index.scss';

export default function LabStyleMiniPage() {
  return (
    <ScrollView scrollY className="y2k-page">
      <View className="y2k-topline">
        <View className="y2k-pill">
          <View className="y2k-pill-dot" />
          <Text className="y2k-pill-text">concept · y2k acid type</Text>
        </View>
        <View className="y2k-pill y2k-pill--ghost">
          <Text className="y2k-pill-text">unseen-ish</Text>
        </View>
      </View>

      <View className="y2k-hero">
        <Text className="y2k-title">
          CREATING <Text className="y2k-title-acid">the UNEXPECTED</Text>
        </Text>
        <Text className="y2k-sub">
          这页是「样式基线展示」：背景、卡片、按钮、输入框、标签与酸性文字。复制 class 到其它页面即可复用。
        </Text>
        <View className="y2k-microcopy">
          <Text className="y2k-microcopy-kbd">CLICK + HOLD</Text>
          <Text className="y2k-microcopy-text">y2k 的“触感”来自高光与描边</Text>
        </View>
      </View>

      <View className="y2k-orb" aria-hidden="true">
        <View className="y2k-orb-inner" />
        <View className="y2k-orb-glare" />
      </View>

      <View className="y2k-grid">
        <View className="y2k-card">
          <Text className="y2k-card-title">Cards</Text>
          <Text className="y2k-card-desc">玻璃果冻底 + 冷色细边框 + 软阴影，适合承载表单/信息块。</Text>
          <View className="y2k-divider" />
          <View className="y2k-tags">
            <View className="y2k-tag">
              <View className="y2k-tag-dot" />
              <Text className="y2k-tag-text">refractive</Text>
            </View>
            <View className="y2k-tag">
              <View className="y2k-tag-dot" />
              <Text className="y2k-tag-text">acid</Text>
            </View>
            <View className="y2k-tag">
              <View className="y2k-tag-dot" />
              <Text className="y2k-tag-text">chrome</Text>
            </View>
          </View>
        </View>

        <View className="y2k-card">
          <Text className="y2k-card-title">Buttons / Inputs</Text>
          <Text className="y2k-card-desc">按钮用“气泡高光 + 渐变 + 描边”塑形；输入框保持同一材质。</Text>

          <View className="y2k-actions">
            <View className="y2k-btn y2k-btn--primary">
              <Text className="y2k-btn-text">Primary</Text>
            </View>
            <View className="y2k-btn">
              <Text className="y2k-btn-text">Default</Text>
            </View>
            <View className="y2k-btn y2k-btn--ghost">
              <Text className="y2k-btn-text">Ghost</Text>
            </View>
          </View>

          <View className="y2k-field">
            <Text className="y2k-label">Input</Text>
            <Input className="y2k-input" placeholder="Type something…" placeholderClass="y2k-placeholder" />
          </View>
        </View>
      </View>

      <View className="y2k-footer-card">
        <Text className="y2k-footer-title">复用方式</Text>
        <Text className="y2k-footer-desc">
          把 `pages/lab-style/index.scss` 里的 `y2k-*` class 复制到你目标页面，或提取成通用 scss 文件统一管理。
        </Text>
      </View>
    </ScrollView>
  );
}

