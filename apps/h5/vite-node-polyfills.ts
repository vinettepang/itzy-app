/**
 * Vite / 部分依赖在 Node 侧会访问 CustomEvent；少数运行环境未提供该全局。
 * 必须作为 vite.config 的「第一个」 import，保证在其他包加载前生效。
 *
 * 这里刻意用 `any`，避免在不同 tsconfig/lib 组合下（是否含 DOM）出现类型冲突。
 */
const g = globalThis as typeof globalThis & {
  CustomEvent?: unknown;
  Event?: unknown;
};

if (typeof g.CustomEvent === 'undefined') {
  if (typeof g.Event === 'undefined') {
    g.Event = class EventMinimal {
      type: string;
      bubbles = false;
      cancelable = false;
      constructor(type: string) {
        this.type = type;
      }
    } as any;
  }

  const Base = g.Event as any;
  g.CustomEvent = class CustomEventMinimal extends Base {
    detail: unknown;
    constructor(type: string, eventInitDict?: { detail?: unknown }) {
      super(type, eventInitDict as any);
      this.detail = eventInitDict?.detail ?? null;
    }
  } as any;
}
