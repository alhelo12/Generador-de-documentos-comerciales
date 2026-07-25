---
target: toda la aplicación DocGen
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 5
timestamp: 2026-07-25T18-50-39Z
slug: src-views-dashboardview-vue
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 2/4 | Save toasts exist, but local persistence and search state are not visible enough. |
| 2 | Match System / Real World | 3/4 | Commercial document terminology is natural; some editor groups remain abstract. |
| 3 | User Control and Freedom | 2/4 | Back and delete confirmation exist, but no undo, draft recovery, or discard-changes flow. |
| 4 | Consistency and Standards | 2/4 | Visual system is coherent, but views bypass shared primitives and duplicate settings access. |
| 5 | Error Prevention | 2/4 | Numeric constraints and delete confirmation exist; validation and unsaved-change protection are missing. |
| 6 | Recognition Rather Than Recall | 3/4 | Labels and active states help, but mobile navigation and editor configuration add recall load. |
| 7 | Flexibility and Efficiency of Use | 1/4 | No shortcuts, duplicate-document flow, bulk actions, or wired dashboard search. |
| 8 | Aesthetic and Minimalist Design | 3/4 | The glass system is clean, but generic metrics and decorative controls dilute the workstation focus. |
| 9 | Error Recovery | 2/4 | Toast errors preserve the page, but recovery actions and persistent status are limited. |
| 10 | Help and Documentation | 0/4 | No contextual help, onboarding, or task-oriented documentation is visible. |

**Total: 20/40. Rating: Acceptable; significant improvement needed.**

## Design Specificity Verdict

The product has a coherent visual point of view in the “Escritorio de Cristal”: light glass surfaces, signal blue, compact Inter Tight typography, and a distinct white document preview. The printable document surface is the strongest product-specific element.

The surrounding information architecture is still category-interchangeable. Greeting, four metric cards, search, notification, avatar, recent table, and quick-access cards resemble a generic SaaS dashboard. The interface should foreground issuing and managing commercial documents, not generic analytics.

The detector found zero findings after the latest hardening pass. Browser inspection through a temporary Vite server confirmed successful loading at 1280px and 375px, no horizontal body overflow, and no console errors. The dashboard search accepts text but has no filtering source path; this is a verified implementation issue, not a detector finding.

## Overall Impression

DocGen feels polished and calm, but its strongest visual work is attached to the document preview rather than the primary workflow. The biggest opportunity is to turn the dashboard and editor into a confident local document workstation: create, edit, save locally, and export with fewer competing decisions.

## What's Working

- The document preview is tangible and product-specific; the three templates make the output feel ready for business use.
- The light glass system is coherent: surfaces, low elevation, signal blue, and typography reinforce one another.
- Quick creation actions use explicit document labels and descriptions, making the three main document types discoverable.
- Route-level lazy loading, visible focus styles, responsive navigation, and 44px touch targets are strong implementation foundations.

## Priority Issues

### [P1] Generic dashboard hierarchy

**Why it matters:** The user's primary job is creating and managing commercial documents, but the first viewport prioritizes metrics and decorative account controls.

**Evidence:** `src/views/DashboardView.vue:59-106`, `src/views/DashboardView.vue:108-215`.

**Fix:** Make “Nueva factura”, “Nueva cotización” and “Nueva remisión” the dominant first-viewport action cluster. Move metrics below recent work, remove or demote non-functional notification/avatar controls, and make “Total facturado” invoice-only.

### [P1] Editor exposes too many equal-weight decisions

**Why it matters:** A simple invoice becomes a control-room task with seven panels and many configuration choices visible at once.

**Evidence:** `src/views/EditorView.vue:147-162` and the right-side editing panels.

**Fix:** Guide the default path as `Cliente → Conceptos → Revisar`. Group appearance, optional sections, conditions, and signatures under “Más opciones”. Keep a persistent completion/status indicator.

### [P1] Local-first promise is not visible enough

**Why it matters:** Local persistence is a core product promise, but the UI does not show whether the current document is saved locally, has pending changes, or can be recovered.

**Evidence:** `PRODUCT.md:13-17`, `src/views/EditorView.vue:129-138`, `src/stores/documents.ts:12-25`.

**Fix:** Add `Guardado local`, `Cambios sin guardar`, and `Guardando` states near the primary action. Keep the user in the editor after saving or provide a clear completion state with document number and next action. Surface storage failures instead of treating them as empty data.

### [P1] Dashboard search promises behavior it does not provide

**Why it matters:** Users can type into the search field but recent documents do not filter. This breaks trust and creates inconsistent behavior with History search.

**Evidence:** `src/views/DashboardView.vue:69-71`.

**Fix:** Wire the input to recent document filtering or remove it until filtering exists.

### [P1] Mobile navigation and editor density

**Why it matters:** Mobile users need immediate recognition and thumb-friendly progress. Hiding navigation labels and stacking a long editor increases context switching.

**Evidence:** `src/components/layout/AppSidebar.vue:57-65`, `src/views/EditorView.vue:143-185`.

**Fix:** Keep compact labels in the bottom dock. Use progressive disclosure in the editor and move primary save/export actions into a sticky bottom action area on mobile.

### [P2] Feedback and recovery are too transient

**Why it matters:** Toasts disappear, are not live regions, and do not provide recovery actions for import, storage, or export failures.

**Evidence:** `src/components/ui/AppToast.vue:20-33`, `src/stores/documents.ts:12-25`.

**Fix:** Add persistent inline status for save/import/export and actionable recovery such as “Reintentar”. Add `role="status"` and `aria-live` for non-blocking feedback.

## Persona Red Flags

### Alex: Power User

- No shortcuts for new document, save, print, or switching editor panels.
- Save redirects to the dashboard instead of preserving editing context.
- No duplicate-document flow for recurring invoices.
- Dashboard search is visually present but functionally disconnected.
- Print and PDF actions are duplicated in the top bar and below the preview.

### Sam: Accessibility-Dependent User

- Mobile navigation labels disappear at small widths, leaving icon-only primary navigation.
- The modal has focus trapping and Escape support, but lacks explicit dialog semantics and focus restoration.
- Toast feedback is not announced as a live region.
- Form labeling is improved but remains inconsistent between shared and inline controls.
- Status chips rely on color plus small text; shape or icon cues would strengthen recognition.

### Casey: Distracted Mobile User

- The editor stacks panels, preview, and controls into a long scroll.
- Save and export actions start at the top rather than staying in the thumb zone.
- Line-item editing remains a dense horizontally scrolling table.
- Returning after interruption does not show draft or recovery status.
- Search and decorative header controls consume scarce mobile space.

## Cognitive Load

Five of eight checklist items fail: single focus, chunking, visual hierarchy, one decision at a time, and progressive disclosure. The editor is the highest-pressure surface: seven panel choices, multiple template options, five accent colors, typography/layout controls, and three save/export actions compete simultaneously.

## Minor Observations

- Settings appears both as a main navigation item and a separate sidebar footer link.
- “Resumen en tiempo real” overstates the behavior of local data loaded on mount.
- Empty states say there are no documents but do not always offer the next creation action.
- The hard-coded `JD` avatar implies an account identity not supported by the local-first product.
- Settings auto-save and explicit save coexist without a clear ownership model.
- The app-level ambient motion should remain guarded by reduced-motion preferences.

## Questions to Consider

- What if the dashboard's dominant question were “¿Qué documento necesitas crear?”
- Does “Total facturado” belong on an operational document workstation, or is it borrowed dashboard language?
- Could a correct invoice be created in three guided steps before exposing configuration?
- If the product is local-first, why is local saving less visible than the decorative avatar?
- Would a user understand the difference between “Documentos” and “Historial” without studying the sidebar?
