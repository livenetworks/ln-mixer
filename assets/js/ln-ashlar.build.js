const X = {};
function yt(o, r) {
  X[o] || (X[o] = document.querySelector('[data-ln-template="' + o + '"]'));
  const h = X[o];
  return h ? h.content.cloneNode(!0) : (console.warn("[" + (r || "ln-core") + '] Template "' + o + '" not found'), null);
}
function S(o, r, h) {
  o.dispatchEvent(new CustomEvent(r, {
    bubbles: !0,
    detail: h || {}
  }));
}
function R(o, r, h) {
  const u = new CustomEvent(r, {
    bubbles: !0,
    cancelable: !0,
    detail: h || {}
  });
  return o.dispatchEvent(u), u;
}
function vt(o, r) {
  if (!o || !r) return o;
  const h = o.querySelectorAll("[data-ln-field]");
  for (let e = 0; e < h.length; e++) {
    const i = h[e], l = i.getAttribute("data-ln-field");
    r[l] != null && (i.textContent = r[l]);
  }
  const u = o.querySelectorAll("[data-ln-attr]");
  for (let e = 0; e < u.length; e++) {
    const i = u[e], l = i.getAttribute("data-ln-attr").split(",");
    for (let c = 0; c < l.length; c++) {
      const m = l[c].trim().split(":");
      if (m.length !== 2) continue;
      const g = m[0].trim(), b = m[1].trim();
      r[b] != null && i.setAttribute(g, r[b]);
    }
  }
  const E = o.querySelectorAll("[data-ln-show]");
  for (let e = 0; e < E.length; e++) {
    const i = E[e], l = i.getAttribute("data-ln-show");
    l in r && i.classList.toggle("hidden", !r[l]);
  }
  const p = o.querySelectorAll("[data-ln-class]");
  for (let e = 0; e < p.length; e++) {
    const i = p[e], l = i.getAttribute("data-ln-class").split(",");
    for (let c = 0; c < l.length; c++) {
      const m = l[c].trim().split(":");
      if (m.length !== 2) continue;
      const g = m[0].trim(), b = m[1].trim();
      b in r && i.classList.toggle(g, !!r[b]);
    }
  }
  return o;
}
function qt(o, r) {
  if (!o || !r) return o;
  const h = document.createTreeWalker(o, NodeFilter.SHOW_TEXT);
  for (; h.nextNode(); ) {
    const u = h.currentNode;
    u.textContent.indexOf("{{") !== -1 && (u.textContent = u.textContent.replace(
      /\{\{\s*(\w+)\s*\}\}/g,
      function(E, p) {
        return r[p] !== void 0 ? r[p] : "";
      }
    ));
  }
  return o;
}
function J(o, r) {
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", function() {
      J(o, r);
    }), console.warn("[" + r + '] Script loaded before <body> — add "defer" to your <script> tag');
    return;
  }
  o();
}
function At(o, r, h) {
  if (o) {
    const u = o.querySelector('[data-ln-template="' + r + '"]');
    if (u) return u.content.cloneNode(!0);
  }
  return yt(r, h);
}
function z(o, r, h, u) {
  if (o.nodeType !== 1) return;
  const p = r.indexOf("[") !== -1 || r.indexOf(".") !== -1 || r.indexOf("#") !== -1 ? r : "[" + r + "]", e = Array.from(o.querySelectorAll(p));
  o.matches && o.matches(p) && e.push(o);
  for (const i of e)
    i[h] || (i[h] = new u(i));
}
function G(o) {
  return !!(o.offsetWidth || o.offsetHeight || o.getClientRects().length);
}
function F(o, r, h, u, E = {}) {
  const p = E.extraAttributes || [], e = E.onAttributeChange || null, i = E.onInit || null;
  function l(c) {
    const m = c || document.body;
    z(m, o, r, h), i && i(m);
  }
  return J(function() {
    const c = new MutationObserver(function(g) {
      for (let b = 0; b < g.length; b++) {
        const A = g[b];
        if (A.type === "childList") {
          for (let C = 0; C < A.addedNodes.length; C++) {
            const L = A.addedNodes[C];
            L.nodeType === 1 && (z(L, o, r, h), i && i(L));
          }
          for (let C = 0; C < A.removedNodes.length; C++) {
            const L = A.removedNodes[C];
            if (L.nodeType === 1) {
              const d = o.indexOf("[") !== -1 || o.indexOf(".") !== -1 || o.indexOf("#") !== -1 ? o : "[" + o + "]", y = Array.from(L.querySelectorAll(d));
              L.matches && L.matches(d) && y.push(L);
              for (let v = 0; v < y.length; v++) {
                const T = y[v];
                if (!document.contains(T)) {
                  const x = T[r];
                  x && typeof x.destroy == "function" && x.destroy();
                }
              }
            }
          }
        } else A.type === "attributes" && (e && A.target[r] ? e(A.target, A.attributeName) : (z(A.target, o, r, h), i && i(A.target)));
      }
    });
    let m = [];
    if (o.indexOf("[") !== -1) {
      const g = /\[([\w-]+)/g;
      let b;
      for (; (b = g.exec(o)) !== null; )
        m.push(b[1]);
    } else
      m.push(o);
    c.observe(document.body, {
      childList: !0,
      subtree: !0,
      attributes: !0,
      attributeFilter: m.concat(p)
    });
  }, u || (o.indexOf("[") === -1 ? o.replace("data-", "") : "component")), window[r] = l, document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
    l(document.body);
  }) : l(document.body), l;
}
const st = {};
function Et(o, r) {
  st[o] = r;
}
function wt(o) {
  return st[o] || { ingress: (r) => r, egress: (r) => r };
}
typeof window < "u" && (window.lnCore = window.lnCore || {}, window.lnCore.registerDataMapper = Et, window.lnCore.getDataMapper = wt);
const St = "ln:";
function xt() {
  return location.pathname.replace(/\/+$/, "").toLowerCase() || "/";
}
function at(o, r) {
  const h = r.getAttribute("data-ln-persist"), u = h !== null && h !== "" ? h : r.id;
  return u ? St + o + ":" + xt() + ":" + u : (console.warn('[ln-persist] Element requires id or data-ln-persist="key"', r), null);
}
function Ct(o, r) {
  const h = at(o, r);
  if (!h) return null;
  try {
    const u = localStorage.getItem(h);
    return u !== null ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}
function ot(o, r, h) {
  const u = at(o, r);
  if (u)
    try {
      localStorage.setItem(u, JSON.stringify(h));
    } catch {
    }
}
let N = null;
async function it(o) {
  if (!o) {
    N = null;
    return;
  }
  try {
    const r = new TextEncoder(), h = await crypto.subtle.digest("SHA-256", r.encode(o));
    N = await crypto.subtle.importKey(
      "raw",
      h,
      { name: "AES-GCM" },
      !1,
      ["encrypt", "decrypt"]
    );
  } catch (r) {
    console.error("[ln-core/crypto] Key derivation failed:", r), N = null;
  }
}
function H() {
  return N;
}
async function Tt(o, r = N) {
  const h = r || N;
  if (!h || o === void 0 || o === null) return o;
  try {
    const u = new TextEncoder(), E = crypto.getRandomValues(new Uint8Array(12)), p = typeof o == "string" ? o : JSON.stringify(o), e = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: E },
      h,
      u.encode(p)
    ), i = btoa(String.fromCharCode(...E)), l = btoa(String.fromCharCode(...new Uint8Array(e)));
    return {
      encrypted: !0,
      iv: i,
      data: l
    };
  } catch (u) {
    return console.error("[ln-core/crypto] Encryption failed:", u), o;
  }
}
async function Lt(o, r = N) {
  const h = r || N;
  if (!o || !o.encrypted || !h) return o;
  try {
    const u = new TextDecoder(), E = Uint8Array.from(atob(o.iv), (l) => l.charCodeAt(0)), p = Uint8Array.from(atob(o.data), (l) => l.charCodeAt(0)), e = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: E },
      h,
      p
    ), i = u.decode(e);
    try {
      return JSON.parse(i);
    } catch {
      return i;
    }
  } catch (u) {
    return console.error("[ln-core/crypto] Decryption failed. Key may be incorrect:", u), { ...o, decryptionError: !0 };
  }
}
(function() {
  const o = "data-ln-modal", r = "lnModal";
  if (window[r] !== void 0) return;
  function h(e) {
    const i = Array.from(e.querySelectorAll("[data-ln-modal-for]"));
    e.hasAttribute && e.hasAttribute("data-ln-modal-for") && i.push(e);
    for (const l of i) {
      if (l[r + "Trigger"]) continue;
      const c = function(m) {
        if (m.ctrlKey || m.metaKey || m.button === 1) return;
        m.preventDefault();
        const g = l.getAttribute("data-ln-modal-for"), b = document.getElementById(g);
        if (!b) {
          console.warn('[ln-modal] No modal found for data-ln-modal-for="' + g + '"');
          return;
        }
        if (!b[r]) return;
        const A = b.getAttribute(o);
        b.setAttribute(o, A === "open" ? "close" : "open");
      };
      l.addEventListener("click", c), l[r + "Trigger"] = c;
    }
  }
  function u(e) {
    this.dom = e, this.isOpen = e.getAttribute(o) === "open";
    const i = this;
    return this._onEscape = function(l) {
      l.key === "Escape" && i.dom.setAttribute(o, "close");
    }, this._onFocusTrap = function(l) {
      if (l.key !== "Tab") return;
      const c = Array.prototype.filter.call(
        i.dom.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        G
      );
      if (c.length === 0) return;
      const m = c[0], g = c[c.length - 1];
      l.shiftKey ? document.activeElement === m && (l.preventDefault(), g.focus()) : document.activeElement === g && (l.preventDefault(), m.focus());
    }, this._onClose = function(l) {
      l.preventDefault(), i.dom.setAttribute(o, "close");
    }, p(this), this.isOpen && (this.dom.setAttribute("aria-modal", "true"), this.dom.setAttribute("role", "dialog"), document.body.classList.add("ln-modal-open"), document.addEventListener("keydown", this._onEscape), document.addEventListener("keydown", this._onFocusTrap)), this;
  }
  u.prototype.destroy = function() {
    if (!this.dom[r]) return;
    this.isOpen && (this.dom.removeAttribute("aria-modal"), document.removeEventListener("keydown", this._onEscape), document.removeEventListener("keydown", this._onFocusTrap), this._returnFocusEl = null, document.querySelector("[" + o + '="open"]') || document.body.classList.remove("ln-modal-open"));
    const e = this.dom.querySelectorAll("[data-ln-modal-close]");
    for (const l of e)
      l[r + "Close"] && (l.removeEventListener("click", l[r + "Close"]), delete l[r + "Close"]);
    const i = document.querySelectorAll('[data-ln-modal-for="' + this.dom.id + '"]');
    for (const l of i)
      l[r + "Trigger"] && (l.removeEventListener("click", l[r + "Trigger"]), delete l[r + "Trigger"]);
    S(this.dom, "ln-modal:destroyed", { modalId: this.dom.id, target: this.dom }), delete this.dom[r];
  };
  function E(e) {
    const i = e[r];
    if (!i) return;
    const c = e.getAttribute(o) === "open";
    if (c !== i.isOpen)
      if (c) {
        if (R(e, "ln-modal:before-open", { modalId: e.id, target: e }).defaultPrevented) {
          e.setAttribute(o, "close");
          return;
        }
        i.isOpen = !0, e.setAttribute("aria-modal", "true"), e.setAttribute("role", "dialog"), document.body.classList.add("ln-modal-open"), document.addEventListener("keydown", i._onEscape), document.addEventListener("keydown", i._onFocusTrap);
        const g = document.activeElement;
        i._returnFocusEl = g && g !== document.body ? g : null;
        const b = e.querySelector("[autofocus]");
        if (b && G(b))
          b.focus();
        else {
          const A = e.querySelectorAll('input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled])'), C = Array.prototype.find.call(A, G);
          if (C) C.focus();
          else {
            const L = e.querySelectorAll("a[href], button:not([disabled])"), q = Array.prototype.find.call(L, G);
            q && q.focus();
          }
        }
        S(e, "ln-modal:open", { modalId: e.id, target: e });
      } else {
        if (R(e, "ln-modal:before-close", { modalId: e.id, target: e }).defaultPrevented) {
          e.setAttribute(o, "open");
          return;
        }
        i.isOpen = !1, e.removeAttribute("aria-modal"), document.removeEventListener("keydown", i._onEscape), document.removeEventListener("keydown", i._onFocusTrap), S(e, "ln-modal:close", { modalId: e.id, target: e }), i._returnFocusEl && document.contains(i._returnFocusEl) && typeof i._returnFocusEl.focus == "function" && i._returnFocusEl.focus(), i._returnFocusEl = null, document.querySelector("[" + o + '="open"]') || document.body.classList.remove("ln-modal-open");
      }
  }
  function p(e) {
    const i = e.dom.querySelectorAll("[data-ln-modal-close]");
    for (const l of i)
      l[r + "Close"] || (l.addEventListener("click", e._onClose), l[r + "Close"] = e._onClose);
  }
  F(o, r, u, "ln-modal", {
    extraAttributes: ["data-ln-modal-for"],
    onAttributeChange: E,
    onInit: h
  });
})();
const Ot = `<li class="ln-toast__item">\r
	<div class="ln-toast__card" data-ln-attr="role:role, aria-live:ariaLive">\r
		<div class="ln-toast__side">\r
			<svg class="ln-icon" aria-hidden="true"><use href=""></use></svg>\r
		</div>\r
		<div class="ln-toast__content">\r
			<div class="ln-toast__head">\r
				<strong class="ln-toast__title" data-ln-field="title"></strong>\r
			</div>\r
			<button type="button" class="ln-toast__close" aria-label="Close"><svg class="ln-icon" aria-hidden="true"><use href="#ln-x"></use></svg></button>\r
			<div class="ln-toast__body" data-ln-show="hasBody"></div>\r
		</div>\r
	</div>\r
</li>\r
`;
(function() {
  const o = "data-ln-toast", r = "lnToast", h = "ln-toast-item", u = { success: "circle-check", error: "circle-x", warn: "alert-triangle", info: "info-circle" }, E = { success: "success", error: "error", warn: "warning", info: "info" }, p = { success: "Success", error: "Error", warn: "Warning", info: "Information" };
  if (window.__lnToastLoaded) return;
  window.__lnToastLoaded = !0;
  function e() {
    if (document.querySelector('[data-ln-template="ln-toast-item"]') || !document.body) return;
    const d = document.createElement("template");
    d.setAttribute("data-ln-template", "ln-toast-item"), d.innerHTML = Ot, document.body.appendChild(d);
  }
  function i(d) {
    if (!d || d.nodeType !== 1) return;
    const y = Array.from(d.querySelectorAll("[" + o + "]"));
    d.hasAttribute && d.hasAttribute(o) && y.push(d);
    for (const v of y)
      v[r] || new l(v);
  }
  function l(d) {
    this.dom = d, d[r] = this, this.timeoutDefault = parseInt(d.getAttribute("data-ln-toast-timeout") || "6000", 10), this.max = parseInt(d.getAttribute("data-ln-toast-max") || "5", 10);
    for (const y of Array.from(d.querySelectorAll("[data-ln-toast-item]")))
      C(y, d);
    return this;
  }
  l.prototype.destroy = function() {
    if (this.dom[r]) {
      for (const d of Array.from(this.dom.children))
        b(d);
      delete this.dom[r];
    }
  };
  function c(d, y) {
    const v = ((d.type || "info") + "").toLowerCase(), T = At(y, h, "ln-toast");
    if (!T)
      return console.warn('[ln-toast] Template "' + h + '" not found'), null;
    const x = T.firstElementChild;
    if (!x) return null;
    const D = !!(d.message || d.data && d.data.errors);
    vt(x, {
      title: d.title || p[v] || p.info,
      role: v === "error" ? "alert" : "status",
      ariaLive: v === "error" ? "assertive" : "polite",
      hasBody: D
    });
    const U = x.querySelector(".ln-toast__card");
    U && U.classList.add(E[v] || "info");
    const $ = x.querySelector(".ln-toast__side");
    if ($) {
      const V = $.querySelector("use");
      V && V.setAttribute("href", "#ln-" + (u[v] || u.info));
    }
    const j = x.querySelector(".ln-toast__body");
    j && D && m(j, d);
    const M = x.querySelector(".ln-toast__close");
    return M && M.addEventListener("click", function() {
      b(x);
    }), x;
  }
  function m(d, y) {
    if (y.message)
      if (Array.isArray(y.message)) {
        const v = document.createElement("ul");
        for (const T of y.message) {
          const x = document.createElement("li");
          x.textContent = T, v.appendChild(x);
        }
        d.appendChild(v);
      } else {
        const v = document.createElement("p");
        v.textContent = y.message, d.appendChild(v);
      }
    if (y.data && y.data.errors) {
      const v = document.createElement("ul");
      for (const T of Object.values(y.data.errors).flat()) {
        const x = document.createElement("li");
        x.textContent = T, v.appendChild(x);
      }
      d.appendChild(v);
    }
  }
  function g(d, y) {
    for (; d.dom.children.length >= d.max; ) d.dom.removeChild(d.dom.firstElementChild);
    d.dom.appendChild(y), requestAnimationFrame(() => y.classList.add("ln-toast__item--in"));
  }
  function b(d) {
    !d || !d.parentNode || (clearTimeout(d._timer), d.classList.remove("ln-toast__item--in"), d.classList.add("ln-toast__item--out"), setTimeout(() => {
      d.parentNode && d.parentNode.removeChild(d);
    }, 200));
  }
  function A(d) {
    let y = d && d.container;
    return typeof y == "string" && (y = document.querySelector(y)), y instanceof HTMLElement || (y = document.querySelector("[" + o + "]") || document.getElementById("ln-toast-container")), y || null;
  }
  function C(d, y) {
    const v = ((d.getAttribute("data-type") || "info") + "").toLowerCase(), T = d.getAttribute("data-title"), x = (d.innerText || d.textContent || "").trim(), D = c({
      type: v,
      title: T,
      message: x || void 0
    }, y);
    D && (d.parentNode && d.parentNode.replaceChild(D, d), requestAnimationFrame(() => D.classList.add("ln-toast__item--in")));
  }
  function L(d) {
    const y = d.detail || {}, v = A(y);
    if (!v) {
      console.warn("[ln-toast] No toast container found");
      return;
    }
    const T = v[r] || new l(v), x = c(y, v);
    if (!x) return;
    const D = Number.isFinite(y.timeout) ? y.timeout : T.timeoutDefault;
    g(T, x), D > 0 && (x._timer = setTimeout(() => b(x), D));
  }
  function q(d) {
    const y = d && d.detail || {};
    if (y.container) {
      const v = A(y);
      if (v)
        for (const T of Array.from(v.children)) b(T);
    } else {
      const v = document.querySelectorAll("[" + o + "]");
      for (const T of Array.from(v))
        for (const x of Array.from(T.children)) b(x);
    }
  }
  J(function() {
    e(), window.addEventListener("ln-toast:enqueue", L), window.addEventListener("ln-toast:clear", q), new MutationObserver(function(y) {
      for (const v of y) {
        if (v.type === "attributes") {
          i(v.target);
          continue;
        }
        for (const T of v.addedNodes)
          i(T);
      }
    }).observe(document.body, { childList: !0, subtree: !0, attributes: !0, attributeFilter: [o] }), i(document.body);
  }, "ln-toast");
})();
(function() {
  const o = "data-ln-accordion", r = "lnAccordion";
  if (window[r] !== void 0) return;
  function h(u) {
    return this.dom = u, this._onToggleOpen = function(E) {
      if (E.detail.target.closest("[data-ln-accordion]") !== u) return;
      const p = u.querySelectorAll("[data-ln-toggle]");
      for (const e of p)
        e !== E.detail.target && e.closest("[data-ln-accordion]") === u && e.getAttribute("data-ln-toggle") === "open" && e.setAttribute("data-ln-toggle", "close");
      S(u, "ln-accordion:change", { target: E.detail.target });
    }, u.addEventListener("ln-toggle:open", this._onToggleOpen), this;
  }
  h.prototype.destroy = function() {
    this.dom[r] && (this.dom.removeEventListener("ln-toggle:open", this._onToggleOpen), S(this.dom, "ln-accordion:destroyed", { target: this.dom }), delete this.dom[r]);
  }, F(o, r, h, "ln-accordion");
})();
(function() {
  const o = "data-ln-toggle", r = "lnToggle";
  if (window[r] !== void 0) return;
  function h(e) {
    const i = Array.from(e.querySelectorAll("[data-ln-toggle-for]"));
    e.hasAttribute && e.hasAttribute("data-ln-toggle-for") && i.push(e);
    for (const l of i) {
      if (l[r + "Trigger"]) continue;
      const c = function(b) {
        if (b.ctrlKey || b.metaKey || b.button === 1) return;
        b.preventDefault();
        const A = l.getAttribute("data-ln-toggle-for"), C = document.getElementById(A);
        if (!C || !C[r]) return;
        const L = l.getAttribute("data-ln-toggle-action") || "toggle";
        if (L === "open")
          C.setAttribute(o, "open");
        else if (L === "close")
          C.setAttribute(o, "close");
        else if (L === "toggle") {
          const q = C.getAttribute(o);
          C.setAttribute(o, q === "open" ? "close" : "open");
        }
      };
      l.addEventListener("click", c), l[r + "Trigger"] = c;
      const m = l.getAttribute("data-ln-toggle-for"), g = document.getElementById(m);
      g && g[r] && l.setAttribute("aria-expanded", g[r].isOpen ? "true" : "false");
    }
  }
  function u(e, i) {
    const l = document.querySelectorAll(
      '[data-ln-toggle-for="' + e.id + '"]'
    );
    for (const c of l)
      c.setAttribute("aria-expanded", i ? "true" : "false");
  }
  function E(e) {
    if (this.dom = e, e.hasAttribute("data-ln-persist")) {
      const i = Ct("toggle", e);
      i !== null && e.setAttribute(o, i);
    }
    return this.isOpen = e.getAttribute(o) === "open", this.isOpen && e.classList.add("open"), u(e, this.isOpen), this;
  }
  E.prototype.destroy = function() {
    if (!this.dom[r]) return;
    S(this.dom, "ln-toggle:destroyed", { target: this.dom });
    const e = document.querySelectorAll('[data-ln-toggle-for="' + this.dom.id + '"]');
    for (const i of e)
      i[r + "Trigger"] && (i.removeEventListener("click", i[r + "Trigger"]), delete i[r + "Trigger"]);
    delete this.dom[r];
  };
  function p(e) {
    const i = e[r];
    if (!i) return;
    const c = e.getAttribute(o) === "open";
    if (c !== i.isOpen)
      if (c) {
        if (R(e, "ln-toggle:before-open", { target: e }).defaultPrevented) {
          e.setAttribute(o, "close");
          return;
        }
        i.isOpen = !0, e.classList.add("open"), u(e, !0), S(e, "ln-toggle:open", { target: e }), e.hasAttribute("data-ln-persist") && ot("toggle", e, "open");
      } else {
        if (R(e, "ln-toggle:before-close", { target: e }).defaultPrevented) {
          e.setAttribute(o, "open");
          return;
        }
        i.isOpen = !1, e.classList.remove("open"), u(e, !1), S(e, "ln-toggle:close", { target: e }), e.hasAttribute("data-ln-persist") && ot("toggle", e, "close");
      }
  }
  F(o, r, E, "ln-toggle", {
    extraAttributes: ["data-ln-toggle-for"],
    onAttributeChange: p,
    onInit: h
  });
})();
(function() {
  const o = "data-ln-sortable", r = "lnSortable", h = "data-ln-sortable-handle";
  if (window[r] !== void 0) return;
  function u(p) {
    this.dom = p, this.isEnabled = p.getAttribute(o) !== "disabled", this._dragging = null, p.setAttribute("aria-roledescription", "sortable list");
    const e = this;
    return this._onPointerDown = function(i) {
      e.isEnabled && e._handlePointerDown(i);
    }, p.addEventListener("pointerdown", this._onPointerDown), this;
  }
  u.prototype.enable = function() {
    this.isEnabled || this.dom.setAttribute(o, "");
  }, u.prototype.disable = function() {
    this.isEnabled && this.dom.setAttribute(o, "disabled");
  }, u.prototype.destroy = function() {
    this.dom[r] && (this.dom.removeEventListener("pointerdown", this._onPointerDown), S(this.dom, "ln-sortable:destroyed", { target: this.dom }), delete this.dom[r]);
  }, u.prototype._handlePointerDown = function(p) {
    let e = p.target.closest("[" + h + "]"), i;
    if (e) {
      for (i = e; i && i.parentElement !== this.dom; )
        i = i.parentElement;
      if (!i || i.parentElement !== this.dom) return;
    } else {
      if (this.dom.querySelector("[" + h + "]")) return;
      for (i = p.target; i && i.parentElement !== this.dom; )
        i = i.parentElement;
      if (!i || i.parentElement !== this.dom) return;
      e = i;
    }
    const c = Array.from(this.dom.children).indexOf(i);
    if (R(this.dom, "ln-sortable:before-drag", {
      item: i,
      index: c
    }).defaultPrevented) return;
    p.preventDefault(), e.setPointerCapture(p.pointerId), this._dragging = i, i.classList.add("ln-sortable--dragging"), i.setAttribute("aria-grabbed", "true"), this.dom.classList.add("ln-sortable--active"), S(this.dom, "ln-sortable:drag-start", {
      item: i,
      index: c
    });
    const g = this, b = function(C) {
      g._handlePointerMove(C);
    }, A = function(C) {
      g._handlePointerEnd(C), e.removeEventListener("pointermove", b), e.removeEventListener("pointerup", A), e.removeEventListener("pointercancel", A);
    };
    e.addEventListener("pointermove", b), e.addEventListener("pointerup", A), e.addEventListener("pointercancel", A);
  }, u.prototype._handlePointerMove = function(p) {
    if (!this._dragging) return;
    const e = Array.from(this.dom.children), i = this._dragging;
    for (const l of e)
      l.classList.remove("ln-sortable--drop-before", "ln-sortable--drop-after");
    for (const l of e) {
      if (l === i) continue;
      const c = l.getBoundingClientRect(), m = c.top + c.height / 2;
      if (p.clientY >= c.top && p.clientY < m) {
        l.classList.add("ln-sortable--drop-before");
        break;
      } else if (p.clientY >= m && p.clientY <= c.bottom) {
        l.classList.add("ln-sortable--drop-after");
        break;
      }
    }
  }, u.prototype._handlePointerEnd = function(p) {
    if (!this._dragging) return;
    const e = this._dragging, i = Array.from(this.dom.children), l = i.indexOf(e);
    let c = null, m = null;
    for (const g of i) {
      if (g.classList.contains("ln-sortable--drop-before")) {
        c = g, m = "before";
        break;
      }
      if (g.classList.contains("ln-sortable--drop-after")) {
        c = g, m = "after";
        break;
      }
    }
    for (const g of i)
      g.classList.remove("ln-sortable--drop-before", "ln-sortable--drop-after");
    if (e.classList.remove("ln-sortable--dragging"), e.removeAttribute("aria-grabbed"), this.dom.classList.remove("ln-sortable--active"), c && c !== e) {
      m === "before" ? this.dom.insertBefore(e, c) : this.dom.insertBefore(e, c.nextElementSibling);
      const b = Array.from(this.dom.children).indexOf(e);
      S(this.dom, "ln-sortable:reordered", {
        item: e,
        oldIndex: l,
        newIndex: b
      });
    }
    this._dragging = null;
  };
  function E(p) {
    const e = p[r];
    if (!e) return;
    const i = p.getAttribute(o) !== "disabled";
    i !== e.isEnabled && (e.isEnabled = i, S(p, i ? "ln-sortable:enabled" : "ln-sortable:disabled", { target: p }));
  }
  F(o, r, u, "ln-sortable", {
    onAttributeChange: E
  });
})();
(function() {
  const o = "data-ln-search", r = "lnSearch", h = "data-ln-search-initialized", u = "data-ln-search-hide";
  if (window[r] !== void 0) return;
  function p(e) {
    if (e.hasAttribute(h)) return this;
    this.dom = e, this.targetId = e.getAttribute(o);
    const i = e.tagName;
    if (this.input = i === "INPUT" || i === "TEXTAREA" ? e : e.querySelector('[name="search"]') || e.querySelector('input[type="search"]') || e.querySelector('input[type="text"]'), this.itemsSelector = e.getAttribute("data-ln-search-items") || null, this._debounceTimer = null, this._attachHandler(), this.input && this.input.value.trim()) {
      const l = this;
      queueMicrotask(function() {
        l._search(l.input.value.trim().toLowerCase());
      });
    }
    return e.setAttribute(h, ""), this;
  }
  p.prototype._attachHandler = function() {
    if (!this.input) return;
    const e = this;
    this._clearBtn = this.dom.querySelector("[data-ln-search-clear]"), this._clearBtn && (this._onClear = function() {
      e.input.value = "", e._search(""), e.input.focus();
    }, this._clearBtn.addEventListener("click", this._onClear)), this._onInput = function() {
      clearTimeout(e._debounceTimer), e._debounceTimer = setTimeout(function() {
        e._search(e.input.value.trim().toLowerCase());
      }, 150);
    }, this.input.addEventListener("input", this._onInput);
  }, p.prototype._search = function(e) {
    const i = document.getElementById(this.targetId);
    if (!i || R(i, "ln-search:change", { term: e, targetId: this.targetId }).defaultPrevented) return;
    const c = this.itemsSelector ? i.querySelectorAll(this.itemsSelector) : i.children;
    for (let m = 0; m < c.length; m++) {
      const g = c[m];
      g.removeAttribute(u), e && !g.textContent.replace(/\s+/g, " ").toLowerCase().includes(e) && g.setAttribute(u, "true");
    }
  }, p.prototype.destroy = function() {
    this.dom[r] && (clearTimeout(this._debounceTimer), this.input && this._onInput && this.input.removeEventListener("input", this._onInput), this._clearBtn && this._onClear && this._clearBtn.removeEventListener("click", this._onClear), this.dom.removeAttribute(h), delete this.dom[r]);
  }, F(o, r, p, "ln-search");
})();
(function() {
  const o = "[data-ln-progress]", r = "lnProgress";
  if (window[r] !== void 0) return;
  function h(c) {
    u(c);
  }
  function u(c) {
    const m = Array.from(c.querySelectorAll(o));
    for (const g of m)
      g[r] || (g[r] = new E(g));
    c.hasAttribute && c.hasAttribute("data-ln-progress") && !c[r] && (c[r] = new E(c));
  }
  function E(c) {
    return this.dom = c, this._attrObserver = null, this._parentObserver = null, l.call(this), e.call(this), i.call(this), this;
  }
  E.prototype.destroy = function() {
    this.dom[r] && (this._attrObserver && this._attrObserver.disconnect(), this._parentObserver && this._parentObserver.disconnect(), delete this.dom[r]);
  };
  function p() {
    J(function() {
      new MutationObserver(function(m) {
        for (const g of m)
          if (g.type === "childList")
            for (const b of g.addedNodes)
              b.nodeType === 1 && u(b);
          else g.type === "attributes" && u(g.target);
      }).observe(document.body, {
        childList: !0,
        subtree: !0,
        attributes: !0,
        attributeFilter: ["data-ln-progress"]
      });
    }, "ln-progress");
  }
  p();
  function e() {
    const c = this, m = new MutationObserver(function(g) {
      for (const b of g)
        (b.attributeName === "data-ln-progress" || b.attributeName === "data-ln-progress-max") && l.call(c);
    });
    m.observe(this.dom, {
      attributes: !0,
      attributeFilter: ["data-ln-progress", "data-ln-progress-max"]
    }), this._attrObserver = m;
  }
  function i() {
    const c = this, m = this.dom.parentElement;
    if (!m || !m.hasAttribute("data-ln-progress-max")) return;
    const g = new MutationObserver(function(b) {
      for (const A of b)
        A.attributeName === "data-ln-progress-max" && l.call(c);
    });
    g.observe(m, {
      attributes: !0,
      attributeFilter: ["data-ln-progress-max"]
    }), this._parentObserver = g;
  }
  function l() {
    const c = parseFloat(this.dom.getAttribute("data-ln-progress")) || 0, m = this.dom.parentElement, b = (m && m.hasAttribute("data-ln-progress-max") ? parseFloat(m.getAttribute("data-ln-progress-max")) : null) || parseFloat(this.dom.getAttribute("data-ln-progress-max")) || 100;
    let A = b > 0 ? c / b * 100 : 0;
    A < 0 && (A = 0), A > 100 && (A = 100), this.dom.style.width = A + "%";
    const C = Math.max(0, Math.min(c, b));
    this.dom.setAttribute("role", "progressbar"), this.dom.setAttribute("aria-valuemin", "0"), this.dom.setAttribute("aria-valuemax", String(b)), this.dom.setAttribute("aria-valuenow", String(C)), S(this.dom, "ln-progress:change", { target: this.dom, value: c, max: b, percentage: A });
  }
  window[r] = h, document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
    h(document.body);
  }) : h(document.body);
})();
(function() {
  const o = "data-ln-data-store", r = "lnDataStore";
  if (window[r] !== void 0) return;
  const h = "ln_app_cache", u = "_meta", E = "1.0";
  let p = null, e = null;
  const i = {};
  function l() {
    try {
      return crypto.randomUUID();
    } catch {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (n) => {
        const a = Math.random() * 16 | 0;
        return (n === "x" ? a : a & 3 | 8).toString(16);
      });
    }
  }
  function c(t) {
    t && t.name === "QuotaExceededError" && S(document, "ln-store:quota-exceeded", { error: t });
  }
  function m() {
    const t = {};
    for (const n of document.querySelectorAll(`[${o}]`)) {
      const a = n.getAttribute(o);
      if (a) {
        const s = n.getAttribute("data-ln-data-store-indexes") || n.getAttribute("data-ln-store-indexes") || "";
        t[a] = {
          indexes: s.split(",").map((f) => f.trim()).filter(Boolean)
        };
      }
    }
    return t;
  }
  function g() {
    return e || (e = new Promise((t) => {
      if (typeof indexedDB > "u")
        return console.warn("[ln-data-store] IndexedDB not available — falling back to in-memory store"), t(null);
      const n = m(), a = Object.keys(n), s = indexedDB.open(h);
      s.onerror = () => {
        console.warn("[ln-data-store] IndexedDB open failed — falling back to in-memory store"), t(null);
      }, s.onsuccess = (f) => {
        const _ = f.target.result, w = Array.from(_.objectStoreNames);
        if (!(!w.includes(u) || a.some((K) => !w.includes(K))))
          return b(_), p = _, t(_);
        const k = _.version;
        _.close();
        const B = indexedDB.open(h, k + 1);
        B.onblocked = () => {
          console.warn("[ln-data-store] Database upgrade blocked — waiting for other tabs to close connection");
        }, B.onerror = () => {
          console.warn("[ln-data-store] Database upgrade failed"), t(null);
        }, B.onupgradeneeded = (K) => {
          const P = K.target.result;
          P.objectStoreNames.contains(u) || P.createObjectStore(u, { keyPath: "key" });
          for (const W of a)
            if (!P.objectStoreNames.contains(W)) {
              const _t = P.createObjectStore(W, { keyPath: "id" });
              for (const rt of n[W].indexes)
                _t.createIndex(rt, rt, { unique: !1 });
            }
        }, B.onsuccess = (K) => {
          const P = K.target.result;
          b(P), p = P, t(P);
        };
      };
    }), e);
  }
  function b(t) {
    t.onversionchange = () => {
      t.close(), p = null, e = null;
    };
  }
  function A() {
    return p ? Promise.resolve(p) : (e = null, g());
  }
  async function C(t) {
    if (!H() || !t) return t;
    const n = { ...t }, a = n.id, s = n._pending, f = await Tt(n);
    return !f || !f.encrypted ? t : {
      id: a,
      _pending: s,
      encrypted: !0,
      iv: f.iv,
      data: f.data
    };
  }
  async function L(t) {
    return !t || !t.encrypted || !H() ? t : Lt(t);
  }
  const q = (t, n) => A().then((a) => a ? a.transaction(t, n).objectStore(t) : null);
  function d(t) {
    return new Promise((n, a) => {
      t.onsuccess = () => n(t.result), t.onerror = () => {
        c(t.error), a(t.error);
      };
    });
  }
  const y = (t) => q(t, "readonly").then((n) => n ? d(n.getAll()) : []).then((n) => H() ? Promise.all(n.map((a) => L(a))) : n), v = (t, n) => q(t, "readonly").then((a) => a ? d(a.get(n)) : null).then((a) => a ? L(a) : null), T = (t, n) => (H() ? C(n) : Promise.resolve(n)).then((s) => q(t, "readwrite").then((f) => f ? d(f.put(s)) : null)), x = (t, n) => q(t, "readwrite").then((a) => a ? d(a.delete(n)) : null), D = (t) => q(t, "readwrite").then((n) => n ? d(n.clear()) : null), U = (t) => q(t, "readonly").then((n) => n ? d(n.count()) : 0), $ = (t) => q(u, "readonly").then((n) => n ? d(n.get(t)) : null), j = (t, n) => q(u, "readwrite").then((a) => {
    if (a)
      return n.key = t, d(a.put(n));
  });
  function M(t) {
    this.dom = t, this._name = t.getAttribute(o);
    const n = t.getAttribute("data-ln-data-store-stale") || t.getAttribute("data-ln-store-stale"), a = parseInt(n, 10);
    this._staleThreshold = n === "never" || n === "-1" ? -1 : isNaN(a) ? 300 : a;
    const s = t.getAttribute("data-ln-data-store-search-fields") || t.getAttribute("data-ln-store-search-fields") || "";
    return this._searchFields = s.split(",").map((f) => f.trim()).filter(Boolean), this._handlers = null, this._pendingSnapshots = {}, this.isLoaded = !1, this.isSyncing = !1, this.lastSyncedAt = null, this.totalCount = 0, this.presenters = null, i[this._name] = this, V(this), ft(this), this;
  }
  function V(t) {
    t._handlers = {
      create: (n) => lt(t, n.detail),
      update: (n) => ct(t, n.detail),
      delete: (n) => dt(t, n.detail),
      "bulk-delete": (n) => ut(t, n.detail)
    };
    for (const [n, a] of Object.entries(t._handlers))
      t.dom.addEventListener(`ln-store:request-${n}`, a);
  }
  function lt(t, { data: n = {} } = {}) {
    const a = `_temp_${l()}`, s = { ...n, id: a, _pending: !0 };
    T(t._name, s).then(() => {
      t.totalCount++, S(t.dom, "ln-store:created", { store: t._name, record: s, tempId: a }), S(t.dom, "ln-store:request-remote-create", { tempId: a, data: n });
    });
  }
  function ct(t, { id: n, data: a = {}, expected_version: s } = {}) {
    v(t._name, n).then((f) => {
      if (!f) throw new Error(`Record not found: ${n}`);
      t._pendingSnapshots[n] = { ...f };
      const _ = { ...f, ...a, _pending: !0 };
      return T(t._name, _).then(() => {
        S(t.dom, "ln-store:updated", { store: t._name, record: _, previous: t._pendingSnapshots[n] }), S(t.dom, "ln-store:request-remote-update", { id: n, data: a, expected_version: s });
      });
    }).catch((f) => console.error("[ln-data-store] Optimistic update failed:", f));
  }
  function dt(t, { id: n } = {}) {
    v(t._name, n).then((a) => {
      if (a)
        return t._pendingSnapshots[n] = { ...a }, x(t._name, n).then(() => {
          t.totalCount--, S(t.dom, "ln-store:deleted", { store: t._name, id: n }), S(t.dom, "ln-store:request-remote-delete", { id: n });
        });
    }).catch((a) => console.error("[ln-data-store] Optimistic delete failed:", a));
  }
  function ut(t, { ids: n = [] } = {}) {
    n.length && Promise.all(n.map((a) => v(t._name, a))).then((a) => {
      const s = a.filter(Boolean), f = s.map((_) => _.id);
      return t._pendingSnapshots[f.join(",")] = s, tt(t._name, f).then(() => {
        t.totalCount -= f.length, S(t.dom, "ln-store:deleted", { store: t._name, ids: f }), S(t.dom, "ln-store:request-remote-bulk-delete", { ids: f });
      });
    }).catch((a) => console.error("[ln-data-store] Optimistic bulk delete failed:", a));
  }
  function ft(t) {
    g().then(() => $(t._name)).then((n) => {
      n && n.schema_version === E ? (t.lastSyncedAt = n.last_synced_at || null, t.totalCount = n.record_count || 0, t.totalCount > 0 ? (t.isLoaded = !0, S(t.dom, "ln-store:ready", { store: t._name, count: t.totalCount, source: "cache" }), Q(t) && I(t)) : I(t)) : n && n.schema_version !== E ? D(t._name).then(() => j(t._name, { schema_version: E, last_synced_at: null, record_count: 0 })).then(() => I(t)) : I(t);
    });
  }
  function Q(t) {
    return t._staleThreshold === -1 ? !1 : t.lastSyncedAt ? Math.floor(Date.now() / 1e3) - t.lastSyncedAt > t._staleThreshold : !0;
  }
  function I(t) {
    t.isSyncing = !0, S(t.dom, "ln-store:request-remote-sync", { since: t.lastSyncedAt });
  }
  function Z(t, n) {
    return A().then((a) => a ? (H() ? Promise.all(n.map((f) => C(f))) : Promise.resolve(n)).then((f) => new Promise((_, w) => {
      const O = a.transaction(t, "readwrite"), k = O.objectStore(t);
      f.forEach((B) => k.put(B)), O.oncomplete = () => _(), O.onerror = () => {
        c(O.error), w(O.error);
      };
    })) : void 0);
  }
  function tt(t, n) {
    return A().then((a) => {
      if (a)
        return new Promise((s, f) => {
          const _ = a.transaction(t, "readwrite"), w = _.objectStore(t);
          n.forEach((O) => w.delete(O)), _.oncomplete = () => s(), _.onerror = () => f(_.error);
        });
    });
  }
  let Y = () => {
    document.visibilityState === "visible" && Object.values(i).forEach((t) => {
      t.isLoaded && !t.isSyncing && Q(t) && I(t);
    });
  };
  document.addEventListener("visibilitychange", Y);
  const ht = new Intl.Collator(void 0, { numeric: !0, sensitivity: "base" });
  function mt(t, n) {
    if (!n || !n.field) return t;
    const { field: a, direction: s } = n, f = s === "desc";
    return [...t].sort((_, w) => {
      const O = _[a], k = w[a];
      if (O == null && k == null) return 0;
      if (O == null) return f ? 1 : -1;
      if (k == null) return f ? -1 : 1;
      const B = typeof O == "string" && typeof k == "string" ? ht.compare(O, k) : O < k ? -1 : O > k ? 1 : 0;
      return f ? -B : B;
    });
  }
  function et(t, n) {
    if (!n) return t;
    const a = Object.keys(n).filter((s) => Array.isArray(n[s]) && n[s].length > 0);
    return a.length ? t.filter(
      (s) => a.every((f) => n[f].map(String).includes(String(s[f])))
    ) : t;
  }
  function pt(t, n, a) {
    if (!n || !a || !a.length) return t;
    const s = n.toLowerCase();
    return t.filter(
      (f) => a.some((_) => {
        const w = f[_];
        return w != null && String(w).toLowerCase().includes(s);
      })
    );
  }
  function gt(t, n, a) {
    if (!t.length) return 0;
    if (a === "count") return t.length;
    const s = t.map((_) => parseFloat(_[n])).filter((_) => !isNaN(_)), f = s.reduce((_, w) => _ + w, 0);
    return a === "sum" ? f : a === "avg" && s.length ? f / s.length : 0;
  }
  function nt(t, n) {
    if (!t.presenters || !t.presenters.computed) return n;
    const a = t.presenters.computed;
    return n.map((s) => {
      const f = { ...s };
      for (const [_, w] of Object.entries(a))
        try {
          f[_] = w(s);
        } catch (O) {
          console.error(`[ln-data-store] Decorator computed field failed for ${_}`, O);
        }
      return f;
    });
  }
  M.prototype.getAll = function(t = {}) {
    const n = this;
    return y(n._name).then((a) => {
      const s = a.length;
      t.filters && (a = et(a, t.filters)), t.search && (a = pt(a, t.search, n._searchFields));
      const f = a.length;
      if (t.sort && (a = mt(a, t.sort)), t.offset || t.limit) {
        const _ = t.offset || 0, w = t.limit || a.length;
        a = a.slice(_, _ + w);
      }
      return {
        data: nt(n, a),
        total: s,
        filtered: f
      };
    });
  }, M.prototype.getById = function(t) {
    return v(this._name, t).then((n) => n ? nt(this, [n])[0] : null);
  }, M.prototype.count = function(t) {
    return t ? y(this._name).then((n) => et(n, t).length) : U(this._name);
  }, M.prototype.aggregate = function(t, n) {
    return y(this._name).then((a) => gt(a, t, n));
  }, M.prototype.setPresenters = function(t) {
    this.presenters = t;
  }, M.prototype.applySync = function(t, n, a) {
    const s = this, f = t.length > 0 || n.length > 0;
    let _ = Promise.resolve();
    return t.length > 0 && (_ = _.then(() => Z(s._name, t))), n.length > 0 && (_ = _.then(() => tt(s._name, n))), _.then(() => U(s._name)).then((w) => (s.totalCount = w, j(s._name, {
      schema_version: E,
      last_synced_at: a,
      record_count: w
    }))).then(() => {
      const w = !s.isLoaded;
      s.isLoaded = !0, s.isSyncing = !1, s.lastSyncedAt = a, w ? (S(s.dom, "ln-store:loaded", { store: s._name, count: s.totalCount }), S(s.dom, "ln-store:ready", { store: s._name, count: s.totalCount, source: "server" })) : S(s.dom, "ln-store:synced", {
        store: s._name,
        added: t.length,
        deleted: n.length,
        changed: f
      });
    }).catch((w) => {
      s.isSyncing = !1, console.error("[ln-data-store] applySync failed:", w);
    });
  }, M.prototype.confirmMutation = function(t, n, a) {
    const s = this, f = {
      create: () => x(s._name, t).then(() => T(s._name, n)).then(() => {
        delete s._pendingSnapshots[t], S(s.dom, "ln-store:confirmed", { store: s._name, record: n, tempId: t, action: "create" });
      }),
      update: () => T(s._name, n).then(() => {
        delete s._pendingSnapshots[t], S(s.dom, "ln-store:confirmed", { store: s._name, record: n, action: "update" });
      }),
      delete: () => (delete s._pendingSnapshots[t], S(s.dom, "ln-store:confirmed", { store: s._name, record: null, action: "delete" }), Promise.resolve()),
      "bulk-delete": () => (delete s._pendingSnapshots[t], S(s.dom, "ln-store:confirmed", { store: s._name, record: null, ids: t.split(","), action: "bulk-delete" }), Promise.resolve())
    };
    return f[a] ? f[a]() : Promise.resolve();
  }, M.prototype.revertMutation = function(t, n, a) {
    const s = this, f = a || `Server rejected ${n}`, _ = {
      create: () => x(s._name, t).then(() => {
        s.totalCount--, delete s._pendingSnapshots[t], S(s.dom, "ln-store:reverted", { store: s._name, record: null, action: "create", error: f });
      }),
      update: () => {
        const w = s._pendingSnapshots[t];
        return w ? T(s._name, w).then(() => {
          delete s._pendingSnapshots[t], S(s.dom, "ln-store:reverted", { store: s._name, record: w, action: "update", error: f });
        }) : Promise.resolve();
      },
      delete: () => {
        const w = s._pendingSnapshots[t];
        return w ? T(s._name, w).then(() => {
          s.totalCount++, delete s._pendingSnapshots[t], S(s.dom, "ln-store:reverted", { store: s._name, record: w, action: "delete", error: f });
        }) : Promise.resolve();
      },
      "bulk-delete": () => {
        const w = s._pendingSnapshots[t];
        return !w || !w.length ? Promise.resolve() : Z(s._name, w).then(() => {
          s.totalCount += w.length, delete s._pendingSnapshots[t], S(s.dom, "ln-store:reverted", { store: s._name, record: null, ids: t.split(","), action: "bulk-delete", error: f });
        });
      }
    };
    return _[n] ? _[n]() : Promise.resolve();
  }, M.prototype.resolveConflict = function(t, n, a) {
    const s = this._pendingSnapshots[t];
    return s ? T(this._name, s).then(() => {
      delete this._pendingSnapshots[t], S(this.dom, "ln-store:conflict", {
        store: this._name,
        local: s,
        remote: n,
        field_diffs: a || null
      });
    }) : Promise.resolve();
  }, M.prototype.forceSync = function() {
    I(this);
  }, M.prototype.fullReload = function() {
    const t = this;
    return D(t._name).then(() => {
      t.isLoaded = !1, t.lastSyncedAt = null, t.totalCount = 0, I(t);
    });
  }, M.prototype.destroy = function() {
    if (this._handlers) {
      for (const [t, n] of Object.entries(this._handlers))
        this.dom.removeEventListener(`ln-store:request-${t}`, n);
      this._handlers = null;
    }
    delete i[this._name], Object.keys(i).length === 0 && Y && (document.removeEventListener("visibilitychange", Y), Y = null), delete this.dom[r], S(this.dom, "ln-store:destroyed", { store: this._name });
  };
  function bt() {
    return A().then((t) => {
      if (!t) return;
      const n = Array.from(t.objectStoreNames);
      return new Promise((a, s) => {
        const f = t.transaction(n, "readwrite");
        n.forEach((_) => f.objectStore(_).clear()), f.oncomplete = () => a(), f.onerror = () => s(f.error);
      });
    }).then(() => {
      Object.values(i).forEach((t) => {
        t.isLoaded = !1, t.isSyncing = !1, t.lastSyncedAt = null, t.totalCount = 0;
      });
    });
  }
  F(o, r, M, "ln-data-store"), window[r].clearAll = bt, window[r].init = window[r], window[r].setStorageKey = it, typeof window < "u" && (window.lnCore = window.lnCore || {}, window.lnCore.setStorageKey = it);
})();
export {
  yt as cloneTemplate,
  vt as fill,
  qt as fillTemplate
};
