# Generador de documentos comerciales

> Estado: en proceso (WIP). Uso interno para un solo negocio — no multi-tenant.

Aplicacion web para generar cotizaciones, notas de remision y facturas con la marca del negocio (logo, datos de contacto), listas para imprimir en Carta o A4. Funciona como programa instalado (doble clic y listo), construida con tecnologia web.

## Stack

Vue 3 + TypeScript + Vite 6 · Pinia · Vue Router · Tailwind CSS v4 · IndexedDB (`idb-keyval`) · `html2pdf.js` · GSAP

## Como correrlo

```bash
npm install
npm run dev      # desarrollo
npm run build    # vue-tsc + build (validacion estricta de tipos)
```

## Estado actual

- [x] Editor con 3 plantillas (Classic / Modern / Minimal)
- [x] Persistencia local (IndexedDB + localStorage)
- [x] Exportar PDF + imprimir
- [ ] Validacion formal de formularios (RFC, email, cantidades) — usa `zod`
- [ ] Tests (vitest)

## Notas

Sin backend: 100% local-first. Sin linter/tests configurados todavia (ver `AGENTS.md`).
