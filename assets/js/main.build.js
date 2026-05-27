const zt = {};
function Vt(p, t) {
  zt[p] || (zt[p] = document.querySelector('[data-ln-template="' + p + '"]'));
  const s = zt[p];
  return s ? s.content.cloneNode(!0) : (console.warn("[" + (t || "ln-core") + '] Template "' + p + '" not found'), null);
}
function A(p, t, s) {
  p.dispatchEvent(new CustomEvent(t, {
    bubbles: !0,
    detail: s || {}
  }));
}
function Z(p, t, s) {
  const r = new CustomEvent(t, {
    bubbles: !0,
    cancelable: !0,
    detail: s || {}
  });
  return p.dispatchEvent(r), r;
}
function ot(p, t) {
  if (!p || !t) return p;
  const s = p.querySelectorAll("[data-ln-field]");
  for (let i = 0; i < s.length; i++) {
    const n = s[i], e = n.getAttribute("data-ln-field");
    t[e] != null && (n.textContent = t[e]);
  }
  const r = p.querySelectorAll("[data-ln-attr]");
  for (let i = 0; i < r.length; i++) {
    const n = r[i], e = n.getAttribute("data-ln-attr").split(",");
    for (let o = 0; o < e.length; o++) {
      const a = e[o].trim().split(":");
      if (a.length !== 2) continue;
      const f = a[0].trim(), c = a[1].trim();
      t[c] != null && n.setAttribute(f, t[c]);
    }
  }
  const d = p.querySelectorAll("[data-ln-show]");
  for (let i = 0; i < d.length; i++) {
    const n = d[i], e = n.getAttribute("data-ln-show");
    e in t && n.classList.toggle("hidden", !t[e]);
  }
  const h = p.querySelectorAll("[data-ln-class]");
  for (let i = 0; i < h.length; i++) {
    const n = h[i], e = n.getAttribute("data-ln-class").split(",");
    for (let o = 0; o < e.length; o++) {
      const a = e[o].trim().split(":");
      if (a.length !== 2) continue;
      const f = a[0].trim(), c = a[1].trim();
      c in t && n.classList.toggle(f, !!t[c]);
    }
  }
  return p;
}
function me(p, t) {
  if (!p || !t) return p;
  const s = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
  for (; s.nextNode(); ) {
    const r = s.currentNode;
    r.textContent.indexOf("{{") !== -1 && (r.textContent = r.textContent.replace(
      /\{\{\s*(\w+)\s*\}\}/g,
      function(d, h) {
        return t[h] !== void 0 ? t[h] : "";
      }
    ));
  }
  return p;
}
function nt(p, t) {
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", function() {
      nt(p, t);
    }), console.warn("[" + t + '] Script loaded before <body> — add "defer" to your <script> tag');
    return;
  }
  p();
}
function dt(p, t, s) {
  if (p) {
    const r = p.querySelector('[data-ln-template="' + t + '"]');
    if (r) return r.content.cloneNode(!0);
  }
  return Vt(t, s);
}
function Te(p, t) {
  const s = {}, r = p.querySelectorAll("[" + t + "]");
  for (let d = 0; d < r.length; d++)
    s[r[d].getAttribute(t)] = r[d].textContent, r[d].remove();
  return s;
}
function Gt(p, t, s, r) {
  if (p.nodeType !== 1) return;
  const d = t.indexOf("[") !== -1 || t.indexOf(".") !== -1 || t.indexOf("#") !== -1 ? t : "[" + t + "]", h = Array.from(p.querySelectorAll(d));
  p.matches && p.matches(d) && h.push(p);
  for (const i of h)
    i[s] || (i[s] = new r(i));
}
function Tt(p) {
  return !!(p.offsetWidth || p.offsetHeight || p.getClientRects().length);
}
function ge(p) {
  const t = {}, s = p.elements;
  for (let r = 0; r < s.length; r++) {
    const d = s[r];
    if (!(!d.name || d.disabled || d.type === "file" || d.type === "submit" || d.type === "button"))
      if (d.type === "checkbox")
        t[d.name] || (t[d.name] = []), d.checked && t[d.name].push(d.value);
      else if (d.type === "radio")
        d.checked && (t[d.name] = d.value);
      else if (d.type === "select-multiple") {
        t[d.name] = [];
        for (let h = 0; h < d.options.length; h++)
          d.options[h].selected && t[d.name].push(d.options[h].value);
      } else
        t[d.name] = d.value;
  }
  return t;
}
function ye(p, t) {
  const s = p.elements, r = [];
  for (let d = 0; d < s.length; d++) {
    const h = s[d];
    if (!h.name || !(h.name in t) || h.type === "file" || h.type === "submit" || h.type === "button") continue;
    const i = t[h.name];
    if (h.type === "checkbox")
      h.checked = Array.isArray(i) ? i.indexOf(h.value) !== -1 : !!i, r.push(h);
    else if (h.type === "radio")
      h.checked = h.value === String(i), r.push(h);
    else if (h.type === "select-multiple") {
      if (Array.isArray(i))
        for (let n = 0; n < h.options.length; n++)
          h.options[n].selected = i.indexOf(h.options[n].value) !== -1;
      r.push(h);
    } else
      h.value = i, r.push(h);
  }
  return r;
}
function ct(p) {
  const t = p.closest("[lang]");
  return (t ? t.lang : null) || navigator.language;
}
function H(p, t, s, r, d = {}) {
  const h = d.extraAttributes || [], i = d.onAttributeChange || null, n = d.onInit || null;
  function e(o) {
    const a = o || document.body;
    Gt(a, p, t, s), n && n(a);
  }
  return nt(function() {
    const o = new MutationObserver(function(f) {
      for (let c = 0; c < f.length; c++) {
        const y = f[c];
        if (y.type === "childList")
          for (let l = 0; l < y.addedNodes.length; l++) {
            const u = y.addedNodes[l];
            u.nodeType === 1 && (Gt(u, p, t, s), n && n(u));
          }
        else y.type === "attributes" && (i && y.target[t] ? i(y.target, y.attributeName) : (Gt(y.target, p, t, s), n && n(y.target)));
      }
    });
    let a = [];
    if (p.indexOf("[") !== -1) {
      const f = /\[([\w-]+)/g;
      let c;
      for (; (c = f.exec(p)) !== null; )
        a.push(c[1]);
    } else
      a.push(p);
    o.observe(document.body, {
      childList: !0,
      subtree: !0,
      attributes: !0,
      attributeFilter: a.concat(h)
    });
  }, r || (p.indexOf("[") === -1 ? p.replace("data-", "") : "component")), window[t] = e, document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
    e(document.body);
  }) : e(document.body), e;
}
function V(...p) {
  return p.filter((t) => t != null && t !== "").map((t, s) => s === 0 ? t.replace(/\/+$/, "") : t.replace(/^\/+/, "").replace(/\/+$/, "")).filter(Boolean).join("/");
}
function Y(p, t) {
  return Object.assign({
    "Content-Type": "application/json",
    Accept: "application/json"
  }, p, t ? { Authorization: t } : null);
}
function ve(p, t = "ln-core") {
  try {
    return p ? JSON.parse(p) : {};
  } catch (s) {
    return console.error(`[${t}] Invalid headers JSON:`, s), {};
  }
}
const be = {};
function Ie(p, t) {
  be[p] = t;
}
function qe(p) {
  return be[p] || { ingress: (t) => t, egress: (t) => t };
}
typeof window < "u" && (window.lnCore = window.lnCore || {}, window.lnCore.registerDataMapper = Ie, window.lnCore.getDataMapper = qe);
function Pe(p, t) {
  let s = !1;
  return function() {
    s || (s = !0, queueMicrotask(function() {
      s = !1, p(), t && t();
    }));
  };
}
const De = "ln:";
function Oe() {
  return location.pathname.replace(/\/+$/, "").toLowerCase() || "/";
}
function _e(p, t) {
  const s = t.getAttribute("data-ln-persist"), r = s !== null && s !== "" ? s : t.id;
  return r ? De + p + ":" + Oe() + ":" + r : (console.warn('[ln-persist] Element requires id or data-ln-persist="key"', t), null);
}
function jt(p, t) {
  const s = _e(p, t);
  if (!s) return null;
  try {
    const r = localStorage.getItem(s);
    return r !== null ? JSON.parse(r) : null;
  } catch {
    return null;
  }
}
function gt(p, t, s) {
  const r = _e(p, t);
  if (r)
    try {
      localStorage.setItem(r, JSON.stringify(s));
    } catch {
    }
}
function Bt(p, t, s, r) {
  const d = typeof r == "number" ? r : 4, h = window.innerWidth, i = window.innerHeight, n = t.width, e = t.height, o = (s || "bottom").split("-"), a = o[0], f = o[1] === "start" || o[1] === "end" ? o[1] : "center", c = {
    top: ["top", "bottom", "right", "left"],
    bottom: ["bottom", "top", "right", "left"],
    left: ["left", "right", "top", "bottom"],
    right: ["right", "left", "top", "bottom"]
  }, y = c[a] || c.bottom;
  function l(b) {
    return b === "top" || b === "bottom" ? f === "start" ? p.left : f === "end" ? p.right - n : p.left + (p.width - n) / 2 : f === "start" ? p.top : f === "end" ? p.bottom - e : p.top + (p.height - e) / 2;
  }
  function u(b) {
    let E, _, k = !0;
    return b === "top" ? (E = p.top - d - e, _ = l(b), E < 0 && (k = !1)) : b === "bottom" ? (E = p.bottom + d, _ = l(b), E + e > i && (k = !1)) : b === "left" ? (E = l(b), _ = p.left - d - n, _ < 0 && (k = !1)) : (E = l(b), _ = p.right + d, _ + n > h && (k = !1)), { top: E, left: _, side: b, fits: k };
  }
  let g = null;
  for (let b = 0; b < y.length; b++) {
    const E = u(y[b]);
    if (E.fits) {
      g = E;
      break;
    }
  }
  g || (g = u(y[0]));
  let m = g.top, v = g.left;
  return n >= h ? v = 0 : (v < 0 && (v = 0), v + n > h && (v = h - n)), e >= i ? m = 0 : (m < 0 && (m = 0), m + e > i && (m = i - e)), { top: m, left: v, placement: g.side };
}
function we(p) {
  if (!p || p.parentNode === document.body)
    return function() {
    };
  const t = p.parentNode, s = document.createComment("ln-teleport");
  return t.insertBefore(s, p), document.body.appendChild(p), function() {
    s.parentNode && (s.parentNode.insertBefore(p, s), s.parentNode.removeChild(s));
  };
}
function Yt(p) {
  if (!p) return { width: 0, height: 0 };
  const t = p.style, s = t.visibility, r = t.display, d = t.position;
  t.visibility = "hidden", t.display = "block", t.position = "fixed";
  const h = p.offsetWidth, i = p.offsetHeight;
  return t.visibility = s, t.display = r, t.position = d, { width: h, height: i };
}
let ht = null;
async function Zt(p) {
  if (!p) {
    ht = null;
    return;
  }
  try {
    const t = new TextEncoder(), s = await crypto.subtle.digest("SHA-256", t.encode(p));
    ht = await crypto.subtle.importKey(
      "raw",
      s,
      { name: "AES-GCM" },
      !1,
      ["encrypt", "decrypt"]
    );
  } catch (t) {
    console.error("[ln-core/crypto] Key derivation failed:", t), ht = null;
  }
}
function Et() {
  return ht;
}
async function Me(p, t = ht) {
  const s = t || ht;
  if (!s || p === void 0 || p === null) return p;
  try {
    const r = new TextEncoder(), d = crypto.getRandomValues(new Uint8Array(12)), h = typeof p == "string" ? p : JSON.stringify(p), i = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: d },
      s,
      r.encode(h)
    ), n = btoa(String.fromCharCode(...d)), e = btoa(String.fromCharCode(...new Uint8Array(i)));
    return {
      encrypted: !0,
      iv: n,
      data: e
    };
  } catch (r) {
    return console.error("[ln-core/crypto] Encryption failed:", r), p;
  }
}
async function Re(p, t = ht) {
  const s = t || ht;
  if (!p || !p.encrypted || !s) return p;
  try {
    const r = new TextDecoder(), d = Uint8Array.from(atob(p.iv), (e) => e.charCodeAt(0)), h = Uint8Array.from(atob(p.data), (e) => e.charCodeAt(0)), i = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: d },
      s,
      h
    ), n = r.decode(i);
    try {
      return JSON.parse(n);
    } catch {
      return n;
    }
  } catch (r) {
    return console.error("[ln-core/crypto] Decryption failed. Key may be incorrect:", r), { ...p, decryptionError: !0 };
  }
}
(function() {
  if (window.lnHttp) return;
  const p = window.fetch.bind(window), t = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
  function r(o) {
    return typeof o == "string" ? o : o instanceof URL ? o.href : o instanceof Request ? o.url : String(o);
  }
  function d(o, a) {
    return a && a.method ? String(a.method).toUpperCase() : o instanceof Request ? o.method.toUpperCase() : "GET";
  }
  function h(o, a) {
    return a + " " + o;
  }
  function i(o) {
    return o === "GET" || o === "HEAD";
  }
  function n(o, a) {
    a = a || {};
    const f = r(o), c = d(o, a), y = h(f, c);
    i(c) && t.has(y) && (t.get(y).abort(), t.delete(y));
    const l = new AbortController(), u = a.signal;
    u && (u.aborted ? l.abort(u.reason) : u.addEventListener("abort", function() {
      l.abort(u.reason);
    }, { once: !0 }));
    const g = Object.assign({}, a, { signal: l.signal });
    return t.set(y, l), p(o, g).finally(function() {
      t.get(y) === l && t.delete(y);
    });
  }
  n.toString = function() {
    return "function fetch() { [ln-http wrapped] }";
  }, window.fetch = n;
  function e(o) {
    const a = o.detail || {};
    if (!a.url) return;
    const f = o.target, c = (a.method || (a.body ? "POST" : "GET")).toUpperCase(), y = a.key;
    y && s.has(y) && (s.get(y).abort(), s.delete(y));
    const l = new AbortController(), u = a.signal;
    u && (u.aborted ? l.abort(u.reason) : u.addEventListener("abort", function() {
      l.abort(u.reason);
    }, { once: !0 })), y && s.set(y, l);
    const g = { method: c, signal: l.signal };
    a.body !== void 0 && (g.body = a.body), window.fetch(a.url, g).then(function(m) {
      y && s.get(y) === l && s.delete(y), A(f, "ln-http:response", {
        ok: m.ok,
        status: m.status,
        response: m
      });
    }).catch(function(m) {
      y && s.get(y) === l && s.delete(y), !(m && m.name === "AbortError") && A(f, "ln-http:error", {
        ok: !1,
        status: 0,
        error: m
      });
    });
  }
  document.addEventListener("ln-http:request", e), window.lnHttp = {
    cancel: function(o) {
      let a = !1;
      return t.forEach(function(f, c) {
        c.endsWith(" " + o) && (f.abort(), t.delete(c), a = !0);
      }), a;
    },
    cancelByKey: function(o) {
      return s.has(o) ? (s.get(o).abort(), s.delete(o), !0) : !1;
    },
    cancelAll: function() {
      t.forEach(function(o) {
        o.abort();
      }), t.clear(), s.forEach(function(o) {
        o.abort();
      }), s.clear();
    },
    get inflight() {
      const o = [];
      return t.forEach(function(a, f) {
        const c = f.indexOf(" ");
        o.push({ method: f.slice(0, c), url: f.slice(c + 1) });
      }), s.forEach(function(a, f) {
        o.push({ key: f });
      }), o;
    },
    destroy: function() {
      window.lnHttp.cancelAll(), document.removeEventListener("ln-http:request", e), window.fetch = p, delete window.lnHttp;
    }
  };
})();
(function() {
  const p = "data-ln-ajax", t = "lnAjax";
  if (window[t] !== void 0) return;
  function s(a) {
    if (!a.hasAttribute(p) || a[t]) return;
    a[t] = !0;
    const f = n(a);
    r(f.links), d(f.forms);
  }
  function r(a) {
    for (const f of a) {
      if (f[t + "Trigger"] || f.hostname && f.hostname !== window.location.hostname) continue;
      const c = f.getAttribute("href");
      if (c && c.includes("#")) continue;
      const y = function(l) {
        if (l.ctrlKey || l.metaKey || l.button === 1) return;
        l.preventDefault();
        const u = f.getAttribute("href");
        u && i("GET", u, null, f);
      };
      f.addEventListener("click", y), f[t + "Trigger"] = y;
    }
  }
  function d(a) {
    for (const f of a) {
      if (f[t + "Trigger"]) continue;
      const c = function(y) {
        y.preventDefault();
        const l = f.method.toUpperCase(), u = f.action, g = new FormData(f);
        for (const m of f.querySelectorAll('button, input[type="submit"]'))
          m.disabled = !0;
        i(l, u, g, f, function() {
          for (const m of f.querySelectorAll('button, input[type="submit"]'))
            m.disabled = !1;
        });
      };
      f.addEventListener("submit", c), f[t + "Trigger"] = c;
    }
  }
  function h(a) {
    if (!a[t]) return;
    const f = n(a);
    for (const c of f.links)
      c[t + "Trigger"] && (c.removeEventListener("click", c[t + "Trigger"]), delete c[t + "Trigger"]);
    for (const c of f.forms)
      c[t + "Trigger"] && (c.removeEventListener("submit", c[t + "Trigger"]), delete c[t + "Trigger"]);
    delete a[t];
  }
  function i(a, f, c, y, l) {
    if (Z(y, "ln-ajax:before-start", { method: a, url: f }).defaultPrevented) return;
    A(y, "ln-ajax:start", { method: a, url: f }), y.classList.add("ln-ajax--loading");
    const u = document.createElement("span");
    u.className = "ln-ajax-spinner", y.appendChild(u);
    function g() {
      y.classList.remove("ln-ajax--loading");
      const _ = y.querySelector(".ln-ajax-spinner");
      _ && _.remove(), l && l();
    }
    let m = f;
    const v = document.querySelector('meta[name="csrf-token"]'), b = v ? v.getAttribute("content") : null;
    c instanceof FormData && b && c.append("_token", b);
    const E = {
      method: a,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json"
      }
    };
    if (b && (E.headers["X-CSRF-TOKEN"] = b), a === "GET" && c) {
      const _ = new URLSearchParams(c);
      m = f + (f.includes("?") ? "&" : "?") + _.toString();
    } else a !== "GET" && c && (E.body = c);
    fetch(m, E).then(function(_) {
      const k = _.ok;
      return _.json().then(function(x) {
        return { ok: k, status: _.status, data: x };
      });
    }).then(function(_) {
      const k = _.data;
      if (_.ok) {
        if (k.title && (document.title = k.title), k.content)
          for (const x in k.content) {
            const q = document.getElementById(x);
            if (q) {
              let I = k.content[x];
              window.DOMPurify && typeof window.DOMPurify.sanitize == "function" ? I = window.DOMPurify.sanitize(I) : I = I.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/on\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, ""), q.innerHTML = I;
            }
          }
        if (y.tagName === "A") {
          const x = y.getAttribute("href");
          x && window.history.pushState({ ajax: !0 }, "", x);
        } else y.tagName === "FORM" && y.method.toUpperCase() === "GET" && window.history.pushState({ ajax: !0 }, "", m);
        A(y, "ln-ajax:success", { method: a, url: m, data: k });
      } else
        A(y, "ln-ajax:error", { method: a, url: m, status: _.status, data: k });
      if (k.message) {
        const x = k.message;
        window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
          detail: {
            type: x.type || (_.ok ? "success" : "error"),
            title: x.title || "",
            message: x.body || ""
          }
        }));
      }
      A(y, "ln-ajax:complete", { method: a, url: m }), g();
    }).catch(function(_) {
      A(y, "ln-ajax:error", { method: a, url: m, error: _ }), A(y, "ln-ajax:complete", { method: a, url: m }), g();
    });
  }
  function n(a) {
    const f = { links: [], forms: [] };
    return a.tagName === "A" && a.getAttribute(p) !== "false" ? f.links.push(a) : a.tagName === "FORM" && a.getAttribute(p) !== "false" ? f.forms.push(a) : (f.links = Array.from(a.querySelectorAll('a:not([data-ln-ajax="false"])')), f.forms = Array.from(a.querySelectorAll('form:not([data-ln-ajax="false"])'))), f;
  }
  function e() {
    nt(function() {
      new MutationObserver(function(a) {
        for (const f of a)
          if (f.type === "childList") {
            for (const c of f.addedNodes)
              if (c.nodeType === 1 && (s(c), !c.hasAttribute(p))) {
                for (const l of c.querySelectorAll("[" + p + "]"))
                  s(l);
                const y = c.closest && c.closest("[" + p + "]");
                if (y && y.getAttribute(p) !== "false") {
                  const l = n(c);
                  r(l.links), d(l.forms);
                }
              }
          } else f.type === "attributes" && s(f.target);
      }).observe(document.body, {
        childList: !0,
        subtree: !0,
        attributes: !0,
        attributeFilter: [p]
      });
    }, "ln-ajax");
  }
  function o() {
    for (const a of document.querySelectorAll("[" + p + "]"))
      s(a);
  }
  window[t] = s, window[t].destroy = h, e(), document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", o) : o();
})();
(function() {
  const p = "data-ln-modal", t = "lnModal";
  if (window[t] !== void 0) return;
  function s(i) {
    const n = Array.from(i.querySelectorAll("[data-ln-modal-for]"));
    i.hasAttribute && i.hasAttribute("data-ln-modal-for") && n.push(i);
    for (const e of n) {
      if (e[t + "Trigger"]) continue;
      const o = function(a) {
        if (a.ctrlKey || a.metaKey || a.button === 1) return;
        a.preventDefault();
        const f = e.getAttribute("data-ln-modal-for"), c = document.getElementById(f);
        if (!c) {
          console.warn('[ln-modal] No modal found for data-ln-modal-for="' + f + '"');
          return;
        }
        if (!c[t]) return;
        const y = c.getAttribute(p);
        c.setAttribute(p, y === "open" ? "close" : "open");
      };
      e.addEventListener("click", o), e[t + "Trigger"] = o;
    }
  }
  function r(i) {
    this.dom = i, this.isOpen = i.getAttribute(p) === "open";
    const n = this;
    return this._onEscape = function(e) {
      e.key === "Escape" && n.dom.setAttribute(p, "close");
    }, this._onFocusTrap = function(e) {
      if (e.key !== "Tab") return;
      const o = Array.prototype.filter.call(
        n.dom.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        Tt
      );
      if (o.length === 0) return;
      const a = o[0], f = o[o.length - 1];
      e.shiftKey ? document.activeElement === a && (e.preventDefault(), f.focus()) : document.activeElement === f && (e.preventDefault(), a.focus());
    }, this._onClose = function(e) {
      e.preventDefault(), n.dom.setAttribute(p, "close");
    }, h(this), this.isOpen && (this.dom.setAttribute("aria-modal", "true"), this.dom.setAttribute("role", "dialog"), document.body.classList.add("ln-modal-open"), document.addEventListener("keydown", this._onEscape), document.addEventListener("keydown", this._onFocusTrap)), this;
  }
  r.prototype.destroy = function() {
    if (!this.dom[t]) return;
    this.isOpen && (this.dom.removeAttribute("aria-modal"), document.removeEventListener("keydown", this._onEscape), document.removeEventListener("keydown", this._onFocusTrap), this._returnFocusEl = null, document.querySelector("[" + p + '="open"]') || document.body.classList.remove("ln-modal-open"));
    const i = this.dom.querySelectorAll("[data-ln-modal-close]");
    for (const e of i)
      e[t + "Close"] && (e.removeEventListener("click", e[t + "Close"]), delete e[t + "Close"]);
    const n = document.querySelectorAll('[data-ln-modal-for="' + this.dom.id + '"]');
    for (const e of n)
      e[t + "Trigger"] && (e.removeEventListener("click", e[t + "Trigger"]), delete e[t + "Trigger"]);
    A(this.dom, "ln-modal:destroyed", { modalId: this.dom.id, target: this.dom }), delete this.dom[t];
  };
  function d(i) {
    const n = i[t];
    if (!n) return;
    const e = i.getAttribute(p) === "open";
    if (e !== n.isOpen)
      if (e) {
        if (Z(i, "ln-modal:before-open", { modalId: i.id, target: i }).defaultPrevented) {
          i.setAttribute(p, "close");
          return;
        }
        n.isOpen = !0, i.setAttribute("aria-modal", "true"), i.setAttribute("role", "dialog"), document.body.classList.add("ln-modal-open"), document.addEventListener("keydown", n._onEscape), document.addEventListener("keydown", n._onFocusTrap);
        const o = document.activeElement;
        n._returnFocusEl = o && o !== document.body ? o : null;
        const a = i.querySelector("[autofocus]");
        if (a && Tt(a))
          a.focus();
        else {
          const f = i.querySelectorAll('input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled])'), c = Array.prototype.find.call(f, Tt);
          if (c) c.focus();
          else {
            const y = i.querySelectorAll("a[href], button:not([disabled])"), l = Array.prototype.find.call(y, Tt);
            l && l.focus();
          }
        }
        A(i, "ln-modal:open", { modalId: i.id, target: i });
      } else {
        if (Z(i, "ln-modal:before-close", { modalId: i.id, target: i }).defaultPrevented) {
          i.setAttribute(p, "open");
          return;
        }
        n.isOpen = !1, i.removeAttribute("aria-modal"), document.removeEventListener("keydown", n._onEscape), document.removeEventListener("keydown", n._onFocusTrap), A(i, "ln-modal:close", { modalId: i.id, target: i }), n._returnFocusEl && document.contains(n._returnFocusEl) && typeof n._returnFocusEl.focus == "function" && n._returnFocusEl.focus(), n._returnFocusEl = null, document.querySelector("[" + p + '="open"]') || document.body.classList.remove("ln-modal-open");
      }
  }
  function h(i) {
    const n = i.dom.querySelectorAll("[data-ln-modal-close]");
    for (const e of n)
      e[t + "Close"] || (e.addEventListener("click", i._onClose), e[t + "Close"] = i._onClose);
  }
  H(p, t, r, "ln-modal", {
    extraAttributes: ["data-ln-modal-for"],
    onAttributeChange: d,
    onInit: s
  });
})();
(function() {
  const p = "data-ln-number", t = "lnNumber";
  if (window[t] !== void 0) return;
  const s = {}, r = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  function d(e) {
    if (!s[e]) {
      const o = new Intl.NumberFormat(e, { useGrouping: !0 }), a = o.formatToParts(1234.5);
      let f = "", c = ".";
      for (let y = 0; y < a.length; y++)
        a[y].type === "group" && (f = a[y].value), a[y].type === "decimal" && (c = a[y].value);
      s[e] = { fmt: o, groupSep: f, decimalSep: c };
    }
    return s[e];
  }
  function h(e, o, a) {
    if (a !== null) {
      const f = parseInt(a, 10), c = e + "|d" + f;
      return s[c] || (s[c] = new Intl.NumberFormat(e, { useGrouping: !0, minimumFractionDigits: 0, maximumFractionDigits: f })), s[c].format(o);
    }
    return d(e).fmt.format(o);
  }
  function i(e) {
    if (e.tagName !== "INPUT")
      return console.warn("[ln-number] Can only be applied to <input>, got:", e.tagName), this;
    this.dom = e;
    const o = document.createElement("input");
    o.type = "hidden", o.name = e.name, e.removeAttribute("name"), e.type = "text", e.setAttribute("inputmode", "decimal"), e.insertAdjacentElement("afterend", o), this._hidden = o;
    const a = this;
    Object.defineProperty(o, "value", {
      get: function() {
        return r.get.call(o);
      },
      set: function(c) {
        r.set.call(o, c), c !== "" && !isNaN(parseFloat(c)) ? a._displayFormatted(parseFloat(c)) : c === "" && (a.dom.value = "");
      }
    }), this._onInput = function() {
      a._handleInput();
    }, e.addEventListener("input", this._onInput), this._onPaste = function(c) {
      c.preventDefault();
      const y = (c.clipboardData || window.clipboardData).getData("text"), l = d(ct(e)), u = l.decimalSep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      let g = y.replace(new RegExp("[^0-9\\-" + u + ".]", "g"), "");
      l.groupSep && (g = g.split(l.groupSep).join("")), l.decimalSep !== "." && (g = g.replace(l.decimalSep, "."));
      const m = parseFloat(g);
      isNaN(m) ? (e.value = "", a._hidden.value = "") : a.value = m;
    }, e.addEventListener("paste", this._onPaste);
    const f = e.value;
    if (f !== "") {
      const c = parseFloat(f);
      isNaN(c) || (this._displayFormatted(c), r.set.call(o, String(c)));
    }
    return this;
  }
  i.prototype._handleInput = function() {
    const e = this.dom, o = d(ct(e)), a = e.value;
    if (a === "") {
      this._hidden.value = "", A(e, "ln-number:input", { value: NaN, formatted: "" });
      return;
    }
    if (a === "-") {
      this._hidden.value = "";
      return;
    }
    const f = e.selectionStart;
    let c = 0;
    for (let k = 0; k < f; k++)
      /[0-9]/.test(a[k]) && c++;
    let y = a;
    if (o.groupSep && (y = y.split(o.groupSep).join("")), y = y.replace(o.decimalSep, "."), a.endsWith(o.decimalSep) || a.endsWith(".")) {
      const k = y.replace(/\.$/, ""), x = parseFloat(k);
      isNaN(x) || this._setHiddenRaw(x);
      return;
    }
    const l = y.indexOf(".");
    if (l !== -1 && y.slice(l + 1).endsWith("0")) {
      const k = parseFloat(y);
      isNaN(k) || this._setHiddenRaw(k);
      return;
    }
    const u = e.getAttribute("data-ln-number-decimals");
    if (u !== null && l !== -1) {
      const k = parseInt(u, 10);
      y.slice(l + 1).length > k && (y = y.slice(0, l + 1 + k));
    }
    const g = parseFloat(y);
    if (isNaN(g)) return;
    const m = e.getAttribute("data-ln-number-min"), v = e.getAttribute("data-ln-number-max");
    if (m !== null && g < parseFloat(m) || v !== null && g > parseFloat(v)) return;
    let b;
    if (u !== null)
      b = h(ct(e), g, u);
    else {
      const k = l !== -1 ? y.slice(l + 1).length : 0;
      if (k > 0) {
        const x = ct(e) + "|u" + k;
        s[x] || (s[x] = new Intl.NumberFormat(ct(e), { useGrouping: !0, minimumFractionDigits: k, maximumFractionDigits: k })), b = s[x].format(g);
      } else
        b = o.fmt.format(g);
    }
    e.value = b;
    let E = c, _ = 0;
    for (let k = 0; k < b.length && E > 0; k++)
      _ = k + 1, /[0-9]/.test(b[k]) && E--;
    E > 0 && (_ = b.length), e.setSelectionRange(_, _), this._setHiddenRaw(g), A(e, "ln-number:input", { value: g, formatted: b });
  }, i.prototype._setHiddenRaw = function(e) {
    r.set.call(this._hidden, String(e));
  }, i.prototype._displayFormatted = function(e) {
    this.dom.value = h(ct(this.dom), e, this.dom.getAttribute("data-ln-number-decimals"));
  }, Object.defineProperty(i.prototype, "value", {
    get: function() {
      const e = this._hidden.value;
      return e === "" ? NaN : parseFloat(e);
    },
    set: function(e) {
      if (typeof e != "number" || isNaN(e)) {
        this.dom.value = "", this._setHiddenRaw("");
        return;
      }
      this._displayFormatted(e), this._setHiddenRaw(e), A(this.dom, "ln-number:input", {
        value: e,
        formatted: this.dom.value
      });
    }
  }), Object.defineProperty(i.prototype, "formatted", {
    get: function() {
      return this.dom.value;
    }
  }), i.prototype.destroy = function() {
    this.dom[t] && (this.dom.removeEventListener("input", this._onInput), this.dom.removeEventListener("paste", this._onPaste), this.dom.name = this._hidden.name, this.dom.type = "number", this.dom.removeAttribute("inputmode"), this._hidden.remove(), A(this.dom, "ln-number:destroyed", { target: this.dom }), delete this.dom[t]);
  };
  function n() {
    new MutationObserver(function() {
      const e = document.querySelectorAll("[" + p + "]");
      for (let o = 0; o < e.length; o++) {
        const a = e[o][t];
        a && !isNaN(a.value) && a._displayFormatted(a.value);
      }
    }).observe(document.documentElement, { attributes: !0, attributeFilter: ["lang"] });
  }
  H(p, t, i, "ln-number"), n();
})();
(function() {
  const p = "data-ln-date", t = "lnDate";
  if (window[t] !== void 0) return;
  const s = {}, r = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  function d(l, u) {
    const g = l + "|" + JSON.stringify(u);
    return s[g] || (s[g] = new Intl.DateTimeFormat(l, u)), s[g];
  }
  const h = /^(short|medium|long)(\s+datetime)?$/, i = {
    short: { dateStyle: "short" },
    medium: { dateStyle: "medium" },
    long: { dateStyle: "long" },
    "short datetime": { dateStyle: "short", timeStyle: "short" },
    "medium datetime": { dateStyle: "medium", timeStyle: "short" },
    "long datetime": { dateStyle: "long", timeStyle: "short" }
  };
  function n(l) {
    return !l || l === "" ? { dateStyle: "medium" } : l.match(h) ? i[l] : null;
  }
  function e(l, u, g) {
    const m = l.getDate(), v = l.getMonth(), b = l.getFullYear(), E = l.getHours(), _ = l.getMinutes(), k = {
      yyyy: String(b),
      yy: String(b).slice(-2),
      MMMM: d(g, { month: "long" }).format(l),
      MMM: d(g, { month: "short" }).format(l),
      MM: String(v + 1).padStart(2, "0"),
      M: String(v + 1),
      dd: String(m).padStart(2, "0"),
      d: String(m),
      HH: String(E).padStart(2, "0"),
      mm: String(_).padStart(2, "0")
    };
    return u.replace(/yyyy|yy|MMMM|MMM|MM|M|dd|d|HH|mm/g, function(x) {
      return k[x];
    });
  }
  function o(l, u, g) {
    const m = n(u);
    return m ? d(g, m).format(l) : e(l, u, g);
  }
  function a(l) {
    if (l.tagName !== "INPUT")
      return console.warn("[ln-date] Can only be applied to <input>, got:", l.tagName), this;
    this.dom = l;
    const u = this, g = l.value, m = l.name, v = document.createElement("input");
    v.type = "hidden", v.name = m, l.removeAttribute("name"), l.insertAdjacentElement("afterend", v), this._hidden = v;
    const b = document.createElement("input");
    b.type = "date", b.tabIndex = -1, b.style.cssText = "position:absolute;opacity:0;width:0;height:0;overflow:hidden;pointer-events:none", v.insertAdjacentElement("afterend", b), this._picker = b, l.type = "text";
    const E = document.createElement("button");
    if (E.type = "button", E.setAttribute("aria-label", "Open date picker"), E.innerHTML = '<svg class="ln-icon" aria-hidden="true"><use href="#ln-calendar"></use></svg>', b.insertAdjacentElement("afterend", E), this._btn = E, this._lastISO = "", Object.defineProperty(v, "value", {
      get: function() {
        return r.get.call(v);
      },
      set: function(_) {
        if (r.set.call(v, _), _ && _ !== "") {
          const k = f(_);
          k && (u._displayFormatted(k), r.set.call(b, _));
        } else _ === "" && (u.dom.value = "", r.set.call(b, ""));
      }
    }), this._onPickerChange = function() {
      const _ = b.value;
      if (_) {
        const k = f(_);
        k && (u._setHiddenRaw(_), u._displayFormatted(k), u._lastISO = _, A(u.dom, "ln-date:change", {
          value: _,
          formatted: u.dom.value,
          date: k
        }));
      } else
        u._setHiddenRaw(""), u.dom.value = "", u._lastISO = "", A(u.dom, "ln-date:change", {
          value: "",
          formatted: "",
          date: null
        });
    }, b.addEventListener("change", this._onPickerChange), this._onBlur = function() {
      const _ = u.dom.value.trim();
      if (_ === "") {
        u._lastISO !== "" && (u._setHiddenRaw(""), r.set.call(u._picker, ""), u.dom.value = "", u._lastISO = "", A(u.dom, "ln-date:change", {
          value: "",
          formatted: "",
          date: null
        }));
        return;
      }
      if (u._lastISO) {
        const x = f(u._lastISO);
        if (x) {
          const q = u.dom.getAttribute(p) || "", I = ct(u.dom), T = o(x, q, I);
          if (_ === T) return;
        }
      }
      const k = c(_);
      if (k) {
        const x = k.getFullYear(), q = String(k.getMonth() + 1).padStart(2, "0"), I = String(k.getDate()).padStart(2, "0"), T = x + "-" + q + "-" + I;
        u._setHiddenRaw(T), r.set.call(u._picker, T), u._displayFormatted(k), u._lastISO = T, A(u.dom, "ln-date:change", {
          value: T,
          formatted: u.dom.value,
          date: k
        });
      } else if (u._lastISO) {
        const x = f(u._lastISO);
        x && u._displayFormatted(x);
      } else
        u.dom.value = "";
    }, l.addEventListener("blur", this._onBlur), this._onBtnClick = function() {
      u._openPicker();
    }, E.addEventListener("click", this._onBtnClick), g && g !== "") {
      const _ = f(g);
      _ && (this._setHiddenRaw(g), r.set.call(b, g), this._displayFormatted(_), this._lastISO = g);
    }
    return this;
  }
  function f(l) {
    if (!l || typeof l != "string") return null;
    const u = l.split("T"), g = u[0].split("-");
    if (g.length < 3) return null;
    const m = parseInt(g[0], 10), v = parseInt(g[1], 10) - 1, b = parseInt(g[2], 10);
    if (isNaN(m) || isNaN(v) || isNaN(b)) return null;
    let E = 0, _ = 0;
    if (u[1]) {
      const x = u[1].split(":");
      E = parseInt(x[0], 10) || 0, _ = parseInt(x[1], 10) || 0;
    }
    const k = new Date(m, v, b, E, _);
    return k.getFullYear() !== m || k.getMonth() !== v || k.getDate() !== b ? null : k;
  }
  function c(l) {
    if (!l || typeof l != "string" || (l = l.trim(), l.length < 6)) return null;
    let u, g;
    if (l.indexOf(".") !== -1)
      u = ".", g = l.split(".");
    else if (l.indexOf("/") !== -1)
      u = "/", g = l.split("/");
    else if (l.indexOf("-") !== -1)
      u = "-", g = l.split("-");
    else
      return null;
    if (g.length !== 3) return null;
    const m = [];
    for (let k = 0; k < 3; k++) {
      const x = parseInt(g[k], 10);
      if (isNaN(x)) return null;
      m.push(x);
    }
    let v, b, E;
    u === "." ? (v = m[0], b = m[1], E = m[2]) : u === "/" ? (b = m[0], v = m[1], E = m[2]) : g[0].length === 4 ? (E = m[0], b = m[1], v = m[2]) : (v = m[0], b = m[1], E = m[2]), E < 100 && (E += E < 50 ? 2e3 : 1900);
    const _ = new Date(E, b - 1, v);
    return _.getFullYear() !== E || _.getMonth() !== b - 1 || _.getDate() !== v ? null : _;
  }
  a.prototype._openPicker = function() {
    if (typeof this._picker.showPicker == "function")
      try {
        this._picker.showPicker();
      } catch {
        this._picker.click();
      }
    else
      this._picker.click();
  }, a.prototype._setHiddenRaw = function(l) {
    r.set.call(this._hidden, l);
  }, a.prototype._displayFormatted = function(l) {
    const u = this.dom.getAttribute(p) || "", g = ct(this.dom);
    this.dom.value = o(l, u, g);
  }, Object.defineProperty(a.prototype, "value", {
    get: function() {
      return r.get.call(this._hidden);
    },
    set: function(l) {
      if (!l || l === "") {
        this._setHiddenRaw(""), r.set.call(this._picker, ""), this.dom.value = "", this._lastISO = "";
        return;
      }
      const u = f(l);
      u && (this._setHiddenRaw(l), r.set.call(this._picker, l), this._displayFormatted(u), this._lastISO = l, A(this.dom, "ln-date:change", {
        value: l,
        formatted: this.dom.value,
        date: u
      }));
    }
  }), Object.defineProperty(a.prototype, "date", {
    get: function() {
      const l = this.value;
      return l ? f(l) : null;
    },
    set: function(l) {
      if (!l || !(l instanceof Date) || isNaN(l.getTime())) {
        this.value = "";
        return;
      }
      const u = l.getFullYear(), g = String(l.getMonth() + 1).padStart(2, "0"), m = String(l.getDate()).padStart(2, "0");
      this.value = u + "-" + g + "-" + m;
    }
  }), Object.defineProperty(a.prototype, "formatted", {
    get: function() {
      return this.dom.value;
    }
  }), a.prototype.destroy = function() {
    if (!this.dom[t]) return;
    this._picker.removeEventListener("change", this._onPickerChange), this.dom.removeEventListener("blur", this._onBlur), this._btn.removeEventListener("click", this._onBtnClick), this.dom.name = this._hidden.name, this.dom.type = "date";
    const l = this.value;
    this._hidden.remove(), this._picker.remove(), this._btn.remove(), l && (this.dom.value = l), A(this.dom, "ln-date:destroyed", { target: this.dom }), delete this.dom[t];
  };
  function y() {
    new MutationObserver(function() {
      const l = document.querySelectorAll("[" + p + "]");
      for (let u = 0; u < l.length; u++) {
        const g = l[u][t];
        if (g && g.value) {
          const m = f(g.value);
          m && g._displayFormatted(m);
        }
      }
    }).observe(document.documentElement, { attributes: !0, attributeFilter: ["lang"] });
  }
  H(p, t, a, "ln-date"), y();
})();
(function() {
  const p = "data-ln-nav", t = "lnNav";
  if (window[t] !== void 0) return;
  const s = /* @__PURE__ */ new WeakMap(), r = [];
  if (!history._lnNavPatched) {
    const a = history.pushState;
    history.pushState = function() {
      a.apply(history, arguments);
      for (const f of r)
        f();
    }, history._lnNavPatched = !0;
  }
  function d(a) {
    if (!a.hasAttribute(p) || s.has(a)) return;
    const f = a.getAttribute(p);
    if (!f) return;
    const c = h(a, f);
    s.set(a, c), a[t] = c;
  }
  function h(a, f) {
    let c = Array.from(a.querySelectorAll("a"));
    n(c, f, window.location.pathname);
    const y = function() {
      c = Array.from(a.querySelectorAll("a")), n(c, f, window.location.pathname);
    };
    window.addEventListener("popstate", y), r.push(y);
    const l = new MutationObserver(function(u) {
      for (const g of u)
        if (g.type === "childList") {
          for (const m of g.addedNodes)
            if (m.nodeType === 1) {
              if (m.tagName === "A")
                c.push(m), n([m], f, window.location.pathname);
              else if (m.querySelectorAll) {
                const v = Array.from(m.querySelectorAll("a"));
                c = c.concat(v), n(v, f, window.location.pathname);
              }
            }
          for (const m of g.removedNodes)
            if (m.nodeType === 1) {
              if (m.tagName === "A")
                c = c.filter(function(v) {
                  return v !== m;
                });
              else if (m.querySelectorAll) {
                const v = Array.from(m.querySelectorAll("a"));
                c = c.filter(function(b) {
                  return !v.includes(b);
                });
              }
            }
        }
    });
    return l.observe(a, { childList: !0, subtree: !0 }), {
      navElement: a,
      activeClass: f,
      observer: l,
      updateHandler: y,
      destroy: function() {
        l.disconnect(), window.removeEventListener("popstate", y);
        const u = r.indexOf(y);
        u !== -1 && r.splice(u, 1), s.delete(a), delete a[t];
      }
    };
  }
  function i(a) {
    try {
      return new URL(a, window.location.href).pathname.replace(/\/$/, "") || "/";
    } catch {
      return a.replace(/\/$/, "") || "/";
    }
  }
  function n(a, f, c) {
    const y = i(c);
    for (const l of a) {
      const u = l.getAttribute("href");
      if (!u) continue;
      const g = i(u);
      l.classList.remove(f);
      const m = g === y, v = g !== "/" && y.startsWith(g + "/");
      (m || v) && l.classList.add(f);
    }
  }
  function e() {
    nt(function() {
      new MutationObserver(function(a) {
        for (const f of a)
          if (f.type === "childList") {
            for (const c of f.addedNodes)
              if (c.nodeType === 1 && (c.hasAttribute && c.hasAttribute(p) && d(c), c.querySelectorAll))
                for (const y of c.querySelectorAll("[" + p + "]"))
                  d(y);
          } else f.type === "attributes" && f.target.hasAttribute && f.target.hasAttribute(p) && d(f.target);
      }).observe(document.body, { childList: !0, subtree: !0, attributes: !0, attributeFilter: [p] });
    }, "ln-nav");
  }
  window[t] = d;
  function o() {
    for (const a of document.querySelectorAll("[" + p + "]"))
      d(a);
  }
  e(), document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", o) : o();
})();
(function() {
  const p = "data-ln-tabs", t = "lnTabs";
  if (window[t] !== void 0 && window[t] !== null) return;
  function s() {
    const i = (location.hash || "").replace("#", ""), n = {};
    if (!i) return n;
    for (const e of i.split("&")) {
      const o = e.indexOf(":");
      o > 0 && (n[e.slice(0, o)] = e.slice(o + 1));
    }
    return n;
  }
  function r(i, n) {
    const e = (i.getAttribute("data-ln-tab") || "").toLowerCase().trim();
    if (e) return e;
    if (i.tagName !== "A") return "";
    const o = i.getAttribute("href") || "";
    if (!o.startsWith("#")) return "";
    const a = o.slice(1);
    if (!a) return "";
    const f = a.split("&");
    if (n)
      for (const l of f) {
        const u = l.indexOf(":");
        if (u > 0 && l.slice(0, u).toLowerCase().trim() === n)
          return l.slice(u + 1).toLowerCase().trim();
      }
    const c = f[f.length - 1] || "", y = c.indexOf(":");
    return (y > 0 ? c.slice(y + 1) : c).toLowerCase().trim();
  }
  function d(i) {
    return this.dom = i, h.call(this), this;
  }
  function h() {
    this.tabs = Array.from(this.dom.querySelectorAll("[data-ln-tab]")), this.panels = Array.from(this.dom.querySelectorAll("[data-ln-panel]")), this.nsKey = (this.dom.getAttribute("data-ln-tabs-key") || this.dom.id || "").toLowerCase().trim(), this.hashEnabled = !!this.nsKey, this.mapTabs = {}, this.mapPanels = {};
    for (const n of this.tabs) {
      const e = r(n, this.nsKey);
      e ? this.mapTabs[e] = n : console.warn('[ln-tabs] Trigger has no resolvable key — needs `data-ln-tab="key"` or `<a href="#…">`.', n);
    }
    for (const n of this.panels) {
      const e = (n.getAttribute("data-ln-panel") || "").toLowerCase().trim();
      e && (this.mapPanels[e] = n);
    }
    this.defaultKey = (this.dom.getAttribute("data-ln-tabs-default") || "").toLowerCase().trim() || Object.keys(this.mapTabs)[0] || "", this.autoFocus = (this.dom.getAttribute("data-ln-tabs-focus") || "true").toLowerCase() !== "false";
    const i = this;
    this._clickHandlers = [];
    for (const n of this.tabs) {
      if (n[t + "Trigger"]) continue;
      const e = function(o) {
        if (o.ctrlKey || o.metaKey || o.button === 1) return;
        const a = r(n, i.nsKey);
        if (a)
          if (n.tagName === "A" && o.preventDefault(), i.hashEnabled) {
            const f = s();
            f[i.nsKey] = a;
            const c = Object.keys(f).map(function(y) {
              return y + ":" + f[y];
            }).join("&");
            location.hash === "#" + c ? i.dom.setAttribute("data-ln-tabs-active", a) : location.hash = c;
          } else
            i.dom.setAttribute("data-ln-tabs-active", a);
      };
      n.addEventListener("click", e), n[t + "Trigger"] = e, i._clickHandlers.push({ el: n, handler: e });
    }
    if (this._hashHandler = function() {
      if (!i.hashEnabled) return;
      const n = s();
      i.dom.setAttribute("data-ln-tabs-active", i.nsKey in n ? n[i.nsKey] : i.defaultKey);
    }, this.hashEnabled)
      window.addEventListener("hashchange", this._hashHandler), this._hashHandler();
    else {
      let n = this.defaultKey;
      if (this.dom.hasAttribute("data-ln-persist") && !this.hashEnabled) {
        const e = jt("tabs", this.dom);
        e !== null && e in this.mapPanels && (n = e);
      }
      this.dom.setAttribute("data-ln-tabs-active", n);
    }
  }
  d.prototype._applyActive = function(i) {
    var n;
    (!i || !(i in this.mapPanels)) && (i = this.defaultKey);
    for (const e in this.mapTabs) {
      const o = this.mapTabs[e];
      e === i ? (o.setAttribute("data-active", ""), o.setAttribute("aria-selected", "true")) : (o.removeAttribute("data-active"), o.setAttribute("aria-selected", "false"));
    }
    for (const e in this.mapPanels) {
      const o = this.mapPanels[e], a = e === i;
      o.classList.toggle("hidden", !a), o.setAttribute("aria-hidden", a ? "false" : "true");
    }
    if (this.autoFocus) {
      const e = (n = this.mapPanels[i]) == null ? void 0 : n.querySelector('input,button,select,textarea,[tabindex]:not([tabindex="-1"])');
      e && setTimeout(() => e.focus({ preventScroll: !0 }), 0);
    }
    A(this.dom, "ln-tabs:change", { key: i, tab: this.mapTabs[i], panel: this.mapPanels[i] }), this.dom.hasAttribute("data-ln-persist") && !this.hashEnabled && gt("tabs", this.dom, i);
  }, d.prototype.destroy = function() {
    if (this.dom[t]) {
      for (const { el: i, handler: n } of this._clickHandlers)
        i.removeEventListener("click", n), delete i[t + "Trigger"];
      this.hashEnabled && window.removeEventListener("hashchange", this._hashHandler), A(this.dom, "ln-tabs:destroyed", { target: this.dom }), delete this.dom[t];
    }
  }, H(p, t, d, "ln-tabs", {
    extraAttributes: ["data-ln-tabs-active"],
    onAttributeChange: function(i) {
      const n = i.getAttribute("data-ln-tabs-active");
      i[t]._applyActive(n);
    }
  });
})();
(function() {
  const p = "data-ln-toggle", t = "lnToggle";
  if (window[t] !== void 0) return;
  function s(i) {
    const n = Array.from(i.querySelectorAll("[data-ln-toggle-for]"));
    i.hasAttribute && i.hasAttribute("data-ln-toggle-for") && n.push(i);
    for (const e of n) {
      if (e[t + "Trigger"]) continue;
      const o = function(c) {
        if (c.ctrlKey || c.metaKey || c.button === 1) return;
        c.preventDefault();
        const y = e.getAttribute("data-ln-toggle-for"), l = document.getElementById(y);
        if (!l || !l[t]) return;
        const u = e.getAttribute("data-ln-toggle-action") || "toggle";
        if (u === "open")
          l.setAttribute(p, "open");
        else if (u === "close")
          l.setAttribute(p, "close");
        else if (u === "toggle") {
          const g = l.getAttribute(p);
          l.setAttribute(p, g === "open" ? "close" : "open");
        }
      };
      e.addEventListener("click", o), e[t + "Trigger"] = o;
      const a = e.getAttribute("data-ln-toggle-for"), f = document.getElementById(a);
      f && f[t] && e.setAttribute("aria-expanded", f[t].isOpen ? "true" : "false");
    }
  }
  function r(i, n) {
    const e = document.querySelectorAll(
      '[data-ln-toggle-for="' + i.id + '"]'
    );
    for (const o of e)
      o.setAttribute("aria-expanded", n ? "true" : "false");
  }
  function d(i) {
    if (this.dom = i, i.hasAttribute("data-ln-persist")) {
      const n = jt("toggle", i);
      n !== null && i.setAttribute(p, n);
    }
    return this.isOpen = i.getAttribute(p) === "open", this.isOpen && i.classList.add("open"), r(i, this.isOpen), this;
  }
  d.prototype.destroy = function() {
    if (!this.dom[t]) return;
    A(this.dom, "ln-toggle:destroyed", { target: this.dom });
    const i = document.querySelectorAll('[data-ln-toggle-for="' + this.dom.id + '"]');
    for (const n of i)
      n[t + "Trigger"] && (n.removeEventListener("click", n[t + "Trigger"]), delete n[t + "Trigger"]);
    delete this.dom[t];
  };
  function h(i) {
    const n = i[t];
    if (!n) return;
    const e = i.getAttribute(p) === "open";
    if (e !== n.isOpen)
      if (e) {
        if (Z(i, "ln-toggle:before-open", { target: i }).defaultPrevented) {
          i.setAttribute(p, "close");
          return;
        }
        n.isOpen = !0, i.classList.add("open"), r(i, !0), A(i, "ln-toggle:open", { target: i }), i.hasAttribute("data-ln-persist") && gt("toggle", i, "open");
      } else {
        if (Z(i, "ln-toggle:before-close", { target: i }).defaultPrevented) {
          i.setAttribute(p, "open");
          return;
        }
        n.isOpen = !1, i.classList.remove("open"), r(i, !1), A(i, "ln-toggle:close", { target: i }), i.hasAttribute("data-ln-persist") && gt("toggle", i, "close");
      }
  }
  H(p, t, d, "ln-toggle", {
    extraAttributes: ["data-ln-toggle-for"],
    onAttributeChange: h,
    onInit: s
  });
})();
(function() {
  const p = "data-ln-accordion", t = "lnAccordion";
  if (window[t] !== void 0) return;
  function s(r) {
    return this.dom = r, this._onToggleOpen = function(d) {
      if (d.detail.target.closest("[data-ln-accordion]") !== r) return;
      const h = r.querySelectorAll("[data-ln-toggle]");
      for (const i of h)
        i !== d.detail.target && i.closest("[data-ln-accordion]") === r && i.getAttribute("data-ln-toggle") === "open" && i.setAttribute("data-ln-toggle", "close");
      A(r, "ln-accordion:change", { target: d.detail.target });
    }, r.addEventListener("ln-toggle:open", this._onToggleOpen), this;
  }
  s.prototype.destroy = function() {
    this.dom[t] && (this.dom.removeEventListener("ln-toggle:open", this._onToggleOpen), A(this.dom, "ln-accordion:destroyed", { target: this.dom }), delete this.dom[t]);
  }, H(p, t, s, "ln-accordion");
})();
(function() {
  const p = "data-ln-dropdown", t = "lnDropdown";
  if (window[t] !== void 0) return;
  function s(r) {
    if (this.dom = r, this.toggleEl = r.querySelector("[data-ln-toggle]"), this._teleportRestore = null, this._boundDocClick = null, this._docClickTimeout = null, this._boundScrollReposition = null, this._boundResizeClose = null, this.toggleEl && (this.toggleEl.setAttribute("data-ln-dropdown-menu", ""), this.toggleEl.setAttribute("role", "menu")), this.triggerBtn = r.querySelector("[data-ln-toggle-for]"), this.triggerBtn && (this.triggerBtn.setAttribute("aria-haspopup", "menu"), this.triggerBtn.setAttribute("aria-expanded", "false")), this.toggleEl)
      for (const h of this.toggleEl.children)
        h.setAttribute("role", "menuitem");
    const d = this;
    return this._onToggleOpen = function(h) {
      h.detail.target === d.toggleEl && (d.triggerBtn && d.triggerBtn.setAttribute("aria-expanded", "true"), d._teleportRestore = we(d.toggleEl), d.toggleEl.style.position = "fixed", d.toggleEl.style.right = "auto", d._reposition(), d._addOutsideClickListener(), d._addScrollRepositionListener(), d._addResizeCloseListener(), A(r, "ln-dropdown:open", { target: h.detail.target }));
    }, this._onToggleClose = function(h) {
      h.detail.target === d.toggleEl && (d.triggerBtn && d.triggerBtn.setAttribute("aria-expanded", "false"), d._removeOutsideClickListener(), d._removeScrollRepositionListener(), d._removeResizeCloseListener(), d.toggleEl.style.position = "", d.toggleEl.style.top = "", d.toggleEl.style.left = "", d.toggleEl.style.right = "", d.toggleEl.style.transform = "", d.toggleEl.style.margin = "", d._teleportRestore && (d._teleportRestore(), d._teleportRestore = null), A(r, "ln-dropdown:close", { target: h.detail.target }));
    }, this.toggleEl && (this.toggleEl.addEventListener("ln-toggle:open", this._onToggleOpen), this.toggleEl.addEventListener("ln-toggle:close", this._onToggleClose)), this;
  }
  s.prototype._reposition = function() {
    if (!this.triggerBtn || !this.toggleEl) return;
    const r = this.triggerBtn.getBoundingClientRect(), d = Yt(this.toggleEl), h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--size-xs")) * 16 || 4, i = Bt(r, d, "bottom-end", h);
    this.toggleEl.style.top = i.top + "px", this.toggleEl.style.left = i.left + "px";
  }, s.prototype._addOutsideClickListener = function() {
    if (this._boundDocClick) return;
    const r = this;
    this._boundDocClick = function(d) {
      r.dom.contains(d.target) || r.toggleEl && r.toggleEl.contains(d.target) || r.toggleEl && r.toggleEl.getAttribute("data-ln-toggle") === "open" && r.toggleEl.setAttribute("data-ln-toggle", "close");
    }, r._docClickTimeout = setTimeout(function() {
      r._docClickTimeout = null, document.addEventListener("click", r._boundDocClick);
    }, 0);
  }, s.prototype._removeOutsideClickListener = function() {
    this._docClickTimeout && (clearTimeout(this._docClickTimeout), this._docClickTimeout = null), this._boundDocClick && (document.removeEventListener("click", this._boundDocClick), this._boundDocClick = null);
  }, s.prototype._addScrollRepositionListener = function() {
    const r = this;
    this._boundScrollReposition = function() {
      r._reposition();
    }, window.addEventListener("scroll", this._boundScrollReposition, { passive: !0, capture: !0 });
  }, s.prototype._removeScrollRepositionListener = function() {
    this._boundScrollReposition && (window.removeEventListener("scroll", this._boundScrollReposition, { capture: !0 }), this._boundScrollReposition = null);
  }, s.prototype._addResizeCloseListener = function() {
    const r = this;
    this._boundResizeClose = function() {
      r.toggleEl && r.toggleEl.getAttribute("data-ln-toggle") === "open" && r.toggleEl.setAttribute("data-ln-toggle", "close");
    }, window.addEventListener("resize", this._boundResizeClose);
  }, s.prototype._removeResizeCloseListener = function() {
    this._boundResizeClose && (window.removeEventListener("resize", this._boundResizeClose), this._boundResizeClose = null);
  }, s.prototype.destroy = function() {
    this.dom[t] && (this._removeOutsideClickListener(), this._removeScrollRepositionListener(), this._removeResizeCloseListener(), this._teleportRestore && (this._teleportRestore(), this._teleportRestore = null), this.toggleEl && (this.toggleEl.removeEventListener("ln-toggle:open", this._onToggleOpen), this.toggleEl.removeEventListener("ln-toggle:close", this._onToggleClose)), A(this.dom, "ln-dropdown:destroyed", { target: this.dom }), delete this.dom[t]);
  }, H(p, t, s, "ln-dropdown");
})();
(function() {
  const p = "data-ln-popover", t = "lnPopover", s = "data-ln-popover-for", r = "data-ln-popover-position";
  if (window[t] !== void 0) return;
  const d = [];
  let h = null;
  function i() {
    h || (h = function(a) {
      a.key !== "Escape" || d.length === 0 || d[d.length - 1].close();
    }, document.addEventListener("keydown", h));
  }
  function n() {
    d.length > 0 || h && (document.removeEventListener("keydown", h), h = null);
  }
  function e(a) {
    return this.dom = a, this.isOpen = a.getAttribute(p) === "open", this.trigger = null, this._teleportRestore = null, this._previousFocus = null, this._boundDocClick = null, this._docClickTimeout = null, this._boundReposition = null, a.hasAttribute("tabindex") || a.setAttribute("tabindex", "-1"), a.hasAttribute("role") || a.setAttribute("role", "dialog"), this.isOpen && this._applyOpen(null), this;
  }
  e.prototype.open = function(a) {
    this.isOpen || (this.trigger = a || null, this.dom.setAttribute(p, "open"));
  }, e.prototype.close = function() {
    this.isOpen && this.dom.setAttribute(p, "closed");
  }, e.prototype.toggle = function(a) {
    this.isOpen ? this.close() : this.open(a);
  }, e.prototype._applyOpen = function(a) {
    this.isOpen = !0, a && (this.trigger = a), this._previousFocus = document.activeElement, this._teleportRestore = we(this.dom);
    const f = Yt(this.dom);
    if (this.trigger) {
      const u = this.trigger.getBoundingClientRect(), g = this.dom.getAttribute(r) || "bottom", m = Bt(u, f, g, 8);
      this.dom.style.top = m.top + "px", this.dom.style.left = m.left + "px", this.dom.setAttribute("data-ln-popover-placement", m.placement), this.trigger.setAttribute("aria-expanded", "true");
    }
    const c = this.dom.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'), y = Array.prototype.find.call(c, Tt);
    y ? y.focus() : this.dom.focus();
    const l = this;
    this._boundDocClick = function(u) {
      l.dom.contains(u.target) || l.trigger && l.trigger.contains(u.target) || l.close();
    }, l._docClickTimeout = setTimeout(function() {
      l._docClickTimeout = null, document.addEventListener("click", l._boundDocClick);
    }, 0), this._boundReposition = function() {
      if (!l.trigger) return;
      const u = l.trigger.getBoundingClientRect(), g = Yt(l.dom), m = l.dom.getAttribute(r) || "bottom", v = Bt(u, g, m, 8);
      l.dom.style.top = v.top + "px", l.dom.style.left = v.left + "px", l.dom.setAttribute("data-ln-popover-placement", v.placement);
    }, window.addEventListener("scroll", this._boundReposition, { passive: !0, capture: !0 }), window.addEventListener("resize", this._boundReposition), d.push(this), i(), A(this.dom, "ln-popover:open", {
      popoverId: this.dom.id,
      target: this.dom,
      trigger: this.trigger
    });
  }, e.prototype._applyClose = function() {
    this.isOpen = !1, this._docClickTimeout && (clearTimeout(this._docClickTimeout), this._docClickTimeout = null), this._boundDocClick && (document.removeEventListener("click", this._boundDocClick), this._boundDocClick = null), this._boundReposition && (window.removeEventListener("scroll", this._boundReposition, { capture: !0 }), window.removeEventListener("resize", this._boundReposition), this._boundReposition = null), this.dom.style.top = "", this.dom.style.left = "", this.dom.removeAttribute("data-ln-popover-placement"), this.trigger && this.trigger.setAttribute("aria-expanded", "false"), this._teleportRestore && (this._teleportRestore(), this._teleportRestore = null);
    const a = d.indexOf(this);
    a !== -1 && d.splice(a, 1), n(), this._previousFocus && this.trigger && this._previousFocus === this.trigger ? this.trigger.focus() : this.trigger && document.activeElement === document.body && this.trigger.focus(), this._previousFocus = null, A(this.dom, "ln-popover:close", {
      popoverId: this.dom.id,
      target: this.dom,
      trigger: this.trigger
    }), this.trigger = null;
  }, e.prototype.destroy = function() {
    this.dom[t] && (this.isOpen && this._applyClose(), delete this.dom[t], A(this.dom, "ln-popover:destroyed", {
      popoverId: this.dom.id,
      target: this.dom
    }));
  };
  function o(a) {
    this.dom = a;
    const f = a.getAttribute(s);
    return a.setAttribute("aria-haspopup", "dialog"), a.setAttribute("aria-expanded", "false"), a.setAttribute("aria-controls", f), this._onClick = function(c) {
      if (c.ctrlKey || c.metaKey || c.button === 1) return;
      c.preventDefault();
      const y = document.getElementById(f);
      !y || !y[t] || y[t].toggle(a);
    }, a.addEventListener("click", this._onClick), this;
  }
  o.prototype.destroy = function() {
    this.dom.removeEventListener("click", this._onClick), delete this.dom[t + "Trigger"];
  }, H(p, t, e, "ln-popover", {
    onAttributeChange: function(a) {
      const f = a[t];
      if (!f) return;
      const c = a.getAttribute(p) === "open";
      if (c !== f.isOpen)
        if (c) {
          if (Z(a, "ln-popover:before-open", {
            popoverId: a.id,
            target: a,
            trigger: f.trigger
          }).defaultPrevented) {
            a.setAttribute(p, "closed");
            return;
          }
          f._applyOpen(f.trigger);
        } else {
          if (Z(a, "ln-popover:before-close", {
            popoverId: a.id,
            target: a,
            trigger: f.trigger
          }).defaultPrevented) {
            a.setAttribute(p, "open");
            return;
          }
          f._applyClose();
        }
    }
  }), H(s, t + "Trigger", o, "ln-popover-trigger");
})();
(function() {
  const p = "data-ln-tooltip-enhance", t = "data-ln-tooltip", s = "data-ln-tooltip-position", r = "lnTooltipEnhance", d = "ln-tooltip-portal";
  if (window[r] !== void 0) return;
  let h = 0, i = null, n = null, e = null, o = null, a = null;
  function f() {
    return i && i.parentNode || (i = document.getElementById(d), i || (i = document.createElement("div"), i.id = d, document.body.appendChild(i))), i;
  }
  function c() {
    a || (a = function(m) {
      m.key === "Escape" && u();
    }, document.addEventListener("keydown", a));
  }
  function y() {
    a && (document.removeEventListener("keydown", a), a = null);
  }
  function l(m) {
    if (e === m) return;
    u();
    const v = m.getAttribute(t) || m.getAttribute("title");
    if (!v) return;
    f(), m.hasAttribute("title") && (o = m.getAttribute("title"), m.removeAttribute("title"));
    const b = document.createElement("div");
    b.className = "ln-tooltip", b.textContent = v, m[r + "Uid"] || (h += 1, m[r + "Uid"] = "ln-tooltip-" + h), b.id = m[r + "Uid"], i.appendChild(b);
    const E = b.offsetWidth, _ = b.offsetHeight, k = m.getBoundingClientRect(), x = m.getAttribute(s) || "top", q = Bt(k, { width: E, height: _ }, x, 6);
    b.style.top = q.top + "px", b.style.left = q.left + "px", b.setAttribute("data-ln-tooltip-placement", q.placement), m.setAttribute("aria-describedby", b.id), n = b, e = m, c();
  }
  function u() {
    if (!n) {
      y();
      return;
    }
    e && (e.removeAttribute("aria-describedby"), o !== null && e.setAttribute("title", o)), o = null, n.parentNode && n.parentNode.removeChild(n), n = null, e = null, y();
  }
  function g(m) {
    return this.dom = m, m.hasAttribute("data-ln-tooltip-enhanced") || (m.setAttribute("data-ln-tooltip-enhanced", ""), this._addedEnhancedAttr = !0), this._onEnter = function() {
      l(m);
    }, this._onLeave = function() {
      e === m && u();
    }, this._onFocus = function() {
      l(m);
    }, this._onBlur = function() {
      e === m && u();
    }, m.addEventListener("mouseenter", this._onEnter), m.addEventListener("mouseleave", this._onLeave), m.addEventListener("focus", this._onFocus, !0), m.addEventListener("blur", this._onBlur, !0), this;
  }
  g.prototype.destroy = function() {
    const m = this.dom;
    m.removeEventListener("mouseenter", this._onEnter), m.removeEventListener("mouseleave", this._onLeave), m.removeEventListener("focus", this._onFocus, !0), m.removeEventListener("blur", this._onBlur, !0), e === m && u(), this._addedEnhancedAttr && m.removeAttribute("data-ln-tooltip-enhanced"), delete m[r], delete m[r + "Uid"], A(m, "ln-tooltip:destroyed", { trigger: m });
  }, H(
    "[" + p + "], [" + t + "][title]",
    r,
    g,
    "ln-tooltip"
  );
})();
const Ne = `<li class="ln-toast__item">\r
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
  const p = "data-ln-toast", t = "lnToast", s = "ln-toast-item", r = { success: "circle-check", error: "circle-x", warn: "alert-triangle", info: "info-circle" }, d = { success: "success", error: "error", warn: "warning", info: "info" }, h = { success: "Success", error: "Error", warn: "Warning", info: "Information" };
  if (window.__lnToastLoaded) return;
  window.__lnToastLoaded = !0;
  function i() {
    if (document.querySelector('[data-ln-template="ln-toast-item"]') || !document.body) return;
    const m = document.createElement("template");
    m.setAttribute("data-ln-template", "ln-toast-item"), m.innerHTML = Ne, document.body.appendChild(m);
  }
  function n(m) {
    if (!m || m.nodeType !== 1) return;
    const v = Array.from(m.querySelectorAll("[" + p + "]"));
    m.hasAttribute && m.hasAttribute(p) && v.push(m);
    for (const b of v)
      b[t] || new e(b);
  }
  function e(m) {
    this.dom = m, m[t] = this, this.timeoutDefault = parseInt(m.getAttribute("data-ln-toast-timeout") || "6000", 10), this.max = parseInt(m.getAttribute("data-ln-toast-max") || "5", 10);
    for (const v of Array.from(m.querySelectorAll("[data-ln-toast-item]")))
      l(v, m);
    return this;
  }
  e.prototype.destroy = function() {
    if (this.dom[t]) {
      for (const m of Array.from(this.dom.children))
        c(m);
      delete this.dom[t];
    }
  };
  function o(m, v) {
    const b = ((m.type || "info") + "").toLowerCase(), E = dt(v, s, "ln-toast");
    if (!E)
      return console.warn('[ln-toast] Template "' + s + '" not found'), null;
    const _ = E.firstElementChild;
    if (!_) return null;
    const k = !!(m.message || m.data && m.data.errors);
    ot(_, {
      title: m.title || h[b] || h.info,
      role: b === "error" ? "alert" : "status",
      ariaLive: b === "error" ? "assertive" : "polite",
      hasBody: k
    });
    const x = _.querySelector(".ln-toast__card");
    x && x.classList.add(d[b] || "info");
    const q = _.querySelector(".ln-toast__side");
    if (q) {
      const P = q.querySelector("use");
      P && P.setAttribute("href", "#ln-" + (r[b] || r.info));
    }
    const I = _.querySelector(".ln-toast__body");
    I && k && a(I, m);
    const T = _.querySelector(".ln-toast__close");
    return T && T.addEventListener("click", function() {
      c(_);
    }), _;
  }
  function a(m, v) {
    if (v.message)
      if (Array.isArray(v.message)) {
        const b = document.createElement("ul");
        for (const E of v.message) {
          const _ = document.createElement("li");
          _.textContent = E, b.appendChild(_);
        }
        m.appendChild(b);
      } else {
        const b = document.createElement("p");
        b.textContent = v.message, m.appendChild(b);
      }
    if (v.data && v.data.errors) {
      const b = document.createElement("ul");
      for (const E of Object.values(v.data.errors).flat()) {
        const _ = document.createElement("li");
        _.textContent = E, b.appendChild(_);
      }
      m.appendChild(b);
    }
  }
  function f(m, v) {
    for (; m.dom.children.length >= m.max; ) m.dom.removeChild(m.dom.firstElementChild);
    m.dom.appendChild(v), requestAnimationFrame(() => v.classList.add("ln-toast__item--in"));
  }
  function c(m) {
    !m || !m.parentNode || (clearTimeout(m._timer), m.classList.remove("ln-toast__item--in"), m.classList.add("ln-toast__item--out"), setTimeout(() => {
      m.parentNode && m.parentNode.removeChild(m);
    }, 200));
  }
  function y(m) {
    let v = m && m.container;
    return typeof v == "string" && (v = document.querySelector(v)), v instanceof HTMLElement || (v = document.querySelector("[" + p + "]") || document.getElementById("ln-toast-container")), v || null;
  }
  function l(m, v) {
    const b = ((m.getAttribute("data-type") || "info") + "").toLowerCase(), E = m.getAttribute("data-title"), _ = (m.innerText || m.textContent || "").trim(), k = o({
      type: b,
      title: E,
      message: _ || void 0
    }, v);
    k && (m.parentNode && m.parentNode.replaceChild(k, m), requestAnimationFrame(() => k.classList.add("ln-toast__item--in")));
  }
  function u(m) {
    const v = m.detail || {}, b = y(v);
    if (!b) {
      console.warn("[ln-toast] No toast container found");
      return;
    }
    const E = b[t] || new e(b), _ = o(v, b);
    if (!_) return;
    const k = Number.isFinite(v.timeout) ? v.timeout : E.timeoutDefault;
    f(E, _), k > 0 && (_._timer = setTimeout(() => c(_), k));
  }
  function g(m) {
    const v = m && m.detail || {};
    if (v.container) {
      const b = y(v);
      if (b)
        for (const E of Array.from(b.children)) c(E);
    } else {
      const b = document.querySelectorAll("[" + p + "]");
      for (const E of Array.from(b))
        for (const _ of Array.from(E.children)) c(_);
    }
  }
  nt(function() {
    i(), window.addEventListener("ln-toast:enqueue", u), window.addEventListener("ln-toast:clear", g), new MutationObserver(function(m) {
      for (const v of m) {
        if (v.type === "attributes") {
          n(v.target);
          continue;
        }
        for (const b of v.addedNodes)
          n(b);
      }
    }).observe(document.body, { childList: !0, subtree: !0, attributes: !0, attributeFilter: [p] }), n(document.body);
  }, "ln-toast");
})();
(function() {
  const p = "data-ln-upload", t = "lnUpload", s = "data-ln-upload-dict", r = "data-ln-upload-accept", d = "data-ln-upload-context", h = '<template data-ln-template="ln-upload-item"><li class="ln-upload__item" data-ln-class="ln-upload__item--uploading:uploading, ln-upload__item--error:error, ln-upload__item--deleting:deleting"><svg class="ln-icon" aria-hidden="true"><use data-ln-attr="href:iconHref" href="#ln-file"></use></svg><span class="ln-upload__name" data-ln-field="name"></span><span class="ln-upload__size" data-ln-field="sizeText"></span><button type="button" class="ln-upload__remove" data-ln-upload-action="remove" data-ln-attr="aria-label:removeLabel, title:removeLabel"><svg class="ln-icon" aria-hidden="true"><use href="#ln-x"></use></svg></button><div class="ln-upload__progress"><div class="ln-upload__progress-bar"></div></div></li></template>';
  function i() {
    if (document.querySelector('[data-ln-template="ln-upload-item"]') || !document.body) return;
    const l = document.createElement("div");
    l.innerHTML = h;
    const u = l.firstElementChild;
    u && document.body.appendChild(u);
  }
  if (window[t] !== void 0) return;
  function n(l) {
    if (l === 0) return "0 B";
    const u = 1024, g = ["B", "KB", "MB", "GB"], m = Math.floor(Math.log(l) / Math.log(u));
    return parseFloat((l / Math.pow(u, m)).toFixed(1)) + " " + g[m];
  }
  function e(l) {
    return l.split(".").pop().toLowerCase();
  }
  function o(l) {
    return l === "docx" && (l = "doc"), ["pdf", "doc", "epub"].includes(l) ? "lnc-file-" + l : "ln-file";
  }
  function a(l, u) {
    if (!u) return !0;
    const g = "." + e(l.name);
    return u.split(",").map(function(m) {
      return m.trim().toLowerCase();
    }).includes(g.toLowerCase());
  }
  function f(l) {
    if (l.hasAttribute("data-ln-upload-initialized")) return;
    l.setAttribute("data-ln-upload-initialized", "true"), i();
    const u = Te(l, s), g = l.querySelector(".ln-upload__zone"), m = l.querySelector(".ln-upload__list"), v = l.getAttribute(r) || "";
    if (!g || !m) {
      console.warn("[ln-upload] Missing .ln-upload__zone or .ln-upload__list in container:", l);
      return;
    }
    let b = l.querySelector('input[type="file"]');
    b || (b = document.createElement("input"), b.type = "file", b.multiple = !0, b.classList.add("hidden"), v && (b.accept = v.split(",").map(function(O) {
      return O = O.trim(), O.startsWith(".") ? O : "." + O;
    }).join(",")), l.appendChild(b));
    const E = l.getAttribute(p) || "/files/upload", _ = l.getAttribute(d) || "", k = /* @__PURE__ */ new Map();
    let x = 0;
    function q() {
      const O = document.querySelector('meta[name="csrf-token"]');
      return O ? O.getAttribute("content") : "";
    }
    function I(O) {
      if (!a(O, v)) {
        const C = u["invalid-type"];
        A(l, "ln-upload:invalid", {
          file: O,
          message: C
        }), A(window, "ln-toast:enqueue", {
          type: "error",
          title: u["invalid-title"] || "Invalid File",
          message: C || u["invalid-type"] || "This file type is not allowed"
        });
        return;
      }
      const j = "file-" + ++x, z = e(O.name), ft = o(z), bt = dt(l, "ln-upload-item", "ln-upload");
      if (!bt) return;
      const tt = bt.firstElementChild;
      if (!tt) return;
      tt.setAttribute("data-file-id", j), ot(tt, {
        name: O.name,
        sizeText: "0%",
        iconHref: "#" + ft,
        removeLabel: u.remove || "Remove",
        uploading: !0,
        error: !1,
        deleting: !1
      });
      const _t = tt.querySelector(".ln-upload__progress-bar"), it = tt.querySelector('[data-ln-upload-action="remove"]');
      it && (it.disabled = !0), m.appendChild(tt);
      const wt = new FormData();
      wt.append("file", O), wt.append("context", _);
      const w = new XMLHttpRequest();
      w.upload.addEventListener("progress", function(C) {
        if (C.lengthComputable) {
          const L = Math.round(C.loaded / C.total * 100);
          _t.style.width = L + "%", ot(tt, { sizeText: L + "%" });
        }
      }), w.addEventListener("load", function() {
        if (w.status >= 200 && w.status < 300) {
          let C;
          try {
            C = JSON.parse(w.responseText);
          } catch {
            S("Invalid response");
            return;
          }
          ot(tt, { sizeText: n(C.size || O.size), uploading: !1 }), it && (it.disabled = !1), k.set(j, {
            serverId: C.id,
            name: C.name,
            size: C.size
          }), T(), A(l, "ln-upload:uploaded", {
            localId: j,
            serverId: C.id,
            name: C.name
          });
        } else {
          let C = u["upload-failed"] || "Upload failed";
          try {
            C = JSON.parse(w.responseText).message || C;
          } catch {
          }
          S(C);
        }
      }), w.addEventListener("error", function() {
        S(u["network-error"] || "Network error");
      });
      function S(C) {
        _t && (_t.style.width = "100%"), ot(tt, { sizeText: u.error || "Error", uploading: !1, error: !0 }), it && (it.disabled = !1), A(l, "ln-upload:error", {
          file: O,
          message: C
        }), A(window, "ln-toast:enqueue", {
          type: "error",
          title: u["error-title"] || "Upload Error",
          message: C || u["upload-failed"] || "Failed to upload file"
        });
      }
      w.open("POST", E), w.setRequestHeader("X-CSRF-TOKEN", q()), w.setRequestHeader("Accept", "application/json"), w.send(wt);
    }
    function T() {
      for (const O of l.querySelectorAll('input[name="file_ids[]"]'))
        O.remove();
      for (const [, O] of k) {
        const j = document.createElement("input");
        j.type = "hidden", j.name = "file_ids[]", j.value = O.serverId, l.appendChild(j);
      }
    }
    function P(O) {
      const j = k.get(O), z = m.querySelector('[data-file-id="' + O + '"]');
      if (!j || !j.serverId) {
        z && z.remove(), k.delete(O), T();
        return;
      }
      z && ot(z, { deleting: !0 }), fetch("/files/" + j.serverId, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": q(),
          Accept: "application/json"
        }
      }).then(function(ft) {
        ft.status === 200 ? (z && z.remove(), k.delete(O), T(), A(l, "ln-upload:removed", {
          localId: O,
          serverId: j.serverId
        })) : (z && ot(z, { deleting: !1 }), A(window, "ln-toast:enqueue", {
          type: "error",
          title: u["delete-title"] || "Error",
          message: u["delete-error"] || "Failed to delete file"
        }));
      }).catch(function(ft) {
        console.warn("[ln-upload] Delete error:", ft), z && ot(z, { deleting: !1 }), A(window, "ln-toast:enqueue", {
          type: "error",
          title: u["network-error"] || "Network error",
          message: u["connection-error"] || "Could not connect to server"
        });
      });
    }
    function F(O) {
      for (const j of O)
        I(j);
      b.value = "";
    }
    const B = function() {
      b.click();
    }, R = function() {
      F(this.files);
    }, U = function(O) {
      O.preventDefault(), O.stopPropagation(), g.classList.add("ln-upload__zone--dragover");
    }, $ = function(O) {
      O.preventDefault(), O.stopPropagation(), g.classList.add("ln-upload__zone--dragover");
    }, rt = function(O) {
      O.preventDefault(), O.stopPropagation(), g.classList.remove("ln-upload__zone--dragover");
    }, Q = function(O) {
      O.preventDefault(), O.stopPropagation(), g.classList.remove("ln-upload__zone--dragover"), F(O.dataTransfer.files);
    }, st = function(O) {
      const j = O.target.closest('[data-ln-upload-action="remove"]');
      if (!j || !m.contains(j) || j.disabled) return;
      const z = j.closest(".ln-upload__item");
      z && P(z.getAttribute("data-file-id"));
    };
    g.addEventListener("click", B), b.addEventListener("change", R), g.addEventListener("dragenter", U), g.addEventListener("dragover", $), g.addEventListener("dragleave", rt), g.addEventListener("drop", Q), m.addEventListener("click", st), l.lnUploadAPI = {
      getFileIds: function() {
        return Array.from(k.values()).map(function(O) {
          return O.serverId;
        });
      },
      getFiles: function() {
        return Array.from(k.values());
      },
      clear: function() {
        for (const [, O] of k)
          O.serverId && fetch("/files/" + O.serverId, {
            method: "DELETE",
            headers: {
              "X-CSRF-TOKEN": q(),
              Accept: "application/json"
            }
          });
        k.clear(), m.innerHTML = "", T(), A(l, "ln-upload:cleared", {});
      },
      destroy: function() {
        g.removeEventListener("click", B), b.removeEventListener("change", R), g.removeEventListener("dragenter", U), g.removeEventListener("dragover", $), g.removeEventListener("dragleave", rt), g.removeEventListener("drop", Q), m.removeEventListener("click", st), k.clear(), m.innerHTML = "", T(), l.removeAttribute("data-ln-upload-initialized"), delete l.lnUploadAPI;
      }
    };
  }
  function c() {
    for (const l of document.querySelectorAll("[" + p + "]"))
      f(l);
  }
  function y() {
    nt(function() {
      new MutationObserver(function(l) {
        for (const u of l)
          if (u.type === "childList") {
            for (const g of u.addedNodes)
              if (g.nodeType === 1) {
                g.hasAttribute(p) && f(g);
                for (const m of g.querySelectorAll("[" + p + "]"))
                  f(m);
              }
          } else u.type === "attributes" && u.target.hasAttribute(p) && f(u.target);
      }).observe(document.body, {
        childList: !0,
        subtree: !0,
        attributes: !0,
        attributeFilter: [p]
      });
    }, "ln-upload");
  }
  window[t] = {
    init: f,
    initAll: c
  }, y(), document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", c) : c();
})();
(function() {
  const p = "lnExternalLinks";
  if (window[p] !== void 0) return;
  function t(n) {
    return n.hostname && n.hostname !== window.location.hostname;
  }
  function s(n) {
    if (n.getAttribute("data-ln-external-link") === "processed" || !t(n)) return;
    n.target = "_blank";
    const e = (n.rel || "").split(/\s+/).filter(Boolean);
    e.includes("noopener") || e.push("noopener"), e.includes("noreferrer") || e.push("noreferrer"), n.rel = e.join(" ");
    const o = document.createElement("span");
    o.className = "sr-only", o.textContent = "(opens in new tab)", n.appendChild(o), n.setAttribute("data-ln-external-link", "processed"), A(n, "ln-external-links:processed", {
      link: n,
      href: n.href
    });
  }
  function r(n) {
    n = n || document.body;
    for (const e of n.querySelectorAll("a, area"))
      s(e);
  }
  function d() {
    nt(function() {
      document.body.addEventListener("click", function(n) {
        const e = n.target.closest("a, area");
        e && e.getAttribute("data-ln-external-link") === "processed" && A(e, "ln-external-links:clicked", {
          link: e,
          href: e.href,
          text: e.textContent || e.title || ""
        });
      });
    }, "ln-external-links");
  }
  function h() {
    nt(function() {
      new MutationObserver(function(n) {
        for (const e of n) {
          if (e.type === "childList") {
            for (const o of e.addedNodes)
              if (o.nodeType === 1 && (o.matches && (o.matches("a") || o.matches("area")) && s(o), o.querySelectorAll))
                for (const a of o.querySelectorAll("a, area"))
                  s(a);
          }
          if (e.type === "attributes" && e.attributeName === "href") {
            const o = e.target;
            o.matches && (o.matches("a") || o.matches("area")) && s(o);
          }
        }
      }).observe(document.body, {
        childList: !0,
        subtree: !0,
        attributes: !0,
        attributeFilter: ["href"]
      });
    }, "ln-external-links");
  }
  function i() {
    d(), h(), document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
      r();
    }) : r();
  }
  window[p] = {
    process: r
  }, i();
})();
(function() {
  const p = "data-ln-link", t = "lnLink";
  if (window[t] !== void 0) return;
  let s = null;
  function r() {
    s = document.createElement("div"), s.className = "ln-link-status", document.body.appendChild(s);
  }
  function d(m) {
    s && (s.textContent = m, s.classList.add("ln-link-status--visible"));
  }
  function h() {
    s && s.classList.remove("ln-link-status--visible");
  }
  function i(m, v) {
    if (v.target.closest("a, button, input, select, textarea")) return;
    const b = m.querySelector("a");
    if (!b) return;
    const E = b.getAttribute("href");
    if (E) {
      if (v.ctrlKey || v.metaKey || v.button === 1) {
        window.open(E, "_blank");
        return;
      }
      Z(m, "ln-link:navigate", { target: m, href: E, link: b }).defaultPrevented || b.click();
    }
  }
  function n(m) {
    const v = m.querySelector("a");
    if (!v) return;
    const b = v.getAttribute("href");
    b && d(b);
  }
  function e() {
    h();
  }
  function o(m) {
    m[t + "Row"] || (m[t + "Row"] = !0, m.querySelector("a") && (m._lnLinkClick = function(v) {
      i(m, v);
    }, m._lnLinkEnter = function() {
      n(m);
    }, m.addEventListener("click", m._lnLinkClick), m.addEventListener("mouseenter", m._lnLinkEnter), m.addEventListener("mouseleave", e)));
  }
  function a(m) {
    m[t + "Row"] && (m._lnLinkClick && m.removeEventListener("click", m._lnLinkClick), m._lnLinkEnter && m.removeEventListener("mouseenter", m._lnLinkEnter), m.removeEventListener("mouseleave", e), delete m._lnLinkClick, delete m._lnLinkEnter, delete m[t + "Row"]);
  }
  function f(m) {
    if (!m[t + "Init"]) return;
    const v = m.tagName;
    if (v === "TABLE" || v === "TBODY") {
      const b = v === "TABLE" && m.querySelector("tbody") || m;
      for (const E of b.querySelectorAll("tr"))
        a(E);
    } else
      a(m);
    delete m[t + "Init"];
  }
  function c(m) {
    if (m[t + "Init"]) return;
    m[t + "Init"] = !0;
    const v = m.tagName;
    if (v === "TABLE" || v === "TBODY") {
      const b = v === "TABLE" && m.querySelector("tbody") || m;
      for (const E of b.querySelectorAll("tr"))
        o(E);
    } else
      o(m);
  }
  function y(m) {
    m.hasAttribute && m.hasAttribute(p) && c(m);
    const v = m.querySelectorAll ? m.querySelectorAll("[" + p + "]") : [];
    for (const b of v)
      c(b);
  }
  function l() {
    nt(function() {
      new MutationObserver(function(m) {
        for (const v of m)
          if (v.type === "childList")
            for (const b of v.addedNodes)
              b.nodeType === 1 && (y(b), b.tagName === "TR" && b.closest("[" + p + "]") && o(b));
          else v.type === "attributes" && y(v.target);
      }).observe(document.body, {
        childList: !0,
        subtree: !0,
        attributes: !0,
        attributeFilter: [p]
      });
    }, "ln-link");
  }
  function u(m) {
    y(m);
  }
  window[t] = { init: u, destroy: f };
  function g() {
    r(), l(), u(document.body);
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", g) : g();
})();
(function() {
  const p = "[data-ln-progress]", t = "lnProgress";
  if (window[t] !== void 0) return;
  function s(o) {
    r(o);
  }
  function r(o) {
    const a = Array.from(o.querySelectorAll(p));
    for (const f of a)
      f[t] || (f[t] = new d(f));
    o.hasAttribute && o.hasAttribute("data-ln-progress") && !o[t] && (o[t] = new d(o));
  }
  function d(o) {
    return this.dom = o, this._attrObserver = null, this._parentObserver = null, e.call(this), i.call(this), n.call(this), this;
  }
  d.prototype.destroy = function() {
    this.dom[t] && (this._attrObserver && this._attrObserver.disconnect(), this._parentObserver && this._parentObserver.disconnect(), delete this.dom[t]);
  };
  function h() {
    nt(function() {
      new MutationObserver(function(o) {
        for (const a of o)
          if (a.type === "childList")
            for (const f of a.addedNodes)
              f.nodeType === 1 && r(f);
          else a.type === "attributes" && r(a.target);
      }).observe(document.body, {
        childList: !0,
        subtree: !0,
        attributes: !0,
        attributeFilter: ["data-ln-progress"]
      });
    }, "ln-progress");
  }
  h();
  function i() {
    const o = this, a = new MutationObserver(function(f) {
      for (const c of f)
        (c.attributeName === "data-ln-progress" || c.attributeName === "data-ln-progress-max") && e.call(o);
    });
    a.observe(this.dom, {
      attributes: !0,
      attributeFilter: ["data-ln-progress", "data-ln-progress-max"]
    }), this._attrObserver = a;
  }
  function n() {
    const o = this, a = this.dom.parentElement;
    if (!a || !a.hasAttribute("data-ln-progress-max")) return;
    const f = new MutationObserver(function(c) {
      for (const y of c)
        y.attributeName === "data-ln-progress-max" && e.call(o);
    });
    f.observe(a, {
      attributes: !0,
      attributeFilter: ["data-ln-progress-max"]
    }), this._parentObserver = f;
  }
  function e() {
    const o = parseFloat(this.dom.getAttribute("data-ln-progress")) || 0, a = this.dom.parentElement, f = (a && a.hasAttribute("data-ln-progress-max") ? parseFloat(a.getAttribute("data-ln-progress-max")) : null) || parseFloat(this.dom.getAttribute("data-ln-progress-max")) || 100;
    let c = f > 0 ? o / f * 100 : 0;
    c < 0 && (c = 0), c > 100 && (c = 100), this.dom.style.width = c + "%";
    const y = Math.max(0, Math.min(o, f));
    this.dom.setAttribute("role", "progressbar"), this.dom.setAttribute("aria-valuemin", "0"), this.dom.setAttribute("aria-valuemax", String(f)), this.dom.setAttribute("aria-valuenow", String(y)), A(this.dom, "ln-progress:change", { target: this.dom, value: o, max: f, percentage: c });
  }
  window[t] = s, document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
    s(document.body);
  }) : s(document.body);
})();
(function() {
  const p = "data-ln-filter", t = "lnFilter", s = "data-ln-filter-initialized", r = "data-ln-filter-key", d = "data-ln-filter-value", h = "data-ln-filter-hide", i = "data-ln-filter-reset", n = "data-ln-filter-col", e = /* @__PURE__ */ new WeakMap();
  if (window[t] !== void 0) return;
  function o(l) {
    return l.hasAttribute(i) || l.getAttribute(d) === "";
  }
  function a(l) {
    let u = null;
    const g = [];
    for (let m = 0; m < l.inputs.length; m++) {
      const v = l.inputs[m];
      if (v.checked && !o(v)) {
        u === null && (u = v.getAttribute(r));
        const b = v.getAttribute(d);
        b && g.push(b);
      }
    }
    return { key: u, values: g };
  }
  function f(l, u) {
    if (l.length !== u.length) return !0;
    for (let g = 0; g < l.length; g++) if (l[g] !== u[g]) return !0;
    return !1;
  }
  function c(l) {
    const u = l.dom, g = l.colIndex, m = u.querySelector("template");
    if (!m || g === null) return;
    const v = document.getElementById(l.targetId);
    if (!v) return;
    const b = v.tagName === "TABLE" ? v : v.querySelector("table");
    if (!b || v.hasAttribute("data-ln-table")) return;
    const E = {}, _ = [], k = b.tBodies;
    for (let I = 0; I < k.length; I++) {
      const T = k[I].rows;
      for (let P = 0; P < T.length; P++) {
        const F = T[P].cells[g], B = F ? F.textContent.trim() : "";
        B && !E[B] && (E[B] = !0, _.push(B));
      }
    }
    _.sort(function(I, T) {
      return I.localeCompare(T);
    });
    const x = u.querySelector("[" + r + "]"), q = x ? x.getAttribute(r) : u.getAttribute("data-ln-filter-key") || "col" + g;
    for (let I = 0; I < _.length; I++) {
      const T = m.content.cloneNode(!0), P = T.querySelector("input");
      P && (P.setAttribute(r, q), P.setAttribute(d, _[I]), me(T, { text: _[I] }), u.appendChild(T));
    }
  }
  function y(l) {
    if (l.hasAttribute(s)) return this;
    this.dom = l, this.targetId = l.getAttribute(p);
    const u = l.getAttribute(n);
    this.colIndex = u !== null ? parseInt(u, 10) : null, c(this), this.inputs = Array.from(l.querySelectorAll("[" + r + "]")), this._filterKey = this.inputs.length > 0 ? this.inputs[0].getAttribute(r) : null, this._lastSnapshot = null;
    const g = this, m = Pe(
      function() {
        g._render();
      },
      function() {
        g._afterRender();
      }
    );
    this._queueRender = m, this._attachHandlers();
    let v = !1;
    if (l.hasAttribute("data-ln-persist")) {
      const b = jt("filter", l);
      if (b && b.key && Array.isArray(b.values) && b.values.length > 0) {
        for (let E = 0; E < this.inputs.length; E++) {
          const _ = this.inputs[E];
          o(_) ? _.checked = !1 : _.getAttribute(r) === b.key && b.values.indexOf(_.getAttribute(d)) !== -1 ? _.checked = !0 : _.checked = !1;
        }
        m(), v = !0;
      }
    }
    if (!v) {
      for (let b = 0; b < this.inputs.length; b++)
        if (this.inputs[b].checked && !o(this.inputs[b])) {
          m();
          break;
        }
    }
    return l.setAttribute(s, ""), this;
  }
  y.prototype._attachHandlers = function() {
    const l = this;
    this.inputs.forEach(function(u) {
      u[t + "Bound"] || (u[t + "Bound"] = !0, u._lnFilterChange = function() {
        if (o(u)) {
          for (let g = 0; g < l.inputs.length; g++)
            o(l.inputs[g]) || (l.inputs[g].checked = !1);
          u.checked = !0, l._queueRender();
          return;
        }
        if (u.checked)
          for (let g = 0; g < l.inputs.length; g++)
            o(l.inputs[g]) && (l.inputs[g].checked = !1);
        else {
          let g = !1;
          for (let m = 0; m < l.inputs.length; m++)
            if (!o(l.inputs[m]) && l.inputs[m].checked) {
              g = !0;
              break;
            }
          if (!g)
            for (let m = 0; m < l.inputs.length; m++)
              o(l.inputs[m]) && (l.inputs[m].checked = !0);
        }
        l._queueRender();
      }, u.addEventListener("change", u._lnFilterChange));
    });
  }, y.prototype._render = function() {
    const l = this, u = a(this), g = u.key === null || u.values.length === 0, m = [];
    for (let v = 0; v < u.values.length; v++)
      m.push(u.values[v].toLowerCase());
    if (l.colIndex !== null)
      l._filterTableRows(u);
    else {
      const v = document.getElementById(l.targetId);
      if (!v) return;
      const b = v.children;
      for (let E = 0; E < b.length; E++) {
        const _ = b[E];
        if (g) {
          _.removeAttribute(h);
          continue;
        }
        const k = _.getAttribute("data-" + u.key);
        _.removeAttribute(h), k !== null && m.indexOf(k.toLowerCase()) === -1 && _.setAttribute(h, "true");
      }
    }
  }, y.prototype._afterRender = function() {
    const l = a(this), u = this._lastSnapshot;
    if (!u || u.key !== l.key || f(u.values, l.values)) {
      this._dispatchOnBoth("ln-filter:changed", {
        key: l.key,
        values: l.values.slice()
      });
      const g = u && u.values.length > 0, m = l.values.length === 0;
      g && m && this._dispatchOnBoth("ln-filter:reset", {}), this._lastSnapshot = { key: l.key, values: l.values.slice() };
    }
    this.dom.hasAttribute("data-ln-persist") && (l.key && l.values.length > 0 ? gt("filter", this.dom, { key: l.key, values: l.values.slice() }) : gt("filter", this.dom, null));
  }, y.prototype._dispatchOnBoth = function(l, u) {
    A(this.dom, l, u);
    const g = document.getElementById(this.targetId);
    g && g !== this.dom && A(g, l, u);
  }, y.prototype._filterTableRows = function(l) {
    const u = document.getElementById(this.targetId);
    if (!u) return;
    const g = u.tagName === "TABLE" ? u : u.querySelector("table");
    if (!g || u.hasAttribute("data-ln-table")) return;
    const m = l.key || this._filterKey, v = l.values;
    e.has(g) || e.set(g, {});
    const b = e.get(g);
    if (m && v.length > 0) {
      const x = [];
      for (let q = 0; q < v.length; q++)
        x.push(v[q].toLowerCase());
      b[m] = { col: this.colIndex, values: x };
    } else m && delete b[m];
    const E = Object.keys(b), _ = E.length > 0, k = g.tBodies;
    for (let x = 0; x < k.length; x++) {
      const q = k[x].rows;
      for (let I = 0; I < q.length; I++) {
        const T = q[I];
        if (!_) {
          T.removeAttribute(h);
          continue;
        }
        let P = !0;
        for (let F = 0; F < E.length; F++) {
          const B = b[E[F]], R = T.cells[B.col], U = R ? R.textContent.trim().toLowerCase() : "";
          if (B.values.indexOf(U) === -1) {
            P = !1;
            break;
          }
        }
        P ? T.removeAttribute(h) : T.setAttribute(h, "true");
      }
    }
  }, y.prototype.destroy = function() {
    if (this.dom[t]) {
      if (this.colIndex !== null) {
        const l = document.getElementById(this.targetId);
        if (l) {
          const u = l.tagName === "TABLE" ? l : l.querySelector("table");
          if (u && e.has(u)) {
            const g = e.get(u), m = this._filterKey;
            m && g[m] && delete g[m], Object.keys(g).length === 0 && e.delete(u);
          }
        }
      }
      this.inputs.forEach(function(l) {
        l._lnFilterChange && (l.removeEventListener("change", l._lnFilterChange), delete l._lnFilterChange), delete l[t + "Bound"];
      }), this.dom.removeAttribute(s), delete this.dom[t];
    }
  }, H(p, t, y, "ln-filter");
})();
(function() {
  const p = "data-ln-search", t = "lnSearch", s = "data-ln-search-initialized", r = "data-ln-search-hide";
  if (window[t] !== void 0) return;
  function d(h) {
    if (h.hasAttribute(s)) return this;
    this.dom = h, this.targetId = h.getAttribute(p);
    const i = h.tagName;
    if (this.input = i === "INPUT" || i === "TEXTAREA" ? h : h.querySelector('[name="search"]') || h.querySelector('input[type="search"]') || h.querySelector('input[type="text"]'), this.itemsSelector = h.getAttribute("data-ln-search-items") || null, this._debounceTimer = null, this._attachHandler(), this.input && this.input.value.trim()) {
      const n = this;
      queueMicrotask(function() {
        n._search(n.input.value.trim().toLowerCase());
      });
    }
    return h.setAttribute(s, ""), this;
  }
  d.prototype._attachHandler = function() {
    if (!this.input) return;
    const h = this;
    this._clearBtn = this.dom.querySelector("[data-ln-search-clear]"), this._clearBtn && (this._onClear = function() {
      h.input.value = "", h._search(""), h.input.focus();
    }, this._clearBtn.addEventListener("click", this._onClear)), this._onInput = function() {
      clearTimeout(h._debounceTimer), h._debounceTimer = setTimeout(function() {
        h._search(h.input.value.trim().toLowerCase());
      }, 150);
    }, this.input.addEventListener("input", this._onInput);
  }, d.prototype._search = function(h) {
    const i = document.getElementById(this.targetId);
    if (!i || Z(i, "ln-search:change", { term: h, targetId: this.targetId }).defaultPrevented) return;
    const n = this.itemsSelector ? i.querySelectorAll(this.itemsSelector) : i.children;
    for (let e = 0; e < n.length; e++) {
      const o = n[e];
      o.removeAttribute(r), h && !o.textContent.replace(/\s+/g, " ").toLowerCase().includes(h) && o.setAttribute(r, "true");
    }
  }, d.prototype.destroy = function() {
    this.dom[t] && (clearTimeout(this._debounceTimer), this.input && this._onInput && this.input.removeEventListener("input", this._onInput), this._clearBtn && this._onClear && this._clearBtn.removeEventListener("click", this._onClear), this.dom.removeAttribute(s), delete this.dom[t]);
  }, H(p, t, d, "ln-search");
})();
(function() {
  const p = "lnTableSort", t = "data-ln-sort", s = "data-ln-sort-active";
  if (window[p] !== void 0) return;
  function r(e) {
    d(e);
  }
  function d(e) {
    const o = Array.from(e.querySelectorAll("table"));
    e.tagName === "TABLE" && o.push(e), o.forEach(function(a) {
      if (a[p]) return;
      const f = Array.from(a.querySelectorAll("th[" + t + "]"));
      f.length && (a[p] = new i(a, f));
    });
  }
  function h(e, o) {
    e.querySelectorAll("[data-ln-sort-icon]").forEach(function(a) {
      const f = a.getAttribute("data-ln-sort-icon");
      o == null ? a.classList.toggle("hidden", f !== null && f !== "") : a.classList.toggle("hidden", f !== o);
    });
  }
  function i(e, o) {
    this.table = e, this.ths = o, this._col = -1, this._dir = null;
    const a = this;
    o.forEach(function(c, y) {
      c[p + "Bound"] || (c[p + "Bound"] = !0, c._lnSortClick = function(l) {
        const u = l.target.closest("button, a, input, select, textarea, [data-ln-dropdown]");
        u && u !== c || a._handleClick(y, c);
      }, c.addEventListener("click", c._lnSortClick));
    });
    const f = e.closest("[data-ln-table][data-ln-persist]");
    if (f) {
      const c = jt("table-sort", f);
      c && c.dir && c.col >= 0 && c.col < o.length && (this._handleClick(c.col, o[c.col]), c.dir === "desc" && this._handleClick(c.col, o[c.col]));
    }
    return this;
  }
  i.prototype._handleClick = function(e, o) {
    let a;
    this._col !== e ? a = "asc" : this._dir === "asc" ? a = "desc" : this._dir === "desc" ? a = null : a = "asc", this.ths.forEach(function(c) {
      c.removeAttribute(s), h(c, null);
    }), a === null ? (this._col = -1, this._dir = null) : (this._col = e, this._dir = a, o.setAttribute(s, a), h(o, a)), A(this.table, "ln-table:sort", {
      column: e,
      sortType: o.getAttribute(t),
      direction: a
    });
    const f = this.table.closest("[data-ln-table][data-ln-persist]");
    f && (a === null ? gt("table-sort", f, null) : gt("table-sort", f, { col: e, dir: a }));
  }, i.prototype.destroy = function() {
    this.table[p] && (this.ths.forEach(function(e) {
      e._lnSortClick && (e.removeEventListener("click", e._lnSortClick), delete e._lnSortClick), delete e[p + "Bound"];
    }), delete this.table[p]);
  };
  function n() {
    nt(function() {
      new MutationObserver(function(e) {
        e.forEach(function(o) {
          o.type === "childList" ? o.addedNodes.forEach(function(a) {
            a.nodeType === 1 && d(a);
          }) : o.type === "attributes" && d(o.target);
        });
      }).observe(document.body, { childList: !0, subtree: !0, attributes: !0, attributeFilter: [t] });
    }, "ln-table-sort");
  }
  window[p] = r, n(), document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
    r(document.body);
  }) : r(document.body);
})();
(function() {
  const p = "data-ln-table", t = "lnTable", s = "data-ln-sort", r = "data-ln-table-empty";
  if (window[t] !== void 0) return;
  const d = typeof Intl < "u" ? new Intl.Collator(document.documentElement.lang || void 0, { sensitivity: "base" }) : null;
  function h(i) {
    this.dom = i, this.table = i.querySelector("table"), this.tbody = i.querySelector("tbody"), this.thead = i.querySelector("thead");
    const n = this.thead ? this.thead.querySelector("tr:last-child") : null;
    this.ths = n ? Array.from(n.querySelectorAll("th")) : [], this._data = [], this._filteredData = [], this._searchTerm = "", this._sortCol = -1, this._sortDir = null, this._sortType = null, this._columnFilters = {}, this._virtual = !1, this._rowHeight = 0, this._vStart = -1, this._vEnd = -1, this._rafId = null, this._scrollHandler = null, this._colgroup = null;
    const e = this;
    return this._emptyTbodyObserver = null, this.tbody && this.tbody.rows.length > 0 ? this._parseRows() : this.tbody && (this._emptyTbodyObserver = new MutationObserver(function() {
      e.tbody.rows.length > 0 && (e._emptyTbodyObserver.disconnect(), e._emptyTbodyObserver = null, e._parseRows());
    }), this._emptyTbodyObserver.observe(this.tbody, { childList: !0 })), this._onSearch = function(o) {
      o.preventDefault(), e._searchTerm = o.detail.term, e._applyFilterAndSort(), e._vStart = -1, e._vEnd = -1, e._render(), A(i, "ln-table:filter", {
        term: e._searchTerm,
        matched: e._filteredData.length,
        total: e._data.length
      });
    }, i.addEventListener("ln-search:change", this._onSearch), this._onSort = function(o) {
      e._sortCol = o.detail.direction === null ? -1 : o.detail.column, e._sortDir = o.detail.direction, e._sortType = o.detail.sortType, e._applyFilterAndSort(), e._vStart = -1, e._vEnd = -1, e._render(), A(i, "ln-table:sorted", {
        column: o.detail.column,
        direction: o.detail.direction,
        matched: e._filteredData.length,
        total: e._data.length
      });
    }, i.addEventListener("ln-table:sort", this._onSort), this._onColumnFilter = function(o) {
      const a = o.detail.key;
      let f = !1;
      for (let l = 0; l < e.ths.length; l++)
        if (e.ths[l].getAttribute("data-ln-filter-col") === a) {
          f = !0;
          break;
        }
      if (!f) return;
      const c = o.detail.values;
      if (!c || c.length === 0)
        delete e._columnFilters[a];
      else {
        const l = [];
        for (let u = 0; u < c.length; u++)
          l.push(c[u].toLowerCase());
        e._columnFilters[a] = l;
      }
      const y = e.dom.querySelector('th[data-ln-filter-col="' + a + '"]');
      y && (c && c.length > 0 ? y.setAttribute("data-ln-filter-active", "") : y.removeAttribute("data-ln-filter-active")), e._applyFilterAndSort(), e._vStart = -1, e._vEnd = -1, e._render(), A(i, "ln-table:filter", {
        term: e._searchTerm,
        matched: e._filteredData.length,
        total: e._data.length
      });
    }, i.addEventListener("ln-filter:changed", this._onColumnFilter), this._onClear = function(o) {
      if (!o.target.closest("[data-ln-table-clear]")) return;
      e._searchTerm = "";
      const a = document.querySelector('[data-ln-search="' + i.id + '"]');
      if (a) {
        const c = a.tagName === "INPUT" ? a : a.querySelector("input");
        c && (c.value = "");
      }
      e._columnFilters = {};
      for (let c = 0; c < e.ths.length; c++)
        e.ths[c].removeAttribute("data-ln-filter-active");
      const f = document.querySelectorAll('[data-ln-filter="' + i.id + '"]');
      for (let c = 0; c < f.length; c++) {
        const y = f[c].querySelector("[data-ln-filter-reset]");
        y && (y.checked = !0, y.dispatchEvent(new Event("change", { bubbles: !0 })));
      }
      e._applyFilterAndSort(), e._vStart = -1, e._vEnd = -1, e._render(), A(i, "ln-table:filter", {
        term: "",
        matched: e._filteredData.length,
        total: e._data.length
      });
    }, i.addEventListener("click", this._onClear), this;
  }
  h.prototype._parseRows = function() {
    const i = this.tbody.rows, n = this.ths;
    this._data = [];
    const e = [];
    for (let o = 0; o < n.length; o++)
      e[o] = n[o].getAttribute(s);
    i.length > 0 && (this._rowHeight = i[0].offsetHeight || 40), this._lockColumnWidths();
    for (let o = 0; o < i.length; o++) {
      const a = i[o], f = [], c = [], y = [];
      for (let l = 0; l < a.cells.length; l++) {
        const u = a.cells[l], g = u.textContent.trim(), m = u.hasAttribute("data-ln-value") ? u.getAttribute("data-ln-value") : g, v = e[l];
        c[l] = g.toLowerCase(), v === "number" || v === "date" ? f[l] = parseFloat(m) || 0 : v === "string" ? f[l] = String(m) : f[l] = null, l < a.cells.length - 1 && y.push(g.toLowerCase());
      }
      this._data.push({
        sortKeys: f,
        rawTexts: c,
        html: a.outerHTML,
        searchText: y.join(" ")
      });
    }
    this._filteredData = this._data.slice(), this._render(), A(this.dom, "ln-table:ready", {
      total: this._data.length
    });
  }, h.prototype._applyFilterAndSort = function() {
    const i = this._searchTerm, n = this._columnFilters, e = Object.keys(n).length > 0, o = this.ths, a = {};
    if (e)
      for (let u = 0; u < o.length; u++) {
        const g = o[u].getAttribute("data-ln-filter-col");
        g && (a[g] = u);
      }
    if (!i && !e ? this._filteredData = this._data.slice() : this._filteredData = this._data.filter(function(u) {
      if (i && u.searchText.indexOf(i) === -1) return !1;
      if (e)
        for (const g in n) {
          const m = a[g];
          if (m !== void 0 && n[g].indexOf(u.rawTexts[m]) === -1)
            return !1;
        }
      return !0;
    }), this._sortCol < 0 || !this._sortDir) return;
    const f = this._sortCol, c = this._sortDir === "desc" ? -1 : 1, y = this._sortType === "number" || this._sortType === "date", l = d ? d.compare : function(u, g) {
      return u < g ? -1 : u > g ? 1 : 0;
    };
    this._filteredData.sort(function(u, g) {
      const m = u.sortKeys[f], v = g.sortKeys[f];
      return y ? (m - v) * c : l(m, v) * c;
    });
  }, h.prototype._lockColumnWidths = function() {
    if (!this.table || !this.thead || this._colgroup) return;
    const i = document.createElement("colgroup");
    this.ths.forEach(function(n) {
      const e = document.createElement("col");
      e.style.width = n.offsetWidth + "px", i.appendChild(e);
    }), this.table.insertBefore(i, this.table.firstChild), this.table.style.tableLayout = "fixed", this._colgroup = i;
  }, h.prototype._render = function() {
    if (!this.tbody) return;
    const i = this._filteredData.length;
    i === 0 && (this._searchTerm || Object.keys(this._columnFilters).length > 0) ? (this._disableVirtualScroll(), this._showEmptyState()) : i > 200 ? (this._enableVirtualScroll(), this._renderVirtual()) : (this._disableVirtualScroll(), this._renderAll());
  }, h.prototype._renderAll = function() {
    const i = [], n = this._filteredData;
    for (let e = 0; e < n.length; e++) i.push(n[e].html);
    this.tbody.innerHTML = i.join("");
  }, h.prototype._enableVirtualScroll = function() {
    if (this._virtual) return;
    this._virtual = !0;
    const i = this;
    this._scrollHandler = function() {
      i._rafId || (i._rafId = requestAnimationFrame(function() {
        i._rafId = null, i._renderVirtual();
      }));
    }, window.addEventListener("scroll", this._scrollHandler, { passive: !0 }), window.addEventListener("resize", this._scrollHandler, { passive: !0 });
  }, h.prototype._disableVirtualScroll = function() {
    this._virtual && (this._virtual = !1, this._scrollHandler && (window.removeEventListener("scroll", this._scrollHandler), window.removeEventListener("resize", this._scrollHandler), this._scrollHandler = null), this._rafId && (cancelAnimationFrame(this._rafId), this._rafId = null), this._vStart = -1, this._vEnd = -1);
  }, h.prototype._renderVirtual = function() {
    const i = this._filteredData, n = i.length, e = this._rowHeight;
    if (!e || !n) return;
    const o = this.table.getBoundingClientRect().top + window.scrollY, a = this.thead ? this.thead.offsetHeight : 0, f = o + a, c = window.scrollY - f, y = Math.max(0, Math.floor(c / e) - 15), l = Math.min(y + Math.ceil(window.innerHeight / e) + 30, n);
    if (y === this._vStart && l === this._vEnd) return;
    this._vStart = y, this._vEnd = l;
    const u = this.ths.length || 1, g = y * e, m = (n - l) * e;
    let v = "";
    g > 0 && (v += '<tr class="ln-table__spacer" aria-hidden="true"><td colspan="' + u + '" style="height:' + g + 'px;padding:0;border:none"></td></tr>');
    for (let b = y; b < l; b++) v += i[b].html;
    m > 0 && (v += '<tr class="ln-table__spacer" aria-hidden="true"><td colspan="' + u + '" style="height:' + m + 'px;padding:0;border:none"></td></tr>'), this.tbody.innerHTML = v;
  }, h.prototype._showEmptyState = function() {
    const i = this.ths.length || 1, n = this.dom.querySelector("template[" + r + "]"), e = document.createElement("td");
    e.setAttribute("colspan", String(i)), n && e.appendChild(document.importNode(n.content, !0));
    const o = document.createElement("tr");
    o.className = "ln-table__empty", o.appendChild(e), this.tbody.innerHTML = "", this.tbody.appendChild(o), A(this.dom, "ln-table:empty", {
      term: this._searchTerm,
      total: this._data.length
    });
  }, h.prototype.destroy = function() {
    this.dom[t] && (this._disableVirtualScroll(), this._emptyTbodyObserver && (this._emptyTbodyObserver.disconnect(), this._emptyTbodyObserver = null), this.dom.removeEventListener("ln-search:change", this._onSearch), this.dom.removeEventListener("ln-table:sort", this._onSort), this.dom.removeEventListener("ln-filter:changed", this._onColumnFilter), this.dom.removeEventListener("click", this._onClear), this._colgroup && (this._colgroup.remove(), this._colgroup = null), this.table && (this.table.style.tableLayout = ""), this._data = [], this._filteredData = [], delete this.dom[t]);
  }, H(p, t, h, "ln-table");
})();
(function() {
  const p = "data-ln-circular-progress", t = "lnCircularProgress";
  if (window[t] !== void 0) return;
  const s = "http://www.w3.org/2000/svg", r = 36, d = 16, h = 2 * Math.PI * d;
  function i(f) {
    return this.dom = f, this.svg = null, this.trackCircle = null, this.progressCircle = null, this.labelEl = null, this._attrObserver = null, e.call(this), a.call(this), o.call(this), f.setAttribute("data-ln-circular-progress-initialized", ""), this;
  }
  i.prototype.destroy = function() {
    this.dom[t] && (this._attrObserver && this._attrObserver.disconnect(), this.svg && this.svg.remove(), this.labelEl && this.labelEl.remove(), this.dom.removeAttribute("data-ln-circular-progress-initialized"), delete this.dom[t]);
  };
  function n(f, c) {
    const y = document.createElementNS(s, f);
    for (const l in c)
      y.setAttribute(l, c[l]);
    return y;
  }
  function e() {
    this.svg = n("svg", {
      viewBox: "0 0 " + r + " " + r,
      "aria-hidden": "true"
    }), this.trackCircle = n("circle", {
      cx: r / 2,
      cy: r / 2,
      r: d,
      fill: "none",
      "stroke-width": "3"
    }), this.trackCircle.classList.add("ln-circular-progress__track"), this.progressCircle = n("circle", {
      cx: r / 2,
      cy: r / 2,
      r: d,
      fill: "none",
      "stroke-width": "3",
      "stroke-linecap": "round",
      "stroke-dasharray": h,
      "stroke-dashoffset": h,
      transform: "rotate(-90 " + r / 2 + " " + r / 2 + ")"
    }), this.progressCircle.classList.add("ln-circular-progress__fill"), this.svg.appendChild(this.trackCircle), this.svg.appendChild(this.progressCircle), this.labelEl = document.createElement("strong"), this.labelEl.classList.add("ln-circular-progress__label"), this.dom.appendChild(this.svg), this.dom.appendChild(this.labelEl);
  }
  function o() {
    const f = this, c = new MutationObserver(function(y) {
      for (const l of y)
        (l.attributeName === "data-ln-circular-progress" || l.attributeName === "data-ln-circular-progress-max") && a.call(f);
    });
    c.observe(this.dom, {
      attributes: !0,
      attributeFilter: ["data-ln-circular-progress", "data-ln-circular-progress-max"]
    }), this._attrObserver = c;
  }
  function a() {
    const f = parseFloat(this.dom.getAttribute("data-ln-circular-progress")) || 0, c = parseFloat(this.dom.getAttribute("data-ln-circular-progress-max")) || 100;
    let y = c > 0 ? f / c * 100 : 0;
    y < 0 && (y = 0), y > 100 && (y = 100);
    const l = h - y / 100 * h;
    this.progressCircle.setAttribute("stroke-dashoffset", l);
    const u = this.dom.getAttribute("data-ln-circular-progress-label");
    this.labelEl.textContent = u !== null ? u : Math.round(y) + "%", A(this.dom, "ln-circular-progress:change", {
      target: this.dom,
      value: f,
      max: c,
      percentage: y
    });
  }
  H(p, t, i, "ln-circular-progress");
})();
(function() {
  const p = "data-ln-sortable", t = "lnSortable", s = "data-ln-sortable-handle";
  if (window[t] !== void 0) return;
  function r(h) {
    this.dom = h, this.isEnabled = h.getAttribute(p) !== "disabled", this._dragging = null, h.setAttribute("aria-roledescription", "sortable list");
    const i = this;
    return this._onPointerDown = function(n) {
      i.isEnabled && i._handlePointerDown(n);
    }, h.addEventListener("pointerdown", this._onPointerDown), this;
  }
  r.prototype.enable = function() {
    this.isEnabled || this.dom.setAttribute(p, "");
  }, r.prototype.disable = function() {
    this.isEnabled && this.dom.setAttribute(p, "disabled");
  }, r.prototype.destroy = function() {
    this.dom[t] && (this.dom.removeEventListener("pointerdown", this._onPointerDown), A(this.dom, "ln-sortable:destroyed", { target: this.dom }), delete this.dom[t]);
  }, r.prototype._handlePointerDown = function(h) {
    let i = h.target.closest("[" + s + "]"), n;
    if (i) {
      for (n = i; n && n.parentElement !== this.dom; )
        n = n.parentElement;
      if (!n || n.parentElement !== this.dom) return;
    } else {
      if (this.dom.querySelector("[" + s + "]")) return;
      for (n = h.target; n && n.parentElement !== this.dom; )
        n = n.parentElement;
      if (!n || n.parentElement !== this.dom) return;
      i = n;
    }
    const e = Array.from(this.dom.children).indexOf(n);
    if (Z(this.dom, "ln-sortable:before-drag", {
      item: n,
      index: e
    }).defaultPrevented) return;
    h.preventDefault(), i.setPointerCapture(h.pointerId), this._dragging = n, n.classList.add("ln-sortable--dragging"), n.setAttribute("aria-grabbed", "true"), this.dom.classList.add("ln-sortable--active"), A(this.dom, "ln-sortable:drag-start", {
      item: n,
      index: e
    });
    const o = this, a = function(c) {
      o._handlePointerMove(c);
    }, f = function(c) {
      o._handlePointerEnd(c), i.removeEventListener("pointermove", a), i.removeEventListener("pointerup", f), i.removeEventListener("pointercancel", f);
    };
    i.addEventListener("pointermove", a), i.addEventListener("pointerup", f), i.addEventListener("pointercancel", f);
  }, r.prototype._handlePointerMove = function(h) {
    if (!this._dragging) return;
    const i = Array.from(this.dom.children), n = this._dragging;
    for (const e of i)
      e.classList.remove("ln-sortable--drop-before", "ln-sortable--drop-after");
    for (const e of i) {
      if (e === n) continue;
      const o = e.getBoundingClientRect(), a = o.top + o.height / 2;
      if (h.clientY >= o.top && h.clientY < a) {
        e.classList.add("ln-sortable--drop-before");
        break;
      } else if (h.clientY >= a && h.clientY <= o.bottom) {
        e.classList.add("ln-sortable--drop-after");
        break;
      }
    }
  }, r.prototype._handlePointerEnd = function(h) {
    if (!this._dragging) return;
    const i = this._dragging, n = Array.from(this.dom.children), e = n.indexOf(i);
    let o = null, a = null;
    for (const f of n) {
      if (f.classList.contains("ln-sortable--drop-before")) {
        o = f, a = "before";
        break;
      }
      if (f.classList.contains("ln-sortable--drop-after")) {
        o = f, a = "after";
        break;
      }
    }
    for (const f of n)
      f.classList.remove("ln-sortable--drop-before", "ln-sortable--drop-after");
    if (i.classList.remove("ln-sortable--dragging"), i.removeAttribute("aria-grabbed"), this.dom.classList.remove("ln-sortable--active"), o && o !== i) {
      a === "before" ? this.dom.insertBefore(i, o) : this.dom.insertBefore(i, o.nextElementSibling);
      const f = Array.from(this.dom.children).indexOf(i);
      A(this.dom, "ln-sortable:reordered", {
        item: i,
        oldIndex: e,
        newIndex: f
      });
    }
    this._dragging = null;
  };
  function d(h) {
    const i = h[t];
    if (!i) return;
    const n = h.getAttribute(p) !== "disabled";
    n !== i.isEnabled && (i.isEnabled = n, A(h, n ? "ln-sortable:enabled" : "ln-sortable:disabled", { target: h }));
  }
  H(p, t, r, "ln-sortable", {
    onAttributeChange: d
  });
})();
(function() {
  const p = "data-ln-confirm", t = "lnConfirm", s = "data-ln-confirm-timeout";
  if (window[t] !== void 0) return;
  function r(d) {
    this.dom = d, this.confirming = !1, this.originalText = d.textContent.trim(), this.confirmText = d.getAttribute(p) || "Confirm?", this.revertTimer = null, this._submitted = !1;
    const h = this;
    return this._onClick = function(i) {
      if (!h.confirming)
        i.preventDefault(), i.stopImmediatePropagation(), h._enterConfirm();
      else {
        if (h._submitted) return;
        h._submitted = !0, h._reset();
      }
    }, d.addEventListener("click", this._onClick), this;
  }
  r.prototype._getTimeout = function() {
    const d = parseFloat(this.dom.getAttribute(s));
    return isNaN(d) || d <= 0 ? 3 : d;
  }, r.prototype._enterConfirm = function() {
    this.confirming = !0, this.dom.setAttribute("data-confirming", "true");
    var d = this.dom.querySelector("svg.ln-icon use");
    d && this.originalText === "" ? (this.isIconButton = !0, this.originalIconHref = d.getAttribute("href"), d.setAttribute("href", "#ln-check"), this.dom.classList.add("ln-confirm-tooltip"), this.dom.setAttribute("data-tooltip-text", this.confirmText), this.originalAriaLabel = this.dom.getAttribute("aria-label"), this.dom.setAttribute("aria-label", this.confirmText), this.alertNode = document.createElement("span"), this.alertNode.className = "sr-only", this.alertNode.setAttribute("role", "alert"), this.alertNode.textContent = this.confirmText, this.dom.appendChild(this.alertNode)) : this.dom.textContent = this.confirmText, this._startTimer(), A(this.dom, "ln-confirm:waiting", { target: this.dom });
  }, r.prototype._startTimer = function() {
    this.revertTimer && clearTimeout(this.revertTimer);
    const d = this, h = this._getTimeout() * 1e3;
    this.revertTimer = setTimeout(function() {
      d._reset();
    }, h);
  }, r.prototype._reset = function() {
    if (this._submitted = !1, this.confirming = !1, this.dom.removeAttribute("data-confirming"), this.isIconButton) {
      var d = this.dom.querySelector("svg.ln-icon use");
      d && this.originalIconHref && d.setAttribute("href", this.originalIconHref), this.dom.classList.remove("ln-confirm-tooltip"), this.dom.removeAttribute("data-tooltip-text"), this.originalAriaLabel !== null && this.originalAriaLabel !== void 0 ? this.dom.setAttribute("aria-label", this.originalAriaLabel) : this.dom.removeAttribute("aria-label"), this.originalAriaLabel = null, this.alertNode && this.alertNode.parentNode === this.dom && this.dom.removeChild(this.alertNode), this.alertNode = null, this.isIconButton = !1, this.originalIconHref = null;
    } else
      this.dom.textContent = this.originalText;
    this.revertTimer && (clearTimeout(this.revertTimer), this.revertTimer = null);
  }, r.prototype.destroy = function() {
    this.dom[t] && (this._reset(), this.dom.removeEventListener("click", this._onClick), delete this.dom[t]);
  }, H(p, t, r, "ln-confirm");
})();
(function() {
  const p = "data-ln-translations", t = "lnTranslations";
  if (window[t] !== void 0) return;
  const s = {
    en: "English",
    sq: "Shqip",
    sr: "Srpski"
  };
  function r(d) {
    this.dom = d, this.activeLanguages = /* @__PURE__ */ new Set(), this.defaultLang = d.getAttribute(p + "-default") || "", this.badgesEl = d.querySelector("[" + p + "-active]"), this.menuEl = d.querySelector("[data-ln-dropdown] > [data-ln-toggle]");
    const h = d.getAttribute(p + "-locales");
    if (this.locales = s, h)
      try {
        this.locales = JSON.parse(h);
      } catch {
        console.warn("[ln-translations] Invalid JSON in data-ln-translations-locales");
      }
    this._applyDefaultLang(), this._updateDropdown();
    const i = this;
    return this._onRequestAdd = function(n) {
      n.detail && n.detail.lang && i.addLanguage(n.detail.lang);
    }, this._onRequestRemove = function(n) {
      n.detail && n.detail.lang && i.removeLanguage(n.detail.lang);
    }, d.addEventListener("ln-translations:request-add", this._onRequestAdd), d.addEventListener("ln-translations:request-remove", this._onRequestRemove), this._detectExisting(), this;
  }
  r.prototype._applyDefaultLang = function() {
    if (!this.defaultLang) return;
    const d = this.dom.querySelectorAll("[data-ln-translatable]");
    for (const h of d) {
      const i = h.querySelectorAll("input:not([data-ln-translatable-lang]), textarea:not([data-ln-translatable-lang]), select:not([data-ln-translatable-lang])");
      for (const n of i)
        n.setAttribute("data-ln-translatable-lang", this.defaultLang);
    }
  }, r.prototype._detectExisting = function() {
    const d = this.dom.querySelectorAll("[data-ln-translatable-lang]");
    for (const h of d) {
      const i = h.getAttribute("data-ln-translatable-lang");
      i && i !== this.defaultLang && this.activeLanguages.add(i);
    }
    this.activeLanguages.size > 0 && (this._updateBadges(), this._updateDropdown());
  }, r.prototype._updateDropdown = function() {
    if (!this.menuEl) return;
    this.menuEl.textContent = "";
    const d = this;
    let h = 0;
    for (const n in this.locales) {
      if (!this.locales.hasOwnProperty(n) || this.activeLanguages.has(n)) continue;
      h++;
      const e = Vt("ln-translations-menu-item", "ln-translations");
      if (!e) return;
      const o = e.querySelector("[data-ln-translations-lang]");
      o.setAttribute("data-ln-translations-lang", n), o.textContent = this.locales[n], o.addEventListener("click", function(a) {
        a.ctrlKey || a.metaKey || a.button === 1 || (a.preventDefault(), a.stopPropagation(), d.menuEl.getAttribute("data-ln-toggle") === "open" && d.menuEl.setAttribute("data-ln-toggle", "close"), d.addLanguage(n));
      }), this.menuEl.appendChild(e);
    }
    const i = this.dom.querySelector("[" + p + "-add]");
    i && (i.style.display = h === 0 ? "none" : "");
  }, r.prototype._updateBadges = function() {
    if (!this.badgesEl) return;
    this.badgesEl.textContent = "";
    const d = this;
    this.activeLanguages.forEach(function(h) {
      const i = Vt("ln-translations-badge", "ln-translations");
      if (!i) return;
      const n = i.querySelector("[data-ln-translations-lang]");
      n.setAttribute("data-ln-translations-lang", h);
      const e = n.querySelector("span");
      e.textContent = d.locales[h] || h.toUpperCase();
      const o = n.querySelector("button");
      o.setAttribute("aria-label", "Remove " + (d.locales[h] || h.toUpperCase())), o.addEventListener("click", function(a) {
        a.ctrlKey || a.metaKey || a.button === 1 || (a.preventDefault(), a.stopPropagation(), d.removeLanguage(h));
      }), d.badgesEl.appendChild(i);
    });
  }, r.prototype.addLanguage = function(d, h) {
    if (this.activeLanguages.has(d)) return;
    const i = this.locales[d] || d;
    if (Z(this.dom, "ln-translations:before-add", {
      target: this.dom,
      lang: d,
      langName: i
    }).defaultPrevented) return;
    this.activeLanguages.add(d), h = h || {};
    const n = this.dom.querySelectorAll("[data-ln-translatable]");
    for (const e of n) {
      const o = e.getAttribute("data-ln-translatable"), a = e.getAttribute("data-ln-translations-prefix") || "", f = e.querySelector(
        this.defaultLang ? '[data-ln-translatable-lang="' + this.defaultLang + '"]' : "input:not([data-ln-translatable-lang]), textarea:not([data-ln-translatable-lang]), select:not([data-ln-translatable-lang])"
      );
      if (!f) continue;
      const c = f.cloneNode(!1);
      a ? c.name = a + "[trans][" + d + "][" + o + "]" : c.name = "trans[" + d + "][" + o + "]", c.value = h[o] !== void 0 ? h[o] : "", c.removeAttribute("id"), c.placeholder = i + " translation", c.setAttribute("data-ln-translatable-lang", d);
      const y = e.querySelectorAll('[data-ln-translatable-lang]:not([data-ln-translatable-lang="' + this.defaultLang + '"])'), l = y.length > 0 ? y[y.length - 1] : f;
      l.parentNode.insertBefore(c, l.nextSibling);
    }
    this._updateDropdown(), this._updateBadges(), A(this.dom, "ln-translations:added", {
      target: this.dom,
      lang: d,
      langName: i
    });
  }, r.prototype.removeLanguage = function(d) {
    if (!this.activeLanguages.has(d) || Z(this.dom, "ln-translations:before-remove", {
      target: this.dom,
      lang: d
    }).defaultPrevented) return;
    const h = this.dom.querySelectorAll('[data-ln-translatable-lang="' + d + '"]');
    for (const i of h)
      i.parentNode.removeChild(i);
    this.activeLanguages.delete(d), this._updateDropdown(), this._updateBadges(), A(this.dom, "ln-translations:removed", {
      target: this.dom,
      lang: d
    });
  }, r.prototype.getActiveLanguages = function() {
    return new Set(this.activeLanguages);
  }, r.prototype.hasLanguage = function(d) {
    return this.activeLanguages.has(d);
  }, r.prototype.destroy = function() {
    if (!this.dom[t]) return;
    const d = this.defaultLang, h = this.dom.querySelectorAll("[data-ln-translatable-lang]");
    for (const i of h)
      i.getAttribute("data-ln-translatable-lang") !== d && i.parentNode.removeChild(i);
    this.dom.removeEventListener("ln-translations:request-add", this._onRequestAdd), this.dom.removeEventListener("ln-translations:request-remove", this._onRequestRemove), delete this.dom[t];
  }, H(p, t, r, "ln-translations");
})();
(function() {
  const p = "data-ln-autosave", t = "lnAutosave", s = "data-ln-autosave-clear", r = "data-ln-autosave-debounce-input", d = "ln-autosave:";
  if (window[t] !== void 0) return;
  function h(o) {
    const a = i(o);
    if (!a) {
      console.warn("ln-autosave: form needs an id or data-ln-autosave value", o);
      return;
    }
    this.dom = o, this.key = a;
    let f = null;
    function c() {
      const g = ge(o);
      try {
        localStorage.setItem(a, JSON.stringify(g));
      } catch {
        return;
      }
      A(o, "ln-autosave:saved", { target: o, data: g });
    }
    function y() {
      let g;
      try {
        g = localStorage.getItem(a);
      } catch {
        return;
      }
      if (!g) return;
      let m;
      try {
        m = JSON.parse(g);
      } catch {
        return;
      }
      if (Z(o, "ln-autosave:before-restore", { target: o, data: m }).defaultPrevented) return;
      const v = ye(o, m);
      for (let b = 0; b < v.length; b++)
        v[b].dispatchEvent(new Event("input", { bubbles: !0 })), v[b].dispatchEvent(new Event("change", { bubbles: !0 }));
      A(o, "ln-autosave:restored", { target: o, data: m });
    }
    function l() {
      try {
        localStorage.removeItem(a);
      } catch {
        return;
      }
      A(o, "ln-autosave:cleared", { target: o });
    }
    this._onFocusout = function(g) {
      const m = g.target;
      n(m) && m.name && c();
    }, this._onChange = function(g) {
      const m = g.target;
      n(m) && m.name && c();
    }, this._onSubmit = function() {
      l();
    }, this._onReset = function() {
      l();
    }, this._onClearClick = function(g) {
      g.target.closest("[" + s + "]") && l();
    }, o.addEventListener("focusout", this._onFocusout), o.addEventListener("change", this._onChange), o.addEventListener("submit", this._onSubmit), o.addEventListener("reset", this._onReset), o.addEventListener("click", this._onClearClick);
    const u = e(o);
    return u > 0 && (this._onInput = function(g) {
      const m = g.target;
      !n(m) || !m.name || (f !== null && clearTimeout(f), f = setTimeout(c, u));
    }, o.addEventListener("input", this._onInput)), this._getInputTimer = function() {
      return f;
    }, y(), this;
  }
  h.prototype.destroy = function() {
    if (this.dom[t]) {
      if (this.dom.removeEventListener("focusout", this._onFocusout), this.dom.removeEventListener("change", this._onChange), this.dom.removeEventListener("submit", this._onSubmit), this.dom.removeEventListener("reset", this._onReset), this.dom.removeEventListener("click", this._onClearClick), this._onInput) {
        this.dom.removeEventListener("input", this._onInput);
        const o = this._getInputTimer();
        o !== null && clearTimeout(o);
      }
      A(this.dom, "ln-autosave:destroyed", { target: this.dom }), delete this.dom[t];
    }
  };
  function i(o) {
    const a = o.getAttribute(p) || o.id;
    return a ? d + window.location.pathname + ":" + a : null;
  }
  function n(o) {
    const a = o.tagName;
    return a === "INPUT" || a === "TEXTAREA" || a === "SELECT";
  }
  function e(o) {
    if (!o.hasAttribute(r)) return 0;
    const a = o.getAttribute(r);
    if (a === "" || a === null) return 1e3;
    const f = parseInt(a, 10);
    return isNaN(f) || f < 0 ? (console.warn("ln-autosave: invalid debounce value, using default", o), 1e3) : f;
  }
  H(p, t, h, "ln-autosave");
})();
(function() {
  const p = "data-ln-autoresize", t = "lnAutoresize";
  if (window[t] !== void 0) return;
  function s(r) {
    if (r.tagName !== "TEXTAREA")
      return console.warn("[ln-autoresize] Can only be applied to <textarea>, got:", r.tagName), this;
    this.dom = r;
    const d = this;
    return this._onInput = function() {
      d._resize();
    }, r.addEventListener("input", this._onInput), this._resize(), this;
  }
  s.prototype._resize = function() {
    this.dom.style.height = "auto", this.dom.style.height = this.dom.scrollHeight + "px";
  }, s.prototype.destroy = function() {
    this.dom[t] && (this.dom.removeEventListener("input", this._onInput), this.dom.style.height = "", delete this.dom[t]);
  }, H(p, t, s, "ln-autoresize");
})();
(function() {
  const p = "data-ln-validate", t = "lnValidate", s = "data-ln-validate-errors", r = "data-ln-validate-error", d = "ln-validate-valid", h = "ln-validate-invalid", i = {
    required: "valueMissing",
    typeMismatch: "typeMismatch",
    tooShort: "tooShort",
    tooLong: "tooLong",
    patternMismatch: "patternMismatch",
    rangeUnderflow: "rangeUnderflow",
    rangeOverflow: "rangeOverflow"
  };
  if (window[t] !== void 0) return;
  function n(e) {
    this.dom = e, this._touched = !1, this._customErrors = /* @__PURE__ */ new Set();
    const o = this, a = e.tagName, f = e.type, c = a === "SELECT" || f === "checkbox" || f === "radio";
    return this._onInput = function() {
      o._touched = !0, o.validate();
    }, this._onChange = function() {
      o._touched = !0, o.validate();
    }, this._onSetCustom = function(y) {
      const l = y.detail && y.detail.error;
      if (!l) return;
      o._customErrors.add(l), o._touched = !0;
      const u = e.closest(".form-element");
      if (u) {
        const g = u.querySelector("[" + r + '="' + l + '"]');
        g && g.classList.remove("hidden");
      }
      e.classList.remove(d), e.classList.add(h);
    }, this._onClearCustom = function(y) {
      const l = y.detail && y.detail.error, u = e.closest(".form-element");
      if (l) {
        if (o._customErrors.delete(l), u) {
          const g = u.querySelector("[" + r + '="' + l + '"]');
          g && g.classList.add("hidden");
        }
      } else
        o._customErrors.forEach(function(g) {
          if (u) {
            const m = u.querySelector("[" + r + '="' + g + '"]');
            m && m.classList.add("hidden");
          }
        }), o._customErrors.clear();
      o._touched && o.validate();
    }, c || e.addEventListener("input", this._onInput), e.addEventListener("change", this._onChange), e.addEventListener("ln-validate:set-custom", this._onSetCustom), e.addEventListener("ln-validate:clear-custom", this._onClearCustom), this;
  }
  n.prototype.validate = function() {
    const e = this.dom, o = e.validity, a = e.checkValidity() && this._customErrors.size === 0, f = e.closest(".form-element");
    if (f) {
      const c = f.querySelector("[" + s + "]");
      if (c) {
        const y = c.querySelectorAll("[" + r + "]");
        for (let l = 0; l < y.length; l++) {
          const u = y[l].getAttribute(r), g = i[u];
          g && (o[g] ? y[l].classList.remove("hidden") : y[l].classList.add("hidden"));
        }
      }
    }
    return e.classList.toggle(d, a), e.classList.toggle(h, !a), A(e, a ? "ln-validate:valid" : "ln-validate:invalid", { target: e, field: e.name }), a;
  }, n.prototype.reset = function() {
    this._touched = !1, this._customErrors.clear(), this.dom.classList.remove(d, h);
    const e = this.dom.closest(".form-element");
    if (e) {
      const o = e.querySelectorAll("[" + r + "]");
      for (let a = 0; a < o.length; a++)
        o[a].classList.add("hidden");
    }
  }, Object.defineProperty(n.prototype, "isValid", {
    get: function() {
      return this.dom.checkValidity() && this._customErrors.size === 0;
    }
  }), n.prototype.destroy = function() {
    this.dom[t] && (this.dom.removeEventListener("input", this._onInput), this.dom.removeEventListener("change", this._onChange), this.dom.removeEventListener("ln-validate:set-custom", this._onSetCustom), this.dom.removeEventListener("ln-validate:clear-custom", this._onClearCustom), this.dom.classList.remove(d, h), A(this.dom, "ln-validate:destroyed", { target: this.dom }), delete this.dom[t]);
  }, H(p, t, n, "ln-validate");
})();
(function() {
  const p = "data-ln-form", t = "lnForm", s = "data-ln-form-auto", r = "data-ln-form-debounce", d = "data-ln-validate", h = "lnValidate";
  if (window[t] !== void 0) return;
  function i(n) {
    this.dom = n, this._debounceTimer = null;
    const e = this;
    if (this._onValid = function() {
      e._updateSubmitButton();
    }, this._onInvalid = function() {
      e._updateSubmitButton();
    }, this._onSubmit = function(o) {
      o.preventDefault(), e.submit();
    }, this._onFill = function(o) {
      o.detail && e.fill(o.detail);
    }, this._onFormReset = function() {
      e.reset();
    }, this._onNativeReset = function() {
      setTimeout(function() {
        e._resetValidation();
      }, 0);
    }, n.addEventListener("ln-validate:valid", this._onValid), n.addEventListener("ln-validate:invalid", this._onInvalid), n.addEventListener("submit", this._onSubmit), n.addEventListener("ln-form:fill", this._onFill), n.addEventListener("ln-form:reset", this._onFormReset), n.addEventListener("reset", this._onNativeReset), this._onAutoInput = null, n.hasAttribute(s)) {
      const o = parseInt(n.getAttribute(r)) || 0;
      this._onAutoInput = function() {
        o > 0 ? (clearTimeout(e._debounceTimer), e._debounceTimer = setTimeout(function() {
          e.submit();
        }, o)) : e.submit();
      }, n.addEventListener("input", this._onAutoInput), n.addEventListener("change", this._onAutoInput);
    }
    return this._updateSubmitButton(), this;
  }
  i.prototype._updateSubmitButton = function() {
    const n = this.dom.querySelectorAll('button[type="submit"], input[type="submit"]');
    if (!n.length) return;
    const e = this.dom.querySelectorAll("[" + d + "]");
    let o = !1;
    if (e.length > 0) {
      let a = !1, f = !1;
      for (let c = 0; c < e.length; c++) {
        const y = e[c][h];
        y && y._touched && (a = !0), e[c].checkValidity() || (f = !0);
      }
      o = f || !a;
    }
    for (let a = 0; a < n.length; a++)
      n[a].disabled = o;
  }, i.prototype.fill = function(n) {
    const e = ye(this.dom, n);
    for (let o = 0; o < e.length; o++) {
      const a = e[o], f = a.tagName === "SELECT" || a.type === "checkbox" || a.type === "radio";
      a.dispatchEvent(new Event(f ? "change" : "input", { bubbles: !0 }));
    }
  }, i.prototype.submit = function() {
    const n = this.dom.querySelectorAll("[" + d + "]");
    let e = !0;
    for (let a = 0; a < n.length; a++) {
      const f = n[a][h];
      f && (f.validate() || (e = !1));
    }
    if (!e) return;
    const o = ge(this.dom);
    A(this.dom, "ln-form:submit", { data: o });
  }, i.prototype.reset = function() {
    this.dom.reset();
    const n = this.dom.querySelectorAll("input, textarea, select");
    for (let e = 0; e < n.length; e++) {
      const o = n[e], a = o.tagName === "SELECT" || o.type === "checkbox" || o.type === "radio";
      o.dispatchEvent(new Event(a ? "change" : "input", { bubbles: !0 }));
    }
    this._resetValidation(), A(this.dom, "ln-form:reset-complete", { target: this.dom });
  }, i.prototype._resetValidation = function() {
    const n = this.dom.querySelectorAll("[" + d + "]");
    for (let e = 0; e < n.length; e++) {
      const o = n[e][h];
      o && o.reset();
    }
    this._updateSubmitButton();
  }, Object.defineProperty(i.prototype, "isValid", {
    get: function() {
      const n = this.dom.querySelectorAll("[" + d + "]");
      for (let e = 0; e < n.length; e++)
        if (!n[e].checkValidity()) return !1;
      return !0;
    }
  }), i.prototype.destroy = function() {
    this.dom[t] && (this.dom.removeEventListener("ln-validate:valid", this._onValid), this.dom.removeEventListener("ln-validate:invalid", this._onInvalid), this.dom.removeEventListener("submit", this._onSubmit), this.dom.removeEventListener("ln-form:fill", this._onFill), this.dom.removeEventListener("ln-form:reset", this._onFormReset), this.dom.removeEventListener("reset", this._onNativeReset), this._onAutoInput && (this.dom.removeEventListener("input", this._onAutoInput), this.dom.removeEventListener("change", this._onAutoInput)), clearTimeout(this._debounceTimer), A(this.dom, "ln-form:destroyed", { target: this.dom }), delete this.dom[t]);
  }, H(p, t, i, "ln-form");
})();
(function() {
  const p = "data-ln-time", t = "lnTime";
  if (window[t] !== void 0) return;
  const s = {}, r = {};
  function d(_) {
    return _.getAttribute("data-ln-time-locale") || document.documentElement.lang || void 0;
  }
  function h(_, k) {
    const x = (_ || "") + "|" + JSON.stringify(k);
    return s[x] || (s[x] = new Intl.DateTimeFormat(_, k)), s[x];
  }
  function i(_) {
    const k = _ || "";
    return r[k] || (r[k] = new Intl.RelativeTimeFormat(_, { numeric: "auto", style: "narrow" })), r[k];
  }
  const n = /* @__PURE__ */ new Set();
  let e = null;
  function o() {
    e || (e = setInterval(f, 6e4));
  }
  function a() {
    e && (clearInterval(e), e = null);
  }
  function f() {
    for (const _ of n) {
      if (!document.body.contains(_.dom)) {
        n.delete(_);
        continue;
      }
      m(_);
    }
    n.size === 0 && a();
  }
  function c(_, k) {
    return h(k, { dateStyle: "long", timeStyle: "short" }).format(_);
  }
  function y(_, k) {
    const x = /* @__PURE__ */ new Date(), q = { month: "short", day: "numeric" };
    return _.getFullYear() !== x.getFullYear() && (q.year = "numeric"), h(k, q).format(_);
  }
  function l(_, k) {
    return h(k, { dateStyle: "medium" }).format(_);
  }
  function u(_, k) {
    return h(k, { timeStyle: "short" }).format(_);
  }
  function g(_, k) {
    const x = Math.floor(Date.now() / 1e3), q = Math.floor(_.getTime() / 1e3) - x, I = Math.abs(q);
    if (I < 10) return i(k).format(0, "second");
    let T, P;
    if (I < 60)
      T = "second", P = q;
    else if (I < 3600)
      T = "minute", P = Math.round(q / 60);
    else if (I < 86400)
      T = "hour", P = Math.round(q / 3600);
    else if (I < 604800)
      T = "day", P = Math.round(q / 86400);
    else if (I < 2592e3)
      T = "week", P = Math.round(q / 604800);
    else
      return y(_, k);
    return i(k).format(P, T);
  }
  function m(_) {
    const k = _.dom.getAttribute("datetime");
    if (!k) return;
    const x = Number(k);
    if (isNaN(x)) return;
    const q = new Date(x * 1e3), I = _.dom.getAttribute(p) || "short", T = d(_.dom);
    let P;
    switch (I) {
      case "relative":
        P = g(q, T);
        break;
      case "full":
        P = c(q, T);
        break;
      case "date":
        P = l(q, T);
        break;
      case "time":
        P = u(q, T);
        break;
      default:
        P = y(q, T);
        break;
    }
    _.dom.textContent = P, I !== "full" && (_.dom.title = c(q, T));
  }
  function v(_) {
    return this.dom = _, m(this), _.getAttribute(p) === "relative" && (n.add(this), o()), this;
  }
  v.prototype.render = function() {
    m(this);
  }, v.prototype.destroy = function() {
    n.delete(this), n.size === 0 && a(), delete this.dom[t];
  };
  function b(_) {
    const k = _[t];
    k && (_.getAttribute(p) === "relative" ? (n.add(k), o()) : (n.delete(k), n.size === 0 && a()), m(k));
  }
  function E(_) {
    _.nodeType === 1 && _.hasAttribute && _.hasAttribute(p) && _[t] && m(_[t]);
  }
  H(p, t, v, "ln-time", {
    extraAttributes: ["datetime"],
    onAttributeChange: b,
    onInit: E
  });
})();
(function() {
  const p = "data-ln-data-store", t = "lnDataStore";
  if (window[t] !== void 0) return;
  const s = "ln_app_cache", r = "_meta", d = "1.0";
  let h = null, i = null;
  const n = {};
  function e() {
    try {
      return crypto.randomUUID();
    } catch {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (w) => {
        const S = Math.random() * 16 | 0;
        return (w === "x" ? S : S & 3 | 8).toString(16);
      });
    }
  }
  function o(w) {
    w && w.name === "QuotaExceededError" && A(document, "ln-store:quota-exceeded", { error: w });
  }
  function a() {
    const w = {};
    for (const S of document.querySelectorAll(`[${p}]`)) {
      const C = S.getAttribute(p);
      if (C) {
        const L = S.getAttribute("data-ln-data-store-indexes") || S.getAttribute("data-ln-store-indexes") || "";
        w[C] = {
          indexes: L.split(",").map((D) => D.trim()).filter(Boolean)
        };
      }
    }
    return w;
  }
  function f() {
    return i || (i = new Promise((w) => {
      if (typeof indexedDB > "u")
        return console.warn("[ln-data-store] IndexedDB not available — falling back to in-memory store"), w(null);
      const S = a(), C = Object.keys(S), L = indexedDB.open(s);
      L.onerror = () => {
        console.warn("[ln-data-store] IndexedDB open failed — falling back to in-memory store"), w(null);
      }, L.onsuccess = (D) => {
        const M = D.target.result, N = Array.from(M.objectStoreNames);
        if (!(!N.includes(r) || C.some((at) => !N.includes(at))))
          return c(M), h = M, w(M);
        const K = M.version;
        M.close();
        const X = indexedDB.open(s, K + 1);
        X.onblocked = () => {
          console.warn("[ln-data-store] Database upgrade blocked — waiting for other tabs to close connection");
        }, X.onerror = () => {
          console.warn("[ln-data-store] Database upgrade failed"), w(null);
        }, X.onupgradeneeded = (at) => {
          const lt = at.target.result;
          lt.objectStoreNames.contains(r) || lt.createObjectStore(r, { keyPath: "key" });
          for (const Ut of C)
            if (!lt.objectStoreNames.contains(Ut)) {
              const xe = lt.createObjectStore(Ut, { keyPath: "id" });
              for (const Jt of S[Ut].indexes)
                xe.createIndex(Jt, Jt, { unique: !1 });
            }
        }, X.onsuccess = (at) => {
          const lt = at.target.result;
          c(lt), h = lt, w(lt);
        };
      };
    }), i);
  }
  function c(w) {
    w.onversionchange = () => {
      w.close(), h = null, i = null;
    };
  }
  function y() {
    return h ? Promise.resolve(h) : (i = null, f());
  }
  async function l(w) {
    if (!Et() || !w) return w;
    const S = { ...w }, C = S.id, L = S._pending, D = await Me(S);
    return !D || !D.encrypted ? w : {
      id: C,
      _pending: L,
      encrypted: !0,
      iv: D.iv,
      data: D.data
    };
  }
  async function u(w) {
    return !w || !w.encrypted || !Et() ? w : Re(w);
  }
  const g = (w, S) => y().then((C) => C ? C.transaction(w, S).objectStore(w) : null);
  function m(w) {
    return new Promise((S, C) => {
      w.onsuccess = () => S(w.result), w.onerror = () => {
        o(w.error), C(w.error);
      };
    });
  }
  const v = (w) => g(w, "readonly").then((S) => S ? m(S.getAll()) : []).then((S) => Et() ? Promise.all(S.map((C) => u(C))) : S), b = (w, S) => g(w, "readonly").then((C) => C ? m(C.get(S)) : null).then((C) => C ? u(C) : null), E = (w, S) => (Et() ? l(S) : Promise.resolve(S)).then((C) => g(w, "readwrite").then((L) => L ? m(L.put(C)) : null)), _ = (w, S) => g(w, "readwrite").then((C) => C ? m(C.delete(S)) : null), k = (w) => g(w, "readwrite").then((S) => S ? m(S.clear()) : null), x = (w) => g(w, "readonly").then((S) => S ? m(S.count()) : 0), q = (w) => g(r, "readonly").then((S) => S ? m(S.get(w)) : null), I = (w, S) => g(r, "readwrite").then((C) => {
    if (C)
      return S.key = w, m(C.put(S));
  });
  function T(w) {
    this.dom = w, this._name = w.getAttribute(p);
    const S = w.getAttribute("data-ln-data-store-stale") || w.getAttribute("data-ln-store-stale"), C = parseInt(S, 10);
    this._staleThreshold = S === "never" || S === "-1" ? -1 : isNaN(C) ? 300 : C;
    const L = w.getAttribute("data-ln-data-store-search-fields") || w.getAttribute("data-ln-store-search-fields") || "";
    return this._searchFields = L.split(",").map((D) => D.trim()).filter(Boolean), this._handlers = null, this._pendingSnapshots = {}, this.isLoaded = !1, this.isSyncing = !1, this.lastSyncedAt = null, this.totalCount = 0, this.presenters = null, n[this._name] = this, P(this), $(this), this;
  }
  function P(w) {
    w._handlers = {
      create: (S) => F(w, S.detail),
      update: (S) => B(w, S.detail),
      delete: (S) => R(w, S.detail),
      "bulk-delete": (S) => U(w, S.detail)
    };
    for (const [S, C] of Object.entries(w._handlers))
      w.dom.addEventListener(`ln-store:request-${S}`, C);
  }
  function F(w, { data: S = {} } = {}) {
    const C = `_temp_${e()}`, L = { ...S, id: C, _pending: !0 };
    E(w._name, L).then(() => {
      w.totalCount++, A(w.dom, "ln-store:created", { store: w._name, record: L, tempId: C }), A(w.dom, "ln-store:request-remote-create", { tempId: C, data: S });
    });
  }
  function B(w, { id: S, data: C = {}, expected_version: L } = {}) {
    b(w._name, S).then((D) => {
      if (!D) throw new Error(`Record not found: ${S}`);
      w._pendingSnapshots[S] = { ...D };
      const M = { ...D, ...C, _pending: !0 };
      return E(w._name, M).then(() => {
        A(w.dom, "ln-store:updated", { store: w._name, record: M, previous: w._pendingSnapshots[S] }), A(w.dom, "ln-store:request-remote-update", { id: S, data: C, expected_version: L });
      });
    }).catch((D) => console.error("[ln-data-store] Optimistic update failed:", D));
  }
  function R(w, { id: S } = {}) {
    b(w._name, S).then((C) => {
      if (C)
        return w._pendingSnapshots[S] = { ...C }, _(w._name, S).then(() => {
          w.totalCount--, A(w.dom, "ln-store:deleted", { store: w._name, id: S }), A(w.dom, "ln-store:request-remote-delete", { id: S });
        });
    }).catch((C) => console.error("[ln-data-store] Optimistic delete failed:", C));
  }
  function U(w, { ids: S = [] } = {}) {
    S.length && Promise.all(S.map((C) => b(w._name, C))).then((C) => {
      const L = C.filter(Boolean), D = L.map((M) => M.id);
      return w._pendingSnapshots[D.join(",")] = L, O(w._name, D).then(() => {
        w.totalCount -= D.length, A(w.dom, "ln-store:deleted", { store: w._name, ids: D }), A(w.dom, "ln-store:request-remote-bulk-delete", { ids: D });
      });
    }).catch((C) => console.error("[ln-data-store] Optimistic bulk delete failed:", C));
  }
  function $(w) {
    f().then(() => q(w._name)).then((S) => {
      S && S.schema_version === d ? (w.lastSyncedAt = S.last_synced_at || null, w.totalCount = S.record_count || 0, w.totalCount > 0 ? (w.isLoaded = !0, A(w.dom, "ln-store:ready", { store: w._name, count: w.totalCount, source: "cache" }), rt(w) && Q(w)) : Q(w)) : S && S.schema_version !== d ? k(w._name).then(() => I(w._name, { schema_version: d, last_synced_at: null, record_count: 0 })).then(() => Q(w)) : Q(w);
    });
  }
  function rt(w) {
    return w._staleThreshold === -1 ? !1 : w.lastSyncedAt ? Math.floor(Date.now() / 1e3) - w.lastSyncedAt > w._staleThreshold : !0;
  }
  function Q(w) {
    w.isSyncing = !0, A(w.dom, "ln-store:request-remote-sync", { since: w.lastSyncedAt });
  }
  function st(w, S) {
    return y().then((C) => C ? (Et() ? Promise.all(S.map((L) => l(L))) : Promise.resolve(S)).then((L) => new Promise((D, M) => {
      const N = C.transaction(w, "readwrite"), K = N.objectStore(w);
      L.forEach((X) => K.put(X)), N.oncomplete = () => D(), N.onerror = () => {
        o(N.error), M(N.error);
      };
    })) : void 0);
  }
  function O(w, S) {
    return y().then((C) => {
      if (C)
        return new Promise((L, D) => {
          const M = C.transaction(w, "readwrite"), N = M.objectStore(w);
          S.forEach((K) => N.delete(K)), M.oncomplete = () => L(), M.onerror = () => D(M.error);
        });
    });
  }
  let j = () => {
    document.visibilityState === "visible" && Object.values(n).forEach((w) => {
      w.isLoaded && !w.isSyncing && rt(w) && Q(w);
    });
  };
  document.addEventListener("visibilitychange", j);
  const z = new Intl.Collator(void 0, { numeric: !0, sensitivity: "base" });
  function ft(w, S) {
    if (!S || !S.field) return w;
    const { field: C, direction: L } = S, D = L === "desc";
    return [...w].sort((M, N) => {
      const K = M[C], X = N[C];
      if (K == null && X == null) return 0;
      if (K == null) return D ? 1 : -1;
      if (X == null) return D ? -1 : 1;
      const at = typeof K == "string" && typeof X == "string" ? z.compare(K, X) : K < X ? -1 : K > X ? 1 : 0;
      return D ? -at : at;
    });
  }
  function bt(w, S) {
    if (!S) return w;
    const C = Object.keys(S).filter((L) => Array.isArray(S[L]) && S[L].length > 0);
    return C.length ? w.filter(
      (L) => C.every((D) => S[D].map(String).includes(String(L[D])))
    ) : w;
  }
  function tt(w, S, C) {
    if (!S || !C || !C.length) return w;
    const L = S.toLowerCase();
    return w.filter(
      (D) => C.some((M) => {
        const N = D[M];
        return N != null && String(N).toLowerCase().includes(L);
      })
    );
  }
  function _t(w, S, C) {
    if (!w.length) return 0;
    if (C === "count") return w.length;
    const L = w.map((M) => parseFloat(M[S])).filter((M) => !isNaN(M)), D = L.reduce((M, N) => M + N, 0);
    return C === "sum" ? D : C === "avg" && L.length ? D / L.length : 0;
  }
  function it(w, S) {
    if (!w.presenters || !w.presenters.computed) return S;
    const C = w.presenters.computed;
    return S.map((L) => {
      const D = { ...L };
      for (const [M, N] of Object.entries(C))
        try {
          D[M] = N(L);
        } catch (K) {
          console.error(`[ln-data-store] Decorator computed field failed for ${M}`, K);
        }
      return D;
    });
  }
  T.prototype.getAll = function(w = {}) {
    const S = this;
    return v(S._name).then((C) => {
      const L = C.length;
      w.filters && (C = bt(C, w.filters)), w.search && (C = tt(C, w.search, S._searchFields));
      const D = C.length;
      if (w.sort && (C = ft(C, w.sort)), w.offset || w.limit) {
        const M = w.offset || 0, N = w.limit || C.length;
        C = C.slice(M, M + N);
      }
      return {
        data: it(S, C),
        total: L,
        filtered: D
      };
    });
  }, T.prototype.getById = function(w) {
    return b(this._name, w).then((S) => S ? it(this, [S])[0] : null);
  }, T.prototype.count = function(w) {
    return w ? v(this._name).then((S) => bt(S, w).length) : x(this._name);
  }, T.prototype.aggregate = function(w, S) {
    return v(this._name).then((C) => _t(C, w, S));
  }, T.prototype.setPresenters = function(w) {
    this.presenters = w;
  }, T.prototype.applySync = function(w, S, C) {
    const L = this, D = w.length > 0 || S.length > 0;
    let M = Promise.resolve();
    return w.length > 0 && (M = M.then(() => st(L._name, w))), S.length > 0 && (M = M.then(() => O(L._name, S))), M.then(() => x(L._name)).then((N) => (L.totalCount = N, I(L._name, {
      schema_version: d,
      last_synced_at: C,
      record_count: N
    }))).then(() => {
      const N = !L.isLoaded;
      L.isLoaded = !0, L.isSyncing = !1, L.lastSyncedAt = C, N ? (A(L.dom, "ln-store:loaded", { store: L._name, count: L.totalCount }), A(L.dom, "ln-store:ready", { store: L._name, count: L.totalCount, source: "server" })) : A(L.dom, "ln-store:synced", {
        store: L._name,
        added: w.length,
        deleted: S.length,
        changed: D
      });
    }).catch((N) => {
      L.isSyncing = !1, console.error("[ln-data-store] applySync failed:", N);
    });
  }, T.prototype.confirmMutation = function(w, S, C) {
    const L = this, D = {
      create: () => _(L._name, w).then(() => E(L._name, S)).then(() => {
        delete L._pendingSnapshots[w], A(L.dom, "ln-store:confirmed", { store: L._name, record: S, tempId: w, action: "create" });
      }),
      update: () => E(L._name, S).then(() => {
        delete L._pendingSnapshots[w], A(L.dom, "ln-store:confirmed", { store: L._name, record: S, action: "update" });
      }),
      delete: () => (delete L._pendingSnapshots[w], A(L.dom, "ln-store:confirmed", { store: L._name, record: null, action: "delete" }), Promise.resolve()),
      "bulk-delete": () => (delete L._pendingSnapshots[w], A(L.dom, "ln-store:confirmed", { store: L._name, record: null, ids: w.split(","), action: "bulk-delete" }), Promise.resolve())
    };
    return D[C] ? D[C]() : Promise.resolve();
  }, T.prototype.revertMutation = function(w, S, C) {
    const L = this, D = C || `Server rejected ${S}`, M = {
      create: () => _(L._name, w).then(() => {
        L.totalCount--, delete L._pendingSnapshots[w], A(L.dom, "ln-store:reverted", { store: L._name, record: null, action: "create", error: D });
      }),
      update: () => {
        const N = L._pendingSnapshots[w];
        return N ? E(L._name, N).then(() => {
          delete L._pendingSnapshots[w], A(L.dom, "ln-store:reverted", { store: L._name, record: N, action: "update", error: D });
        }) : Promise.resolve();
      },
      delete: () => {
        const N = L._pendingSnapshots[w];
        return N ? E(L._name, N).then(() => {
          L.totalCount++, delete L._pendingSnapshots[w], A(L.dom, "ln-store:reverted", { store: L._name, record: N, action: "delete", error: D });
        }) : Promise.resolve();
      },
      "bulk-delete": () => {
        const N = L._pendingSnapshots[w];
        return !N || !N.length ? Promise.resolve() : st(L._name, N).then(() => {
          L.totalCount += N.length, delete L._pendingSnapshots[w], A(L.dom, "ln-store:reverted", { store: L._name, record: null, ids: w.split(","), action: "bulk-delete", error: D });
        });
      }
    };
    return M[S] ? M[S]() : Promise.resolve();
  }, T.prototype.resolveConflict = function(w, S, C) {
    const L = this._pendingSnapshots[w];
    return L ? E(this._name, L).then(() => {
      delete this._pendingSnapshots[w], A(this.dom, "ln-store:conflict", {
        store: this._name,
        local: L,
        remote: S,
        field_diffs: C || null
      });
    }) : Promise.resolve();
  }, T.prototype.forceSync = function() {
    Q(this);
  }, T.prototype.fullReload = function() {
    const w = this;
    return k(w._name).then(() => {
      w.isLoaded = !1, w.lastSyncedAt = null, w.totalCount = 0, Q(w);
    });
  }, T.prototype.destroy = function() {
    if (this._handlers) {
      for (const [w, S] of Object.entries(this._handlers))
        this.dom.removeEventListener(`ln-store:request-${w}`, S);
      this._handlers = null;
    }
    delete n[this._name], Object.keys(n).length === 0 && j && (document.removeEventListener("visibilitychange", j), j = null), delete this.dom[t], A(this.dom, "ln-store:destroyed", { store: this._name });
  };
  function wt() {
    return y().then((w) => {
      if (!w) return;
      const S = Array.from(w.objectStoreNames);
      return new Promise((C, L) => {
        const D = w.transaction(S, "readwrite");
        S.forEach((M) => D.objectStore(M).clear()), D.oncomplete = () => C(), D.onerror = () => L(D.error);
      });
    }).then(() => {
      Object.values(n).forEach((w) => {
        w.isLoaded = !1, w.isSyncing = !1, w.lastSyncedAt = null, w.totalCount = 0;
      });
    });
  }
  H(p, t, T, "ln-data-store"), window[t].clearAll = wt, window[t].init = window[t], window[t].setStorageKey = Zt, typeof window < "u" && (window.lnCore = window.lnCore || {}, window.lnCore.setStorageKey = Zt);
})();
(function() {
  const p = "data-ln-api-connector", t = "lnApiConnector", s = "lnConnector";
  if (window[t] !== void 0) return;
  function r(i) {
    return this.dom = i, i[t] = this, i[s] = this, this.refreshConfig(), this._handlers = null, d(this), this;
  }
  r.prototype.refreshConfig = function() {
    const i = this.dom;
    this.baseUrl = i.getAttribute("data-ln-api-base-url") || "", this.path = i.getAttribute("data-ln-api-path") || "", this.credentials = "same-origin";
    const n = i.getAttribute("data-ln-api-headers") || "";
    this.headers = ve(n, "ln-api-connector"), (n.toLowerCase().includes("authorization") || n.toLowerCase().includes("bearer") || n.toLowerCase().includes("basic")) && console.warn("[ln-api-connector] Security Warning: Sensitive authorization credentials detected in data-ln-api-headers attribute. Storing secrets in HTML DOM attributes is highly discouraged and vulnerable to XSS credential extraction. Please use HttpOnly session cookies or a Backend Proxy Gateway instead."), A(i, "ln-api-connector:config-changed", {
      baseUrl: this.baseUrl,
      path: this.path,
      headers: this.headers
    });
  }, r.prototype.fetchDelta = function(i) {
    const n = this;
    let e = V(n.baseUrl, n.path);
    return i != null && i !== "" && (e += (e.indexOf("?") !== -1 ? "&" : "?") + "since=" + encodeURIComponent(i)), window.fetch(e, { method: "GET", headers: Y(n.headers), credentials: n.credentials }).then((o) => {
      if (!o.ok) throw new Error("HTTP " + o.status + ": " + o.statusText);
      return o.json();
    });
  }, r.prototype.create = function(i) {
    const n = this;
    return window.fetch(V(n.baseUrl, n.path), {
      method: "POST",
      headers: Y(n.headers),
      credentials: n.credentials,
      body: JSON.stringify(i)
    }).then((e) => {
      if (!e.ok) throw new Error("HTTP " + e.status + ": " + e.statusText);
      return e.json();
    });
  }, r.prototype.update = function(i, n) {
    const e = this;
    return window.fetch(V(e.baseUrl, e.path, i), {
      method: "PUT",
      headers: Y(e.headers),
      credentials: e.credentials,
      body: JSON.stringify(n)
    }).then((o) => {
      if (o.ok) return o.json();
      if (o.status === 409) return o.json().then((a) => {
        const f = new Error("Conflict");
        throw f.status = 409, f.data = a, f;
      });
      throw new Error("HTTP " + o.status + ": " + o.statusText);
    });
  }, r.prototype.delete = function(i) {
    const n = this;
    return window.fetch(V(n.baseUrl, n.path, i), {
      method: "DELETE",
      headers: Y(n.headers),
      credentials: n.credentials
    }).then((e) => {
      if (!e.ok) throw new Error("HTTP " + e.status + ": " + e.statusText);
      return e.json();
    });
  }, r.prototype.bulkDelete = function(i) {
    const n = this;
    return window.fetch(V(n.baseUrl, n.path) + "/bulk-delete", {
      method: "DELETE",
      headers: Y(n.headers),
      credentials: n.credentials,
      body: JSON.stringify({ ids: i })
    }).then((e) => {
      if (!e.ok) throw new Error("HTTP " + e.status + ": " + e.statusText);
      return e.json();
    });
  };
  function d(i) {
    i._handlers = {
      sync: function(n) {
        const e = n.detail || {};
        i.fetchDelta(e.since).then(function(o) {
          A(i.dom, "ln-api-connector:fetched", { data: o, since: e.since });
        }).catch(function(o) {
          A(i.dom, "ln-api-connector:error", {
            action: "sync",
            error: o.message,
            status: o.status || 0,
            since: e.since
          });
        });
      },
      create: function(n) {
        const e = n.detail || {};
        i.create(e.data).then(function(o) {
          A(i.dom, "ln-api-connector:created", { record: o, tempId: e.tempId });
        }).catch(function(o) {
          A(i.dom, "ln-api-connector:error", {
            action: "create",
            error: o.message,
            status: o.status || 0,
            tempId: e.tempId
          });
        });
      },
      update: function(n) {
        const e = n.detail || {}, o = Object.assign({}, e.data);
        e.expected_version !== void 0 && (o.expected_version = e.expected_version), i.update(e.id, o).then(function(a) {
          A(i.dom, "ln-api-connector:updated", { record: a, id: e.id });
        }).catch(function(a) {
          A(i.dom, "ln-api-connector:error", {
            action: "update",
            error: a.message,
            status: a.status || 0,
            id: e.id,
            conflictData: a.status === 409 ? a.data : null
          });
        });
      },
      delete: function(n) {
        const e = n.detail || {};
        i.delete(e.id).then(function(o) {
          A(i.dom, "ln-api-connector:deleted", { response: o, id: e.id });
        }).catch(function(o) {
          A(i.dom, "ln-api-connector:error", {
            action: "delete",
            error: o.message,
            status: o.status || 0,
            id: e.id
          });
        });
      },
      bulkDelete: function(n) {
        const e = n.detail || {};
        i.bulkDelete(e.ids).then(function(o) {
          A(i.dom, "ln-api-connector:bulk-deleted", { response: o, ids: e.ids });
        }).catch(function(o) {
          A(i.dom, "ln-api-connector:error", {
            action: "bulk-delete",
            error: o.message,
            status: o.status || 0,
            ids: e.ids
          });
        });
      }
    }, ["ln-api-connector", "ln-rest-connector"].forEach(function(n) {
      i.dom.addEventListener(n + ":request-sync", i._handlers.sync), i.dom.addEventListener(n + ":request-fetch", i._handlers.sync), i.dom.addEventListener(n + ":request-create", i._handlers.create), i.dom.addEventListener(n + ":request-update", i._handlers.update), i.dom.addEventListener(n + ":request-delete", i._handlers.delete), i.dom.addEventListener(n + ":request-bulk-delete", i._handlers.bulkDelete);
    });
  }
  r.prototype.destroy = function() {
    if (!this.dom[t]) return;
    const i = this;
    i._handlers && (["ln-api-connector", "ln-rest-connector"].forEach(function(n) {
      i.dom.removeEventListener(n + ":request-sync", i._handlers.sync), i.dom.removeEventListener(n + ":request-fetch", i._handlers.sync), i.dom.removeEventListener(n + ":request-create", i._handlers.create), i.dom.removeEventListener(n + ":request-update", i._handlers.update), i.dom.removeEventListener(n + ":request-delete", i._handlers.delete), i.dom.removeEventListener(n + ":request-bulk-delete", i._handlers.bulkDelete);
    }), i._handlers = null), A(this.dom, "ln-api-connector:destroyed", { target: this.dom }), delete this.dom[t], delete this.dom[s];
  };
  function h(i) {
    const n = i[t];
    n && n.refreshConfig();
  }
  H(p, t, r, "ln-api-connector", {
    extraAttributes: [
      "data-ln-api-base-url",
      "data-ln-api-path",
      "data-ln-api-headers"
    ],
    onAttributeChange: h
  });
})();
(function() {
  const p = "data-ln-couchdb-connector", t = "lnCouchDbConnector", s = "lnConnector";
  if (window[t] !== void 0) return;
  function r(i) {
    return this.dom = i, i[t] = this, i[s] = this, this.refreshConfig(), this._handlers = null, d(this), this;
  }
  r.prototype.refreshConfig = function() {
    const i = this.dom;
    this.url = i.getAttribute("data-ln-couchdb-url") || "", this.db = i.getAttribute("data-ln-couchdb-db") || "", this.auth = i.getAttribute("data-ln-couchdb-auth") || "", this.credentials = "same-origin";
    const n = i.getAttribute("data-ln-couchdb-headers") || "";
    this.headers = ve(n, "ln-couchdb-connector"), this.auth && console.warn("[ln-couchdb-connector] Security Warning: Sensitive authorization credentials detected in data-ln-couchdb-auth attribute. Storing basic authentication credentials in HTML DOM attributes is highly discouraged and vulnerable to XSS credential extraction. Please use HttpOnly session cookies or a Backend Proxy Gateway instead."), n.toLowerCase().includes("authorization") && console.warn("[ln-couchdb-connector] Security Warning: Sensitive authorization credentials detected in data-ln-couchdb-headers attribute. Please use HttpOnly session cookies or a Backend Proxy Gateway instead."), A(i, "ln-couchdb-connector:config-changed", {
      url: this.url,
      db: this.db,
      auth: this.auth ? "[REDACTED]" : "",
      headers: this.headers
    });
  }, r.prototype.fetchDelta = function(i) {
    const n = this, e = ["include_docs=true", "feed=normal"];
    i && e.push("since=" + encodeURIComponent(i));
    const o = V(n.url, n.db, "_changes") + "?" + e.join("&");
    return window.fetch(o, { method: "GET", headers: Y(n.headers, n.auth), credentials: n.credentials }).then((a) => {
      if (!a.ok) throw new Error("HTTP " + a.status + ": " + a.statusText);
      return a.json();
    }).then((a) => {
      const f = a.results || [];
      return {
        data: f.filter((c) => !c.deleted && c.doc).map((c) => Object.assign({}, c.doc, { id: c.doc._id })),
        deleted: f.filter((c) => c.deleted).map((c) => c.id),
        synced_at: a.last_seq || i || ""
      };
    });
  }, r.prototype.create = function(i) {
    const n = this, e = Object.assign({ _id: i.id }, i);
    return e._id || delete e._id, window.fetch(V(n.url, n.db), {
      method: "POST",
      headers: Y(n.headers, n.auth),
      credentials: n.credentials,
      body: JSON.stringify(e)
    }).then((o) => {
      if (!o.ok) throw new Error("HTTP " + o.status + ": " + o.statusText);
      return o.json();
    }).then((o) => Object.assign({}, e, { id: o.id, _id: o.id, _rev: o.rev }));
  }, r.prototype.update = function(i, n) {
    const e = this, o = Object.assign({ id: String(i), _id: String(i) }, n), a = o._rev || o.rev;
    return (a ? Promise.resolve(a) : window.fetch(V(e.url, e.db, null, i), { method: "GET", headers: Y(e.headers, e.auth), credentials: e.credentials }).then((f) => {
      if (!f.ok) throw new Error("Could not retrieve document for revision mapping");
      return f.json().then((c) => c._rev);
    })).then((f) => {
      const c = Object.assign({}, o, { _rev: f });
      delete c.rev;
      const y = Object.assign(Y(e.headers, e.auth), { "If-Match": f });
      return window.fetch(V(e.url, e.db, null, i), {
        method: "PUT",
        headers: y,
        credentials: e.credentials,
        body: JSON.stringify(c)
      }).then((l) => {
        if (l.ok) return l.json().then((u) => Object.assign({}, c, { _rev: u.rev }));
        if (l.status === 409) return l.json().then((u) => {
          const g = new Error("Conflict");
          throw g.status = 409, g.data = u, g;
        });
        throw new Error("HTTP " + l.status + ": " + l.statusText);
      });
    });
  }, r.prototype.delete = function(i, n) {
    const e = this;
    return (n ? Promise.resolve(n) : window.fetch(V(e.url, e.db, null, i), { method: "GET", headers: Y(e.headers, e.auth), credentials: e.credentials }).then((o) => {
      if (!o.ok) throw new Error("Could not retrieve document for revision delete");
      return o.json().then((a) => a._rev);
    })).then((o) => {
      const a = V(e.url, e.db, null, i) + "?rev=" + encodeURIComponent(o);
      return window.fetch(a, { method: "DELETE", headers: Y(e.headers, e.auth), credentials: e.credentials }).then((f) => {
        if (!f.ok) throw new Error("HTTP " + f.status + ": " + f.statusText);
        return f.json();
      });
    });
  }, r.prototype.bulkDelete = function(i) {
    const n = this;
    return !i || i.length === 0 ? Promise.resolve({ ok: !0, deletedCount: 0 }) : window.fetch(V(n.url, n.db, "_all_docs"), {
      method: "POST",
      headers: Y(n.headers, n.auth),
      credentials: n.credentials,
      body: JSON.stringify({ keys: i })
    }).then((e) => {
      if (!e.ok) throw new Error("HTTP " + e.status + ": " + e.statusText);
      return e.json();
    }).then((e) => {
      const o = (e.rows || []).filter((a) => !a.error && a.value && a.value.rev).map((a) => ({ _id: a.id, _rev: a.value.rev, _deleted: !0 }));
      return o.length === 0 ? { ok: !0, deletedCount: 0 } : window.fetch(V(n.url, n.db, "_bulk_docs"), {
        method: "POST",
        headers: Y(n.headers, n.auth),
        credentials: n.credentials,
        body: JSON.stringify({ docs: o })
      }).then((a) => {
        if (!a.ok) throw new Error("HTTP " + a.status + ": " + a.statusText);
        return a.json();
      }).then((a) => ({ ok: !0, results: a, deletedCount: o.length }));
    });
  };
  function d(i) {
    i._handlers = {
      sync: function(n) {
        const e = n.detail || {};
        i.fetchDelta(e.since).then(function(o) {
          A(i.dom, "ln-couchdb-connector:fetched", { data: o, since: e.since });
        }).catch(function(o) {
          A(i.dom, "ln-couchdb-connector:error", {
            action: "sync",
            error: o.message,
            status: o.status || 0,
            since: e.since
          });
        });
      },
      create: function(n) {
        const e = n.detail || {};
        i.create(e.data).then(function(o) {
          A(i.dom, "ln-couchdb-connector:created", { record: o, tempId: e.tempId });
        }).catch(function(o) {
          A(i.dom, "ln-couchdb-connector:error", {
            action: "create",
            error: o.message,
            status: o.status || 0,
            tempId: e.tempId
          });
        });
      },
      update: function(n) {
        const e = n.detail || {}, o = Object.assign({}, e.data);
        e.expected_version !== void 0 && (o._rev = e.expected_version), i.update(e.id, o).then(function(a) {
          A(i.dom, "ln-couchdb-connector:updated", { record: a, id: e.id });
        }).catch(function(a) {
          A(i.dom, "ln-couchdb-connector:error", {
            action: "update",
            error: a.message,
            status: a.status || 0,
            id: e.id,
            conflictData: a.status === 409 ? a.data : null
          });
        });
      },
      delete: function(n) {
        const e = n.detail || {};
        i.delete(e.id, e.rev).then(function(o) {
          A(i.dom, "ln-couchdb-connector:deleted", { response: o, id: e.id });
        }).catch(function(o) {
          A(i.dom, "ln-couchdb-connector:error", {
            action: "delete",
            error: o.message,
            status: o.status || 0,
            id: e.id
          });
        });
      },
      bulkDelete: function(n) {
        const e = n.detail || {};
        i.bulkDelete(e.ids).then(function(o) {
          A(i.dom, "ln-couchdb-connector:bulk-deleted", { response: o, ids: e.ids });
        }).catch(function(o) {
          A(i.dom, "ln-couchdb-connector:error", {
            action: "bulk-delete",
            error: o.message,
            status: o.status || 0,
            ids: e.ids
          });
        });
      }
    }, ["ln-couchdb-connector", "ln-api-connector", "ln-rest-connector"].forEach(function(n) {
      i.dom.addEventListener(n + ":request-sync", i._handlers.sync), i.dom.addEventListener(n + ":request-fetch", i._handlers.sync), i.dom.addEventListener(n + ":request-create", i._handlers.create), i.dom.addEventListener(n + ":request-update", i._handlers.update), i.dom.addEventListener(n + ":request-delete", i._handlers.delete), i.dom.addEventListener(n + ":request-bulk-delete", i._handlers.bulkDelete);
    });
  }
  r.prototype.destroy = function() {
    if (!this.dom[t]) return;
    const i = this;
    i._handlers && (["ln-couchdb-connector", "ln-api-connector", "ln-rest-connector"].forEach(function(n) {
      i.dom.removeEventListener(n + ":request-sync", i._handlers.sync), i.dom.removeEventListener(n + ":request-fetch", i._handlers.sync), i.dom.removeEventListener(n + ":request-create", i._handlers.create), i.dom.removeEventListener(n + ":request-update", i._handlers.update), i.dom.removeEventListener(n + ":request-delete", i._handlers.delete), i.dom.removeEventListener(n + ":request-bulk-delete", i._handlers.bulkDelete);
    }), i._handlers = null), A(this.dom, "ln-couchdb-connector:destroyed", { target: this.dom }), delete this.dom[t], delete this.dom[s];
  };
  function h(i) {
    const n = i[t];
    n && n.refreshConfig();
  }
  H(p, t, r, "ln-couchdb-connector", {
    extraAttributes: [
      "data-ln-couchdb-url",
      "data-ln-couchdb-db",
      "data-ln-couchdb-auth",
      "data-ln-couchdb-headers"
    ],
    onAttributeChange: h
  });
})();
(function() {
  const p = "data-ln-data-coordinator", t = "lnDataCoordinator", s = "lnCoordinator";
  if (window[t] !== void 0) return;
  function r(i) {
    return this.dom = i, this._name = i.getAttribute(p), i[t] = this, i[s] = this, this.mapper = null, this._handlers = null, this.refreshMapper(), d(this), this;
  }
  r.prototype.refreshMapper = function() {
    this.mapper = null, this.dom.querySelector("script[data-ln-mapper]") && console.error("[ln-data-coordinator] Security Error: Inline script mappers using <script data-ln-mapper> are deprecated and disabled due to XSS vulnerability risks (unsafe-eval). Please register your mappers securely via window.lnCore.registerDataMapper() instead.");
    const i = this.dom.getAttribute("data-ln-data-mapper") || this.dom.getAttribute("data-ln-data-coordinator");
    i && window.lnCore && typeof window.lnCore.getDataMapper == "function" && (this.mapper = window.lnCore.getDataMapper(i)), this.mapper || (this.mapper = {}), typeof this.mapper.ingress != "function" && (this.mapper.ingress = function(n) {
      return n;
    }), typeof this.mapper.egress != "function" && (this.mapper.egress = function(n) {
      return n;
    });
  }, r.prototype.findChildren = function() {
    const i = this.dom.querySelector("[data-ln-data-store]"), n = this.dom.querySelector("[data-ln-api-connector], [data-ln-couchdb-connector], [data-ln-websocket-connector], [data-ln-rest-connector]");
    return {
      storeEl: i,
      connectorEl: n,
      store: i ? i.lnDataStore || i.lnStore : null,
      connector: n ? n.lnConnector || n.lnApiConnector || n.lnCouchDbConnector : null
    };
  };
  function d(i) {
    i._handlers = {
      sync: function(n) {
        i.refreshMapper();
        const e = i.findChildren();
        if (!e.store || !e.connector) {
          console.warn("[ln-data-coordinator] Cannot sync: store or connector not found in subtree");
          return;
        }
        const o = n.detail.since;
        e.connector.fetchDelta(o).then(function(a) {
          let f = [], c = [], y = null;
          a && Array.isArray(a) ? (f = a, y = Math.floor(Date.now() / 1e3)) : a && (f = Array.isArray(a.data) ? a.data : [], c = Array.isArray(a.deleted) ? a.deleted : [], y = a.synced_at !== void 0 ? a.synced_at : a.since !== void 0 ? a.since : null);
          const l = f.map((u) => i.mapper.ingress(u));
          e.store.applySync(l, c, y);
        }).catch(function(a) {
          console.error("[ln-data-coordinator] Sync failed:", a);
        });
      },
      create: function(n) {
        i.refreshMapper();
        const e = i.findChildren();
        if (!e.store || !e.connector) return;
        const o = n.detail.tempId, a = n.detail.data || {}, f = i.mapper.egress(a);
        e.connector.create(f).then(function(c) {
          const y = i.mapper.ingress(c);
          e.store.confirmMutation(o, y, "create");
        }).catch(function(c) {
          console.error("[ln-data-coordinator] Create mutation failed:", c), e.store.revertMutation(o, "create", c.message || c);
        });
      },
      update: function(n) {
        i.refreshMapper();
        const e = i.findChildren();
        if (!e.store || !e.connector) return;
        const o = n.detail.id, a = n.detail.expected_version;
        e.store.getById(o).then(function(f) {
          if (!f) throw new Error("Record not found in cache store: " + o);
          const c = Object.assign({}, f);
          delete c._pending;
          const y = i.mapper.egress(c);
          return e.connector.update(o, y, a);
        }).then(function(f) {
          const c = i.mapper.ingress(f);
          e.store.confirmMutation(o, c, "update");
        }).catch(function(f) {
          if (console.error("[ln-data-coordinator] Update mutation failed:", f), f.status === 409) {
            const c = f.data && f.data.remote ? i.mapper.ingress(f.data.remote) : null, y = f.data ? f.data.field_diffs : null;
            e.store.resolveConflict(o, c, y);
          } else
            e.store.revertMutation(o, "update", f.message || f);
        });
      },
      delete: function(n) {
        i.refreshMapper();
        const e = i.findChildren();
        if (!e.store || !e.connector) return;
        const o = n.detail.id;
        e.connector.delete(o).then(function() {
          e.store.confirmMutation(o, null, "delete");
        }).catch(function(a) {
          console.error("[ln-data-coordinator] Delete mutation failed:", a), e.store.revertMutation(o, "delete", a.message || a);
        });
      },
      bulkDelete: function(n) {
        i.refreshMapper();
        const e = i.findChildren();
        if (!e.store || !e.connector) return;
        const o = n.detail.ids || [], a = o.join(",");
        e.connector.bulkDelete(o).then(function() {
          e.store.confirmMutation(a, null, "bulk-delete");
        }).catch(function(f) {
          console.error("[ln-data-coordinator] Bulk delete mutation failed:", f), e.store.revertMutation(a, "bulk-delete", f.message || f);
        });
      }
    }, i.dom.addEventListener("ln-store:request-remote-sync", i._handlers.sync), i.dom.addEventListener("ln-store:request-remote-create", i._handlers.create), i.dom.addEventListener("ln-store:request-remote-update", i._handlers.update), i.dom.addEventListener("ln-store:request-remote-delete", i._handlers.delete), i.dom.addEventListener("ln-store:request-remote-bulk-delete", i._handlers.bulkDelete);
  }
  r.prototype.destroy = function() {
    if (!this.dom[t]) return;
    const i = this;
    i._handlers && (i.dom.removeEventListener("ln-store:request-remote-sync", i._handlers.sync), i.dom.removeEventListener("ln-store:request-remote-create", i._handlers.create), i.dom.removeEventListener("ln-store:request-remote-update", i._handlers.update), i.dom.removeEventListener("ln-store:request-remote-delete", i._handlers.delete), i.dom.removeEventListener("ln-store:request-remote-bulk-delete", i._handlers.bulkDelete), i._handlers = null), delete this.dom[t], delete this.dom[s];
  };
  function h(i, n) {
    const e = i[t];
    e && n === "data-ln-data-mapper" && e.refreshMapper();
  }
  H(p, t, r, "ln-data-coordinator", {
    extraAttributes: [
      "data-ln-data-mapper"
    ],
    onAttributeChange: h
  });
})();
(function() {
  const p = "data-ln-data-table", t = "lnDataTable";
  if (window[t] !== void 0) return;
  const s = typeof Intl < "u" ? new Intl.NumberFormat(document.documentElement.lang || void 0) : null;
  function r(n) {
    return s ? s.format(n) : String(n);
  }
  function d(n) {
    let e = n.parentElement;
    for (; e && e !== document.body && e !== document.documentElement; ) {
      const o = getComputedStyle(e).overflowY;
      if (o === "auto" || o === "scroll") return e;
      e = e.parentElement;
    }
    return null;
  }
  function h(n) {
    this.dom = n, this.name = n.getAttribute(p) || "", this.table = n.querySelector("table"), this.tbody = n.querySelector("[data-ln-data-table-body]") || n.querySelector("tbody"), this.thead = n.querySelector("thead"), this.ths = this.thead ? Array.from(this.thead.querySelectorAll("th")) : [], this.isLoaded = !1, this.totalCount = 0, this.visibleCount = 0, this.currentSort = null, this.currentFilters = {}, this.currentSearch = "", this.selectedIds = /* @__PURE__ */ new Set(), this._data = [], this._lastTotal = 0, this._lastFiltered = 0, this._filterOptions = {}, this._filterableFields = this.ths.filter(function(o) {
      return o.getAttribute("data-ln-col") && o.querySelector("[data-ln-col-filter]");
    }).map(function(o) {
      return o.getAttribute("data-ln-col");
    }), this._virtual = !1, this._rowHeight = 0, this._vStart = -1, this._vEnd = -1, this._rafId = null, this._scrollHandler = null, this._scrollContainer = null, this._totalSpan = n.querySelector("[data-ln-data-table-total]"), this._filteredSpan = n.querySelector("[data-ln-data-table-filtered]"), this._filteredSpan && (this._filteredWrap = this._filteredSpan.parentElement !== n ? this._filteredSpan.closest("[data-ln-data-table-filtered-wrap]") || this._filteredSpan.parentNode : null), this._selectedSpan = n.querySelector("[data-ln-data-table-selected]"), this._selectedSpan && (this._selectedWrap = this._selectedSpan.parentElement !== n ? this._selectedSpan.closest("[data-ln-data-table-selected-wrap]") || this._selectedSpan.parentNode : null);
    const e = this;
    return this._onSetData = function(o) {
      const a = o.detail || {};
      e._data = a.data || [], e._lastTotal = a.total != null ? a.total : e._data.length, e._lastFiltered = a.filtered != null ? a.filtered : e._data.length, e.totalCount = e._lastTotal, e.visibleCount = e._lastFiltered, e.isLoaded = !0, e._updateFilterOptions(a.filterOptions), e._vStart = -1, e._vEnd = -1, e._renderRows(), e._updateFooter(), A(n, "ln-data-table:rendered", {
        table: e.name,
        total: e.totalCount,
        visible: e.visibleCount
      });
    }, n.addEventListener("ln-data-table:set-data", this._onSetData), this._onSetLoading = function(o) {
      const a = o.detail && o.detail.loading;
      n.classList.toggle("ln-data-table--loading", !!a), a && (e.isLoaded = !1);
    }, n.addEventListener("ln-data-table:set-loading", this._onSetLoading), this._sortButtons = Array.from(n.querySelectorAll("[data-ln-col-sort]")), this._onSortClick = function(o) {
      const a = o.target.closest("[data-ln-col-sort]");
      if (!a) return;
      const f = a.closest("th");
      if (!f) return;
      const c = f.getAttribute("data-ln-col");
      c && e._handleSort(c, f);
    }, this.thead && this.thead.addEventListener("click", this._onSortClick), this._activeDropdown = null, this._onFilterClick = function(o) {
      const a = o.target.closest("[data-ln-col-filter]");
      if (!a) return;
      o.stopPropagation();
      const f = a.closest("th");
      if (!f) return;
      const c = f.getAttribute("data-ln-col");
      if (c) {
        if (e._activeDropdown && e._activeDropdown.field === c) {
          e._closeFilterDropdown();
          return;
        }
        e._openFilterDropdown(c, f, a);
      }
    }, this.thead && this.thead.addEventListener("click", this._onFilterClick), this._onDocClick = function() {
      e._activeDropdown && e._closeFilterDropdown();
    }, document.addEventListener("click", this._onDocClick), this._onClearAll = function(o) {
      o.target.closest("[data-ln-data-table-clear-all]") && (e.currentFilters = {}, e._updateFilterIndicators(), A(n, "ln-data-table:clear-filters", { table: e.name }), e._requestData());
    }, n.addEventListener("click", this._onClearAll), this._selectable = n.hasAttribute("data-ln-data-table-selectable"), this._selectableActive = !1, this._selectable && this._enableSelection(), this._onRowClick = function(o) {
      if (o.target.closest("[data-ln-row-select]") || o.target.closest("[data-ln-row-action]") || o.target.closest("a") || o.target.closest("button") || o.ctrlKey || o.metaKey || o.button === 1) return;
      const a = o.target.closest("[data-ln-row]");
      if (!a) return;
      const f = a.getAttribute("data-ln-row-id"), c = a._lnRecord || {};
      A(n, "ln-data-table:row-click", {
        table: e.name,
        id: f,
        record: c
      });
    }, this.tbody && this.tbody.addEventListener("click", this._onRowClick), this._onRowAction = function(o) {
      const a = o.target.closest("[data-ln-row-action]");
      if (!a) return;
      o.stopPropagation();
      const f = a.closest("[data-ln-row]");
      if (!f) return;
      const c = a.getAttribute("data-ln-row-action"), y = f.getAttribute("data-ln-row-id"), l = f._lnRecord || {};
      A(n, "ln-data-table:row-action", {
        table: e.name,
        id: y,
        action: c,
        record: l
      });
    }, this.tbody && this.tbody.addEventListener("click", this._onRowAction), this._searchInput = n.querySelector("[data-ln-data-table-search]"), this._searchInput && (this._onSearchInput = function() {
      e.currentSearch = e._searchInput.value, A(n, "ln-data-table:search", {
        table: e.name,
        query: e.currentSearch
      }), e._requestData();
    }, this._searchInput.addEventListener("input", this._onSearchInput)), this._focusedRowIndex = -1, this._onKeydown = function(o) {
      if (!n.contains(document.activeElement) && document.activeElement !== document.body || document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) return;
      if (o.key === "/") {
        e._searchInput && (o.preventDefault(), e._searchInput.focus());
        return;
      }
      const a = e.tbody ? Array.from(e.tbody.querySelectorAll("[data-ln-row]")) : [];
      if (a.length)
        switch (o.key) {
          case "ArrowDown":
            o.preventDefault(), e._focusedRowIndex = Math.min(e._focusedRowIndex + 1, a.length - 1), e._focusRow(a);
            break;
          case "ArrowUp":
            o.preventDefault(), e._focusedRowIndex = Math.max(e._focusedRowIndex - 1, 0), e._focusRow(a);
            break;
          case "Home":
            o.preventDefault(), e._focusedRowIndex = 0, e._focusRow(a);
            break;
          case "End":
            o.preventDefault(), e._focusedRowIndex = a.length - 1, e._focusRow(a);
            break;
          case "Enter":
            if (e._focusedRowIndex >= 0 && e._focusedRowIndex < a.length) {
              o.preventDefault();
              const f = a[e._focusedRowIndex];
              A(n, "ln-data-table:row-click", {
                table: e.name,
                id: f.getAttribute("data-ln-row-id"),
                record: f._lnRecord || {}
              });
            }
            break;
          case " ":
            if (e._selectable && e._focusedRowIndex >= 0 && e._focusedRowIndex < a.length) {
              o.preventDefault();
              const f = a[e._focusedRowIndex].querySelector("[data-ln-row-select]");
              f && (f.checked = !f.checked, f.dispatchEvent(new Event("change", { bubbles: !0 })));
            }
            break;
          case "Escape":
            e._activeDropdown && e._closeFilterDropdown();
            break;
        }
    }, document.addEventListener("keydown", this._onKeydown), A(n, "ln-data-table:request-data", {
      table: this.name,
      sort: this.currentSort,
      filters: this.currentFilters,
      search: this.currentSearch
    }), this;
  }
  h.prototype._handleSort = function(n, e) {
    let o;
    !this.currentSort || this.currentSort.field !== n ? o = "asc" : this.currentSort.direction === "asc" ? o = "desc" : o = null;
    for (let a = 0; a < this.ths.length; a++)
      this.ths[a].classList.remove("ln-sort-asc", "ln-sort-desc");
    o ? (this.currentSort = { field: n, direction: o }, e.classList.add(o === "asc" ? "ln-sort-asc" : "ln-sort-desc")) : this.currentSort = null, A(this.dom, "ln-data-table:sort", {
      table: this.name,
      field: n,
      direction: o
    }), this._requestData();
  }, h.prototype._requestData = function() {
    A(this.dom, "ln-data-table:request-data", {
      table: this.name,
      sort: this.currentSort,
      filters: this.currentFilters,
      search: this.currentSearch
    });
  }, h.prototype._updateSelectAll = function() {
    if (!this._selectAllCheckbox || !this.tbody) return;
    const n = this.tbody.querySelectorAll("[data-ln-row]");
    let e = n.length > 0;
    for (let o = 0; o < n.length; o++) {
      const a = n[o].getAttribute("data-ln-row-id");
      if (a != null && !this.selectedIds.has(a)) {
        e = !1;
        break;
      }
    }
    this._selectAllCheckbox.checked = e;
  }, Object.defineProperty(h.prototype, "selectedCount", {
    get: function() {
      return this.selectedIds.size;
    },
    set: function() {
    }
  }), h.prototype._enableSelection = function() {
    if (this._selectableActive) return;
    this._selectableActive = !0;
    const n = this;
    if (this._onSelectionChange = function(e) {
      const o = e.target.closest("[data-ln-row-select]");
      if (!o) return;
      const a = o.closest("[data-ln-row]");
      if (!a) return;
      const f = a.getAttribute("data-ln-row-id");
      f != null && (o.checked ? (n.selectedIds.add(f), a.classList.add("ln-row-selected")) : (n.selectedIds.delete(f), a.classList.remove("ln-row-selected")), n.selectedCount = n.selectedIds.size, n._updateSelectAll(), n._updateFooter(), A(n.dom, "ln-data-table:select", {
        table: n.name,
        selectedIds: n.selectedIds,
        count: n.selectedCount
      }));
    }, this.tbody && this.tbody.addEventListener("change", this._onSelectionChange), this._selectAllCheckbox = this.dom.querySelector('[data-ln-col-select] input[type="checkbox"]') || this.dom.querySelector("[data-ln-col-select]"), this._selectAllCheckbox && this._selectAllCheckbox.tagName === "TH") {
      const e = document.createElement("input");
      e.type = "checkbox", e.setAttribute("aria-label", "Select all"), this._selectAllCheckbox.appendChild(e), this._selectAllCheckbox = e;
    }
    if (this._selectAllCheckbox && (this._onSelectAll = function() {
      const e = n._selectAllCheckbox.checked, o = n.tbody ? n.tbody.querySelectorAll("[data-ln-row]") : [];
      for (let a = 0; a < o.length; a++) {
        const f = o[a].getAttribute("data-ln-row-id"), c = o[a].querySelector("[data-ln-row-select]");
        f != null && (e ? (n.selectedIds.add(f), o[a].classList.add("ln-row-selected")) : (n.selectedIds.delete(f), o[a].classList.remove("ln-row-selected")), c && (c.checked = e));
      }
      n.selectedCount = n.selectedIds.size, A(n.dom, "ln-data-table:select-all", {
        table: n.name,
        selected: e
      }), A(n.dom, "ln-data-table:select", {
        table: n.name,
        selectedIds: n.selectedIds,
        count: n.selectedCount
      }), n._updateFooter();
    }, this._selectAllCheckbox.addEventListener("change", this._onSelectAll)), this.tbody) {
      const e = this.tbody.querySelectorAll("[data-ln-row]");
      for (let o = 0; o < e.length; o++) {
        const a = e[o].querySelector("[data-ln-row-select]"), f = e[o].getAttribute("data-ln-row-id");
        a && a.checked && f != null && (this.selectedIds.add(f), e[o].classList.add("ln-row-selected"));
      }
      this.selectedCount = this.selectedIds.size, this.selectedCount > 0 && this._updateSelectAll();
    }
  }, h.prototype._disableSelection = function() {
    if (!this._selectableActive) return;
    this._selectableActive = !1, this.tbody && this._onSelectionChange && this.tbody.removeEventListener("change", this._onSelectionChange), this._selectAllCheckbox && this._onSelectAll && this._selectAllCheckbox.removeEventListener("change", this._onSelectAll);
    const n = this.dom.querySelector("[data-ln-col-select]");
    if (n) {
      const e = n.querySelector('input[type="checkbox"]');
      e && e.remove();
    }
    if (this._selectAllCheckbox = null, this.selectedIds.clear(), this.selectedCount = 0, this.tbody) {
      const e = this.tbody.querySelectorAll("[data-ln-row]");
      for (let o = 0; o < e.length; o++) {
        e[o].classList.remove("ln-row-selected");
        const a = e[o].querySelector("[data-ln-row-select]");
        a && (a.checked = !1);
      }
    }
    this._updateFooter();
  }, h.prototype._focusRow = function(n) {
    for (let e = 0; e < n.length; e++)
      n[e].classList.remove("ln-row-focused"), n[e].removeAttribute("tabindex");
    if (this._focusedRowIndex >= 0 && this._focusedRowIndex < n.length) {
      const e = n[this._focusedRowIndex];
      e.classList.add("ln-row-focused"), e.setAttribute("tabindex", "0"), e.focus(), e.scrollIntoView({ block: "nearest" });
    }
  }, h.prototype._openFilterDropdown = function(n, e, o) {
    this._closeFilterDropdown();
    const a = dt(this.dom, this.name + "-column-filter", "ln-data-table") || dt(this.dom, "column-filter", "ln-data-table");
    if (!a) return;
    const f = a.firstElementChild;
    if (!f) return;
    const c = this._getUniqueValues(n), y = f.querySelector("[data-ln-filter-options]"), l = f.querySelector("[data-ln-filter-search]"), u = this.currentFilters[n] || [], g = this;
    if (l && c.length <= 8 && l.classList.add("hidden"), y) {
      const v = y.querySelector("[data-ln-filter-reset]");
      v && (v.checked = u.length === 0);
      const b = dt(f, this.name + "-column-filter-item", "ln-data-table") || dt(f, "column-filter-item", "ln-data-table");
      if (b)
        for (let E = 0; E < c.length; E++) {
          const _ = c[E], k = b.cloneNode(!0);
          ot(k, { value: _ });
          const x = k.querySelector('input[type="checkbox"]');
          x && (x.value = _, x.checked = u.length > 0 && u.indexOf(_) !== -1), y.appendChild(k);
        }
      y.addEventListener("change", function(E) {
        E.target.type === "checkbox" && (g._applyFilterMutualExclusion(E.target, y), g._onFilterChange(n, y));
      });
    }
    l && l.addEventListener("input", function() {
      const v = l.value.toLowerCase(), b = y.querySelectorAll("li");
      for (let E = 0; E < b.length; E++) {
        const _ = b[E].textContent.toLowerCase();
        b[E].classList.toggle("hidden", v && _.indexOf(v) === -1);
      }
    });
    const m = f.querySelector("[data-ln-filter-clear]");
    m && m.addEventListener("click", function() {
      delete g.currentFilters[n], g._closeFilterDropdown(), g._updateFilterIndicators(), A(g.dom, "ln-data-table:filter", {
        table: g.name,
        field: n,
        values: []
      }), g._requestData();
    }), e.appendChild(f), this._activeDropdown = { field: n, th: e, el: f }, f.addEventListener("click", function(v) {
      v.stopPropagation();
    });
  }, h.prototype._closeFilterDropdown = function() {
    this._activeDropdown && (this._activeDropdown.el && this._activeDropdown.el.parentNode && this._activeDropdown.el.parentNode.removeChild(this._activeDropdown.el), this._activeDropdown = null);
  }, h.prototype._applyFilterMutualExclusion = function(n, e) {
    const o = n.hasAttribute("data-ln-filter-reset"), a = e.querySelector("[data-ln-filter-reset]"), f = e.querySelectorAll('input[type="checkbox"]:not([data-ln-filter-reset])');
    if (o) {
      n.checked = !0;
      for (let c = 0; c < f.length; c++) f[c].checked = !1;
    } else if (n.checked)
      a && (a.checked = !1);
    else {
      let c = !1;
      for (let y = 0; y < f.length; y++)
        if (f[y].checked) {
          c = !0;
          break;
        }
      !c && a && (a.checked = !0);
    }
  }, h.prototype._onFilterChange = function(n, e) {
    const o = e.querySelector("[data-ln-filter-reset]"), a = e.querySelectorAll('input[type="checkbox"]:not([data-ln-filter-reset])'), f = [];
    for (let y = 0; y < a.length; y++)
      a[y].checked && f.push(a[y].value);
    const c = o && o.checked || f.length === 0;
    c ? delete this.currentFilters[n] : this.currentFilters[n] = f, this._updateFilterIndicators(), A(this.dom, "ln-data-table:filter", {
      table: this.name,
      field: n,
      values: c ? [] : f
    }), this._requestData();
  }, h.prototype._updateFilterOptions = function(n) {
    if (n !== null && typeof n == "object" && !Array.isArray(n)) {
      const e = Object.keys(n);
      for (let o = 0; o < e.length; o++) {
        const a = e[o], f = n[a];
        if (!Array.isArray(f)) continue;
        const c = {}, y = [];
        for (let l = 0; l < f.length; l++) {
          const u = String(f[l]);
          c[u] || (c[u] = !0, y.push(u));
        }
        this._filterOptions[a] = y.sort();
      }
    } else {
      const e = this._filterableFields, o = this._data;
      for (let a = 0; a < e.length; a++) {
        const f = e[a];
        this._filterOptions[f] || (this._filterOptions[f] = []);
        const c = this._filterOptions[f], y = {};
        for (let l = 0; l < c.length; l++)
          y[c[l]] = !0;
        for (let l = 0; l < o.length; l++) {
          const u = o[l][f];
          if (u != null) {
            const g = String(u);
            y[g] || (y[g] = !0, c.push(g));
          }
        }
        c.sort();
      }
    }
  }, h.prototype._getUniqueValues = function(n) {
    return (this._filterOptions[n] || []).slice().sort();
  }, h.prototype._updateFilterIndicators = function() {
    const n = this.ths;
    for (let e = 0; e < n.length; e++) {
      const o = n[e], a = o.getAttribute("data-ln-col");
      if (!a) continue;
      const f = o.querySelector("[data-ln-col-filter]");
      if (!f) continue;
      const c = this.currentFilters[a] && this.currentFilters[a].length > 0;
      f.classList.toggle("ln-filter-active", !!c);
    }
  }, h.prototype._renderRows = function() {
    if (!this.tbody) return;
    const n = this._data, e = this._lastTotal, o = this._lastFiltered;
    if (e === 0) {
      this._disableVirtualScroll(), this._showEmptyState(this.name + "-empty");
      return;
    }
    if (n.length === 0 || o === 0) {
      this._disableVirtualScroll(), this._showEmptyState(this.name + "-empty-filtered");
      return;
    }
    n.length > 200 ? (this._enableVirtualScroll(), this._renderVirtual()) : (this._disableVirtualScroll(), this._renderAll());
  }, h.prototype._renderAll = function() {
    const n = this._data, e = document.createDocumentFragment();
    for (let o = 0; o < n.length; o++) {
      const a = this._buildRow(n[o]);
      if (!a) break;
      e.appendChild(a);
    }
    this.tbody.textContent = "", this.tbody.appendChild(e), this._selectable && this._updateSelectAll();
  }, h.prototype._buildRow = function(n) {
    const e = dt(this.dom, this.name + "-row", "ln-data-table");
    if (!e) return null;
    const o = e.querySelector("[data-ln-row]") || e.firstElementChild;
    if (!o) return null;
    if (this._fillRow(o, n), o._lnRecord = n, n.id != null && o.setAttribute("data-ln-row-id", n.id), this._selectable && n.id != null && this.selectedIds.has(String(n.id))) {
      o.classList.add("ln-row-selected");
      const a = o.querySelector("[data-ln-row-select]");
      a && (a.checked = !0);
    }
    return o;
  }, h.prototype._enableVirtualScroll = function() {
    if (this._virtual) return;
    this._virtual = !0, this._vStart = -1, this._vEnd = -1;
    const n = this;
    if (!this._rowHeight) {
      const o = this._buildRow(this._data[0]);
      o && (this.tbody.textContent = "", this.tbody.appendChild(o), this._rowHeight = o.offsetHeight || 40, this.tbody.textContent = "");
    }
    this._scrollContainer = d(this.dom);
    const e = this._scrollContainer || window;
    this._scrollHandler = function() {
      n._rafId || (n._rafId = requestAnimationFrame(function() {
        n._rafId = null, n._renderVirtual();
      }));
    }, e.addEventListener("scroll", this._scrollHandler, { passive: !0 }), window.addEventListener("resize", this._scrollHandler, { passive: !0 });
  }, h.prototype._disableVirtualScroll = function() {
    this._virtual && (this._virtual = !1, this._scrollHandler && ((this._scrollContainer || window).removeEventListener("scroll", this._scrollHandler), window.removeEventListener("resize", this._scrollHandler), this._scrollHandler = null), this._scrollContainer = null, this._rafId && (cancelAnimationFrame(this._rafId), this._rafId = null), this._vStart = -1, this._vEnd = -1);
  }, h.prototype._renderVirtual = function() {
    const n = this._data, e = n.length, o = this._rowHeight;
    if (!o || !e) return;
    const a = this.thead ? this.thead.offsetHeight : 0, f = this._scrollContainer;
    let c, y;
    if (f) {
      const E = this.table.getBoundingClientRect(), _ = f.getBoundingClientRect(), k = E.top - _.top + f.scrollTop + a;
      c = f.scrollTop - k, y = f.clientHeight;
    } else {
      const E = this.table.getBoundingClientRect().top + window.scrollY + a;
      c = window.scrollY - E, y = window.innerHeight;
    }
    let l = Math.max(0, Math.floor(c / o) - 15);
    l = Math.min(l, e);
    const u = Math.min(l + Math.ceil(y / o) + 30, e);
    if (l === this._vStart && u === this._vEnd) return;
    this._vStart = l, this._vEnd = u;
    const g = this.ths.length || 1, m = l * o, v = (e - u) * o, b = document.createDocumentFragment();
    if (m > 0) {
      const E = document.createElement("tr");
      E.className = "ln-data-table__spacer", E.setAttribute("aria-hidden", "true");
      const _ = document.createElement("td");
      _.setAttribute("colspan", g), _.style.height = m + "px", E.appendChild(_), b.appendChild(E);
    }
    for (let E = l; E < u; E++) {
      const _ = this._buildRow(n[E]);
      _ && b.appendChild(_);
    }
    if (v > 0) {
      const E = document.createElement("tr");
      E.className = "ln-data-table__spacer", E.setAttribute("aria-hidden", "true");
      const _ = document.createElement("td");
      _.setAttribute("colspan", g), _.style.height = v + "px", E.appendChild(_), b.appendChild(E);
    }
    this.tbody.textContent = "", this.tbody.appendChild(b), this._selectable && this._updateSelectAll();
  }, h.prototype._fillRow = function(n, e) {
    me(n, e);
    const o = n.querySelectorAll("[data-ln-cell-attr]");
    for (let a = 0; a < o.length; a++) {
      const f = o[a], c = f.getAttribute("data-ln-cell-attr").split(",");
      for (let y = 0; y < c.length; y++) {
        const l = c[y].trim().split(":");
        if (l.length !== 2) continue;
        const u = l[0].trim(), g = l[1].trim();
        e[u] != null && f.setAttribute(g, e[u]);
      }
    }
  }, h.prototype._showEmptyState = function(n) {
    const e = dt(this.dom, n, "ln-data-table");
    this.tbody.textContent = "", e && this.tbody.appendChild(e);
  }, h.prototype._updateFooter = function() {
    const n = this._lastTotal, e = this._lastFiltered, o = e < n;
    if (this._totalSpan && (this._totalSpan.textContent = r(n)), this._filteredSpan && (this._filteredSpan.textContent = o ? r(e) : ""), this._filteredWrap && this._filteredWrap.classList.toggle("hidden", !o), this._selectedSpan) {
      const a = this.selectedIds.size;
      this._selectedSpan.textContent = a > 0 ? r(a) : "", this._selectedWrap && this._selectedWrap.classList.toggle("hidden", a === 0);
    }
  }, h.prototype.destroy = function() {
    this.dom[t] && (this.dom.removeEventListener("ln-data-table:set-data", this._onSetData), this.dom.removeEventListener("ln-data-table:set-loading", this._onSetLoading), this.thead && (this.thead.removeEventListener("click", this._onSortClick), this.thead.removeEventListener("click", this._onFilterClick)), document.removeEventListener("click", this._onDocClick), document.removeEventListener("keydown", this._onKeydown), this._searchInput && this._searchInput.removeEventListener("input", this._onSearchInput), this.tbody && (this.tbody.removeEventListener("click", this._onRowClick), this.tbody.removeEventListener("click", this._onRowAction)), this._onSelectionChange && this.tbody && this.tbody.removeEventListener("change", this._onSelectionChange), this._selectAllCheckbox && this._onSelectAll && this._selectAllCheckbox.removeEventListener("change", this._onSelectAll), this.dom.removeEventListener("click", this._onClearAll), this._closeFilterDropdown(), this._disableVirtualScroll(), this._data = [], delete this.dom[t]);
  };
  function i(n, e) {
    const o = n[t];
    if (o && e === "data-ln-data-table-selectable") {
      const a = n.hasAttribute("data-ln-data-table-selectable");
      a !== o._selectable && (o._selectable = a, a ? o._enableSelection() : o._disableSelection());
    }
  }
  H(p, t, h, "ln-data-table", {
    extraAttributes: ["data-ln-data-table-selectable"],
    onAttributeChange: i
  });
})();
(function() {
  const p = "ln-icons-sprite", t = "#ln-", s = "#lnc-", r = /* @__PURE__ */ new Set(), d = /* @__PURE__ */ new Set();
  let h = null;
  const i = (window.LN_ICONS_CDN || "https://cdn.jsdelivr.net/npm/@tabler/icons@3.31.0/icons/outline").replace(/\/$/, ""), n = (window.LN_ICONS_CUSTOM_CDN || "").replace(/\/$/, ""), e = "lni:", o = "lni:v", a = "1";
  function f() {
    try {
      if (localStorage.getItem(o) !== a) {
        for (let v = localStorage.length - 1; v >= 0; v--) {
          const b = localStorage.key(v);
          b && b.indexOf(e) === 0 && localStorage.removeItem(b);
        }
        localStorage.setItem(o, a);
      }
    } catch {
    }
  }
  f();
  function c() {
    return h || (h = document.getElementById(p), h || (h = document.createElementNS("http://www.w3.org/2000/svg", "svg"), h.id = p, h.setAttribute("hidden", ""), h.setAttribute("aria-hidden", "true"), h.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "defs")), document.body.insertBefore(h, document.body.firstChild))), h;
  }
  function y(v) {
    return v.indexOf(s) === 0 ? n + "/" + v.slice(s.length) + ".svg" : i + "/" + v.slice(t.length) + ".svg";
  }
  function l(v, b) {
    const E = b.match(/viewBox="([^"]+)"/), _ = E ? E[1] : "0 0 24 24", k = b.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i), x = k ? k[1].trim() : "", q = b.match(/<svg([^>]*)>/i), I = q ? q[1] : "", T = document.createElementNS("http://www.w3.org/2000/svg", "symbol");
    T.id = v, T.setAttribute("viewBox", _), ["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"].forEach(function(P) {
      const F = I.match(new RegExp(P + '="([^"]*)"'));
      F && T.setAttribute(P, F[1]);
    }), T.innerHTML = x, c().querySelector("defs").appendChild(T);
  }
  function u(v) {
    if (r.has(v) || d.has(v) || v.indexOf(s) === 0 && !n) return;
    const b = v.slice(1);
    try {
      const E = localStorage.getItem(e + b);
      if (E) {
        l(b, E), r.add(v);
        return;
      }
    } catch {
    }
    d.add(v), fetch(y(v)).then(function(E) {
      if (!E.ok) throw new Error(E.status);
      return E.text();
    }).then(function(E) {
      l(b, E), r.add(v), d.delete(v);
      try {
        localStorage.setItem(e + b, E);
      } catch {
      }
    }).catch(function() {
      d.delete(v);
    });
  }
  function g(v) {
    const b = 'use[href^="' + t + '"], use[href^="' + s + '"]', E = v.querySelectorAll ? v.querySelectorAll(b) : [];
    if (v.matches && v.matches(b)) {
      const _ = v.getAttribute("href");
      _ && u(_);
    }
    Array.prototype.forEach.call(E, function(_) {
      const k = _.getAttribute("href");
      k && u(k);
    });
  }
  function m() {
    g(document), new MutationObserver(function(v) {
      v.forEach(function(b) {
        if (b.type === "childList")
          b.addedNodes.forEach(function(E) {
            E.nodeType === 1 && g(E);
          });
        else if (b.type === "attributes" && b.attributeName === "href") {
          const E = b.target.getAttribute("href");
          E && (E.indexOf(t) === 0 || E.indexOf(s) === 0) && u(E);
        }
      });
    }).observe(document.body, {
      childList: !0,
      subtree: !0,
      attributes: !0,
      attributeFilter: ["href"]
    });
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", m) : m();
})();
const Qt = "lnDb";
if (!window[Qt]) {
  let t = function(y, l) {
    if (!l) return l;
    const u = p[y];
    if (u) {
      const g = Object.assign({}, l);
      return g[u.to] = g[u.from], g;
    }
    return l;
  }, s = function(y, l) {
    if (!l) return l;
    const u = p[y];
    if (u) {
      const g = Object.assign({}, l);
      return g[u.from] = g[u.to], g;
    }
    return l;
  }, r = function(y) {
    return new Promise(function(l) {
      function u() {
        const g = document.querySelector('[data-ln-data-store="' + y + '"]');
        if (g) {
          const m = g.lnDataStore || g.lnStore;
          if (m) {
            l(m);
            return;
          }
        }
        setTimeout(u, 10);
      }
      u();
    });
  }, d = function() {
    return document.readyState === "loading" ? new Promise(function(y) {
      document.addEventListener("DOMContentLoaded", function() {
        y();
      });
    }) : Promise.resolve();
  }, h = function(y, l) {
    return r(y).then(function(u) {
      return u.getById(l).then(function(g) {
        return s(y, g);
      });
    });
  }, i = function(y) {
    return r(y).then(function(l) {
      return l.getAll().then(function(u) {
        return (u ? u.data : []).map(function(m) {
          return s(y, m);
        });
      });
    });
  }, n = function(y) {
    return r(y).then(function(l) {
      return l.getAll().then(function(u) {
        return (u ? u.data : []).map(function(m) {
          return m.id;
        });
      });
    });
  }, e = function(y, l, u) {
    return r(y).then(function(g) {
      const m = {};
      return m[l] = [u], g.getAll({ filters: m }).then(function(v) {
        return (v ? v.data : []).map(function(E) {
          return s(y, E);
        });
      });
    });
  }, o = function(y, l, u) {
    return r(y).then(function(g) {
      const m = {};
      return m[l] = [u], g.getAll({ filters: m }).then(function(v) {
        const E = (v ? v.data : []).map(function(_) {
          return _.id;
        });
        return E.length === 0 ? Promise.resolve() : g.applySync([], E, Math.floor(Date.now() / 1e3));
      });
    });
  }, a = function(y, l) {
    return r(y).then(function(u) {
      const g = t(y, l);
      return u.applySync([g], [], Math.floor(Date.now() / 1e3));
    });
  }, f = function(y, l) {
    return r(y).then(function(u) {
      return u.applySync([], [l], Math.floor(Date.now() / 1e3));
    });
  }, c = function(y) {
    return r(y).then(function(l) {
      return l.fullReload();
    });
  };
  var cn = t, un = s, hn = r, fn = d, pn = h, mn = i, gn = n, yn = e, vn = o, bn = a, _n = f, wn = c;
  const p = {
    settings: { from: "key", to: "id" },
    tracks: { from: "url", to: "id" },
    audioFiles: { from: "url", to: "id" }
  };
  window[Qt] = {
    open: d,
    get: h,
    getAll: i,
    getAllKeys: n,
    getAllByIndex: e,
    deleteByIndex: o,
    put: a,
    delete: f,
    clear: c
  };
}
const Kt = {};
function It(p, t) {
  Kt[p] || (Kt[p] = document.querySelector('[data-ln-template="' + p + '"]'));
  const s = Kt[p];
  return s ? s.content.cloneNode(!0) : (console.warn("[" + (t || "ln-core") + '] Template "' + p + '" not found'), null);
}
function mt(p, t) {
  if (!p || !t) return p;
  const s = p.querySelectorAll("[data-ln-field]");
  for (let i = 0; i < s.length; i++) {
    const n = s[i], e = n.getAttribute("data-ln-field");
    t[e] != null && (n.textContent = t[e]);
  }
  const r = p.querySelectorAll("[data-ln-attr]");
  for (let i = 0; i < r.length; i++) {
    const n = r[i], e = n.getAttribute("data-ln-attr").split(",");
    for (let o = 0; o < e.length; o++) {
      const a = e[o].trim().split(":");
      if (a.length !== 2) continue;
      const f = a[0].trim(), c = a[1].trim();
      t[c] != null && n.setAttribute(f, t[c]);
    }
  }
  const d = p.querySelectorAll("[data-ln-show]");
  for (let i = 0; i < d.length; i++) {
    const n = d[i], e = n.getAttribute("data-ln-show");
    e in t && n.classList.toggle("hidden", !t[e]);
  }
  const h = p.querySelectorAll("[data-ln-class]");
  for (let i = 0; i < h.length; i++) {
    const n = h[i], e = n.getAttribute("data-ln-class").split(",");
    for (let o = 0; o < e.length; o++) {
      const a = e[o].trim().split(":");
      if (a.length !== 2) continue;
      const f = a[0].trim(), c = a[1].trim();
      c in t && n.classList.toggle(f, !!t[c]);
    }
  }
  return p;
}
function qt(p, t) {
  if (!p || !t) return p;
  const s = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
  for (; s.nextNode(); ) {
    const r = s.currentNode;
    r.textContent.indexOf("{{") !== -1 && (r.textContent = r.textContent.replace(
      /\{\{\s*(\w+)\s*\}\}/g,
      function(d, h) {
        return t[h] !== void 0 ? t[h] : "";
      }
    ));
  }
  return p;
}
const Ee = {};
function Fe(p, t) {
  Ee[p] = t;
}
function Be(p) {
  return Ee[p] || { ingress: (t) => t, egress: (t) => t };
}
typeof window < "u" && (window.lnCore = window.lnCore || {}, window.lnCore.registerDataMapper = Fe, window.lnCore.getDataMapper = Be);
const te = "data-mixer-profile", kt = "lnProfile";
if (!window[kt]) {
  let p = function(n, e, o) {
    n.dispatchEvent(new CustomEvent(e, {
      bubbles: !0,
      detail: o || {}
    }));
  }, t = function(n) {
    let e = n.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    return e || (e = "profile"), e;
  }, s = function(n, e) {
    if (!e[n]) return n;
    let o = 2;
    for (; e[n + "-" + o]; ) o++;
    return n + "-" + o;
  }, r = function(n) {
    d(n);
  }, d = function(n) {
    const e = Array.from(n.querySelectorAll("[" + te + "]"));
    n.hasAttribute && n.hasAttribute(te) && e.push(n), e.forEach(function(o) {
      o[kt] || (o[kt] = new h(o));
    });
  }, h = function(n) {
    return this.dom = n, n[kt] = this, this.profiles = {}, this.currentId = null, this.addBtn = n.querySelector('[data-mixer-action="new-profile"]'), this._bindEvents(), this;
  }, i = function() {
    new MutationObserver(function(e) {
      e.forEach(function(o) {
        o.type === "childList" && o.addedNodes.forEach(function(a) {
          a.nodeType === 1 && d(a);
        });
      });
    }).observe(document.body, {
      childList: !0,
      subtree: !0
    });
  };
  var Wt = p, ln = t, dn = s, Ot = r, Mt = d, Rt = h, Nt = i;
  h.prototype._bindEvents = function() {
    const n = this;
    this.dom.addEventListener("click", function(e) {
      const o = e.target.closest("[data-mixer-profile-id]");
      if (o) {
        const a = o.getAttribute("data-mixer-profile-id");
        a !== n.currentId && n.switchTo(a);
      }
    }), this.dom.addEventListener("ln-profile:request-create", function(e) {
      n.create(e.detail.name);
    }), this.dom.addEventListener("ln-profile:request-remove", function(e) {
      n.remove(e.detail.id);
    }), this.dom.addEventListener("ln-profile:request-hydrate", function(e) {
      n.hydrate(e.detail.profiles || []);
    });
  }, h.prototype.hydrate = function(n) {
    const e = this;
    n.forEach(function(a) {
      e.profiles[a.id] = a;
    }), this._renderButtons();
    const o = Object.keys(this.profiles);
    o.length > 0 && this.switchTo(o[0]), p(this.dom, "ln-profile:ready", {
      profiles: this.profiles,
      currentId: this.currentId
    });
  }, h.prototype._renderButtons = function() {
    this.dom.querySelectorAll("[data-mixer-profile-id]").forEach(function(o) {
      o.remove();
    });
    const n = this;
    Object.keys(this.profiles).forEach(function(o) {
      const a = It("profile-btn", "ln-profile"), f = { id: o, name: n.profiles[o].name };
      qt(a, f), mt(a, f), n.dom.insertBefore(a.firstElementChild, n.addBtn);
    }), this._updateActive();
  }, h.prototype._updateActive = function() {
    const n = this;
    this.dom.querySelectorAll("[data-mixer-profile-id]").forEach(function(e) {
      e.classList.toggle("active", e.getAttribute("data-mixer-profile-id") === n.currentId);
    });
  }, h.prototype.switchTo = function(n) {
    this.profiles[n] && (this.currentId = n, this._updateActive(), p(this.dom, "ln-profile:switched", {
      profileId: n,
      profile: this.profiles[n]
    }));
  }, h.prototype.create = function(n) {
    const e = t(n), o = s(e, this.profiles);
    return this.profiles[o] = { id: o, name: n }, this._renderButtons(), this.switchTo(o), p(this.dom, "ln-profile:created", {
      profileId: o,
      profile: this.profiles[o]
    }), o;
  }, h.prototype.remove = function(n) {
    if (!n || !this.profiles[n]) return;
    delete this.profiles[n], this._renderButtons();
    const e = Object.keys(this.profiles);
    e.length > 0 ? this.switchTo(e[0]) : (this.currentId = null, p(this.dom, "ln-profile:switched", {
      profileId: null,
      profile: null
    })), p(this.dom, "ln-profile:deleted", { profileId: n });
  }, h.prototype.getProfile = function(n) {
    return this.profiles[n] || null;
  }, h.prototype.getCurrent = function() {
    return this.currentId && this.profiles[this.currentId] || null;
  }, window[kt] = r, i(), document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
    r(document.body);
  }) : r(document.body);
}
const ee = "data-mixer-playlist", St = "lnPlaylist";
if (!window[St]) {
  let p = function(l, u, g) {
    l.dispatchEvent(new CustomEvent(u, {
      bubbles: !0,
      detail: g || {}
    }));
  }, t = function(l) {
    let u = l.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    return u || (u = "item"), u;
  }, s = function(l, u) {
    if (!u[l]) return l;
    let g = 2;
    for (; u[l + "-" + g]; ) g++;
    return l + "-" + g;
  }, r = function(l) {
    d(l);
  }, d = function(l) {
    const u = Array.from(l.querySelectorAll("[" + ee + "]"));
    l.hasAttribute && l.hasAttribute(ee) && u.push(l), u.forEach(function(g) {
      g.hasAttribute("data-mixer-playlist-id") || g[St] || (g[St] = new h(g));
    });
  }, h = function(l) {
    return this.dom = l, l[St] = this, this.playlists = null, this.trackCatalog = {}, this.currentId = null, this.profileId = null, this.deckHighlight = { a: -1, b: -1 }, this._bindEvents(), this;
  }, i = function() {
    new MutationObserver(function(u) {
      u.forEach(function(g) {
        g.type === "childList" && g.addedNodes.forEach(function(m) {
          m.nodeType === 1 && d(m);
        });
      });
    }).observe(document.body, {
      childList: !0,
      subtree: !0
    });
  };
  var Wt = p, ln = t, dn = s, Ot = r, Mt = d, Rt = h, Nt = i;
  h.prototype._bindEvents = function() {
    const l = this;
    this.dom.addEventListener("click", function(u) {
      if (u.target.closest("[data-mixer-load-to]")) {
        l._handleLoadToDeck(u);
        return;
      }
    }), this.dom.addEventListener("ln-toggle:open", function(u) {
      const g = u.target.getAttribute("data-mixer-playlist-id");
      g && l._switchPlaylist(g);
    }), this.dom.addEventListener("ln-sortable:reordered", function(u) {
      const g = u.target.closest("[data-mixer-track-list]");
      g && l._syncAfterReorder(g);
    }), this.dom.addEventListener("ln-playlist:request-create", function(u) {
      l.createPlaylist(u.detail.name);
    }), this.dom.addEventListener("ln-playlist:request-add-track", function(u) {
      l.addSegment(u.detail);
    }), this.dom.addEventListener("ln-playlist:request-edit-track", function(u) {
      l.editSegment(
        u.detail.playlistId || l.currentId,
        u.detail.index,
        { notes: u.detail.notes }
      );
    }), this.dom.addEventListener("ln-playlist:request-remove-track", function(u) {
      l.removeSegment(
        u.detail.playlistId || l.currentId,
        u.detail.index
      );
    }), this.dom.addEventListener("ln-playlist:request-open-edit", function(u) {
      l.openEditTrack(u.detail.index);
    }), this.dom.addEventListener("ln-playlist:request-highlight", function(u) {
      l.highlightDeck(u.detail.deckId, u.detail.index);
    }), this.dom.addEventListener("ln-playlist:request-load-profile", function(u) {
      l.loadProfile(u.detail.profileId, u.detail.playlists, u.detail.trackCatalog);
    }), this.dom.addEventListener("ln-playlist:request-update-catalog", function(u) {
      l.updateCatalog(u.detail.url, u.detail.track);
    }), this.dom.addEventListener("ln-playlist:request-add-loop", function(u) {
      l.addLoop(u.detail.playlistId || l.currentId, u.detail.trackIndex, u.detail.loop);
    }), this.dom.addEventListener("ln-playlist:request-remove-loop", function(u) {
      l.removeLoop(u.detail.playlistId || l.currentId, u.detail.trackIndex, u.detail.loopIndex);
    }), this.dom.addEventListener("ln-playlist:request-remove-playlist", function(u) {
      l.removePlaylist(u.detail.playlistId);
    }), this._initSwipeToDelete();
  }, h.prototype.loadProfile = function(l, u, g) {
    this.profileId = l, this.currentId = null, this.deckHighlight = { a: -1, b: -1 }, this.playlists = u || null, this.trackCatalog = g || {}, this._rebuild();
  }, h.prototype.getPlaylist = function() {
    return this.playlists && this.playlists[this.currentId] || null;
  }, h.prototype.getTrack = function(l) {
    const u = this.getPlaylist();
    if (!u) return null;
    const g = l >= 0 && l < u.segments.length ? u.segments[l] : null;
    if (!g) return null;
    const m = this.trackCatalog[g.url] || {};
    return {
      url: g.url,
      title: m.title || "",
      artist: m.artist || "",
      duration: m.duration || "",
      durationSec: m.durationSec || 0,
      notes: g.notes || "",
      loops: g.loops || []
    };
  }, h.prototype.highlightDeck = function(l, u) {
    this.deckHighlight[l] = u, this._updateHighlights();
  }, h.prototype.clearHighlights = function() {
    this.deckHighlight = { a: -1, b: -1 }, this._updateHighlights();
  }, h.prototype.createPlaylist = function(l) {
    if (!l || !this.playlists) return null;
    const u = t(l), g = s(this.profileId + "--" + u, this.playlists);
    this.playlists[g] = { id: g, profileId: this.profileId, name: l, segments: [] }, p(this.dom, "ln-playlist:changed", { profileId: this.profileId, playlistId: g });
    const m = this._buildPlaylistGroup(g, l, !1), v = this.dom.querySelector(".sidebar-footer");
    return this.dom.insertBefore(m, v), m.dispatchEvent(new CustomEvent("ln-toggle:request-open")), this._switchPlaylist(g), p(this.dom, "ln-playlist:created", {
      playlistId: g,
      name: l
    }), g;
  }, h.prototype.addSegment = function(l) {
    const u = this.getPlaylist();
    if (!u) return -1;
    const g = {
      url: l.url || "",
      notes: ""
    };
    u.segments.push(g), l.url && (this.trackCatalog[l.url] = {
      url: l.url,
      title: l.title || "",
      artist: l.artist || "",
      duration: l.duration || "",
      durationSec: l.durationSec || 0
    }), p(this.dom, "ln-playlist:changed", { profileId: this.profileId, playlistId: this.currentId });
    const m = this._getActiveTrackList();
    if (m) {
      const b = u.segments.length - 1, E = this._buildTrackItem(g, b);
      m.appendChild(E), E.classList.add("just-added"), setTimeout(function() {
        E.classList.remove("just-added");
      }, 700);
    }
    const v = u.segments.length - 1;
    return p(this.dom, "ln-playlist:track-added", {
      trackIndex: v,
      track: this.getTrack(v),
      playlistId: this.currentId
    }), v;
  }, h.prototype.editSegment = function(l, u, g) {
    if (!this.playlists || !this.playlists[l]) return !1;
    const m = this.playlists[l];
    if (u < 0 || u >= m.segments.length) return !1;
    g.notes !== void 0 && (m.segments[u].notes = g.notes), p(this.dom, "ln-playlist:changed", { profileId: this.profileId, playlistId: l });
    const v = this.dom.querySelector('[data-mixer-track-list="' + l + '"]');
    if (v) {
      const b = v.querySelector('[data-mixer-track="' + u + '"]');
      if (b) {
        const E = b.querySelector(".track-notes");
        E && (E.textContent = g.notes || "");
      }
    }
    return p(this.dom, "ln-playlist:track-edited", {
      trackIndex: u,
      playlistId: l
    }), !0;
  }, h.prototype.updateCatalog = function(l, u) {
    if (!(!l || !u) && (this.trackCatalog[l] = {
      url: l,
      title: u.title || this.trackCatalog[l] && this.trackCatalog[l].title || "",
      artist: u.artist || this.trackCatalog[l] && this.trackCatalog[l].artist || "",
      duration: u.duration || "",
      durationSec: u.durationSec || 0
    }, !!this.playlists))
      for (const g in this.playlists) {
        if (!this.playlists.hasOwnProperty(g)) continue;
        const m = this.playlists[g].segments, v = this.dom.querySelector('[data-mixer-track-list="' + g + '"]');
        for (let b = 0; b < m.length; b++)
          if (m[b].url === l && v) {
            const E = v.querySelector('[data-mixer-track="' + b + '"]');
            E && mt(E, { duration: u.duration || "" });
          }
      }
  }, h.prototype.removeSegment = function(l, u) {
    if (!this.playlists || !this.playlists[l]) return !1;
    const g = this.playlists[l];
    if (u < 0 || u >= g.segments.length) return !1;
    g.segments.splice(u, 1), p(this.dom, "ln-playlist:changed", { profileId: this.profileId, playlistId: l });
    const m = this.dom.querySelector('[data-mixer-track-list="' + l + '"]');
    if (m) {
      const v = m.querySelector('[data-mixer-track="' + u + '"]');
      v && v.remove(), Array.from(m.querySelectorAll("[data-mixer-track]")).forEach(function(E, _) {
        E.setAttribute("data-mixer-track", _);
        const k = E.querySelector(".track-number");
        k && (k.textContent = _ + 1);
      });
    }
    return p(this.dom, "ln-playlist:track-removed", {
      trackIndex: u,
      playlistId: l
    }), !0;
  }, h.prototype.addLoop = function(l, u, g) {
    if (!this.playlists || !this.playlists[l]) return !1;
    const m = this.playlists[l].segments[u];
    return m ? (m.loops || (m.loops = []), m.loops.push(g), p(this.dom, "ln-playlist:changed", { profileId: this.profileId, playlistId: l }), this._updateTrackLoopIndicator(l, u, m), p(this.dom, "ln-playlist:loop-added", {
      playlistId: l,
      trackIndex: u,
      loopIndex: m.loops.length - 1,
      loops: m.loops
    }), !0) : !1;
  }, h.prototype.removeLoop = function(l, u, g) {
    if (!this.playlists || !this.playlists[l]) return !1;
    const m = this.playlists[l].segments[u];
    return !m || !m.loops || g < 0 || g >= m.loops.length ? !1 : (m.loops.splice(g, 1), m.loops.length === 0 && delete m.loops, p(this.dom, "ln-playlist:changed", { profileId: this.profileId, playlistId: l }), this._updateTrackLoopIndicator(l, u, m), p(this.dom, "ln-playlist:loop-removed", {
      playlistId: l,
      trackIndex: u,
      loopIndex: g,
      loops: m.loops || []
    }), !0);
  }, h.prototype.removePlaylist = function(l) {
    if (!this.playlists || !this.playlists[l]) return !1;
    const u = this.playlists[l].name, g = this.playlists[l].segments.length;
    delete this.playlists[l];
    const m = this.dom.querySelector('[data-mixer-playlist-id="' + l + '"]');
    if (m && m.remove(), this.currentId === l) {
      let v = null;
      for (const b in this.playlists)
        if (this.playlists.hasOwnProperty(b)) {
          v = b;
          break;
        }
      if (this.currentId = v, v) {
        const b = this.dom.querySelector('[data-mixer-playlist-id="' + v + '"]');
        b && b.dispatchEvent(new CustomEvent("ln-toggle:request-open"));
      }
    }
    return p(this.dom, "ln-playlist:playlist-removed", {
      playlistId: l,
      name: u,
      trackCount: g
    }), !0;
  }, h.prototype.openEditTrack = function(l) {
    const u = this.getPlaylist();
    if (!u || l < 0 || l >= u.segments.length) return;
    const g = this.getTrack(l);
    p(this.dom, "ln-playlist:open-edit", {
      index: l,
      track: g,
      playlistId: this.currentId
    });
  }, h.prototype._buildPlaylistGroup = function(l, u, g) {
    const m = {
      id: l,
      name: u,
      toggleState: g ? "open" : "",
      toggleId: "playlist-" + l
    }, v = It("playlist-group", "ln-playlist");
    return qt(v, m), mt(v, m), v.firstElementChild;
  }, h.prototype._rebuild = function() {
    const l = this.dom.querySelector(".sidebar-footer");
    if (this.dom.querySelectorAll(".playlist-group").forEach(function(m) {
      m.remove();
    }), !this.playlists) return;
    let u = !0, g = null;
    for (const m in this.playlists) {
      if (!this.playlists.hasOwnProperty(m)) continue;
      u && (g = m);
      const v = this._buildPlaylistGroup(m, this.playlists[m].name, u);
      this._populateTrackList(v.querySelector(".track-list"), m), this.dom.insertBefore(v, l), u = !1;
    }
    g ? this.currentId = g : this.currentId = null;
  }, h.prototype._populateTrackList = function(l, u) {
    const g = this;
    this.playlists[u].segments.forEach(function(m, v) {
      l.appendChild(g._buildTrackItem(m, v));
    });
  }, h.prototype._buildTrackItem = function(l, u) {
    const g = this.trackCatalog[l.url] || {}, m = l.loops ? l.loops.length : 0, v = {
      index: u,
      number: u + 1,
      title: g.title || l.url || "",
      artist: g.artist || "",
      duration: g.duration || "",
      notes: l.notes || "",
      hasLoops: m > 0,
      loopText: m + " loop" + (m > 1 ? "s" : "")
    }, b = It("track-item", "ln-playlist");
    qt(b, v), mt(b, v);
    const E = b.firstElementChild;
    return E.setAttribute("data-mixer-track", u), E;
  }, h.prototype._updateTrackLoopIndicator = function(l, u, g) {
    const m = this.dom.querySelector('[data-mixer-track-list="' + l + '"]');
    if (!m) return;
    const v = m.querySelector('[data-mixer-track="' + u + '"]');
    if (!v) return;
    const b = g.loops ? g.loops.length : 0, E = {
      hasLoops: b > 0,
      loopText: b + " loop" + (b > 1 ? "s" : "")
    };
    mt(v, E);
  }, h.prototype._initSwipeToDelete = function() {
    const l = this, u = 30, g = 0.3;
    let m = 0, v = 0, b = null, E = null, _ = !1, k = !1, x = 0;
    this.dom.addEventListener("pointerdown", function(q) {
      if (q.target.closest("[data-ln-sortable-handle]") || q.target.closest("button")) return;
      const I = q.target.closest("[data-mixer-track]");
      I && (m = q.clientX, v = q.clientY, b = I, E = I.querySelector(".track-content"), _ = !0, k = !1, x = I.offsetWidth);
    }), this.dom.addEventListener("pointermove", function(q) {
      if (!_ || !b) return;
      const I = q.clientX - m, T = q.clientY - v;
      if (!k && Math.abs(T) > Math.abs(I)) {
        _ = !1, b = null;
        return;
      }
      if (I > 0) {
        k && E && (E.style.transform = "", b.removeAttribute("data-mixer-swiping"));
        return;
      }
      if (!k && Math.abs(I) > u && (k = !0, b.setAttribute("data-mixer-swiping", ""), b.setPointerCapture(q.pointerId)), k && E) {
        const P = Math.max(I, -x);
        E.style.transform = "translateX(" + P + "px)";
      }
    }), this.dom.addEventListener("pointerup", function(q) {
      if (!_ || !b) return;
      const I = q.clientX - m, T = b, P = E;
      if (_ = !1, b = null, E = null, !k) return;
      const F = x * g;
      if (Math.abs(I) >= F) {
        const B = parseInt(T.getAttribute("data-mixer-track"), 10), R = l.currentId;
        P.addEventListener("transitionend", function U() {
          P.removeEventListener("transitionend", U), T.style.maxHeight = T.offsetHeight + "px", T.offsetHeight, T.setAttribute("data-mixer-swipe-committed", ""), T.addEventListener("transitionend", function $() {
            T.removeEventListener("transitionend", $), l.removeSegment(R, B);
          });
        }), P.style.transition = "transform 0.2s ease-out", P.style.transform = "translateX(-100%)";
      } else
        T.removeAttribute("data-mixer-swiping"), P.addEventListener("transitionend", function B() {
          P.removeEventListener("transitionend", B), P.style.transition = "";
        }), P.style.transition = "transform 0.2s ease-out", P.style.transform = "";
      k = !1;
    }), this.dom.addEventListener("pointercancel", function() {
      !_ || !b || (k && E && (E.style.transform = "", E.style.transition = "", b.removeAttribute("data-mixer-swiping")), _ = !1, k = !1, b = null, E = null);
    });
  }, h.prototype._switchPlaylist = function(l) {
    this.currentId = l, this._updateHighlights(), p(this.dom, "ln-playlist:switched", { playlistId: l });
  }, h.prototype._getActiveTrackList = function() {
    return this.currentId ? this.dom.querySelector('[data-mixer-track-list="' + this.currentId + '"]') : null;
  }, h.prototype._updateHighlights = function() {
    const l = this._getActiveTrackList();
    if (!l) return;
    l.querySelectorAll("[data-mixer-track]").forEach(function(g) {
      g.classList.remove("active-a", "active-b");
      const m = g.querySelector('[data-mixer-load-to="a"]'), v = g.querySelector('[data-mixer-load-to="b"]');
      m && m.classList.remove("load-btn--loaded"), v && v.classList.remove("load-btn--loaded");
    });
    const u = this;
    ["a", "b"].forEach(function(g) {
      if (u.deckHighlight[g] >= 0) {
        const m = l.querySelector('[data-mixer-track="' + u.deckHighlight[g] + '"]');
        if (m) {
          m.classList.add("active-" + g);
          const v = m.querySelector('[data-mixer-load-to="' + g + '"]');
          v && v.classList.add("load-btn--loaded");
        }
      }
    });
  }, h.prototype._handleLoadToDeck = function(l) {
    const u = l.target.closest("[data-mixer-load-to]");
    if (!u) return;
    const g = u.getAttribute("data-mixer-load-to"), m = u.closest("[data-mixer-track]");
    if (!m || !g) return;
    const v = parseInt(m.getAttribute("data-mixer-track"), 10), b = this.getPlaylist();
    !b || v < 0 || v >= b.segments.length || p(this.dom, "ln-playlist:load-to-deck", {
      deckId: g,
      trackIndex: v,
      track: this.getTrack(v),
      playlistId: this.currentId
    });
  }, h.prototype._syncAfterReorder = function(l) {
    const u = Array.from(l.querySelectorAll("[data-mixer-track]")), g = this.getPlaylist();
    if (!g) return;
    const m = [], v = {};
    u.forEach(function(b, E) {
      const _ = parseInt(b.getAttribute("data-mixer-track"), 10);
      v[_] = E, m.push(g.segments[_]), b.setAttribute("data-mixer-track", E);
      const k = b.querySelector(".track-number");
      k && (k.textContent = E + 1);
    }), g.segments = m, p(this.dom, "ln-playlist:changed", { profileId: this.profileId, playlistId: this.currentId }), p(this.dom, "ln-playlist:reordered", {
      oldToNew: v,
      playlistId: this.currentId
    }), this._updateHighlights();
  }, window[St] = r, i(), document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
    r(document.body);
  }) : r(document.body);
}
const ne = "lnSettings";
if (!window[ne]) {
  let r = function() {
    t = document.querySelector("[data-mixer-brand]"), s = document.querySelector("[data-mixer-brand-logo]");
  }, d = function() {
    t || r(), t && (p.brandLogo ? (t.hidden = !1, s.src = p.brandLogo) : t.hidden = !0);
  }, h = function(a) {
    a && (a.apiUrl !== void 0 && (p.apiUrl = a.apiUrl), a.brandLogo !== void 0 && (p.brandLogo = a.brandLogo)), d(), window.dispatchEvent(new CustomEvent("ln-settings:loaded", {
      detail: { apiUrl: p.apiUrl, brandLogo: p.brandLogo }
    }));
  }, i = function(a) {
    a.apiUrl !== void 0 && (p.apiUrl = a.apiUrl), a.brandLogo !== void 0 && (p.brandLogo = a.brandLogo), d(), window.dispatchEvent(new CustomEvent("ln-settings:saved", {
      detail: { apiUrl: p.apiUrl, brandLogo: p.brandLogo }
    }));
  }, n = function() {
    return p.apiUrl;
  }, e = function() {
    return p.brandLogo;
  }, o = function() {
    r();
  };
  var En = r, kn = d, Sn = h, An = i, Cn = n, Ln = e, xn = o;
  const p = {
    apiUrl: "https://mixer.live.net.mk/api",
    brandLogo: ""
  };
  let t = null, s = null;
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", o) : o(), window[ne] = {
    hydrate: h,
    apply: i,
    getApiUrl: n,
    getBrandLogo: e
  };
}
const ie = "data-mixer-library", At = "lnLibrary";
if (!window[At]) {
  let p = function(f, c, y) {
    f.dispatchEvent(new CustomEvent(c, {
      bubbles: !0,
      detail: y || {}
    }));
  }, t = function(f, c) {
    if (!f || typeof f != "object")
      return console.warn("ln-library: skipping track[" + c + "] — not an object"), null;
    var y = typeof f.url == "string" ? f.url.trim() : "", l = typeof f.title == "string" ? f.title.trim() : "";
    if (!y)
      return console.warn("ln-library: skipping track[" + c + "] — missing url"), null;
    if (!l)
      return console.warn("ln-library: skipping track[" + c + "] — missing title"), null;
    var u = { url: y, title: l };
    return u.artist = typeof f.artist == "string" ? f.artist.trim() : "", typeof f.duration == "string" && (u.duration = f.duration.trim()), typeof f.durationSec == "number" && isFinite(f.durationSec) && (u.durationSec = f.durationSec), u;
  }, s = function(f) {
    r(f);
  }, r = function(f) {
    const c = Array.from(f.querySelectorAll("[" + ie + "]"));
    f.hasAttribute && f.hasAttribute(ie) && c.push(f), c.forEach(function(y) {
      y[At] || (y[At] = new d(y));
    });
  }, d = function(f) {
    return this.dom = f, f[At] = this, this._tracks = [], this._loaded = !1, this._loading = !1, this._list = f.querySelector("[data-mixer-library-list]"), this._noApi = f.querySelector("[data-mixer-library-no-api]"), this._search = f.querySelector("[data-ln-search]"), this._bindEvents(), this;
  }, h = function() {
    new MutationObserver(function(c) {
      c.forEach(function(y) {
        y.type === "childList" && y.addedNodes.forEach(function(l) {
          l.nodeType === 1 && r(l);
        });
      });
    }).observe(document.body, {
      childList: !0,
      subtree: !0
    });
  };
  var Wt = p, Tn = t, Ot = s, Mt = r, Rt = d, Nt = h;
  d.prototype._bindEvents = function() {
    const f = this;
    this.dom.addEventListener("ln-library:request-fetch", function(c) {
      f.fetch(c.detail ? c.detail.apiUrl : "");
    }), this.dom.addEventListener("ln-library:request-mark-cached", function(c) {
      f.markCached(c.detail ? c.detail.cachedUrls : []);
    }), this.dom.addEventListener("ln-library:request-download-start", function(c) {
      c.detail && f._setDownloading(c.detail.url, !0);
    }), this.dom.addEventListener("ln-library:request-download-progress", function(c) {
      c.detail && f._updateProgress(c.detail.url, c.detail.percent);
    }), this.dom.addEventListener("ln-library:request-download-done", function(c) {
      c.detail && (f._setDownloading(c.detail.url, !1), c.detail.success && f._markSingleCached(c.detail.url));
    }), this.dom.addEventListener("ln-library:request-uncache", function(c) {
      c.detail && f._markSingleUncached(c.detail.url);
    }), this.dom.addEventListener("ln-library:request-clear-all-cached", function() {
      f._clearAllCached();
    });
  }, d.prototype.getTracks = function() {
    return this._tracks;
  }, d.prototype.isLoaded = function() {
    return this._loaded;
  }, d.prototype.fetch = function(f) {
    if (this._loading) return;
    if (!f) {
      this._showNoApi();
      return;
    }
    this._loading = !0, this._hideNoApi();
    const c = this;
    if (this._xhr && (this._xhr.abort(), this._xhr = null), this._list) {
      this._list.innerHTML = "";
      const l = document.createElement("li");
      l.className = "library-loading", l.textContent = "Loading...", this._list.appendChild(l);
    }
    const y = this._xhr = new XMLHttpRequest();
    y.open("GET", f), y.responseType = "json", y.onload = function() {
      if (c._loading = !1, c._xhr = null, y.status >= 200 && y.status < 300 && Array.isArray(y.response)) {
        for (var l = [], u = 0, g = 0; g < y.response.length; g++) {
          var m = t(y.response[g], g);
          m ? l.push(m) : u++;
        }
        u > 0 && console.warn("ln-library: skipped " + u + " invalid track(s)"), c._tracks = l, c._loaded = !0, c._populate(), p(c.dom, "ln-library:fetched", {
          count: c._tracks.length
        });
      } else
        c._showError("Failed to load tracks"), p(c.dom, "ln-library:error", {
          message: "HTTP " + y.status
        });
    }, y.onerror = function() {
      c._loading = !1, c._xhr = null, c._showError("Network error"), p(c.dom, "ln-library:error", {
        message: "Network error"
      });
    }, y.send();
  }, d.prototype.markCached = function(f) {
    if (!this._list) return;
    const c = {};
    f.forEach(function(l) {
      c[l] = !0;
    }), this._list.querySelectorAll("[data-mixer-library-track]").forEach(function(l) {
      const u = l.querySelector('[data-mixer-action="add-to-playlist"]'), g = u ? u.getAttribute("data-track-url") : "", m = l.querySelector(".library-download-progress > [data-ln-progress]");
      g && c[g] ? (l.setAttribute("data-mixer-cached", ""), m && m.setAttribute("data-ln-progress", "100")) : (l.removeAttribute("data-mixer-cached"), m && m.setAttribute("data-ln-progress", "0"));
    });
  }, d.prototype._findItemByUrl = function(f) {
    if (!this._list) return null;
    const c = this._list.querySelectorAll("[data-mixer-library-track]");
    for (let y = 0; y < c.length; y++) {
      const l = c[y].querySelector('[data-mixer-action="add-to-playlist"]');
      if (l && l.getAttribute("data-track-url") === f)
        return c[y];
    }
    return null;
  }, d.prototype._setDownloading = function(f, c) {
    const y = this._findItemByUrl(f);
    if (y)
      if (c) {
        y.setAttribute("data-mixer-downloading", "");
        const l = y.querySelector(".library-download-progress > [data-ln-progress]");
        l && l.setAttribute("data-ln-progress", "0");
      } else
        y.removeAttribute("data-mixer-downloading");
  }, d.prototype._updateProgress = function(f, c) {
    const y = this._findItemByUrl(f);
    if (!y) return;
    const l = y.querySelector(".library-download-progress > [data-ln-progress]");
    l && l.setAttribute("data-ln-progress", String(Math.round(c)));
  }, d.prototype._markSingleCached = function(f) {
    const c = this._findItemByUrl(f);
    if (!c) return;
    c.setAttribute("data-mixer-cached", "");
    const y = c.querySelector(".library-download-progress > [data-ln-progress]");
    y && y.setAttribute("data-ln-progress", "100");
  }, d.prototype._markSingleUncached = function(f) {
    const c = this._findItemByUrl(f);
    if (!c) return;
    c.removeAttribute("data-mixer-cached");
    const y = c.querySelector(".library-download-progress > [data-ln-progress]");
    y && y.setAttribute("data-ln-progress", "0");
  }, d.prototype._clearAllCached = function() {
    if (!this._list) return;
    this._list.querySelectorAll("[data-mixer-cached]").forEach(function(c) {
      c.removeAttribute("data-mixer-cached");
      const y = c.querySelector(".library-download-progress > [data-ln-progress]");
      y && y.setAttribute("data-ln-progress", "0");
    });
  }, d.prototype._buildLibraryItem = function(f) {
    const c = It("library-item", "ln-library");
    return qt(c, f), mt(c, f), c.firstElementChild;
  }, d.prototype._populate = function() {
    if (!this._list) return;
    if (this._list.innerHTML = "", this._search && (this._search.hidden = !1), this._tracks.length === 0) {
      const y = document.createElement("li");
      y.className = "library-empty", y.textContent = "No tracks found", this._list.appendChild(y);
      return;
    }
    const f = this;
    this._tracks.forEach(function(y) {
      f._list.appendChild(f._buildLibraryItem(y));
    }), window.lnProgress && window.lnProgress(this._list);
    const c = this.dom.querySelector("[data-ln-search]");
    c && c.lnSearch && c.lnSearch.clear();
  }, d.prototype._showError = function(f) {
    if (!this._list) return;
    this._list.innerHTML = "";
    const c = document.createElement("li");
    c.className = "library-error", c.textContent = f, this._list.appendChild(c);
  }, d.prototype._showNoApi = function() {
    this._noApi && (this._noApi.hidden = !1), this._list && (this._list.hidden = !0), this._search && (this._search.hidden = !0);
  }, d.prototype._hideNoApi = function() {
    this._noApi && (this._noApi.hidden = !0), this._list && (this._list.hidden = !1);
  }, window[At] = s, h(), document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
    s(document.body);
  }) : s(document.body);
}
function G(p, t, s, r) {
  return new (s || (s = Promise))((function(d, h) {
    function i(o) {
      try {
        e(r.next(o));
      } catch (a) {
        h(a);
      }
    }
    function n(o) {
      try {
        e(r.throw(o));
      } catch (a) {
        h(a);
      }
    }
    function e(o) {
      var a;
      o.done ? d(o.value) : (a = o.value, a instanceof s ? a : new s((function(f) {
        f(a);
      }))).then(i, n);
    }
    e((r = r.apply(p, t || [])).next());
  }));
}
class Dt {
  constructor() {
    this.listeners = {};
  }
  on(t, s, r) {
    if (this.listeners[t] || (this.listeners[t] = /* @__PURE__ */ new Set()), r == null ? void 0 : r.once) {
      const d = (...h) => {
        this.un(t, d), s(...h);
      };
      return this.listeners[t].add(d), () => this.un(t, d);
    }
    return this.listeners[t].add(s), () => this.un(t, s);
  }
  un(t, s) {
    var r;
    (r = this.listeners[t]) === null || r === void 0 || r.delete(s);
  }
  once(t, s) {
    return this.on(t, s, { once: !0 });
  }
  unAll() {
    this.listeners = {};
  }
  emit(t, ...s) {
    this.listeners[t] && this.listeners[t].forEach(((r) => r(...s)));
  }
}
const Ft = { decode: function(p, t) {
  return G(this, void 0, void 0, (function* () {
    const s = new AudioContext({ sampleRate: t });
    try {
      return yield s.decodeAudioData(p);
    } finally {
      s.close();
    }
  }));
}, createBuffer: function(p, t) {
  if (!p || p.length === 0) throw new Error("channelData must be a non-empty array");
  if (t <= 0) throw new Error("duration must be greater than 0");
  if (typeof p[0] == "number" && (p = [p]), !p[0] || p[0].length === 0) throw new Error("channelData must contain non-empty channel arrays");
  (function(r) {
    const d = r[0];
    if (d.some(((h) => h > 1 || h < -1))) {
      const h = d.length;
      let i = 0;
      for (let n = 0; n < h; n++) {
        const e = Math.abs(d[n]);
        e > i && (i = e);
      }
      for (const n of r) for (let e = 0; e < h; e++) n[e] /= i;
    }
  })(p);
  const s = p.map(((r) => r instanceof Float32Array ? r : Float32Array.from(r)));
  return { duration: t, length: s[0].length, sampleRate: s[0].length / t, numberOfChannels: s.length, getChannelData: (r) => {
    const d = s[r];
    if (!d) throw new Error(`Channel ${r} not found`);
    return d;
  }, copyFromChannel: AudioBuffer.prototype.copyFromChannel, copyToChannel: AudioBuffer.prototype.copyToChannel };
} };
function ke(p, t) {
  const s = t.xmlns ? document.createElementNS(t.xmlns, p) : document.createElement(p);
  for (const [r, d] of Object.entries(t)) if (r === "children" && d) for (const [h, i] of Object.entries(d)) i instanceof Node ? s.appendChild(i) : typeof i == "string" ? s.appendChild(document.createTextNode(i)) : s.appendChild(ke(h, i));
  else r === "style" ? Object.assign(s.style, d) : r === "textContent" ? s.textContent = d : s.setAttribute(r, d.toString());
  return s;
}
function oe(p, t, s) {
  const r = ke(p, t || {});
  return s == null || s.appendChild(r), r;
}
var He = Object.freeze({ __proto__: null, createElement: oe, default: oe });
const je = { fetchBlob: function(p, t, s) {
  return G(this, void 0, void 0, (function* () {
    const r = yield fetch(p, s);
    if (r.status >= 400) throw new Error(`Failed to fetch ${p}: ${r.status} (${r.statusText})`);
    return (function(d, h) {
      G(this, void 0, void 0, (function* () {
        if (!d.body || !d.headers) return;
        const i = d.body.getReader(), n = Number(d.headers.get("Content-Length")) || 0;
        let e = 0;
        const o = (a) => {
          e += (a == null ? void 0 : a.length) || 0;
          const f = Math.round(e / n * 100);
          h(f);
        };
        try {
          for (; ; ) {
            const a = yield i.read();
            if (a.done) break;
            o(a.value);
          }
        } catch (a) {
          console.warn("Progress tracking error:", a);
        }
      }));
    })(r.clone(), t), r.blob();
  }));
} };
function W(p) {
  let t = p;
  const s = /* @__PURE__ */ new Set();
  return { get value() {
    return t;
  }, set(r) {
    Object.is(t, r) || (t = r, s.forEach(((d) => d(t))));
  }, update(r) {
    this.set(r(t));
  }, subscribe: (r) => (s.add(r), () => s.delete(r)) };
}
function pt(p, t) {
  const s = W(p());
  return t.forEach(((r) => r.subscribe((() => {
    const d = p();
    Object.is(s.value, d) || s.set(d);
  })))), { get value() {
    return s.value;
  }, subscribe: (r) => s.subscribe(r) };
}
function ut(p, t) {
  let s;
  const r = () => {
    s && (s(), s = void 0), s = p();
  }, d = t.map(((h) => h.subscribe(r)));
  return r(), () => {
    s && (s(), s = void 0), d.forEach(((h) => h()));
  };
}
class We extends Dt {
  get isPlayingSignal() {
    return this._isPlaying;
  }
  get currentTimeSignal() {
    return this._currentTime;
  }
  get durationSignal() {
    return this._duration;
  }
  get volumeSignal() {
    return this._volume;
  }
  get mutedSignal() {
    return this._muted;
  }
  get playbackRateSignal() {
    return this._playbackRate;
  }
  get seekingSignal() {
    return this._seeking;
  }
  constructor(t) {
    super(), this.isExternalMedia = !1, this.reactiveMediaEventCleanups = [], t.media ? (this.media = t.media, this.isExternalMedia = !0) : this.media = document.createElement("audio"), this._isPlaying = W(!1), this._currentTime = W(0), this._duration = W(0), this._volume = W(this.media.volume), this._muted = W(this.media.muted), this._playbackRate = W(this.media.playbackRate || 1), this._seeking = W(!1), this.setupReactiveMediaEvents(), t.mediaControls && (this.media.controls = !0), t.autoplay && (this.media.autoplay = !0), t.playbackRate != null && this.onMediaEvent("canplay", (() => {
      t.playbackRate != null && (this.media.playbackRate = t.playbackRate);
    }), { once: !0 });
  }
  setupReactiveMediaEvents() {
    this.reactiveMediaEventCleanups.push(this.onMediaEvent("play", (() => {
      this._isPlaying.set(!0);
    }))), this.reactiveMediaEventCleanups.push(this.onMediaEvent("pause", (() => {
      this._isPlaying.set(!1);
    }))), this.reactiveMediaEventCleanups.push(this.onMediaEvent("ended", (() => {
      this._isPlaying.set(!1);
    }))), this.reactiveMediaEventCleanups.push(this.onMediaEvent("timeupdate", (() => {
      this._currentTime.set(this.media.currentTime);
    }))), this.reactiveMediaEventCleanups.push(this.onMediaEvent("durationchange", (() => {
      this._duration.set(this.media.duration || 0);
    }))), this.reactiveMediaEventCleanups.push(this.onMediaEvent("loadedmetadata", (() => {
      this._duration.set(this.media.duration || 0);
    }))), this.reactiveMediaEventCleanups.push(this.onMediaEvent("seeking", (() => {
      this._seeking.set(!0);
    }))), this.reactiveMediaEventCleanups.push(this.onMediaEvent("seeked", (() => {
      this._seeking.set(!1);
    }))), this.reactiveMediaEventCleanups.push(this.onMediaEvent("volumechange", (() => {
      this._volume.set(this.media.volume), this._muted.set(this.media.muted);
    }))), this.reactiveMediaEventCleanups.push(this.onMediaEvent("ratechange", (() => {
      this._playbackRate.set(this.media.playbackRate);
    })));
  }
  onMediaEvent(t, s, r) {
    return this.media.addEventListener(t, s, r), () => this.media.removeEventListener(t, s, r);
  }
  getSrc() {
    return this.media.currentSrc || this.media.src || "";
  }
  revokeSrc() {
    const t = this.getSrc();
    t.startsWith("blob:") && URL.revokeObjectURL(t);
  }
  canPlayType(t) {
    return this.media.canPlayType(t) !== "";
  }
  setSrc(t, s) {
    const r = this.getSrc();
    if (t && r === t) return;
    this.revokeSrc();
    const d = s instanceof Blob && (this.canPlayType(s.type) || !t) ? URL.createObjectURL(s) : t;
    if (r && this.media.removeAttribute("src"), d || t) try {
      this.media.src = d;
    } catch {
      this.media.src = t;
    }
  }
  destroy() {
    this.reactiveMediaEventCleanups.forEach(((t) => t())), this.reactiveMediaEventCleanups = [], this.isExternalMedia || (this.media.pause(), this.revokeSrc(), this.media.removeAttribute("src"), this.media.load(), this.media.remove());
  }
  setMediaElement(t) {
    this.reactiveMediaEventCleanups.forEach(((s) => s())), this.reactiveMediaEventCleanups = [], this.media = t, this.setupReactiveMediaEvents();
  }
  play() {
    return G(this, void 0, void 0, (function* () {
      try {
        return yield this.media.play();
      } catch (t) {
        if (t instanceof DOMException && t.name === "AbortError") return;
        throw t;
      }
    }));
  }
  pause() {
    this.media.pause();
  }
  isPlaying() {
    return !this.media.paused && !this.media.ended;
  }
  setTime(t) {
    this.media.currentTime = Math.max(0, Math.min(t, this.getDuration()));
  }
  getDuration() {
    return this.media.duration;
  }
  getCurrentTime() {
    return this.media.currentTime;
  }
  getVolume() {
    return this.media.volume;
  }
  setVolume(t) {
    this.media.volume = t;
  }
  getMuted() {
    return this.media.muted;
  }
  setMuted(t) {
    this.media.muted = t;
  }
  getPlaybackRate() {
    return this.media.playbackRate;
  }
  isSeeking() {
    return this.media.seeking;
  }
  setPlaybackRate(t, s) {
    s != null && (this.media.preservesPitch = s), this.media.playbackRate = t;
  }
  getMediaElement() {
    return this.media;
  }
  setSinkId(t) {
    return this.media.setSinkId(t);
  }
}
function Ue({ maxTop: p, maxBottom: t, halfHeight: s, vScale: r, barMinHeight: d = 0, barAlign: h }) {
  let i = Math.round(p * s * r), n = i + Math.round(t * s * r) || 1;
  return n < d && (n = d, h || (i = n / 2)), { topHeight: i, totalHeight: n };
}
function ze({ barAlign: p, halfHeight: t, topHeight: s, totalHeight: r, canvasHeight: d }) {
  return p === "top" ? 0 : p === "bottom" ? d - r : t - s;
}
function re(p, t, s) {
  const r = t - p.left, d = s - p.top;
  return [r / p.width, d / p.height];
}
function Se(p) {
  return !!(p.barWidth || p.barGap || p.barAlign);
}
function se(p, t) {
  if (!Se(t)) return p;
  const s = t.barWidth || 0.5, r = s + (t.barGap || s / 2);
  return r === 0 ? p : Math.floor(p / r) * r;
}
function ae({ scrollLeft: p, totalWidth: t, numCanvases: s }) {
  if (t === 0) return [0];
  const r = p / t, d = Math.floor(r * s);
  return [d - 1, d, d + 1];
}
function Ae(p) {
  const t = p._cleanup;
  typeof t == "function" && t();
}
function Ge(p) {
  const t = W({ scrollLeft: p.scrollLeft, scrollWidth: p.scrollWidth, clientWidth: p.clientWidth }), s = pt((() => (function(h) {
    const { scrollLeft: i, scrollWidth: n, clientWidth: e } = h;
    if (n === 0) return { startX: 0, endX: 1 };
    const o = i / n, a = (i + e) / n;
    return { startX: Math.max(0, Math.min(1, o)), endX: Math.max(0, Math.min(1, a)) };
  })(t.value)), [t]), r = pt((() => (function(h) {
    return { left: h.scrollLeft, right: h.scrollLeft + h.clientWidth };
  })(t.value)), [t]), d = () => {
    t.set({ scrollLeft: p.scrollLeft, scrollWidth: p.scrollWidth, clientWidth: p.clientWidth });
  };
  return p.addEventListener("scroll", d, { passive: !0 }), { scrollData: t, percentages: s, bounds: r, cleanup: () => {
    p.removeEventListener("scroll", d), Ae(t);
  } };
}
class Ke extends Dt {
  constructor(t, s) {
    super(), this.timeouts = [], this.isScrollable = !1, this.audioData = null, this.resizeObserver = null, this.lastContainerWidth = 0, this.isDragging = !1, this.subscriptions = [], this.unsubscribeOnScroll = [], this.dragStream = null, this.scrollStream = null, this.subscriptions = [], this.options = t;
    const r = this.parentFromOptionsContainer(t.container);
    this.parent = r;
    const [d, h] = this.initHtml();
    r.appendChild(d), this.container = d, this.scrollContainer = h.querySelector(".scroll"), this.wrapper = h.querySelector(".wrapper"), this.canvasWrapper = h.querySelector(".canvases"), this.progressWrapper = h.querySelector(".progress"), this.cursor = h.querySelector(".cursor"), s && h.appendChild(s), this.initEvents();
  }
  parentFromOptionsContainer(t) {
    let s;
    if (typeof t == "string" ? s = document.querySelector(t) : t instanceof HTMLElement && (s = t), !s) throw new Error("Container not found");
    return s;
  }
  initEvents() {
    this.wrapper.addEventListener("click", ((s) => {
      const r = this.wrapper.getBoundingClientRect(), [d, h] = re(r, s.clientX, s.clientY);
      this.emit("click", d, h);
    })), this.wrapper.addEventListener("dblclick", ((s) => {
      const r = this.wrapper.getBoundingClientRect(), [d, h] = re(r, s.clientX, s.clientY);
      this.emit("dblclick", d, h);
    })), this.options.dragToSeek !== !0 && typeof this.options.dragToSeek != "object" || this.initDrag(), this.scrollStream = Ge(this.scrollContainer);
    const t = ut((() => {
      const { startX: s, endX: r } = this.scrollStream.percentages.value, { left: d, right: h } = this.scrollStream.bounds.value;
      this.emit("scroll", s, r, d, h);
    }), [this.scrollStream.percentages, this.scrollStream.bounds]);
    if (this.subscriptions.push(t), typeof ResizeObserver == "function") {
      const s = this.createDelay(100);
      this.resizeObserver = new ResizeObserver((() => {
        s().then((() => this.onContainerResize())).catch((() => {
        }));
      })), this.resizeObserver.observe(this.scrollContainer);
    }
  }
  onContainerResize() {
    const t = this.parent.clientWidth;
    t === this.lastContainerWidth && this.options.height !== "auto" || (this.lastContainerWidth = t, this.reRender(), this.emit("resize"));
  }
  initDrag() {
    if (this.dragStream) return;
    this.dragStream = (function(s, r = {}) {
      const { threshold: d = 3, mouseButton: h = 0, touchDelay: i = 100 } = r, n = W(null), e = /* @__PURE__ */ new Map(), o = matchMedia("(pointer: coarse)").matches;
      let a = () => {
      };
      const f = (c) => {
        if (c.button !== h || (e.set(c.pointerId, c), e.size > 1)) return;
        let y = c.clientX, l = c.clientY, u = !1;
        const g = Date.now(), m = s.getBoundingClientRect(), { left: v, top: b } = m, E = (I) => {
          if (I.defaultPrevented || e.size > 1 || o && Date.now() - g < i) return;
          const T = I.clientX, P = I.clientY, F = T - y, B = P - l;
          (u || Math.abs(F) > d || Math.abs(B) > d) && (I.preventDefault(), I.stopPropagation(), u || (n.set({ type: "start", x: y - v, y: l - b }), u = !0), n.set({ type: "move", x: T - v, y: P - b, deltaX: F, deltaY: B }), y = T, l = P);
        }, _ = (I) => {
          if (e.delete(I.pointerId), u) {
            const T = I.clientX, P = I.clientY;
            n.set({ type: "end", x: T - v, y: P - b });
          }
          a();
        }, k = (I) => {
          e.delete(I.pointerId), I.relatedTarget && I.relatedTarget !== document.documentElement || _(I);
        }, x = (I) => {
          u && (I.stopPropagation(), I.preventDefault());
        }, q = (I) => {
          I.defaultPrevented || e.size > 1 || u && I.preventDefault();
        };
        document.addEventListener("pointermove", E), document.addEventListener("pointerup", _), document.addEventListener("pointerout", k), document.addEventListener("pointercancel", k), document.addEventListener("touchmove", q, { passive: !1 }), document.addEventListener("click", x, { capture: !0 }), a = () => {
          document.removeEventListener("pointermove", E), document.removeEventListener("pointerup", _), document.removeEventListener("pointerout", k), document.removeEventListener("pointercancel", k), document.removeEventListener("touchmove", q), setTimeout((() => {
            document.removeEventListener("click", x, { capture: !0 });
          }), 10);
        };
      };
      return s.addEventListener("pointerdown", f), { signal: n, cleanup: () => {
        a(), s.removeEventListener("pointerdown", f), e.clear(), Ae(n);
      } };
    })(this.wrapper);
    const t = ut((() => {
      const s = this.dragStream.signal.value;
      if (!s) return;
      const r = this.wrapper.getBoundingClientRect().width, d = (h = s.x / r) < 0 ? 0 : h > 1 ? 1 : h;
      var h;
      s.type === "start" ? (this.isDragging = !0, this.emit("dragstart", d)) : s.type === "move" ? this.emit("drag", d) : s.type === "end" && (this.isDragging = !1, this.emit("dragend", d));
    }), [this.dragStream.signal]);
    this.subscriptions.push(t);
  }
  initHtml() {
    const t = document.createElement("div"), s = t.attachShadow({ mode: "open" }), r = this.options.cspNonce && typeof this.options.cspNonce == "string" ? this.options.cspNonce.replace(/"/g, "") : "";
    return s.innerHTML = `
      <style${r ? ` nonce="${r}"` : ""}>
        :host {
          user-select: none;
          min-width: 1px;
        }
        :host audio {
          display: block;
          width: 100%;
        }
        :host .scroll {
          overflow-x: auto;
          overflow-y: hidden;
          width: 100%;
          position: relative;
        }
        :host .noScrollbar {
          scrollbar-color: transparent;
          scrollbar-width: none;
        }
        :host .noScrollbar::-webkit-scrollbar {
          display: none;
          -webkit-appearance: none;
        }
        :host .wrapper {
          position: relative;
          overflow: visible;
          z-index: 2;
        }
        :host .canvases {
          min-height: ${this.getHeight(this.options.height, this.options.splitChannels)}px;
          pointer-events: none;
        }
        :host .canvases > div {
          position: relative;
        }
        :host canvas {
          display: block;
          position: absolute;
          top: 0;
          image-rendering: pixelated;
        }
        :host .progress {
          pointer-events: none;
          position: absolute;
          z-index: 2;
          top: 0;
          left: 0;
          width: 0;
          height: 100%;
          overflow: hidden;
        }
        :host .progress > div {
          position: relative;
        }
        :host .cursor {
          pointer-events: none;
          position: absolute;
          z-index: 5;
          top: 0;
          left: 0;
          height: 100%;
          border-radius: 2px;
        }
      </style>

      <div class="scroll" part="scroll">
        <div class="wrapper" part="wrapper">
          <div class="canvases" part="canvases"></div>
          <div class="progress" part="progress"></div>
          <div class="cursor" part="cursor"></div>
        </div>
      </div>
    `, [t, s];
  }
  setOptions(t) {
    var s;
    if (this.options.container !== t.container) {
      const r = this.parentFromOptionsContainer(t.container);
      r.appendChild(this.container), this.parent = r;
    }
    t.dragToSeek === !0 || typeof this.options.dragToSeek == "object" ? this.initDrag() : ((s = this.dragStream) === null || s === void 0 || s.cleanup(), this.dragStream = null), this.options = t, this.reRender();
  }
  getWrapper() {
    return this.wrapper;
  }
  getWidth() {
    return this.scrollContainer.clientWidth;
  }
  getScroll() {
    return this.scrollContainer.scrollLeft;
  }
  setScroll(t) {
    this.scrollContainer.scrollLeft = t;
  }
  setScrollPercentage(t) {
    const { scrollWidth: s } = this.scrollContainer, r = s * t;
    this.setScroll(r);
  }
  destroy() {
    var t;
    this.subscriptions.forEach(((s) => s())), this.container.remove(), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null), (t = this.unsubscribeOnScroll) === null || t === void 0 || t.forEach(((s) => s())), this.unsubscribeOnScroll = [], this.dragStream && (this.dragStream.cleanup(), this.dragStream = null), this.scrollStream && (this.scrollStream.cleanup(), this.scrollStream = null);
  }
  createDelay(t = 10) {
    let s, r;
    const d = () => {
      s && (clearTimeout(s), s = void 0), r && (r(), r = void 0);
    };
    return this.timeouts.push(d), () => new Promise(((h, i) => {
      d(), r = i, s = setTimeout((() => {
        s = void 0, r = void 0, h();
      }), t);
    }));
  }
  getHeight(t, s) {
    var r;
    const d = ((r = this.audioData) === null || r === void 0 ? void 0 : r.numberOfChannels) || 1;
    return (function({ optionsHeight: h, optionsSplitChannels: i, parentHeight: n, numberOfChannels: e, defaultHeight: o = 128 }) {
      if (h == null) return o;
      const a = Number(h);
      if (!isNaN(a)) return a;
      if (h === "auto") {
        const f = n || o;
        return i != null && i.every(((c) => !c.overlay)) ? f / e : f;
      }
      return o;
    })({ optionsHeight: t, optionsSplitChannels: s, parentHeight: this.parent.clientHeight, numberOfChannels: d, defaultHeight: 128 });
  }
  convertColorValues(t, s) {
    return (function(r, d, h) {
      if (!Array.isArray(r)) return r || "";
      if (r.length === 0) return "#999";
      if (r.length < 2) return r[0] || "";
      const i = document.createElement("canvas"), n = i.getContext("2d"), e = h ?? i.height * d, o = n.createLinearGradient(0, 0, 0, e || d), a = 1 / (r.length - 1);
      return r.forEach(((f, c) => {
        o.addColorStop(c * a, f);
      })), o;
    })(t, this.getPixelRatio(), s == null ? void 0 : s.canvas.height);
  }
  getPixelRatio() {
    return t = window.devicePixelRatio, Math.max(1, t || 1);
    var t;
  }
  renderBarWaveform(t, s, r, d) {
    const { width: h, height: i } = r.canvas, { halfHeight: n, barWidth: e, barRadius: o, barIndexScale: a, barSpacing: f, barMinHeight: c } = (function({ width: l, height: u, length: g, options: m, pixelRatio: v }) {
      const b = u / 2, E = m.barWidth ? m.barWidth * v : 1, _ = m.barGap ? m.barGap * v : m.barWidth ? E / 2 : 0, k = E + _ || 1;
      return { halfHeight: b, barWidth: E, barGap: _, barRadius: m.barRadius || 0, barMinHeight: m.barMinHeight ? m.barMinHeight * v : 0, barIndexScale: g > 0 ? l / k / g : 0, barSpacing: k };
    })({ width: h, height: i, length: (t[0] || []).length, options: s, pixelRatio: this.getPixelRatio() }), y = (function({ channelData: l, barIndexScale: u, barSpacing: g, barWidth: m, halfHeight: v, vScale: b, canvasHeight: E, barAlign: _, barMinHeight: k }) {
      const x = l[0] || [], q = l[1] || x, I = x.length, T = [];
      let P = 0, F = 0, B = 0;
      for (let R = 0; R <= I; R++) {
        const U = Math.round(R * u);
        if (U > P) {
          const { topHeight: Q, totalHeight: st } = Ue({ maxTop: F, maxBottom: B, halfHeight: v, vScale: b, barMinHeight: k, barAlign: _ }), O = ze({ barAlign: _, halfHeight: v, topHeight: Q, totalHeight: st, canvasHeight: E });
          T.push({ x: P * g, y: O, width: m, height: st }), P = U, F = 0, B = 0;
        }
        const $ = Math.abs(x[R] || 0), rt = Math.abs(q[R] || 0);
        $ > F && (F = $), rt > B && (B = rt);
      }
      return T;
    })({ channelData: t, barIndexScale: a, barSpacing: f, barWidth: e, halfHeight: n, vScale: d, canvasHeight: i, barAlign: s.barAlign, barMinHeight: c });
    r.beginPath();
    for (const l of y) o && "roundRect" in r ? r.roundRect(l.x, l.y, l.width, l.height, o) : r.rect(l.x, l.y, l.width, l.height);
    r.fill(), r.closePath();
  }
  renderLineWaveform(t, s, r, d) {
    const { width: h, height: i } = r.canvas, n = (function({ channelData: e, width: o, height: a, vScale: f }) {
      const c = a / 2, y = e[0] || [];
      return [y, e[1] || y].map(((l, u) => {
        const g = l.length, m = g ? o / g : 0, v = c, b = u === 0 ? -1 : 1, E = [{ x: 0, y: v }];
        let _ = 0, k = 0;
        for (let x = 0; x <= g; x++) {
          const q = Math.round(x * m);
          if (q > _) {
            const T = v + (Math.round(k * c * f) || 1) * b;
            E.push({ x: _, y: T }), _ = q, k = 0;
          }
          const I = Math.abs(l[x] || 0);
          I > k && (k = I);
        }
        return E.push({ x: _, y: v }), E;
      }));
    })({ channelData: t, width: h, height: i, vScale: d });
    r.beginPath();
    for (const e of n) if (e.length) {
      r.moveTo(e[0].x, e[0].y);
      for (let o = 1; o < e.length; o++) {
        const a = e[o];
        r.lineTo(a.x, a.y);
      }
    }
    r.fill(), r.closePath();
  }
  renderWaveform(t, s, r) {
    if (r.fillStyle = this.convertColorValues(s.waveColor, r), s.renderFunction) return void s.renderFunction(t, r);
    const d = (function({ channelData: h, barHeight: i, normalize: n, maxPeak: e }) {
      var o;
      const a = i || 1;
      if (!n) return a;
      const f = h[0];
      if (!f || f.length === 0) return a;
      let c = e ?? 0;
      if (!e) for (let y = 0; y < f.length; y++) {
        const l = (o = f[y]) !== null && o !== void 0 ? o : 0, u = Math.abs(l);
        u > c && (c = u);
      }
      return c ? a / c : a;
    })({ channelData: t, barHeight: s.barHeight, normalize: s.normalize, maxPeak: s.maxPeak });
    Se(s) ? this.renderBarWaveform(t, s, r, d) : this.renderLineWaveform(t, s, r, d);
  }
  renderSingleCanvas(t, s, r, d, h, i, n) {
    const e = this.getPixelRatio(), o = document.createElement("canvas");
    o.width = Math.round(r * e), o.height = Math.round(d * e), o.style.width = `${r}px`, o.style.height = `${d}px`, o.style.left = `${Math.round(h)}px`, i.appendChild(o);
    const a = o.getContext("2d");
    if (s.renderFunction ? (a.fillStyle = this.convertColorValues(s.waveColor, a), s.renderFunction(t, a)) : this.renderWaveform(t, s, a), o.width > 0 && o.height > 0) {
      const f = o.cloneNode(), c = f.getContext("2d");
      c.drawImage(o, 0, 0), c.globalCompositeOperation = "source-in", c.fillStyle = this.convertColorValues(s.progressColor, c), c.fillRect(0, 0, o.width, o.height), n.appendChild(f);
    }
  }
  renderMultiCanvas(t, s, r, d, h, i) {
    const n = this.getPixelRatio(), { clientWidth: e } = this.scrollContainer, o = r / n, a = (function({ clientWidth: l, totalWidth: u, options: g }) {
      return se(Math.min(8e3, l, u), g);
    })({ clientWidth: e, totalWidth: o, options: s });
    let f = {};
    if (a === 0) return;
    const c = (l) => {
      if (l < 0 || l >= y || f[l]) return;
      f[l] = !0;
      const u = l * a;
      let g = Math.min(o - u, a);
      if (g = se(g, s), g <= 0) return;
      const m = (function({ channelData: v, offset: b, clampedWidth: E, totalWidth: _ }) {
        return v.map(((k) => {
          const x = Math.floor(b / _ * k.length), q = Math.floor((b + E) / _ * k.length);
          return k.slice(x, q);
        }));
      })({ channelData: t, offset: u, clampedWidth: g, totalWidth: o });
      this.renderSingleCanvas(m, s, g, d, u, h, i);
    }, y = Math.ceil(o / a);
    if (!this.isScrollable) {
      for (let l = 0; l < y; l++) c(l);
      return;
    }
    if (ae({ scrollLeft: this.scrollContainer.scrollLeft, totalWidth: o, numCanvases: y }).forEach(((l) => c(l))), y > 1) {
      const l = this.on("scroll", (() => {
        const { scrollLeft: u } = this.scrollContainer;
        Object.keys(f).length > 10 && (h.innerHTML = "", i.innerHTML = "", f = {}), ae({ scrollLeft: u, totalWidth: o, numCanvases: y }).forEach(((g) => c(g)));
      }));
      this.unsubscribeOnScroll.push(l);
    }
  }
  renderChannel(t, s, r, d) {
    var { overlay: h } = s, i = (function(a, f) {
      var c = {};
      for (var y in a) Object.prototype.hasOwnProperty.call(a, y) && f.indexOf(y) < 0 && (c[y] = a[y]);
      if (a != null && typeof Object.getOwnPropertySymbols == "function") {
        var l = 0;
        for (y = Object.getOwnPropertySymbols(a); l < y.length; l++) f.indexOf(y[l]) < 0 && Object.prototype.propertyIsEnumerable.call(a, y[l]) && (c[y[l]] = a[y[l]]);
      }
      return c;
    })(s, ["overlay"]);
    const n = document.createElement("div"), e = this.getHeight(i.height, i.splitChannels);
    n.style.height = `${e}px`, h && d > 0 && (n.style.marginTop = `-${e}px`), this.canvasWrapper.style.minHeight = `${e}px`, this.canvasWrapper.appendChild(n);
    const o = n.cloneNode();
    this.progressWrapper.appendChild(o), this.renderMultiCanvas(t, i, r, e, n, o);
  }
  render(t) {
    return G(this, void 0, void 0, (function* () {
      var s;
      this.timeouts.forEach(((o) => o())), this.timeouts = [], this.canvasWrapper.innerHTML = "", this.progressWrapper.innerHTML = "", this.options.width != null && (this.scrollContainer.style.width = typeof this.options.width == "number" ? `${this.options.width}px` : this.options.width);
      const r = this.getPixelRatio(), d = this.scrollContainer.clientWidth, { scrollWidth: h, isScrollable: i, useParentWidth: n, width: e } = (function({ duration: o, minPxPerSec: a = 0, parentWidth: f, fillParent: c, pixelRatio: y }) {
        const l = Math.ceil(o * a), u = l > f, g = !!(c && !u);
        return { scrollWidth: l, isScrollable: u, useParentWidth: g, width: (g ? f : l) * y };
      })({ duration: t.duration, minPxPerSec: this.options.minPxPerSec || 0, parentWidth: d, fillParent: this.options.fillParent, pixelRatio: r });
      if (this.isScrollable = i, this.wrapper.style.width = n ? "100%" : `${h}px`, this.scrollContainer.style.overflowX = this.isScrollable ? "auto" : "hidden", this.scrollContainer.classList.toggle("noScrollbar", !!this.options.hideScrollbar), this.cursor.style.backgroundColor = `${this.options.cursorColor || this.options.progressColor}`, this.cursor.style.width = `${this.options.cursorWidth}px`, this.audioData = t, this.emit("render"), this.options.splitChannels) for (let o = 0; o < t.numberOfChannels; o++) {
        const a = Object.assign(Object.assign({}, this.options), (s = this.options.splitChannels) === null || s === void 0 ? void 0 : s[o]);
        this.renderChannel([t.getChannelData(o)], a, e, o);
      }
      else {
        const o = [t.getChannelData(0)];
        t.numberOfChannels > 1 && o.push(t.getChannelData(1)), this.renderChannel(o, this.options, e, 0);
      }
      Promise.resolve().then((() => this.emit("rendered")));
    }));
  }
  reRender() {
    if (this.unsubscribeOnScroll.forEach(((r) => r())), this.unsubscribeOnScroll = [], !this.audioData) return;
    const { scrollWidth: t } = this.scrollContainer, { right: s } = this.progressWrapper.getBoundingClientRect();
    if (this.render(this.audioData), this.isScrollable && t !== this.scrollContainer.scrollWidth) {
      const { right: r } = this.progressWrapper.getBoundingClientRect(), d = (function(h) {
        const i = 2 * h;
        return (i < 0 ? Math.floor(i) : Math.ceil(i)) / 2;
      })(r - s);
      this.scrollContainer.scrollLeft += d;
    }
  }
  zoom(t) {
    this.options.minPxPerSec = t, this.reRender();
  }
  scrollIntoView(t, s = !1) {
    var r;
    const { scrollLeft: d, scrollWidth: h, clientWidth: i } = this.scrollContainer, n = t * h, e = d, o = d + i, a = i / 2;
    if (this.isDragging)
      n + 30 > o ? this.scrollContainer.scrollLeft += 30 : n - 30 < e && (this.scrollContainer.scrollLeft -= 30);
    else {
      (n < e || n > o) && (this.scrollContainer.scrollLeft = n - (this.options.autoCenter ? a : 0));
      const f = n - d - a;
      if (s && this.options.autoCenter && f > 0) {
        const c = (r = this.audioData) === null || r === void 0 ? void 0 : r.duration;
        if (c === void 0 || c <= 0) return void (this.scrollContainer.scrollLeft += f);
        const y = h / c;
        this.scrollContainer.scrollLeft += y <= 600 ? Math.min(f, 10) : f;
      }
    }
  }
  renderProgress(t, s) {
    if (isNaN(t)) return;
    const r = 100 * t;
    this.canvasWrapper.style.clipPath = `polygon(${r}% 0%, 100% 0%, 100% 100%, ${r}% 100%)`, this.progressWrapper.style.width = `${r}%`, this.cursor.style.left = `${r}%`, this.cursor.style.transform = this.options.cursorWidth ? `translateX(-${t * this.options.cursorWidth}px)` : "", this.isScrollable && this.options.autoScroll && this.audioData && this.audioData.duration > 0 && this.scrollIntoView(t, s);
  }
  exportImage(t, s, r) {
    return G(this, void 0, void 0, (function* () {
      const d = this.canvasWrapper.querySelectorAll("canvas");
      if (!d.length) throw new Error("No waveform data");
      if (r === "dataURL") {
        const h = Array.from(d).map(((i) => i.toDataURL(t, s)));
        return Promise.resolve(h);
      }
      return Promise.all(Array.from(d).map(((h) => new Promise(((i, n) => {
        h.toBlob(((e) => {
          e ? i(e) : n(new Error("Could not export image"));
        }), t, s);
      })))));
    }));
  }
}
class $e extends Dt {
  constructor() {
    super(...arguments), this.animationFrameId = null, this.isRunning = !1;
  }
  start() {
    if (this.isRunning) return;
    this.isRunning = !0;
    const t = () => {
      this.isRunning && (this.emit("tick"), this.animationFrameId = requestAnimationFrame(t));
    };
    t();
  }
  stop() {
    this.isRunning = !1, this.animationFrameId !== null && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null);
  }
  destroy() {
    this.stop();
  }
}
class $t extends Dt {
  constructor(t = new AudioContext()) {
    super(), this.bufferNode = null, this.playStartTime = 0, this.playbackPosition = 0, this._muted = !1, this._playbackRate = 1, this._duration = void 0, this.buffer = null, this.currentSrc = "", this.paused = !0, this.crossOrigin = null, this.seeking = !1, this.autoplay = !1, this.addEventListener = this.on, this.removeEventListener = this.un, this.audioContext = t, this.gainNode = this.audioContext.createGain(), this.gainNode.connect(this.audioContext.destination);
  }
  load() {
    return G(this, void 0, void 0, (function* () {
    }));
  }
  get src() {
    return this.currentSrc;
  }
  set src(t) {
    if (this.currentSrc = t, this._duration = void 0, !t) return this.buffer = null, void this.emit("emptied");
    fetch(t).then(((s) => {
      if (s.status >= 400) throw new Error(`Failed to fetch ${t}: ${s.status} (${s.statusText})`);
      return s.arrayBuffer();
    })).then(((s) => this.currentSrc !== t ? null : this.audioContext.decodeAudioData(s))).then(((s) => {
      this.currentSrc === t && (this.buffer = s, this.emit("loadedmetadata"), this.emit("canplay"), this.autoplay && this.play());
    })).catch(((s) => {
      console.error("WebAudioPlayer load error:", s);
    }));
  }
  _play() {
    if (!this.paused) return;
    this.paused = !1, this.bufferNode && (this.bufferNode.onended = null, this.bufferNode.disconnect()), this.bufferNode = this.audioContext.createBufferSource(), this.buffer && (this.bufferNode.buffer = this.buffer), this.bufferNode.playbackRate.value = this._playbackRate, this.bufferNode.connect(this.gainNode);
    let t = this.playbackPosition;
    (t >= this.duration || t < 0) && (t = 0, this.playbackPosition = 0), this.bufferNode.start(this.audioContext.currentTime, t), this.playStartTime = this.audioContext.currentTime, this.bufferNode.onended = () => {
      this.currentTime >= this.duration && (this.pause(), this.emit("ended"));
    };
  }
  _pause() {
    var t;
    this.paused = !0, (t = this.bufferNode) === null || t === void 0 || t.stop(), this.playbackPosition += (this.audioContext.currentTime - this.playStartTime) * this._playbackRate;
  }
  play() {
    return G(this, void 0, void 0, (function* () {
      this.paused && (this._play(), this.emit("play"));
    }));
  }
  pause() {
    this.paused || (this._pause(), this.emit("pause"));
  }
  stopAt(t) {
    const s = t - this.currentTime, r = this.bufferNode;
    r == null || r.stop(this.audioContext.currentTime + s), r == null || r.addEventListener("ended", (() => {
      r === this.bufferNode && (this.bufferNode = null, this.pause());
    }), { once: !0 });
  }
  setSinkId(t) {
    return G(this, void 0, void 0, (function* () {
      return this.audioContext.setSinkId(t);
    }));
  }
  get playbackRate() {
    return this._playbackRate;
  }
  set playbackRate(t) {
    const s = !this.paused;
    s && this._pause(), this._playbackRate = t, s && this._play(), this.bufferNode && (this.bufferNode.playbackRate.value = t);
  }
  get currentTime() {
    return this.paused ? this.playbackPosition : this.playbackPosition + (this.audioContext.currentTime - this.playStartTime) * this._playbackRate;
  }
  set currentTime(t) {
    const s = !this.paused;
    s && this._pause(), this.playbackPosition = t, s && this._play(), this.emit("seeking"), this.emit("timeupdate");
  }
  get duration() {
    var t, s;
    return (t = this._duration) !== null && t !== void 0 ? t : ((s = this.buffer) === null || s === void 0 ? void 0 : s.duration) || 0;
  }
  set duration(t) {
    this._duration = t;
  }
  get volume() {
    return this.gainNode.gain.value;
  }
  set volume(t) {
    this.gainNode.gain.value = t, this.emit("volumechange");
  }
  get muted() {
    return this._muted;
  }
  set muted(t) {
    this._muted !== t && (this._muted = t, this._muted ? this.gainNode.disconnect() : this.gainNode.connect(this.audioContext.destination));
  }
  canPlayType(t) {
    return /^(audio|video)\//.test(t);
  }
  getGainNode() {
    return this.gainNode;
  }
  getChannelData() {
    const t = [];
    if (!this.buffer) return t;
    const s = this.buffer.numberOfChannels;
    for (let r = 0; r < s; r++) t.push(this.buffer.getChannelData(r));
    return t;
  }
  removeAttribute(t) {
    switch (t) {
      case "src":
        this.src = "";
        break;
      case "playbackRate":
        this.playbackRate = 0;
        break;
      case "currentTime":
        this.currentTime = 0;
        break;
      case "duration":
        this.duration = 0;
        break;
      case "volume":
        this.volume = 0;
        break;
      case "muted":
        this.muted = !1;
    }
  }
}
const Xe = { waveColor: "#999", progressColor: "#555", cursorWidth: 1, minPxPerSec: 0, fillParent: !0, interact: !0, dragToSeek: !1, autoScroll: !0, autoCenter: !0, sampleRate: 8e3 };
class Pt extends We {
  static create(t) {
    return new Pt(t);
  }
  getState() {
    return this.wavesurferState;
  }
  getRenderer() {
    return this.renderer;
  }
  constructor(t) {
    const s = t.media || (t.backend === "WebAudio" ? new $t() : void 0);
    super({ media: s, mediaControls: t.mediaControls, autoplay: t.autoplay, playbackRate: t.audioRate }), this.plugins = [], this.decodedData = null, this.stopAtPosition = null, this.subscriptions = [], this.mediaSubscriptions = [], this.abortController = null, this.reactiveCleanups = [], this.options = Object.assign({}, Xe, t);
    const { state: r, actions: d } = (function(n) {
      var e, o, a, f, c, y;
      const l = (e = n == null ? void 0 : n.currentTime) !== null && e !== void 0 ? e : W(0), u = (o = n == null ? void 0 : n.duration) !== null && o !== void 0 ? o : W(0), g = (a = n == null ? void 0 : n.isPlaying) !== null && a !== void 0 ? a : W(!1), m = (f = n == null ? void 0 : n.isSeeking) !== null && f !== void 0 ? f : W(!1), v = (c = n == null ? void 0 : n.volume) !== null && c !== void 0 ? c : W(1), b = (y = n == null ? void 0 : n.playbackRate) !== null && y !== void 0 ? y : W(1), E = W(null), _ = W(null), k = W(""), x = W(0), q = W(0), I = pt((() => !g.value), [g]), T = pt((() => E.value !== null), [E]), P = pt((() => T.value && u.value > 0), [T, u]), F = pt((() => l.value), [l]), B = pt((() => u.value > 0 ? l.value / u.value : 0), [l, u]);
      return { state: { currentTime: l, duration: u, isPlaying: g, isPaused: I, isSeeking: m, volume: v, playbackRate: b, audioBuffer: E, peaks: _, url: k, zoom: x, scrollPosition: q, canPlay: T, isReady: P, progress: F, progressPercent: B }, actions: { setCurrentTime: (R) => {
        const U = Math.max(0, Math.min(u.value || 1 / 0, R));
        l.set(U);
      }, setDuration: (R) => {
        u.set(Math.max(0, R));
      }, setPlaying: (R) => {
        g.set(R);
      }, setSeeking: (R) => {
        m.set(R);
      }, setVolume: (R) => {
        const U = Math.max(0, Math.min(1, R));
        v.set(U);
      }, setPlaybackRate: (R) => {
        const U = Math.max(0.1, Math.min(16, R));
        b.set(U);
      }, setAudioBuffer: (R) => {
        E.set(R), R && u.set(R.duration);
      }, setPeaks: (R) => {
        _.set(R);
      }, setUrl: (R) => {
        k.set(R);
      }, setZoom: (R) => {
        x.set(Math.max(0, R));
      }, setScrollPosition: (R) => {
        q.set(Math.max(0, R));
      } } };
    })({ isPlaying: this.isPlayingSignal, currentTime: this.currentTimeSignal, duration: this.durationSignal, volume: this.volumeSignal, playbackRate: this.playbackRateSignal, isSeeking: this.seekingSignal });
    this.wavesurferState = r, this.wavesurferActions = d, this.timer = new $e();
    const h = s ? void 0 : this.getMediaElement();
    this.renderer = new Ke(this.options, h), this.initPlayerEvents(), this.initRendererEvents(), this.initTimerEvents(), this.initReactiveState(), this.initPlugins();
    const i = this.options.url || this.getSrc() || "";
    Promise.resolve().then((() => {
      this.emit("init");
      const { peaks: n, duration: e } = this.options;
      (i || n && e) && this.load(i, n, e).catch(((o) => {
        this.emit("error", o instanceof Error ? o : new Error(String(o)));
      }));
    }));
  }
  updateProgress(t = this.getCurrentTime()) {
    return this.renderer.renderProgress(t / this.getDuration(), this.isPlaying()), t;
  }
  initTimerEvents() {
    this.subscriptions.push(this.timer.on("tick", (() => {
      if (!this.isSeeking()) {
        const t = this.updateProgress();
        this.emit("timeupdate", t), this.emit("audioprocess", t), this.stopAtPosition != null && this.isPlaying() && t >= this.stopAtPosition && this.pause();
      }
    })));
  }
  initReactiveState() {
    this.reactiveCleanups.push((function(t, s) {
      const r = [];
      r.push(ut((() => {
        const i = t.isPlaying.value;
        s.emit(i ? "play" : "pause");
      }), [t.isPlaying])), r.push(ut((() => {
        const i = t.currentTime.value;
        s.emit("timeupdate", i), t.isPlaying.value && s.emit("audioprocess", i);
      }), [t.currentTime, t.isPlaying])), r.push(ut((() => {
        t.isSeeking.value && s.emit("seeking", t.currentTime.value);
      }), [t.isSeeking, t.currentTime]));
      let d = !1;
      r.push(ut((() => {
        t.isReady.value && !d && (d = !0, s.emit("ready", t.duration.value));
      }), [t.isReady, t.duration]));
      let h = !1;
      return r.push(ut((() => {
        const i = t.isPlaying.value, n = t.currentTime.value, e = t.duration.value, o = e > 0 && n >= e;
        h && !i && o && s.emit("finish"), h = i && o;
      }), [t.isPlaying, t.currentTime, t.duration])), r.push(ut((() => {
        const i = t.zoom.value;
        i > 0 && s.emit("zoom", i);
      }), [t.zoom])), () => {
        r.forEach(((i) => i()));
      };
    })(this.wavesurferState, { emit: this.emit.bind(this) }));
  }
  initPlayerEvents() {
    this.isPlaying() && (this.emit("play"), this.timer.start()), this.mediaSubscriptions.push(this.onMediaEvent("timeupdate", (() => {
      const t = this.updateProgress();
      this.emit("timeupdate", t);
    })), this.onMediaEvent("play", (() => {
      this.emit("play"), this.timer.start();
    })), this.onMediaEvent("pause", (() => {
      this.emit("pause"), this.timer.stop(), this.stopAtPosition = null;
    })), this.onMediaEvent("emptied", (() => {
      this.timer.stop(), this.stopAtPosition = null;
    })), this.onMediaEvent("ended", (() => {
      this.emit("timeupdate", this.getDuration()), this.emit("finish"), this.stopAtPosition = null;
    })), this.onMediaEvent("seeking", (() => {
      this.emit("seeking", this.getCurrentTime());
    })), this.onMediaEvent("error", (() => {
      var t;
      this.emit("error", (t = this.getMediaElement().error) !== null && t !== void 0 ? t : new Error("Media error")), this.stopAtPosition = null;
    })));
  }
  initRendererEvents() {
    this.subscriptions.push(this.renderer.on("click", ((t, s) => {
      this.options.interact && (this.seekTo(t), this.emit("interaction", t * this.getDuration()), this.emit("click", t, s));
    })), this.renderer.on("dblclick", ((t, s) => {
      this.emit("dblclick", t, s);
    })), this.renderer.on("scroll", ((t, s, r, d) => {
      const h = this.getDuration();
      this.emit("scroll", t * h, s * h, r, d);
    })), this.renderer.on("render", (() => {
      this.emit("redraw");
    })), this.renderer.on("rendered", (() => {
      this.emit("redrawcomplete");
    })), this.renderer.on("dragstart", ((t) => {
      this.emit("dragstart", t);
    })), this.renderer.on("dragend", ((t) => {
      this.emit("dragend", t);
    })), this.renderer.on("resize", (() => {
      this.emit("resize");
    })));
    {
      let t;
      const s = this.renderer.on("drag", ((r) => {
        var d;
        if (!this.options.interact) return;
        this.renderer.renderProgress(r), clearTimeout(t);
        let h = 0;
        const i = this.options.dragToSeek;
        this.isPlaying() ? h = 0 : i === !0 ? h = 200 : i && typeof i == "object" && (h = (d = i.debounceTime) !== null && d !== void 0 ? d : 200), t = setTimeout((() => {
          this.seekTo(r);
        }), h), this.emit("interaction", r * this.getDuration()), this.emit("drag", r);
      }));
      this.subscriptions.push((() => {
        clearTimeout(t), s();
      }));
    }
  }
  initPlugins() {
    var t;
    !((t = this.options.plugins) === null || t === void 0) && t.length && this.options.plugins.forEach(((s) => {
      this.registerPlugin(s);
    }));
  }
  unsubscribePlayerEvents() {
    this.mediaSubscriptions.forEach(((t) => t())), this.mediaSubscriptions = [];
  }
  setOptions(t) {
    this.options = Object.assign({}, this.options, t), t.duration && !t.peaks && (this.decodedData = Ft.createBuffer(this.exportPeaks(), t.duration)), t.peaks && t.duration && (this.decodedData = Ft.createBuffer(t.peaks, t.duration)), this.renderer.setOptions(this.options), t.audioRate && this.setPlaybackRate(t.audioRate), t.mediaControls != null && (this.getMediaElement().controls = t.mediaControls);
  }
  registerPlugin(t) {
    if (this.plugins.includes(t)) return t;
    t._init(this), this.plugins.push(t);
    const s = t.once("destroy", (() => {
      this.plugins = this.plugins.filter(((r) => r !== t)), this.subscriptions = this.subscriptions.filter(((r) => r !== s));
    }));
    return this.subscriptions.push(s), t;
  }
  unregisterPlugin(t) {
    this.plugins = this.plugins.filter(((s) => s !== t)), t.destroy();
  }
  getWrapper() {
    return this.renderer.getWrapper();
  }
  getWidth() {
    return this.renderer.getWidth();
  }
  getScroll() {
    return this.renderer.getScroll();
  }
  setScroll(t) {
    return this.renderer.setScroll(t);
  }
  setScrollTime(t) {
    const s = t / this.getDuration();
    this.renderer.setScrollPercentage(s);
  }
  getActivePlugins() {
    return this.plugins;
  }
  loadAudio(t, s, r, d) {
    return G(this, void 0, void 0, (function* () {
      var h;
      if (this.emit("load", t), !this.options.media && this.isPlaying() && this.pause(), this.decodedData = null, this.stopAtPosition = null, (h = this.abortController) === null || h === void 0 || h.abort(), this.abortController = null, !s && !r) {
        const n = this.options.fetchParams || {};
        window.AbortController && !n.signal && (this.abortController = new AbortController(), n.signal = this.abortController.signal);
        const e = (a) => this.emit("loading", a);
        s = yield je.fetchBlob(t, e, n);
        const o = this.options.blobMimeType;
        o && (s = new Blob([s], { type: o }));
      }
      this.setSrc(t, s);
      const i = yield new Promise(((n) => {
        const e = d || this.getDuration();
        e ? n(e) : this.mediaSubscriptions.push(this.onMediaEvent("loadedmetadata", (() => n(this.getDuration())), { once: !0 }));
      }));
      if (!t && !s) {
        const n = this.getMediaElement();
        n instanceof $t && (n.duration = i);
      }
      if (r) this.decodedData = Ft.createBuffer(r, i || 0);
      else if (s) {
        const n = yield s.arrayBuffer();
        this.decodedData = yield Ft.decode(n, this.options.sampleRate);
      }
      this.decodedData && (this.emit("decode", this.getDuration()), this.renderer.render(this.decodedData)), this.emit("ready", this.getDuration());
    }));
  }
  load(t, s, r) {
    return G(this, void 0, void 0, (function* () {
      try {
        return yield this.loadAudio(t, void 0, s, r);
      } catch (d) {
        throw this.emit("error", d), d;
      }
    }));
  }
  loadBlob(t, s, r) {
    return G(this, void 0, void 0, (function* () {
      try {
        return yield this.loadAudio("", t, s, r);
      } catch (d) {
        throw this.emit("error", d), d;
      }
    }));
  }
  zoom(t) {
    if (!this.decodedData) throw new Error("No audio loaded");
    this.renderer.zoom(t), this.emit("zoom", t);
  }
  getDecodedData() {
    return this.decodedData;
  }
  exportPeaks({ channels: t = 2, maxLength: s = 8e3, precision: r = 1e4 } = {}) {
    if (!this.decodedData) throw new Error("The audio has not been decoded yet");
    const d = Math.min(t, this.decodedData.numberOfChannels), h = [];
    for (let i = 0; i < d; i++) {
      const n = this.decodedData.getChannelData(i), e = [], o = n.length / s;
      for (let a = 0; a < s; a++) {
        const f = n.slice(Math.floor(a * o), Math.ceil((a + 1) * o));
        let c = 0;
        for (let y = 0; y < f.length; y++) {
          const l = f[y];
          Math.abs(l) > Math.abs(c) && (c = l);
        }
        e.push(Math.round(c * r) / r);
      }
      h.push(e);
    }
    return h;
  }
  getDuration() {
    let t = super.getDuration() || 0;
    return t !== 0 && t !== 1 / 0 || !this.decodedData || (t = this.decodedData.duration), t;
  }
  toggleInteraction(t) {
    this.options.interact = t;
  }
  setTime(t) {
    this.stopAtPosition = null, super.setTime(t), this.updateProgress(t), this.emit("timeupdate", t);
  }
  seekTo(t) {
    const s = this.getDuration() * t;
    this.setTime(s);
  }
  play(t, s) {
    const r = Object.create(null, { play: { get: () => super.play } });
    return G(this, void 0, void 0, (function* () {
      t != null && this.setTime(t);
      const d = yield r.play.call(this);
      return s != null && (this.media instanceof $t ? this.media.stopAt(s) : this.stopAtPosition = s), d;
    }));
  }
  playPause() {
    return G(this, void 0, void 0, (function* () {
      return this.isPlaying() ? this.pause() : this.play();
    }));
  }
  stop() {
    this.pause(), this.setTime(0);
  }
  skip(t) {
    this.setTime(this.getCurrentTime() + t);
  }
  empty() {
    this.load("", [[0]], 1e-3);
  }
  setMediaElement(t) {
    this.unsubscribePlayerEvents(), super.setMediaElement(t), this.initPlayerEvents();
  }
  exportImage() {
    return G(this, arguments, void 0, (function* (t = "image/png", s = 1, r = "dataURL") {
      return this.renderer.exportImage(t, s, r);
    }));
  }
  destroy() {
    var t;
    this.emit("destroy"), (t = this.abortController) === null || t === void 0 || t.abort(), this.plugins.forEach(((s) => s.destroy())), this.subscriptions.forEach(((s) => s())), this.unsubscribePlayerEvents(), this.reactiveCleanups.forEach(((s) => s())), this.reactiveCleanups = [], this.timer.destroy(), this.renderer.destroy(), super.destroy();
  }
}
Pt.BasePlugin = class extends Dt {
  constructor(p) {
    super(), this.subscriptions = [], this.isDestroyed = !1, this.options = p;
  }
  onInit() {
  }
  _init(p) {
    this.isDestroyed && (this.subscriptions = [], this.isDestroyed = !1), this.wavesurfer = p, this.onInit();
  }
  destroy() {
    this.emit("destroy"), this.subscriptions.forEach(((p) => p())), this.subscriptions = [], this.isDestroyed = !0, this.wavesurfer = void 0;
  }
}, Pt.dom = He;
const le = "data-mixer-waveform", Ct = "lnWaveform";
if (!window[Ct]) {
  let p = function(u, g, m) {
    u.dispatchEvent(new CustomEvent(g, {
      bubbles: !0,
      detail: m || {}
    }));
  }, t = function(u) {
    const g = Math.floor(u / 60), m = Math.floor(u % 60);
    return g + ":" + (m < 10 ? "0" : "") + m;
  }, s = function(u) {
    const g = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
    for (let m = 0; m < g.length; m++)
      if (g[m] >= u) return g[m];
    return g[g.length - 1];
  }, r = function(u) {
    const g = u[0].clientX - u[1].clientX, m = u[0].clientY - u[1].clientY;
    return Math.sqrt(g * g + m * m);
  }, d = function(u) {
    h(u);
  }, h = function(u) {
    const g = Array.from(u.querySelectorAll("[" + le + "]"));
    u.hasAttribute && u.hasAttribute(le) && g.push(u), g.forEach(function(m) {
      m[Ct] || (m[Ct] = new i(m));
    });
  }, i = function(u) {
    return this.dom = u, u[Ct] = this, this._surfer = null, this._audio = null, this._hasCachedPeaks = !1, this._duration = 0, this._zoomLevel = 0, this._zoomFactors = [1, 2, 5, 10], this._els = {
      progress: u.querySelector(".waveform-progress"),
      playhead: u.querySelector(".waveform-playhead"),
      cueRegion: u.querySelector(".cue-region"),
      cueStart: u.querySelector(".cue-marker--start"),
      cueEnd: u.querySelector(".cue-marker--end"),
      cuePending: u.querySelector(".cue-marker--pending"),
      timeline: u.querySelector(".waveform-timeline")
    }, this._bindEvents(), this;
  }, e = function() {
    new MutationObserver(function(g) {
      g.forEach(function(m) {
        m.type === "childList" && m.addedNodes.forEach(function(v) {
          v.nodeType === 1 && h(v);
        });
      });
    }).observe(document.body, {
      childList: !0,
      subtree: !0
    });
  };
  var Wt = p, Ht = t, In = s, qn = r, Ot = d, Mt = h, Rt = i, Nt = e;
  i.prototype._bindEvents = function() {
    const u = this, g = this.dom.closest(".waveform-container") || this.dom.parentElement;
    g && g.addEventListener("click", function(v) {
      const b = v.target.closest("[data-mixer-zoom]");
      b && u.zoom(b.getAttribute("data-mixer-zoom"));
    }), this.dom.addEventListener("wheel", function(v) {
      v.ctrlKey && (v.preventDefault(), u.zoom(v.deltaY < 0 ? "in" : "out"));
    }, { passive: !1 });
    let m = 0;
    this.dom.addEventListener("touchstart", function(v) {
      v.touches.length === 2 && (m = r(v.touches));
    }, { passive: !0 }), this.dom.addEventListener("touchmove", function(v) {
      if (v.touches.length === 2) {
        const b = r(v.touches), E = b - m;
        Math.abs(E) > 30 && (u.zoom(E > 0 ? "in" : "out"), m = b);
      }
    }, { passive: !0 }), this.dom.addEventListener("ln-waveform:request-init", function(v) {
      u.init(v.detail.audio, v.detail.peaks, v.detail.peaksDuration);
    }), this.dom.addEventListener("ln-waveform:request-destroy", function() {
      u.destroy();
    }), this.dom.addEventListener("ln-waveform:request-set-progress", function(v) {
      u.setProgress(v.detail.percent);
    }), this.dom.addEventListener("ln-waveform:request-set-region", function(v) {
      u.setRegion(v.detail.startPct, v.detail.endPct);
    }), this.dom.addEventListener("ln-waveform:request-clear-region", function() {
      u.clearRegion();
    }), this.dom.addEventListener("ln-waveform:request-clear-all", function() {
      u.clearAll();
    }), this.dom.addEventListener("ln-waveform:request-set-pending-cue", function(v) {
      u.setPendingCue(v.detail.percent);
    }), this.dom.addEventListener("ln-waveform:request-clear-pending-cue", function() {
      u.clearPendingCue();
    });
  }, i.prototype.init = function(u, g, m) {
    if (this.destroy(), !u) return;
    this._audio = u;
    const v = this, b = getComputedStyle(this.dom).getPropertyValue("--deck-color").trim() || "#ffa500", E = {
      container: this.dom,
      waveColor: "rgba(136, 136, 136, 0.5)",
      progressColor: b,
      cursorWidth: 0,
      barWidth: 2,
      barGap: 1,
      barRadius: 1,
      height: 100,
      media: u,
      autoScroll: !0,
      autoCenter: !1
    };
    g && g.length > 0 && m > 0 && (E.peaks = g, E.duration = m), this._hasCachedPeaks = !!(g && g.length > 0 && m > 0), this._surfer = Pt.create(E), this._zoomLevel = 0, this.dom.classList.remove("waveform--zoomed"), this._relocateOverlays(), this._surfer.on("ready", function() {
      if (v._duration = v._surfer.getDuration() || u.duration || 0, v.dom.classList.remove("waveform--decoding"), v.dom.classList.add("waveform--loaded"), v._renderTimeline(), p(v.dom, "ln-waveform:ready", { duration: v._duration }), !v._hasCachedPeaks && v._surfer) {
        var _ = v._surfer.exportPeaks();
        _ && p(v.dom, "ln-waveform:peaks-available", {
          peaks: _,
          duration: v._duration
        });
      }
    }), this._surfer.on("decode", function(_) {
      !v._duration && _ > 0 && (v._duration = _, v._renderTimeline());
    }), this._surfer.on("error", function(_) {
      console.warn("[ln-waveform] WaveSurfer error:", _), v.dom.classList.remove("waveform--decoding");
    }), this._surfer.on("timeupdate", function(_) {
      p(v.dom, "ln-waveform:timeupdate", { currentTime: _ });
    }), this._surfer.on("finish", function() {
      p(v.dom, "ln-waveform:finish");
    }), this._surfer.on("seeking", function(_) {
      p(v.dom, "ln-waveform:seeked", { currentTime: _ });
    });
  }, i.prototype.destroy = function() {
    this._surfer && (this._restoreOverlays(), this._surfer.destroy(), this._surfer = null), this._audio = null, this._hasCachedPeaks = !1, this._duration = 0, this._zoomLevel = 0, this.dom.classList.remove("waveform--loaded"), this.dom.classList.remove("waveform--zoomed"), this._clearTimeline();
  };
  const n = "position:absolute;top:0;bottom:0;pointer-events:none;z-index:2;";
  i.prototype.setProgress = function(u) {
    this._els.progress && (this._els.progress.style.cssText = n + "left:0;width:" + u + "%;background:hsl(var(--accent)/0.08);transition:width 0.1s linear;"), this._els.playhead && (this._els.playhead.style.cssText = n + "left:" + u + "%;width:2px;background:#fff;box-shadow:0 0 6px rgba(255,255,255,0.5);transition:left 0.1s linear;");
  }, i.prototype.setRegion = function(u, g) {
    const m = this._els;
    m.cueStart && (m.cueStart.style.cssText = n + "left:" + u + "%;width:2px;background:hsl(var(--cue));"), m.cueEnd && (m.cueEnd.style.cssText = n + "left:" + g + "%;width:2px;background:hsl(var(--cue));opacity:0.6;"), m.cueRegion && (m.cueRegion.style.cssText = n + "left:" + u + "%;width:" + (g - u) + "%;background:hsl(var(--cue)/0.15);");
  }, i.prototype.clearRegion = function() {
    const u = this._els;
    u.cueStart && (u.cueStart.style.cssText = "display:none;"), u.cueEnd && (u.cueEnd.style.cssText = "display:none;"), u.cueRegion && (u.cueRegion.style.cssText = "display:none;");
  }, i.prototype.clearAll = function() {
    this.setProgress(0), this.clearRegion(), this.clearPendingCue();
  }, i.prototype.setPendingCue = function(u) {
    this._els.cuePending && (this._els.cuePending.style.cssText = n + "left:" + u + "%;width:2px;background:hsl(var(--cue));opacity:0.8;");
  }, i.prototype.clearPendingCue = function() {
    this._els.cuePending && (this._els.cuePending.style.cssText = "display:none;");
  }, i.prototype.exportPeaks = function() {
    return this._surfer ? this._surfer.exportPeaks() : null;
  }, i.prototype.hasCachedPeaks = function() {
    return this._hasCachedPeaks;
  }, i.prototype.zoom = function(u) {
    if (!this._surfer || !this._duration) return;
    if (u === "in" && this._zoomLevel < this._zoomFactors.length - 1)
      this._zoomLevel++;
    else if (u === "out" && this._zoomLevel > 0)
      this._zoomLevel--;
    else
      return;
    const g = this._zoomFactors[this._zoomLevel];
    if (g === 1)
      this._surfer.zoom(0);
    else {
      const b = this.dom.clientWidth / this._duration * g;
      this._surfer.zoom(b);
    }
    this.dom.classList.toggle("waveform--zoomed", this._zoomLevel > 0);
    const m = this;
    requestAnimationFrame(function() {
      m._renderTimeline();
    });
  }, i.prototype._relocateOverlays = function() {
    if (!this._surfer) return;
    const u = this._getWrapper();
    if (!u) return;
    u.style.position = "relative", u.style.paddingBottom = "20px";
    const g = this._els;
    g.cueRegion && u.appendChild(g.cueRegion), g.cueStart && u.appendChild(g.cueStart), g.cueEnd && u.appendChild(g.cueEnd), g.cuePending && u.appendChild(g.cuePending), g.progress && u.appendChild(g.progress), g.playhead && u.appendChild(g.playhead), g.timeline && u.appendChild(g.timeline);
  }, i.prototype._restoreOverlays = function() {
    const u = this._els;
    u.cueRegion && this.dom.appendChild(u.cueRegion), u.cueStart && this.dom.appendChild(u.cueStart), u.cueEnd && this.dom.appendChild(u.cueEnd), u.cuePending && this.dom.appendChild(u.cuePending), u.progress && this.dom.appendChild(u.progress), u.playhead && this.dom.appendChild(u.playhead), u.timeline && this.dom.appendChild(u.timeline);
  }, i.prototype._getWrapper = function() {
    return this._surfer ? typeof this._surfer.getWrapper == "function" ? this._surfer.getWrapper() : this.dom.querySelector("div > div") : null;
  }, i.prototype._renderTimeline = function() {
    const u = this._els.timeline;
    if (!u || !this._duration) return;
    this._clearTimeline(), u.style.cssText = "position:absolute;top:var(--waveform-height);left:0;width:100%;height:20px;pointer-events:none;z-index:3;";
    const g = this._duration, m = this._getWrapper(), b = (m ? m.scrollWidth : this.dom.clientWidth) / g, E = "rgba(255,255,255,0.15)", _ = "rgba(255,255,255,0.3)", k = "rgba(255,255,255,0.4)", x = 80 / b, q = s(x), I = q <= 2 ? q / 2 : q / 5, T = 500;
    let P = 0;
    for (let F = 0; F <= g && P < T; F += I) {
      F = Math.round(F * 100) / 100;
      const B = Math.abs(F % q) < 0.01 || Math.abs(q - F % q) < 0.01, R = document.createElement("span"), U = F / g * 100 + "%";
      if (B) {
        R.style.cssText = "position:absolute;bottom:0;width:1px;height:10px;left:" + U + ";background:" + _ + ";";
        const $ = document.createElement("span");
        $.textContent = t(F), $.style.cssText = "position:absolute;top:-12px;left:2px;font-size:0.65rem;color:" + k + ";white-space:nowrap;font-family:monospace;", R.appendChild($);
      } else
        R.style.cssText = "position:absolute;bottom:0;width:1px;height:5px;left:" + U + ";background:" + E + ";";
      u.appendChild(R), P++;
    }
  }, i.prototype._clearTimeline = function() {
    const u = this._els.timeline;
    u && (u.innerHTML = "");
  }, window[Ct] = d, e(), document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
    d(document.body);
  }) : d(document.body);
}
const Xt = "data-mixer-deck", Lt = "lnDeck";
if (!window[Lt]) {
  let p = function(c, y, l) {
    c.dispatchEvent(new CustomEvent(y, {
      bubbles: !0,
      detail: l || {}
    }));
  }, t = function(c) {
    const y = Math.floor(c / 60), l = Math.floor(c % 60);
    return y + ":" + (l < 10 ? "0" : "") + l;
  }, s = function(c) {
    r(c);
  }, r = function(c) {
    const y = Array.from(c.querySelectorAll("[" + Xt + "]"));
    c.hasAttribute && c.hasAttribute(Xt) && y.push(c), y.forEach(function(l) {
      l[Lt] || (l[Lt] = new d(l));
    });
  }, d = function(c) {
    return this.dom = c, c[Lt] = this, this.deckId = c.getAttribute(Xt), this.trackIndex = -1, this.track = null, this.progress = 0, this.isPlaying = !1, this._pendingLoopStart = null, this._pendingCueBtn = null, this._activeLoopIndex = -1, this._loopEnabled = !1, this._audio = c.querySelector("[data-mixer-audio]"), this._els = {
      notes: c.querySelector('[data-ln-field="notes"]'),
      title: c.querySelector('[data-ln-field="title"]'),
      artist: c.querySelector('[data-ln-field="artist"]'),
      timeCurrent: c.querySelector('[data-ln-field="time-current"]'),
      timeTotal: c.querySelector('[data-ln-field="time-total"]'),
      waveformEl: c.querySelector("[data-mixer-waveform]"),
      playBtn: c.querySelector('[data-mixer-transport="play"]'),
      pauseBtn: c.querySelector('[data-mixer-transport="pause"]'),
      loopBtn: c.querySelector('[data-mixer-cue="loop"]'),
      loopSegments: c.querySelector("[data-mixer-loop-segments]")
    }, this._bindEvents(), this;
  }, h = function() {
    new MutationObserver(function(y) {
      y.forEach(function(l) {
        l.type === "childList" && l.addedNodes.forEach(function(u) {
          u.nodeType === 1 && r(u);
        });
      });
    }).observe(document.body, {
      childList: !0,
      subtree: !0
    });
  };
  var Wt = p, Ht = t, Ot = s, Mt = r, Rt = d, Nt = h;
  d.prototype._dispatchWaveform = function(c, y) {
    const l = this._els.waveformEl;
    l && l.dispatchEvent(new CustomEvent(c, { bubbles: !1, detail: y || {} }));
  }, d.prototype._bindEvents = function() {
    const c = this;
    this.dom.addEventListener("ln-waveform:ready", function(l) {
      c._onAudioMetadata(l.detail.duration);
    }), this.dom.addEventListener("ln-waveform:timeupdate", function(l) {
      c._onTimeUpdate(l.detail.currentTime);
    }), this.dom.addEventListener("ln-waveform:finish", function() {
      c._onEnded();
    }), this.dom.addEventListener("ln-waveform:peaks-available", function(l) {
      c.track && p(c.dom, "ln-deck:peaks-ready", {
        deckId: c.deckId,
        trackIndex: c.trackIndex,
        trackUrl: c.track._originalUrl || c.track.url,
        peaks: l.detail.peaks,
        peaksDuration: l.detail.duration
      });
    }), this._audio && this._audio.addEventListener("loadedmetadata", function() {
      c._onAudioMetadata();
    }), this.dom.addEventListener("click", function(l) {
      const u = l.target.closest("[data-mixer-transport]");
      if (u) {
        c._handleTransport(u);
        return;
      }
      const g = l.target.closest("[data-mixer-cue]");
      if (g) {
        c._handleCue(g);
        return;
      }
      if (l.target.closest('[data-mixer-action="edit-track"]')) {
        c._handleEditRequest();
        return;
      }
    });
    const y = this._els.loopSegments;
    y && y.addEventListener("click", function(l) {
      const u = l.target.closest(".loop-seg-remove");
      if (u) {
        l.stopPropagation();
        const m = u.closest("[data-mixer-loop-index]");
        if (m) {
          const v = parseInt(m.getAttribute("data-mixer-loop-index"), 10);
          p(c.dom, "ln-deck:loop-delete-requested", {
            deckId: c.deckId,
            trackIndex: c.trackIndex,
            loopIndex: v
          });
        }
        return;
      }
      const g = l.target.closest("[data-mixer-loop-index]");
      if (g) {
        const m = parseInt(g.getAttribute("data-mixer-loop-index"), 10);
        c.activateLoop(m);
      }
    }), this.dom.addEventListener("ln-deck:request-load", function(l) {
      c.loadTrack(l.detail.trackIndex, l.detail.track, l.detail.peaks, l.detail.peaksDuration);
    }), this.dom.addEventListener("ln-deck:request-reset", function() {
      c.reset();
    }), this.dom.addEventListener("ln-deck:request-play", function() {
      c.play();
    }), this.dom.addEventListener("ln-deck:request-stop", function() {
      c.stop();
    }), this.dom.addEventListener("ln-deck:request-adjust-index", function(l) {
      c.adjustIndex(l.detail.newIndex);
    }), this.dom.addEventListener("ln-deck:request-set-loops", function(l) {
      c.track && (c.track.loops = l.detail.loops, c._renderLoopSegments());
    });
  }, d.prototype._handleTransport = function(c) {
    const y = c.getAttribute("data-mixer-transport");
    y === "play" ? this.play() : y === "pause" ? this.pause() : y === "stop" && this.stop();
  }, d.prototype._handleCue = function(c) {
    const y = c.getAttribute("data-mixer-cue");
    if (y === "loop") {
      this._loopEnabled = !this._loopEnabled, c.classList.toggle("active", this._loopEnabled), c.setAttribute("aria-pressed", this._loopEnabled ? "true" : "false");
      return;
    }
    if (!this._audio || !this.track || this.trackIndex < 0) return;
    const l = this._audio.currentTime, u = this._audio.duration;
    if (!(!u || !isFinite(u))) {
      if (y === "mark-start")
        this._pendingLoopStart = l, this._pendingCueBtn && this._pendingCueBtn.classList.remove("active"), this._pendingCueBtn = c, c.classList.add("active"), this._dispatchWaveform("ln-waveform:request-set-pending-cue", {
          percent: l / u * 100
        });
      else if (y === "mark-end") {
        if (this._pendingLoopStart === null) return;
        let g = this._pendingLoopStart, m = l;
        if (this._pendingLoopStart = null, this._pendingCueBtn && (this._pendingCueBtn.classList.remove("active"), this._pendingCueBtn = null), this._dispatchWaveform("ln-waveform:request-clear-pending-cue"), m < g) {
          const v = g;
          g = m, m = v;
        }
        if (m - g < 0.5) return;
        c.classList.add("active"), setTimeout(function() {
          c.classList.remove("active");
        }, 300), p(this.dom, "ln-deck:loop-captured", {
          deckId: this.deckId,
          trackIndex: this.trackIndex,
          startSec: g,
          endSec: m,
          startPct: g / u * 100,
          endPct: m / u * 100
        });
      }
    }
  }, d.prototype._handleEditRequest = function() {
    this.trackIndex < 0 || p(this.dom, "ln-deck:edit-requested", {
      deckId: this.deckId,
      trackIndex: this.trackIndex
    });
  }, d.prototype._onAudioMetadata = function(c) {
    if (!this.track) return;
    const y = this._audio && isFinite(this._audio.duration) && this._audio.duration > 0 ? this._audio.duration : c > 0 ? c : 0;
    y && (this.track.durationSec > 0 && this.track.durationSec === y || (this.track.durationSec = y, this.track.duration = t(y), this._els.timeTotal && (this._els.timeTotal.textContent = this.track.duration), p(this.dom, "ln-deck:duration-detected", {
      deckId: this.deckId,
      trackIndex: this.trackIndex,
      trackUrl: this.track._originalUrl || this.track.url,
      durationSec: y,
      duration: this.track.duration
    })));
  }, d.prototype._onTimeUpdate = function(c) {
    if (!this.track || !this._audio) return;
    const y = this._audio.duration;
    if (!(!y || !isFinite(y)) && (this.progress = c / y * 100, this._els.timeCurrent && (this._els.timeCurrent.textContent = t(c)), this._dispatchWaveform("ln-waveform:request-set-progress", { percent: this.progress }), this._loopEnabled && this._activeLoopIndex >= 0 && this.track.loops)) {
      const l = this.track.loops[this._activeLoopIndex];
      l && c >= l.endSec && (this._audio.currentTime = l.startSec);
    }
  }, d.prototype._onEnded = function() {
    if (this._loopEnabled && this._activeLoopIndex < 0 && this._audio) {
      this._audio.currentTime = 0, this._audio.play();
      return;
    }
    this.progress = 100, this.isPlaying = !1, this._updatePlayButton(!1), p(this.dom, "ln-deck:ended", {
      deckId: this.deckId,
      trackIndex: this.trackIndex
    });
  }, d.prototype.loadTrack = function(c, y, l, u) {
    this.trackIndex !== c && (this._dispatchWaveform("ln-waveform:request-destroy"), this.trackIndex = c, this.track = y || null, this.progress = 0, this.isPlaying = !1, this._pendingLoopStart = null, this._pendingCueBtn && (this._pendingCueBtn.classList.remove("active"), this._pendingCueBtn = null), this._activeLoopIndex = -1, this._loopEnabled = !1, this._els.loopBtn && (this._els.loopBtn.classList.remove("active"), this._els.loopBtn.setAttribute("aria-pressed", "false")), this._render(), this._renderLoopSegments(), this._updatePlayButton(!1), this.track && this.track.url && this._audio && (this._audio.src = this.track.url, this._audio.load(), this._dispatchWaveform("ln-waveform:request-init", {
      audio: this._audio,
      peaks: l,
      peaksDuration: u
    })), p(this.dom, "ln-deck:loaded", {
      deckId: this.deckId,
      trackIndex: c,
      track: this.track
    }));
  }, d.prototype.play = function() {
    if (this.trackIndex < 0 || !this.track || !this._audio || !this._audio.src) return;
    const c = this;
    this._audio.play().then(function() {
      c.isPlaying = !0, c._updatePlayButton(!0), p(c.dom, "ln-deck:played", {
        deckId: c.deckId,
        trackIndex: c.trackIndex
      });
    }).catch(function(y) {
      c.isPlaying = !1, c._updatePlayButton(!1), console.warn("Play failed for deck " + c.deckId + ":", y);
    });
  }, d.prototype.pause = function() {
    this._audio && this._audio.pause(), this.isPlaying = !1, this._updatePlayButton(!1), p(this.dom, "ln-deck:paused", {
      deckId: this.deckId,
      trackIndex: this.trackIndex
    });
  }, d.prototype.stop = function() {
    this._audio && (this._audio.pause(), this._audio.currentTime = 0), this.isPlaying = !1, this.progress = 0, this._updatePlayButton(!1), this._render(), p(this.dom, "ln-deck:stopped", {
      deckId: this.deckId,
      trackIndex: this.trackIndex
    });
  }, d.prototype.reset = function() {
    this._dispatchWaveform("ln-waveform:request-destroy"), this._audio && (this._audio.removeAttribute("src"), this._audio.load()), this.trackIndex = -1, this.track = null, this.progress = 0, this.isPlaying = !1, this._pendingLoopStart = null, this._pendingCueBtn && (this._pendingCueBtn.classList.remove("active"), this._pendingCueBtn = null), this._activeLoopIndex = -1, this._loopEnabled = !1, this._els.loopBtn && (this._els.loopBtn.classList.remove("active"), this._els.loopBtn.setAttribute("aria-pressed", "false")), this._render(), this._renderLoopSegments(), this._updatePlayButton(!1), p(this.dom, "ln-deck:reset", {
      deckId: this.deckId
    });
  }, d.prototype.adjustIndex = function(c) {
    this.trackIndex = c;
  }, d.prototype.activateLoop = function(c) {
    if (!(!this.track || !this.track.loops)) {
      if (this._activeLoopIndex === c)
        this._activeLoopIndex = -1;
      else {
        this._activeLoopIndex = c;
        const y = this.track.loops[c];
        y && this._audio && (this._audio.currentTime = y.startSec);
      }
      this._updateActiveRegionOnWaveform(), this._updateSegmentHighlight(), p(this.dom, "ln-deck:loop-activated", {
        deckId: this.deckId,
        loopIndex: this._activeLoopIndex
      });
    }
  }, d.prototype.getTrackIndex = function() {
    return this.trackIndex;
  }, d.prototype.getTrack = function() {
    return this.track;
  }, d.prototype.getDeckId = function() {
    return this.deckId;
  }, d.prototype._render = function() {
    const c = this._els, y = this.track;
    if (!y) {
      c.notes && (c.notes.textContent = ""), c.title && (c.title.textContent = "—"), c.artist && (c.artist.textContent = "—"), c.timeCurrent && (c.timeCurrent.textContent = "0:00"), c.timeTotal && (c.timeTotal.textContent = "0:00"), this._dispatchWaveform("ln-waveform:request-clear-all");
      return;
    }
    c.notes && (c.notes.textContent = y.notes || ""), c.title && (c.title.textContent = y.title), c.artist && (c.artist.textContent = y.artist), c.timeTotal && (c.timeTotal.textContent = y.duration);
    const l = Math.floor(y.durationSec * (this.progress / 100));
    c.timeCurrent && (c.timeCurrent.textContent = t(l)), this._dispatchWaveform("ln-waveform:request-set-progress", { percent: this.progress }), this._updateActiveRegionOnWaveform();
  }, d.prototype._updateActiveRegionOnWaveform = function() {
    let c = null;
    this._activeLoopIndex >= 0 && this.track && this.track.loops && (c = this.track.loops[this._activeLoopIndex]), c ? this._dispatchWaveform("ln-waveform:request-set-region", {
      startPct: c.startPct,
      endPct: c.endPct
    }) : this._dispatchWaveform("ln-waveform:request-clear-region");
  }, d.prototype._renderLoopSegments = function() {
    const c = this._els.loopSegments;
    if (!c || (c.innerHTML = "", !this.track || !this.track.loops || this.track.loops.length === 0)) return;
    const y = this;
    this.track.loops.forEach(function(l, u) {
      const g = It("loop-seg-btn", "ln-deck"), m = {
        index: u,
        name: l.name,
        isActive: u === y._activeLoopIndex
      };
      qt(g, m), mt(g, m), c.appendChild(g);
    });
  }, d.prototype._updateSegmentHighlight = function() {
    const c = this._els.loopSegments;
    if (!c) return;
    const y = c.querySelectorAll("[data-mixer-loop-index]"), l = this;
    y.forEach(function(u) {
      const g = parseInt(u.getAttribute("data-mixer-loop-index"), 10);
      u.classList.toggle("active", g === l._activeLoopIndex);
    });
  }, d.prototype._updatePlayButton = function(c) {
    const y = this._els.playBtn, l = this._els.pauseBtn;
    !y || !l || (y.hidden = c, l.hidden = !c);
  }, window[Lt] = s, h(), document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
    s(document.body);
  }) : s(document.body);
}
function Ve(p) {
  p._ensureAudioContext = function() {
    if (this._audioCtx) {
      this._audioCtx.state === "suspended" && this._audioCtx.resume();
      return;
    }
    this._audioCtx = new (window.AudioContext || window.webkitAudioContext)(), this._masterGain = this._audioCtx.createGain(), this._masterGain.connect(this._audioCtx.destination);
    const t = this.dom.querySelector('[data-mixer-potentiometer="master"]');
    this._masterGain.gain.value = t ? t.value / 100 : 0.8;
  }, p._connectDeckAudio = function(t) {
    const s = this._getDeck(t);
    if (!s) return;
    const r = s.querySelector("[data-mixer-audio]");
    if (!(!r || !r.src) && r.src.indexOf("blob:") === 0) {
      this._ensureAudioContext(), r._lnSourceNode || (r._lnSourceNode = this._audioCtx.createMediaElementSource(r));
      try {
        r._lnSourceNode.disconnect();
      } catch {
      }
      r._lnSourceNode.connect(this._masterGain);
    }
  }, p._extractPeaksFromBlob = function(t) {
    this._ensureAudioContext();
    const s = this._audioCtx, r = 8e3;
    return t.arrayBuffer().then(function(d) {
      return s.decodeAudioData(d);
    }).then(function(d) {
      const h = d.numberOfChannels, i = [];
      for (let n = 0; n < h; n++) {
        const e = d.getChannelData(n), o = Math.max(1, Math.floor(e.length / r)), a = new Array(Math.ceil(e.length / o));
        for (let f = 0, c = 0; f < e.length; f += o, c++) {
          let y = 0;
          const l = Math.min(f + o, e.length);
          for (let u = f; u < l; u++) {
            const g = e[u] < 0 ? -e[u] : e[u];
            g > y && (y = g);
          }
          a[c] = Math.round(y * 1e4) / 1e4;
        }
        i.push(a);
      }
      return { peaks: i, duration: d.duration };
    });
  }, p._bindAudioWiring = function() {
    const t = this;
    this.dom.addEventListener("ln-profile:ready", function() {
      lnDb.open().then(function() {
        return lnDb.get("settings", "app");
      }).then(function(d) {
        lnSettings.hydrate(d);
      });
    });
    const s = this.dom.querySelector('[data-mixer-potentiometer="master"]');
    if (s) {
      const d = function() {
        const h = s.value, i = h + "%";
        s.style.background = "linear-gradient(to right, hsl(var(--accent)) " + i + ", var(--button-bg) " + i + ")", t._masterGain && (t._masterGain.gain.value = h / 100);
      };
      s.addEventListener("input", d), d();
    }
    let r = !1;
    this.dom.addEventListener("click", function() {
      !r && t._audioCtx && (t._audioCtx.resume(), r = !0);
    });
  };
}
function de() {
  return location.protocol === "file:";
}
function Ye(p) {
  p._getGlobalProgressBar = function() {
    return this.dom.querySelector("[data-mixer-progress]");
  }, p._updateGlobalProgress = function() {
    const t = this._getGlobalProgressBar();
    if (!t) return;
    const s = Object.keys(this._downloadProgress);
    if (s.length === 0) {
      t.hidden = !0;
      return;
    }
    let r = 0, d = 0;
    for (let n = 0; n < s.length; n++) {
      const e = this._downloadProgress[s[n]];
      r += e.loaded, d += e.total;
    }
    const h = d > 0 ? Math.round(r / d * 100) : 0;
    t.hidden = !1;
    const i = t.querySelector("[data-ln-progress]");
    i && i.setAttribute("data-ln-progress", String(h));
  }, p._downloadBlob = function(t, s) {
    const r = this;
    if (this._downloading[t]) {
      s && s(!1);
      return;
    }
    this._downloading[t] = !0, this._downloadProgress[t] = { loaded: 0, total: 0 }, this._updateGlobalProgress();
    const d = this._getLibraryEl();
    d && d.dispatchEvent(new CustomEvent("ln-library:request-download-start", {
      detail: { url: t }
    }));
    const h = new XMLHttpRequest();
    h.open("GET", t, !0), h.responseType = "blob", h.timeout = 12e4, h.ontimeout = function() {
      delete r._downloading[t], delete r._downloadProgress[t], r._updateGlobalProgress(), d && d.dispatchEvent(new CustomEvent("ln-library:request-download-done", {
        detail: { url: t, success: !1 }
      })), s && s(!1);
    }, h.onprogress = function(i) {
      if (i.lengthComputable && (r._downloadProgress[t] = { loaded: i.loaded, total: i.total }, r._updateGlobalProgress(), d)) {
        const n = i.loaded / i.total * 100;
        d.dispatchEvent(new CustomEvent("ln-library:request-download-progress", {
          detail: { url: t, percent: n }
        }));
      }
    }, h.onload = function() {
      if (delete r._downloading[t], delete r._downloadProgress[t], h.status >= 200 && h.status < 300) {
        const i = h.response;
        lnDb.put("audioFiles", {
          url: t,
          blob: i,
          size: i.size,
          timestamp: Date.now()
        }).then(function() {
          r._updateGlobalProgress(), d && d.dispatchEvent(new CustomEvent("ln-library:request-download-done", {
            detail: { url: t, success: !0 }
          })), s && s(!0);
        }).catch(function() {
          r._updateGlobalProgress(), d && d.dispatchEvent(new CustomEvent("ln-library:request-download-done", {
            detail: { url: t, success: !1 }
          })), s && s(!1);
        });
      } else
        r._updateGlobalProgress(), d && d.dispatchEvent(new CustomEvent("ln-library:request-download-done", {
          detail: { url: t, success: !1 }
        })), s && s(!1);
    }, h.onerror = function() {
      delete r._downloading[t], delete r._downloadProgress[t], r._updateGlobalProgress(), d && d.dispatchEvent(new CustomEvent("ln-library:request-download-done", {
        detail: { url: t, success: !1 }
      })), s && s(!1);
    }, h.send();
  }, p._addTrackToPlaylist = function(t, s, r, d) {
    let h = "", i = 0;
    if (d && t.lnPlaylist && t.lnPlaylist.trackCatalog) {
      const n = t.lnPlaylist.trackCatalog[d];
      n && n.durationSec > 0 && (h = n.duration, i = n.durationSec);
    }
    d && lnDb.get("tracks", d).then(function(n) {
      const e = n || { url: d };
      return e.title = s, e.artist = r, !e.duration && h && (e.duration = h), !e.durationSec && i && (e.durationSec = i), lnDb.put("tracks", e);
    }).catch(function(n) {
      console.warn("[ln-mixer-cache] Failed to persist track metadata:", n);
    }), t.dispatchEvent(new CustomEvent("ln-playlist:request-add-track", {
      detail: {
        title: s,
        artist: r,
        duration: h,
        durationSec: i,
        url: d
      }
    }));
  }, p._showAddFeedback = function(t) {
    t.textContent = "Added!", t.disabled = !0, setTimeout(function() {
      t.textContent = "Add", t.disabled = !1;
    }, 1200);
  }, p._downloadAndCache = function(t, s, r, d, h) {
    const i = this;
    this._downloadBlob(t, function(n) {
      i._addTrackToPlaylist(d, s, r, t), i._showAddFeedback(h), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: n ? { type: "success", message: "Track downloaded" } : { type: "warn", message: "Download failed — using remote URL" }
      }));
    });
  }, p._loadTrackToDeck = function(t, s, r) {
    const d = this, h = this._getDeck(t);
    if (!h) return;
    const i = r ? r.url : "";
    if (!i) {
      h.dispatchEvent(new CustomEvent("ln-deck:request-load", {
        detail: { trackIndex: s, track: r }
      }));
      return;
    }
    d._blobUrls[t] && (URL.revokeObjectURL(d._blobUrls[t]), delete d._blobUrls[t]);
    const n = h.querySelector("[data-mixer-waveform]");
    function e(o, a, f) {
      n && n.classList.remove("waveform--decoding"), h.dispatchEvent(new CustomEvent("ln-deck:request-load", {
        detail: { trackIndex: s, track: o, peaks: a, peaksDuration: f }
      }));
    }
    Promise.all([
      lnDb.get("audioFiles", i),
      lnDb.get("tracks", i)
    ]).then(function(o) {
      const a = o[0], f = o[1], c = Object.assign({}, r);
      c._originalUrl = i;
      let y = null, l = 0, u = !1;
      if (f && f.peaks && f.peaksDuration && (y = f.peaks, l = f.peaksDuration), a && a.blob && (u = !0, c.url = URL.createObjectURL(a.blob), d._blobUrls[t] = c.url), u && !y) {
        n && n.classList.add("waveform--decoding"), d._extractPeaksFromBlob(a.blob).then(function(g) {
          lnDb.get("tracks", i).then(function(m) {
            m && (m.peaks = g.peaks, m.peaksDuration = g.duration, lnDb.put("tracks", m));
          }), e(c, g.peaks, g.duration);
        }).catch(function() {
          e(c, null, 0);
        });
        return;
      }
      e(c, y, l), !u && i && !de() && !d._downloading[i] && d._downloadBlob(i, function(g) {
        g && window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
          detail: { type: "info", message: "Track re-cached" }
        }));
      });
    }).catch(function() {
      h.dispatchEvent(new CustomEvent("ln-deck:request-load", {
        detail: { trackIndex: s, track: r }
      }));
    });
  }, p._updateCacheInfo = function() {
    const t = document.querySelector("[data-mixer-cache-size]");
    t && lnDb.getAll("audioFiles").then(function(s) {
      if (!s || s.length === 0) {
        t.textContent = "No cached tracks";
        return;
      }
      let r = 0;
      s.forEach(function(h) {
        r += h.size || 0;
      });
      let d;
      r < 1024 * 1024 ? d = Math.round(r / 1024) + " KB" : d = (r / (1024 * 1024)).toFixed(1) + " MB", t.textContent = s.length + (s.length === 1 ? " track" : " tracks") + " (" + d + ")";
    }).catch(function() {
      t.textContent = "Unable to read cache";
    });
  }, p._bindPlaylistActions = function() {
    const t = this, s = document.getElementById("modal-new-playlist");
    s && s.addEventListener("ln-modal:before-open", function(d) {
      const h = t._getSidebar();
      (!h || !h.lnPlaylist || !h.lnPlaylist.playlists) && (d.preventDefault(), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "warn", message: "Create a profile first" }
      })));
    });
    const r = document.getElementById("modal-track-library");
    r && r.addEventListener("ln-modal:before-open", function() {
      const d = t._getLibraryEl();
      d && d.dispatchEvent(new CustomEvent("ln-library:request-fetch", {
        detail: { apiUrl: lnSettings.getApiUrl() }
      }));
    }), document.addEventListener("click", function(d) {
      if (d.target.closest('[data-mixer-action="remove-track"]')) {
        const h = document.querySelector('[data-ln-form="edit-track"]');
        if (!h) return;
        const i = parseInt(h.getAttribute("data-mixer-track-index"), 10), n = h.getAttribute("data-mixer-playlist-id");
        if (i < 0 || !n) return;
        const e = t._getSidebar();
        e && e.dispatchEvent(new CustomEvent("ln-playlist:request-remove-track", {
          detail: { index: i, playlistId: n }
        }));
      }
    }), document.addEventListener("click", function(d) {
      const h = d.target.closest('[data-mixer-action="remove-playlist"]');
      if (!h) return;
      d.stopPropagation();
      const i = h.getAttribute("data-mixer-playlist-id");
      if (!i) return;
      const n = t._getSidebar();
      if (!n || !n.lnPlaylist) return;
      const e = n.lnPlaylist.playlists[i];
      if (!e) return;
      const o = document.querySelector('[data-ln-form="confirm-delete-playlist"]');
      o && o.setAttribute("data-mixer-playlist-id", i);
      const a = document.querySelector('[data-ln-field="confirm-delete-message"]');
      if (a) {
        const c = e.segments.length;
        a.textContent = "Delete playlist “" + e.name + "”? This removes " + c + (c === 1 ? " track." : " tracks.");
      }
      const f = document.getElementById("modal-confirm-delete-playlist");
      f && f.setAttribute("data-ln-modal", "open");
    }), document.addEventListener("ln-form:submit", function(d) {
      if (d.target.getAttribute("data-ln-form") !== "confirm-delete-playlist") return;
      const i = d.target.getAttribute("data-mixer-playlist-id");
      if (!i) return;
      const n = t._getSidebar();
      n && n.dispatchEvent(new CustomEvent("ln-playlist:request-remove-playlist", {
        detail: { playlistId: i }
      }));
      const e = document.getElementById("modal-confirm-delete-playlist");
      e && e.setAttribute("data-ln-modal", "close");
    }), document.addEventListener("click", function(d) {
      const h = d.target.closest('[data-mixer-action="add-to-playlist"]');
      if (!h) return;
      const i = h.getAttribute("data-track-title"), n = h.getAttribute("data-track-artist"), e = h.getAttribute("data-track-url") || "";
      if (!i) return;
      const o = t._getSidebar();
      if (!o || !o.lnPlaylist || !o.lnPlaylist.getPlaylist()) {
        window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
          detail: { type: "warn", message: "Select a playlist first" }
        }));
        return;
      }
      if (!e) {
        t._addTrackToPlaylist(o, i, n, ""), t._showAddFeedback(h);
        return;
      }
      if (!t._downloading[e]) {
        if (de()) {
          t._fileProtocolWarned || (t._fileProtocolWarned = !0, window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
            detail: { type: "info", message: "Offline caching unavailable (file:// mode)" }
          }))), t._addTrackToPlaylist(o, i, n, e), t._showAddFeedback(h);
          return;
        }
        lnDb.get("audioFiles", e).then(function(a) {
          a ? (t._addTrackToPlaylist(o, i, n, e), t._showAddFeedback(h)) : t._downloadAndCache(e, i, n, o, h);
        }).catch(function() {
          t._addTrackToPlaylist(o, i, n, e), t._showAddFeedback(h);
        });
      }
    }), document.addEventListener("ln-form:submit", function(d) {
      if (d.target.getAttribute("data-ln-form") !== "new-playlist") return;
      const h = document.querySelector('[data-ln-field="new-playlist-name"]'), i = h ? h.value.trim() : "";
      if (!i) {
        h && h.focus();
        return;
      }
      const n = t._getSidebar();
      n && n.dispatchEvent(new CustomEvent("ln-playlist:request-create", {
        detail: { name: i }
      })), h.value = "";
      const e = document.getElementById("modal-new-playlist");
      e && e.setAttribute("data-ln-modal", "close");
    }), document.addEventListener("ln-form:submit", function(d) {
      if (d.target.getAttribute("data-ln-form") !== "edit-track") return;
      const h = d.target, i = parseInt(h.getAttribute("data-mixer-track-index"), 10), n = h.getAttribute("data-mixer-playlist-id");
      if (i < 0 || !n) return;
      const e = document.querySelector('[data-ln-field="edit-track-notes"]'), o = e ? e.value.trim() : "", a = t._getSidebar();
      a && a.dispatchEvent(new CustomEvent("ln-playlist:request-edit-track", {
        detail: { index: i, playlistId: n, notes: o }
      }));
    });
  }, p._bindLibraryReactions = function() {
    const t = this;
    document.addEventListener("ln-library:error", function(s) {
      window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "warn", message: s.detail.message || "Library error" }
      }));
    }), document.addEventListener("ln-library:fetched", function() {
      lnDb.getAllKeys("audioFiles").then(function(s) {
        const r = t._getLibraryEl();
        r && r.dispatchEvent(new CustomEvent("ln-library:request-mark-cached", {
          detail: { cachedUrls: s }
        }));
      });
    });
  }, p._bindCacheActions = function() {
    const t = this;
    document.addEventListener("click", function(s) {
      const r = s.target.closest('[data-mixer-action="remove-cached"]');
      if (!r) return;
      const d = r.closest("[data-mixer-library-track]");
      if (!d) return;
      const h = d.querySelector('[data-mixer-action="add-to-playlist"]'), i = h ? h.getAttribute("data-track-url") : "";
      i && lnDb.delete("audioFiles", i).then(function() {
        const n = t._getLibraryEl();
        n && n.dispatchEvent(new CustomEvent("ln-library:request-uncache", {
          detail: { url: i }
        })), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
          detail: { type: "info", message: "Track removed from cache" }
        }));
      });
    }), document.addEventListener("click", function(s) {
      s.target.closest('[data-mixer-action="clear-audio-cache"]') && lnDb.clear("audioFiles").then(function() {
        t.dom.querySelectorAll("[data-mixer-deck]").forEach(function(h) {
          const i = h.getAttribute("data-mixer-deck");
          t._blobUrls[i] && (URL.revokeObjectURL(t._blobUrls[i]), delete t._blobUrls[i]);
        });
        const d = t._getLibraryEl();
        d && d.dispatchEvent(new CustomEvent("ln-library:request-clear-all-cached")), t._updateCacheInfo(), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
          detail: { type: "info", message: "Audio cache cleared" }
        }));
      });
    });
  };
}
function Ht(p) {
  const t = Math.floor(p / 60), s = Math.floor(p % 60);
  return t + ":" + (s < 10 ? "0" : "") + s;
}
function Je(p) {
  p._autoplayTick = function() {
    if (!this._autoplay || this._autoplayPreloaded) return;
    const t = this.dom.querySelectorAll("[data-mixer-deck]");
    let s = null, r = null;
    if (t.forEach(function(f) {
      f.lnDeck && (f.lnDeck.isPlaying ? s = f : r || (r = f));
    }), !s || !r || s.lnDeck.progress < 50) return;
    const d = this._getSidebar();
    if (!d || !d.lnPlaylist) return;
    const h = s.dataset.lnFromPlaylist, i = h && d.lnPlaylist.playlists[h];
    if (!i || !i.segments) return;
    const n = s.lnDeck.trackIndex + 1;
    if (n >= i.segments.length) return;
    if (r.lnDeck.trackIndex === n) {
      this._autoplayPreloaded = !0;
      return;
    }
    const e = i.segments[n], o = d.lnPlaylist.trackCatalog[e.url] || {}, a = {
      url: e.url,
      title: o.title || "",
      artist: o.artist || "",
      duration: o.duration || "",
      durationSec: o.durationSec || 0,
      notes: e.notes || "",
      loops: e.loops || []
    };
    r.dataset.lnFromPlaylist = h, this._loadTrackToDeck(r.getAttribute("data-mixer-deck"), n, a), this._autoplayPreloaded = !0;
  }, p._autoplayOnEnded = function(t) {
    if (!this._autoplay) return;
    const s = this.dom.querySelectorAll("[data-mixer-deck]");
    for (let r = 0; r < s.length; r++)
      if (s[r] !== t && s[r].lnDeck && s[r].lnDeck.trackIndex >= 0) {
        this._autoplayPreloaded = !1, s[r].dispatchEvent(new CustomEvent("ln-deck:request-play"));
        return;
      }
  }, p._bindDeckWiring = function() {
    const t = this;
    this.dom.addEventListener("ln-profile:switched", function() {
      t._autoplayTimer && (clearInterval(t._autoplayTimer), t._autoplayTimer = null), t._autoplayPreloaded = !1, t.dom.querySelectorAll("[data-mixer-deck]").forEach(function(r) {
        const d = r.getAttribute("data-mixer-deck");
        t._blobUrls[d] && (URL.revokeObjectURL(t._blobUrls[d]), delete t._blobUrls[d]), r.dispatchEvent(new CustomEvent("ln-deck:request-reset"));
      });
    }), this.dom.addEventListener("ln-playlist:load-to-deck", function(s) {
      const r = t._getDeck(s.detail.deckId);
      r && (r.dataset.lnFromPlaylist = s.detail.playlistId), t._loadTrackToDeck(s.detail.deckId, s.detail.trackIndex, s.detail.track), t._autoplayPreloaded = !1;
    }), this.dom.addEventListener("ln-deck:played", function(s) {
      t.dom.querySelectorAll("[data-mixer-deck]").forEach(function(d) {
        d !== s.target && d.dispatchEvent(new CustomEvent("ln-deck:request-stop"));
      }), t._autoplayPreloaded = !1, t._autoplay && !t._autoplayTimer && (t._autoplayTimer = setInterval(function() {
        t._autoplayTick();
      }, 1e3));
    }), this.dom.addEventListener("ln-deck:ended", function(s) {
      t._autoplayOnEnded(s.target);
    }), ["ln-deck:stopped", "ln-deck:paused"].forEach(function(s) {
      t.dom.addEventListener(s, function() {
        if (!t._autoplayTimer) return;
        let r = !1;
        t.dom.querySelectorAll("[data-mixer-deck]").forEach(function(d) {
          d.lnDeck && d.lnDeck.isPlaying && (r = !0);
        }), r || (clearInterval(t._autoplayTimer), t._autoplayTimer = null);
      });
    }), this.dom.addEventListener("ln-deck:loaded", function(s) {
      const r = t._getSidebar();
      r && r.dispatchEvent(new CustomEvent("ln-playlist:request-highlight", {
        detail: { deckId: s.detail.deckId, index: s.detail.trackIndex }
      })), s.detail.track && s.detail.track.url && t._connectDeckAudio(s.detail.deckId);
    }), this.dom.addEventListener("ln-deck:duration-detected", function(s) {
      const r = s.detail.trackUrl;
      if (!r) return;
      lnDb.get("tracks", r).then(function(h) {
        h || (h = { url: r, title: "", artist: "" }), h.duration = s.detail.duration, h.durationSec = s.detail.durationSec, lnDb.put("tracks", h);
      });
      const d = t._getSidebar();
      d && d.dispatchEvent(new CustomEvent("ln-playlist:request-update-catalog", {
        detail: {
          url: r,
          track: {
            duration: s.detail.duration,
            durationSec: s.detail.durationSec
          }
        }
      }));
    }), this.dom.addEventListener("ln-deck:peaks-ready", function(s) {
      const r = s.detail.trackUrl;
      r && lnDb.get("tracks", r).then(function(d) {
        return d || (d = { url: r, title: "", artist: "", duration: "", durationSec: 0 }), d.peaks = s.detail.peaks, d.peaksDuration = s.detail.peaksDuration, lnDb.put("tracks", d);
      });
    }), this.dom.addEventListener("ln-playlist:reordered", function(s) {
      const r = s.detail.oldToNew;
      t.dom.querySelectorAll("[data-mixer-deck]").forEach(function(d) {
        if (!d.lnDeck) return;
        const h = d.lnDeck.trackIndex;
        h >= 0 && r.hasOwnProperty(h) && d.dispatchEvent(new CustomEvent("ln-deck:request-adjust-index", {
          detail: { newIndex: r[h] }
        }));
      }), t._refreshDeckHighlights(), t._autoplay && (t._autoplayPreloaded = !1);
    }), this.dom.addEventListener("ln-playlist:track-added", function(s) {
      const r = t.dom.querySelectorAll("[data-mixer-deck]");
      for (let d = 0; d < r.length; d++)
        if (r[d].lnDeck && r[d].lnDeck.trackIndex < 0) {
          t._loadTrackToDeck(r[d].getAttribute("data-mixer-deck"), s.detail.trackIndex, s.detail.track);
          return;
        }
    }), this.dom.addEventListener("ln-deck:edit-requested", function(s) {
      const r = t._getSidebar();
      r && r.dispatchEvent(new CustomEvent("ln-playlist:request-open-edit", {
        detail: { index: s.detail.trackIndex }
      }));
    });
  }, p._bindLoopWiring = function() {
    const t = this;
    this.dom.addEventListener("ln-deck:loop-captured", function(s) {
      const r = document.querySelector('[data-ln-form="name-loop"]');
      if (!r) return;
      r.setAttribute("data-mixer-deck-id", s.detail.deckId), r.setAttribute("data-mixer-track-index", s.detail.trackIndex), r.setAttribute("data-mixer-loop-start", s.detail.startSec), r.setAttribute("data-mixer-loop-end", s.detail.endSec), r.setAttribute("data-mixer-loop-start-pct", s.detail.startPct), r.setAttribute("data-mixer-loop-end-pct", s.detail.endPct);
      const d = document.querySelector('[data-ln-field="loop-range"]');
      d && (d.textContent = Ht(s.detail.startSec) + " – " + Ht(s.detail.endSec));
      const h = document.querySelector('[data-ln-field="loop-name"]');
      h && (h.value = "");
      const i = document.getElementById("modal-name-loop");
      i && i.setAttribute("data-ln-modal", "open"), h && h.focus();
    }), this.dom.addEventListener("ln-deck:loop-delete-requested", function(s) {
      const r = t._getSidebar();
      if (!r || !r.lnPlaylist) return;
      const d = r.lnPlaylist.currentId;
      d && (r.dispatchEvent(new CustomEvent("ln-playlist:request-remove-loop", {
        detail: {
          playlistId: d,
          trackIndex: s.detail.trackIndex,
          loopIndex: s.detail.loopIndex
        }
      })), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "info", message: "Loop removed" }
      })));
    }), this.dom.addEventListener("ln-playlist:loop-added", function(s) {
      const r = s.detail;
      t.dom.querySelectorAll("[data-mixer-deck]").forEach(function(d) {
        d.lnDeck && d.lnDeck.trackIndex === r.trackIndex && d.dispatchEvent(new CustomEvent("ln-deck:request-set-loops", {
          detail: { loops: r.loops }
        }));
      });
    }), this.dom.addEventListener("ln-playlist:loop-removed", function(s) {
      const r = s.detail;
      t.dom.querySelectorAll("[data-mixer-deck]").forEach(function(d) {
        d.lnDeck && d.lnDeck.trackIndex === r.trackIndex && d.dispatchEvent(new CustomEvent("ln-deck:request-set-loops", {
          detail: { loops: r.loops }
        }));
      });
    });
  }, p._bindAutoplayToggle = function() {
    const t = this;
    document.addEventListener("click", function(s) {
      const r = s.target.closest('[data-mixer-action="toggle-autoplay"]');
      r && (t._autoplay = !t._autoplay, r.classList.toggle("active", t._autoplay), r.setAttribute("aria-pressed", String(t._autoplay)), !t._autoplay && t._autoplayTimer && (clearInterval(t._autoplayTimer), t._autoplayTimer = null), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "info", message: t._autoplay ? "Autoplay ON" : "Autoplay OFF" }
      })));
    });
  }, p._bindLoopActions = function() {
    const t = this;
    document.addEventListener("ln-form:submit", function(s) {
      if (s.target.getAttribute("data-ln-form") !== "name-loop") return;
      const r = s.target, d = document.querySelector('[data-ln-field="loop-name"]'), h = d ? d.value.trim() : "";
      if (!h) {
        d && d.focus();
        return;
      }
      r.getAttribute("data-mixer-deck-id");
      const i = parseInt(r.getAttribute("data-mixer-track-index"), 10), n = parseFloat(r.getAttribute("data-mixer-loop-start")), e = parseFloat(r.getAttribute("data-mixer-loop-end")), o = parseFloat(r.getAttribute("data-mixer-loop-start-pct")), a = parseFloat(r.getAttribute("data-mixer-loop-end-pct")), f = {
        name: h,
        startSec: n,
        endSec: e,
        startPct: o,
        endPct: a
      }, c = t._getSidebar();
      if (c && c.lnPlaylist) {
        const l = c.lnPlaylist.currentId;
        c.dispatchEvent(new CustomEvent("ln-playlist:request-add-loop", {
          detail: {
            playlistId: l,
            trackIndex: i,
            loop: f
          }
        }));
      }
      const y = document.getElementById("modal-name-loop");
      y && y.setAttribute("data-ln-modal", "close"), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "success", message: 'Loop "' + h + '" saved' }
      }));
    }), document.addEventListener("click", function(s) {
      if (s.target.closest('[data-mixer-action="open-settings-from-library"]')) {
        const r = document.getElementById("modal-track-library");
        r && r.setAttribute("data-ln-modal", "close"), t._populateSettingsForm();
        const d = document.getElementById("modal-settings");
        d && d.setAttribute("data-ln-modal", "open");
      }
    });
  };
}
let yt = null;
window.addEventListener("beforeinstallprompt", function(p) {
  p.preventDefault(), yt = p;
  const t = document.querySelector("[data-mixer-install-field]");
  t && (t.hidden = !1);
});
window.addEventListener("appinstalled", function() {
  yt = null;
  const p = document.querySelector("[data-mixer-install-field]");
  p && (p.hidden = !0);
});
function Ze(p) {
  p._populateSettingsForm = function() {
    const t = document.querySelector('[data-mixer-setting="api-url"]');
    t && (t.value = lnSettings.getApiUrl()), this._pendingLogo = lnSettings.getBrandLogo(), this._updateLogoPreview(), this._updateCacheInfo();
  }, p._updateLogoPreview = function() {
    const t = document.querySelector("[data-mixer-logo-preview]");
    if (!t) return;
    const s = this._pendingLogo !== null ? this._pendingLogo : lnSettings.getBrandLogo();
    if (s) {
      t.innerHTML = "";
      const r = document.createElement("img");
      r.src = s, r.alt = "Logo preview", t.appendChild(r);
    } else
      t.innerHTML = "<span>No logo</span>";
  }, p._bindProfileBridge = function() {
    const t = this;
    this.dom.addEventListener("ln-profile:switched", function(s) {
      const r = t._getSidebar();
      if (!r) return;
      const d = s.detail.profileId;
      if (r.setAttribute("data-mixer-playlist-profile", d || ""), !d) {
        r.dispatchEvent(new CustomEvent("ln-playlist:request-load-profile", {
          detail: { profileId: null, playlists: null, trackCatalog: null }
        }));
        return;
      }
      lnDb.getAllByIndex("playlists", "profileId", d).then(function(h) {
        const i = {};
        h.forEach(function(o) {
          (o.segments || []).forEach(function(a) {
            a.url && (i[a.url] = !0);
          });
        });
        const e = Object.keys(i).map(function(o) {
          return lnDb.get("tracks", o);
        });
        return Promise.all(e).then(function(o) {
          const a = {};
          h.forEach(function(c) {
            a[c.id] = c;
          });
          const f = {};
          o.forEach(function(c) {
            c && (f[c.url] = c);
          }), r.dispatchEvent(new CustomEvent("ln-playlist:request-load-profile", {
            detail: { profileId: d, playlists: a, trackCatalog: f }
          }));
        });
      });
    }), this.dom.addEventListener("ln-playlist:changed", function(s) {
      const r = s.detail.playlistId;
      if (!r) return;
      const d = t._getSidebar();
      if (!d || !d.lnPlaylist || !d.lnPlaylist.playlists) return;
      const h = d.lnPlaylist.playlists[r];
      h && lnDb.put("playlists", h);
    }), this.dom.addEventListener("ln-profile:created", function(s) {
      t._updateEmptyState(), lnDb.put("profiles", s.detail.profile), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "success", message: "Profile created" }
      }));
    }), this.dom.addEventListener("ln-profile:deleted", function(s) {
      t._updateEmptyState(), lnDb.delete("profiles", s.detail.profileId), lnDb.deleteByIndex("playlists", "profileId", s.detail.profileId);
      const r = document.getElementById("modal-settings");
      r && r.setAttribute("data-ln-modal", "close"), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "info", message: "Profile deleted" }
      }));
    }), this.dom.addEventListener("ln-profile:ready", function() {
      t._updateEmptyState();
    }), this.dom.addEventListener("ln-profile:request-load", function() {
      t._loadProfiles();
    }), this.dom.addEventListener("ln-playlist:created", function() {
      window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "success", message: "Playlist created" }
      }));
    }), this.dom.addEventListener("ln-playlist:track-edited", function() {
      const s = document.getElementById("modal-edit-track");
      s && s.setAttribute("data-ln-modal", "close"), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "success", message: "Track updated" }
      }));
    }), this.dom.addEventListener("ln-playlist:track-removed", function(s) {
      const r = document.getElementById("modal-edit-track");
      r && r.setAttribute("data-ln-modal", "close"), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "warn", message: "Track removed" }
      }));
      const d = s.detail.trackIndex;
      t.dom.querySelectorAll("[data-mixer-deck]").forEach(function(h) {
        if (!h.lnDeck) return;
        const i = h.lnDeck.trackIndex;
        i === d ? h.dispatchEvent(new CustomEvent("ln-deck:request-reset")) : i > d && h.dispatchEvent(new CustomEvent("ln-deck:request-adjust-index", {
          detail: { newIndex: i - 1 }
        }));
      }), t._refreshDeckHighlights(), t._autoplay && (t._autoplayPreloaded = !1);
    }), this.dom.addEventListener("ln-playlist:playlist-removed", function(s) {
      lnDb.delete("playlists", s.detail.playlistId), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "warn", message: 'Playlist "' + s.detail.name + '" deleted' }
      }));
      const r = t._getSidebar();
      (!r || !r.lnPlaylist || !r.lnPlaylist.currentId) && t.dom.querySelectorAll("[data-mixer-deck]").forEach(function(d) {
        d.lnDeck && d.dispatchEvent(new CustomEvent("ln-deck:request-reset"));
      }), t._refreshDeckHighlights();
    }), this.dom.addEventListener("ln-playlist:open-edit", function(s) {
      const r = s.detail.track, d = document.querySelector('[data-ln-form="edit-track"]');
      d && (d.setAttribute("data-mixer-track-index", s.detail.index), d.setAttribute("data-mixer-playlist-id", s.detail.playlistId));
      const h = document.querySelector('[data-ln-field="edit-track-title"]'), i = document.querySelector('[data-ln-field="edit-track-artist"]'), n = document.querySelector('[data-ln-field="edit-track-notes"]');
      h && (h.textContent = r.title), i && (i.textContent = r.artist + " — " + r.duration), n && (n.value = r.notes || "");
      const e = document.getElementById("modal-edit-track");
      e && e.setAttribute("data-ln-modal", "open"), n && n.focus();
    });
  }, p._bindProfileActions = function() {
    const t = this;
    document.addEventListener("click", function(s) {
      if (s.target.closest('[data-mixer-action="delete-profile"]')) {
        const r = t._getNav();
        r && r.lnProfile && r.dispatchEvent(new CustomEvent("ln-profile:request-remove", {
          detail: { id: r.lnProfile.currentId }
        }));
      }
    }), document.addEventListener("ln-form:submit", function(s) {
      if (s.target.getAttribute("data-ln-form") !== "new-profile") return;
      const r = document.querySelector('[data-ln-field="new-profile-name"]'), d = r ? r.value.trim() : "";
      if (!d) {
        r && r.focus();
        return;
      }
      const h = t._getNav();
      h && h.dispatchEvent(new CustomEvent("ln-profile:request-create", {
        detail: { name: d }
      })), r.value = "";
      const i = document.getElementById("modal-new-profile");
      i && i.setAttribute("data-ln-modal", "close");
    });
  }, p._bindSettingsActions = function() {
    const t = this, s = document.getElementById("modal-settings");
    s && s.addEventListener("ln-modal:before-open", function() {
      t._populateSettingsForm();
    }), document.addEventListener("click", function(d) {
      d.target.closest('[data-mixer-action="install-app"]') && yt && (yt.prompt(), yt.userChoice.then(function(h) {
        if (h.outcome === "accepted") {
          yt = null;
          const i = document.querySelector("[data-mixer-install-field]");
          i && (i.hidden = !0);
        }
      }));
    }), document.addEventListener("click", function(d) {
      if (d.target.closest('[data-mixer-action="upload-logo"]')) {
        const h = document.querySelector("[data-mixer-logo-input]");
        h && h.click();
      }
    });
    const r = document.querySelector("[data-mixer-logo-input]");
    r && r.addEventListener("change", function() {
      const d = r.files[0];
      if (!d) return;
      const h = new FileReader();
      h.onload = function(i) {
        t._pendingLogo = i.target.result, t._updateLogoPreview();
      }, h.readAsDataURL(d);
    }), document.addEventListener("ln-form:submit", function(d) {
      if (d.target.getAttribute("data-ln-form") !== "settings") return;
      const h = document.querySelector('[data-mixer-setting="api-url"]'), i = h ? h.value.trim() : "", n = t._pendingLogo !== null ? t._pendingLogo : lnSettings.getBrandLogo();
      lnSettings.apply({
        apiUrl: i,
        brandLogo: n
      }), lnDb.put("settings", {
        key: "app",
        apiUrl: i,
        brandLogo: n
      }), t._pendingLogo = null;
      const e = document.getElementById("modal-settings");
      e && e.setAttribute("data-ln-modal", "close"), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "success", message: "Settings saved" }
      }));
    });
  };
}
const Qe = 2, ce = "ln-dj-mixer", tn = "ln-mixer-data.json", et = 2e3, Ce = 4e3, en = 500, nn = 50, ue = 50 * 1024 * 1024;
function on(p) {
  return p.replace(/[ ---]/g, "");
}
function J(p, t) {
  return typeof p != "string" ? null : on(p).trim().slice(0, t);
}
function vt(p) {
  return typeof p == "number" && isFinite(p);
}
function he(p, t) {
  if (!p || typeof p != "object")
    return console.warn("import: skipping profile[" + t + "] — not an object"), null;
  var s = J(p.id, et), r = J(p.name, et);
  return !s || !r ? (console.warn("import: skipping profile[" + t + "] — missing id or name"), null) : { id: s, name: r };
}
function fe(p, t) {
  if (!p || typeof p != "object")
    return console.warn("import: skipping track[" + t + "] — not an object"), null;
  var s = J(p.url, Ce), r = J(p.title, et);
  return !s || !r ? (console.warn("import: skipping track[" + t + "] — missing url or title"), null) : {
    url: s,
    title: r,
    artist: J(p.artist, et) || "",
    duration: J(p.duration, et) || "",
    durationSec: vt(p.durationSec) ? p.durationSec : 0
  };
}
function rn(p, t, s) {
  if (!p || typeof p != "object")
    return console.warn("import: skipping segment[" + t + "].loop[" + s + "] — not an object"), null;
  var r = J(p.name, et);
  return r ? !vt(p.startSec) || !vt(p.endSec) || !vt(p.startPct) || !vt(p.endPct) ? (console.warn("import: skipping segment[" + t + "].loop[" + s + "] — invalid numbers"), null) : p.startSec < 0 || p.endSec < 0 || p.startPct < 0 || p.endPct < 0 ? (console.warn("import: skipping segment[" + t + "].loop[" + s + "] — negative values"), null) : p.endSec <= p.startSec ? (console.warn("import: skipping segment[" + t + "].loop[" + s + "] — endSec <= startSec"), null) : {
    name: r,
    startSec: p.startSec,
    endSec: p.endSec,
    startPct: p.startPct,
    endPct: p.endPct
  } : (console.warn("import: skipping segment[" + t + "].loop[" + s + "] — missing name"), null);
}
function Le(p, t) {
  if (!p || typeof p != "object")
    return console.warn("import: skipping segment[" + t + "] — not an object"), null;
  var s = J(p.url, Ce);
  if (!s)
    return console.warn("import: skipping segment[" + t + "] — missing url"), null;
  var r = [];
  if (Array.isArray(p.loops))
    for (var d = p.loops.slice(0, nn), h = 0; h < d.length; h++) {
      var i = rn(d[h], t, h);
      i && r.push(i);
    }
  return {
    url: s,
    notes: J(p.notes, et) || "",
    loops: r
  };
}
function sn(p, t) {
  if (!p || typeof p != "object")
    return console.warn("import: skipping playlist[" + t + "] — not an object"), null;
  var s = J(p.id, et), r = J(p.profileId, et), d = J(p.name, et);
  if (!s || !r || !d)
    return console.warn("import: skipping playlist[" + t + "] — missing id, profileId, or name"), null;
  var h = [];
  if (Array.isArray(p.segments))
    for (var i = p.segments.slice(0, en), n = 0; n < i.length; n++) {
      var e = Le(i[n], n);
      e && h.push(e);
    }
  return {
    id: s,
    profileId: r,
    name: d,
    segments: h
  };
}
function an(p) {
  p._exportData = function() {
    Promise.all([
      lnDb.getAll("profiles"),
      lnDb.getAll("tracks"),
      lnDb.getAll("playlists"),
      lnDb.get("settings", "app")
    ]).then(function(t) {
      const s = t[0] || [], r = t[1] || [], d = t[2] || [], h = t[3] || {}, i = r.map(function(c) {
        return {
          url: c.url,
          title: c.title || "",
          artist: c.artist || "",
          duration: c.duration || "",
          durationSec: c.durationSec || 0
        };
      }), n = {
        version: Qe,
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        app: ce,
        settings: {
          apiUrl: h.apiUrl || "",
          brandLogo: h.brandLogo || ""
        },
        profiles: s,
        tracks: i,
        playlists: d
      }, e = JSON.stringify(n, null, 2), o = new Blob([e], { type: "application/json" }), a = URL.createObjectURL(o), f = document.createElement("a");
      f.href = a, f.download = tn, document.body.appendChild(f), f.click(), document.body.removeChild(f), URL.revokeObjectURL(a), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "success", message: "Data exported" }
      }));
    }).catch(function(t) {
      console.error("Export failed:", t), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "warn", message: "Export failed" }
      }));
    });
  }, p._validateImportData = function(t) {
    return !(!t || typeof t != "object" || t.app !== ce || !vt(t.version) || !Array.isArray(t.profiles) || t.profiles.length === 0 || t.version >= 2 && (!Array.isArray(t.tracks) || !Array.isArray(t.playlists)));
  }, p._processImport = function(t) {
    const s = this;
    if (!this._validateImportData(t)) {
      window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "warn", message: "Invalid data file" }
      }));
      return;
    }
    const r = t.settings || {}, d = {
      key: "app",
      apiUrl: r.apiUrl || "",
      brandLogo: r.brandLogo || ""
    }, h = [lnDb.put("settings", d)];
    if (t.version === 1) {
      var i = {};
      t.profiles.forEach(function(f, c) {
        var y = he(f, c);
        if (y) {
          h.push(lnDb.put("profiles", y));
          var l = f.playlists || {};
          for (var u in l)
            if (l.hasOwnProperty(u)) {
              var g = l[u], m = J(g.name, et);
              if (m) {
                for (var v = g.tracks || [], b = [], E = 0; E < v.length; E++) {
                  var _ = Le(v[E], E);
                  if (_) {
                    if (!i[_.url]) {
                      i[_.url] = !0;
                      var k = fe(v[E], E);
                      k && h.push(lnDb.put("tracks", k));
                    }
                    b.push(_);
                  }
                }
                var x = y.id + "--" + u;
                h.push(lnDb.put("playlists", {
                  id: x,
                  profileId: y.id,
                  name: m,
                  segments: b
                }));
              }
            }
        }
      });
    } else {
      var n = 0, e = 0, o = 0;
      t.profiles.forEach(function(f, c) {
        var y = he(f, c);
        y ? h.push(lnDb.put("profiles", y)) : n++;
      }), (t.tracks || []).forEach(function(f, c) {
        var y = fe(f, c);
        y ? h.push(lnDb.put("tracks", y)) : e++;
      }), (t.playlists || []).forEach(function(f, c) {
        var y = sn(f, c);
        y ? h.push(lnDb.put("playlists", y)) : o++;
      });
      var a = n + e + o;
      a > 0 && console.warn("import v2: skipped " + n + " profile(s), " + e + " track(s), " + o + " playlist(s)");
    }
    Promise.all(h).then(function() {
      lnSettings.apply({
        apiUrl: d.apiUrl,
        brandLogo: d.brandLogo
      }), s._loadProfiles();
      const f = s._collectTrackUrls(t);
      var c = h.length - 1;
      window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: {
          type: "success",
          message: "Imported " + c + " record" + (c !== 1 ? "s" : "")
        }
      })), f.length > 0 && s._updateTransferStatus(
        f.length + " track" + (f.length !== 1 ? "s" : "") + " need audio download"
      );
    }).catch(function(f) {
      console.error("Import failed:", f), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "warn", message: "Import failed" }
      }));
    });
  }, p._importFromUrl = function(t) {
    const s = this;
    if (!t) {
      window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "warn", message: "Enter a URL" }
      }));
      return;
    }
    s._updateTransferStatus("Downloading..."), fetch(t).then(function(r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      var d = parseInt(r.headers.get("content-length"), 10);
      if (d > ue) throw new Error("File too large (max 50MB)");
      return r.json();
    }).then(function(r) {
      s._updateTransferStatus(""), s._processImport(r);
    }).catch(function(r) {
      console.error("Import from URL failed:", r), s._updateTransferStatus(""), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "warn", message: "Failed to fetch: " + r.message }
      }));
    });
  }, p._importFromFile = function(t) {
    const s = this;
    if (!t) return;
    const r = new FileReader();
    r.onload = function(d) {
      if (d.target.result.length > ue) {
        window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
          detail: { type: "warn", message: "File too large (max 50MB)" }
        }));
        return;
      }
      try {
        const h = JSON.parse(d.target.result);
        s._processImport(h);
      } catch {
        window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
          detail: { type: "warn", message: "Invalid JSON file" }
        }));
      }
    }, r.onerror = function() {
      window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
        detail: { type: "warn", message: "Failed to read file" }
      }));
    }, r.readAsText(t);
  }, p._collectTrackUrls = function(t) {
    const s = {};
    return t.version === 1 ? (t.profiles || []).forEach(function(r) {
      if (r.playlists)
        for (const d in r.playlists) {
          if (!r.playlists.hasOwnProperty(d)) continue;
          const h = r.playlists[d].tracks || [];
          for (let i = 0; i < h.length; i++)
            h[i].url && (s[h[i].url] = !0);
        }
    }) : (t.tracks || []).forEach(function(r) {
      r.url && (s[r.url] = !0);
    }), Object.keys(s);
  }, p._batchDownloadAudio = function() {
    const t = this;
    lnDb.getAll("tracks").then(function(s) {
      const r = [];
      if (s.forEach(function(d) {
        d.url && r.push(d.url);
      }), r.length === 0) {
        window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
          detail: { type: "info", message: "No tracks to download" }
        }));
        return;
      }
      return lnDb.getAllKeys("audioFiles").then(function(d) {
        const h = {};
        d.forEach(function(a) {
          h[a] = !0;
        });
        const i = r.filter(function(a) {
          return !h[a];
        });
        if (i.length === 0) {
          window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
            detail: { type: "info", message: "All tracks already cached" }
          }));
          return;
        }
        window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
          detail: {
            type: "info",
            message: "Downloading " + i.length + " track" + (i.length !== 1 ? "s" : "") + "..."
          }
        }));
        let n = 0, e = 0;
        function o(a) {
          if (a >= i.length) {
            let f = "Download complete: " + n + " cached";
            e > 0 && (f += ", " + e + " failed"), t._updateTransferStatus(""), t._updateCacheInfo(), window.dispatchEvent(new CustomEvent("ln-toast:enqueue", {
              detail: { type: n > 0 ? "success" : "warn", message: f }
            }));
            return;
          }
          t._updateTransferStatus(
            "Downloading " + (a + 1) + "/" + i.length + "..."
          ), t._downloadBlob(i[a], function(f) {
            f ? n++ : e++, o(a + 1);
          });
        }
        o(0);
      });
    });
  }, p._updateTransferStatus = function(t) {
    const s = document.querySelector("[data-ln-transfer-status]");
    s && (s.textContent = t || "", s.hidden = !t);
  }, p._bindTransferActions = function() {
    const t = this;
    document.addEventListener("click", function(r) {
      let d;
      if (d = r.target.closest('[data-ln-action="export-data"]'), d) {
        t._exportData();
        return;
      }
      if (d = r.target.closest('[data-ln-action="import-file"]'), d) {
        const h = document.querySelector("[data-ln-import-file]");
        h && h.click();
        return;
      }
      if (d = r.target.closest('[data-ln-action="import-from-url"]'), d) {
        const h = document.querySelector('[data-ln-field="import-url"]'), i = h ? h.value.trim() : "";
        t._importFromUrl(i);
        return;
      }
      if (d = r.target.closest('[data-ln-action="batch-download"]'), d) {
        t._batchDownloadAudio();
        return;
      }
    });
    const s = document.querySelector("[data-ln-import-file]");
    s && s.addEventListener("change", function() {
      const r = s.files[0];
      r && (t._importFromFile(r), s.value = "");
    });
  };
}
const pe = "data-mixer", xt = "lnMixer";
if (window[xt] === void 0) {
  let p = function(e) {
    t(e);
  }, t = function(e) {
    const o = Array.from(e.querySelectorAll("[" + pe + "]"));
    e.hasAttribute && e.hasAttribute(pe) && o.push(e), o.forEach(function(a) {
      a[xt] || (a[xt] = new s(a));
    });
  }, s = function(e) {
    return this.dom = e, e[xt] = this, this._pendingLogo = null, this._audioCtx = null, this._masterGain = null, this._downloading = {}, this._downloadProgress = {}, this._blobUrls = {}, this._fileProtocolWarned = !1, this._autoplay = !1, this._autoplayTimer = null, this._autoplayPreloaded = !1, Ve(this), Ye(this), Je(this), Ze(this), an(this), this._bindScopedEvents(), this._bindGlobalEvents(), this._loadProfiles(), this._updateEmptyState(), this;
  }, r = function() {
    new MutationObserver(function(o) {
      o.forEach(function(a) {
        a.type === "childList" && a.addedNodes.forEach(function(f) {
          f.nodeType === 1 && t(f);
        });
      });
    }).observe(document.body, {
      childList: !0,
      subtree: !0
    });
  };
  var Ot = p, Mt = t, Rt = s, Nt = r;
  s.prototype._loadProfiles = function() {
    const e = this;
    lnDb.open().then(function() {
      return lnDb.getAll("profiles");
    }).then(function(o) {
      const a = e._getNav();
      a && a.dispatchEvent(new CustomEvent("ln-profile:request-hydrate", {
        detail: { profiles: o }
      }));
    });
  }, s.prototype._updateEmptyState = function() {
    const e = this._getNav(), o = e && e.lnProfile && Object.keys(e.lnProfile.profiles).length > 0;
    console.log("[ln-mixer] _updateEmptyState called:", {
      navFound: !!e,
      lnProfileReady: !!(e && e.lnProfile),
      profilesCount: e && e.lnProfile && e.lnProfile.profiles ? Object.keys(e.lnProfile.profiles).length : 0,
      hasProfiles: o
    });
    const a = this.dom.querySelector("[data-mixer-empty-state]"), f = this.dom.querySelector(".decks-panel"), c = this._getSidebar();
    a && (a.hidden = o, console.log("[ln-mixer] emptyState hidden set to:", o)), f && (f.hidden = !o), c && (c.hidden = !o);
  }, s.prototype._getNav = function() {
    return this.dom.querySelector("[data-mixer-profile]");
  }, s.prototype._getSidebar = function() {
    return this.dom.querySelector("[data-mixer-playlist]");
  }, s.prototype._getDeck = function(e) {
    return this.dom.querySelector('[data-mixer-deck="' + e + '"]');
  }, s.prototype._getLibraryEl = function() {
    return document.querySelector("[data-mixer-library]");
  }, s.prototype._refreshDeckHighlights = function() {
    const e = this._getSidebar();
    e && this.dom.querySelectorAll("[data-mixer-deck]").forEach(function(o) {
      const a = o.getAttribute("data-mixer-deck"), f = o.lnDeck ? o.lnDeck.trackIndex : -1;
      e.dispatchEvent(new CustomEvent("ln-playlist:request-highlight", {
        detail: { deckId: a, index: f }
      }));
    });
  }, s.prototype._bindScopedEvents = function() {
    this._bindProfileBridge(), this._bindDeckWiring(), this._bindLoopWiring(), this._bindAudioWiring();
  }, s.prototype._bindGlobalEvents = function() {
    this._bindAutoplayToggle(), this._bindProfileActions(), this._bindPlaylistActions(), this._bindLoopActions(), this._bindLibraryReactions(), this._bindCacheActions(), this._bindSettingsActions(), this._bindTransferActions();
  }, window[xt] = p, r(), document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
    p(document.body);
  }) : p(document.body);
}
document.addEventListener("submit", function(p) {
  p.preventDefault();
  const t = p.target;
  t.hasAttribute("data-ln-form") && t.dispatchEvent(new CustomEvent("ln-form:submit", {
    bubbles: !0,
    detail: { form: t }
  }));
}, !0);
"serviceWorker" in navigator && navigator.serviceWorker.register("./sw.js");
