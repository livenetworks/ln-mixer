const X = {};
function yt(i, r) {
  X[i] || (X[i] = document.querySelector('[data-ln-template="' + i + '"]'));
  const h = X[i];
  return h ? h.content.cloneNode(!0) : (console.warn("[" + (r || "ln-core") + '] Template "' + i + '" not found'), null);
}
function S(i, r, h) {
  i.dispatchEvent(new CustomEvent(r, {
    bubbles: !0,
    detail: h || {}
  }));
}
function R(i, r, h) {
  const d = new CustomEvent(r, {
    bubbles: !0,
    cancelable: !0,
    detail: h || {}
  });
  return i.dispatchEvent(d), d;
}
function vt(i, r) {
  if (!i || !r) return i;
  const h = i.querySelectorAll("[data-ln-field]");
  for (let e = 0; e < h.length; e++) {
    const o = h[e], l = o.getAttribute("data-ln-field");
    r[l] != null && (o.textContent = r[l]);
  }
  const d = i.querySelectorAll("[data-ln-attr]");
  for (let e = 0; e < d.length; e++) {
    const o = d[e], l = o.getAttribute("data-ln-attr").split(",");
    for (let c = 0; c < l.length; c++) {
      const m = l[c].trim().split(":");
      if (m.length !== 2) continue;
      const g = m[0].trim(), b = m[1].trim();
      r[b] != null && o.setAttribute(g, r[b]);
    }
  }
  const A = i.querySelectorAll("[data-ln-show]");
  for (let e = 0; e < A.length; e++) {
    const o = A[e], l = o.getAttribute("data-ln-show");
    l in r && o.classList.toggle("hidden", !r[l]);
  }
  const p = i.querySelectorAll("[data-ln-class]");
  for (let e = 0; e < p.length; e++) {
    const o = p[e], l = o.getAttribute("data-ln-class").split(",");
    for (let c = 0; c < l.length; c++) {
      const m = l[c].trim().split(":");
      if (m.length !== 2) continue;
      const g = m[0].trim(), b = m[1].trim();
      b in r && o.classList.toggle(g, !!r[b]);
    }
  }
  return i;
}
function qt(i, r) {
  if (!i || !r) return i;
  const h = document.createTreeWalker(i, NodeFilter.SHOW_TEXT);
  for (; h.nextNode(); ) {
    const d = h.currentNode;
    d.textContent.indexOf("{{") !== -1 && (d.textContent = d.textContent.replace(
      /\{\{\s*(\w+)\s*\}\}/g,
      function(A, p) {
        return r[p] !== void 0 ? r[p] : "";
      }
    ));
  }
  return i;
}
function J(i, r) {
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", function() {
      J(i, r);
    }), console.warn("[" + r + '] Script loaded before <body> — add "defer" to your <script> tag');
    return;
  }
  i();
}
function At(i, r, h) {
  if (i) {
    const d = i.querySelector('[data-ln-template="' + r + '"]');
    if (d) return d.content.cloneNode(!0);
  }
  return yt(r, h);
}
function z(i, r, h, d) {
  if (i.nodeType !== 1) return;
  const p = r.indexOf("[") !== -1 || r.indexOf(".") !== -1 || r.indexOf("#") !== -1 ? r : "[" + r + "]", e = Array.from(i.querySelectorAll(p));
  i.matches && i.matches(p) && e.push(i);
  for (const o of e)
    o[h] || (o[h] = new d(o));
}
function G(i) {
  return !!(i.offsetWidth || i.offsetHeight || i.getClientRects().length);
}
function F(i, r, h, d, A = {}) {
  const p = A.extraAttributes || [], e = A.onAttributeChange || null, o = A.onInit || null;
  function l(c) {
    const m = c || document.body;
    z(m, i, r, h), o && o(m);
  }
  return J(function() {
    const c = new MutationObserver(function(g) {
      for (let b = 0; b < g.length; b++) {
        const E = g[b];
        if (E.type === "childList")
          for (let T = 0; T < E.addedNodes.length; T++) {
            const M = E.addedNodes[T];
            M.nodeType === 1 && (z(M, i, r, h), o && o(M));
          }
        else E.type === "attributes" && (e && E.target[r] ? e(E.target, E.attributeName) : (z(E.target, i, r, h), o && o(E.target)));
      }
    });
    let m = [];
    if (i.indexOf("[") !== -1) {
      const g = /\[([\w-]+)/g;
      let b;
      for (; (b = g.exec(i)) !== null; )
        m.push(b[1]);
    } else
      m.push(i);
    c.observe(document.body, {
      childList: !0,
      subtree: !0,
      attributes: !0,
      attributeFilter: m.concat(p)
    });
  }, d || (i.indexOf("[") === -1 ? i.replace("data-", "") : "component")), window[r] = l, document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
    l(document.body);
  }) : l(document.body), l;
}
const st = {};
function Et(i, r) {
  st[i] = r;
}
function wt(i) {
  return st[i] || { ingress: (r) => r, egress: (r) => r };
}
typeof window < "u" && (window.lnCore = window.lnCore || {}, window.lnCore.registerDataMapper = Et, window.lnCore.getDataMapper = wt);
const St = "ln:";
function xt() {
  return location.pathname.replace(/\/+$/, "").toLowerCase() || "/";
}
function at(i, r) {
  const h = r.getAttribute("data-ln-persist"), d = h !== null && h !== "" ? h : r.id;
  return d ? St + i + ":" + xt() + ":" + d : (console.warn('[ln-persist] Element requires id or data-ln-persist="key"', r), null);
}
function Ct(i, r) {
  const h = at(i, r);
  if (!h) return null;
  try {
    const d = localStorage.getItem(h);
    return d !== null ? JSON.parse(d) : null;
  } catch {
    return null;
  }
}
function ot(i, r, h) {
  const d = at(i, r);
  if (d)
    try {
      localStorage.setItem(d, JSON.stringify(h));
    } catch {
    }
}
let N = null;
async function it(i) {
  if (!i) {
    N = null;
    return;
  }
  try {
    const r = new TextEncoder(), h = await crypto.subtle.digest("SHA-256", r.encode(i));
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
async function Tt(i, r = N) {
  const h = r || N;
  if (!h || i === void 0 || i === null) return i;
  try {
    const d = new TextEncoder(), A = crypto.getRandomValues(new Uint8Array(12)), p = typeof i == "string" ? i : JSON.stringify(i), e = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: A },
      h,
      d.encode(p)
    ), o = btoa(String.fromCharCode(...A)), l = btoa(String.fromCharCode(...new Uint8Array(e)));
    return {
      encrypted: !0,
      iv: o,
      data: l
    };
  } catch (d) {
    return console.error("[ln-core/crypto] Encryption failed:", d), i;
  }
}
async function Lt(i, r = N) {
  const h = r || N;
  if (!i || !i.encrypted || !h) return i;
  try {
    const d = new TextDecoder(), A = Uint8Array.from(atob(i.iv), (l) => l.charCodeAt(0)), p = Uint8Array.from(atob(i.data), (l) => l.charCodeAt(0)), e = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: A },
      h,
      p
    ), o = d.decode(e);
    try {
      return JSON.parse(o);
    } catch {
      return o;
    }
  } catch (d) {
    return console.error("[ln-core/crypto] Decryption failed. Key may be incorrect:", d), { ...i, decryptionError: !0 };
  }
}
(function() {
  const i = "data-ln-modal", r = "lnModal";
  if (window[r] !== void 0) return;
  function h(e) {
    const o = Array.from(e.querySelectorAll("[data-ln-modal-for]"));
    e.hasAttribute && e.hasAttribute("data-ln-modal-for") && o.push(e);
    for (const l of o) {
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
        const E = b.getAttribute(i);
        b.setAttribute(i, E === "open" ? "close" : "open");
      };
      l.addEventListener("click", c), l[r + "Trigger"] = c;
    }
  }
  function d(e) {
    this.dom = e, this.isOpen = e.getAttribute(i) === "open";
    const o = this;
    return this._onEscape = function(l) {
      l.key === "Escape" && o.dom.setAttribute(i, "close");
    }, this._onFocusTrap = function(l) {
      if (l.key !== "Tab") return;
      const c = Array.prototype.filter.call(
        o.dom.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        G
      );
      if (c.length === 0) return;
      const m = c[0], g = c[c.length - 1];
      l.shiftKey ? document.activeElement === m && (l.preventDefault(), g.focus()) : document.activeElement === g && (l.preventDefault(), m.focus());
    }, this._onClose = function(l) {
      l.preventDefault(), o.dom.setAttribute(i, "close");
    }, p(this), this.isOpen && (this.dom.setAttribute("aria-modal", "true"), this.dom.setAttribute("role", "dialog"), document.body.classList.add("ln-modal-open"), document.addEventListener("keydown", this._onEscape), document.addEventListener("keydown", this._onFocusTrap)), this;
  }
  d.prototype.destroy = function() {
    if (!this.dom[r]) return;
    this.isOpen && (this.dom.removeAttribute("aria-modal"), document.removeEventListener("keydown", this._onEscape), document.removeEventListener("keydown", this._onFocusTrap), this._returnFocusEl = null, document.querySelector("[" + i + '="open"]') || document.body.classList.remove("ln-modal-open"));
    const e = this.dom.querySelectorAll("[data-ln-modal-close]");
    for (const l of e)
      l[r + "Close"] && (l.removeEventListener("click", l[r + "Close"]), delete l[r + "Close"]);
    const o = document.querySelectorAll('[data-ln-modal-for="' + this.dom.id + '"]');
    for (const l of o)
      l[r + "Trigger"] && (l.removeEventListener("click", l[r + "Trigger"]), delete l[r + "Trigger"]);
    S(this.dom, "ln-modal:destroyed", { modalId: this.dom.id, target: this.dom }), delete this.dom[r];
  };
  function A(e) {
    const o = e[r];
    if (!o) return;
    const c = e.getAttribute(i) === "open";
    if (c !== o.isOpen)
      if (c) {
        if (R(e, "ln-modal:before-open", { modalId: e.id, target: e }).defaultPrevented) {
          e.setAttribute(i, "close");
          return;
        }
        o.isOpen = !0, e.setAttribute("aria-modal", "true"), e.setAttribute("role", "dialog"), document.body.classList.add("ln-modal-open"), document.addEventListener("keydown", o._onEscape), document.addEventListener("keydown", o._onFocusTrap);
        const g = document.activeElement;
        o._returnFocusEl = g && g !== document.body ? g : null;
        const b = e.querySelector("[autofocus]");
        if (b && G(b))
          b.focus();
        else {
          const E = e.querySelectorAll('input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled])'), T = Array.prototype.find.call(E, G);
          if (T) T.focus();
          else {
            const M = e.querySelectorAll("a[href], button:not([disabled])"), q = Array.prototype.find.call(M, G);
            q && q.focus();
          }
        }
        S(e, "ln-modal:open", { modalId: e.id, target: e });
      } else {
        if (R(e, "ln-modal:before-close", { modalId: e.id, target: e }).defaultPrevented) {
          e.setAttribute(i, "open");
          return;
        }
        o.isOpen = !1, e.removeAttribute("aria-modal"), document.removeEventListener("keydown", o._onEscape), document.removeEventListener("keydown", o._onFocusTrap), S(e, "ln-modal:close", { modalId: e.id, target: e }), o._returnFocusEl && document.contains(o._returnFocusEl) && typeof o._returnFocusEl.focus == "function" && o._returnFocusEl.focus(), o._returnFocusEl = null, document.querySelector("[" + i + '="open"]') || document.body.classList.remove("ln-modal-open");
      }
  }
  function p(e) {
    const o = e.dom.querySelectorAll("[data-ln-modal-close]");
    for (const l of o)
      l[r + "Close"] || (l.addEventListener("click", e._onClose), l[r + "Close"] = e._onClose);
  }
  F(i, r, d, "ln-modal", {
    extraAttributes: ["data-ln-modal-for"],
    onAttributeChange: A,
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
  const i = "data-ln-toast", r = "lnToast", h = "ln-toast-item", d = { success: "circle-check", error: "circle-x", warn: "alert-triangle", info: "info-circle" }, A = { success: "success", error: "error", warn: "warning", info: "info" }, p = { success: "Success", error: "Error", warn: "Warning", info: "Information" };
  if (window.__lnToastLoaded) return;
  window.__lnToastLoaded = !0;
  function e() {
    if (document.querySelector('[data-ln-template="ln-toast-item"]') || !document.body) return;
    const u = document.createElement("template");
    u.setAttribute("data-ln-template", "ln-toast-item"), u.innerHTML = Ot, document.body.appendChild(u);
  }
  function o(u) {
    if (!u || u.nodeType !== 1) return;
    const y = Array.from(u.querySelectorAll("[" + i + "]"));
    u.hasAttribute && u.hasAttribute(i) && y.push(u);
    for (const v of y)
      v[r] || new l(v);
  }
  function l(u) {
    this.dom = u, u[r] = this, this.timeoutDefault = parseInt(u.getAttribute("data-ln-toast-timeout") || "6000", 10), this.max = parseInt(u.getAttribute("data-ln-toast-max") || "5", 10);
    for (const y of Array.from(u.querySelectorAll("[data-ln-toast-item]")))
      T(y, u);
    return this;
  }
  l.prototype.destroy = function() {
    if (this.dom[r]) {
      for (const u of Array.from(this.dom.children))
        b(u);
      delete this.dom[r];
    }
  };
  function c(u, y) {
    const v = ((u.type || "info") + "").toLowerCase(), C = At(y, h, "ln-toast");
    if (!C)
      return console.warn('[ln-toast] Template "' + h + '" not found'), null;
    const x = C.firstElementChild;
    if (!x) return null;
    const D = !!(u.message || u.data && u.data.errors);
    vt(x, {
      title: u.title || p[v] || p.info,
      role: v === "error" ? "alert" : "status",
      ariaLive: v === "error" ? "assertive" : "polite",
      hasBody: D
    });
    const U = x.querySelector(".ln-toast__card");
    U && U.classList.add(A[v] || "info");
    const $ = x.querySelector(".ln-toast__side");
    if ($) {
      const V = $.querySelector("use");
      V && V.setAttribute("href", "#ln-" + (d[v] || d.info));
    }
    const j = x.querySelector(".ln-toast__body");
    j && D && m(j, u);
    const O = x.querySelector(".ln-toast__close");
    return O && O.addEventListener("click", function() {
      b(x);
    }), x;
  }
  function m(u, y) {
    if (y.message)
      if (Array.isArray(y.message)) {
        const v = document.createElement("ul");
        for (const C of y.message) {
          const x = document.createElement("li");
          x.textContent = C, v.appendChild(x);
        }
        u.appendChild(v);
      } else {
        const v = document.createElement("p");
        v.textContent = y.message, u.appendChild(v);
      }
    if (y.data && y.data.errors) {
      const v = document.createElement("ul");
      for (const C of Object.values(y.data.errors).flat()) {
        const x = document.createElement("li");
        x.textContent = C, v.appendChild(x);
      }
      u.appendChild(v);
    }
  }
  function g(u, y) {
    for (; u.dom.children.length >= u.max; ) u.dom.removeChild(u.dom.firstElementChild);
    u.dom.appendChild(y), requestAnimationFrame(() => y.classList.add("ln-toast__item--in"));
  }
  function b(u) {
    !u || !u.parentNode || (clearTimeout(u._timer), u.classList.remove("ln-toast__item--in"), u.classList.add("ln-toast__item--out"), setTimeout(() => {
      u.parentNode && u.parentNode.removeChild(u);
    }, 200));
  }
  function E(u) {
    let y = u && u.container;
    return typeof y == "string" && (y = document.querySelector(y)), y instanceof HTMLElement || (y = document.querySelector("[" + i + "]") || document.getElementById("ln-toast-container")), y || null;
  }
  function T(u, y) {
    const v = ((u.getAttribute("data-type") || "info") + "").toLowerCase(), C = u.getAttribute("data-title"), x = (u.innerText || u.textContent || "").trim(), D = c({
      type: v,
      title: C,
      message: x || void 0
    }, y);
    D && (u.parentNode && u.parentNode.replaceChild(D, u), requestAnimationFrame(() => D.classList.add("ln-toast__item--in")));
  }
  function M(u) {
    const y = u.detail || {}, v = E(y);
    if (!v) {
      console.warn("[ln-toast] No toast container found");
      return;
    }
    const C = v[r] || new l(v), x = c(y, v);
    if (!x) return;
    const D = Number.isFinite(y.timeout) ? y.timeout : C.timeoutDefault;
    g(C, x), D > 0 && (x._timer = setTimeout(() => b(x), D));
  }
  function q(u) {
    const y = u && u.detail || {};
    if (y.container) {
      const v = E(y);
      if (v)
        for (const C of Array.from(v.children)) b(C);
    } else {
      const v = document.querySelectorAll("[" + i + "]");
      for (const C of Array.from(v))
        for (const x of Array.from(C.children)) b(x);
    }
  }
  J(function() {
    e(), window.addEventListener("ln-toast:enqueue", M), window.addEventListener("ln-toast:clear", q), new MutationObserver(function(y) {
      for (const v of y) {
        if (v.type === "attributes") {
          o(v.target);
          continue;
        }
        for (const C of v.addedNodes)
          o(C);
      }
    }).observe(document.body, { childList: !0, subtree: !0, attributes: !0, attributeFilter: [i] }), o(document.body);
  }, "ln-toast");
})();
(function() {
  const i = "data-ln-accordion", r = "lnAccordion";
  if (window[r] !== void 0) return;
  function h(d) {
    return this.dom = d, this._onToggleOpen = function(A) {
      if (A.detail.target.closest("[data-ln-accordion]") !== d) return;
      const p = d.querySelectorAll("[data-ln-toggle]");
      for (const e of p)
        e !== A.detail.target && e.closest("[data-ln-accordion]") === d && e.getAttribute("data-ln-toggle") === "open" && e.setAttribute("data-ln-toggle", "close");
      S(d, "ln-accordion:change", { target: A.detail.target });
    }, d.addEventListener("ln-toggle:open", this._onToggleOpen), this;
  }
  h.prototype.destroy = function() {
    this.dom[r] && (this.dom.removeEventListener("ln-toggle:open", this._onToggleOpen), S(this.dom, "ln-accordion:destroyed", { target: this.dom }), delete this.dom[r]);
  }, F(i, r, h, "ln-accordion");
})();
(function() {
  const i = "data-ln-toggle", r = "lnToggle";
  if (window[r] !== void 0) return;
  function h(e) {
    const o = Array.from(e.querySelectorAll("[data-ln-toggle-for]"));
    e.hasAttribute && e.hasAttribute("data-ln-toggle-for") && o.push(e);
    for (const l of o) {
      if (l[r + "Trigger"]) continue;
      const c = function(b) {
        if (b.ctrlKey || b.metaKey || b.button === 1) return;
        b.preventDefault();
        const E = l.getAttribute("data-ln-toggle-for"), T = document.getElementById(E);
        if (!T || !T[r]) return;
        const M = l.getAttribute("data-ln-toggle-action") || "toggle";
        if (M === "open")
          T.setAttribute(i, "open");
        else if (M === "close")
          T.setAttribute(i, "close");
        else if (M === "toggle") {
          const q = T.getAttribute(i);
          T.setAttribute(i, q === "open" ? "close" : "open");
        }
      };
      l.addEventListener("click", c), l[r + "Trigger"] = c;
      const m = l.getAttribute("data-ln-toggle-for"), g = document.getElementById(m);
      g && g[r] && l.setAttribute("aria-expanded", g[r].isOpen ? "true" : "false");
    }
  }
  function d(e, o) {
    const l = document.querySelectorAll(
      '[data-ln-toggle-for="' + e.id + '"]'
    );
    for (const c of l)
      c.setAttribute("aria-expanded", o ? "true" : "false");
  }
  function A(e) {
    if (this.dom = e, e.hasAttribute("data-ln-persist")) {
      const o = Ct("toggle", e);
      o !== null && e.setAttribute(i, o);
    }
    return this.isOpen = e.getAttribute(i) === "open", this.isOpen && e.classList.add("open"), d(e, this.isOpen), this;
  }
  A.prototype.destroy = function() {
    if (!this.dom[r]) return;
    S(this.dom, "ln-toggle:destroyed", { target: this.dom });
    const e = document.querySelectorAll('[data-ln-toggle-for="' + this.dom.id + '"]');
    for (const o of e)
      o[r + "Trigger"] && (o.removeEventListener("click", o[r + "Trigger"]), delete o[r + "Trigger"]);
    delete this.dom[r];
  };
  function p(e) {
    const o = e[r];
    if (!o) return;
    const c = e.getAttribute(i) === "open";
    if (c !== o.isOpen)
      if (c) {
        if (R(e, "ln-toggle:before-open", { target: e }).defaultPrevented) {
          e.setAttribute(i, "close");
          return;
        }
        o.isOpen = !0, e.classList.add("open"), d(e, !0), S(e, "ln-toggle:open", { target: e }), e.hasAttribute("data-ln-persist") && ot("toggle", e, "open");
      } else {
        if (R(e, "ln-toggle:before-close", { target: e }).defaultPrevented) {
          e.setAttribute(i, "open");
          return;
        }
        o.isOpen = !1, e.classList.remove("open"), d(e, !1), S(e, "ln-toggle:close", { target: e }), e.hasAttribute("data-ln-persist") && ot("toggle", e, "close");
      }
  }
  F(i, r, A, "ln-toggle", {
    extraAttributes: ["data-ln-toggle-for"],
    onAttributeChange: p,
    onInit: h
  });
})();
(function() {
  const i = "data-ln-sortable", r = "lnSortable", h = "data-ln-sortable-handle";
  if (window[r] !== void 0) return;
  function d(p) {
    this.dom = p, this.isEnabled = p.getAttribute(i) !== "disabled", this._dragging = null, p.setAttribute("aria-roledescription", "sortable list");
    const e = this;
    return this._onPointerDown = function(o) {
      e.isEnabled && e._handlePointerDown(o);
    }, p.addEventListener("pointerdown", this._onPointerDown), this;
  }
  d.prototype.enable = function() {
    this.isEnabled || this.dom.setAttribute(i, "");
  }, d.prototype.disable = function() {
    this.isEnabled && this.dom.setAttribute(i, "disabled");
  }, d.prototype.destroy = function() {
    this.dom[r] && (this.dom.removeEventListener("pointerdown", this._onPointerDown), S(this.dom, "ln-sortable:destroyed", { target: this.dom }), delete this.dom[r]);
  }, d.prototype._handlePointerDown = function(p) {
    let e = p.target.closest("[" + h + "]"), o;
    if (e) {
      for (o = e; o && o.parentElement !== this.dom; )
        o = o.parentElement;
      if (!o || o.parentElement !== this.dom) return;
    } else {
      if (this.dom.querySelector("[" + h + "]")) return;
      for (o = p.target; o && o.parentElement !== this.dom; )
        o = o.parentElement;
      if (!o || o.parentElement !== this.dom) return;
      e = o;
    }
    const c = Array.from(this.dom.children).indexOf(o);
    if (R(this.dom, "ln-sortable:before-drag", {
      item: o,
      index: c
    }).defaultPrevented) return;
    p.preventDefault(), e.setPointerCapture(p.pointerId), this._dragging = o, o.classList.add("ln-sortable--dragging"), o.setAttribute("aria-grabbed", "true"), this.dom.classList.add("ln-sortable--active"), S(this.dom, "ln-sortable:drag-start", {
      item: o,
      index: c
    });
    const g = this, b = function(T) {
      g._handlePointerMove(T);
    }, E = function(T) {
      g._handlePointerEnd(T), e.removeEventListener("pointermove", b), e.removeEventListener("pointerup", E), e.removeEventListener("pointercancel", E);
    };
    e.addEventListener("pointermove", b), e.addEventListener("pointerup", E), e.addEventListener("pointercancel", E);
  }, d.prototype._handlePointerMove = function(p) {
    if (!this._dragging) return;
    const e = Array.from(this.dom.children), o = this._dragging;
    for (const l of e)
      l.classList.remove("ln-sortable--drop-before", "ln-sortable--drop-after");
    for (const l of e) {
      if (l === o) continue;
      const c = l.getBoundingClientRect(), m = c.top + c.height / 2;
      if (p.clientY >= c.top && p.clientY < m) {
        l.classList.add("ln-sortable--drop-before");
        break;
      } else if (p.clientY >= m && p.clientY <= c.bottom) {
        l.classList.add("ln-sortable--drop-after");
        break;
      }
    }
  }, d.prototype._handlePointerEnd = function(p) {
    if (!this._dragging) return;
    const e = this._dragging, o = Array.from(this.dom.children), l = o.indexOf(e);
    let c = null, m = null;
    for (const g of o) {
      if (g.classList.contains("ln-sortable--drop-before")) {
        c = g, m = "before";
        break;
      }
      if (g.classList.contains("ln-sortable--drop-after")) {
        c = g, m = "after";
        break;
      }
    }
    for (const g of o)
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
  function A(p) {
    const e = p[r];
    if (!e) return;
    const o = p.getAttribute(i) !== "disabled";
    o !== e.isEnabled && (e.isEnabled = o, S(p, o ? "ln-sortable:enabled" : "ln-sortable:disabled", { target: p }));
  }
  F(i, r, d, "ln-sortable", {
    onAttributeChange: A
  });
})();
(function() {
  const i = "data-ln-search", r = "lnSearch", h = "data-ln-search-initialized", d = "data-ln-search-hide";
  if (window[r] !== void 0) return;
  function p(e) {
    if (e.hasAttribute(h)) return this;
    this.dom = e, this.targetId = e.getAttribute(i);
    const o = e.tagName;
    if (this.input = o === "INPUT" || o === "TEXTAREA" ? e : e.querySelector('[name="search"]') || e.querySelector('input[type="search"]') || e.querySelector('input[type="text"]'), this.itemsSelector = e.getAttribute("data-ln-search-items") || null, this._debounceTimer = null, this._attachHandler(), this.input && this.input.value.trim()) {
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
    const o = document.getElementById(this.targetId);
    if (!o || R(o, "ln-search:change", { term: e, targetId: this.targetId }).defaultPrevented) return;
    const c = this.itemsSelector ? o.querySelectorAll(this.itemsSelector) : o.children;
    for (let m = 0; m < c.length; m++) {
      const g = c[m];
      g.removeAttribute(d), e && !g.textContent.replace(/\s+/g, " ").toLowerCase().includes(e) && g.setAttribute(d, "true");
    }
  }, p.prototype.destroy = function() {
    this.dom[r] && (clearTimeout(this._debounceTimer), this.input && this._onInput && this.input.removeEventListener("input", this._onInput), this._clearBtn && this._onClear && this._clearBtn.removeEventListener("click", this._onClear), this.dom.removeAttribute(h), delete this.dom[r]);
  }, F(i, r, p, "ln-search");
})();
(function() {
  const i = "[data-ln-progress]", r = "lnProgress";
  if (window[r] !== void 0) return;
  function h(c) {
    d(c);
  }
  function d(c) {
    const m = Array.from(c.querySelectorAll(i));
    for (const g of m)
      g[r] || (g[r] = new A(g));
    c.hasAttribute && c.hasAttribute("data-ln-progress") && !c[r] && (c[r] = new A(c));
  }
  function A(c) {
    return this.dom = c, this._attrObserver = null, this._parentObserver = null, l.call(this), e.call(this), o.call(this), this;
  }
  A.prototype.destroy = function() {
    this.dom[r] && (this._attrObserver && this._attrObserver.disconnect(), this._parentObserver && this._parentObserver.disconnect(), delete this.dom[r]);
  };
  function p() {
    J(function() {
      new MutationObserver(function(m) {
        for (const g of m)
          if (g.type === "childList")
            for (const b of g.addedNodes)
              b.nodeType === 1 && d(b);
          else g.type === "attributes" && d(g.target);
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
  function o() {
    const c = this, m = this.dom.parentElement;
    if (!m || !m.hasAttribute("data-ln-progress-max")) return;
    const g = new MutationObserver(function(b) {
      for (const E of b)
        E.attributeName === "data-ln-progress-max" && l.call(c);
    });
    g.observe(m, {
      attributes: !0,
      attributeFilter: ["data-ln-progress-max"]
    }), this._parentObserver = g;
  }
  function l() {
    const c = parseFloat(this.dom.getAttribute("data-ln-progress")) || 0, m = this.dom.parentElement, b = (m && m.hasAttribute("data-ln-progress-max") ? parseFloat(m.getAttribute("data-ln-progress-max")) : null) || parseFloat(this.dom.getAttribute("data-ln-progress-max")) || 100;
    let E = b > 0 ? c / b * 100 : 0;
    E < 0 && (E = 0), E > 100 && (E = 100), this.dom.style.width = E + "%";
    const T = Math.max(0, Math.min(c, b));
    this.dom.setAttribute("role", "progressbar"), this.dom.setAttribute("aria-valuemin", "0"), this.dom.setAttribute("aria-valuemax", String(b)), this.dom.setAttribute("aria-valuenow", String(T)), S(this.dom, "ln-progress:change", { target: this.dom, value: c, max: b, percentage: E });
  }
  window[r] = h, document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
    h(document.body);
  }) : h(document.body);
})();
(function() {
  const i = "data-ln-data-store", r = "lnDataStore";
  if (window[r] !== void 0) return;
  const h = "ln_app_cache", d = "_meta", A = "1.0";
  let p = null, e = null;
  const o = {};
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
    for (const n of document.querySelectorAll(`[${i}]`)) {
      const a = n.getAttribute(i);
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
        if (!(!w.includes(d) || a.some((K) => !w.includes(K))))
          return b(_), p = _, t(_);
        const B = _.version;
        _.close();
        const k = indexedDB.open(h, B + 1);
        k.onblocked = () => {
          console.warn("[ln-data-store] Database upgrade blocked — waiting for other tabs to close connection");
        }, k.onerror = () => {
          console.warn("[ln-data-store] Database upgrade failed"), t(null);
        }, k.onupgradeneeded = (K) => {
          const P = K.target.result;
          P.objectStoreNames.contains(d) || P.createObjectStore(d, { keyPath: "key" });
          for (const W of a)
            if (!P.objectStoreNames.contains(W)) {
              const _t = P.createObjectStore(W, { keyPath: "id" });
              for (const rt of n[W].indexes)
                _t.createIndex(rt, rt, { unique: !1 });
            }
        }, k.onsuccess = (K) => {
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
  function E() {
    return p ? Promise.resolve(p) : (e = null, g());
  }
  async function T(t) {
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
  async function M(t) {
    return !t || !t.encrypted || !H() ? t : Lt(t);
  }
  const q = (t, n) => E().then((a) => a ? a.transaction(t, n).objectStore(t) : null);
  function u(t) {
    return new Promise((n, a) => {
      t.onsuccess = () => n(t.result), t.onerror = () => {
        c(t.error), a(t.error);
      };
    });
  }
  const y = (t) => q(t, "readonly").then((n) => n ? u(n.getAll()) : []).then((n) => H() ? Promise.all(n.map((a) => M(a))) : n), v = (t, n) => q(t, "readonly").then((a) => a ? u(a.get(n)) : null).then((a) => a ? M(a) : null), C = (t, n) => (H() ? T(n) : Promise.resolve(n)).then((s) => q(t, "readwrite").then((f) => f ? u(f.put(s)) : null)), x = (t, n) => q(t, "readwrite").then((a) => a ? u(a.delete(n)) : null), D = (t) => q(t, "readwrite").then((n) => n ? u(n.clear()) : null), U = (t) => q(t, "readonly").then((n) => n ? u(n.count()) : 0), $ = (t) => q(d, "readonly").then((n) => n ? u(n.get(t)) : null), j = (t, n) => q(d, "readwrite").then((a) => {
    if (a)
      return n.key = t, u(a.put(n));
  });
  function O(t) {
    this.dom = t, this._name = t.getAttribute(i);
    const n = t.getAttribute("data-ln-data-store-stale") || t.getAttribute("data-ln-store-stale"), a = parseInt(n, 10);
    this._staleThreshold = n === "never" || n === "-1" ? -1 : isNaN(a) ? 300 : a;
    const s = t.getAttribute("data-ln-data-store-search-fields") || t.getAttribute("data-ln-store-search-fields") || "";
    return this._searchFields = s.split(",").map((f) => f.trim()).filter(Boolean), this._handlers = null, this._pendingSnapshots = {}, this.isLoaded = !1, this.isSyncing = !1, this.lastSyncedAt = null, this.totalCount = 0, this.presenters = null, o[this._name] = this, V(this), ft(this), this;
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
    C(t._name, s).then(() => {
      t.totalCount++, S(t.dom, "ln-store:created", { store: t._name, record: s, tempId: a }), S(t.dom, "ln-store:request-remote-create", { tempId: a, data: n });
    });
  }
  function ct(t, { id: n, data: a = {}, expected_version: s } = {}) {
    v(t._name, n).then((f) => {
      if (!f) throw new Error(`Record not found: ${n}`);
      t._pendingSnapshots[n] = { ...f };
      const _ = { ...f, ...a, _pending: !0 };
      return C(t._name, _).then(() => {
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
      n && n.schema_version === A ? (t.lastSyncedAt = n.last_synced_at || null, t.totalCount = n.record_count || 0, t.totalCount > 0 ? (t.isLoaded = !0, S(t.dom, "ln-store:ready", { store: t._name, count: t.totalCount, source: "cache" }), Q(t) && I(t)) : I(t)) : n && n.schema_version !== A ? D(t._name).then(() => j(t._name, { schema_version: A, last_synced_at: null, record_count: 0 })).then(() => I(t)) : I(t);
    });
  }
  function Q(t) {
    return t._staleThreshold === -1 ? !1 : t.lastSyncedAt ? Math.floor(Date.now() / 1e3) - t.lastSyncedAt > t._staleThreshold : !0;
  }
  function I(t) {
    t.isSyncing = !0, S(t.dom, "ln-store:request-remote-sync", { since: t.lastSyncedAt });
  }
  function Z(t, n) {
    return E().then((a) => a ? (H() ? Promise.all(n.map((f) => T(f))) : Promise.resolve(n)).then((f) => new Promise((_, w) => {
      const L = a.transaction(t, "readwrite"), B = L.objectStore(t);
      f.forEach((k) => B.put(k)), L.oncomplete = () => _(), L.onerror = () => {
        c(L.error), w(L.error);
      };
    })) : void 0);
  }
  function tt(t, n) {
    return E().then((a) => {
      if (a)
        return new Promise((s, f) => {
          const _ = a.transaction(t, "readwrite"), w = _.objectStore(t);
          n.forEach((L) => w.delete(L)), _.oncomplete = () => s(), _.onerror = () => f(_.error);
        });
    });
  }
  let Y = () => {
    document.visibilityState === "visible" && Object.values(o).forEach((t) => {
      t.isLoaded && !t.isSyncing && Q(t) && I(t);
    });
  };
  document.addEventListener("visibilitychange", Y);
  const ht = new Intl.Collator(void 0, { numeric: !0, sensitivity: "base" });
  function mt(t, n) {
    if (!n || !n.field) return t;
    const { field: a, direction: s } = n, f = s === "desc";
    return [...t].sort((_, w) => {
      const L = _[a], B = w[a];
      if (L == null && B == null) return 0;
      if (L == null) return f ? 1 : -1;
      if (B == null) return f ? -1 : 1;
      const k = typeof L == "string" && typeof B == "string" ? ht.compare(L, B) : L < B ? -1 : L > B ? 1 : 0;
      return f ? -k : k;
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
        } catch (L) {
          console.error(`[ln-data-store] Decorator computed field failed for ${_}`, L);
        }
      return f;
    });
  }
  O.prototype.getAll = function(t = {}) {
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
  }, O.prototype.getById = function(t) {
    return v(this._name, t).then((n) => n ? nt(this, [n])[0] : null);
  }, O.prototype.count = function(t) {
    return t ? y(this._name).then((n) => et(n, t).length) : U(this._name);
  }, O.prototype.aggregate = function(t, n) {
    return y(this._name).then((a) => gt(a, t, n));
  }, O.prototype.setPresenters = function(t) {
    this.presenters = t;
  }, O.prototype.applySync = function(t, n, a) {
    const s = this, f = t.length > 0 || n.length > 0;
    let _ = Promise.resolve();
    return t.length > 0 && (_ = _.then(() => Z(s._name, t))), n.length > 0 && (_ = _.then(() => tt(s._name, n))), _.then(() => U(s._name)).then((w) => (s.totalCount = w, j(s._name, {
      schema_version: A,
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
  }, O.prototype.confirmMutation = function(t, n, a) {
    const s = this, f = {
      create: () => x(s._name, t).then(() => C(s._name, n)).then(() => {
        delete s._pendingSnapshots[t], S(s.dom, "ln-store:confirmed", { store: s._name, record: n, tempId: t, action: "create" });
      }),
      update: () => C(s._name, n).then(() => {
        delete s._pendingSnapshots[t], S(s.dom, "ln-store:confirmed", { store: s._name, record: n, action: "update" });
      }),
      delete: () => (delete s._pendingSnapshots[t], S(s.dom, "ln-store:confirmed", { store: s._name, record: null, action: "delete" }), Promise.resolve()),
      "bulk-delete": () => (delete s._pendingSnapshots[t], S(s.dom, "ln-store:confirmed", { store: s._name, record: null, ids: t.split(","), action: "bulk-delete" }), Promise.resolve())
    };
    return f[a] ? f[a]() : Promise.resolve();
  }, O.prototype.revertMutation = function(t, n, a) {
    const s = this, f = a || `Server rejected ${n}`, _ = {
      create: () => x(s._name, t).then(() => {
        s.totalCount--, delete s._pendingSnapshots[t], S(s.dom, "ln-store:reverted", { store: s._name, record: null, action: "create", error: f });
      }),
      update: () => {
        const w = s._pendingSnapshots[t];
        return w ? C(s._name, w).then(() => {
          delete s._pendingSnapshots[t], S(s.dom, "ln-store:reverted", { store: s._name, record: w, action: "update", error: f });
        }) : Promise.resolve();
      },
      delete: () => {
        const w = s._pendingSnapshots[t];
        return w ? C(s._name, w).then(() => {
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
  }, O.prototype.resolveConflict = function(t, n, a) {
    const s = this._pendingSnapshots[t];
    return s ? C(this._name, s).then(() => {
      delete this._pendingSnapshots[t], S(this.dom, "ln-store:conflict", {
        store: this._name,
        local: s,
        remote: n,
        field_diffs: a || null
      });
    }) : Promise.resolve();
  }, O.prototype.forceSync = function() {
    I(this);
  }, O.prototype.fullReload = function() {
    const t = this;
    return D(t._name).then(() => {
      t.isLoaded = !1, t.lastSyncedAt = null, t.totalCount = 0, I(t);
    });
  }, O.prototype.destroy = function() {
    if (this._handlers) {
      for (const [t, n] of Object.entries(this._handlers))
        this.dom.removeEventListener(`ln-store:request-${t}`, n);
      this._handlers = null;
    }
    delete o[this._name], Object.keys(o).length === 0 && Y && (document.removeEventListener("visibilitychange", Y), Y = null), delete this.dom[r], S(this.dom, "ln-store:destroyed", { store: this._name });
  };
  function bt() {
    return E().then((t) => {
      if (!t) return;
      const n = Array.from(t.objectStoreNames);
      return new Promise((a, s) => {
        const f = t.transaction(n, "readwrite");
        n.forEach((_) => f.objectStore(_).clear()), f.oncomplete = () => a(), f.onerror = () => s(f.error);
      });
    }).then(() => {
      Object.values(o).forEach((t) => {
        t.isLoaded = !1, t.isSyncing = !1, t.lastSyncedAt = null, t.totalCount = 0;
      });
    });
  }
  F(i, r, O, "ln-data-store"), window[r].clearAll = bt, window[r].init = window[r], window[r].setStorageKey = it, typeof window < "u" && (window.lnCore = window.lnCore || {}, window.lnCore.setStorageKey = it);
})();
export {
  yt as cloneTemplate,
  vt as fill,
  qt as fillTemplate
};
