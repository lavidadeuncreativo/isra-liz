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
- Las escenas narrativas y las cabeceras editoriales pueden entrar y salir con blur al abandonar el viewport. Los formularios, botones, enlaces y sus mensajes permanecen visibles y usables.
- Las palabras animadas deben conservar espacios visibles; no concatenar spans.
- Las fotografías deben acompañar la lectura, no tapar titulares.

## Animación
- Usar GSAP + ScrollTrigger.
- Crear animaciones dentro de `gsap.context()` y limpiar con `ctx.revert()`.
- Usar `gsap.matchMedia()` para desktop, móvil y `prefers-reduced-motion`; cuando se solicita reducir movimiento, el contenido debe permanecer visible sin GSAP.
- No bloquear el scroll con librerías de smooth-scroll.
- La barra de progreso se calcula sin re-render por píxel; el dock móvil permanece visible tras abrir la invitación.
- El carrusel continuo debe tener un control de pausa y, con movimiento reducido, permitir recorrer fotografías manualmente.
- El audio solo puede iniciar después de una acción explícita del usuario.

## Contenido
- Tono natural, hablado por la pareja; evitar frases de comercial de joyería.
- Conservar el concepto: “¿Quién habría pensado que estos dos se iban a casar?”.
- La primera escena junta las cabezas de infancia y revela un corazón.
- Incluir historia, fotografías, padres/familias, detalles, RSVP, regalos y preguntas frecuentes.

## RSVP — integración con BODA OS (OBLIGATORIO)
- Las invitaciones reales utilizan `/i/[code]` y el formulario personalizado de `components/WeddingExperience.tsx`.
- Los datos se leen/escriben mediante `lib/platform-rsvp.ts` y `app/api/rsvp/linked/route.ts`, usando las funciones RPC de BODA OS.
- **No** crear otra base de datos, reactivar el RSVP libre por correo ni modificar el esquema global de la plataforma.
- No tocar los invitados ni las invitaciones de otras bodas; mantener la validación del slug.
- No exponer API keys privadas, `service_role` ni códigos reales de invitación.
- El endpoint legado `POST /api/rsvp` debe seguir desactivado cuando la integración está configurada.
- No publicar ni automatizar envíos sin prueba end-to-end de lectura, escritura y actualización del hogar en BODA OS.
- Nunca ocultar el formulario RSVP ni sus mensajes mediante efectos ligados al scroll.

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
- `docs/editorial-system.md`: guía de marca, copy, espaciados y prioridades de UX.
- `app/api/rsvp/linked/route.ts` y `lib/platform-rsvp.ts`: conexión protegida a BODA OS.
- `app/i/[code]/page.tsx`: invitación por hogar.
- `app/api/rsvp/route.ts`: endpoint legado, inactivo cuando hay integración.
