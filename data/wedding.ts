export const wedding = {
  couple: {
    partnerOne: "Israel",
    partnerTwo: "Liz",
  },
  intro: {
    kicker: "Esto lo queremos vivir contigo",
    title: "Después de tantas vueltas, encontramos un nosotros que se siente para siempre.",
    body: "Con muchísima ilusión queremos invitarte a uno de los días más importantes de nuestra vida.",
    instruction: "Desliza despacito",
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
    liz: ["Luis Flores", "Irma Laura Contreras Jiménez"],
    israel: ["Rebeca Antonio Cabrera", "Pedro Granados Guerrero"],
  },
  story: [
    {
      kicker: "Antes de nosotros",
      title: "Cada quien iba escribiendo su propia historia.",
      body: "Con su familia, sus sueños, sus tropiezos y todo eso que poco a poco nos fue convirtiendo en quienes somos hoy.",
      image: "/images/infancia-liz.svg",
      alt: "Fotografía de Liz durante su infancia",
    },
    {
      kicker: "Sin imaginarlo",
      title: "La vida nos estaba acomodando para coincidir.",
      body: "Mientras seguíamos creciendo y aprendiendo, sin saberlo también nos íbamos acercando al momento en que nuestros caminos se encontrarían.",
      image: "/images/infancia-israel.svg",
      alt: "Fotografía de Israel durante su infancia",
    },
    {
      kicker: "Y entonces pasó",
      title: "Nos encontramos... y algo hizo clic.",
      body: "Entre pláticas, risas y momentos sencillos empezó a nacer un nosotros que se fue sintiendo cada vez más verdadero.",
      image: "/images/nosotros-01.svg",
      alt: "Israel y Liz en uno de sus primeros recuerdos juntos",
    },
    {
      kicker: "Con el tiempo",
      title: "Descubrimos que queríamos seguir caminando juntos.",
      body: "Hoy llegamos hasta aquí con el corazón lleno y con muchísima ilusión de celebrar este comienzo al lado de la gente que amamos.",
      image: "/images/nosotros-02.svg",
      alt: "Israel y Liz compartiendo un momento de su relación",
    },
  ],
  gallery: [
    {
      src: "/images/galeria-01.svg",
      alt: "Un viaje de Israel y Liz",
      caption: "Los momentos que nos hicieron reír más de la cuenta.",
    },
    {
      src: "/images/galeria-02.svg",
      alt: "Una celebración de Israel y Liz",
      caption: "Los abrazos, los viajes y las pequeñas celebraciones.",
    },
    {
      src: "/images/galeria-03.svg",
      alt: "Una tarde cotidiana de Israel y Liz",
      caption: "Los días tranquilos que terminaron siendo nuestros favoritos.",
    },
    {
      src: "/images/galeria-04.svg",
      alt: "El compromiso de Israel y Liz",
      caption: "Y el instante en que dijimos sí a este para siempre.",
    },
  ],
  schedule: [
    { time: "3:30 PM", title: "Recepción de invitados", note: "Te recomendamos llegar con tiempo." },
    { time: "4:00 PM", title: "Ceremonia", note: "Comenzaremos puntualmente." },
    { time: "5:30 PM", title: "Celebración", note: "Cena, brindis y baile." },
  ],
  announcement: {
    kicker: "Y entonces pasó",
    title: "Nos vamos a casar.",
    body: "Y de verdad nos haría muy felices celebrarlo contigo, con tu cariño y tu presencia.",
  },
  gifting: {
    eyebrow: "Mesa de regalos",
    title: "Tu compañía será nuestro regalo más bonito.",
    body: "Si además te nace tener un detalle con nosotros, preparamos una mesa de regalos con muchísimo cariño. De corazón, gracias por acompañarnos en este comienzo.",
    gentleNote: "Lo más valioso para nosotros es compartir este día contigo.",
    cta: "Ver mesa de regalos",
    fallbackTitle: "La mesa de regalos estará disponible muy pronto.",
    fallbackBody: "Si en estos días te nace tener un detalle con nosotros, aquí compartiremos la información. Pero de verdad: tu presencia es más que suficiente.",
  },
  faq: [
    {
      question: "¿Puedo llevar acompañante?",
      answer: "Tu invitación ya contempla los lugares reservados especialmente para ti y para las personas incluidas en ella. En el formulario solo te pedimos confirmar si podrán acompañarnos.",
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
  closing: {
    body: "Gracias por acompañarnos, por alegrarte con nosotros y por ser parte de esta historia.",
    title: "Ahora sí, solo falta celebrarlo juntos.",
  },
} as const;

export type WeddingData = typeof wedding;
