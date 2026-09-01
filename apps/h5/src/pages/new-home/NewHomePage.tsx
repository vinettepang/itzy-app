import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type TransitionEvent,
} from "react";
import { Link } from "react-router-dom";
import Lenis from "lenis";
import { request, resolveMediaUrl } from "@/services/request";
import { stripBase } from "@/utils/assetUrl";
import itzyPng from "@/assets/itzy-w.png";
import itzyLogoPng from "@/assets/itzy.png";
import tourPosterWebp from "@/assets/tour-poster.webp";
import screamFigureGif from "@/assets/scream-figure-jump-transparent.gif";
import dollGif from "@/assets/doll.png";
import NewHomeFallCanvas from "./NewHomeFallCanvas";
import NewHomeRefractionCanvas from "./NewHomeRefractionCanvas";
import NewNewArtworkTicket from "@/pages/newnew/NewNewArtworkTicket";
import "../XkmPage.css";
import "../XkmPage.pc.css";
import "./new-home.css";

const galleryImages = Object.entries(
  import.meta.glob<string>("@/assets/*.{jpg,jpeg}", {
    eager: true,
    import: "default",
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, src]) => ({
    src,
    alt:
      path
        .split("/")
        .pop()
        ?.replace(/\.[^.]+$/, "") ?? "image",
  }));

function prefersReducedMotion() {
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
  );
}

type OverlayPhase = "visible" | "fading" | "hidden";

const LOADING_OVERLAY_COPY = "itzy all in us";
const OVERLAY_MIN_MS = 3000;
const OVERLAY_MAX_MS = 15000;

/** 内存缓存：SPA 返回跳过遮罩，整页刷新后自动清空并重新显示 */
const overlaySeenKeys = new Set<string>();

function XkmLoadingTypewriter({ active }: { active: boolean }) {
  const [text, setText] = useState("");
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    if (!active) return;

    if (reducedMotion) {
      setText(LOADING_OVERLAY_COPY);
      return;
    }

    setText("");
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setText(LOADING_OVERLAY_COPY.slice(0, index));
      if (index >= LOADING_OVERLAY_COPY.length) {
        window.clearInterval(interval);
      }
    }, 72);

    return () => {
      window.clearInterval(interval);
    };
  }, [active, reducedMotion]);

  const showCursor =
    active && !reducedMotion && text.length < LOADING_OVERLAY_COPY.length;

  return (
    <p className="xkm-loadingOverlay__text" aria-live="polite">
      {text}
      {showCursor ? (
        <span className="xkm-loadingOverlay__cursor" aria-hidden="true">
          |
        </span>
      ) : null}
    </p>
  );
}

function useXkmMediaOverlay(deps: unknown[], cacheKey?: string) {
  const cached = Boolean(cacheKey && overlaySeenKeys.has(cacheKey));
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<OverlayPhase>(
    cached ? "hidden" : "visible",
  );
  const hasDismissedRef = useRef(cached);

  useEffect(() => {
    if (hasDismissedRef.current) return;

    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let pending = 0;
    let mediaReady = false;
    let minTimeReady = false;

    const finish = () => {
      if (cancelled || hasDismissedRef.current) return;
      hasDismissedRef.current = true;
      if (cacheKey) overlaySeenKeys.add(cacheKey);
      setPhase("fading");
    };

    const tryFinish = () => {
      if (mediaReady && minTimeReady) finish();
    };

    const markLoaded = () => {
      pending -= 1;
      if (!cancelled && pending <= 0) {
        mediaReady = true;
        tryFinish();
      }
    };

    const media = Array.from(root.querySelectorAll("img, video"));

    media.forEach((node) => {
      if (node instanceof HTMLImageElement) {
        if (node.complete) return;
        pending += 1;
        const onDone = () => {
          node.removeEventListener("load", onDone);
          node.removeEventListener("error", onDone);
          markLoaded();
        };
        node.addEventListener("load", onDone);
        node.addEventListener("error", onDone);
        return;
      }

      if (node instanceof HTMLVideoElement) {
        if (node.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) return;
        pending += 1;
        const onDone = () => {
          node.removeEventListener("canplaythrough", onDone);
          node.removeEventListener("error", onDone);
          markLoaded();
        };
        node.addEventListener("canplaythrough", onDone);
        node.addEventListener("error", onDone);
      }
    });

    if (pending <= 0) {
      mediaReady = true;
    }

    const minTimer = window.setTimeout(() => {
      minTimeReady = true;
      tryFinish();
    }, OVERLAY_MIN_MS);

    const maxTimer = window.setTimeout(finish, OVERLAY_MAX_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-check when page media mounts/updates
  }, deps);

  const onOverlayTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "opacity" || phase !== "fading") return;
    setPhase("hidden");
  };

  return { rootRef, phase, onOverlayTransitionEnd };
}

type ScheduleVenueBrief = {
  id: string;
  posterDisplayName: string;
  city: string;
  countryName: string;
};

type HomeSchedule = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  coverUrl?: string | null;
  startsAt: string;
  highlighted: boolean;
  venue?: ScheduleVenueBrief | null;
};

type HomeSchedulesPayload = {
  today: HomeSchedule[];
  featured: HomeSchedule[];
  comeback: HomeSchedule[];
  tourSpotlight: HomeSchedule | null;
  tourSpotlightCycleTitle: string | null;
};

function fmtMonthDay(iso: string) {
  const d = new Date(iso);
  const month = d
    .toLocaleString("zh-CN", { month: "numeric" })
    .replace(/\D/g, "");
  const day = d.toLocaleString("zh-CN", { day: "2-digit" });
  return { month: month || String(d.getMonth() + 1), day };
}

function diffDays(fromIso: string) {
  const now = Date.now();
  const t = new Date(fromIso).getTime();
  if (!Number.isFinite(t)) return null;
  const ms = t - now;
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

type TicketView = {
  title: string;
  artist: string;
  venueLine: string;
  month: string;
  day: string;
  year: string;
  daysLeft: number | null;
  posterUrl: string;
  city?: string;
};

function buildTicketFromSchedule(pick: HomeSchedule): TicketView {
  const { month, day } = fmtMonthDay(pick.startsAt);
  const venueLine = pick.venue?.posterDisplayName
    ? `${pick.venue.posterDisplayName}`
    : pick.location
      ? `${pick.location}`
      : "";
  const cover = pick.coverUrl ? resolveMediaUrl(pick.coverUrl) : "";
  return {
    title: pick.title,
    artist: "ITZY",
    venueLine,
    month,
    day,
    year: String(new Date(pick.startsAt).getFullYear()),
    daysLeft: diffDays(pick.startsAt),
    posterUrl: cover || tourPosterWebp,
    city: pick.venue?.city,
  };
}

function collectTicketSchedules(
  data: HomeSchedulesPayload | null,
): HomeSchedule[] {
  const candidates: HomeSchedule[] = [];
  if (data?.tourSpotlight) candidates.push(data.tourSpotlight);
  candidates.push(...(data?.featured ?? []));
  candidates.push(...(data?.today ?? []));
  candidates.push(...(data?.comeback ?? []));
  const seen = new Set<string>();
  return candidates.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

type TicketVariant = "hybrid" | "flat";

const TICKET_NARROW_MQ = "(max-width: 640px)";

function useHomeTicketLimit() {
  const [limit, setLimit] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia(TICKET_NARROW_MQ).matches
      ? 1
      : 2,
  );

  useEffect(() => {
    const mq = window.matchMedia(TICKET_NARROW_MQ);
    const sync = () => setLimit(mq.matches ? 1 : 2);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return limit;
}

function XkmTicketCard({
  ticket,
  variant,
}: {
  ticket: TicketView;
  variant: TicketVariant;
}) {
  const rootClass =
    variant === "hybrid" ? "xkm-hybrid-ticket" : "xkm-flat-ticket";

  return (
    <Link
      to="/schedules"
      className={rootClass}
      style={
        {
          "--ticket-poster-bg": `url("${ticket.posterUrl}")`,
        } as CSSProperties
      }
    >
      <div className={`${rootClass}__concert`}>
        <div className={`${rootClass}__copy`}>
          <p className={`${rootClass}__kicker`}>{ticket.artist}</p>
          <h3 className={`${rootClass}__title`}>{ticket.title}</h3>
          {ticket.venueLine ? (
            <p className={`${rootClass}__venue`}>
              <span className={`${rootClass}__venueIcon`} aria-hidden="true">
                ⌁
              </span>
              <span>{ticket.venueLine}</span>
            </p>
          ) : null}
        </div>
      </div>
      <div className={`${rootClass}__stub`}>
        <div
          className={
            variant === "hybrid" ? "xkm-ticket-date" : "xkm-flat-ticket-date"
          }
        >
          <div
            className={
              variant === "hybrid"
                ? "xkm-ticket-date__month"
                : "xkm-flat-ticket-date__month"
            }
          >
            {ticket.month}月
          </div>
          <div
            className={
              variant === "hybrid"
                ? "xkm-ticket-date__day"
                : "xkm-flat-ticket-date__day"
            }
          >
            {ticket.day}
          </div>
          <div
            className={
              variant === "hybrid"
                ? "xkm-ticket-date__year"
                : "xkm-flat-ticket-date__year"
            }
          >
            {ticket.year}
          </div>
          {ticket.daysLeft !== null ? (
            <div
              className={
                variant === "hybrid"
                  ? "xkm-ticket-date__badge"
                  : "xkm-flat-ticket-date__badge"
              }
            >
              {ticket.daysLeft}天
            </div>
          ) : null}
        </div>
      </div>
      <span className={`${rootClass}__tear`} aria-hidden="true" />
    </Link>
  );
}

const INFO_MARQUEE_TEXT = "团综 DaDa-ITZY 热映 · ITZY 三巡巡演中";

function ImageScroller({ images }: { images: typeof galleryImages }) {
  const loop = [...images, ...images];

  return (
    <div className="xkm-imageScroller" aria-label="Gallery">
      <div className="xkm-imageScroller__viewport">
        <div className="xkm-imageScroller__track">
          {loop.map((image, index) => (
            <img
              key={`${image.src}-${index}`}
              className="xkm-imageScroller__img"
              src={image.src}
              alt={index < images.length ? image.alt : ""}
              aria-hidden={index >= images.length ? true : undefined}
              loading="eager"
              fetchPriority="high"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoMarquee() {
  const items = [INFO_MARQUEE_TEXT, INFO_MARQUEE_TEXT];

  return (
    <div
      className="xkm-coverNav__cell xkm-coverNav__cell--marquee"
      aria-label="Information"
    >
      <div
        className="xkm-infoMarquee__viewport"
        role="marquee"
        aria-label="Information ticker"
      >
        <div className="xkm-infoMarquee__track">
          {items.map((text, i) => (
            <span
              key={i}
              className="xkm-infoMarquee__item"
              aria-hidden={i > 0 ? true : undefined}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
      <span className="xkm-infoMarquee__label">Information</span>
    </div>
  );
}

const NEWNEW_NAV_TOP = 0;
const NEWNEW_NAV_PINNED_CLASS = "xkm-coverNav--pinned";

function setupNewnewHomeScroll(root: HTMLDivElement) {
  const scrollEl = root.querySelector(".xkm-scroll");
  const fixedEl = root.querySelector(".xkm-fixed");
  const nav = root.querySelector(".xkm-coverNav");
  const section = root.querySelector(".xkm-section-container");

  if (!scrollEl || !nav || !section) {
    return {
      getMaxScroll: () => Infinity,
      onScroll: () => {},
      cleanup: () => {},
    };
  }

  let maxScroll = 0;
  let pinStart = 0;
  let navHeight = 0;

  const measurePin = () => {
    const wasPinned = nav.classList.contains(NEWNEW_NAV_PINNED_CLASS);
    nav.classList.remove(NEWNEW_NAV_PINNED_CLASS);
    section.style.paddingTop = "";
    navHeight = nav.offsetHeight;
    pinStart =
      nav.getBoundingClientRect().top + window.scrollY - NEWNEW_NAV_TOP;
    if (wasPinned) {
      nav.classList.add(NEWNEW_NAV_PINNED_CLASS);
      section.style.paddingTop = `${navHeight}px`;
    }
  };

  const updateLimits = () => {
    const fixedH = fixedEl?.offsetHeight ?? 0;
    const scrollH = scrollEl.offsetHeight;
    maxScroll = Math.max(0, fixedH + scrollH - window.innerHeight);
    // scroll 已有 margin-top = fixedH，容器高度只取内容块高度
    root.style.height = `${scrollH}px`;
    measurePin();
  };

  const updatePin = () => {
    if (window.scrollY >= pinStart) {
      if (!nav.classList.contains(NEWNEW_NAV_PINNED_CLASS)) {
        nav.classList.add(NEWNEW_NAV_PINNED_CLASS);
        section.style.paddingTop = `${navHeight}px`;
      }
    } else {
      nav.classList.remove(NEWNEW_NAV_PINNED_CLASS);
      section.style.paddingTop = "";
    }
  };

  const onScroll = () => {
    updatePin();
    if (window.scrollY > maxScroll) {
      window.scrollTo(0, maxScroll);
    }
  };

  updateLimits();
  onScroll();

  const ro = new ResizeObserver(() => {
    updateLimits();
    onScroll();
  });
  ro.observe(scrollEl);
  const onResize = () => {
    updateLimits();
    onScroll();
  };
  window.addEventListener("resize", onResize);

  return {
    getMaxScroll: () => maxScroll,
    onScroll,
    cleanup: () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      nav.classList.remove(NEWNEW_NAV_PINNED_CLASS);
      section.style.paddingTop = "";
      root.style.height = "";
    },
  };
}

export default function NewHomePage({
  overlayCacheKey,
  homeHref,
}: {
  overlayCacheKey?: string;
  homeHref?: string;
} = {}) {
  const [data, setData] = useState<HomeSchedulesPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [fallReady, setFallReady] = useState(false);
  const onFallReady = useCallback(() => setFallReady(true), []);

  // 顶部下滑菜单的开合状态
  const [menuOpen, setMenuOpen] = useState(false);
  const ticketLimit = useHomeTicketLimit();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    void (async () => {
      try {
        const res = await request<HomeSchedulesPayload>({
          url: "/api/schedules/home?limit=12",
          method: "GET",
        });
        if (cancelled) return;
        if (res.code === 0 && res.data && !Array.isArray(res.data)) {
          setData(res.data);
        } else {
          setData({
            today: [],
            featured: [],
            comeback: [],
            tourSpotlight: null,
            tourSpotlightCycleTitle: null,
          });
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tickets = useMemo(() => {
    const schedules = collectTicketSchedules(data);
    if (!schedules.length) return [];
    // 只展示未结束（今天或未来）的场次；已过去的场次不进入 NEXT COMING
    const now = Date.now();
    const upcoming = schedules
      .filter((s) => new Date(s.startsAt).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );
    if (!upcoming.length) return [];
    return upcoming.slice(0, ticketLimit).map((s) => ({
      ticket: buildTicketFromSchedule(s),
      variant: "flat" as const,
    }));
  }, [data, ticketLimit]);

  const {
    rootRef,
    phase: overlayPhase,
    onOverlayTransitionEnd,
  } = useXkmMediaOverlay(
    [loading, tickets.length, galleryImages.length, fallReady],
    overlayCacheKey,
  );

  useEffect(() => {
    const prevRestoration = history.scrollRestoration;
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const root = rootRef.current;
    const isNewnew = overlayCacheKey === "newnew";
    const newnewScroll = isNewnew && root ? setupNewnewHomeScroll(root) : null;

    const onNewnewScroll = () => {
      newnewScroll?.onScroll();
    };

    if (prefersReducedMotion()) {
      window.addEventListener("scroll", onNewnewScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onNewnewScroll);
        newnewScroll?.cleanup();
        if ("scrollRestoration" in history) {
          history.scrollRestoration = prevRestoration;
        }
      };
    }

    const lenis = new Lenis({
      duration: 1.35,
      easing: (t: number) => 1 - Math.pow(1 - t, 3.25),
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.1,
    });
    lenis.scrollTo(0, { immediate: true });

    const onLenisScroll = () => {
      onNewnewScroll();
      if (!newnewScroll) return;
      const max = newnewScroll.getMaxScroll();
      if (lenis.scroll > max) lenis.scrollTo(max);
    };
    lenis.on("scroll", onLenisScroll);

    let raf = 0;
    const tick = (ms: number) => {
      lenis.raf(ms);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
      newnewScroll?.cleanup();
      if ("scrollRestoration" in history) {
        history.scrollRestoration = prevRestoration;
      }
    };
  }, [overlayCacheKey, rootRef]);

  return (
    <div className="xkm xkm--new-home" ref={rootRef}>
      {overlayPhase !== "hidden" ? (
        <div
          className={`xkm-loadingOverlay${
            overlayPhase === "fading" ? " xkm-loadingOverlay--fade" : ""
          }`}
          aria-hidden={overlayPhase === "fading"}
          aria-busy={overlayPhase === "visible"}
          aria-label={`Loading: ${LOADING_OVERLAY_COPY}`}
          onTransitionEnd={onOverlayTransitionEnd}
        >
          <XkmLoadingTypewriter active={overlayPhase === "visible"} />
        </div>
      ) : null}
      <header className="xkm-fixed" aria-label="Fixed hero reel layer">
        <img
          className="xkm-fixedLogo"
          src={itzyPng}
          alt="ITZY"
          width={120}
          height={40}
          decoding="async"
        />
        <div
          className="xkm-media xkm-media--fall"
          aria-label="Falling stickers and refraction hero"
        >
          <NewHomeFallCanvas onReady={onFallReady} />
          <div className="xkm-media__refraction" aria-label="WebGL refraction">
            <NewHomeRefractionCanvas />
          </div>
        </div>
      </header>

      <div className="xkm-scroll" aria-label="Scrollable content layer">
        <nav
          className={`xkm-coverNav${homeHref ? " xkm-coverNav--withHome" : ""}`}
          aria-label="Site navigation"
        >
          {homeHref ? (
            <Link
              to={homeHref}
              className="xkm-coverNav__home"
              aria-label="ITZY home"
              onClick={() => {
                if (stripBase(window.location.pathname) === homeHref) {
                  window.scrollTo(0, 0);
                }
              }}
            >
              <img
                src={itzyLogoPng}
                alt="ITZY"
                width={64}
                height={20}
                decoding="async"
              />
            </Link>
          ) : null}
          <InfoMarquee />
          <button
            type="button"
            className={`xkm-coverNav__cell xkm-coverNav__cell--menu${
              menuOpen ? " is-open" : ""
            }`}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="xkm-coverNav__menuIcon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="xkm-coverNav__menuLabel">
              {menuOpen ? "CLOSE" : "MENU"}
            </span>
          </button>
        </nav>

        {/* 顶部下滑菜单 */}
        <div
          className={`xkm-menuPanel${menuOpen ? " xkm-menuPanel--open" : ""}`}
          aria-hidden={!menuOpen}
        >
          <Link
            to="/"
            className="xkm-menuLink"
            onClick={() => setMenuOpen(false)}
          >
            首页<span className="xkm-menuLink__en">Home</span>
          </Link>
          <Link
            to="/setlist"
            className="xkm-menuLink"
            onClick={() => setMenuOpen(false)}
          >
            应援法<span className="xkm-menuLink__en">Fanchant</span>
          </Link>
          <Link
            to="/dolls"
            className="xkm-menuLink"
            onClick={() => setMenuOpen(false)}
          >
            娃娃图鉴<span className="xkm-menuLink__en">Doll Guide</span>
          </Link>
          <Link
            to="/schedules"
            className="xkm-menuLink"
            onClick={() => setMenuOpen(false)}
          >
            演唱会行程<span className="xkm-menuLink__en">Tour Dates</span>
          </Link>
        </div>

        <div className="xkm-section-container">
          {galleryImages.length > 0 ? (
            <ImageScroller images={galleryImages} />
          ) : null}
          <div className="xkm-ticketBlock">
            <div className="xkm-ticketBlock__title">
              <span>NEXT COMING</span>
            </div>
            {loading ? <p className="xkm-muted">Loading…</p> : null}
            {err ? <p className="xkm-err">{err}</p> : null}

            {tickets.length > 0 ? (
              <div className="xkm-ticketList">
                {overlayCacheKey === "newnew" ? (
                  tickets.map((item, index) => (
                    <NewNewArtworkTicket
                      key={`${item.ticket.title}-${index}`}
                      ticket={item.ticket}
                      cycleTitle={data?.tourSpotlightCycleTitle}
                      tone="blue"
                    />
                  ))
                ) : (
                  tickets.map((item, index) => (
                    <XkmTicketCard
                      key={`${item.ticket.title}-${index}`}
                      ticket={item.ticket}
                      variant={item.variant}
                    />
                  ))
                )}
              </div>
            ) : !loading && !err ? (
              <p className="xkm-muted">No upcoming schedule</p>
            ) : null}
          </div>

          <div className="xkm-btnBlock">
            <div className="xkm-btnBlock__inner">
              <div className="xkm-ticketBlock__title">
                <span>MIDZY's PLAY</span>
              </div>
              <div className="xkm-btnRowTop" aria-label="Quick actions">
                <Link to="/poster" className="xkm-objectBtn">
                  <span className="xkm-objectBtn__text text-alpha">TICKET</span>
                </Link>
                <Link to="/game" className="xkm-objectBtn">
                  <span className="xkm-objectBtn__text text-alpha">GAME</span>
                </Link>
              </div>

              {overlayCacheKey !== "newnew" ? (
                <div className="xkm-ticketActions" aria-label="Guide links">
                  <Link to="/setlist" className="xkm-objectBtn">
                    <span className="xkm-objectBtn__text text-alpha">
                      应援法
                    </span>
                  </Link>
                  <Link to="/unseen" className="xkm-objectBtn">
                    <span className="xkm-objectBtn__text text-alpha">
                      娃娃图鉴
                    </span>
                  </Link>
                </div>
              ) : null}

              <Link
                to={overlayCacheKey === "newnew" ? "/setlist" : "/cheer/tunnel-vision"}
                className="xkm-caseCard"
                aria-label={
                  overlayCacheKey === "newnew"
                    ? "三巡歌单"
                    : "Tunnel Vision 应援法"
                }
              >
                <div className="xkm-caseCard__label">
                  <span>FANCHANT</span>
                  <span>GUIDE FOR</span>
                  <span>TUNNEL VISION</span>
                </div>
                <p className="xkm-caseCard__meta">midzy . scream along</p>
                <div className="xkm-caseCard__panel">
                  <img
                    className="xkm-caseCard__art"
                    src={screamFigureGif}
                    alt="Screaming figure"
                    decoding="async"
                    loading="lazy"
                  />
                  <span className="xkm-caseCard__cta">view case →</span>
                </div>
              </Link>

              {overlayCacheKey === "newnew" ? (
                <Link
                  to="/dolls"
                  className="xkm-caseCard xkm-caseCard--dollGuide"
                  aria-label="娃娃图鉴"
                >
                  <div className="xkm-caseCard__label">
                    <span>DOLL</span>
                    <span>GUIDE FOR</span>
                    <span>TWINZY</span>
                  </div>
                  <p className="xkm-caseCard__meta">wdzy . twinzy</p>
                  <div className="xkm-caseCard__panel">
                    <img
                      className="xkm-caseCard__art"
                      src={dollGif}
                      alt="Screaming figure"
                      decoding="async"
                      loading="lazy"
                    />
                    <span className="xkm-caseCard__cta">view case →</span>
                  </div>
                </Link>
              ) : null}

              <div className="xkm-projectsPanel">
                <p className="xkm-projectsPanel__text text-alpha">
                  <p className="xkm-projectsPanel__line">
                    하나가 돼 ’cause you are my motto
                  </p>
                  {/* <span className="xkm-projectsPanel__line">
                    WE BELIEVE IN ITZY
                  </span> */}
                  {/* <span className="xkm-projectsPanel__line">WRITE US AN EMAIL</span> */}
                </p>
              </div>

              <div className="xkm-btnBlock__bottom">
                <div className="xkm-contactRow" aria-label="Contact">
                  <a
                    className="xkm-contactBtn"
                    href="https://www.youtube.com/channel/UCDhM2k2Cua-JdobAh5moMFg"
                    target="_blank"
                    rel="noreferrer"
                  >
                    YOUTUBE
                  </a>
                  <a
                    className="xkm-contactBtn"
                    href="https://www.instagram.com/itzy.all.in.us/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    INSTAGRAM
                  </a>
                  <a
                    className="xkm-contactBtn"
                    href="https://x.com/ITZYofficial"
                    target="_blank"
                    rel="noreferrer"
                  >
                    X
                  </a>
                </div>

                <footer className="xkm-siteFooter">
                  <span>2026</span>
                  <span>website by vte</span>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
