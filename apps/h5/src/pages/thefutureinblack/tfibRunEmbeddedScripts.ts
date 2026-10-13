/** 执行通过 innerHTML 注入的 script（含 WHAT WE SHIFT 滚动放大等）。 */
export async function tfibRunEmbeddedScripts(root: ParentNode): Promise<void> {
  const scripts = Array.from(root.querySelectorAll('script'));
  for (const old of scripts) {
    await new Promise<void>((resolve, reject) => {
      const el = document.createElement('script');
      for (const attr of old.attributes) {
        el.setAttribute(attr.name, attr.value);
      }
      const src = old.getAttribute('src');
      if (src) {
        el.addEventListener('load', () => resolve(), { once: true });
        el.addEventListener('error', () => reject(new Error(`Embedded script: ${src}`)), {
          once: true,
        });
      }
      el.textContent = old.textContent;
      old.parentNode?.replaceChild(el, old);
      if (!src) resolve();
    });
  }
}
