# AGENTS.md — Invitación Israel & Liz

## Objetivo del proyecto
Construir una invitación de boda editorial, íntima y mobile-first para Israel y Liz.
Fecha: 20 de febrero de 2027.
Lugar: Salón Presidente, Uruapan, Michoacán.

## Reglas visuales
- Mantener fondo blanco hueso, negro cálido y vino.
- Titulares con Instrument Serif; interfaz con Figtree.
- Evitar tarjetas genéricas de SaaS, degradados intensos y animaciones bruscas.
- El contenido principal debe leerse perfectamente en pantallas de 360 px.
- Toda animación de entrada debe tener salida con blur cuando la escena abandona el viewport.
- Las palabras animadas deben conservar espacios visibles; no concatenar spans.
- Las fotografías deben acompañar la lectura, no tapar titulares.

## Animación
- Usar GSAP + ScrollTrigger.
- Crear animaciones dentro de `gsap.context()` y limpiar con `ctx.revert()`.
- Usar `gsap.matchMedia()` para desktop, móvil y `prefers-reduced-motion`.
- No bloquear el scroll con librerías de smooth-scroll.
- El audio solo puede iniciar después de una acción explícita del usuario.

## Contenido
- Tono natural, hablado por la pareja; evitar frases de comercial de joyería.
- Conservar el concepto: “¿Quién habría pensado que estos dos se iban a casar?”.
- La primera escena junta las cabezas de infancia y revela un corazón.
- Incluir historia, fotografías, padres/familias, detalles, RSVP, regalos y preguntas frecuentes.

## RSVP
- Endpoint: `POST /api/rsvp`.
- Validar y sanear entradas.
- No exponer API keys al cliente.
- No simular éxito en producción cuando falten variables de entorno.
- Mantener honeypot básico contra bots.

## Regalos
- No procesar tarjetas dentro del sitio.
- Enlazar a una página de pago externa mediante `NEXT_PUBLIC_GIFT_LINK`.
- No publicar números de tarjeta o CLABE directamente en el repositorio.

## Antes de entregar cambios
Ejecutar:

```bash
npm run lint
npm run build
```

Revisar como mínimo:
- 390 × 844 px
- 768 × 1024 px
- 1440 × 900 px

## Archivos principales
- `data/wedding.ts`: textos, fechas, padres, galería, agenda y FAQ.
- `components/WeddingExperience.tsx`: experiencia, animaciones, formulario y regalos.
- `app/globals.css`: sistema visual responsive.
- `app/api/rsvp/route.ts`: envío de confirmaciones.
