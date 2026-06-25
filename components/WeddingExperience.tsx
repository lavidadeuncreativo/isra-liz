"use client";

import Image from "next/image";
import { Fragment, FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { WeddingData } from "@/data/wedding";

type Props = { data: WeddingData };
type SubmitState = "idle" | "loading" | "success" | "error";

const QUICK_LINKS = [
  { href: "#historia", label: "Historia" },
  { href: "#detalles", label: "Detalles" },
  { href: "#rsvp", label: "RSVP" },
  { href: "#regalos", label: "Regalos" },
  { href: "#faq", label: "FAQ" },
] as const;

function Words({ text, className = "" }: { text: string; className?: string }) {
  const words = text.trim().split(/\s+/);
  return (
    <span className={className} aria-label={text}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="reveal-word" aria-hidden="true">{word}</span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

function isPlaceholderText(value: string) {
  return /nombre del|nombre de la|pr[oó]ximamente|por confirmar|pendiente/i.test(value);
}

function getVisibleNames(names: readonly string[]) {
  return names.filter((name) => !isPlaceholderText(name));
}

function getCountdown(dateIso: string) {
  const weddingDate = new Date(`${dateIso}T00:00:00`);
  const now = new Date();
  const diff = weddingDate.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      value: "Es hoy",
      label: "Llegó el gran día",
      kicker: "La cuenta regresiva terminó",
    };
  }

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 1) {
    return {
      value: "1",
      label: "día para celebrar",
      kicker: "Falta muy poquito",
    };
  }

  return {
    value: `${days}`,
    label: "días para celebrar",
    kicker: "La cuenta regresiva sigue",
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
    <section id={id} className={`story-scene story-scene-${index + 1}`} data-story-scene>
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
            <Image src={image} alt={alt} fill sizes="(max-width: 820px) 76vw, 38vw" />
          </figure>
        </div>
      </div>
    </section>
  );
}

export default function WeddingExperience({ data }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [entered, setEntered] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [attendance, setAttendance] = useState("");
  const [giftOpen, setGiftOpen] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("page-locked", !entered);
    document.body.classList.toggle("page-locked", !entered);

    return () => {
      document.documentElement.classList.remove("page-locked");
      document.body.classList.remove("page-locked");
    };
  }, [entered]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
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
            gsap.set(".reveal-word, .reveal-media, .reveal-support", {
              clearProps: "all",
              opacity: 1,
              filter: "none",
              transform: "none",
            });
            return;
          }

          const intro = root.querySelector<HTMLElement>("[data-intro-scene]");
          const introWords = intro?.querySelectorAll<HTMLElement>(".reveal-word");
          const introSupport = intro?.querySelectorAll<HTMLElement>(".reveal-support");
          const headLiz = intro?.querySelector<HTMLElement>("[data-head-liz]");
          const headIsrael = intro?.querySelector<HTMLElement>("[data-head-israel]");
          const heart = intro?.querySelector<HTMLElement>("[data-heart]");

          if (intro && introWords && headLiz && headIsrael && heart) {
            const introTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: intro,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.9,
                invalidateOnRefresh: true,
              },
            });

            introTimeline
              .fromTo(
                introSupport ?? [],
                { opacity: 0, filter: "blur(16px)", y: 24 },
                { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.18, stagger: 0.04 },
                0,
              )
              .fromTo(
                introWords,
                { opacity: 0, filter: "blur(24px)", y: 76, rotateX: 72, transformOrigin: "50% 100%" },
                { opacity: 1, filter: "blur(0px)", y: 0, rotateX: 0, duration: 0.34, stagger: 0.018, ease: "power3.out" },
                0,
              )
              .fromTo(
                [headLiz, headIsrael],
                { opacity: 0, filter: "blur(22px)", scale: 0.84 },
                { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.22, stagger: 0.04 },
                0.05,
              )
              .to(headLiz, { x: conditions.mobile ? 82 : 210, rotation: -2, duration: 0.34, ease: "power2.inOut" }, 0.34)
              .to(headIsrael, { x: conditions.mobile ? -82 : -210, rotation: 2, duration: 0.34, ease: "power2.inOut" }, 0.34)
              .fromTo(
                heart,
                { opacity: 0, filter: "blur(22px)", scale: 0.35 },
                { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.22, ease: "back.out(1.5)" },
                0.5,
              )
              .to([introWords, introSupport, headLiz, headIsrael, heart], {
                opacity: 0,
                filter: "blur(20px)",
                y: -38,
                duration: 0.22,
                stagger: 0.005,
              }, 0.78);
          }

          gsap.utils.toArray<HTMLElement>("[data-story-scene]").forEach((scene) => {
            const words = scene.querySelectorAll<HTMLElement>(".reveal-word");
            const support = scene.querySelectorAll<HTMLElement>(".reveal-support");
            const media = scene.querySelectorAll<HTMLElement>(".reveal-media");

            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: scene,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.9,
                invalidateOnRefresh: true,
              },
            });

            timeline
              .fromTo(
                support,
                { opacity: 0, filter: "blur(16px)", y: 24 },
                { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.18, stagger: 0.04 },
                0,
              )
              .fromTo(
                words,
                { opacity: 0, filter: "blur(24px)", y: 72, rotateX: 68, transformOrigin: "50% 100%" },
                { opacity: 1, filter: "blur(0px)", y: 0, rotateX: 0, duration: 0.34, stagger: 0.014, ease: "power3.out" },
                0,
              )
              .fromTo(
                media,
                { opacity: 0, filter: "blur(24px)", y: 48, scale: 0.9, rotation: indexFromScene(scene) % 2 ? 3 : -3 },
                { opacity: 1, filter: "blur(0px)", y: 0, scale: 1, rotation: indexFromScene(scene) % 2 ? 1.2 : -1.2, duration: 0.32, ease: "power3.out" },
                0.08,
              )
              .to({}, { duration: 0.18 })
              .to(words, { opacity: 0, filter: "blur(20px)", y: -44, duration: 0.22, stagger: 0.006 }, 0.76)
              .to(support, { opacity: 0, filter: "blur(16px)", y: -28, duration: 0.18 }, 0.78)
              .to(media, { opacity: 0, filter: "blur(22px)", y: -34, scale: 0.96, duration: 0.2 }, 0.76);
          });

          gsap.utils.toArray<HTMLElement>("[data-reveal-section]").forEach((section) => {
            const children = section.querySelectorAll<HTMLElement>("[data-reveal-item]");
            gsap.fromTo(
              children,
              { opacity: 0, filter: "blur(18px)", y: 42 },
              {
                opacity: 1,
                filter: "blur(0px)",
                y: 0,
                duration: 0.9,
                stagger: 0.09,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: section,
                  start: "top 76%",
                  toggleActions: "play none none reverse",
                },
              },
            );
          });

          ScrollTrigger.refresh();
        },
      );
    }, root);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

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
      if (!response.ok || !result.ok) throw new Error(result.message || "No pudimos enviar tu confirmación.");
      form.reset();
      setAttendance("");
      setSubmitState("success");
      setSubmitMessage(result.message || "Tu confirmación quedó registrada. Gracias.");
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(error instanceof Error ? error.message : "Ocurrió un error. Intenta nuevamente.");
    }
  }

  const giftLink = process.env.NEXT_PUBLIC_GIFT_LINK?.trim() || "";
  const hasGiftLink = Boolean(giftLink);
  const hasMap = Boolean(data.venue.mapUrl && data.venue.mapUrl !== "#");
  const countdown = getCountdown(data.date.iso);
  const lizParents = getVisibleNames(data.parents.liz);
  const israelParents = getVisibleNames(data.parents.israel);
  const isNotAttending = attendance === "No podré asistir";

  return (
    <main ref={rootRef} className={`wedding-site ${entered ? "entered" : ""}`}>
      <audio ref={audioRef} src={data.audio.src} preload="metadata" onEnded={() => setAudioEnabled(false)} />

      <div className={`entry-screen ${entered ? "is-hidden" : ""}`} role="dialog" aria-modal="true" aria-label="Abrir invitación">
        <div className="paper-noise" aria-hidden="true" />
        <div className="entry-content">
          <p className="eyebrow">Tenemos algo que contarte</p>
          <h1>{data.couple.partnerOne} <em>&amp;</em> {data.couple.partnerTwo}</h1>
          <p className="entry-date">{data.date.short}</p>
          <div className="entry-actions">
            <button type="button" className="button button-primary" onClick={() => enter(true)}>Entrar con audio</button>
            <button type="button" className="button button-secondary" onClick={() => enter(false)}>Continuar sin audio</button>
          </div>
          <p className="entry-note">La experiencia está pensada para recorrerse despacio. Tú decides el ritmo con el scroll.</p>
        </div>
      </div>

      {entered && (
        <button type="button" className="audio-control" onClick={toggleAudio} aria-pressed={audioEnabled}>
          <span className="audio-dot">{audioEnabled ? "Ⅱ" : "▶"}</span>
          <span>{audioEnabled ? "Pausar historia" : "Escuchar historia"}</span>
        </button>
      )}

      {entered && (
        <nav className="quick-nav" aria-label="Atajos de la invitación">
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
          <div className="intro-copy">
            <p className="kicker reveal-support">Todo empezó mucho antes</p>
            <h2 className="intro-title"><Words text="¿Quién habría pensado que estos dos se iban a casar?" /></h2>
            <p className="intro-instruction reveal-support">Sigue bajando</p>
          </div>
          <figure className="child-head child-head-liz" data-head-liz>
            <Image src="/images/infancia-liz.svg" alt="Liz de niña" fill sizes="220px" priority />
          </figure>
          <figure className="child-head child-head-israel" data-head-israel>
            <Image src="/images/infancia-israel.svg" alt="Israel de niño" fill sizes="220px" priority />
          </figure>
          <div className="heart-shape" data-heart aria-hidden="true"><span /></div>
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

      <section className="reveal-scene story-scene" data-story-scene>
        <div className="scene-stage reveal-stage">
          <p className="reveal-small reveal-support">Así que sí…</p>
          <h2 className="reveal-title"><Words text="Nos vamos a casar." /></h2>
          <p className="story-body"><Words text="Y la verdad, nos emociona muchísimo poder celebrarlo contigo." /></p>
        </div>
      </section>

      <section className="invite-scene story-scene" data-story-scene>
        <div className="scene-stage invite-stage">
          <p className="kicker reveal-support">Guarda la fecha</p>
          <h2 className="couple-title"><Words text={`${data.couple.partnerOne} & ${data.couple.partnerTwo}`} /></h2>
          <div className="countdown-panel reveal-support">
            <span>{countdown.kicker}</span>
            <strong>{countdown.value}</strong>
            <p>{countdown.label}</p>
          </div>
          <div className="invite-strip reveal-media">
            <div>{data.date.display}</div>
            <div>{data.venue.name}<br />{data.venue.city}</div>
          </div>
          <div className="invite-actions reveal-support">
            <a className="button button-primary" href="#detalles">Ver todos los detalles</a>
            <a className="button button-secondary" href="#rsvp">Confirmar asistencia</a>
            {hasMap ? (
              <a className="button button-secondary" href={data.venue.mapUrl} target="_blank" rel="noreferrer">
                Ver ubicación
              </a>
            ) : (
              <span className="pill-note">La ubicación exacta aparecerá aquí muy pronto.</span>
            )}
          </div>
        </div>
      </section>

      <section className="content-section family-section" data-reveal-section>
        <div className="section-heading" data-reveal-item>
          <p className="eyebrow">Con la alegría de nuestras familias</p>
          <h2>Nos acompañan en este día.</h2>
        </div>
        <div className="family-grid">
          <article className="family-card" data-reveal-item>
            <span>Familia de Liz</span>
            {lizParents.length ? (
              lizParents.map((name) => <h3 key={name}>{name}</h3>)
            ) : (
              <p className="family-placeholder">Muy pronto compartiremos los nombres que nos acompañarán en este momento tan especial.</p>
            )}
          </article>
          <article className="family-card" data-reveal-item>
            <span>Familia de Israel</span>
            {israelParents.length ? (
              israelParents.map((name) => <h3 key={name}>{name}</h3>)
            ) : (
              <p className="family-placeholder">Muy pronto compartiremos los nombres que nos acompañarán en este momento tan especial.</p>
            )}
          </article>
        </div>
      </section>

      <section id="galeria" className="content-section gallery-section" data-reveal-section>
        <div className="section-heading" data-reveal-item>
          <p className="eyebrow">Lo que hemos vivido</p>
          <h2>Una historia hecha de muchos momentos.</h2>
          <p>Un pequeño recorrido por los recuerdos que nos han traído hasta aquí.</p>
        </div>
        <div className="gallery-grid">
          {data.gallery.map((item, index) => (
            <figure className={`gallery-item gallery-item-${index + 1}`} key={item.src} data-reveal-item>
              <div className="gallery-image"><Image src={item.src} alt={item.alt} fill sizes="(max-width: 820px) 92vw, 46vw" /></div>
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="detalles" className="content-section details-section" data-reveal-section>
        <div className="section-heading" data-reveal-item>
          <p className="eyebrow">El gran día</p>
          <h2>{data.date.display}.</h2>
        </div>
        <div className="date-lockup" data-reveal-item>
          <strong>{data.date.day}</strong>
          <span>{data.date.month}<br />{data.date.year}</span>
        </div>
        <div className="details-grid">
          <article className="detail-card" data-reveal-item><small>La ceremonia</small><h3>{data.date.ceremonyTime}</h3><p>Te recomendamos llegar 30 minutos antes para comenzar puntualmente.</p></article>
          <article className="detail-card" data-reveal-item><small>El lugar</small><h3>{data.venue.name}</h3><p>{data.venue.city}</p>{hasMap ? <a href={data.venue.mapUrl} target="_blank" rel="noreferrer">Abrir ubicación ↗</a> : <p className="detail-muted">Compartiremos la ubicación exacta en cuanto esté confirmada.</p>}</article>
          <article className="detail-card" data-reveal-item><small>Código de vestimenta</small><h3>Formal</h3><p>Elegante, cómodo y listo para bailar toda la noche.</p></article>
          <article className="detail-card" data-reveal-item><small>Hospedaje</small><h3>Uruapan</h3><p>Muy pronto compartiremos hoteles recomendados y opciones de transporte para quienes nos acompañan desde fuera.</p></article>
        </div>
        <div className="schedule" data-reveal-item>
          {data.schedule.map((item) => (
            <div className="schedule-row" key={item.time}>
              <time>{item.time}</time><div><h3>{item.title}</h3><p>{item.note}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="rsvp" className="content-section rsvp-section" data-reveal-section>
        <div className="section-heading" data-reveal-item>
          <p className="eyebrow">Confirma tu asistencia</p>
          <h2>Queremos contar contigo.</h2>
          <p>Nos ayudará muchísimo que respondas con tiempo para organizar cada detalle con cariño.</p>
        </div>
        <form className="rsvp-form" onSubmit={submitRsvp} data-reveal-item>
          <input className="honeypot" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <label>Nombre completo<input name="name" required maxLength={120} /></label>
          <fieldset>
            <legend>¿Podrás acompañarnos?</legend>
            <label className="radio-label"><input type="radio" name="attendance" value="Sí asistiré" checked={attendance === "Sí asistiré"} onChange={(event) => setAttendance(event.target.value)} required /> Sí, ahí estaré</label>
            <label className="radio-label"><input type="radio" name="attendance" value="No podré asistir" checked={attendance === "No podré asistir"} onChange={(event) => setAttendance(event.target.value)} required /> No podré asistir</label>
          </fieldset>
          {isNotAttending ? <input type="hidden" name="guests" value="0" /> : null}
          <div className="form-row">
            <label>Número de asistentes<select name="guests" defaultValue="1" disabled={isNotAttending}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label>
            <label>Teléfono<input name="phone" inputMode="tel" maxLength={30} /></label>
          </div>
          {isNotAttending ? <p className="form-helper">Gracias por avisarnos con tiempo. Te vamos a extrañar mucho ese día.</p> : null}
          <label>Correo electrónico<input name="email" type="email" maxLength={160} /></label>
          <label>Alergias o restricciones alimentarias<textarea name="dietary" rows={3} maxLength={500} /></label>
          <label>Mensaje para nosotros<textarea name="message" rows={4} maxLength={1000} /></label>
          <button className="button button-primary submit-button" type="submit" disabled={submitState === "loading"}>{submitState === "loading" ? "Enviando…" : "Confirmar asistencia"}</button>
          {submitMessage && <p className={`form-status ${submitState}`} role="status">{submitMessage}</p>}
        </form>
      </section>

      <section id="regalos" className="content-section gifts-section" data-reveal-section>
        <div className="section-heading" data-reveal-item>
          <p className="eyebrow">Mesa de experiencias</p>
          <h2>El mejor regalo es compartir este día.</h2>
          <p>Quien quiera tener un detalle adicional puede ayudarnos a construir recuerdos para nuestra luna de miel.</p>
        </div>
        <div className="gift-grid">
          {data.gifts.map((gift) => (
            <article className="gift-card" key={gift.title} data-reveal-item>
              <span>{gift.amount}</span><h3>{gift.title}</h3><p>{gift.note}</p>
              <button type="button" onClick={() => hasGiftLink ? window.open(giftLink, "_blank", "noopener,noreferrer") : setGiftOpen(true)}>Elegir este detalle</button>
            </article>
          ))}
        </div>
        <p className="gift-note" data-reveal-item>También tendremos la tradicional dinámica del sobre durante la celebración.</p>
      </section>

      <section id="faq" className="content-section faq-section" data-reveal-section>
        <div className="section-heading" data-reveal-item><p className="eyebrow">Preguntas frecuentes</p><h2>Todo lo que necesitas saber.</h2></div>
        <div className="faq-list">
          {data.faq.map((item) => <details key={item.question} data-reveal-item><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}
        </div>
      </section>

      <footer className="closing-section" data-reveal-section>
        <p data-reveal-item>Si hace años nos hubieran enseñado esas fotos, nadie habría imaginado cómo terminaría esta historia.</p>
        <h2 data-reveal-item>Ahora solo falta celebrarlo contigo.</h2>
        <span data-reveal-item>{data.couple.partnerOne} &amp; {data.couple.partnerTwo}</span>
      </footer>

      {giftOpen && (
        <div className="gift-modal" role="dialog" aria-modal="true" aria-label="Información para regalo">
          <button className="modal-backdrop" aria-label="Cerrar" onClick={() => setGiftOpen(false)} />
          <div className="modal-card">
            <p className="eyebrow">Detalle para la luna de miel</p>
            <h2>La mesa digital estará disponible muy pronto.</h2>
            <p>Si quieres tener un detalle adicional para nosotros, en unos días compartiremos aquí la forma más cómoda de hacerlo.</p>
            <button className="button button-primary" type="button" onClick={() => setGiftOpen(false)}>Entendido</button>
          </div>
        </div>
      )}
    </main>
  );
}

function indexFromScene(scene: HTMLElement) {
  const scenes = Array.from(document.querySelectorAll("[data-story-scene]"));
  return scenes.indexOf(scene);
}
