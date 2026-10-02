# Isra & Liz — sistema editorial de la invitación

## Idea central

**¿Quién pensaría que estos dos se iban a casar?**

La experiencia debe sentirse como abrir una invitación que Isra y Liz prepararon
para alguien querido, no como recorrer una plantilla de bodas o un producto SaaS.

## Personalidad y lenguaje

- **Nosotros:** cálidos, cómplices, directos, con humor suave cuando nace de la historia.
- **Tú:** el invitado es alguien que queremos recibir, nunca un lead ni un cliente.
- **Sí:** "Qué gusto que estés aquí", "Nos vemos en febrero", "¿Nos acompañas?".
- **No:** "Un amor para toda la eternidad", "Nuestra historia de cuento", urgencia comercial,
  frases de marketing, emojis indiscriminados ni promesas sobre datos sin confirmar.
- Los párrafos pueden ser breves, pero no vacíos: acompañan una foto o resuelven una duda.
- Ningún dato factual (familiares, iglesias, direcciones, horario, presupuesto) se inventa.

## Gramática visual

- Hueso `#f2eee7`, papel claro `#faf8f4`, tinta `#201b1d`, vino `#762c47`.
- Titulares en Instrument Serif; datos, botones y detalles en Figtree.
- Escala de espacios: 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 / 112 px; variables CSS
  `--page-gutter`, `--section-space`, `--gallery-gap` como referencia.
- Fotografía real; sombras discretas, sin motivos artificiales como iconos simulados.
- El contraste y la legibilidad son más importantes que el efecto de transición.

## Recorrido

1. **Abrir invitación:** conservar portada y gesto explícito de apertura.
2. **Inicio:** la frase emblemática con retratos de infancia y el corazón.
3. **Historia:** breve, con texto y fotografías; blur de entrada, tiempo de lectura y salida.
4. **Fecha y celebración:** lugar, hora y acciones inmediatas.
5. **Familias, fotos, detalles, RSVP y regalos:** contenido de consulta claro, sin bloquear inputs.
6. **Cierre:** cercano y breve.

## Mobile first

- Accesos persistentes: Inicio, Cómo llegar, Confirmar y Menú.
- En Menú, enlaces a historia, fotos, detalles, RSVP, regalos y FAQ.
- Botón de iglesia **solo si** existe un mapa verificado en la configuración del evento.
- Barra de progreso fina en borgoña, ligada al recorrido real de la página, no a secciones fijas.
- Los botones táctiles principales deben tener objetivos de 44–48 px como mínimo.
- Usar `env(safe-area-inset-bottom)`; el dock no debe cubrir la última sección.
- No imponer smooth-scroll artificial ni anular desplazamiento nativo.
- Verificar iOS Safari además de Chrome; pruebas automatizadas no son prueba de iPhone real.

## Movimiento

- Blur `appear/disappear` **atado al scroll** en títulos y bloques editoriales.
- Entrada antes del centro de la pantalla, lectura mientras el contenido está visible,
  salida únicamente cuando abandona el viewport.
- GSAP y ScrollTrigger con `gsap.context`, `matchMedia` y limpieza al desmontar.
- Para `prefers-reduced-motion`, contenido completo y estático.
- En secciones con controles, usar únicamente aparición inicial de cabecera;
  los campos, errores, botones y estados RSVP no desaparecen al hacer scroll.
- Galería horizontal con dos copias idénticas para bucle fluido, control Pausar/Reanudar
  y navegación manual en modo de movimiento reducido.
- Evitar mantener `will-change` en cientos de palabras.

## Integración con BODA OS

- El RSVP de `/i/[code]` permanece basado en `lib/platform-rsvp.ts` y
  `app/api/rsvp/linked/route.ts`.
- No introducir bases, claves, tablas ni flujos de correo alternativos.
- Las invitaciones de otras bodas no se modifican.
- **No** enviar invitaciones reales hasta validar lectura/escritura en un hogar de prueba.

## Pendientes por confirmar con la pareja

- Iglesia: nombre oficial, dirección/mapa y hora antes de añadir el botón.
- Enlaces externos para mesas de regalos.
- Audio, si quieren publicarlo; la invitación debe funcionar perfectamente sin él.
- E2E real del RSVP y verificación del registro actualizado en BODA OS.
