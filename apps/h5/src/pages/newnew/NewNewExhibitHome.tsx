import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TransitionEvent,
} from "react";
import { Link } from "react-router-dom";
import Lenis from "lenis";
import { request, resolveMediaUrl } from "@/services/request";
import { stripBase } from "@/utils/assetUrl";
import itzyLogoPng from "@/assets/itzy.png";
import tourPosterWebp from "@/assets/tour-poster.webp";
import screamFigureGif from "@/assets/scream-figure-jump-transparent.gif";
import dollGif from "@/assets/doll.png";
import NewHomeRefractionCanvas from "@/pages/new-home/NewHomeRefractionCanvas";
import NewNewArtworkTicket from "@/pages/newnew/NewNewArtworkTicket";
import ExhibitTile from "@/pages/newnew/ExhibitTile";
import { getCuratedExhibitGallery } from "@/pages/newnew/exhibitGallery";
import { setupNewnewHomeScroll } from "@/pages/newnew/setupNewnewHomeScroll";
import "../XkmPage.css";
import "../XkmPage.pc.css";
import "../new-home/new-home.css";
import "./newnew-exhibit.css";

const galleryImages = getCuratedExhibitGallery(10);
const SEASON_CAPTION = "Tunnel Vision · 三巡巡演 · DaDa-ITZY";
const OVERLAY_KEY = "newnew-exhibit";

type OverlayPhase = "visible" | "fading" | "hidden";
const LOADING_COPY = "itzy all in us";
const OVERLAY_MIN_MS = 1400;
const OVERLAY_MAX_MS = 12000;
const overlaySeenKeys = new Set<string>();

function prefersReducedMotion() {
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
  );
}

type HomeSchedule = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  coverUrl?: string | null;
  startsAt: string;
  highlighted: boolean;
  venue?: {
    id: string;
    posterDisplayName: string;
    city: string;
    countryName: string;
  } | null;
};

type HomeSchedulesPayload = {
  today: HomeSchedule[];
  featured: HomeSchedule[];
  comeback: HomeSchedule[];
  tourSpotlight: HomeSchedule | null;
  tourSpotlightCycleTitle: string | null;
};

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

function fmtMonthDay(iso: string) {
  const d = new Date(iso);
  const month = d
    .toLocaleString("zh-CN", { month: "numeric" })
    .replace(/\D/g, "");
  const day = d.toLocaleString("zh-CN", { day: "2-digit" });
  return { month: month || String(d.getMonth() + 1), day };
}

function diffDays(fromIso: string) {
  const t = new Date(fromIso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.max(0, Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24)));
}

function buildTicketFromSchedule(pick: HomeSchedule): TicketView {
  const { month, day } = fmtMonthDay(pick.startsAt);
  const venueLine = pick.venue?.posterDisplayName
    ? pick.venue.posterDisplayName
    : pick.location ?? "";
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

function collectUpcomingTicket(
  data: HomeSchedulesPayload | null,
): TicketView | null {
  const candidates: HomeSchedule[] = [];
  if (data?.tourSpotlight) candidates.push(data.tourSpotlight);
  candidates.push(...(data?.featured ?? []));
  candidates.push(...(data?.today ?? []));
  candidates.push(...(data?.comeback ?? []));
  const seen = new Set<string>();
  const now = Date.now();
  const upcoming = candidates
    .filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return new Date(s.startsAt).getTime() >= now;
    })
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
  if (!upcoming.length) return null;
  return buildTicketFromSchedule(upcoming[0]);
}

function ExhibitImageScroller({
  images,
}: {
  images: { src: string; alt: string }[];
}) {
  const loop = [...images, ...images];
  return (
    <div className="exhibit-strip" id="exhibit-strip" aria-label="Season stills">
      <p className="exhibit-section__eyebrow">Exhibit</p>
      <div className="xkm-imageScroller exhibit-strip__scroller">
        <div className="xkm-imageScroller__viewport">
          <div className="xkm-imageScroller__track">
            {loop.map((image, index) => (
              <img
                key={`${image.src}-${index}`}
                className="xkm-imageScroller__img exhibit-strip__img"
                src={image.src}
                alt={index < images.length ? image.alt : ""}
                aria-hidden={index >= images.length ? true : undefined}
                loading={index < 4 ? "eager" : "lazy"}
                decoding="async"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function useExhibitOverlay(deps: unknown[]) {
  const cached = overlaySeenKeys.has(OVERLAY_KEY);
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<OverlayPhase>(cached ? "hidden" : "visible");
  const dismissed = useRef(cached);

  useEffect(() => {
    if (dismissed.current) return;
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let pending = 0;
    let mediaReady = false;
    let minReady = false;

    const finish = () => {
      if (cancelled || dismissed.current) return;
      dismissed.current = true;
      overlaySeenKeys.add(OVERLAY_KEY);
      setPhase("fading");
    };

    const tryFinish = () => {
      if (mediaReady && minReady) finish();
    };

    const markLoaded = () => {
      pending -= 1;
      if (!cancelled && pending <= 0) {
        mediaReady = true;
        tryFinish();
      }
    };

    root.querySelectorAll("img").forEach((node) => {
      if (node.complete) return;
      pending += 1;
      const onDone = () => {
        node.removeEventListener("load", onDone);
        node.removeEventListener("error", onDone);
        markLoaded();
      };
      node.addEventListener("load", onDone);
      node.addEventListener("error", onDone);
    });

    if (pending <= 0) mediaReady = true;

    const minTimer = window.setTimeout(() => {
      minReady = true;
      tryFinish();
    }, OVERLAY_MIN_MS);
    const maxTimer = window.setTimeout(finish, OVERLAY_MAX_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const onTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "opacity" || phase !== "fading") return;
    setPhase("hidden");
  };

  return { rootRef, phase, onTransitionEnd };
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

export default function NewNewExhibitHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [data, setData] = useState<HomeSchedulesPayload | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [refractionReady, setRefractionReady] = useState(false);
  const onRefractionReady = useCallback(() => setRefractionReady(true), []);

  const spotlightTicket = useMemo(
    () => collectUpcomingTicket(data),
    [data],
  );

  const scheduleStatus = useMemo(() => {
    if (scheduleLoading) return "同步行程…";
    if (spotlightTicket?.daysLeft != null) {
      return `${spotlightTicket.daysLeft} 天后`;
    }
    return "敬请期待";
  }, [scheduleLoading, spotlightTicket]);

  const { rootRef, phase, onTransitionEnd } = useExhibitOverlay([
    refractionReady,
    galleryImages.length,
    scheduleLoading,
  ]);

  useEffect(() => {
    document.title = "ITZY · Midzy";
    let cancelled = false;
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
      } catch {
        if (!cancelled) {
          setData({
            today: [],
            featured: [],
            comeback: [],
            tourSpotlight: null,
            tourSpotlightCycleTitle: null,
          });
        }
      } finally {
        if (!cancelled) setScheduleLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const prevRestoration = history.scrollRestoration;
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const root = rootRef.current;
    const newnewScroll = root ? setupNewnewHomeScroll(root) : null;

    const onNativeScroll = () => newnewScroll?.onScroll();

    if (prefersReducedMotion()) {
      window.addEventListener("scroll", onNativeScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onNativeScroll);
        newnewScroll?.cleanup();
        if ("scrollRestoration" in history) {
          history.scrollRestoration = prevRestoration;
        }
      };
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });
    lenis.scrollTo(0, { immediate: true });

    const onLenisScroll = () => {
      onNativeScroll();
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
  }, [rootRef]);

  return (
    <div
      className="xkm xkm--new-home newnew-exhibit"
      ref={rootRef}
    >
      {phase !== "hidden" ? (
        <div
          className={`xkm-loadingOverlay${
            phase === "fading" ? " xkm-loadingOverlay--fade" : ""
          }`}
          aria-hidden={phase === "fading"}
          onTransitionEnd={onTransitionEnd}
        >
          <p className="xkm-loadingOverlay__text">{LOADING_COPY}</p>
        </div>
      ) : null}

      <header className="xkm-fixed exhibit-hero" aria-label="Hero">
        <p className="exhibit-hero__caption">Midzy fan space</p>
        <div className="xkm-media xkm-media--fall exhibit-hero__media">
          <div className="xkm-media__refraction exhibit-hero__refraction">
            <NewHomeRefractionCanvas onReady={onRefractionReady} />
          </div>
        </div>
      </header>

      <div className="xkm-scroll" aria-label="Content">
        <nav
          className={`xkm-coverNav xkm-coverNav--withHome exhibit-nav${
            menuOpen ? " xkm-coverNav--menu-hidden" : ""
          }`}
          aria-label="Primary"
          aria-hidden={menuOpen}
        >
          <Link
            to="/"
            className="xkm-coverNav__home"
            aria-label="ITZY home"
            onClick={() => {
              if (stripBase(window.location.pathname) === "/") {
                window.scrollTo(0, 0);
              }
            }}
          >
            <img src={itzyLogoPng} alt="" width={64} height={20} decoding="async" />
          </Link>
          <div className="exhibit-nav__caption">
            <span className="exhibit-nav__captionText">{SEASON_CAPTION}</span>
          </div>
          <div className="exhibit-nav__actions">
            <button
              type="button"
              className="exhibit-nav__jump"
              onClick={() => scrollToId("exhibit-strip")}
            >
              Exhibit
            </button>
            <button
              type="button"
              className="exhibit-nav__jump"
              onClick={() => scrollToId("exhibit-tools")}
            >
              Tools
            </button>
            <button
              type="button"
              className={`xkm-coverNav__cell xkm-coverNav__cell--menu exhibit-nav__menu${
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
            </button>
          </div>
        </nav>

        <div
          className={`xkm-menuPanel${menuOpen ? " xkm-menuPanel--open" : ""}`}
          aria-hidden={!menuOpen}
        >
          <div className="xkm-menuPanel__navMirror">
            <button
              type="button"
              className="xkm-menuClose"
              aria-label="关闭菜单"
              onClick={() => setMenuOpen(false)}
            >
              <span className="xkm-menuClose__icon" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>
          <Link to="/" className="xkm-menuLink" onClick={() => setMenuOpen(false)}>
            首页<span className="xkm-menuLink__en">Home</span>
          </Link>
          <Link to="/setlist" className="xkm-menuLink" onClick={() => setMenuOpen(false)}>
            应援法<span className="xkm-menuLink__en">Fanchant</span>
          </Link>
          <Link to="/dolls" className="xkm-menuLink" onClick={() => setMenuOpen(false)}>
            娃娃图鉴<span className="xkm-menuLink__en">Doll Guide</span>
          </Link>
          <Link to="/schedules" className="xkm-menuLink" onClick={() => setMenuOpen(false)}>
            演唱会行程<span className="xkm-menuLink__en">Tour Dates</span>
          </Link>
        </div>

        <div className="xkm-section-container exhibit-body">
          {galleryImages.length > 0 ? (
            <ExhibitImageScroller images={galleryImages} />
          ) : null}

          <section className="exhibit-section" aria-labelledby="exhibit-season-title">
            <h2 id="exhibit-season-title" className="exhibit-section__title">
              This season
            </h2>
            <p className="exhibit-section__lead">
              当季展台：行程与应援优先，其余工具在下方展格中。
            </p>
            <div className="exhibit-season__grid">
              <div className="exhibit-season__schedule">
                {spotlightTicket ? (
                  <NewNewArtworkTicket
                    ticket={spotlightTicket}
                    cycleTitle={data?.tourSpotlightCycleTitle}
                    tone="blue"
                  />
                ) : (
                  <Link to="/schedules" className="exhibit-schedule-placeholder">
                    <span className="exhibit-schedule-placeholder__tag">Tool · Schedule</span>
                    <strong>下一场行程公布在即</strong>
                    <span>查看全部巡演日期 →</span>
                  </Link>
                )}
              </div>
              <ExhibitTile
                to="/setlist"
                tags={["Tool", "Fanchant"]}
                title="Tunnel Vision"
                subtitle="三巡歌单 · 应援法"
                status="Updated"
                tone="rose"
                visual={
                  <img
                    src={screamFigureGif}
                    alt=""
                    className="exhibit-tile__img"
                    loading="lazy"
                    decoding="async"
                  />
                }
              />
            </div>
          </section>

          <section
            className="exhibit-section"
            id="exhibit-tools"
            aria-labelledby="exhibit-tools-title"
          >
            <h2 id="exhibit-tools-title" className="exhibit-section__title">
              Midzy tools
            </h2>
            <p className="exhibit-section__lead">
              同一套展签语法：点格进入功能，不离开展览动线。
            </p>
            <div className="exhibit-tools__grid">
              <ExhibitTile
                to="/schedules"
                tags={["Tool", "Schedule"]}
                title="Tour dates"
                subtitle="演唱会行程"
                status={scheduleStatus}
                tone="sky"
                visual={
                  <img
                    src={tourPosterWebp}
                    alt=""
                    className="exhibit-tile__img exhibit-tile__img--poster"
                    loading="lazy"
                  />
                }
              />
              <ExhibitTile
                to="/dolls"
                tags={["Tool", "Guide"]}
                title="Twinzy dolls"
                subtitle="娃娃图鉴"
                tone="ink"
                visual={
                  <img
                    src={dollGif}
                    alt=""
                    className="exhibit-tile__img"
                    loading="lazy"
                  />
                }
              />
              <ExhibitTile
                to="/gallery"
                tags={["Archive", "Video"]}
                title="Variety"
                subtitle="综艺合集 · DaDa"
                tone="paper"
                visual={<span className="exhibit-tile__glyph" aria-hidden="true">◉</span>}
              />
              <ExhibitTile
                to="/poster"
                tags={["Play", "Ticket"]}
                title="Fan ticket"
                subtitle="自制票根海报"
                tone="paper"
                visual={<span className="exhibit-tile__glyph exhibit-tile__glyph--ticket" aria-hidden="true">▤</span>}
              />
              <ExhibitTile
                to="/game"
                tags={["Play", "Game"]}
                title="Midzy game"
                subtitle="小游戏"
                tone="paper"
                visual={<span className="exhibit-tile__glyph" aria-hidden="true">✦</span>}
              />
              <ExhibitTile
                to="/setlist"
                tags={["Tool", "Setlist"]}
                title="Setlist"
                subtitle="巡演曲目"
                tone="rose"
                visual={<span className="exhibit-tile__glyph" aria-hidden="true">♪</span>}
              />
            </div>
          </section>

          <blockquote className="exhibit-quote">
            <p>하나가 돼 ’cause you are my motto</p>
            <footer>ITZY · all in us</footer>
          </blockquote>

          <div className="exhibit-footer">
            <div className="xkm-contactRow" aria-label="Social">
              <a
                className="exhibit-footer__link"
                href="https://www.youtube.com/channel/UCDhM2k2Cua-JdobAh5moMFg"
                target="_blank"
                rel="noreferrer"
              >
                YouTube
              </a>
              <a
                className="exhibit-footer__link"
                href="https://www.instagram.com/itzy.all.in.us/"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
              <a
                className="exhibit-footer__link"
                href="https://x.com/ITZYofficial"
                target="_blank"
                rel="noreferrer"
              >
                X
              </a>
            </div>
            <footer className="exhibit-footer__meta">
              <span>2026</span>
              <span>website by vte</span>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
