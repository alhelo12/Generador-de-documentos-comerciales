---
name: DocGen
description: App local de documentos con estética de galería móvil (cards blancas suaves, botones flotantes, pills negras).
colors:
  ink: "#141414"
  ink-hover: "#2E2E2E"
  paper-bg: "#EDEBE6"
  paper-surface: "#ffffff"
  paper-hover: "#F4F2ED"
  paper-active: "#EAE8E2"
  ink-secondary: "#4A4844"
  ink-muted: "#6E6A63"
  gold: "#C9A227"
  success-green: "#146434"
  success-bg: "#E4F3E9"
  warning-amber: "#7A5F00"
  warning-bg: "#FFF1CF"
  danger-red: "#dc2626"
  danger-bg: "#FBE3E3"
  print-ink: "#0f172a"
  print-slate: "#334155"
  print-slate-muted: "#64748b"
  print-border: "#cbd5e1"
  print-slate-dark: "#475569"
  print-slate-light: "#94a3b8"
  print-border-light: "#e2e8f0"
  border: "#E4E1D9"
  border-light: "#EFEDE7"
  shadow-card: "0 12px 32px rgba(20,20,20,0.10)"
  shadow-float: "0 12px 32px rgba(20,20,20,0.16)"
typography:
  display:
    fontFamily: "Nunito, Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 3vw, 1.5rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "0"
  title:
    fontFamily: "Nunito, Inter Tight, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 800
    lineHeight: 1.25
  body:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  meta:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.6875rem"
  classic-serif:
    fontFamily: "Source Serif 4, Georgia, serif"
  modern-sans:
    fontFamily: "Archivo, Inter Tight, system-ui, sans-serif"
  minimal-sans:
    fontFamily: "Archivo, Inter Tight, system-ui, sans-serif"
  document-small:
    fontSize: "8px"
  document-meta:
    fontSize: "9px"
  document-body:
    fontSize: "10px"
  document-title:
    fontSize: "13px"
rounded:
  sm: "14px"
  md: "20px"
  lg: "24px"
  xl: "28px"
  2xl: "32px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  fab:
    size: "44px"
    backgroundColor: "rgba(255,255,255,0.92)"
    rounded: "{rounded.full}"
  fab-dark:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
  input:
    backgroundColor: "{colors.paper-hover}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  card:
    backgroundColor: "{colors.paper-surface}"
    rounded: "{rounded.xl}"
    padding: "16px"
    shadow: "{shadow-card}"
  chip:
    backgroundColor: "{colors.paper-hover}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.full}"
---

# Design System: DocGen

## Overview

**Creative North Star: "La Galería de Bolsillo"**

DocGen se comporta como una galería de arte en el bolsillo: cada documento es una pieza expuesta en una tarjeta blanca suave sobre un fondo gris cálido. La navegación es una barra flotante con iconos etiquetados; las acciones primarias son píldoras negras; los visuales de cada pieza son monogramas generados por CSS (inicial del cliente sobre gradiente rotativo + marco dorado en la destacada).

La voz es cercana y simple. Todo botón lleva nombre visible; nada depende solo de un icono.

**Key Characteristics:**
- Cards blancas radio 24-28px con sombra suave sobre fondo cálido.
- Píldoras negras para acciones primarias; FABs circulares flotantes.
- Tipografía redondeada (Nunito) en títulos; Inter Tight en cuerpo; mono solo en folios.
- Monogramas CSS en vez de imágenes (5 gradientes por hash de id).
- Entradas con reveal CSS breve (`rise` 0.45s); sin librerías de animación.

## Colors

Tinta casi negra sobre marfil cálido. Sin acentos de color salvo estados semánticos y el marco dorado de la pieza destacada.

### Primary
- **Tinta** (#141414): acciones primarias, navegación activa, precios.
- **Dorado** (#C9A227): solo el marco de la pieza destacada.

### Text
- **Tinta** (#141414, ~16:1): texto principal y botones.
- **Secundario** (#4A4844, ~8:1): descripciones.
- **Tenue** (#6E6A63, ≥4.5:1): solo metadatos 11px o mayores.

### Status chips
- Verde #146434 / #E4F3E9 · Ocre #7A5F00 / #FFF1CF · Rojo #dc2626 / #FBE3E3. Todos ≥4.5:1.

**The Pill Rule.** Toda acción primaria es una píldora negra con nombre visible; los iconos solos están prohibidos salvo decoración con `aria-hidden`.

## Typography

**Display:** Nunito 800 para títulos de cards y cabeceras.
**Body:** Inter Tight para descripciones y controles.
**Mono:** JetBrains Mono solo para folios y numeración.

## Layout

Shell de una columna con tab bar flotante inferior (siempre visible, `no-print`, padding inferior 96px en el main). Contenido centrado hasta 1100px; grids fluidos `repeat(auto-fill, minmax(230px, 1fr))`. Filas horizontales con scroll (stats, filtros) llevan `pb` para el scrollbar.

## Elevation & Depth

Sombras suaves y amplias, nunca bordes duros: card `0 12px 32px rgba(20,20,20,.10)`, flotantes `0 12px 32px rgba(20,20,20,.16)`. Hover: elevar −4px, sin cambios de borde.

## Shapes

Todo redondeado: inputs 14px, cards 24-28px, botones y tabs 9999px. Los documentos impresos quedan fuera del sistema (blanco, geometría propia).

## Components

### Buttons
- **Primary:** píldora negra, texto blanco 12-13px bold, sombra flotante.
- **Secondary:** píldora blanca con sombra xs.
- **FAB:** círculo 44px blanco blur; variante oscura para acción principal.
- **Tab bar:** píldora flotante con 4 items icono + etiqueta 9px; activo negro.

### Cards
- **Phone-card:** blanca 28px, sombra card, padding 14-16px.
- **Art:** monograma con inicial, `aria-hidden`, 5 gradientes `mono-0..4`.
- **Featured:** marco dorado `art-frame` + CTA `Abrir →`.

### Inputs
- Fondo `#F4F2ED` sin borde; foco: fondo blanco + borde tinta. Labels 11px bold tenues.

### Document Preview
Blanco independiente del shell; plantillas Classic/Modern/Minimal B/N print-safe. El radio y la sombra del contenedor se anulan en `@media print`.

## Accessibility

- Contraste AA en todo texto (tenue ≥4.5:1).
- Foco visible global 1.5px tinta.
- Reveal CSS instantáneo con `prefers-reduced-motion`.
- Targets táctiles ≥44px en acciones primarias (paginación incluida).
- `h1` por vista (sr-only donde el diseño no lo muestra).

## Do's and Don'ts

### Do:
- **Do** nombrar cada botón con texto visible.
- **Do** usar tokens y los utils `.phone-card`, `.fab`, `.pill`, `.chip`, `.monogram`.
- **Do** conservar el preview imprimible blanco y sin radio en print.
- **Do** ocultar la tab bar en impresión (`no-print`).

### Don't:
- **Don't** iconos sin etiqueta ni `aria-label`.
- **Don't** amarillos ni acentos fuera de estados y el marco dorado.
- **Don't** tablas densas donde quepa un grid de piezas.
- **Don't** reintroducir librerías de animación para reveals simples.
