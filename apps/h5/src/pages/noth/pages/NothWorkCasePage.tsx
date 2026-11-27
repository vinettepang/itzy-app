import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { NothPageHtml } from '../components/NothPageHtml';
import { NOTH_CASE_PAGES } from '../generated/NOTH_CASE_PAGES';
import { NOTH_ROUTES } from '../paths';

function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function buildCasePlaceholderHtml(slug: string) {
  const title = titleFromSlug(slug);
  return `<div class="page-wrapper"><div data-taxi="" class="main-wrapper"><div data-taxi-view="" class="page_view"><section class="section works"><div class="container works"><div class="space-150"></div><h1 line="" class="h1-case" aria-label="${title}"><div class="line-mask-child-mask" aria-hidden="true"><div class="line-child" aria-hidden="true">${title}</div></div></h1><div class="space-87"></div><p line="" class="p-l" aria-label="Case study HTML is not in the archive yet. This route is wired for flip transitions and future generate:noth pages."><div class="line-mask-child-mask" aria-hidden="true"><div class="line-child" aria-hidden="true">Case study HTML is not in the archive yet.</div></div><div class="line-mask-child-mask" aria-hidden="true"><div class="line-child" aria-hidden="true">Add _archive-html/works/${slug}/index.html and re-run generate:noth.</div></div></p><div class="space-24"></div><a href="${NOTH_ROUTES.works}" data-taxi-ignore class="btn w-inline-block"><div class="btn__text"><p class="btn__text-p">Back to works</p></div></a><div class="space-150"></div></div></section></div></div></div>`;
}

export default function NothWorkCasePage() {
  const { slug = 'work' } = useParams();
  const html = useMemo(
    () => NOTH_CASE_PAGES[slug] ?? buildCasePlaceholderHtml(slug),
    [slug],
  );
  return <NothPageHtml html={html} />;
}
