export const wedding = {
  couple: {
    partnerOne: "Isra",
    partnerTwo: "Liz",
    wordmark: "Isra&Liz",
  },
  intro: {
    entryNote: "Qué gusto que estés aquí. Entra, tenemos algo que contarte.",
    kicker: "Te lo queremos contar nosotros",
    titleLines: [
      "¿Quién pensaría que",
      "estos dos se iban a casar?",
    ],
    body: "Sí, somos nosotros. Y nos hace mucha ilusión poder invitarte.",
    instruction: "Baja, que apenas empieza",
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
      title: "De pronto, todo empezó a ser de los dos.",
      body: "Los planes, los días normales, las risas y hasta las pequeñas cosas. Hay mucho de nuestra historia que no cabe en una sola foto.",
      image: "/images/gallery/momento-04.jpg",
      alt: "Isra y Liz abrazados en una celebración",
    },
    {
      kicker: "Y aquí estamos",
      title: "Y ahora nos toca celebrar.",
      body: "No queremos que este día se quede solo en nuestras fotos. Queremos vivirlo con nuestra gente. Contigo.",
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
      body: "Ven formal, pero con ganas de bailar y de estar cómodo.",
      visual: "Dress",
    },
  ],
  schedule: [
    {
      time: "5:00 PM",
      title: "Recepción de invitados",
      note: "Nos encantará verte desde el principio.",
    },
    {
      time: "5:30 PM",
      title: "Ceremonia",
      note: "Aquí empieza todo.",
    },
    {
      time: "7:00 PM",
      title: "Celebración",
      note: "Ahora sí: a cenar, brindar y bailar.",
    },
  ],
  announcement: {
    kicker: "Y sí, va en serio",
    title: "Nos vamos a casar.",
    body: "Y queremos que formes parte de este día.",
  },
  gifting: {
    eyebrow: "Mesa de regalos",
    title: "Lo mejor es que estés ahí.",
    body: "De verdad: nos hace ilusión verte. Y si también quieres regalarnos algo, aquí te dejamos algunas opciones.",
    gentleNote: "Gracias por ser parte de este día.",
    contributionTitle: "Aportación libre",
    contributionBody: "Si quieres hacer una aportación, puedes elegir el monto y te compartimos los datos por privado.",
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
    body: "Nos va a dar mucho gusto encontrarte ese día.",
    title: "Ahora sí, nos vemos en febrero.",
  },
} as const;

export type WeddingData = typeof wedding;
