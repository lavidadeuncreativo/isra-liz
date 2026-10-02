export const wedding = {
  couple: {
    partnerOne: "Isra",
    partnerTwo: "Liz",
    wordmark: "Isra&Liz",
  },
  intro: {
    entryNote: "Pasa, lo preparamos con mucho cariño para ti.",
    kicker: "Esto lo queremos vivir contigo",
    titleLines: [
      "¿Quién pensaría que",
      "estos dos se iban a casar?",
    ],
    body: "Y nos haría muy felices compartir este día contigo.",
    instruction: "Sigue bajando",
  },
  date: {
    iso: "2027-02-20",
    countdownIso: "2027-02-20T17:30:00-06:00",
    display: "20 de febrero de 2027",
    short: "20 · 02 · 2027",
    day: "20",
    month: "Febrero",
    year: "2027",
    ceremonyTime: "5:30 PM",
  },
  venue: {
    name: "Salón Presidente",
    city: "Uruapan, Michoacán",
    mapUrl: "https://maps.app.goo.gl/UriaBSsoG5AfLaY78",
  },
  audio: {
    src: "/audio/narracion.mp3",
    // Activar solo después de subir el audio real a public/audio/.
    enabled: false,
  },
  parents: {
    liz: ["Luis Flores", "Irma Laura Contreras Jimenez"],
    israel: ["Rebeca Antonio Cabrera", "Pedro Granados Guerrero"],
  },
  story: [
    {
      kicker: "Cuando coincidimos",
      title: "Un día, nuestras historias se encontraron.",
      body: "Entre pláticas, risas y momentos sencillos, empezamos a construir algo que hoy nos hace muy felices.",
      image: "/images/gallery/momento-04.jpg",
      alt: "Isra y Liz abrazados en una celebración",
    },
    {
      kicker: "Y aquí estamos",
      title: "Lo mejor es poder compartirlo.",
      body: "Nos ilusiona comenzar esta nueva etapa rodeados de las personas que queremos. Y eso te incluye a ti.",
      image: "/images/gallery/momento-06.jpg",
      alt: "Isra y Liz besándose bajo un arco de piedra",
    },
  ],
  gallery: [
    {
      src: "/images/gallery/momento-01.jpg",
      alt: "Liz en una noche especial",
      caption: "Una de esas noches que no se olvidan.",
    },
    {
      src: "/images/gallery/momento-02.jpg",
      alt: "Anillo de compromiso frente al mar",
      caption: "El sí que cambió nuestros planes.",
    },
    {
      src: "/images/gallery/momento-03.jpg",
      alt: "Liz sonriendo durante una tarde soleada",
      caption: "Los días sencillos también cuentan.",
    },
    {
      src: "/images/gallery/momento-04.jpg",
      alt: "Isra y Liz abrazados en una celebracion",
      caption: "Los momentos que queremos recordar.",
    },
    {
      src: "/images/gallery/momento-05.jpg",
      alt: "Isra y Liz abrazados en el jardin",
      caption: "Siempre juntos, a nuestra manera.",
    },
    {
      src: "/images/gallery/momento-06.jpg",
      alt: "Isra y Liz besandose bajo un arco de piedra",
      caption: "Y todo lo que nos queda por vivir.",
    },
  ],
  essentials: [
    {
      label: "Ubicación",
      title: "Salón Presidente",
      body: "Uruapan, Michoacán",
      visual: "Mapa",
      actionLabel: "Abrir ubicación",
      href: "https://maps.app.goo.gl/UriaBSsoG5AfLaY78",
    },
    {
      label: "Código de vestimenta",
      title: "Formal",
      body: "Formal, cómodo y listo para bailar toda la noche.",
      visual: "Dress",
    },
  ],
  schedule: [
    {
      time: "5:00 PM",
      title: "Recepción de invitados",
      note: "Llega con tiempo para que nos acompañes desde el inicio.",
    },
    {
      time: "5:30 PM",
      title: "Ceremonia",
      note: "El momento de decir que sí.",
    },
    {
      time: "7:00 PM",
      title: "Celebración",
      note: "Cena, brindis, música y una gran noche juntos.",
    },
  ],
  announcement: {
    kicker: "Y entonces pasó",
    title: "Nos vamos a casar.",
    body: "Y queremos que formes parte de este día.",
  },
  gifting: {
    eyebrow: "Mesa de regalos",
    title: "Tenerte con nosotros ya es un regalo.",
    body: "Si además quieres tener un detalle, aquí te dejamos una opción. Gracias de corazón.",
    gentleNote: "Lo más importante para nosotros es celebrarlo contigo.",
    contributionTitle: "Aportación libre",
    contributionBody: "Si quieres hacer una aportación, elige un monto y te compartiremos cómo hacerlo.",
    contributionCta: "Quiero aportar este monto",
    contributionSuccess: "Recibimos tu mensaje. Pronto te compartiremos los datos para hacerlo.",
    amounts: [500, 1000, 1500, 2000, 3000],
    registries: [
      {
        label: "Palacio de Hierro",
        title: "Mesa Palacio",
        body: "Para quienes prefieran regalarnos algo desde nuestra mesa tradicional.",
        href: "",
        cta: "Ver mesa",
      },
      {
        label: "Amazon",
        title: "Wishlist Amazon",
        body: "Otra opcion para elegir un detalle practico para esta nueva etapa.",
        href: "",
        cta: "Ver wishlist",
      },
    ],
    fallbackTitle: "Esta mesa aún no está disponible.",
    fallbackBody: "Gracias por querer tener un detalle con nosotros.",
  },
  faq: [
    {
      question: "¿Puedo llevar acompañante?",
      answer: "En tu invitación personalizada encontrarás los nombres y lugares reservados. Ahí podrás confirmar por persona.",
    },
    {
      question: "¿Dónde será exactamente?",
      answer: "En Salón Presidente, Uruapan. El botón de ubicación abre el mapa.",
    },
  ],
  closing: {
    body: "Gracias por estar cerca de nosotros y ser parte de esta historia.",
    title: "Ahora sí, ¡a celebrarlo juntos!",
  },
} as const;

export type WeddingData = typeof wedding;
