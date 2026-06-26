# Invitación de boda — Israel & Liz

Invitación digital editorial construida con Next.js, TypeScript y GSAP ScrollTrigger.

**Fecha:** 20 de febrero de 2027  
**Lugar:** Salón Presidente, Uruapan, Michoacán

## Qué incluye

- Storytelling controlado por scroll.
- Blur appear y blur disappear reales con GSAP ScrollTrigger.
- Espaciado correcto entre palabras animadas.
- Escena inicial con fotografías de infancia que se acercan y forman un corazón.
- Navegación rápida y cuenta regresiva para la fecha.
- Sección de historia y galería de la relación.
- Padres y familias.
- Fecha, agenda, ubicación, vestimenta y hospedaje.
- Formulario RSVP con API de Next.js.
- Correo de notificación y confirmación mediante Resend.
- Mesa de experiencias para la luna de miel.
- Preguntas frecuentes.
- Metadatos `noindex` para evitar indexación accidental.
- Configuración e instrucciones para Codex mediante `AGENTS.md`.

## 1. Ejecutar localmente

Necesitas Node.js 20.9 o posterior y `pnpm` disponible vía Corepack.

```bash
corepack enable
pnpm install
pnpm dev
```

Abre `http://localhost:3000`.

## 2. Cambiar contenido

Edita:

```text
data/wedding.ts
```

Ahí están:

- Nombres.
- Fecha y hora.
- Lugar y mapa.
- Nombres de padres.
- Historia.
- Galería.
- Agenda.
- Regalos.
- FAQ.

## 3. Sustituir fotografías

Reemplaza los SVG dentro de:

```text
public/images/
```

Puedes conservar los nombres o actualizar las rutas en `data/wedding.ts`.

Imágenes principales:

```text
infancia-liz.svg
infancia-israel.svg
nosotros-01.svg
nosotros-02.svg
galeria-01.svg
galeria-02.svg
galeria-03.svg
galeria-04.svg
```

Para producción usa WebP o AVIF, preferentemente por debajo de 350 KB por archivo.

## 4. Agregar narración

Coloca el archivo aquí:

```text
public/audio/narracion.mp3
```

El navegador no inicia el audio automáticamente: el invitado debe elegir “Entrar con audio”.

## 5. Activar RSVP

El formulario utiliza el endpoint:

```text
POST /api/rsvp
```

Copia el archivo de variables:

```bash
cp .env.example .env.local
```

Completa:

```env
RESEND_API_KEY=re_...
RSVP_TO_EMAIL=tu-correo@dominio.com
RSVP_FROM_EMAIL=Invitacion Isra&Liz <invitacion@tu-dominio.com>
```

En producción necesitas verificar el dominio remitente en Resend.

## 6. Activar regalos

Si quieres activar las mesas externas, agrega sus ligas:

```env
NEXT_PUBLIC_PALACIO_GIFT_LINK=https://...
NEXT_PUBLIC_AMAZON_GIFT_LINK=https://...
```

La aportacion libre se registra por correo y no procesa datos de tarjetas en el sitio.

## 7. Publicar en GitHub

Si partes de un repo vacío:

```text
israel-liz-wedding
```

Después, desde esta carpeta:

```bash
git init
git add .
git commit -m "feat: initial wedding invitation"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/israel-liz-wedding.git
git push -u origin main
```

## 8. Conectar Codex

Conecta el repositorio en Codex y comienza usando el contenido de `CODEX_PROMPT.md`.

`AGENTS.md` ya explica a Codex la identidad, arquitectura, pruebas y límites del proyecto.

## 9. Desplegar en Vercel

1. En Vercel, elige **Add New Project**.
2. Importa el repositorio de GitHub.
3. Vercel detectará Next.js y `pnpm`.
4. Añade las variables de entorno de `.env.example`.
5. Haz el primer deploy.
6. Cada push y pull request generará una nueva implementación o vista previa.

## Privacidad

La página incluye `noindex`, pero eso no equivale a protección por contraseña. Antes de compartirla, conviene añadir un código de invitación o habilitar Deployment Protection en Vercel.

## Checklist antes de publicar

- [ ] Sustituir todas las imágenes temporales.
- [ ] Agregar audio final.
- [ ] Completar nombres de padres.
- [ ] Confirmar hora real.
- [ ] Agregar mapa real.
- [ ] Agregar hospedaje.
- [ ] Configurar RSVP.
- [ ] Configurar link de regalos.
- [ ] Probar en iPhone y Android.
- [ ] Revisar accesibilidad y movimiento reducido.
- [ ] Activar protección antes de enviar la liga.
