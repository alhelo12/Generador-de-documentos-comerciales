# DocGen — AGENTS.md

## Stack
- Vue 3 (Composition API, `<script setup>`, TS), Pinia, Vue Router, Vite 6, Tailwind v4, idb-keyval
- No test framework, no linter, no formatter config

## Commands
- `npm run dev` — Vite dev server
- `npm run build` — `vue-tsc -b && vite build` (typecheck first, then build). Always run this before committing.

## Architecture
- Entry: `src/main.ts` → creates Pinia + router, mounts `#app`
- Router: 4 lazy routes (`/`, `/editor/:id?`, `/history`, `/settings`) in `src/router/index.ts`
- Types: all in `src/types/document.ts` — `DocumentData`, `StyleConfig`, `CompanyData`, `SectionConfig`, `NumberFormat`, etc.
- Stores (Pinia, all `defineStore` with composition API):
  - `settings.ts` — company info, logo, default style/paper, sections, custom fields, number format. Persisted to localStorage under key `docgen-settings`. `load()` called on init; merges missing sections from `DEFAULT_SECTIONS`.
  - `editor.ts` — reactive `doc` for the active draft. `newDoc(type)`, `loadDoc(data)`, `toJSON()`.
  - `documents.ts` — loaded docs from IndexedDB (keys prefixed `doc-`). `loadAll()`, `saveDoc()`, `deleteDoc()`, `getById()`.
- Persistence: settings → localStorage; documents → IndexedDB via `idb-keyval`

## Key conventions
- `@/` path alias maps to `./src`
- All styles in `src/style.css` using `@import "tailwindcss"` + `@theme` block (no tailwind.config.* file)
- Document templates: `src/components/documents/DocumentClassic.vue`, `DocumentModern.vue`, `DocumentMinimal.vue` — each uses `.document-page` as root class
- All document data flows through `PrintPreview.vue` which delegates to the correct template based on `doc.style`
- `window.print()` is the only "export to PDF" mechanism (no PDF library)
- `usePrint` composable injects a dynamic `<style>` with `@page { size; margin }` before calling `print()`

## Section system
- Sections (`SectionConfig[]`) control which parts of a document render. Stored in settings store; IDs: `company`, `client`, `items`, `totals`, `payment-terms`, `bank-info`, `notes`, `signature-client`, `signature-company`, `custom-fields`
- In the editor, each section toggle has a corresponding data input (shown conditionally when enabled)

## Print quirks
- `@media print` in `style.css`: `.no-print` elements hidden, grid becomes block, sticky becomes static, `.document-page` gets `min-height: 100vh`, `padding: 0`, `box-shadow: none`, `width: 100%`
- The scroll container wrapping the preview uses `print:!border-none print:!rounded-none print:!bg-white print:!overflow-visible print:!max-h-none` to avoid clipping

## Gotchas
- When adding new fields to `DocumentData`, update `blankDoc()` in `editor.ts` with defaults
- When adding new section IDs, update `DEFAULT_SECTIONS` in `types/document.ts`. The settings store's `load()` auto-merges missing sections from defaults.
- The settings store's `load()` is called at module init — if you change saved data structure, add a migration or ensure backward compat in the load function
- All document template components receive `doc: DocumentData` and `sections: SectionConfig[]` as props
- `showDocumentNumber` and other visibility flags live in `styleConfig` (per-document), not in settings
