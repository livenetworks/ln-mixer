// ln-ashlar vendor subset — ONLY the components ln-mixer actually uses.
// Built into ln-ashlar.build.js by vite.vendor.config.js.
//
// Why a project-owned entry instead of ln-ashlar/js/index.js? The master entry
// registers all ~35 ln-ashlar components (table, data-table, tabs, nav, dropdown,
// tooltip, upload, ln-icons CDN sprite, …) that this app never uses. Listing only
// the used components here is an explicit allowlist — add a line if the app starts
// using another component. ln-core helpers are pulled in transitively (each
// component imports them). No SCSS import here → no CSS sidecar; styles come from
// assets/scss/app.scss (which @use's the matching SCSS subset).
//
// Usage evidence (index.html data-ln-* + project JS):
//   modal, toast, accordion, toggle, sortable, search, progress, data-store
import 'ln-ashlar/js/ln-modal/src/ln-modal.js';
import 'ln-ashlar/js/ln-toast/src/ln-toast.js';
import 'ln-ashlar/js/ln-accordion/src/ln-accordion.js';
import 'ln-ashlar/js/ln-toggle/src/ln-toggle.js';
import 'ln-ashlar/js/ln-sortable/src/ln-sortable.js';
import 'ln-ashlar/js/ln-search/src/ln-search.js';
import 'ln-ashlar/js/ln-progress/src/ln-progress.js';
import 'ln-ashlar/js/ln-data-store/src/ln-data-store.js';
