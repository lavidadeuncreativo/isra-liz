export const wedding = {
  couple: {
    partnerOne: "Israel",
    partnerTwo: "Liz",
  },
  date: {
    iso: "2027-02-20",
    display: "20 de febrero de 2027",
    short: "20 · 02 · 2027",
    day: "20",
    month: "Febrero",
    year: "2027",
    ceremonyTime: "4:00 PM",
  },
  venue: {
    name: "Salón Presidente",
    city: "Uruapan, Michoacán",
    mapUrl: "#",
  },
  audio: {
    src: "/audio/narracion.mp3",
  },
  parents: {
    liz: ["Nombre del papá de Liz", "Nombre de la mamá de Liz"],
    israel: ["Nombre del papá de Israel", "Nombre de la mamá de Israel"],
  },
  story: [
    {
      kicker: "Dos historias distintas",
      title: "Dos caminos. Cero idea de lo que venía.",
      body: "Éramos dos niños, cada quien en su mundo.",
      image: "/images/infancia-liz.svg",
      alt: "Fotografía de Liz durante su infancia",
    },
    {
      kicker: "Pasó el tiempo",
      title: "Crecimos. Cambiamos. Tomamos decisiones buenas… y otras no tanto.",
      body: "La vida siguió avanzando, todavía sin avisarnos que en algún momento nos íbamos a encontrar.",
      image: "/images/infancia-israel.svg",
      alt: "Fotografía de Israel durante su infancia",
    },
    {
      kicker: "Entre tantas vueltas",
      title: "Un día coincidimos.",
      body: "Empezamos a compartir pláticas, risas, viajes y momentos que se fueron volviendo nuestros.",
      image: "/images/nosotros-01.svg",
      alt: "Israel y Liz en uno de sus primeros recuerdos juntos",
    },
    {
      kicker: "Poco a poco",
      title: "Todo empezó a sentirse como casa.",
      body: "Lo que empezó como una historia más se convirtió en nosotros.",
      image: "/images/nosotros-02.svg",
      alt: "Israel y Liz compartiendo un momento de su relación",
    },
  ],
  gallery: [
    {
      src: "/images/galeria-01.svg",
      alt: "Un viaje de Israel y Liz",
      caption: "Los viajes que se volvieron recuerdos.",
    },
    {
      src: "/images/galeria-02.svg",
      alt: "Una celebración de Israel y Liz",
      caption: "Los días importantes y los que parecían normales.",
    },
    {
      src: "/images/galeria-03.svg",
      alt: "Una tarde cotidiana de Israel y Liz",
      caption: "La vida cotidiana que terminó siendo nuestra favorita.",
    },
    {
      src: "/images/galeria-04.svg",
      alt: "El compromiso de Israel y Liz",
      caption: "Y el momento en el que decidimos dar el siguiente paso.",
    },
  ],
  schedule: [
    { time: "3:30 PM", title: "Recepción de invitados", note: "Te recomendamos llegar con tiempo." },
    { time: "4:00 PM", title: "Ceremonia", note: "Comenzaremos puntualmente." },
    { time: "5:30 PM", title: "Celebración", note: "Cena, brindis y baile." },
  ],
  gifts: [
    { title: "Cena para la luna de miel", amount: "$1,500", note: "Una noche especial para recordar." },
    { title: "Experiencia para dos", amount: "$2,500", note: "Una actividad durante nuestro viaje." },
    { title: "Un día de aventura", amount: "$4,000", note: "Para seguir sumando historias." },
    { title: "Sobre para nuestra luna de miel", amount: "Libre", note: "Cualquier detalle será recibido con muchísimo cariño." },
  ],
  faq: [
    {
      question: "¿Puedo llevar acompañante?",
      answer: "Tu invitación indicará el número de lugares reservados. En el formulario podrás confirmar exactamente quiénes asistirán.",
    },
    {
      question: "¿Habrá estacionamiento?",
      answer: "Sí. Compartiremos aquí los detalles finales del estacionamiento o del valet parking del Salón Presidente.",
    },
    {
      question: "¿Hay opciones de hospedaje?",
      answer: "Muy pronto agregaremos una lista de hoteles recomendados en Uruapan.",
    },
  ],
} as const;

export type WeddingData = typeof wedding;
