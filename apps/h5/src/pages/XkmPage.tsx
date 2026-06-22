import { useEffect, useMemo, useRef, useState, type CSSProperties, type TransitionEvent } from "react";
import { Link } from "react-router-dom";
import Lenis from "lenis";
import { request, resolveMediaUrl } from "@/services/request";
import mottoMp4 from "@/assets/motto.mp4";
import itzyPng from "@/assets/itzy-w.png";
import tourPosterWebp from "@/assets/tour-poster.webp";
import "./XkmPage.css";
import "./XkmPage.pc.css";

const galleryImages = Object.entries(
  import.meta.glob<string>("@/assets/*.{jpg,jpeg}", {
    eager: true,
    import: "default",
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, src]) => ({
    src,
    alt: path.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "image",
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

  const showCursor = active && !reducedMotion && text.length < LOADING_OVERLAY_COPY.length;

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

function useXkmMediaOverlay(deps: unknown[]) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<OverlayPhase>("visible");
  const hasDismissedRef = useRef(false);

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
  };
}

function collectTicketSchedules(data: HomeSchedulesPayload | null): HomeSchedule[] {
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

function XkmTicketCard({
  ticket,
  variant,
}: {
  ticket: TicketView;
  variant: TicketVariant;
}) {
  const rootClass = variant === "hybrid" ? "xkm-hybrid-ticket" : "xkm-flat-ticket";

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

const INFO_MARQUEE_TEXT = "MIDZY · ITZY · MIDZY · ITZY";

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
    <div className="xkm-coverNav__cell xkm-coverNav__cell--marquee" aria-label="Information">
      <div className="xkm-infoMarquee__viewport" role="marquee" aria-label="Information ticker">
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

export default function XkmPage() {
  const [data, setData] = useState<HomeSchedulesPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

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

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.35,
      easing: (t: number) => 1 - Math.pow(1 - t, 3.25),
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.1,
    });

    let raf = 0;
    const tick = (ms: number) => {
      lenis.raf(ms);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  const tickets = useMemo(() => {
    const schedules = collectTicketSchedules(data);
    if (!schedules.length) return [];
    const primary = buildTicketFromSchedule(schedules[0]);
    return [
      // { ticket: primary, variant: "hybrid" as const },
      { ticket: primary, variant: "flat" as const },
    ];
  }, [data]);

  const { rootRef, phase: overlayPhase, onOverlayTransitionEnd } = useXkmMediaOverlay([
    loading,
    tickets.length,
    galleryImages.length,
  ]);

  return (
    <div className="xkm" ref={rootRef}>
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
        <div className="xkm-media" aria-label="Hero reel">
          <video
            className="xkm-media__video"
            src={mottoMp4}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
      </header>

      <div className="xkm-scroll" aria-label="Scrollable content layer">
        <nav className="xkm-coverNav" aria-label="Site navigation">
          <InfoMarquee />
          <button type="button" className="xkm-coverNav__cell xkm-coverNav__cell--motto">
            MOTTO
          </button>
        </nav>

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
                {tickets.map((item, index) => (
                  <XkmTicketCard
                    key={`${item.ticket.title}-${index}`}
                    ticket={item.ticket}
                    variant={item.variant}
                  />
                ))}
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

              <div className="xkm-projectsPanel">
                <p className="xkm-projectsPanel__text text-alpha">
                  <p className="xkm-projectsPanel__line">
                      WE BELIEVE IN ITZY. CAUSE WE ARE MIDZY. 
                  </p>
                 {/* <span className="xkm-projectsPanel__line">
                    WE BELIEVE IN ITZY
                  </span> */}
                   {/* <span className="xkm-projectsPanel__line">WRITE US AN EMAIL</span> */}
                </p>
              </div>

              <div className="xkm-btnBlock__bottom">
                <div className="xkm-contactRow" aria-label="Contact">
                  <a className="xkm-contactBtn" 
                    href="https://itzy.jype.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    FANS
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
