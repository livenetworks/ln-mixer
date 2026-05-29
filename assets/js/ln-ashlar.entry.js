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

// Re-export the ln-core helpers the project files consume (cloneTemplate, fillTemplate,
// fill). This bakes them into ln-ashlar.build.js so project files import them from the
// built bundle (production) instead of the ln-ashlar/js/ln-core submodule folder live
// at runtime. The submodule is now a DEV-ONLY build source — production never fetches it.
// ln-core is already pulled into this bundle transitively by the components above; this
// just surfaces the three public helpers as named exports.
export { cloneTemplate, fillTemplate, fill } from 'ln-ashlar/js/ln-core/index.js';
