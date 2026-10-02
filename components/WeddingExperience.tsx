"use client";

import Image from "next/image";
import { Fragment, FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { WeddingData } from "@/data/wedding";
import type { LinkedGuest, LinkedHousehold } from "@/lib/platform-rsvp";

type Props = {
  data: WeddingData;
  linkedHousehold?: LinkedHousehold;
  rsvpLinkedOnly?: boolean;
};
type SubmitState = "idle" | "loading" | "success" | "error";
type GiftModalMode = "info" | "contribution" | null;

const QUICK_LINKS = [
  { href: "#historia", label: "Historia" },
  { href: "#detalles", label: "El gran día" },
  { href: "#rsvp", label: "Confirmar" },
  { href: "#regalos", label: "Regalos" },
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

export default function WeddingExperience({ data, linkedHousehold, rsvpLinkedOnly = false }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [entered, setEntered] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [attendance, setAttendance] = useState("");
  const [linkedGuests, setLinkedGuests] = useState<LinkedGuest[]>(linkedHousehold?.guests||[]);
  const [linkedMessage, setLinkedMessage] = useState(linkedHousehold?.message||"");
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

    // All scroll-dependent animation stays in the React/GSAP lifecycle.
    const ctx = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 821px)",
          mobile: "(max-width: 820px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          // Reduced motion is intentionally readable and still. Never gsap.set()
          // elements to invisible states before checking this condition.
          if (context.conditions?.reduce) return;

          const isMobile = Boolean(context.conditions?.mobile);
          const scrub = isMobile ? 0.32 : 0.46;
          const intro = root.querySelector<HTMLElement>("[data-intro-scene]");

          if (intro) {
            const titleWords = Array.from(intro.querySelectorAll<HTMLElement>(".intro-title .reveal-word"));
            const supportingCopy = Array.from(intro.querySelectorAll<HTMLElement>(".reveal-support"));
            const portraits = intro.querySelector<HTMLElement>("[data-hero-floaters]");
            const liz = intro.querySelector<HTMLElement>("[data-head-liz]");
            const isra = intro.querySelector<HTMLElement>("[data-head-isra]");
            const heart = intro.querySelector<HTMLElement>("[data-heart]");

            gsap.set(titleWords, {
              autoAlpha: 0,
              filter: "blur(22px)",
              y: isMobile ? 65 : 94,
              rotateX: 58,
              skewY: 3,
              transformOrigin: "50% 100%",
            });
            gsap.set(supportingCopy, { autoAlpha: 0, filter: "blur(10px)", y: 32 });
            if (portraits) gsap.set(portraits, {
              autoAlpha: 0, filter: "blur(16px)", y: 90, scale: 0.86,
            });

            // The entry overlay fades for ~600ms. Previously the headline
            // finished its animation BEHIND the overlay and looked static.
            // Delay the reveal until the cover has actually begun to leave.
            const entrance = gsap.timeline({ delay: 0.48, defaults: { ease: "power3.out" } });

            entrance
              .to(titleWords, {
                autoAlpha: 1, filter: "blur(0px)",
                y: 0, rotateX: 0, skewY: 0,
                duration: 1.04,
                stagger: isMobile ? 0.048 : 0.065,
              }, 0)
              .to(supportingCopy, {
                autoAlpha: 1, filter: "blur(0px)", y: 0,
                duration: 0.75, stagger: 0.15,
              }, 0.46);

            if (portraits) {
              entrance.to(portraits, {
                autoAlpha: 1, filter: "blur(0px)",
                y: 0, scale: 1, duration: 1.15,
                ease: "back.out(1.14)",
              }, 0.24);
            }

            if (liz && isra && heart && portraits) {
              // Keep the original childhood-photograph / heart choreography,
              // but make the children approach one another, rather than drift
              // apart. The final fade only begins as the next scene arrives.
              const introScroll = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                  trigger: intro,
                  start: "top top",
                  end: "bottom bottom",
                  scrub,
                  invalidateOnRefresh: true,
                },
              });

              introScroll
                .to(liz, {
                  x: isMobile ? 16 : 54,
                  y: isMobile ? 8 : 16,
                  rotation: 6, scale: 1.055, duration: 0.38,
                }, 0.14)
                .to(isra, {
                  x: isMobile ? -16 : -54,
                  y: isMobile ? 8 : 16,
                  rotation: -6, scale: 1.055, duration: 0.38,
                }, 0.14)
                .to(heart, {
                  y: isMobile ? -6 : -12,
                  scale: 1.19, duration: 0.28,
                }, 0.32)
                .to([liz, isra], {
                  y: isMobile ? 2 : 10,
                  duration: 0.16,
                }, 0.52)
                // Do not remove the whole scene before its sticky stage ends.
                .to([...titleWords, ...supportingCopy, portraits], {
                  autoAlpha: 0, filter: "blur(15px)",
                  y: -30, duration: 0.10,
                }, 0.90)
                .to({}, { duration: 0.01 }, 0.99);
            }
          }

          root.querySelectorAll<HTMLElement>("[data-story-scene]").forEach((scene) => {
            const headline = Array.from(scene.querySelectorAll<HTMLElement>(
              ".display-title .reveal-word, .reveal-title .reveal-word, .couple-title .reveal-word",
            ));
            const bodyWords = Array.from(scene.querySelectorAll<HTMLElement>(".story-body .reveal-word"));
            const support = Array.from(scene.querySelectorAll<HTMLElement>(".reveal-support"));
            const photo = Array.from(scene.querySelectorAll<HTMLElement>(".reveal-media"));
            const index = Number(scene.dataset.sceneIndex || 0);

            gsap.set(headline, {
              autoAlpha: 0, filter: "blur(18px)",
              y: isMobile ? 50 : 75, rotateX: 52,
              skewY: 2, transformOrigin: "50% 100%",
            });
            gsap.set(bodyWords, {
              autoAlpha: 0, filter: "blur(10px)", y: 22,
              rotateX: 16,
            });
            gsap.set(support, {
              autoAlpha: 0, filter: "blur(8px)", y: 23,
            });
            gsap.set(photo, {
              autoAlpha: 0, filter: "blur(18px)",
              y: isMobile ? 68 : 98,
              scale: 0.86,
              rotation: index % 2 ? 5 : -5,
            });

            // Starts as the NEXT scene enters the bottom of the viewport.
            // This eliminates the blank gap caused by "top 65%".
            const timeline = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: scene,
                start: "top 99%",
                end: "bottom bottom",
                scrub,
                invalidateOnRefresh: true,
              },
            });

            timeline
              .to(support, {
                autoAlpha: 1, filter: "blur(0px)", y: 0,
                duration: 0.15, stagger: 0.012,
              }, 0.035)
              .to(headline, {
                autoAlpha: 1, filter: "blur(0px)",
                y: 0, rotateX: 0, skewY: 0,
                duration: 0.22, stagger: 0.013,
              }, 0.065)
              .to(bodyWords, {
                autoAlpha: 1, filter: "blur(0px)",
                y: 0, rotateX: 0,
                duration: 0.17, stagger: 0.006,
              }, 0.18)
              .to(photo, {
                autoAlpha: 1, filter: "blur(0px)",
                y: 0, scale: 1, rotation: 0,
                duration: 0.24,
              }, 0.09)
              // After its reveal, the photo has gentle depth while the text
              // remains fully readable for the majority of the scene.
              .to(photo, {
                y: isMobile ? -12 : -24,
                scale: 1.045,
                rotation: index % 2 ? -1 : 1,
                duration: 0.34,
              }, 0.49)
              // A short, synchronized exit only at the end of the scene.
              .to([...headline, ...bodyWords, ...support, ...photo], {
                autoAlpha: 0, filter: "blur(13px)",
                y: -28, duration: 0.10,
              }, 0.91)
              .to({}, { duration: 0.01 }, 1);
          });

          root.querySelectorAll<HTMLElement>("[data-reveal-section]").forEach((section) => {
            // Forms, accordions and their feedback must never scroll-disappear.
            // Give informational headings a single editorial entrance instead.
            const items = section.matches(".rsvp-section, .gifts-section, .faq-section")
              ? section.querySelectorAll<HTMLElement>(".section-heading")
              : section.querySelectorAll<HTMLElement>("[data-reveal-item]");

            items.forEach((item) => {
              if (item.matches("form, details") || item.querySelector("form, input, textarea, button")) return;

              gsap.fromTo(item, {
                autoAlpha: 0,
                y: isMobile ? 36 : 52,
                filter: "blur(12px)",
                rotateX: 9,
              }, {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                rotateX: 0,
                duration: 0.95,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: item,
                  start: "top 92%",
                  once: true,
                  invalidateOnRefresh: true,
                },
              });
            });
          });

          let active = true;
          const refresh = () => { if (active) ScrollTrigger.refresh(); };
          void document.fonts?.ready.then(refresh);
          window.addEventListener("load", refresh, { once: true });
          refresh();
          return () => {
            active = false;
            window.removeEventListener("load", refresh);
          };
        },
      );
    }, root);

    return () => ctx.revert();
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

  function updateLinkedGuest(id:string,status:"yes"|"no"){
    setLinkedGuests(current=>current.map(guest=>guest.id===id
      ? {...guest,rsvp:status,dietary:status==="no"?"":guest.dietary}
      : guest));
    setSubmitState("idle");
    setSubmitMessage("");
  }

  function updateLinkedDietary(id:string,value:string){
    setLinkedGuests(current=>current.map(guest=>guest.id===id?{...guest,dietary:value}:guest));
    setSubmitState("idle");
  }

  async function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(linkedHousehold&&linkedGuests.some(guest=>guest.rsvp==="pending")){
      setSubmitState("error");
      setSubmitMessage("Por favor, confirmen la asistencia de cada persona antes de continuar.");
      return;
    }
    setSubmitState("loading");
    setSubmitMessage("");

    const form = event.currentTarget;
    const payload = linkedHousehold
      ? {code:linkedHousehold.inviteCode,guests:linkedGuests,message:linkedMessage}
      : Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch(linkedHousehold?"/api/rsvp/linked":"/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || "No pudimos enviar tu confirmacion.");
      if(!linkedHousehold){
        form.reset();
        setAttendance("");
      }
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
  const hasAudio = data.audio.enabled;

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
      {hasAudio ? <audio ref={audioRef} src={data.audio.src} preload="metadata" onEnded={() => setAudioEnabled(false)} /> : null}

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
            {hasAudio ? <button type="button" className="button button-primary" onClick={() => enter(true)}>Entrar con audio</button> : null}
            <button type="button" className={`button ${hasAudio ? "button-secondary" : "button-primary"}`} onClick={() => enter(false)}>Abrir invitación</button>
          </div>
          <p className="entry-note">{linkedHousehold?`Una invitación especial para ${linkedHousehold.name}. La preparamos con mucho cariño para ustedes.`:data.intro.entryNote}</p>
        </div>
      </div>

      {entered && hasAudio && (
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
          <div className="intro-shell" data-hero-orbit>
            <div className="intro-copy">
              <p className="kicker reveal-support">{data.intro.kicker}</p>
              <h2 className="intro-title">
                <LineWords lines={data.intro.titleLines} />
              </h2>
              <p className="intro-lead reveal-support">{data.intro.body}</p>
            </div>

            <div className="intro-floating-row" data-hero-floaters>
              <figure className="intro-portrait intro-portrait-liz" data-head-liz>
                <div className="intro-portrait-art">
                  <span className="portrait-halo" aria-hidden="true" />
                  <Image
                    src="/images/hero-liz-clean.png"
                    alt="Liz de nina"
                    fill
                    sizes="(max-width: 820px) 34vw, 230px"
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
                    src="/images/hero-israel-clean.png"
                    alt="Isra de nino"
                    fill
                    sizes="(max-width: 820px) 34vw, 230px"
                    priority
                    className="cutout-image"
                  />
                </div>
                <figcaption>Isra</figcaption>
              </figure>
            </div>

            <p className="intro-instruction">{data.intro.instruction}</p>
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
            <a className="button button-primary" href="#rsvp">Confirmar asistencia</a>
            <a className="button button-secondary" href="#detalles">Ver detalles</a>
            {hasMap ? (
              <a className="button button-secondary" href={data.venue.mapUrl} target="_blank" rel="noreferrer">
                Abrir ubicación
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
          <p>Algunos de nuestros momentos favoritos.</p>
        </div>
        <div className="gallery-marquee" data-reveal-item>
          <div className="gallery-track">
            {[...data.gallery, ...data.gallery, ...data.gallery].map((item, index) => (
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
              <div className="detail-visual" aria-hidden="true">
                <span>{item.visual}</span>
              </div>
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
          <p>Tu respuesta nos ayudará a preparar todo para recibirte.</p>
        </div>
        {linkedHousehold ? <form className="rsvp-form linked-rsvp-form" onSubmit={submitRsvp} data-reveal-item>
          <div className="linked-household-intro">
            <p className="eyebrow">INVITACIÓN PERSONALIZADA</p>
            <h3>{linkedHousehold.name}</h3>
            <p>Reservamos {linkedHousehold.spotsAllowed} {linkedHousehold.spotsAllowed===1?"lugar":"lugares"} para ustedes. Confirmen por persona; pueden volver a este enlace si cambian de planes.</p>
          </div>
          {linkedGuests.map(guest=><fieldset className="linked-person" key={guest.id}>
            <legend>{guest.firstName} {guest.lastName}</legend>
            <div className="linked-person-choices">
              <label className="radio-label">
                <input type="radio" name={`attendance-${guest.id}`} checked={guest.rsvp==="yes"} onChange={()=>updateLinkedGuest(guest.id,"yes")}/> Sí asistiré
              </label>
              <label className="radio-label">
                <input type="radio" name={`attendance-${guest.id}`} checked={guest.rsvp==="no"} onChange={()=>updateLinkedGuest(guest.id,"no")}/> No podré asistir
              </label>
            </div>
            {guest.rsvp==="yes"&&<label className="linked-dietary">Alergias o restricciones alimentarias (opcional)
              <input value={guest.dietary||""} maxLength={500} onChange={e=>updateLinkedDietary(guest.id,e.target.value)} placeholder="Ej. vegetariano, sin gluten..." />
            </label>}
          </fieldset>)}
          <label>Mensaje para nosotros (opcional)
            <textarea value={linkedMessage} onChange={e=>{setLinkedMessage(e.target.value);setSubmitState("idle");}} rows={4} maxLength={1000}/>
          </label>
          <button className="button button-primary submit-button" type="submit" disabled={submitState==="loading"}>
            {submitState==="loading"?"Guardando...":submitState==="success"?"Actualizar confirmación":"Confirmar asistencia"}
          </button>
          {submitMessage&&<p className={`form-status ${submitState}`} role="status">{submitMessage}</p>}
        </form> : rsvpLinkedOnly ? <div className="rsvp-form rsvp-personalized-help" data-reveal-item>
          <p>Para confirmar necesitamos identificar a tu familia y los lugares reservados.</p>
          <p>Abre el enlace personalizado que te enviamos por WhatsApp o correo. Si no lo tienes, escríbenos y te lo compartimos con gusto.</p>
        </div> : <form className="rsvp-form" onSubmit={submitRsvp} data-reveal-item>
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
        </form>}
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

            {registryLinks.filter((registry) => Boolean(registry.href)).map((registry) => (
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
          <h2>Por si te lo preguntabas.</h2>
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
