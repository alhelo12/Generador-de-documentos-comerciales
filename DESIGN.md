---
name: DocGen
description: Generador local de documentos comerciales con un escritorio de cristal preciso y tecnico.
colors:
  signal-blue: "#4b6ef5"
  signal-blue-hover: "#3d5dd8"
  paper-bg: "#f0f2f5"
  paper-surface: "#ffffff"
  paper-hover: "#f7f8fa"
  paper-active: "#ebedf1"
  ink: "#1a1d26"
  ink-secondary: "#5f6577"
  ink-muted: "#6b7280"
  success-green: "#16a34a"
  warning-amber: "#d97706"
  danger-red: "#dc2626"
  violet: "#7c3aed"
  orange: "#ea580c"
  teal: "#0d9488"
  print-ink: "#0f172a"
  print-slate: "#334155"
  print-slate-muted: "#64748b"
  print-border: "#cbd5e1"
  print-slate-dark: "#475569"
  print-slate-light: "#94a3b8"
  print-border-light: "#e2e8f0"
  border: "rgba(0, 0, 0, 0.07)"
  border-light: "rgba(0, 0, 0, 0.04)"
  glass: "rgba(255, 255, 255, 0.6)"
  glass-hover: "rgba(255, 255, 255, 0.8)"
typography:
  display:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 5vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.12em"
    fontVariation: "uppercase"
  classic-serif:
    fontFamily: "Source Serif 4, serif"
  modern-sans:
    fontFamily: "Plus Jakarta Sans, sans-serif"
  minimal-sans:
    fontFamily: "Inter Tight, sans-serif"
  Classic-Serif:
    fontFamily: "Source Serif 4, serif"
  document-template-alias:
    fontFamily: "Classic-Serif"
  document-small:
    fontSize: "8px"
  document-meta:
    fontSize: "9px"
  document-body:
    fontSize: "10px"
  document-title:
    fontSize: "13px"
rounded:
  xs: "3px"
  form: "4px"
  text: "8px"
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "22px"
  2xl: "28px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-secondary:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  input:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  card:
    backgroundColor: "rgba(255, 255, 255, 0.7)"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: DocGen

## Overview

**Creative North Star: "El Escritorio de Cristal"**

DocGen se comporta como un escritorio de trabajo claro y preciso: superficies blancas translúcidas, jerarquía tipográfica firme y controles que responden sin ruido. La transparencia y el desenfoque aportan ligereza, mientras que la elevación funcional mantiene separados el lienzo, los paneles y las acciones.

La voz es precisa y técnica. El color no decora por exceso: el Azul señal aparece para indicar acción, foco y navegación activa. Los estados semánticos se mantienen sobrios y legibles, y la textura de grano aporta una pequeña imperfección material sin competir con los documentos.

**Key Characteristics:**
- Superficies claras con vidrio translúcido y desenfoque.
- Azul señal reservado para acciones y estados activos.
- Elevación baja, bordes finos y separación funcional.
- Inter Tight con titulares compactos y etiquetas técnicas.
- Movimiento breve, escalonado y orientado a confirmar cambios.

## Colors

La paleta combina papel frio, tinta grafito y un azul operativo de alta visibilidad.

### Primary
- **Azul señal** (#4b6ef5): Acento principal para acciones primarias, foco, navegación activa y estados de selección.
- **Azul señal profundo** (#3d5dd8): Estado hover y confirmación de interacción del acento principal.

### Secondary
- **Verde validacion** (#16a34a): Estado positivo para documentos pagados o acciones completadas.
- **Ambar atencion** (#d97706): Estado de advertencia para documentos enviados o acciones pendientes.

### Tertiary
- **Violeta auxiliar** (#7c3aed): Acento secundario para totales y datos destacados.
- **Naranja operativo** (#ea580c): Diferenciacion visual de remisiones y acciones logísticas.

### Neutral
- **Papel frio** (#f0f2f5): Fondo general de la aplicacion.
- **Superficie blanca** (#ffffff): Superficies principales y documentos.
- **Superficie elevada** (#f7f8fa): Hover y estados tonales intermedios.
- **Superficie activa** (#ebedf1): Estado presionado o seleccionado.
- **Tinta grafito** (#1a1d26): Texto principal.
- **Tinta secundaria** (#5f6577): Texto auxiliar y controles secundarios.
- **Tinta tenue** (#6b7280): Metadatos, etiquetas y placeholders.
- **Borde** (rgba(0, 0, 0, 0.07)): Separadores estructurales.
- **Borde tenue** (rgba(0, 0, 0, 0.04)): Divisiones de baja importancia.

**The Signal Rule.** El Azul señal debe indicar una decisión o un estado; no se usa como relleno decorativo dominante.

## Typography

**Display Font:** Inter Tight (with system-ui, sans-serif)
**Body Font:** Inter Tight (with system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono para identificadores y numeracion.

**Character:** Inter Tight aporta una voz compacta, tecnica y contemporanea. El peso alto concentra la atencion en acciones y encabezados; los labels pequeños y espaciados funcionan como anotaciones de sistema.

### Hierarchy
- **Display** (800, clamp(1.875rem, 5vw, 3rem), 1.1): Titulares principales del dashboard y vistas de trabajo.
- **Headline** (800, clamp(1.5rem, 3vw, 2.25rem), 1.1): Encabezados de superficies secundarias.
- **Title** (700, 1rem, 1.25): Titulos de tarjetas, paneles y grupos de controles.
- **Body** (400, 0.875rem, 1.5): Descripciones y contenido operativo.
- **Label** (700, 0.6875rem, 1.2, tracking 0.12em, uppercase): Metadatos y nombres de campo.

**The Compact Header Rule.** Los encabezados deben ser firmes y compactos; la informacion secundaria queda debajo en una escala menor, nunca compite en el mismo peso.

## Layout

La aplicacion usa un shell de dos regiones: navegacion lateral fija en escritorio y dock inferior en movil, junto a un area principal flexible. Las vistas se centran en contenedores de hasta 1200-1400px con padding progresivo de 20-32px. El dashboard usa una cuadricula densa de cuatro estadisticas en escritorio y dos columnas en movil, seguida de una tabla principal y una columna de acciones.

El editor conserva tres zonas: lista de paneles, preview de documento y panel de edicion. En pantallas pequeñas las zonas se apilan. La cadencia espacial usa 8px como unidad base, 16px entre controles y 24-32px entre grupos.

## Elevation & Depth

El sistema usa elevacion funcional: las sombras son bajas y difusas, mientras que la transparencia, el desenfoque y los bordes tonales distinguen capas. Las superficies elevadas son blancas al 70% y los estados presionados usan una sombra interior negra muy sutil. El foco se expresa con un anillo Azul señal de 3px.

### Shadow Vocabulary
- **Card base** (`0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)`): Tarjetas y paneles en reposo.
- **Card hover** (`0 8px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)`): Elevacion de tarjetas interactivas.
- **Glass inset** (`inset 0 1px 3px rgba(0, 0, 0, 0.06)`): Superficies presionadas y filtros.

**The Functional Elevation Rule.** Una sombra solo debe explicar una capa, un hover o un estado presionado; no se usa para adornar cada elemento.

## Shapes

La forma es redondeada y controlada. Los controles usan 10-14px, las tarjetas 18-22px y los shells principales 28px cuando el espacio lo permite. Los bordes son finos y de bajo contraste. Los documentos impresos mantienen fondo blanco y geometria propia, separados visualmente del escritorio mediante un contenedor redondeado y una sombra amplia.

## Components

### Buttons
- **Shape:** Redondeo medio y suave (14px).
- **Primary:** Gradiente Azul señal a violeta, texto blanco, padding aproximado de 10px 16px y sombra de acento moderada.
- **Hover / Focus:** Elevacion de 1px, sombra mas amplia y foco visible del navegador.
- **Secondary / Ghost:** Vidrio claro con texto secundario; ghost usa solo cambio tonal y de color.

### Chips
- **Style:** Fondos semitransparentes semanticos con texto verde, ambar, rojo o gris.
- **State:** Los filtros seleccionados usan fondo Azul señal translucido y texto Azul señal.

### Cards / Containers
- **Corner Style:** 18-22px en tarjetas; 28px en superficies principales.
- **Background:** Blanco translucido al 70% para elevadas; vidrio al 60% para controles.
- **Shadow Strategy:** Elevacion baja en reposo y sombra de hover solo en elementos interactivos.
- **Border:** Borde negro al 4-7% y borde blanco interior sutil en superficies elevadas.
- **Internal Padding:** 16px en controles compactos, 20px en tarjetas y 24-32px en superficies mayores.

### Inputs / Fields
- **Style:** Fondo blanco translucido, borde negro al 8%, redondeo de 14px y texto grafito.
- **Focus:** Borde Azul señal y halo de 3px con opacidad baja.
- **Error / Disabled:** Rojo semantico para error; reduccion de opacidad para disabled.

### Navigation
- **Style:** Navegacion lateral elevada con vidrio; cada item tiene icono lineal y label tecnico.
- **Default:** Texto gris medio y fondo transparente.
- **Hover:** Fondo negro translucido y texto mas oscuro.
- **Active:** Fondo Azul señal translucido, texto Azul señal y una barra lateral de 3px en escritorio.
- **Mobile:** Dock inferior fijo, items distribuidos horizontalmente y labels ocultos en anchos pequeños.

### Document Preview
El documento es una superficie blanca independiente del shell. Sus tres plantillas conservan sus propios sistemas de impresion; el preview no hereda la textura, el vidrio ni los colores del escritorio.

## Do's and Don'ts

### Do:
- **Do** usar Inter Tight y JetBrains Mono solo para numeracion o datos identificadores.
- **Do** reservar Azul señal para acciones, foco, seleccion y navegacion activa.
- **Do** mantener fondos claros, vidrio translucido y bordes de bajo contraste.
- **Do** usar elevacion baja para explicar jerarquia funcional.
- **Do** conservar el preview documental blanco y listo para imprimir.
- **Do** mantener el dock inferior en movil y la navegacion lateral en escritorio.

### Don't:
- **Don't** volver a una paleta oscura sin una decision explicita de producto.
- **Don't** llenar cada superficie con sombras fuertes, gradientes o glow.
- **Don't** usar el Azul señal como decoracion sin significado operativo.
- **Don't** mezclar familias tipograficas nuevas sin una razon de sistema.
- **Don't** aplicar el vidrio al documento imprimible ni alterar sus colores de salida.
