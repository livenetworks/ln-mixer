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
//   modal, toast, accordion, toggle, sortable, search, progress, data-store,
//   api-connector, data-coordinator, list (track library: API -> coordinator -> store -> list)
import '@livenetworks/ashlar/components/ln-modal/src/ln-modal.js';
import '@livenetworks/ashlar/components/ln-toast/src/ln-toast.js';
import '@livenetworks/ashlar/components/ln-accordion/src/ln-accordion.js';
import '@livenetworks/ashlar/components/ln-toggle/src/ln-toggle.js';
import '@livenetworks/ashlar/components/ln-sortable/src/ln-sortable.js';
import '@livenetworks/ashlar/components/ln-search/src/ln-search.js';
import '@livenetworks/ashlar/components/ln-progress/src/ln-progress.js';
import '@livenetworks/ashlar/components/ln-data-store/src/ln-data-store.js';
import '@livenetworks/ashlar/components/ln-api-connector/src/ln-api-connector.js';
import '@livenetworks/ashlar/components/ln-data-coordinator/src/ln-data-coordinator.js';
import '@livenetworks/ashlar/components/ln-list/src/ln-list.js';

// Re-export the ln-core helpers the project files consume (cloneTemplate, fillTemplate,
// fill). This bakes them into ln-ashlar.build.js so project files import them from the
// built bundle (production) instead of the ln-ashlar/js/ln-core submodule folder live
// at runtime. The submodule is now a DEV-ONLY build source — production never fetches it.
// ln-core is already pulled into this bundle transitively by the components above; this
// just surfaces the public helpers as named exports (registerDataMapper feeds the
// coordinator's ingress/egress mapper for the track library).
export { cloneTemplate, fillTemplate, fill, dispatch, registerDataMapper } from '@livenetworks/ashlar/components/ln-core/index.js';
