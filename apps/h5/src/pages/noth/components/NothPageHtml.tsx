import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { nothPageMounted, nothPageUnmount } from '../hooks/useNothSiteRuntime';

type OutletCtx = {
  pageSlotRef: React.RefObject<HTMLDivElement | null>;
  rootRef: React.RefObject<HTMLDivElement | null>;
};

type Props = { html: string };

/** 将归档 HTML 注入 layout 的 page slot，并触发原站 main 包重新绑定动效 */
export function NothPageHtml({ html }: Props) {
  const { pageSlotRef, rootRef } = useOutletContext<OutletCtx>();

  useEffect(() => {
    const slot = pageSlotRef?.current;
    const root = rootRef?.current;
    if (!slot || !root) return;
    slot.innerHTML = html;
    nothPageMounted(root);
    return () => {
      nothPageUnmount();
      slot.innerHTML = '';
    };
  }, [html, pageSlotRef, rootRef]);

  return null;
}
