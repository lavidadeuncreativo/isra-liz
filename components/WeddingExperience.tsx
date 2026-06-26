"use client";

import Image from "next/image";
import { Fragment, FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { WeddingData } from "@/data/wedding";

type Props = { data: WeddingData };
type SubmitState = "idle" | "loading" | "success" | "error";
type GiftModalMode = "info" | "contribution" | null;

const QUICK_LINKS = [
  { href: "#historia", label: "Historia" },
  { href: "#detalles", label: "Detalles" },
  { href: "#rsvp", label: "RSVP" },
  { href: "#regalos", label: "Regalos" },
  { href: "#faq", label: "FAQ" },
] as const;

function WordPieces({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);

  return (
    <>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="reveal-word" aria-hidden="true">{word}</span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

function Words({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      <WordPieces text={text} />
    </span>
  );
}

function LineWords({ lines, className = "" }: { lines: readonly string[]; className?: string }) {
  return (
    <span className={className} aria-label={lines.join(" ")}>
      {lines.map((line, index) => (
        <span className="title-line" key={`${line}-${index}`} aria-hidden="true">
          <WordPieces text={line} />
        </span>
      ))}
    </span>
  );
}

function CoupleWordmark({
  first,
  second,
  className = "",
}: {
  first: string;
  second: string;
  className?: string;
}) {
  return (
    <span className={`couple-wordmark ${className}`.trim()} aria-label={`${first}&${second}`}>
      <span className="reveal-word" aria-hidden="true">{first}</span>
      <span className="reveal-word ampersand" aria-hidden="true">&</span>
      <span className="reveal-word" aria-hidden="true">{second}</span>
    </span>
  );
}

function isPlaceholderText(value: string) {
  return /nombre del|nombre de la|proximamente|por confirmar|pendiente/i.test(value);
}

function getVisibleNames(names: readonly string[]) {
  return names.filter((name) => !isPlaceholderText(name));
}

function addMonthsClamped(baseDate: Date, months: number) {
  const nextDate = new Date(baseDate);
  const originalDay = nextDate.getDate();

  nextDate.setMonth(nextDate.getMonth() + months, 1);
  const lastDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
  nextDate.setDate(Math.min(originalDay, lastDay));

  return nextDate;
}

function formatUnit(value: number) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function getCountdown(targetIso: string, nowMs: number) {
  const targetDate = new Date(targetIso);
  const nowDate = new Date(nowMs);

  if (Number.isNaN(targetDate.getTime())) {
    return {
      done: false,
      units: [
        { label: "Meses", value: "00" },
        { label: "Dias", value: "00" },
        { label: "Horas", value: "00" },
        { label: "Min", value: "00" },
        { label: "Seg", value: "00" },
      ],
    };
  }

  if (targetDate.getTime() <= nowMs) {
    return {
      done: true,
      units: [
        { label: "Meses", value: "00" },
        { label: "Dias", value: "00" },
        { label: "Horas", value: "00" },
        { label: "Min", value: "00" },
        { label: "Seg", value: "00" },
      ],
    };
  }

  let months = (targetDate.getFullYear() - nowDate.getFullYear()) * 12 + (targetDate.getMonth() - nowDate.getMonth());
  let cursor = addMonthsClamped(nowDate, months);
  if (cursor.getTime() > targetDate.getTime()) {
    months -= 1;
    cursor = addMonthsClamped(nowDate, months);
  }

  let remaining = targetDate.getTime() - cursor.getTime();
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  remaining -= days * 1000 * 60 * 60 * 24;

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  remaining -= hours * 1000 * 60 * 60;

  const minutes = Math.floor(remaining / (1000 * 60));
  remaining -= minutes * 1000 * 60;

  const seconds = Math.floor(remaining / 1000);

  return {
    done: false,
    units: [
      { label: "Meses", value: formatUnit(months) },
      { label: "Dias", value: formatUnit(days) },
      { label: "Horas", value: formatUnit(hours) },
      { label: "Min", value: formatUnit(minutes) },
      { label: "Seg", value: formatUnit(seconds) },
    ],
  };
}

function StoryScene({
  id,
  kicker,
  title,
  body,
  image,
  alt,
  index,
}: {
  id?: string;
  kicker: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  index: number;
}) {
  return (
    <section id={id} className={`story-scene story-scene-${index + 1}`} data-story-scene data-scene-index={index}>
      <div className="scene-stage">
        <div className="scene-layout">
          <div className="scene-copy">
            <p className="kicker reveal-support">{kicker}</p>
            <h2 className="display-title">
              <Words text={title} />
            </h2>
            <p className="story-body">
              <Words text={body} className="body-words" />
            </p>
          </div>
          <figure className="story-photo reveal-media">
            <Image src={image} alt={alt} fill sizes="(max-width: 820px) 82vw, 38vw" />
          </figure>
        </div>
      </div>
    </section>
  );
}

type ScrubRevealOptions = {
  end?: string;
  hold?: number;
  fromBlur?: number;
  fromScale?: number;
  fromY?: number;
  fromRotateX?: number;
  fromSkewY?: number;
  outBlur?: number;
  outOpacity?: number;
  outScale?: number;
  outY?: number;
  stagger?: number;
};

export default function WeddingExperience({ data }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [entered, setEntered] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [attendance, setAttendance] = useState("");
  const [giftModal, setGiftModal] = useState<GiftModalMode>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [giftState, setGiftState] = useState<SubmitState>("idle");
  const [giftMessage, setGiftMessage] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [giftAmount, setGiftAmount] = useState<number>(data.gifting.amounts[1] ?? data.gifting.amounts[0] ?? 500);

  useEffect(() => {
    document.documentElement.classList.toggle("page-locked", !entered || giftModal !== null);
    document.body.classList.toggle("page-locked", !entered || giftModal !== null);

    return () => {
      document.documentElement.classList.remove("page-locked");
      document.body.classList.remove("page-locked");
    };
  }, [entered, giftModal]);

  useEffect(() => {
    if (!entered) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [entered]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !entered) return;

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      const clearMotion = () => {
        gsap.set(
          [
            ".reveal-word",
            ".reveal-support",
            ".reveal-media",
            "[data-reveal-item]",
          ],
          {
            clearProps: "all",
            opacity: 1,
            filter: "none",
            transform: "none",
          },
        );
      };

      const createScrubReveal = (trigger: HTMLElement, targets: Iterable<HTMLElement>, options: ScrubRevealOptions = {}) => {
        const nodes = Array.from(targets).filter(Boolean);
        if (!nodes.length) return;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger,
            start: "top 84%",
            end: options.end ?? "bottom 18%",
            scrub: 0.95,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .fromTo(
            nodes,
            {
              opacity: 0,
              filter: `blur(${options.fromBlur ?? 18}px)`,
              y: options.fromY ?? 42,
              scale: options.fromScale ?? 0.975,
              rotateX: options.fromRotateX ?? 58,
              skewY: options.fromSkewY ?? 1.5,
              transformOrigin: "50% 100%",
            },
            {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              scale: 1,
              rotateX: 0,
              skewY: 0,
              duration: 0.34,
              stagger: options.stagger ?? 0.06,
              ease: "none",
            },
            0,
          )
          .to({}, { duration: options.hold ?? 0.22 })
          .to(
            nodes,
            {
              opacity: options.outOpacity ?? 0.1,
              filter: `blur(${options.outBlur ?? 18}px)`,
              y: options.outY ?? -24,
              scale: options.outScale ?? 0.985,
              duration: 0.28,
              stagger: 0.035,
              ease: "none",
            },
            0.72,
          );
      };

      mm.add(
        {
          desktop: "(min-width: 821px)",
          mobile: "(max-width: 820px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const conditions = context.conditions as {
            desktop?: boolean;
            mobile?: boolean;
            reduce?: boolean;
          };

          if (conditions.reduce) {
            clearMotion();
            return;
          }

          const intro = root.querySelector<HTMLElement>("[data-intro-scene]");
          const introWords = intro ? Array.from(intro.querySelectorAll<HTMLElement>(".reveal-word")) : [];
          const introSupport = intro ? Array.from(intro.querySelectorAll<HTMLElement>(".reveal-support")) : [];
          const headLiz = intro?.querySelector<HTMLElement>("[data-head-liz]");
          const headIsra = intro?.querySelector<HTMLElement>("[data-head-isra]");
          const heart = intro?.querySelector<HTMLElement>("[data-heart]");

          if (intro && introWords.length && headLiz && headIsra && heart) {
            const introTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: intro,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.95,
                invalidateOnRefresh: true,
              },
            });

            introTimeline
              .fromTo(
                introSupport,
                { opacity: 0, filter: "blur(16px)", y: 22 },
                { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.16, stagger: 0.05, ease: "none" },
                0,
              )
              .fromTo(
                introWords,
                {
                  opacity: 0,
                  filter: "blur(24px)",
                  y: 70,
                  rotateX: 78,
                  skewY: 2,
                  transformOrigin: "50% 100%",
                },
                {
                  opacity: 1,
                  filter: "blur(0px)",
                  y: 0,
                  rotateX: 0,
                  skewY: 0,
                  duration: 0.34,
                  stagger: 0.02,
                  ease: "none",
                },
                0.04,
              )
              .fromTo(
                [headLiz, headIsra],
                { opacity: 0, filter: "blur(18px)", y: 54, scale: 0.84 },
                { opacity: 1, filter: "blur(0px)", y: 0, scale: 1, duration: 0.22, stagger: 0.06, ease: "none" },
                0.14,
              )
              .fromTo(
                heart,
                { opacity: 0, filter: "blur(14px)", y: 18, scale: 0.72 },
                { opacity: 1, filter: "blur(0px)", y: 0, scale: 1, duration: 0.16, ease: "none" },
                0.2,
              )
              .to(headLiz, { x: conditions.mobile ? -8 : -26, y: conditions.mobile ? -8 : -12, rotation: -5, duration: 0.22, ease: "none" }, 0.48)
              .to(headIsra, { x: conditions.mobile ? 8 : 26, y: conditions.mobile ? -8 : -12, rotation: 5, duration: 0.22, ease: "none" }, 0.48)
              .to(heart, { y: -10, scale: 1.05, duration: 0.16, ease: "none" }, 0.54)
              .to(
                [introWords, introSupport, headLiz, headIsra, heart],
                {
                  opacity: 0.08,
                  filter: "blur(18px)",
                  y: -36,
                  duration: 0.28,
                  stagger: 0.005,
                  ease: "none",
                },
                0.78,
              );
          }

          gsap.utils.toArray<HTMLElement>("[data-story-scene]").forEach((scene) => {
            const words = scene.querySelectorAll<HTMLElement>(".reveal-word");
            const support = scene.querySelectorAll<HTMLElement>(".reveal-support");
            const media = scene.querySelectorAll<HTMLElement>(".reveal-media");
            const index = Number(scene.dataset.sceneIndex || 0);

            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: scene,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.95,
                invalidateOnRefresh: true,
              },
            });

            timeline
              .fromTo(
                support,
                { opacity: 0, filter: "blur(14px)", y: 20 },
                { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.16, stagger: 0.04, ease: "none" },
                0,
              )
              .fromTo(
                words,
                { opacity: 0, filter: "blur(24px)", y: 68, rotateX: 74, skewY: 1.8, transformOrigin: "50% 100%" },
                { opacity: 1, filter: "blur(0px)", y: 0, rotateX: 0, skewY: 0, duration: 0.32, stagger: 0.014, ease: "none" },
                0.04,
              )
              .fromTo(
                media,
                { opacity: 0, filter: "blur(18px)", y: 36, scale: 0.94, rotation: index % 2 ? 3 : -3 },
                { opacity: 1, filter: "blur(0px)", y: 0, scale: 1, rotation: index % 2 ? 1 : -1, duration: 0.26, ease: "none" },
                0.12,
              )
              .to({}, { duration: 0.18 })
              .to(words, { opacity: 0.08, filter: "blur(18px)", y: -34, duration: 0.22, stagger: 0.006, ease: "none" }, 0.74)
              .to(support, { opacity: 0.1, filter: "blur(14px)", y: -18, duration: 0.16, ease: "none" }, 0.76)
              .to(media, { opacity: 0.08, filter: "blur(18px)", y: -20, scale: 0.975, duration: 0.2, ease: "none" }, 0.74);
          });

          gsap.utils.toArray<HTMLElement>("[data-reveal-section]").forEach((section) => {
            const children = section.querySelectorAll<HTMLElement>("[data-reveal-item]");
            createScrubReveal(section, children);
          });

          ScrollTrigger.refresh();
        },
      );
    }, root);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, [entered]);

  function enter(withAudio: boolean) {
    setEntered(true);
    document.documentElement.classList.remove("page-locked");
    document.body.classList.remove("page-locked");

    if (withAudio && audioRef.current) {
      setAudioEnabled(true);
      void audioRef.current.play().catch(() => setAudioEnabled(false));
    }
  }

  async function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setAudioEnabled(true);
      } catch {
        setAudioEnabled(false);
      }
    } else {
      audio.pause();
      setAudioEnabled(false);
    }
  }

  async function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("loading");
    setSubmitMessage("");

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || "No pudimos enviar tu confirmacion.");
      form.reset();
      setAttendance("");
      setSubmitState("success");
      setSubmitMessage(result.message || "Tu confirmacion quedo registrada. Gracias.");
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(error instanceof Error ? error.message : "Ocurrio un error. Intenta nuevamente.");
    }
  }

  async function submitGift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGiftState("loading");
    setGiftMessage("");

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || "No pudimos registrar tu detalle.");
      form.reset();
      setGiftState("success");
      setGiftMessage(result.message || data.gifting.contributionSuccess);
    } catch (error) {
      setGiftState("error");
      setGiftMessage(error instanceof Error ? error.message : "Ocurrio un error. Intenta nuevamente.");
    }
  }

  const countdown = getCountdown(data.date.countdownIso, now);
  const lizParents = getVisibleNames(data.parents.liz);
  const israParents = getVisibleNames(data.parents.israel);
  const isNotAttending = attendance === "No podre asistir";
  const hasMap = Boolean(data.venue.mapUrl);

  const registryLinks = data.gifting.registries.map((registry) => {
    if (registry.label === "Palacio de Hierro") {
      return {
        ...registry,
        href: process.env.NEXT_PUBLIC_PALACIO_GIFT_LINK?.trim() || registry.href,
      };
    }

    if (registry.label === "Amazon") {
      return {
        ...registry,
        href: process.env.NEXT_PUBLIC_AMAZON_GIFT_LINK?.trim() || registry.href,
      };
    }

    return registry;
  });

  return (
    <main ref={rootRef} className={`wedding-site ${entered ? "entered" : ""}`}>
      <audio ref={audioRef} src={data.audio.src} preload="metadata" onEnded={() => setAudioEnabled(false)} />

      <div className={`entry-screen ${entered ? "is-hidden" : ""}`} role="dialog" aria-modal="true" aria-label="Abrir invitacion">
        <div className="paper-noise" aria-hidden="true" />
        <div className="entry-content">
          <p className="eyebrow">Tenemos algo que contarte</p>
          <h1>
            <span>{data.couple.partnerOne}</span>
            <em>&</em>
            <span>{data.couple.partnerTwo}</span>
          </h1>
          <p className="entry-date">{data.date.short}</p>
          <div className="entry-actions">
            <button type="button" className="button button-primary" onClick={() => enter(true)}>Entrar con audio</button>
            <button type="button" className="button button-secondary" onClick={() => enter(false)}>Continuar sin audio</button>
          </div>
          <p className="entry-note">{data.intro.entryNote}</p>
        </div>
      </div>

      {entered && (
        <button type="button" className="audio-control" onClick={toggleAudio} aria-pressed={audioEnabled}>
          <span className="audio-dot">{audioEnabled ? "II" : ">"}</span>
          <span>{audioEnabled ? "Pausar historia" : "Escuchar historia"}</span>
        </button>
      )}

      {entered && (
        <nav className="quick-nav" aria-label="Atajos de la invitacion">
          {QUICK_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      )}

      <section className="intro-scene" data-intro-scene>
        <div className="scene-stage intro-stage">
          <div className="paper-noise" aria-hidden="true" />
          <div className="intro-shell">
            <div className="intro-copy">
              <p className="kicker reveal-support">{data.intro.kicker}</p>
              <h2 className="intro-title">
                <LineWords lines={data.intro.titleLines} />
              </h2>
              <p className="intro-lead reveal-support">{data.intro.body}</p>
            </div>

            <div className="intro-portraits">
              <figure className="intro-portrait intro-portrait-liz" data-head-liz>
                <div className="intro-portrait-art">
                  <span className="portrait-halo" aria-hidden="true" />
                  <Image
                    src="/images/hero-liz.png"
                    alt="Liz de nina"
                    fill
                    sizes="(max-width: 820px) 34vw, 250px"
                    priority
                    className="cutout-image"
                  />
                </div>
                <figcaption>Liz</figcaption>
              </figure>

              <div className="intro-heart-cluster" data-heart>
                <div className="heart-shape" aria-hidden="true"><span /></div>
                <small>{data.date.short}</small>
              </div>

              <figure className="intro-portrait intro-portrait-isra" data-head-isra>
                <div className="intro-portrait-art">
                  <span className="portrait-halo" aria-hidden="true" />
                  <Image
                    src="/images/hero-israel.png"
                    alt="Isra de nino"
                    fill
                    sizes="(max-width: 820px) 34vw, 250px"
                    priority
                    className="cutout-image"
                  />
                </div>
                <figcaption>Isra</figcaption>
              </figure>
            </div>

            <p className="intro-instruction reveal-support">{data.intro.instruction}</p>
          </div>
        </div>
      </section>

      {data.story.map((item, index) => (
        <StoryScene
          key={item.title}
          id={index === 0 ? "historia" : undefined}
          {...item}
          index={index}
        />
      ))}

      <section className="reveal-scene story-scene" data-story-scene data-scene-index={data.story.length}>
        <div className="scene-stage reveal-stage">
          <p className="reveal-small reveal-support">{data.announcement.kicker}</p>
          <h2 className="reveal-title"><Words text={data.announcement.title} /></h2>
          <p className="story-body"><Words text={data.announcement.body} /></p>
        </div>
      </section>

      <section className="invite-scene story-scene" data-story-scene data-scene-index={data.story.length + 1}>
        <div className="scene-stage invite-stage">
          <p className="kicker reveal-support">Guarda la fecha</p>
          <h2 className="couple-title"><CoupleWordmark first={data.couple.partnerOne} second={data.couple.partnerTwo} /></h2>
          <p className="invite-date reveal-support">{data.date.display}</p>
          <p className="invite-place reveal-support">{data.venue.name} · {data.venue.city}</p>

          <div className="countdown-panel reveal-support" data-reveal-item>
            <span className="countdown-kicker">{countdown.done ? "Hoy celebramos" : "Cuenta regresiva"}</span>
            <div className="countdown-grid">
              {countdown.units.map((unit) => (
                <div className="countdown-unit" key={unit.label}>
                  <strong>{unit.value}</strong>
                  <small>{unit.label}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="invite-actions reveal-support">
            <a className="button button-primary" href="#detalles">Ver itinerario</a>
            <a className="button button-secondary" href="#rsvp">Confirmar asistencia</a>
            {hasMap ? (
              <a className="button button-secondary" href={data.venue.mapUrl} target="_blank" rel="noreferrer">
                Abrir ubicacion
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="content-section family-section" data-reveal-section>
        <div className="section-heading" data-reveal-item>
          <p className="eyebrow">Con la alegria de nuestras familias</p>
          <h2>Nos acompanan en este dia.</h2>
        </div>
        <div className="family-grid">
          <article className="family-card" data-reveal-item>
            <span>Familia de Liz</span>
            {lizParents.length ? (
              lizParents.map((name) => <h3 key={name}>{name}</h3>)
            ) : (
              <p className="family-placeholder">Muy pronto compartiremos los nombres que nos acompanaran en este momento tan especial.</p>
            )}
          </article>
          <article className="family-card" data-reveal-item>
            <span>Familia de Isra</span>
            {israParents.length ? (
              israParents.map((name) => <h3 key={name}>{name}</h3>)
            ) : (
              <p className="family-placeholder">Muy pronto compartiremos los nombres que nos acompanaran en este momento tan especial.</p>
            )}
          </article>
        </div>
      </section>

      <section id="galeria" className="content-section gallery-section" data-reveal-section>
        <div className="section-heading" data-reveal-item>
          <p className="eyebrow">Lo que hemos vivido</p>
          <h2>Una historia hecha de muchos momentos.</h2>
          <p>Un recorrido de recuerdos que sigue avanzando, igual que nosotros.</p>
        </div>
        <div className="gallery-marquee" data-reveal-item>
          <div className="gallery-track">
            {[...data.gallery, ...data.gallery].map((item, index) => (
              <figure className="gallery-slide" key={`${item.src}-${index}`} aria-hidden={index >= data.gallery.length}>
                <div className="gallery-image">
                  <Image src={item.src} alt={item.alt} fill sizes="(max-width: 820px) 72vw, 360px" />
                </div>
                <figcaption>{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="detalles" className="content-section details-section" data-reveal-section>
        <div className="section-heading" data-reveal-item>
          <p className="eyebrow">Asi se vivira el dia</p>
          <h2>Itinerario</h2>
          <p>Todo lo importante, en un vistazo para que te sea facil ubicarte.</p>
        </div>
        <div className="details-grid details-grid-compact">
          {data.essentials.map((item) => (
            <article className="detail-card" data-reveal-item key={item.label}>
              <small>{item.label}</small>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              {"href" in item && item.href ? (
                <a href={item.href} target="_blank" rel="noreferrer">{"actionLabel" in item && item.actionLabel ? item.actionLabel : "Abrir"}</a>
              ) : null}
            </article>
          ))}
        </div>
        <div className="schedule" data-reveal-item>
          {data.schedule.map((item) => (
            <div className="schedule-row" key={`${item.time}-${item.title}`}>
              <time>{item.time}</time>
              <div>
                <h3>{item.title}</h3>
                <p>{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="rsvp" className="content-section rsvp-section" data-reveal-section>
        <div className="section-heading" data-reveal-item>
          <p className="eyebrow">Confirma tu asistencia</p>
          <h2>Queremos contar contigo.</h2>
          <p>Nos ayudara muchisimo que respondas con tiempo para organizar cada detalle con carino.</p>
        </div>
        <form className="rsvp-form" onSubmit={submitRsvp} data-reveal-item>
          <input className="honeypot" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <label>Nombre completo<input name="name" required maxLength={120} /></label>
          <fieldset>
            <legend>¿Podras acompanarnos?</legend>
            <label className="radio-label"><input type="radio" name="attendance" value="Si asistire" checked={attendance === "Si asistire"} onChange={(event) => setAttendance(event.target.value)} required /> Si, ahi estare</label>
            <label className="radio-label"><input type="radio" name="attendance" value="No podre asistir" checked={attendance === "No podre asistir"} onChange={(event) => setAttendance(event.target.value)} required /> No podre asistir</label>
          </fieldset>
          {isNotAttending ? <p className="form-helper">Gracias por avisarnos con tiempo. Te vamos a extranar muchisimo ese dia.</p> : <p className="form-helper">Tu invitacion ya contempla los lugares reservados especialmente para ti.</p>}
          <label>Telefono<input name="phone" inputMode="tel" maxLength={30} /></label>
          <label>Correo electronico<input name="email" type="email" maxLength={160} /></label>
          <label>Alergias o restricciones alimentarias<textarea name="dietary" rows={3} maxLength={500} /></label>
          <label>Mensaje para nosotros<textarea name="message" rows={4} maxLength={1000} /></label>
          <button className="button button-primary submit-button" type="submit" disabled={submitState === "loading"}>{submitState === "loading" ? "Enviando..." : "Confirmar asistencia"}</button>
          {submitMessage ? <p className={`form-status ${submitState}`} role="status">{submitMessage}</p> : null}
        </form>
      </section>

      <section id="regalos" className="content-section gifts-section" data-reveal-section>
        <div className="gift-panel" data-reveal-item>
          <div className="gift-copy">
            <p className="eyebrow">{data.gifting.eyebrow}</p>
            <h2>{data.gifting.title}</h2>
            <p>{data.gifting.body}</p>
          </div>

          <div className="gift-grid">
            <article className="gift-card gift-card-primary">
              <span>{data.gifting.contributionTitle}</span>
              <h3>Elige el monto que te nazca.</h3>
              <p>{data.gifting.contributionBody}</p>
              <div className="gift-amounts">
                {data.gifting.amounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className={`gift-chip ${giftAmount === amount ? "is-active" : ""}`}
                    onClick={() => setGiftAmount(amount)}
                  >
                    {formatAmount(amount)}
                  </button>
                ))}
              </div>
              <button className="button button-primary" type="button" onClick={() => {
                setGiftState("idle");
                setGiftMessage("");
                setGiftModal("contribution");
              }}>
                {formatAmount(giftAmount)}
              </button>
            </article>

            {registryLinks.map((registry) => (
              <article className="gift-card" key={registry.label}>
                <span>{registry.label}</span>
                <h3>{registry.title}</h3>
                <p>{registry.body}</p>
                {registry.href ? (
                  <a className="button button-secondary" href={registry.href} target="_blank" rel="noreferrer">{registry.cta}</a>
                ) : (
                  <button className="button button-secondary" type="button" onClick={() => setGiftModal("info")}>{registry.cta}</button>
                )}
              </article>
            ))}
          </div>

          <p className="gift-soft-note">{data.gifting.gentleNote}</p>
        </div>
      </section>

      <section id="faq" className="content-section faq-section" data-reveal-section>
        <div className="section-heading" data-reveal-item>
          <p className="eyebrow">Preguntas frecuentes</p>
          <h2>Todo lo que necesitas saber.</h2>
        </div>
        <div className="faq-list">
          {data.faq.map((item) => (
            <details key={item.question} data-reveal-item>
              <summary>{item.question}<span>+</span></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="closing-section" data-reveal-section>
        <p data-reveal-item>{data.closing.body}</p>
        <h2 data-reveal-item>{data.closing.title}</h2>
        <span data-reveal-item>{data.couple.wordmark}</span>
      </footer>

      {giftModal ? (
        <div className="gift-modal" role="dialog" aria-modal="true" aria-label="Informacion para regalos">
          <button className="modal-backdrop" aria-label="Cerrar" onClick={() => setGiftModal(null)} />
          <div className="modal-card">
            {giftModal === "contribution" ? (
              <>
                <p className="eyebrow">{data.gifting.contributionTitle}</p>
                <h2>{formatAmount(giftAmount)}</h2>
                <p>Dejanos tus datos y te compartiremos la opcion disponible para hacer esta aportacion con toda confianza.</p>
                <form className="gift-form" onSubmit={submitGift}>
                  <input className="honeypot" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <input type="hidden" name="amount" value={giftAmount} />
                  <label>Nombre completo<input name="name" required maxLength={120} /></label>
                  <label>Telefono<input name="phone" inputMode="tel" maxLength={30} /></label>
                  <label>Correo electronico<input name="email" type="email" maxLength={160} /></label>
                  <label>Mensaje<textarea name="message" rows={3} maxLength={500} placeholder="Si quieres, puedes dejarnos una nota linda." /></label>
                  <button className="button button-primary submit-button" type="submit" disabled={giftState === "loading"}>
                    {giftState === "loading" ? "Enviando..." : data.gifting.contributionCta}
                  </button>
                  {giftMessage ? <p className={`form-status ${giftState}`} role="status">{giftMessage}</p> : null}
                </form>
              </>
            ) : (
              <>
                <p className="eyebrow">{data.gifting.eyebrow}</p>
                <h2>{data.gifting.fallbackTitle}</h2>
                <p>{data.gifting.fallbackBody}</p>
                <button className="button button-primary" type="button" onClick={() => setGiftModal(null)}>Entendido</button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
