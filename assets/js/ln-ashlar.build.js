function Ke() {
  return typeof window > "u" ? !1 : window.lnDebug === !0 || window.lnCore && window.lnCore._debugSink ? !0 : typeof document < "u" && document.body ? document.body.hasAttribute("data-ln-debug") || document.body.querySelector("[data-ln-debug]") !== null : !1;
}
function ke(e) {
  if (typeof window > "u") return !1;
  if (window.lnDebug === !0) return !0;
  if (window.lnCore && window.lnCore._debugIsContained)
    return e ? window.lnCore._debugIsContained(e) : window.lnCore._debugSink !== null;
  if (e && e.closest) {
    const n = e.closest("[data-ln-debug]");
    return !(!n || typeof document < "u" && n === document.documentElement);
  }
  return typeof document < "u" && document.body ? document.body.hasAttribute("data-ln-debug") : !1;
}
if (typeof window < "u" && (window.lnCore = window.lnCore || {}, !window.lnCore._warnBound)) {
  window.lnCore._warnBound = !0;
  const e = console.warn;
  console.warn = function(...n) {
    if (typeof n[0] == "string" && (n[0].startsWith("[ln-") || n[0].startsWith("[lnCore"))) {
      let d = null;
      for (let h = 1; h < n.length; h++)
        if (n[h] && n[h].nodeType === 1) {
          d = n[h];
          break;
        }
      if (!ke(d))
        return;
    }
    e.apply(console, n);
  };
}
function q(e, n, a) {
  const d = a || {};
  window.lnCore._debugSink && window.lnCore._debugSink("event", n, e, d), e.dispatchEvent(new CustomEvent(n, {
    bubbles: !0,
    detail: d
  }));
}
function ae(e, n, a) {
  const d = a || {};
  window.lnCore._debugSink && window.lnCore._debugSink("event", n, e, d);
  const h = new CustomEvent(n, {
    bubbles: !0,
    cancelable: !0,
    detail: d
  });
  return e.dispatchEvent(h), h;
}
function Et(e, n, a) {
  e._applyFilterAndSort(), e._vStart = -1, e._vEnd = -1, e._render(), e._updateFooter();
  const d = {
    sort: e.currentSort,
    filters: e.currentFilters,
    search: e.currentSearch
  };
  d[a] = e.name, q(e.dom, n, d);
}
function me(e, n) {
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", function() {
      me(e, n);
    }), console.warn("[" + n + '] Script loaded before <body> — add "defer" to your <script> tag');
    return;
  }
  e();
}
function ve(e) {
  return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
}
function Ve(e) {
  return !!(!e || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || typeof e.button == "number" && e.button !== 0);
}
function Qe(e) {
  return !!(!e || e.disabled || typeof e.getAttribute == "function" && e.getAttribute("aria-disabled") === "true" || typeof e.closest == "function" && e.closest("[inert]"));
}
function Ne(e) {
  return e.hasAttribute("data-ln-value") ? e.getAttribute("data-ln-value") : e.tagName === "TIME" && e.hasAttribute("datetime") ? e.getAttribute("datetime") : e.tagName === "DATA" && e.hasAttribute("value") ? e.getAttribute("value") : e.textContent.trim();
}
function St(e) {
  const n = e.querySelector('input[name="_method"]');
  return ((n && n.value !== "" ? n.value : e.method) || "").toUpperCase();
}
function Ct(e, n) {
  const a = {}, d = e.elements;
  for (let h = 0; h < d.length; h++) {
    const p = d[h];
    if (!(!p.name || p.disabled || p.type === "file" || p.type === "submit" || p.type === "button"))
      if (p.type === "checkbox")
        a[p.name] || (a[p.name] = []), p.checked && a[p.name].push(p.value);
      else if (p.type === "radio")
        p.checked && (a[p.name] = p.value);
      else if (p.type === "select-multiple") {
        a[p.name] = [];
        for (let g = 0; g < p.options.length; g++)
          p.options[g].selected && a[p.name].push(p.options[g].value);
      } else
        a[p.name] = p.value;
  }
  return a;
}
function At(e, n = "ln-core") {
  try {
    return e ? JSON.parse(e) : {};
  } catch (a) {
    return console.error(`[${n}] Invalid headers JSON:`, a), {};
  }
}
const $e = {};
function qt(e, n) {
  $e[e] = n;
}
function Tt(e) {
  return $e[e] || { ingress: (n) => n, egress: (n) => n };
}
typeof window < "u" && (window.lnCore = window.lnCore || {}, window.lnCore.registerDataMapper = qt, window.lnCore.getDataMapper = Tt);
function Be(e) {
  const n = e ? e.closest("[lang]") : null, a = (n ? n.getAttribute("lang") || n.lang : null) || (typeof document < "u" && document.documentElement ? document.documentElement.getAttribute("lang") || document.documentElement.lang : null) || (typeof navigator < "u" ? navigator.language : null);
  return a ? a.trim() : "en-US";
}
function Lt() {
  typeof window > "u" || (window.lnCore = window.lnCore || {}, !window.lnCore._localeObserverBound && (window.lnCore._localeObserverBound = !0, me(function() {
    new MutationObserver(function() {
      q(document, "ln-core:locale-change", {});
    }).observe(document.documentElement, {
      attributes: !0,
      attributeFilter: ["lang"],
      subtree: !0
    });
  }, "ln-core")));
}
const Je = {};
function kt(e, n) {
  if (!e || typeof n != "object") return;
  const a = e.toLowerCase().split("-")[0];
  Je[a] = n;
}
function It(e) {
  if (!e) return null;
  const n = e.toLowerCase().split("-")[0];
  return Je[n] || null;
}
typeof window < "u" && (window.lnCore = window.lnCore || {}, window.lnCore.registerLocaleFallback = kt, window.lnCore.getLocaleFallback = It, window.lnCore.ensureLocaleObserver = Lt);
const Ee = {};
function Ye(e, n) {
  Ee[e] || (Ee[e] = document.querySelector('[data-ln-template="' + e + '"]'));
  const a = Ee[e];
  return a ? a.content.cloneNode(!0) : (console.warn("[" + (n || "ln-core") + '] Template "' + e + '" not found'), null);
}
function Ce(e, n, a) {
  if (e) {
    const d = e.querySelector('[data-ln-template="' + n + '"]');
    if (d) return d.content.cloneNode(!0);
  }
  return Ye(n, a);
}
function _e(e, n) {
  if (!e || !n) return e;
  const a = e.querySelectorAll("[data-ln-field]");
  for (let g = 0; g < a.length; g++) {
    const _ = a[g], w = _.getAttribute("data-ln-field");
    n[w] != null && (_.textContent = n[w]);
  }
  const d = e.querySelectorAll("[data-ln-attr]");
  for (let g = 0; g < d.length; g++) {
    const _ = d[g], w = _.getAttribute("data-ln-attr").split(",");
    for (let m = 0; m < w.length; m++) {
      const A = w[m].trim().split(":");
      if (A.length !== 2) continue;
      const f = A[0].trim(), b = A[1].trim();
      n[b] != null && _.setAttribute(f, n[b]);
    }
  }
  const h = e.querySelectorAll("[data-ln-show]");
  for (let g = 0; g < h.length; g++) {
    const _ = h[g], w = _.getAttribute("data-ln-show");
    w in n && _.classList.toggle("hidden", !n[w]);
  }
  const p = e.querySelectorAll("[data-ln-class]");
  for (let g = 0; g < p.length; g++) {
    const _ = p[g], w = _.getAttribute("data-ln-class").split(",");
    for (let m = 0; m < w.length; m++) {
      const A = w[m].trim().split(":");
      if (A.length !== 2) continue;
      const f = A[0].trim(), b = A[1].trim();
      b in n && _.classList.toggle(f, !!n[b]);
    }
  }
  return e;
}
function Dt(e, n) {
  e.matches && e.matches("[data-ln-form], [data-ln-fillable]") && (window.lnCore._debugSink && window.lnCore._debugSink("event", "ln-fill", e, n ?? null), e.dispatchEvent(new CustomEvent("ln-fill", { detail: n ?? null, bubbles: !0 })));
  const a = e.querySelectorAll("[data-ln-form], [data-ln-fillable]");
  for (let d = 0; d < a.length; d++)
    window.lnCore._debugSink && window.lnCore._debugSink("event", "ln-fill", a[d], n ?? null), a[d].dispatchEvent(new CustomEvent("ln-fill", { detail: n ?? null, bubbles: !0 }));
  return e;
}
typeof window < "u" && (window.lnCore = window.lnCore || {}, window.lnCore._fillBound || (window.lnCore._fillBound = !0, document.addEventListener("ln-fill", function(e) {
  if (!(!e.target.matches || !e.target.matches("[data-ln-fillable]")))
    if (e.detail)
      _e(e.target, e.detail);
    else {
      const n = e.target.querySelectorAll("[data-ln-field]");
      for (let a = 0; a < n.length; a++)
        n[a].textContent = "";
    }
})));
function Ie(e, n) {
  if (!e || !n) return e;
  const a = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
  for (; a.nextNode(); ) {
    const p = a.currentNode;
    p.textContent.indexOf("{{") !== -1 && (p.textContent = p.textContent.replace(
      /\{\{\s*(\w+)\s*\}\}/g,
      function(g, _) {
        return n[_] !== void 0 ? n[_] : "";
      }
    ));
  }
  const d = function(p, g) {
    return n[g] !== void 0 ? n[g] : "";
  }, h = Array.from(e.querySelectorAll("*"));
  e.nodeType === 1 && h.push(e);
  for (let p = 0; p < h.length; p++) {
    const g = h[p], _ = g.attributes;
    for (let w = 0; w < _.length; w++) {
      const m = _[w];
      m.value.indexOf("{{") !== -1 && g.setAttribute(m.name, m.value.replace(/\{\{\s*(\w+)\s*\}\}/g, d));
    }
  }
  return e;
}
function xt(e, n, a, d, h, p) {
  const g = {};
  for (let w = 0; w < e.children.length; w++) {
    const m = e.children[w], A = m.getAttribute("data-ln-render-key");
    A && (g[A] = m);
  }
  const _ = document.createDocumentFragment();
  for (let w = 0; w < n.length; w++) {
    const m = n[w], A = String(d(m));
    let f = g[A];
    if (f)
      h(f, m, w);
    else {
      const b = Ye(a, p);
      if (!b || (Ie(b, m), f = b.firstElementChild, !f)) continue;
      f.setAttribute("data-ln-render-key", A), h(f, m, w);
    }
    _.appendChild(f);
  }
  e.textContent = "", e.appendChild(_);
}
function Rt(e, n) {
  const a = {}, d = e.querySelectorAll("[" + n + "]");
  for (let h = 0; h < d.length; h++)
    a[d[h].getAttribute(n)] = d[h].textContent, d[h].remove();
  return a;
}
typeof window < "u" && (window.lnCore = window.lnCore || {}, window.lnCore.fillTemplate = Ie, window.lnCore.fill = _e, window.lnCore.lnFill = Dt, window.lnCore.renderList = xt);
function ie(e, n, a) {
  const d = e.getAttribute(n);
  return d === null ? a : d;
}
function pe(e, n, a) {
  const d = parseInt(e.getAttribute(n), 10);
  return isNaN(d) ? a : d;
}
function De(e, n, a = !1) {
  const d = e.getAttribute(n);
  if (d === null) return !!a;
  const h = d.trim().toLowerCase();
  return !(h === "false" || h === "0");
}
function Xe(e, n) {
  return (e.getAttribute(n) || "").split(",").map((a) => a.trim()).filter(Boolean);
}
const Se = /* @__PURE__ */ new Map();
function Ot(e, n) {
  const a = (e ? e.join("|") : "") + "::" + n;
  if (Se.has(a)) return Se.get(a);
  const d = new Set(e || []), h = function(p, g) {
    const _ = p.getAttribute(g);
    return _ !== null && d.has(_) ? _ : n;
  };
  return Se.set(a, h), h;
}
function Mt(e, n, a) {
  const d = parseFloat(e.getAttribute(n));
  return isNaN(d) ? a : d;
}
function Ft(e, n, a) {
  const d = e.getAttribute(n);
  if (!d) return a;
  try {
    return JSON.parse(d);
  } catch {
    return a;
  }
}
function Ze(e, n, a, d, h) {
  if (!e || n === null) return !0;
  const p = d || "ln-component", g = e.type;
  if (g === "trigger" || g === "marker" || g === "string" || g === "list" || !g || n === "" && e.fallback !== void 0)
    return !0;
  const _ = (w) => {
    h ? console.warn(w, h) : console.warn(w);
  };
  if (g === "boolean") {
    const w = n.trim().toLowerCase();
    return w !== "" && w !== "true" && w !== "false" && w !== "1" && w !== "0" ? (_(`[${p}] Invalid value "${n}" for boolean attribute "${a}". Allowed: "true", "false", or presence-only.`), !1) : !0;
  }
  if (g === "enum") {
    const w = e.values || [];
    return w.includes(n) ? !0 : (_(`[${p}] Invalid value "${n}" for attribute "${a}". Allowed: ${w.join(", ")}. Fallback: "${e.fallback}".`), !1);
  }
  if (g === "integer") {
    if (!/^-?\d+$/.test(n))
      return _(`[${p}] Invalid integer "${n}" for attribute "${a}". Fallback: ${e.fallback}.`), !1;
    const w = parseInt(n, 10);
    return e.min !== void 0 && w < e.min ? (_(`[${p}] Value ${w} for attribute "${a}" is less than min (${e.min}).`), !1) : e.max !== void 0 && w > e.max ? (_(`[${p}] Value ${w} for attribute "${a}" is greater than max (${e.max}).`), !1) : !0;
  }
  if (g === "float")
    return isNaN(Number(n)) ? (_(`[${p}] Invalid float "${n}" for attribute "${a}". Fallback: ${e.fallback}.`), !1) : !0;
  if (g === "json")
    try {
      return JSON.parse(n), !0;
    } catch (w) {
      return _(`[${p}] Invalid JSON for attribute "${a}": ${w.message}. Fallback: ${e.fallback}.`), !1;
    }
  return !0;
}
function le(e, n, a) {
  for (const d in a) {
    const [h, p, g] = a[d];
    Object.defineProperty(e, d, {
      // Getter only, no setter — assignment throws in strict mode (ES
      // modules are strict). Deliberate: it forbids a drifting copy.
      get: function() {
        return h(n, p, g);
      },
      enumerable: !0,
      configurable: !0
    });
  }
  return e;
}
function ce(e) {
  const n = {};
  for (const a in e) {
    const d = e[a];
    if (!d || !d.prop) continue;
    let h = d.read;
    if (!h && d.type)
      switch (d.type) {
        case "enum":
          h = Ot(d.values, d.fallback);
          break;
        case "integer":
          h = pe;
          break;
        case "float":
          h = Mt;
          break;
        case "boolean":
          h = De;
          break;
        case "list":
          h = Xe;
          break;
        case "json":
          h = Ft;
          break;
        case "string":
        default:
          h = ie;
          break;
      }
    h || (h = ie), n[d.prop] = [h, a, d.fallback];
  }
  return n;
}
function Nt(e) {
  const n = {};
  for (const a in e) {
    const d = e[a];
    d && d.effect && (n[a] = d.effect);
  }
  return Object.keys(n).length ? n : null;
}
function Bt(e) {
  if (e.onAttrChange && !e.declared) return null;
  const n = /* @__PURE__ */ new Set();
  if (e.effects) for (const a in e.effects) n.add(a);
  if (e.onAttrChange && e.declared) for (const a of e.declared) n.add(a);
  return n;
}
function xe(e, n, a, d) {
  if (e.nodeType !== 1) return;
  const p = n.indexOf("[") !== -1 || n.indexOf(".") !== -1 || n.indexOf("#") !== -1 ? n : "[" + n + "]", g = Array.from(e.querySelectorAll(p));
  e.matches && e.matches(p) && g.push(e);
  for (const _ of g)
    if (!_[a]) {
      window.lnCore._persistSink && _.hasAttribute("data-ln-persist") && window.lnCore._persistSink(_, n);
      try {
        _[a] = new d(_);
      } catch (w) {
        console.error("[" + a + "] init failed", _, w);
      }
    }
}
typeof window < "u" && (window.lnCore = window.lnCore || {}, window.lnCore._bootHolds = window.lnCore._bootHolds || 0, window.lnCore._bootQueue = window.lnCore._bootQueue || []);
function Pt() {
  return typeof window < "u" && window.lnCore && window.lnCore._bootHolds || 0;
}
function Ae(e) {
  typeof window < "u" ? (window.lnCore = window.lnCore || {}, window.lnCore._bootHolds = window.lnCore._bootHolds || 0, window.lnCore._bootQueue = window.lnCore._bootQueue || [], window.lnCore._bootHolds > 0 ? window.lnCore._bootQueue.push(e) : setTimeout(e, 0)) : e();
}
function et() {
  window.lnCore = window.lnCore || {};
  const e = window.lnCore._attrRegistry = window.lnCore._attrRegistry || { byAttr: /* @__PURE__ */ new Map(), reactive: [], persist: [] };
  return e.byReactive = e.byReactive || /* @__PURE__ */ new Map(), e.reactiveWildcard = e.reactiveWildcard || [], e;
}
function zt(e) {
  const n = et(), a = e.observed || [];
  for (let d = 0; d < a.length; d++) {
    const h = a[d];
    n.byAttr.has(h) || n.byAttr.set(h, []), n.byAttr.get(h).push(e);
  }
  if (n.byDeclaredAttr = n.byDeclaredAttr || /* @__PURE__ */ new Map(), e.attributes)
    for (const d in e.attributes) {
      n.byDeclaredAttr.has(d) || n.byDeclaredAttr.set(d, []);
      const h = n.byDeclaredAttr.get(d);
      h.some((p) => p.componentTag === e.componentTag) || h.push({
        spec: e.attributes[d],
        componentTag: e.componentTag
      });
    }
  if (e.onAttrChange || e.effects) {
    n.reactive.push(e);
    const d = Bt(e);
    if (d === null)
      n.reactiveWildcard.push(e);
    else
      for (const h of d)
        n.byReactive.has(h) || n.byReactive.set(h, []), n.byReactive.get(h).push(e);
  }
  e.persist && n.persist.push(e);
}
function Pe(e, n, a, d) {
  for (let h = 0; h < e.length; h++) {
    const p = e[h];
    if (!n[p.attribute]) continue;
    const g = p.effects && p.effects[a];
    g ? g(n, a, d) : p.onAttrChange && (!p.declared || p.declared.has(a)) && p.onAttrChange(n, a, d);
  }
}
function Ht(e) {
  const n = e.target, a = e.attributeName;
  if (e.oldValue === n.getAttribute(a)) return;
  const d = et(), h = d.byAttr.get(a);
  if (Ke() && d.byDeclaredAttr && d.byDeclaredAttr.has(a) && ke(n)) {
    const p = d.byDeclaredAttr.get(a), g = n.getAttribute(a);
    for (let _ = 0; _ < p.length; _++)
      Ze(p[_].spec, g, a, p[_].componentTag, n);
  }
  if (window.lnCore._debugSink && (a.indexOf("data-ln-") === 0 || h) && window.lnCore._debugSink("attr", a, n, { oldValue: e.oldValue, newValue: n.getAttribute(a) }), a.indexOf("data-ln-") === 0) {
    const p = d.byReactive.get(a);
    p && Pe(p, n, a, e.oldValue), d.reactiveWildcard.length && Pe(d.reactiveWildcard, n, a, e.oldValue);
  }
  if (h)
    for (let p = 0; p < h.length; p++) {
      const g = h[p];
      if (g.handler) {
        g.handler(n, a, e.oldValue);
        continue;
      }
      g.onAttributeChange && n[g.attribute] ? g.onAttributeChange(n, a) : (xe(n, g.selector, g.attribute, g.ComponentFn), g.onInit && g.onInit(n));
    }
}
function Gt() {
  window.lnCore = window.lnCore || {}, !window.lnCore._attrObserverBound && (window.lnCore._attrObserverBound = !0, me(function() {
    new MutationObserver(function(n) {
      for (let a = 0; a < n.length; a++)
        try {
          Ht(n[a]);
        } catch (d) {
          console.error("[ln-core] mutation handler failed", n[a].target, d);
        }
    }).observe(document.body, {
      attributes: !0,
      subtree: !0,
      attributeOldValue: !0
    });
  }, "ln-core"));
}
function tt() {
  return window.lnCore = window.lnCore || {}, window.lnCore._lifecycleRegistry = window.lnCore._lifecycleRegistry || [];
}
function Ut(e) {
  const n = tt();
  if (n.length) {
    if (e.target)
      for (let a = 0; a < n.length; a++) {
        const d = n[a];
        if (d.onSubtreeChange) {
          const h = d.query, p = e.target.nodeType === 1 ? e.target.matches(h) ? e.target : e.target.closest(h) : e.target.parentElement ? e.target.parentElement.closest(h) : null;
          p && d.onSubtreeChange(p, e);
        }
      }
    for (let a = 0; a < e.addedNodes.length; a++) {
      const d = e.addedNodes[a];
      if (d.nodeType === 1)
        for (let h = 0; h < n.length; h++) {
          const p = n[h];
          xe(d, p.selector, p.attribute, p.ComponentFn), p.onInit && p.onInit(d);
        }
    }
    for (let a = 0; a < e.removedNodes.length; a++) {
      const d = e.removedNodes[a];
      if (d.nodeType === 1)
        for (let h = 0; h < n.length; h++) {
          const p = n[h], g = p.query, _ = Array.from(d.querySelectorAll(g));
          d.matches && d.matches(g) && _.push(d);
          for (let w = 0; w < _.length; w++) {
            const m = _[w];
            if (!document.contains(m)) {
              const A = m[p.attribute];
              if (A && typeof A.destroy == "function")
                try {
                  A.destroy();
                } catch (f) {
                  console.error("[" + p.attribute + "] destroy failed", m, f);
                }
              delete m[p.attribute];
            }
          }
        }
    }
  }
}
function jt() {
  window.lnCore = window.lnCore || {}, !window.lnCore._lifecycleObserverBound && (window.lnCore._lifecycleObserverBound = !0, me(function() {
    new MutationObserver(function(n) {
      for (let a = 0; a < n.length; a++) {
        const d = n[a];
        if (d.type === "childList")
          try {
            Ut(d);
          } catch (h) {
            console.error("[ln-core] lifecycle handler failed", d.target, h);
          }
      }
    }).observe(document.body, {
      childList: !0,
      subtree: !0
    });
  }, "ln-core"));
}
function Z(e, n, a, d, h = {}) {
  const p = h.extraAttributes || [], g = h.onAttributeChange || null, _ = h.onSubtreeChange || null, w = h.onInit || null, m = h.onAttrChange || null, A = h.effects || null, f = h.attributes || null, b = f ? Nt(f) : A, L = f ? new Set(Object.keys(f)) : null, x = h.persist || null;
  function O(r) {
    const i = r || document.body;
    if (xe(i, e, n, a), f && Ke())
      for (const o in f) {
        const v = f[o], t = Array.from(i.querySelectorAll("[" + o + "]"));
        i.matches && i.matches("[" + o + "]") && t.push(i);
        for (let s = 0; s < t.length; s++) {
          const c = t[s];
          ke(c) && Ze(v, c.getAttribute(o), o, d, c);
        }
      }
    w && w(i);
  }
  const S = [];
  if (e.indexOf("[") !== -1) {
    const r = /\[([\w-]+)/g;
    let i;
    for (; (i = r.exec(e)) !== null; )
      S.push(i[1]);
  } else
    S.push(e);
  zt({
    selector: e,
    attribute: n,
    componentTag: d,
    attributes: f,
    ComponentFn: a,
    onInit: w,
    observed: S.concat(p),
    onAttributeChange: g,
    onAttrChange: m,
    effects: b,
    declared: L,
    persist: x
  }), Gt();
  const N = e.indexOf("[") !== -1 || e.indexOf(".") !== -1 || e.indexOf("#") !== -1 ? e : "[" + e + "]";
  tt().push({
    selector: e,
    attribute: n,
    ComponentFn: a,
    onInit: w,
    onSubtreeChange: _,
    query: N
  }), jt(), window[n] = O;
  function M() {
    Pt() > 0 ? Ae(function() {
      O(document.body);
    }) : O(document.body);
  }
  return document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", M) : M(), O;
}
function nt(e) {
  let n = !1;
  for (let a = 0; a < e.length; a++) {
    const d = e[a];
    if (!(d === "" || d == null) && (n = !0, !Number.isFinite(Number(d))))
      return "string";
  }
  return n ? "number" : "string";
}
function rt(e, n, a, d) {
  if (a === "number") {
    const g = parseFloat(e), _ = parseFloat(n);
    return (isNaN(g) ? 0 : g) - (isNaN(_) ? 0 : _);
  }
  const h = e != null ? String(e) : "", p = n != null ? String(n) : "";
  return d ? d.compare(h, p) : h < p ? -1 : h > p ? 1 : 0;
}
function it(e, n) {
  let a = !1;
  return function() {
    a || (a = !0, queueMicrotask(function() {
      a = !1, e();
    }));
  };
}
function Wt(e) {
  e = e || {};
  let n = e.windowSize > 0 ? e.windowSize : 1e3, a = e.pageSize > 0 ? e.pageSize : 200, d = e.threshold != null ? e.threshold : 25, h = e.fetchDebounce != null ? e.fetchDebounce : 120;
  const p = typeof e.requestPage == "function" ? e.requestPage : function() {
  }, g = typeof e.onChange == "function" ? e.onChange : function() {
  }, _ = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Set();
  let A = 0, f = 0, b = 0, L = { sort: null, filters: {}, search: "" }, x = null, O = 0, S = 0, R = !1;
  function N(o) {
    w.set(o, ++O);
  }
  function M() {
    return !!(L && (L.search || L.filters && Object.keys(L.filters).length));
  }
  function r() {
    if (_.size <= n) return;
    const o = Array.from(_.keys()).sort(function(t, s) {
      return (w.get(t) || 0) - (w.get(s) || 0);
    });
    let v = 0;
    for (; _.size > n && v < o.length; )
      _.delete(o[v]), w.delete(o[v]), v++;
  }
  function i(o, v) {
    m.add(o), p(L, o, v);
  }
  return {
    get: function(o) {
      return _.get(o);
    },
    has: function(o) {
      return _.has(o);
    },
    peek: function() {
      return _.size ? _.values().next().value : void 0;
    },
    get logicalTotal() {
      return A;
    },
    get grandTotal() {
      return f;
    },
    get queryGen() {
      return b;
    },
    get size() {
      return _.size;
    },
    // Render client hands its visible logical range; stamps in-range resident
    // rows as freshly used, then checks if any page in range (padded by threshold)
    // is missing from cache and needs to be fetched (page-aligned).
    ensure: function(o, v) {
      clearTimeout(x), S = o;
      for (let E = o; E < v; E++)
        _.has(E) && N(E);
      if (A <= 0) return;
      const t = Math.max(0, o - d), s = Math.min(A, v + d), c = Math.floor(t / a), y = Math.floor(Math.max(0, s - 1) / a);
      let C = -1;
      for (let E = c; E <= y; E++) {
        const D = E * a, F = Math.min(a, A - D);
        let B = !1;
        const z = Math.max(D, t), U = Math.min(D + F, s);
        for (let G = z; G < U; G++)
          if (!_.has(G)) {
            B = !0;
            break;
          }
        if (B && !m.has(D)) {
          C = D;
          break;
        }
      }
      C !== -1 && (x = setTimeout(function() {
        i(C, a);
      }, h));
    },
    // Splice a fetched page. Stale (superseded-query) responses are dropped.
    // Out-of-order pages splice at their own offset, so order is irrelevant.
    // Returns whether the page counted as an answer — the render client keys
    // its loading affordance off that.
    ingest: function(o) {
      if (o = o || {}, o.queryGen != null && o.queryGen !== b) return !1;
      const v = o.offset || 0, t = o.data || [];
      let s = 0;
      for (let c = 0; c < t.length; c++)
        t[c] != null && s++;
      if (s === 0 && (o.provisional || o.filtered > 0))
        return m.delete(v), !1;
      R && (_.clear(), w.clear(), R = !1), o.provisional || (f = o.total != null ? o.total : f, A = o.filtered != null ? o.filtered : o.data ? o.data.length : A);
      for (let c = 0; c < t.length; c++)
        t[c] != null && (_.set(v + c, t[c]), N(v + c));
      return m.delete(v), r(), g(), !0;
    },
    // First load: fetch page 0 at the current generation (no bump).
    requestInitial: function(o) {
      o && (L = o), i(0, a);
    },
    // Query change: new generation, stale rows stay visible until the first
    // response of the new generation lands in ingest() — no blanking, no
    // placeholder flash (ln-table--loading is the refresh affordance).
    invalidate: function(o) {
      b++, m.clear(), clearTimeout(x), o && (L = o), R = !0, i(0, a);
    },
    // Post-mutation refresh of a windowed view: same stale-while-revalidate
    // swap as invalidate(), but re-requests the page at the CURRENT scroll
    // position instead of jumping back to page 0.
    revalidate: function() {
      b++, m.clear(), clearTimeout(x), R = !0;
      const o = Math.max(0, Math.floor(S / a) * a);
      i(o, a);
    },
    // Failed page fetch: release the offset so the next ensure() (scroll,
    // filter, resize) can re-request it. No onChange(), no auto-retry.
    release: function(o) {
      m.delete(o);
    },
    destroy: function() {
      clearTimeout(x), _.clear(), w.clear(), m.clear();
    },
    configure: function(o) {
      o = o || {};
      let v = !1;
      if (o.windowSize != null && o.windowSize > 0 && o.windowSize !== n) {
        const t = o.windowSize < n;
        n = o.windowSize, t && r(), v = !0;
      }
      o.pageSize != null && o.pageSize > 0 && (a = o.pageSize), o.threshold != null && o.threshold >= 0 && (d = o.threshold), o.fetchDebounce != null && o.fetchDebounce >= 0 && (h = o.fetchDebounce), v && g();
    },
    setGrandTotal: function(o) {
      o == null || isNaN(o) || o < 0 || (f = o, M() || (A = o), g());
    }
  };
}
function ot(e) {
  return (e || "").replace(/^#/, "");
}
function Re(e) {
  const n = e === void 0 ? location.hash : e, a = {}, d = ot(n);
  if (!d) return a;
  const h = d.split("&");
  for (let p = 0; p < h.length; p++) {
    const g = h[p];
    if (!g) continue;
    const _ = g.indexOf(":"), w = _ > -1 ? g.slice(0, _) : g, m = _ > -1 ? g.slice(_ + 1) : "";
    if (w)
      try {
        a[w] = decodeURIComponent(m);
      } catch {
        a[w] = m;
      }
  }
  return a;
}
function qe(e) {
  if (!e) return null;
  const n = Re();
  return e in n ? n[e] : null;
}
function st(e, n) {
  if (!e) return;
  const a = Re();
  n == null ? delete a[e] : a[e] = String(n);
  const h = Object.keys(a).map(function(p) {
    const g = a[p];
    return g === "" ? p : p + ":" + encodeURIComponent(g);
  }).join("&");
  ot(location.hash) !== h && (location.hash = h);
}
function Kt(e) {
  return e.button === 1 || e.ctrlKey || e.metaKey || e.shiftKey ? !1 : (e.preventDefault(), !0);
}
function Te(e, n) {
  if (!e || !e.hasAttribute("data-ln-hash")) return null;
  const a = e.getAttribute("data-ln-hash");
  if (a && a.trim() !== "") return a.trim();
  const d = e.getAttribute("data-ln-sort") || e.getAttribute("data-ln-search-for") || e.getAttribute("data-ln-search") || e.getAttribute("data-ln-filter") || e.id;
  return d ? n ? d + "-" + n : d : n || null;
}
function Vt(e, n) {
  return !n || n === "none" || e === null || e === void 0 ? null : String(e) + "." + n;
}
function Qt(e) {
  return !e || typeof e != "string" ? null : e.endsWith(".asc") ? { fieldOrColumn: e.slice(0, -4), direction: "asc" } : e.endsWith(".desc") ? { fieldOrColumn: e.slice(0, -5), direction: "desc" } : null;
}
function $t(e, n) {
  return !e || !Array.isArray(n) || n.length === 0 ? null : e + ":" + n.map(encodeURIComponent).join(",");
}
function Jt(e) {
  if (!e || typeof e != "string") return null;
  const n = e.indexOf(":");
  if (n === -1) return null;
  const a = e.slice(0, n), d = e.slice(n + 1), h = d ? d.split(",").map(function(p) {
    try {
      return decodeURIComponent(p);
    } catch {
      return p;
    }
  }).filter(Boolean) : [];
  return { key: a, values: h };
}
typeof window < "u" && (window.lnCore = window.lnCore || {}, window.lnCore.hashParse = Re, window.lnCore.hashGet = qe, window.lnCore.hashSet = st, window.lnCore.hashLinkClick = Kt, window.lnCore.resolveHashNamespace = Te, window.lnCore.hashSortEncode = Vt, window.lnCore.hashSortDecode = Qt, window.lnCore.hashFilterEncode = $t, window.lnCore.hashFilterDecode = Jt);
let he = null;
const Yt = "ln-ashlar:storage-salt:v1", ze = 32768;
function He(e) {
  let n = "";
  const a = e.byteLength;
  for (let d = 0; d < a; d += ze)
    n += String.fromCharCode.apply(
      null,
      e.subarray(d, Math.min(d + ze, a))
    );
  return btoa(n);
}
function Ge(e) {
  const n = atob(e), a = n.length, d = new Uint8Array(a);
  for (let h = 0; h < a; h++)
    d[h] = n.charCodeAt(h);
  return d;
}
function at(e, n) {
  let a = he, d = {};
  return typeof CryptoKey < "u" && e instanceof CryptoKey ? a = e : e && typeof e == "object" && (d = e, typeof CryptoKey < "u" && d.key instanceof CryptoKey && (a = d.key)), { key: a, options: d };
}
async function Xt(e, n = {}) {
  if (!e)
    throw new Error("[ln-crypto] Key derivation failed: Secret string is required");
  const a = n.method || "pbkdf2", d = new TextEncoder();
  if (a === "sha256") {
    const w = await crypto.subtle.digest("SHA-256", d.encode(e));
    return crypto.subtle.importKey(
      "raw",
      w,
      { name: "AES-GCM" },
      !1,
      ["encrypt", "decrypt"]
    );
  }
  const h = n.salt || Yt, p = typeof h == "string" ? d.encode(h) : h, g = n.iterations || 1e5, _ = await crypto.subtle.importKey(
    "raw",
    d.encode(e),
    "PBKDF2",
    !1,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: p,
      iterations: g,
      hash: "SHA-256"
    },
    _,
    { name: "AES-GCM", length: 256 },
    !1,
    ["encrypt", "decrypt"]
  );
}
async function Ue(e, n = {}) {
  if (!e) {
    he = null;
    return;
  }
  try {
    const a = n.method || "sha256";
    he = await Xt(e, { ...n, method: a });
  } catch (a) {
    throw console.error("[ln-core/crypto] Key derivation failed:", a), he = null, a;
  }
}
function re() {
  return he;
}
async function Zt(e, n, a) {
  const { key: d } = at(n);
  if (e == null)
    return e;
  if (!d)
    throw new Error("[ln-crypto] Encryption failed: No active cryptographic key provided");
  try {
    const h = new TextEncoder(), p = crypto.getRandomValues(new Uint8Array(12)), g = typeof e == "string" ? e : JSON.stringify(e), _ = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: p },
      d,
      h.encode(g)
    );
    return {
      v: 1,
      alg: "AES-GCM",
      encrypted: !0,
      iv: He(p),
      data: He(new Uint8Array(_))
    };
  } catch (h) {
    throw console.error("[ln-core/crypto] Encryption failed:", h), new Error("[ln-crypto] Encryption failed: " + (h && h.message ? h.message : String(h)));
  }
}
async function en(e, n, a) {
  const { key: d, options: h } = at(n), p = h.silent === !0;
  if (!e || !e.encrypted)
    return e;
  if (!d) {
    if (p)
      return { ...e, decryptionError: !0 };
    throw new Error("[ln-crypto] Decryption failed: No active cryptographic key provided");
  }
  if (!e.iv || !e.data) {
    if (p)
      return { ...e, decryptionError: !0 };
    throw new Error("[ln-crypto] Decryption failed: Malformed envelope (missing iv or data)");
  }
  try {
    const g = new TextDecoder(), _ = Ge(e.iv), w = Ge(e.data), m = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: _ },
      d,
      w
    ), A = g.decode(m);
    try {
      return JSON.parse(A);
    } catch {
      return A;
    }
  } catch (g) {
    if (p)
      return { ...e, decryptionError: !0 };
    throw console.error("[ln-core/crypto] Decryption failed. Key may be incorrect or payload tampered:", g), new Error("[ln-crypto] Decryption failed. Key may be incorrect or payload tampered: " + (g && g.message ? g.message : String(g)));
  }
}
function tn(e, n = 100, a = 0) {
  const d = parseFloat(String(e)) || 0, h = parseFloat(String(n)) || 100, p = parseFloat(String(a)) || 0, g = Math.max(p, Math.min(d, h)), _ = h - p;
  let w = 0;
  return _ > 0 && (w = (g - p) / _ * 100), w = Math.max(0, Math.min(100, w)), {
    value: d,
    min: p,
    max: h,
    clampedValue: g,
    percentage: w
  };
}
function Le(e) {
  return String(e || "").trim().toLowerCase();
}
function lt(e) {
  const n = Le(e);
  return n ? n.split(/\s+/).filter(Boolean) : [];
}
function nn(e) {
  if (e == null) return null;
  const n = String(e).split(",").map((a) => a.trim()).filter(Boolean);
  return n.length ? n : null;
}
function ct(e, n) {
  if (!n || n.length === 0) return !0;
  if (!e) return !1;
  const a = String(e).toLowerCase();
  for (let d = 0; d < n.length; d++)
    if (a.indexOf(n[d]) === -1) return !1;
  return !0;
}
function rn(e) {
  return !e || e.length === 0 ? "" : e.join(" ").replace(/\s+/g, " ").trim().toLowerCase();
}
function on(e, n) {
  if (!n || n.length === 0) return !0;
  if (e == null) return !1;
  const a = String(e).trim().toLowerCase();
  for (let d = 0; d < n.length; d++)
    if (String(n[d]).trim().toLowerCase() === a)
      return !0;
  return !1;
}
(function() {
  const e = "data-ln-modal", n = "lnModal", a = "data-ln-modal-for", d = "data-ln-modal-close";
  if (window[n] !== void 0) return;
  const h = {
    "data-ln-modal": {
      type: "enum",
      values: ["open", "close"],
      fallback: "close",
      effect: A,
      description: "Control state of the modal dialog"
    },
    "data-ln-modal-for": {
      type: "string",
      description: "Target modal ID to open on trigger click"
    },
    "data-ln-modal-close": {
      type: "trigger",
      description: "Click dismiss trigger inside the modal"
    }
  }, p = /* @__PURE__ */ new Set();
  let g = null;
  function _() {
    g || (g = function(f) {
      if (Ve(f)) return;
      const b = f.target.closest("[" + a + "]");
      if (!b || Qe(b)) return;
      const L = b.getAttribute(a);
      if (!L) return;
      const x = document.getElementById(L) || document.querySelector("[" + e + '="' + L + '"]');
      !x || !x[n] || (f.preventDefault(), b.hasAttribute("data-ln-modal-mode") && x.setAttribute("data-ln-modal-mode", b.getAttribute("data-ln-modal-mode")), x.setAttribute(e, "open"));
    }, document.addEventListener("click", g));
  }
  function w() {
    p.size > 0 || !g || (document.removeEventListener("click", g), g = null);
  }
  function m(f) {
    this.dom = f, this.isOpen = f.getAttribute(e) === "open";
    const b = this;
    return this._onRequestOpen = function() {
      b.dom.setAttribute(e, "open");
    }, this._onRequestClose = function() {
      b.dom.setAttribute(e, "close");
    }, this._onCancel = function(L) {
      L.preventDefault(), b.dom.setAttribute(e, "close");
    }, this._onClickClose = function(L) {
      const x = L.target.closest("[" + d + "]");
      x && b.dom.contains(x) && (L.preventDefault(), b.dom.setAttribute(e, "close"));
    }, this.dom.addEventListener("ln-modal:request-open", this._onRequestOpen), this.dom.addEventListener("ln-modal:request-close", this._onRequestClose), this.dom.addEventListener("cancel", this._onCancel), this.dom.addEventListener("click", this._onClickClose), p.add(this), _(), this.isOpen && (typeof this.dom.showModal == "function" && this.dom.showModal(), document.body.classList.add("ln-modal-open"), q(this.dom, "ln-modal:open", { modalId: this.dom.id, target: this.dom })), this;
  }
  m.prototype.open = function() {
    this.dom.setAttribute(e, "open");
  }, m.prototype.close = function() {
    this.dom.setAttribute(e, "close");
  }, m.prototype.toggle = function() {
    const f = this.dom.getAttribute(e);
    this.dom.setAttribute(e, f === "open" ? "close" : "open");
  }, m.prototype.destroy = function() {
    if (this.dom[n]) {
      if (this.dom.removeEventListener("ln-modal:request-open", this._onRequestOpen), this.dom.removeEventListener("ln-modal:request-close", this._onRequestClose), this.dom.removeEventListener("cancel", this._onCancel), this.dom.removeEventListener("click", this._onClickClose), p.delete(this), w(), this.isOpen) {
        const f = this.dom;
        Array.prototype.some.call(
          document.querySelectorAll("[" + e + '="open"]'),
          function(L) {
            return L !== f;
          }
        ) || document.body.classList.remove("ln-modal-open");
      }
      delete this.dom[n];
    }
  };
  function A(f) {
    const b = f[n];
    if (!b) return;
    const x = f.getAttribute(e) === "open";
    if (x !== b.isOpen)
      if (x) {
        if (ae(f, "ln-modal:before-open", { modalId: f.id, target: f }).defaultPrevented) {
          f.setAttribute(e, "close");
          return;
        }
        b.isOpen = !0, document.body.classList.add("ln-modal-open"), typeof f.showModal == "function" && f.showModal();
        const S = f.querySelector("[autofocus]");
        if (S && ve(S))
          S.focus();
        else {
          const R = f.querySelectorAll('input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled])'), N = Array.prototype.find.call(R, ve);
          if (N) N.focus();
          else {
            const M = f.querySelectorAll("a[href], button:not([disabled])"), r = Array.prototype.find.call(M, ve);
            r && r.focus();
          }
        }
        q(f, "ln-modal:open", { modalId: f.id, target: f });
      } else {
        if (ae(f, "ln-modal:before-close", { modalId: f.id, target: f }).defaultPrevented) {
          f.setAttribute(e, "open");
          return;
        }
        b.isOpen = !1, q(f, "ln-modal:close", { modalId: f.id, target: f }), typeof f.close == "function" && f.close(), document.querySelector("[" + e + '="open"]') || document.body.classList.remove("ln-modal-open");
      }
  }
  Z(e, n, m, "ln-modal", {
    attributes: h
  });
})();
(function() {
  const e = "data-ln-toast", n = "lnToast", a = "ln-toast-item";
  if (window[n] !== void 0) return;
  const d = {
    "data-ln-toast": { type: "marker", description: "Initializes the toast notifications container" },
    "data-ln-toast-timeout": { prop: "timeoutDefault", type: "integer", read: pe, fallback: 6e3, min: 500, description: "Default auto-dismiss timeout in ms" },
    "data-ln-toast-max": { prop: "max", type: "integer", read: pe, fallback: 5, min: 1, description: "Maximum visible concurrent toast notifications" },
    "data-ln-toast-close": { type: "trigger", description: "Click dismiss trigger inside a toast item" },
    "data-ln-toast-item": { type: "marker", description: "Individual toast notification element" }
  }, h = ce(d);
  function p(S) {
    if (!(!S || !(S instanceof HTMLElement)) && (S.hasAttribute("popover") || S.setAttribute("popover", "manual"), typeof S.showPopover == "function")) {
      if (S.matches(":popover-open"))
        try {
          S.hidePopover();
        } catch {
        }
      try {
        S.showPopover();
      } catch {
      }
    }
  }
  function g(S) {
    if (!S || !(S instanceof HTMLElement)) return;
    if (S.querySelectorAll("[data-ln-toast-item]").length === 0 && typeof S.hidePopover == "function" && S.matches(":popover-open"))
      try {
        S.hidePopover();
      } catch {
      }
  }
  function _(S) {
    this.dom = S, le(this, S, h);
    const R = Array.from(S.querySelectorAll("[data-ln-toast-item]"));
    for (; R.length > this.max; ) S.removeChild(R.shift());
    for (const N of R) L(N, this);
    return R.length > 0 && p(S), this;
  }
  _.prototype.enqueue = function(S) {
    if (!S) return;
    const R = w(S, this.dom);
    if (!R) return;
    const N = Number.isFinite(S.timeout) ? S.timeout : this.timeoutDefault;
    A(this, R), N > 0 && (R._timer = setTimeout(() => f(R), N));
  }, _.prototype.clear = function() {
    for (const S of Array.from(this.dom.querySelectorAll("[data-ln-toast-item]")))
      f(S);
  }, _.prototype.destroy = function() {
    if (this.dom[n]) {
      for (const S of Array.from(this.dom.querySelectorAll("[data-ln-toast-item]")))
        f(S);
      g(this.dom), delete this.dom[n];
    }
  };
  function w(S, R) {
    const N = ((S.type || "") + "").trim().toLowerCase(), M = Ce(R, a, "ln-toast");
    if (!M)
      return console.warn('[ln-toast] Template "' + a + '" not found'), null;
    _e(M, {
      type: N,
      title: S.title,
      message: typeof S.message == "string" ? S.message : void 0
    });
    const r = M.firstElementChild;
    if (!r) return null;
    r.hasAttribute("data-ln-toast-item") || r.setAttribute("data-ln-toast-item", ""), r.classList.add("ln-enter");
    const i = r.querySelector(".body");
    i && m(i, S);
    const o = r.querySelector("[data-ln-toast-close]");
    return o && o.addEventListener("click", function() {
      f(r);
    }), r;
  }
  function m(S, R) {
    if (Array.isArray(R.message)) {
      const N = document.createElement("ul");
      for (const M of R.message) {
        const r = document.createElement("li");
        r.textContent = M, N.appendChild(r);
      }
      S.appendChild(N);
    }
    if (R.data && R.data.errors) {
      const N = document.createElement("ul");
      for (const M of Object.values(R.data.errors).flat()) {
        const r = document.createElement("li");
        r.textContent = M, N.appendChild(r);
      }
      S.appendChild(N);
    }
  }
  function A(S, R) {
    const N = Array.from(S.dom.querySelectorAll("[data-ln-toast-item]"));
    for (; N.length >= S.max && N.length > 0; ) S.dom.removeChild(N.shift());
    S.dom.appendChild(R), p(S.dom), requestAnimationFrame(() => R.classList.remove("ln-enter"));
  }
  function f(S) {
    if (!S || !S.parentNode) return;
    const R = S.parentNode;
    clearTimeout(S._timer), S.classList.remove("ln-enter"), S.classList.add("ln-out"), setTimeout(() => {
      S.parentNode && (S.parentNode.removeChild(S), g(R));
    }, 200);
  }
  function b(S) {
    let R = S && S.container;
    return typeof R == "string" && (R = document.querySelector(R)), R instanceof HTMLElement || (R = document.querySelector("[" + e + "]") || document.getElementById("ln-toast-container")), R || null;
  }
  function L(S, R) {
    if (S._lnToastHydrated) return;
    S._lnToastHydrated = !0;
    const N = S.querySelector("[data-ln-toast-close]");
    N && N.addEventListener("click", function() {
      f(S);
    });
    const M = +(S.getAttribute("data-ln-toast-timeout") ?? R.timeoutDefault);
    M > 0 && (S._timer = setTimeout(function() {
      f(S);
    }, M));
  }
  function x(S) {
    const R = S.detail || {}, N = b(R);
    if (!N) {
      console.warn("[ln-toast] No toast container found");
      return;
    }
    (N[n] || (N[n] = new _(N))).enqueue(R);
  }
  function O(S) {
    const R = S && S.detail || {};
    if (R.container) {
      const N = b(R);
      N && (N[n] || (N[n] = new _(N))).clear();
    } else {
      const N = document.querySelectorAll("[" + e + "]");
      for (const M of Array.from(N))
        (M[n] || (M[n] = new _(M))).clear();
    }
  }
  me(function() {
    window.addEventListener("ln-toast:enqueue", x), window.addEventListener("ln-toast:clear", O), window.addEventListener("ln-modal:open", function() {
      const S = document.querySelectorAll("[" + e + "], #ln-toast-container");
      for (const R of Array.from(S))
        R.querySelectorAll("[data-ln-toast-item]").length > 0 && p(R);
    });
  }, "ln-toast"), Z(e, n, _, "ln-toast", {
    attributes: d
  });
})();
(function() {
  const e = "data-ln-accordion", n = "lnAccordion";
  if (window[n] !== void 0) return;
  const a = {
    "data-ln-accordion": { type: "marker", description: "Identifies container as an accordion that coordinates single-panel expansion" }
  };
  function d(h) {
    return this.dom = h, this._onToggleOpen = function(p) {
      if (p.detail.target.closest("[data-ln-accordion]") !== h) return;
      const g = h.querySelectorAll("[data-ln-toggle]");
      for (const _ of g)
        _ !== p.detail.target && _.closest("[data-ln-accordion]") === h && _.getAttribute("data-ln-toggle") === "open" && _.setAttribute("data-ln-toggle", "close");
      q(h, "ln-accordion:change", { target: p.detail.target });
    }, h.addEventListener("ln-toggle:open", this._onToggleOpen), this;
  }
  d.prototype.destroy = function() {
    this.dom[n] && (this.dom.removeEventListener("ln-toggle:open", this._onToggleOpen), delete this.dom[n]);
  }, Z(e, n, d, "ln-accordion", {
    attributes: a
  });
})();
(function() {
  const e = "data-ln-toggle", n = "lnToggle", a = "data-ln-toggle-for", d = "data-ln-toggle-action";
  if (window[n] !== void 0) return;
  const h = {
    "data-ln-toggle": { effect: b, type: "enum", values: ["open", "close"], fallback: "close", description: "Visibility state of toggleable element" },
    "data-ln-toggle-for": { type: "string", description: "Target element ID to toggle on trigger click" },
    "data-ln-toggle-action": { type: "enum", values: ["open", "close", "toggle"], fallback: "toggle", description: "Action performed on target element when trigger is clicked" }
  }, p = /* @__PURE__ */ new Set();
  let g = null;
  function _(L, x) {
    return x === "open" ? "open" : x === "close" || L === "open" ? "close" : "open";
  }
  function w() {
    g || (g = function(L) {
      if (Ve(L)) return;
      const x = L.target.closest("[" + a + "]");
      if (!x || Qe(x)) return;
      const O = x.getAttribute(a);
      if (!O) return;
      const S = document.getElementById(O);
      if (!S || !S[n]) return;
      L.preventDefault();
      const R = x.getAttribute(d) || "toggle", N = S.getAttribute(e);
      S.setAttribute(e, _(N, R));
    }, document.addEventListener("click", g));
  }
  function m() {
    p.size > 0 || !g || (document.removeEventListener("click", g), g = null);
  }
  function A(L, x) {
    if (!L || !L.id) return;
    const O = document.querySelectorAll(
      "[" + a + '="' + L.id + '"]'
    );
    for (let S = 0; S < O.length; S++)
      O[S].setAttribute("aria-expanded", x ? "true" : "false");
  }
  function f(L) {
    this.dom = L;
    const x = this;
    return this._onRequestOpen = function() {
      x.open();
    }, this._onRequestClose = function() {
      x.close();
    }, this._onRequestToggle = function() {
      x.toggle();
    }, this.dom.addEventListener("ln-toggle:request-open", this._onRequestOpen), this.dom.addEventListener("ln-toggle:request-close", this._onRequestClose), this.dom.addEventListener("ln-toggle:request-toggle", this._onRequestToggle), this.isOpen = L.getAttribute(e) === "open", this.isOpen && L.classList.add("open"), A(L, this.isOpen), p.add(this), w(), this;
  }
  f.prototype.open = function() {
    this.dom.setAttribute(e, "open");
  }, f.prototype.close = function() {
    this.dom.setAttribute(e, "close");
  }, f.prototype.toggle = function() {
    const L = this.dom.getAttribute(e);
    this.dom.setAttribute(e, _(L, "toggle"));
  }, f.prototype.destroy = function() {
    this.dom[n] && (this.dom.removeEventListener("ln-toggle:request-open", this._onRequestOpen), this.dom.removeEventListener("ln-toggle:request-close", this._onRequestClose), this.dom.removeEventListener("ln-toggle:request-toggle", this._onRequestToggle), p.delete(this), delete this.dom[n], m());
  };
  function b(L) {
    const x = L[n];
    if (!x) return;
    const S = L.getAttribute(e) === "open";
    if (S !== x.isOpen)
      if (S) {
        if (ae(L, "ln-toggle:before-open", { target: L }).defaultPrevented) {
          L.setAttribute(e, "close");
          return;
        }
        x.isOpen = !0, L.classList.add("open"), A(L, !0), q(L, "ln-toggle:open", { target: L });
      } else {
        if (ae(L, "ln-toggle:before-close", { target: L }).defaultPrevented) {
          L.setAttribute(e, "open");
          return;
        }
        x.isOpen = !1, L.classList.remove("open"), A(L, !1), q(L, "ln-toggle:close", { target: L });
      }
  }
  Z(e, n, f, "ln-toggle", {
    attributes: h,
    persist: { attr: e, hashActive: null }
  });
})();
(function() {
  const e = "data-ln-sortable", n = "lnSortable", a = "data-ln-sortable-handle";
  if (window[n] !== void 0) return;
  const d = {
    "data-ln-sortable": { effect: p, type: "enum", values: ["enabled", "disabled"], fallback: "enabled", description: "Enables drag-and-drop item reordering or disables when set to disabled" },
    "data-ln-sortable-handle": { type: "marker", description: "Designates an element as the drag handle for its parent sortable item" }
  };
  function h(g) {
    this.dom = g, this.isEnabled = g.getAttribute(e) !== "disabled", this._dragging = null, g.setAttribute("aria-roledescription", "sortable list");
    const _ = this;
    return this._onPointerDown = function(w) {
      _.isEnabled && _._handlePointerDown(w);
    }, g.addEventListener("pointerdown", this._onPointerDown), this;
  }
  h.prototype.destroy = function() {
    this.dom[n] && (this.dom.removeEventListener("pointerdown", this._onPointerDown), delete this.dom[n]);
  }, h.prototype._handlePointerDown = function(g) {
    let _ = g.target.closest("[" + a + "]"), w;
    if (_) {
      for (w = _; w && w.parentElement !== this.dom; )
        w = w.parentElement;
      if (!w || w.parentElement !== this.dom) return;
    } else {
      if (this.dom.querySelector("[" + a + "]")) return;
      for (w = g.target; w && w.parentElement !== this.dom; )
        w = w.parentElement;
      if (!w || w.parentElement !== this.dom) return;
      _ = w;
    }
    const A = Array.from(this.dom.children).indexOf(w);
    if (ae(this.dom, "ln-sortable:before-drag", {
      item: w,
      index: A
    }).defaultPrevented) return;
    g.preventDefault(), _.setPointerCapture(g.pointerId), this._dragging = w, w.classList.add("ln-sortable--dragging"), w.setAttribute("aria-grabbed", "true"), this.dom.classList.add("ln-sortable--active"), q(this.dom, "ln-sortable:drag-start", {
      item: w,
      index: A
    });
    const b = this, L = function(O) {
      b._handlePointerMove(O);
    }, x = function(O) {
      b._handlePointerEnd(O), _.removeEventListener("pointermove", L), _.removeEventListener("pointerup", x), _.removeEventListener("pointercancel", x);
    };
    _.addEventListener("pointermove", L), _.addEventListener("pointerup", x), _.addEventListener("pointercancel", x);
  }, h.prototype._handlePointerMove = function(g) {
    if (!this._dragging) return;
    const _ = Array.from(this.dom.children), w = this._dragging;
    for (const m of _)
      m.classList.remove("ln-sortable--drop-before", "ln-sortable--drop-after");
    for (const m of _) {
      if (m === w) continue;
      const A = m.getBoundingClientRect(), f = A.top + A.height / 2;
      if (g.clientY >= A.top && g.clientY < f) {
        m.classList.add("ln-sortable--drop-before");
        break;
      } else if (g.clientY >= f && g.clientY <= A.bottom) {
        m.classList.add("ln-sortable--drop-after");
        break;
      }
    }
  }, h.prototype._handlePointerEnd = function(g) {
    if (!this._dragging) return;
    const _ = this._dragging, w = Array.from(this.dom.children), m = w.indexOf(_);
    let A = null, f = null;
    for (const b of w) {
      if (b.classList.contains("ln-sortable--drop-before")) {
        A = b, f = "before";
        break;
      }
      if (b.classList.contains("ln-sortable--drop-after")) {
        A = b, f = "after";
        break;
      }
    }
    for (const b of w)
      b.classList.remove("ln-sortable--drop-before", "ln-sortable--drop-after");
    if (_.classList.remove("ln-sortable--dragging"), _.removeAttribute("aria-grabbed"), this.dom.classList.remove("ln-sortable--active"), A && A !== _) {
      f === "before" ? this.dom.insertBefore(_, A) : this.dom.insertBefore(_, A.nextElementSibling);
      const L = Array.from(this.dom.children).indexOf(_);
      q(this.dom, "ln-sortable:reordered", {
        item: _,
        oldIndex: m,
        newIndex: L
      });
    }
    this._dragging = null;
  };
  function p(g) {
    const _ = g[n];
    if (!_) return;
    const w = g.getAttribute(e) !== "disabled";
    w !== _.isEnabled && (_.isEnabled = w, q(g, w ? "ln-sortable:enabled" : "ln-sortable:disabled", { target: g }));
  }
  Z(e, n, h, "ln-sortable", {
    attributes: d
  });
})();
(function() {
  const e = "data-ln-search", n = "lnSearch", a = "data-ln-search-for", d = "lnSearchControl", h = "data-ln-search-items", p = "data-ln-search-fields", g = "data-ln-search-exclude", _ = "data-ln-search-hide", w = "data-ln-hash";
  if (window[n] !== void 0) return;
  const m = {
    "data-ln-search": { type: "string", effect: M, description: "Active search query term on target element or container" },
    "data-ln-hash": { type: "string", effect: M, description: "URL hash routing key for search state persistence" },
    "data-ln-search-for": { prop: "targetId", type: "string", read: ie, fallback: null, description: "Target table or list element ID that this input controls" },
    "data-ln-search-fields": { type: "list", description: "Comma-separated field names to include in client search" },
    "data-ln-search-items": { type: "string", description: "CSS selector matching searchable child items" },
    "data-ln-search-exclude": { type: "string", description: "CSS selector matching child items to exclude from search" },
    "data-ln-search-hide": { type: "enum", values: ["collapse", "none"], fallback: "collapse", description: "CSS hiding strategy for non-matching rows" },
    "data-ln-search-clear-for": { type: "trigger", description: "Click trigger to clear search input for target" }
  }, A = ce(m);
  function f(r) {
    const i = Te(r, "search");
    if (i) return i;
    if (r.id) {
      const o = document.querySelector("[" + a + '="' + r.id + '"]');
      if (o) {
        const v = Te(o, "search");
        if (v) return v;
      }
    }
    return null;
  }
  function b(r) {
    return r.matches("input, textarea") ? r : r.querySelector("input, textarea");
  }
  function L(r, i) {
    const o = r.childNodes;
    for (let v = 0; v < o.length; v++) {
      const t = o[v];
      if (t.nodeType === 3) {
        i.push(t.nodeValue);
        continue;
      }
      t.nodeType === 1 && (t.hasAttribute(g) || L(t, i));
    }
  }
  function x(r) {
    if (r._lnSearchText !== void 0) return r._lnSearchText;
    const i = [];
    L(r, i);
    const o = rn(i);
    return r._lnSearchText = o, o;
  }
  function O(r, i) {
    if (!r.id) return;
    const o = document.querySelectorAll("[" + a + '="' + r.id + '"]');
    for (const v of o) {
      const t = b(v);
      t && t.value !== i && (t.value = i);
    }
  }
  function S(r) {
    this.dom = r, this.term = r.getAttribute(e) || "", this._destroyed = !1;
    const i = this;
    return this.nsKey = f(r), this.hashEnabled = !!this.nsKey, this._onHashChange = function() {
      if (i._destroyed || !i.hashEnabled) return;
      const o = qe(i.nsKey), v = i.dom.getAttribute(e) || "";
      o !== null && o !== v ? i.dom.setAttribute(e, o) : o === null && v !== "" && i.dom.setAttribute(e, "");
    }, this.hashEnabled && window.addEventListener("hashchange", this._onHashChange), Ae(function() {
      if (!i._destroyed) {
        if (i.hashEnabled) {
          const o = qe(i.nsKey);
          if (o !== null && o !== i.term) {
            i.term = o, i.dom.setAttribute(e, o), O(i.dom, o), i._apply();
            return;
          }
        }
        Le(i.term) && (O(i.dom, i.term), i._apply());
      }
    }), this;
  }
  S.prototype._apply = function() {
    const r = this.dom, i = Le(this.term), o = lt(i);
    this.hashEnabled && st(this.nsKey, this.term ? this.term : null);
    const v = nn(r.getAttribute(p));
    if (ae(r, "ln-search:change", {
      term: i,
      tokens: o,
      targetId: r.id,
      fields: v
    }).defaultPrevented) return;
    const s = r.getAttribute(h), c = s ? r.querySelectorAll(s) : r.children;
    for (let y = 0; y < c.length; y++) {
      const C = c[y];
      if (C.removeAttribute(_), C.hasAttribute(g) || o.length === 0) continue;
      const E = x(C);
      ct(E, o) || C.setAttribute(_, "true");
    }
  }, S.prototype.destroy = function() {
    this.dom[n] && (this._destroyed = !0, this.hashEnabled && this._onHashChange && window.removeEventListener("hashchange", this._onHashChange), delete this.dom[n]);
  };
  function R(r) {
    if (this.dom = r, le(this, r, A), this.input = b(r), this._attachHandler(), this.input && this.input.value.trim()) {
      const i = this;
      Ae(function() {
        const o = document.getElementById(i.targetId);
        o && ((o.getAttribute(e) || "").trim() || i._write(i.input.value));
      });
    }
    return this;
  }
  R.prototype._write = function(r) {
    const i = document.getElementById(this.targetId);
    i && i.getAttribute(e) !== r && i.setAttribute(e, r);
  }, R.prototype._attachHandler = function() {
    if (!this.input) return;
    const r = this;
    this._onInput = function() {
      r._write(r.input.value);
    }, this.input.addEventListener("input", this._onInput);
  }, R.prototype.destroy = function() {
    this.dom[d] && (this.input && this._onInput && this.input.removeEventListener("input", this._onInput), delete this.dom[d]);
  };
  function N(r) {
    const i = r.getAttribute("data-ln-search-clear-for");
    if (i) {
      const c = document.getElementById(i), y = document.querySelector("[" + a + '="' + i + '"]'), C = y ? b(y) : null;
      return { target: c, input: C };
    }
    const o = r.closest("[" + e + "]");
    if (o) {
      const c = o.id ? document.querySelector("[" + a + '="' + o.id + '"]') : null, y = c ? b(c) : null;
      return { target: o, input: y };
    }
    const v = r.closest("[data-ln-table-source], [data-ln-list-source]");
    if (v) {
      const c = v.getAttribute("data-ln-table-source") || v.getAttribute("data-ln-list-source"), y = c ? document.getElementById(c) : null;
      if (y && y.hasAttribute(e)) {
        const C = document.querySelector("[" + a + '="' + c + '"]'), E = C ? b(C) : null;
        return { target: y, input: E };
      }
    }
    const t = r.closest("[" + a + "]");
    if (t) {
      const c = t.getAttribute(a), y = c ? document.getElementById(c) : null, C = b(t);
      return { target: y, input: C };
    }
    const s = r.parentElement;
    if (s) {
      const c = s.querySelector("[" + a + "]");
      if (c) {
        const y = c.getAttribute(a), C = y ? document.getElementById(y) : null, E = b(c);
        return { target: C, input: E };
      }
    }
    return { target: null, input: null };
  }
  document.addEventListener("click", function(r) {
    const i = r.target.closest("[data-ln-search-clear], [data-ln-search-clear-for]");
    if (!i) return;
    const o = N(i);
    !o.target && !o.input || (r.preventDefault(), o.input && (o.input.value = "", o.input.focus()), o.target && o.target.setAttribute(e, ""));
  });
  function M(r, i) {
    const o = r[n];
    if (!o || o._destroyed) return;
    if (i === w) {
      o._onHashChange && window.removeEventListener("hashchange", o._onHashChange), o.nsKey = f(r), o.hashEnabled = !!o.nsKey, o.hashEnabled && window.addEventListener("hashchange", o._onHashChange);
      return;
    }
    const v = r.getAttribute(e) || "";
    v !== o.term && (o.term = v, O(r, v), o._apply());
  }
  Z(e, n, S, "ln-search", {
    attributes: m,
    onSubtreeChange: function(r, i) {
      const o = i.target;
      o && o._lnSearchText !== void 0 && delete o._lnSearchText, o && o.parentElement && o.parentElement._lnSearchText !== void 0 && delete o.parentElement._lnSearchText;
    },
    persist: {
      attr: e,
      hashActive: function(r) {
        return !!f(r);
      }
    }
  }), Z(a, d, R, "ln-search-control");
})();
function sn(e, n, a = 100) {
  if (n != null && n !== "") {
    const d = parseFloat(String(n));
    if (!isNaN(d) && d > 0) return d;
  }
  if (e != null && e !== "") {
    const d = parseFloat(String(e));
    if (!isNaN(d) && d > 0) return d;
  }
  return a;
}
(function() {
  const e = "[data-ln-progress]", n = "lnProgress";
  if (window[n] !== void 0) return;
  function a(_) {
    const w = _[n];
    w && g.call(w);
  }
  const d = {
    "data-ln-progress": { type: "float", fallback: 0, min: 0, effect: a, description: "Current progress value" },
    "data-ln-progress-max": { type: "float", fallback: 100, min: 0, effect: a, description: "Maximum progress scale value" }
  };
  function h(_) {
    return this.dom = _, this._parentObserver = null, g.call(this), p.call(this), this;
  }
  h.prototype.destroy = function() {
    this.dom[n] && (this._parentObserver && this._parentObserver.disconnect(), delete this.dom[n]);
  };
  function p() {
    const _ = this, w = this.dom.parentElement;
    if (!w) return;
    const m = new MutationObserver(function(A) {
      for (const f of A)
        f.attributeName === "data-ln-progress-max" && g.call(_);
    });
    m.observe(w, {
      attributes: !0,
      attributeFilter: ["data-ln-progress-max"]
    }), this._parentObserver = m;
  }
  function g() {
    const _ = this.dom.getAttribute("data-ln-progress"), w = this.dom.parentElement, m = w ? w.getAttribute("data-ln-progress-max") : null, A = this.dom.getAttribute("data-ln-progress-max"), f = sn(A, m, 100), b = tn(_, f);
    this.dom.style.width = b.percentage + "%", this.dom.setAttribute("role", "progressbar"), this.dom.setAttribute("aria-valuemin", String(b.min)), this.dom.setAttribute("aria-valuemax", String(b.max)), this.dom.setAttribute("aria-valuenow", String(b.clampedValue)), q(this.dom, "ln-progress:change", {
      target: this.dom,
      value: b.value,
      max: b.max,
      percentage: b.percentage
    });
  }
  Z(
    e,
    n,
    h,
    "ln-progress",
    {
      attributes: d
    }
  );
})();
function an(e = {}) {
  let n = e.windowSize > 0 ? e.windowSize : 1e3, a = e.pageSize > 0 ? e.pageSize : 200, d = e.fetchDebounce != null ? e.fetchDebounce : 120;
  const h = typeof e.requestPage == "function" ? e.requestPage : () => {
  }, p = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Set();
  let _ = 0, w = 0, m = 0, A = !1, f = null;
  function b(O, S) {
    p.delete(O), p.set(O, S);
  }
  function L() {
    if (p.size <= n) return [];
    const O = [];
    for (; p.size > n; ) {
      const R = p.keys().next().value;
      O.push(p.get(R)), p.delete(R);
    }
    const S = new Set(p.values());
    return O.filter((R) => !S.has(R));
  }
  function x(O, S) {
    g.add(O), clearTimeout(f), f = setTimeout(() => h(O, a, S), d);
  }
  return {
    get logicalTotal() {
      return _;
    },
    set logicalTotal(O) {
      _ = O;
    },
    get grandTotal() {
      return w;
    },
    set grandTotal(O) {
      w = O;
    },
    get queryGen() {
      return m;
    },
    set queryGen(O) {
      m = O;
    },
    get size() {
      return p.size;
    },
    // Whether a server ordering exists for the current query at all — false
    // from reset() until the first ingest(). Distinct from a missing page.
    get hasLoaded() {
      return A;
    },
    getId: (O) => {
      if (!p.has(O)) return;
      const S = p.get(O);
      return b(O, S), S;
    },
    ensure: (O, S, R) => {
      if (!A && !g.has(0)) return x(0, R);
      if (_ <= 0) return;
      const N = Math.max(0, O), M = Math.min(_, S);
      for (let r = N; r < M; r++)
        if (!p.has(r)) {
          const i = Math.floor(r / a) * a;
          if (!g.has(i)) return x(i, R);
        }
    },
    ingest: (O, S, R, N, M) => {
      if (M != null && M !== m) return [];
      A = !0, R != null && (w = R), N != null && (_ = N);
      for (let r = 0; r < S.length; r++)
        b(O + r, S[r]);
      return g.delete(O), L();
    },
    reset: function() {
      m++, this.clear();
    },
    clear: () => {
      A = !1, p.clear(), g.clear(), clearTimeout(f);
    },
    // Returns the ids evicted by a window shrink, same contract as ingest() —
    // the caller must purge them from storage.
    configure: (O = {}) => {
      let S = [];
      return O.windowSize > 0 && O.windowSize !== n && (n = O.windowSize, S = L()), O.pageSize > 0 && (a = O.pageSize), O.fetchDebounce >= 0 && (d = O.fetchDebounce), S;
    }
  };
}
function ln(e, n, a) {
  if (!Array.isArray(e) || !n || !n.field) return e;
  const { field: d, direction: h } = n, p = h === "desc", g = e.map((w) => w ? w[d] : void 0), _ = nt(g);
  return [...e].sort((w, m) => {
    const A = w ? w[d] : void 0, f = m ? m[d] : void 0, b = rt(A, f, _, a);
    return p ? -b : b;
  });
}
function dt(e, n) {
  if (!Array.isArray(e) || !n || typeof n != "object") return e;
  const a = Object.keys(n).filter((d) => Array.isArray(n[d]) && n[d].length > 0);
  return a.length ? e.filter((d) => d ? a.every((h) => on(d[h], n[h])) : !1) : e;
}
function cn(e, n, a) {
  if (!Array.isArray(e) || !n || !a || !a.length) return e;
  const d = lt(n);
  return d.length ? e.filter((h) => h ? d.every(
    (p) => a.some((g) => {
      const _ = h[g];
      return _ != null && ct(String(_), [p]);
    })
  ) : !1) : e;
}
function dn(e, n, a) {
  if (!Array.isArray(e) || !e.length) return 0;
  if (a === "count") return e.length;
  const d = e.map((p) => p && p[n] != null ? parseFloat(p[n]) : NaN).filter((p) => Number.isFinite(p)), h = d.reduce((p, g) => p + g, 0);
  return a === "sum" ? h : a === "avg" && d.length ? h / d.length : 0;
}
function un(e, n = {}, a = [], d) {
  if (!Array.isArray(e))
    return { records: [], total: 0, filtered: 0 };
  const h = e.length;
  let p = e;
  n.filters && (p = dt(p, n.filters)), n.search && (p = cn(p, n.search, a));
  const g = p.length;
  if (n.sort && (p = ln(p, n.sort, d)), n.offset || n.limit) {
    const _ = n.offset || 0, w = n.limit || p.length;
    p = p.slice(_, _ + w);
  }
  return { records: p, total: h, filtered: g };
}
function fn(e, n) {
  return !Array.isArray(e) || !n || typeof n != "object" ? e : e.map((a) => {
    if (!a) return null;
    const d = { ...a };
    for (const [h, p] of Object.entries(n))
      if (typeof p == "function")
        try {
          d[h] = p(a);
        } catch {
          d[h] = void 0;
        }
    return d;
  });
}
(function() {
  const e = "data-ln-data-store", n = "lnDataStore";
  if (window[n] !== void 0) return;
  function a(l, u, T) {
    const k = l.getAttribute(u);
    if (k === "never" || k === "-1") return -1;
    const I = parseInt(k, 10);
    return isNaN(I) ? T : I;
  }
  const d = {
    "data-ln-data-store": { type: "marker", effect: Fe, description: "Identifies the element as a data-store definition container" },
    "data-ln-data-store-indexes": { type: "list", effect: Fe, description: "Comma-separated index field names for the IndexedDB store" },
    "data-ln-data-store-stale": { prop: "_staleThreshold", type: "integer", read: a, fallback: 300, description: "Cache staleness threshold in seconds, or -1/never" },
    "data-ln-data-store-search-fields": { prop: "_searchFields", type: "list", read: Xe, description: "Record fields to index for client-side search" },
    "data-ln-data-store-no-local-query": { prop: "noLocalQuery", type: "boolean", read: De, description: "Bypasses local IndexedDB query resolution, forcing remote fetching" },
    "data-ln-data-store-window": { prop: "_windowSize", type: "integer", read: pe, fallback: 1e3, min: 10, effect: wt, description: "Virtual scrolling cache window size in records" },
    "data-ln-data-store-window-page": { prop: "_windowPageSize", type: "integer", read: pe, fallback: 200, min: 5, effect: vt, description: "Virtual scrolling slice page size" },
    "data-ln-data-store-frozen": { type: "marker", description: "Applied at runtime to indicate store schema is locked in IndexedDB" }
  }, h = ce(d), p = "ln_app_cache", g = "_meta", _ = "1.0";
  let w = null, m = null;
  const A = {};
  function f(l) {
    l && l.name === "QuotaExceededError" && q(document, "ln-data-store:quota-exceeded", { error: l });
  }
  function b() {
    const l = {};
    for (const u of document.querySelectorAll(`[${e}]`)) {
      const T = u.id;
      if (T) {
        const k = u.getAttribute("data-ln-data-store-indexes") || "";
        l[T] = {
          indexes: k.split(",").map((I) => I.trim()).filter(Boolean)
        };
      }
    }
    return l;
  }
  function L() {
    return m || (m = new Promise((l) => {
      if (typeof indexedDB > "u")
        return console.warn("[ln-data-store] IndexedDB not available — falling back to in-memory store"), l(null);
      const u = b(), T = Object.keys(u), k = indexedDB.open(p);
      k.onerror = () => {
        console.warn("[ln-data-store] IndexedDB open failed — falling back to in-memory store"), l(null);
      }, k.onsuccess = (I) => {
        const P = I.target.result, H = Array.from(P.objectStoreNames);
        if (!(!H.includes(g) || T.some((te) => !H.includes(te))))
          return x(P), w = P, l(P);
        const J = P.version;
        P.close();
        const Y = indexedDB.open(p, J + 1);
        Y.onblocked = () => {
          console.warn("[ln-data-store] Database upgrade blocked — waiting for other tabs to close connection");
        }, Y.onerror = () => {
          console.warn("[ln-data-store] Database upgrade failed"), l(null);
        }, Y.onupgradeneeded = (te) => {
          const X = te.target.result;
          X.objectStoreNames.contains(g) || X.createObjectStore(g, { keyPath: "key" });
          for (const oe of T)
            if (!X.objectStoreNames.contains(oe)) {
              const ue = X.createObjectStore(oe, { keyPath: "id" });
              for (const we of u[oe].indexes)
                ue.createIndex(we, we, { unique: !1 });
            }
        }, Y.onsuccess = (te) => {
          const X = te.target.result;
          x(X), w = X, l(X);
        };
      };
    }), m);
  }
  function x(l) {
    l.onversionchange = () => {
      l.close(), w = null, m = null;
    };
  }
  function O() {
    return w ? Promise.resolve(w) : (m = null, L());
  }
  async function S(l) {
    if (!re() || !l) return l;
    const u = { ...l }, T = u.id, k = await Zt(u);
    return !k || !k.encrypted ? l : {
      ...k,
      id: T
    };
  }
  async function R(l) {
    return !l || !l.encrypted || !re() ? l : en(l, { silent: !0 });
  }
  const N = (l, u) => O().then((T) => T ? T.transaction(l, u).objectStore(l) : null);
  function M(l) {
    return new Promise((u, T) => {
      l.onsuccess = () => u(l.result), l.onerror = () => {
        f(l.error), T(l.error);
      };
    });
  }
  const r = (l) => N(l, "readonly").then((u) => u ? M(u.getAll()) : []).then((u) => re() ? Promise.all(u.map((T) => R(T))) : u), i = (l, u) => N(l, "readonly").then((T) => T ? M(T.get(u)).then((k) => k !== void 0 ? k : typeof u == "string" && u.trim() !== "" && !isNaN(Number(u)) ? M(T.get(Number(u))) : typeof u == "number" ? M(T.get(String(u))) : null) : null).then((T) => T ? R(T) : null), o = (l, u) => O().then((T) => {
    if (!T) return [];
    const I = T.transaction(l, "readonly").objectStore(l), P = u.map((H) => M(I.get(H)).then((W) => W !== void 0 ? W : typeof H == "string" && H.trim() !== "" && !isNaN(Number(H)) ? M(I.get(Number(H))) : typeof H == "number" ? M(I.get(String(H))) : null));
    return Promise.all(P).then((H) => re() ? Promise.all(H.map((W) => W ? R(W) : null)) : H);
  }), v = (l, u) => (re() ? S(u) : Promise.resolve(u)).then((k) => N(l, "readwrite").then((I) => I ? M(I.put(k)) : null)), t = (l, u) => N(l, "readwrite").then((T) => T ? M(T.delete(u)).then(() => {
    if (typeof u == "string" && u.trim() !== "" && !isNaN(Number(u)))
      return M(T.delete(Number(u)));
    if (typeof u == "number")
      return M(T.delete(String(u)));
  }) : null), s = (l) => N(l, "readwrite").then((u) => u ? M(u.clear()) : null), c = (l) => N(l, "readonly").then((u) => u ? M(u.count()) : 0), y = (l) => N(g, "readonly").then((u) => u ? M(u.get(l)) : null), C = (l, u) => N(g, "readwrite").then((T) => {
    if (T)
      return u.key = l, M(T.put(u));
  });
  function E(l) {
    return this.dom = l, this._name = l.id, this._name || console.warn("[ln-data-store] missing id — the store cannot be addressed", l), le(this, l, h), this._handlers = null, this.isLoaded = !1, this.canServe = !1, this.isInitialized = !1, this.initializationError = null, this.hasCache = !1, this.isSyncing = !1, this.lastSyncedAt = null, this.query = { filters: {}, search: "", sort: null }, l.hasAttribute("data-ln-data-store-window") ? this._windowIndex = an({
      windowSize: this._windowSize,
      pageSize: this._windowPageSize,
      requestPage: (u, T, k) => {
        q(this.dom, "ln-data-store:request-page", {
          store: this._name,
          offset: u,
          limit: T,
          query: k,
          queryGen: this._windowIndex.queryGen
        });
      }
    }) : this._windowIndex = null, this.windowed = this._windowIndex !== null, this.totalCount = 0, this.presenters = null, this._mutationChain = Promise.resolve(), A[this._name] = this, D(this), this.ready = Q(this), this;
  }
  function D(l) {
    l._handlers = {
      create: (u) => F(l, "create", u.detail, () => z(l, u.detail)),
      update: (u) => F(l, "update", u.detail, () => U(l, u.detail)),
      delete: (u) => F(l, "delete", u.detail, () => G(l, u.detail)),
      "bulk-delete": (u) => F(l, "bulk-delete", u.detail, () => V(l, u.detail)),
      "sync-failed": (u) => {
        l.isSyncing = !1, q(l.dom, "ln-data-store:sync-error", {
          store: l._name,
          error: u.detail && u.detail.error,
          status: u.detail && u.detail.status
        });
      }
    };
    for (const [u, T] of Object.entries(l._handlers))
      l.dom.addEventListener(`ln-data-store:request-${u}`, T);
    l._queryHandlers = {
      "ln-search:change": (u) => {
        u.preventDefault();
        const T = u.detail && u.detail.term != null ? u.detail.term : "";
        T !== l.query.search && (l.query.search = T, be(l));
      },
      "ln-filter:change": (u) => {
        u.preventDefault();
        const T = u.detail && u.detail.key;
        if (!T) return;
        const k = (u.detail.values || []).slice(), I = l.query.filters[T];
        (I ? I.length === k.length && I.every((H, W) => H === k[W]) : !k.length) || (k.length ? l.query.filters[T] = k : delete l.query.filters[T], be(l));
      },
      "ln-sort:change": (u) => {
        u.preventDefault();
        const T = u.detail && u.detail.field, k = u.detail && u.detail.direction, I = k && k !== "none" ? { field: T, direction: k } : null, P = l.query.sort;
        !P && !I || P && I && P.field === I.field && P.direction === I.direction || (l.query.sort = I, be(l));
      }
    };
    for (const [u, T] of Object.entries(l._queryHandlers))
      l.dom.addEventListener(u, T);
  }
  function F(l, u, T, k) {
    const I = T && T.requestId;
    return l._mutationChain = l._mutationChain.then(() => l.ready).then(() => {
      if (l.initializationError) throw l.initializationError;
      return k();
    }).catch((P) => $(l, u, I, P)), l._mutationChain;
  }
  function B(l, u = 0) {
    return c(l._name).then((T) => {
      if (l._windowIndex || l.windowed) {
        const k = l.totalCount != null ? l.totalCount : T;
        l.totalCount = Math.max(0, k + u);
      } else
        l.totalCount = T;
      return l.hasCache = !0, l.isLoaded = !0, l.canServe = !0, C(l._name, {
        schema_version: _,
        last_synced_at: l.lastSyncedAt,
        has_cache: !0,
        record_count: l.totalCount
      });
    });
  }
  function z(l, { tempId: u, data: T = {}, requestId: k } = {}) {
    const I = { ...T, id: u };
    return v(l._name, I).then(() => B(l, 1)).then(() => {
      q(l.dom, "ln-data-store:created", { store: l._name, record: I, tempId: u, requestId: k });
    });
  }
  function U(l, { id: u, data: T = {}, requestId: k } = {}) {
    return i(l._name, u).then((I) => {
      if (!I) throw new Error(`Record not found: ${u}`);
      const P = I.id, H = { ...I, ...T, id: P }, W = T.id, J = W !== void 0 && W !== P;
      return (J ? ne(l._name, P, { ...H, id: W }) : v(l._name, H)).then(() => B(l, 0)).then(() => {
        q(l.dom, "ln-data-store:updated", { store: l._name, record: J ? { ...H, id: W } : H, previous: I, requestId: k });
      });
    });
  }
  function G(l, { id: u, requestId: T } = {}) {
    return i(l._name, u).then((k) => {
      if (!k) {
        q(l.dom, "ln-data-store:deleted", { store: l._name, id: u, requestId: T, missing: !0 });
        return;
      }
      const I = k.id;
      return t(l._name, I).then(() => B(l, -1)).then(() => {
        q(l.dom, "ln-data-store:deleted", { store: l._name, id: I, requestId: T });
      });
    });
  }
  function V(l, { ids: u = [], requestId: T } = {}) {
    return u.length ? Promise.all(u.map((k) => i(l._name, k))).then((k) => {
      const I = k.filter(Boolean).map((P) => P.id);
      return ee(l._name, I).then(() => B(l, -I.length)).then(() => {
        q(l.dom, "ln-data-store:deleted", { store: l._name, ids: I, requestId: T });
      });
    }) : (q(l.dom, "ln-data-store:deleted", { store: l._name, ids: [], requestId: T }), Promise.resolve());
  }
  function $(l, u, T, k) {
    console.error("[ln-data-store] " + u + " failed:", k), q(l.dom, "ln-data-store:mutation-error", {
      store: l._name,
      action: u,
      requestId: T,
      error: k
    });
  }
  function Q(l) {
    return L().then((u) => {
      if (!u) throw new Error("IndexedDB is unavailable");
      return y(l._name);
    }).then((u) => {
      if (l.initializationError = null, u && u.schema_version === _)
        l.lastSyncedAt = u.last_synced_at || null, l.totalCount = u.record_count || 0, l.hasCache = u.has_cache === !0 || l.totalCount > 0, l.hasCache && (l.isLoaded = !0, l.canServe = !0, q(l.dom, "ln-data-store:ready", { store: l._name, count: l.totalCount, source: "cache" })), l.isInitialized = !0, q(l.dom, "ln-data-store:initialized", { store: l._name, hasCache: l.hasCache, lastSyncedAt: l.lastSyncedAt, count: l.totalCount });
      else {
        if (u && u.schema_version !== _)
          return s(l._name).then(() => C(l._name, { schema_version: _, last_synced_at: null, has_cache: !1, record_count: 0 })).then(() => {
            l.isInitialized = !0, l.hasCache = !1, q(l.dom, "ln-data-store:initialized", { store: l._name, hasCache: !1, lastSyncedAt: null, count: 0 });
          });
        l.isInitialized = !0, l.hasCache = !1, q(l.dom, "ln-data-store:initialized", { store: l._name, hasCache: !1, lastSyncedAt: null, count: 0 });
      }
    }).catch((u) => (l.isInitialized = !0, l.isLoaded = !1, l.canServe = !1, l.hasCache = !1, l.isSyncing = !1, l.initializationError = u, q(l.dom, "ln-data-store:initialization-error", { store: l._name, error: u }), { ok: !1, error: u }));
  }
  function j(l) {
    l.isSyncing = !0, q(l.dom, "ln-data-store:request-remote-sync", { since: l.lastSyncedAt });
  }
  function K(l, u) {
    return O().then((T) => T ? (re() ? Promise.all(u.map((I) => S(I))) : Promise.resolve(u)).then((I) => new Promise((P, H) => {
      const W = T.transaction(l, "readwrite"), J = W.objectStore(l);
      I.forEach((Y) => J.put(Y)), W.oncomplete = () => P(), W.onerror = () => {
        f(W.error), H(W.error);
      };
    })) : void 0);
  }
  function ee(l, u) {
    return O().then((T) => {
      if (T)
        return new Promise((k, I) => {
          const P = T.transaction(l, "readwrite"), H = P.objectStore(l);
          u.forEach((W) => {
            H.delete(W), typeof W == "string" && W.trim() !== "" && !isNaN(Number(W)) ? H.delete(Number(W)) : typeof W == "number" && H.delete(String(W));
          }), P.oncomplete = () => k(), P.onerror = () => I(P.error);
        });
    });
  }
  function ne(l, u, T) {
    return (re() ? S(T) : Promise.resolve(T)).then((I) => O().then((P) => {
      if (P)
        return new Promise((H, W) => {
          const J = P.transaction(l, "readwrite"), Y = J.objectStore(l);
          Y.put(I), Y.delete(u), J.oncomplete = () => H(), J.onerror = () => {
            f(J.error), W(J.error);
          };
        });
    }));
  }
  const ye = new Intl.Collator(void 0, { numeric: !0, sensitivity: "base" });
  function ut(l) {
    return l ? Object.keys(l).filter((u) => Array.isArray(l[u]) && l[u].length > 0) : [];
  }
  function ft(l, u, T) {
    return u.every((k) => T[k].map(String).includes(String(l[k])));
  }
  function ht(l) {
    return String(l || "").toLowerCase().split(/\s+/).filter(Boolean);
  }
  function pt(l, u, T) {
    return u.every(
      (k) => T.some((I) => {
        const P = l[I];
        return P != null && String(P).toLowerCase().includes(k);
      })
    );
  }
  function mt(l, u, T) {
    return dn(l, u, T);
  }
  function de(l, u) {
    return fn(u, l.presenters && l.presenters.computed);
  }
  function gt(l) {
    return !l.sort && !re();
  }
  function _t(l, u, T) {
    const k = ut(u.filters), I = u.search ? ht(u.search) : [], P = l._searchFields, H = I.length > 0 && P && P.length > 0;
    return N(l._name, "readonly").then((W) => W ? new Promise((J, Y) => {
      const te = [], X = W.openCursor();
      X.onsuccess = () => {
        const oe = X.result;
        if (!oe || te.length >= T) {
          J(te);
          return;
        }
        const ue = oe.value;
        (!k.length || ft(ue, k, u.filters)) && (!H || pt(ue, I, P)) && te.push(ue), oe.continue();
      }, X.onerror = () => Y(X.error);
    }) : []);
  }
  function Oe(l, u, T) {
    return un(u, T, l._searchFields, ye);
  }
  function Me(l, u, T) {
    const k = [];
    for (let P = u; P < u + T; P++) {
      const H = l._windowIndex.getId(P);
      k.push(H);
    }
    const I = Array.from(new Set(k.filter((P) => P !== void 0)));
    return o(l._name, I).then((P) => {
      const H = /* @__PURE__ */ new Map();
      for (let J = 0; J < P.length; J++) {
        const Y = P[J];
        Y && H.set(String(Y.id), Y);
      }
      const W = [];
      for (let J = 0; J < k.length; J++) {
        const Y = k[J];
        if (Y === void 0)
          W.push(null);
        else {
          const te = H.get(String(Y));
          W.push(te || null);
        }
      }
      return {
        data: de(l, W),
        total: l._windowIndex.grandTotal,
        filtered: l._windowIndex.logicalTotal,
        offset: u,
        queryGen: l._windowIndex.queryGen
      };
    });
  }
  E.prototype.getAll = function(l = {}) {
    const u = this;
    if (u._windowIndex) {
      const T = l.offset || 0, k = l.limit || 200;
      if (u._windowIndex.ensure(T, T + k, l), !u._windowIndex.hasLoaded && !u.noLocalQuery) {
        const I = T + k, P = (H) => H.length ? {
          data: de(u, H),
          offset: T,
          queryGen: u._windowIndex.queryGen,
          provisional: !0
        } : Me(u, T, k);
        return gt(l) ? _t(u, l, I).then((H) => P(H.slice(T, I))) : r(u._name).then((H) => P(Oe(u, H, l).records));
      }
      return Me(u, T, k);
    }
    return r(u._name).then((T) => {
      const k = Oe(u, T, l);
      return {
        data: de(u, k.records),
        total: k.total,
        filtered: k.filtered
      };
    });
  }, E.prototype.getById = function(l) {
    return i(this._name, l).then((u) => u ? de(this, [u])[0] : null);
  }, E.prototype.count = function(l) {
    return l && Object.keys(l).length > 0 ? r(this._name).then((T) => dt(T, l).length) : this.totalCount != null ? Promise.resolve(this.totalCount) : c(this._name);
  }, E.prototype.aggregate = function(l, u) {
    return r(this._name).then((T) => mt(T, l, u));
  }, E.prototype.setPresenters = function(l) {
    this.presenters = l;
  }, E.prototype.applySync = function(l, u, T, k) {
    k = k || {};
    const I = this;
    if (I._windowIndex && k.queryGen != null && k.queryGen !== I._windowIndex.queryGen)
      return Promise.resolve();
    l.length > 0 || u.length > 0;
    let P = Promise.resolve();
    return l.length > 0 && (P = P.then(() => K(I._name, l))), u.length > 0 && (P = P.then(() => ee(I._name, u))), P.then(() => {
      if (I._windowIndex && (k.offset != null || k.total != null)) {
        const H = k.offset != null ? k.offset : 0, W = l.map((Y) => Y.id), J = I._windowIndex.ingest(H, W, k.total, k.filtered, k.queryGen);
        if (J && J.length) return ee(I._name, J);
      }
    }).then(() => c(I._name)).then((H) => (I.totalCount = k.total !== void 0 ? k.total : H, I.hasCache = !0, C(I._name, {
      schema_version: _,
      last_synced_at: T,
      has_cache: !0,
      record_count: I.totalCount
    }))).then(() => {
      const H = !I.isLoaded;
      I.isLoaded = !0, I.canServe = !0, I.isSyncing = !1, I.lastSyncedAt = T, H ? (q(I.dom, "ln-data-store:loaded", { store: I._name, count: I.totalCount, meta: k }), q(I.dom, "ln-data-store:ready", { store: I._name, count: I.totalCount, source: "server", meta: k })) : q(I.dom, "ln-data-store:synced", {
        store: I._name,
        added: l.length,
        deleted: u.length,
        changed: !0,
        meta: k
      });
    }).catch((H) => {
      I.isSyncing = !1, console.error("[ln-data-store] applySync failed:", H);
    });
  }, E.prototype.applyQuery = function(l, u) {
    u = u || {};
    const T = this;
    let k = Promise.resolve();
    return l.length > 0 && (k = k.then(() => K(T._name, l))), k.then(() => c(T._name)).then((I) => (T.totalCount = u.total !== void 0 ? u.total : I, l.length > 0 && (T.canServe = !0), de(T, l))).catch((I) => (console.error("[ln-data-store] applyQuery failed:", I), []));
  }, E.prototype.forceSync = function() {
    this.isSyncing || j(this);
  }, E.prototype.fullReload = function() {
    const l = this;
    return s(l._name).then(() => C(l._name, {
      schema_version: _,
      last_synced_at: null,
      has_cache: !1,
      record_count: 0
    })).then(() => {
      l.isLoaded = !1, l.hasCache = !1, l.lastSyncedAt = null, l.totalCount = 0, j(l);
    });
  }, E.prototype.destroy = function() {
    if (this._windowIndex && (this._windowIndex.clear(), this._windowIndex = null, this.windowed = !1), this._handlers) {
      for (const [l, u] of Object.entries(this._handlers))
        this.dom.removeEventListener(`ln-data-store:request-${l}`, u);
      this._handlers = null;
    }
    if (this._queryHandlers) {
      for (const [l, u] of Object.entries(this._queryHandlers))
        this.dom.removeEventListener(l, u);
      this._queryHandlers = null;
    }
    delete A[this._name], delete this.dom[n];
  };
  function yt() {
    return O().then((l) => {
      if (!l) return;
      const u = Array.from(l.objectStoreNames);
      return new Promise((T, k) => {
        const I = l.transaction(u, "readwrite");
        u.forEach((P) => I.objectStore(P).clear()), I.oncomplete = () => T(), I.onerror = () => k(I.error);
      });
    }).then(() => {
      Object.values(A).forEach((l) => {
        l.isLoaded = !1, l.canServe = !1, l.isInitialized = !1, l.initializationError = null, l.hasCache = !1, l.isSyncing = !1, l.lastSyncedAt = null, l.totalCount = 0;
      });
    });
  }
  function be(l) {
    l._windowIndex && l._windowIndex.reset(), q(l.dom, "ln-data-store:query-changed", {
      store: l._name,
      query: {
        filters: Object.assign({}, l.query.filters),
        search: l.query.search,
        sort: l.query.sort ? Object.assign({}, l.query.sort) : null
      }
    });
  }
  const bt = "data-ln-data-store-frozen";
  function Fe(l, u) {
    l.setAttribute(bt, u);
  }
  function wt(l) {
    const u = l[n];
    if (!u._windowIndex) return;
    const T = u._windowIndex.configure({ windowSize: u._windowSize });
    T.length && ee(u._name, T).catch((k) => {
      console.error("[ln-data-store] window shrink eviction failed:", k);
    });
  }
  function vt(l) {
    const u = l[n];
    u._windowIndex && u._windowIndex.configure({ pageSize: u._windowPageSize });
  }
  Z(e, n, E, "ln-data-store", {
    attributes: d
  }), window[n].clearAll = yt, window[n].init = window[n], window[n].setStorageKey = Ue, typeof window < "u" && (window.lnCore = window.lnCore || {}, window.lnCore.setStorageKey = Ue);
})();
const hn = {
  offset: "offset",
  limit: "limit",
  search: "search",
  sortField: "sort_field",
  sortDir: "sort_dir"
};
function se(...e) {
  return e.filter((n) => n != null && n !== "").map((n, a) => {
    const d = String(n);
    return a === 0 ? d.replace(/\/+$/, "") : d.replace(/^\/+/, "").replace(/\/+$/, "");
  }).filter(Boolean).join("/");
}
function pn(e, n) {
  if (!e || typeof e != "object") return "";
  const a = Object.assign({}, hn);
  if (n && typeof n == "object")
    for (const h in n)
      n[h] !== void 0 && n[h] !== null && n[h] !== "" && (a[h] = n[h]);
  const d = new URLSearchParams();
  return e.search && d.append(a.search, e.search), e.offset != null && d.append(a.offset, e.offset), e.limit != null && d.append(a.limit, e.limit), e.sort && e.sort.field && e.sort.direction && (d.append(a.sortField, e.sort.field), d.append(a.sortDir, e.sort.direction)), e.filters && typeof e.filters == "object" && Object.keys(e.filters).forEach((h) => {
    const p = e.filters[h];
    Array.isArray(p) && p.length > 0 && d.append(h, p.join(","));
  }), d.toString();
}
function mn(e, n, a) {
  let d = se(e, n);
  return a && (d += (d.indexOf("?") !== -1 ? "&" : "?") + a), d;
}
function je(e) {
  const n = e && e.content !== void 0 ? e.content : e, a = e && e.message ? e.message : null;
  return { record: n, message: a };
}
(function() {
  const e = "data-ln-api-connector", n = "lnApiConnector", a = "lnConnector";
  if (window[n] !== void 0) return;
  function d(m) {
    const A = m[n];
    A && A.refreshConfig();
  }
  const h = {
    "data-ln-api-connector": { type: "marker", description: "Mounts API connector bridging REST backend and ln-ashlar data coordinators" },
    "data-ln-api-base-url": { prop: "baseUrl", read: ie, type: "string", fallback: "", effect: d, description: "Base URL endpoint for API requests" },
    "data-ln-api-path": { prop: "path", read: ie, type: "string", fallback: "", effect: d, description: "Resource path appended to base URL" },
    "data-ln-api-headers": { prop: "rawHeaders", read: ie, type: "json", fallback: null, effect: d, description: "Custom HTTP headers in JSON format or semicolon-separated pairs" },
    "data-ln-api-param-offset": { effect: d, type: "string", fallback: "offset", description: "Query parameter name for pagination offset" },
    "data-ln-api-param-limit": { effect: d, type: "string", fallback: "limit", description: "Query parameter name for pagination page size" },
    "data-ln-api-param-search": { effect: d, type: "string", fallback: "search", description: "Query parameter name for text search filter" },
    "data-ln-api-param-sort-field": { effect: d, type: "string", fallback: "sort_by", description: "Query parameter name for sort field" },
    "data-ln-api-param-sort-dir": { effect: d, type: "string", fallback: "sort_dir", description: "Query parameter name for sort direction" },
    "data-ln-api-connector-query-debounce": { effect: d, type: "integer", fallback: 200, min: 0, description: "Debounce delay in milliseconds before dispatching query requests" }
  }, p = ce(h);
  function g(m) {
    return m.ok ? m.status === 204 ? null : m.json() : m.json().catch(() => null).then((A) => {
      const f = new Error("HTTP " + m.status + ": " + m.statusText);
      throw f.status = m.status, f.data = A, f;
    });
  }
  function _(m) {
    return this.dom = m, le(this, m, p), m[n] = this, m[a] = this, this._inflight = /* @__PURE__ */ new Map(), this._queryTimers = /* @__PURE__ */ new Map(), this.refreshConfig(), this._handlers = null, w(this), this;
  }
  _.prototype.refreshConfig = function() {
    const m = this.dom;
    this.credentials = "same-origin", this.headers = At(this.rawHeaders);
    const A = {}, f = m.getAttribute("data-ln-api-param-offset");
    f && (A.offset = f);
    const b = m.getAttribute("data-ln-api-param-limit");
    b && (A.limit = b);
    const L = m.getAttribute("data-ln-api-param-search");
    L && (A.search = L);
    const x = m.getAttribute("data-ln-api-param-sort-field");
    x && (A.sortField = x);
    const O = m.getAttribute("data-ln-api-param-sort-dir");
    O && (A.sortDir = O), this.paramKeys = A;
    const S = m.getAttribute("data-ln-api-connector-query-debounce");
    this.queryDebounce = S !== null ? +S : 300, q(this.dom, "ln-api-connector:config-changed", {
      baseUrl: this.baseUrl,
      path: this.path,
      headers: this.headers,
      paramKeys: this.paramKeys
    });
  }, _.prototype._reqHeaders = function(m) {
    const A = Object.assign({}, this.headers);
    return !A.Accept && !A.accept && (A.Accept = "application/json"), !A["Content-Type"] && !A["content-type"] && (A["Content-Type"] = "application/json"), m && (A["X-Idempotency-Key"] = m), A;
  }, _.prototype.cancel = function(m) {
    return m && this._inflight.has(m) ? (this._inflight.get(m).abort(), this._inflight.delete(m), !0) : !1;
  }, _.prototype.fetchDelta = function(m, A) {
    const f = this;
    let b = se(f.baseUrl, f.path);
    m != null && m !== "" && (b += (b.indexOf("?") !== -1 ? "&" : "?") + "since=" + encodeURIComponent(m));
    const L = A || "sync";
    f._inflight.has(L) && f._inflight.get(L).abort();
    const x = new AbortController();
    return f._inflight.set(L, x), window.fetch(b, {
      method: "GET",
      headers: f._reqHeaders(),
      credentials: f.credentials,
      signal: x.signal
    }).then(g).finally(function() {
      f._inflight.get(L) === x && f._inflight.delete(L);
    });
  }, _.prototype.query = function(m, A) {
    const f = this, b = pn(m, f.paramKeys), L = mn(f.baseUrl, f.path, b), x = A || "query";
    f._inflight.has(x) && f._inflight.get(x).abort();
    const O = new AbortController();
    return f._inflight.set(x, O), window.fetch(L, {
      method: "GET",
      headers: f._reqHeaders(),
      credentials: f.credentials,
      signal: O.signal
    }).then(g).finally(function() {
      f._inflight.get(x) === O && f._inflight.delete(x);
    });
  }, _.prototype.create = function(m, A, f) {
    const b = this;
    return window.fetch(se(b.baseUrl, A || b.path), {
      method: "POST",
      headers: b._reqHeaders(f),
      credentials: b.credentials,
      body: JSON.stringify(m)
    }).then(g);
  }, _.prototype.update = function(m, A, f, b, L) {
    const x = this;
    f != null && (A = Object.assign({}, A, { expected_version: f }));
    const O = b ? se(x.baseUrl, b) : se(x.baseUrl, x.path, m);
    return window.fetch(O, {
      method: "PUT",
      headers: x._reqHeaders(L),
      credentials: x.credentials,
      body: JSON.stringify(A)
    }).then(g);
  }, _.prototype.delete = function(m, A, f) {
    const b = this;
    return window.fetch(se(b.baseUrl, A || b.path, m), {
      method: "DELETE",
      headers: b._reqHeaders(f),
      credentials: b.credentials
    }).then(g);
  }, _.prototype.bulkDelete = function(m, A, f) {
    const b = this;
    return window.fetch(se(b.baseUrl, A || b.path, "bulk-delete"), {
      method: "DELETE",
      headers: b._reqHeaders(f),
      credentials: b.credentials,
      body: JSON.stringify({ ids: m })
    }).then(g);
  };
  function w(m) {
    m._handlers = {
      sync: function(A) {
        const f = A.detail || {}, b = f.meta && f.meta.targetEl ? f.meta.targetEl : null;
        m.fetchDelta(f.since, b).then(function(L) {
          q(m.dom, "ln-api-connector:fetched", { data: L, since: f.since, meta: f.meta || null });
        }).catch(function(L) {
          L && L.name === "AbortError" || q(m.dom, "ln-api-connector:error", {
            action: "sync",
            error: L.message,
            status: L.status || 0,
            data: L.data || null,
            since: f.since,
            meta: f.meta || null
          });
        });
      },
      query: function(A) {
        const f = A.detail || {}, b = f.query || f, L = f.meta && f.meta.targetEl ? f.meta.targetEl : null, x = L || "query", O = m.queryDebounce;
        function S(N, M, r) {
          m.query(M, r).then(function(i) {
            const o = i || {};
            q(m.dom, "ln-api-connector:fetched", {
              data: o.data || (Array.isArray(o) ? o : []),
              total: o.total,
              filtered: o.filtered,
              offset: M.offset,
              queryGen: M.queryGen,
              meta: N.meta || null
            });
          }).catch(function(i) {
            i && i.name === "AbortError" || q(m.dom, "ln-api-connector:error", {
              action: "query",
              error: i.message,
              status: i.status || 0,
              data: i.data || null,
              meta: N.meta || null
            });
          });
        }
        if (O === 0) {
          S(f, b, L);
          return;
        }
        m._queryTimers.has(x) && clearTimeout(m._queryTimers.get(x));
        const R = setTimeout(function() {
          m._queryTimers.delete(x), S(f, b, L);
        }, O);
        m._queryTimers.set(x, R);
      },
      cancel: function(A) {
        const f = A.detail || {}, b = f.meta && f.meta.targetEl ? f.meta.targetEl : f.targetEl || f.key;
        b && m.cancel(b);
      },
      create: function(A) {
        const f = A.detail || {};
        m.create(f.data, f.url, f.idempotencyKey).then(function(b) {
          const L = je(b);
          q(m.dom, "ln-api-connector:created", {
            record: L.record,
            tempId: f.tempId,
            message: L.message,
            meta: f.meta || null
          });
        }).catch(function(b) {
          b && b.name === "AbortError" || q(m.dom, "ln-api-connector:error", {
            action: "create",
            error: b.message,
            status: b.status || 0,
            data: b.data || null,
            tempId: f.tempId,
            meta: f.meta || null
          });
        });
      },
      update: function(A) {
        const f = A.detail || {};
        m.update(f.id, f.data, f.expected_version, f.url, f.idempotencyKey).then(function(b) {
          const L = je(b);
          q(m.dom, "ln-api-connector:updated", {
            record: L.record,
            id: f.id,
            message: L.message,
            meta: f.meta || null
          });
        }).catch(function(b) {
          b && b.name === "AbortError" || q(m.dom, "ln-api-connector:error", {
            action: "update",
            error: b.message,
            status: b.status || 0,
            data: b.data || null,
            id: f.id,
            conflictData: b.status === 409 ? b.data : null,
            meta: f.meta || null
          });
        });
      },
      delete: function(A) {
        const f = A.detail || {};
        m.delete(f.id, f.url, f.idempotencyKey).then(function(b) {
          const L = b && b.message ? b.message : null;
          q(m.dom, "ln-api-connector:deleted", {
            response: b,
            id: f.id,
            message: L,
            meta: f.meta || null
          });
        }).catch(function(b) {
          b && b.name === "AbortError" || q(m.dom, "ln-api-connector:error", {
            action: "delete",
            error: b.message,
            status: b.status || 0,
            data: b.data || null,
            id: f.id,
            meta: f.meta || null
          });
        });
      },
      bulkDelete: function(A) {
        const f = A.detail || {};
        m.bulkDelete(f.ids, f.url, f.idempotencyKey).then(function(b) {
          const L = b && b.message ? b.message : null;
          q(m.dom, "ln-api-connector:bulk-deleted", {
            response: b,
            ids: f.ids,
            message: L,
            meta: f.meta || null
          });
        }).catch(function(b) {
          b && b.name === "AbortError" || q(m.dom, "ln-api-connector:error", {
            action: "bulk-delete",
            error: b.message,
            status: b.status || 0,
            data: b.data || null,
            ids: f.ids,
            meta: f.meta || null
          });
        });
      }
    }, m.dom.addEventListener("ln-api-connector:request-sync", m._handlers.sync), m.dom.addEventListener("ln-api-connector:request-query", m._handlers.query), m.dom.addEventListener("ln-api-connector:request-cancel", m._handlers.cancel), m.dom.addEventListener("ln-api-connector:request-create", m._handlers.create), m.dom.addEventListener("ln-api-connector:request-update", m._handlers.update), m.dom.addEventListener("ln-api-connector:request-delete", m._handlers.delete), m.dom.addEventListener("ln-api-connector:request-bulk-delete", m._handlers.bulkDelete);
  }
  _.prototype.destroy = function() {
    if (!this.dom[n]) return;
    const m = this;
    m._inflight && (m._inflight.forEach(function(A) {
      A.abort();
    }), m._inflight.clear()), this._queryTimers && (this._queryTimers.forEach(function(A) {
      A && clearTimeout(A);
    }), this._queryTimers.clear()), this._handlers && (m.dom.removeEventListener("ln-api-connector:request-sync", m._handlers.sync), m.dom.removeEventListener("ln-api-connector:request-query", m._handlers.query), m.dom.removeEventListener("ln-api-connector:request-cancel", m._handlers.cancel), m.dom.removeEventListener("ln-api-connector:request-create", m._handlers.create), m.dom.removeEventListener("ln-api-connector:request-update", m._handlers.update), m.dom.removeEventListener("ln-api-connector:request-delete", m._handlers.delete), m.dom.removeEventListener("ln-api-connector:request-bulk-delete", m._handlers.bulkDelete), m._handlers = null), delete this.dom[n], delete this.dom[a];
  }, Z(e, n, _, "ln-api-connector", {
    attributes: h
  });
})();
function gn(e) {
  return e = e || {}, {
    sort: e.sort,
    filters: e.filters,
    search: e.search,
    offset: e.offset,
    limit: e.limit,
    queryGen: e.queryGen
  };
}
function fe(e, n) {
  const a = !e || !!e.initializationError, d = !!(e && e.noLocalQuery && !e.windowed);
  return n && (a || !e.canServe || d) ? "remote" : e && !e.initializationError ? "store" : "none";
}
function ge(e, n, a) {
  return a === "store" && !!n && !(e && e.windowed);
}
function We(e, n) {
  const a = Object.assign({}, e);
  return n && (a.filters = n.filters, a.search = n.search, a.sort = n.sort), a;
}
class _n {
  constructor() {
    this._pending = /* @__PURE__ */ new Map();
  }
  wait(n) {
    return new Promise((a, d) => {
      this._pending.set(n, { resolve: a, reject: d });
    });
  }
  resolve(n) {
    return this._settle(n, !1);
  }
  reject(n) {
    return this._settle(n, !0);
  }
  close(n) {
    const a = n || new Error("Mutation receipt registry closed");
    for (const d of this._pending.values()) d.reject(a);
    this._pending.clear();
  }
  _settle(n, a) {
    const d = n && n.requestId;
    if (!d) return !1;
    const h = this._pending.get(d);
    return h ? (this._pending.delete(d), a ? h.reject(n.error || new Error("Store mutation failed")) : h.resolve(n), !0) : !1;
  }
}
(function() {
  const e = "data-ln-data-coordinator", n = "lnDataCoordinator", a = "data-ln-data-coordinator-scope", d = "data-ln-data-coordinator-search", h = "data-ln-data-coordinator-filters", p = "data-ln-data-coordinator-sort-field", g = "data-ln-data-coordinator-sort-direction";
  if (window[n] !== void 0) return;
  function _(t) {
    const s = t[n];
    s && s.refreshMapper();
  }
  function w(t) {
    const s = t[n];
    s && s._queueQueryRefresh();
  }
  function m(t, s) {
    return t.getAttribute(s) || t.id;
  }
  const A = {
    "data-ln-data-coordinator": { prop: "_name", type: "string", read: m, description: "Coordinator name or identifier for data routing" },
    "data-ln-data-coordinator-scope": { type: "string", description: "Scope name addressing the bound data store and connector" },
    "data-ln-data-coordinator-mapper": { type: "string", effect: _, description: "Name of the registered data mapper transform" },
    "data-ln-data-coordinator-search": { type: "string", effect: w, description: "Active search query term" },
    "data-ln-data-coordinator-filters": { type: "string", effect: w, description: "Active encoded filter parameters" },
    "data-ln-data-coordinator-sort-field": { type: "string", effect: w, description: "Active sort field property name" },
    "data-ln-data-coordinator-sort-direction": { type: "enum", values: ["asc", "desc"], fallback: "asc", effect: w, description: "Sort direction" },
    "data-ln-data-coordinator-stale": { type: "marker", description: "Flag indicating data needs re-synchronization" },
    "data-ln-data-coordinator-no-autosync": { type: "boolean", description: "Disables automatic synchronization upon state changes" },
    "data-ln-data-coordinator-dict": { type: "marker", description: "Marks dictionary container for coordinator translatable messages" }
  }, f = ce(A), b = /* @__PURE__ */ new Set();
  let L = !1, x = null, O = null, S = null;
  function R() {
    L || (L = !0, x = function() {
      q(document, "ln-data-coordinator:online", {}), b.forEach(function(t) {
        t._maybeSync();
      });
    }, O = function() {
      q(document, "ln-data-coordinator:offline", {});
    }, S = function() {
      document.visibilityState === "visible" && b.forEach(function(t) {
        const s = t.findChildren(), c = s.store;
        c && s.connector && c.isInitialized && !c.initializationError && !c.isSyncing && !t._noAutosync && (!c.hasCache || t._isStale()) && c.forceSync();
      });
    }, window.addEventListener("online", x), window.addEventListener("offline", O), document.addEventListener("visibilitychange", S));
  }
  function N() {
    L && (b.size > 0 || (window.removeEventListener("online", x), window.removeEventListener("offline", O), document.removeEventListener("visibilitychange", S), x = null, O = null, S = null, L = !1));
  }
  function M() {
    try {
      return crypto.randomUUID();
    } catch {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (s) => {
        const c = Math.random() * 16 | 0;
        return (s === "x" ? c : c & 3 | 8).toString(16);
      });
    }
  }
  const r = ["ln-api-connector", "ln-couchdb-connector", "ln-websocket-connector"];
  function i(t) {
    return t ? t.hasAttribute("data-ln-couchdb-connector") ? "ln-couchdb-connector" : t.hasAttribute("data-ln-websocket-connector") ? "ln-websocket-connector" : "ln-api-connector" : "ln-api-connector";
  }
  function o(t) {
    const s = this;
    return this.dom = t, le(this, t, f), this._name || console.warn("[ln-data-coordinator] missing id — the coordinator cannot be addressed", t), t[n] = this, this._destroyed = !1, this.mapper = null, this._handlers = null, this._boundQueries = /* @__PURE__ */ new WeakMap(), this._boundDelivered = /* @__PURE__ */ new WeakMap(), this._queryGens = /* @__PURE__ */ new WeakMap(), this._mutationReceipts = new _n(), this._dict = Rt(t, "data-ln-data-coordinator-dict"), this._queueQueryRefresh = it(function() {
      s._destroyed || s._refreshAll(null, !0);
    }), this.refreshConfig(), v(this), b.add(this), R(), this._checkInitialSync(), this;
  }
  Object.defineProperty(o.prototype, "_staleThreshold", {
    get: function() {
      const s = this.findChildren().storeEl, c = this.dom.getAttribute("data-ln-data-coordinator-stale") || (s ? s.getAttribute("data-ln-data-store-stale") : null);
      if (c === "never" || c === "-1") return -1;
      const y = parseInt(c, 10);
      return isNaN(y) ? 300 : y;
    }
  }), Object.defineProperty(o.prototype, "_noAutosync", {
    get: function() {
      const s = this.findChildren().storeEl;
      return this.dom.hasAttribute("data-ln-data-coordinator-no-autosync") || (s ? s.hasAttribute("data-ln-data-store-no-autosync") : !1);
    }
  }), o.prototype.refreshConfig = function() {
    this.refreshMapper();
  }, o.prototype._isStale = function() {
    if (this._staleThreshold === -1) return !1;
    const s = this.findChildren().store;
    return !s || !s.lastSyncedAt ? !0 : Date.now() / 1e3 - s.lastSyncedAt > this._staleThreshold;
  }, o.prototype._maybeSync = function() {
    const t = this.findChildren(), s = t.store;
    !s || s.initializationError || !t.connector || this._noAutosync || !s.isInitialized || s.isSyncing || (!s.hasCache || this._isStale()) && s.forceSync();
  }, o.prototype._checkInitialSync = function() {
    const t = this, c = this.findChildren().store;
    c && Promise.resolve(c.ready).then(function() {
      if (t._destroyed) return;
      const y = t.findChildren(), C = y.store;
      if (C && C.initializationError) {
        t._reportReconciliationError("store-initialize", C.initializationError, null);
        return;
      }
      !C || !y.connector || t._noAutosync || C.isSyncing || (!C.hasCache || t._isStale()) && C.forceSync();
    }).catch(function(y) {
      t._destroyed || t._reportReconciliationError("store-initialize", y, null);
    });
  }, o.prototype.refreshMapper = function() {
    this.mapper = null, this.dom.querySelector("script[data-ln-mapper]") && console.error("[ln-data-coordinator] Security Error: Inline script mappers using <script data-ln-mapper> are deprecated and disabled due to XSS vulnerability risks (unsafe-eval). Please register your mappers securely via window.lnCore.registerDataMapper() instead.");
    const s = this.dom.getAttribute("data-ln-data-coordinator-mapper") || this.dom.id;
    s && window.lnCore && typeof window.lnCore.getDataMapper == "function" && (this.mapper = window.lnCore.getDataMapper(s)), this.mapper || (this.mapper = {}), typeof this.mapper.ingress != "function" && (this.mapper.ingress = function(c) {
      return c;
    }), typeof this.mapper.egress != "function" && (this.mapper.egress = function(c) {
      return c;
    });
  }, o.prototype.findChildren = function() {
    const t = this.dom.querySelector("[data-ln-data-store]"), s = this.dom.querySelector("[data-ln-api-connector], [data-ln-couchdb-connector]") || this.dom.querySelector("[data-ln-websocket-connector]"), c = this.dom.querySelector("[data-ln-api-queue]");
    return {
      storeEl: t,
      connectorEl: s,
      queueEl: c,
      store: t ? t.lnDataStore : null,
      connector: s ? s.lnApiConnector || s.lnCouchDbConnector || s.lnWebsocketConnector : null,
      queue: c ? c.lnApiQueue : null
    };
  }, o.prototype._handleSubmitRecord = function(t) {
    const s = this.findChildren();
    if (!s.storeEl && !s.connectorEl) {
      console.warn('[ln-data-coordinator] form submit claimed but neither [data-ln-data-store] nor a connector child found in "' + (this._name || "") + '"');
      return;
    }
    const c = t.data || {}, y = c.id, C = c.expected_version, E = Object.assign({}, c);
    delete E.id, delete E.expected_version;
    const D = t.method.toUpperCase();
    D === "POST" ? this._fanOutCreate(s, E, t.action) : (D === "PUT" || D === "PATCH") && this._fanOutUpdate(s, y, E, C, t.action);
  }, o.prototype._fanOutCreate = function(t, s, c) {
    this.refreshMapper();
    const y = "_temp_" + M();
    t.storeEl && q(t.storeEl, "ln-data-store:request-create", { tempId: y, data: s }), t.queue ? q(t.queueEl, "ln-api-queue:request-enqueue", {
      chainKey: y,
      op: "create",
      targetId: null,
      payload: this.mapper.egress(s),
      expectedVersion: null,
      meta: { tempId: y, action: c }
    }) : t.connector && q(t.connectorEl, i(t.connectorEl) + ":request-create", {
      data: this.mapper.egress(s),
      url: c,
      meta: { entryId: M(), queued: !1, op: "create", tempId: y }
    });
  }, o.prototype._fanOutUpdate = function(t, s, c, y, C) {
    this.refreshMapper(), t.storeEl && q(t.storeEl, "ln-data-store:request-update", { id: s, data: c }), t.queue ? q(t.queueEl, "ln-api-queue:request-enqueue", {
      chainKey: s,
      op: "update",
      targetId: s,
      payload: this.mapper.egress(c),
      expectedVersion: y,
      meta: { id: s, action: C }
    }) : t.connector && q(t.connectorEl, i(t.connectorEl) + ":request-update", {
      id: s,
      data: this.mapper.egress(c),
      expected_version: y,
      url: C,
      meta: { entryId: M(), queued: !1, op: "update", id: s }
    });
  }, o.prototype._fanOutDelete = function(t, s) {
    this.refreshMapper(), t.storeEl && q(t.storeEl, "ln-data-store:request-delete", { id: s }), t.queue ? q(t.queueEl, "ln-api-queue:request-enqueue", {
      chainKey: s,
      op: "delete",
      targetId: s,
      payload: null,
      expectedVersion: null,
      meta: { id: s }
    }) : t.connector && q(t.connectorEl, i(t.connectorEl) + ":request-delete", {
      id: s,
      meta: { entryId: M(), queued: !1, op: "delete", id: s }
    });
  }, o.prototype._fanOutBulkDelete = function(t, s) {
    this.refreshMapper();
    const c = s.join(",");
    t.storeEl && q(t.storeEl, "ln-data-store:request-bulk-delete", { ids: s }), t.queue ? q(t.queueEl, "ln-api-queue:request-enqueue", {
      chainKey: c,
      op: "bulk-delete",
      targetId: null,
      payload: { ids: s },
      expectedVersion: null,
      meta: { bulkKey: c, ids: s }
    }) : t.connector && q(t.connectorEl, i(t.connectorEl) + ":request-bulk-delete", {
      ids: s,
      meta: { entryId: M(), queued: !1, op: "bulk-delete", bulkKey: c }
    });
  }, o.prototype._toastFromMessage = function(t) {
    t && q(window, "ln-toast:enqueue", {
      type: t.type || "success",
      title: t.title || "",
      message: t.body || ""
    });
  }, o.prototype._toastFromDict = function(t) {
    const s = this._dict[t];
    s && q(window, "ln-toast:enqueue", { type: "error", title: "", message: s });
  }, o.prototype._requestStoreMutation = function(t, s, c) {
    const y = t.storeEl;
    if (!y) return Promise.reject(new Error("Store element not found"));
    const C = M(), E = this._mutationReceipts.wait(C);
    return q(y, "ln-data-store:request-" + s, Object.assign({}, c, { requestId: C })), E;
  }, o.prototype._reportReconciliationError = function(t, s, c) {
    this._destroyed || q(this.dom, "ln-data-coordinator:error", {
      operation: t,
      error: s,
      meta: c || null
    });
  };
  function v(t) {
    t._handlers = {
      sync: function(s) {
        t.refreshMapper();
        const c = t.findChildren();
        if (!c.store || !c.connector) {
          console.warn("[ln-data-coordinator] Cannot sync: store or connector not found in subtree");
          return;
        }
        q(c.connectorEl, i(c.connectorEl) + ":request-sync", { since: s.detail.since, meta: { op: "sync" } });
      },
      requestPage: function(s) {
        const c = t.findChildren();
        if (!c.connectorEl) return;
        const y = s.detail || {};
        q(c.connectorEl, i(c.connectorEl) + ":request-query", {
          query: Object.assign({}, y.query, {
            offset: y.offset,
            limit: y.limit,
            queryGen: y.queryGen
          })
        });
      },
      reqCreate: function(s) {
        const c = t.findChildren();
        t._fanOutCreate(c, s.detail.data || {}, s.detail.action);
      },
      reqUpdate: function(s) {
        const c = t.findChildren();
        t._fanOutUpdate(c, s.detail.id, s.detail.data || {}, s.detail.expected_version, s.detail.action);
      },
      reqDelete: function(s) {
        const c = t.findChildren();
        t._fanOutDelete(c, s.detail.id);
      },
      reqBulkDelete: function(s) {
        const c = t.findChildren();
        t._fanOutBulkDelete(c, s.detail.ids || []);
      },
      queueFailed: function() {
        t._toastFromDict("network");
      },
      // ─── Queue Transport Executor ─────────────────────────
      queueSend: function(s) {
        t.refreshMapper();
        const c = t.findChildren();
        if (!c.store || !c.connector || !c.queue) return;
        const y = s.detail || {}, C = y.entryId, E = y.op, D = y.targetId, F = y.payload, B = y.expectedVersion, z = y.meta || {}, U = z.action || null, G = y.idempotencyKey || C;
        E === "create" ? q(c.connectorEl, i(c.connectorEl) + ":request-create", {
          data: F,
          url: U,
          idempotencyKey: G,
          meta: { entryId: C, queued: !0, op: "create", tempId: z.tempId }
        }) : E === "update" ? q(c.connectorEl, i(c.connectorEl) + ":request-update", {
          id: D,
          data: F,
          expected_version: B,
          url: U,
          idempotencyKey: G,
          meta: { entryId: C, queued: !0, op: "update", id: D }
        }) : E === "delete" ? q(c.connectorEl, i(c.connectorEl) + ":request-delete", {
          id: D,
          idempotencyKey: G,
          meta: { entryId: C, queued: !0, op: "delete", id: D }
        }) : E === "bulk-delete" ? q(c.connectorEl, i(c.connectorEl) + ":request-bulk-delete", {
          ids: F && F.ids ? F.ids : [],
          idempotencyKey: G,
          meta: { entryId: C, queued: !0, op: "bulk-delete", bulkKey: z.bulkKey }
        }) : console.warn("[ln-data-coordinator] Unknown queue op:", E);
      },
      // ─── Form Write Intake — native submit, bubble phase ──────
      formSubmit: function(s) {
        const c = s.target;
        if (s.defaultPrevented) return;
        const y = c.hasAttribute(a) ? c.getAttribute(a) : null;
        if (y === null) return;
        let C;
        if (y ? C = t._owns(y) : C = c.closest("[data-ln-data-coordinator]") === t.dom, !C) return;
        const E = St(c);
        if (E !== "POST" && E !== "PUT" && E !== "PATCH") return;
        s.preventDefault();
        const D = Ct(c);
        delete D._method, delete D._token, t._handleSubmitRecord({ data: D, method: E, action: c.getAttribute("action") || "" });
      },
      // ─── Connector Response Handlers (direct + queued paths) ──
      connFetched: function(s) {
        const c = s.detail.meta || {}, y = t.findChildren();
        t.refreshMapper();
        const C = s.detail.data;
        let E = [], D = [], F = null;
        Array.isArray(C) ? (E = C, F = Math.floor(Date.now() / 1e3)) : C && (E = Array.isArray(C.data) ? C.data : [], D = Array.isArray(C.deleted) ? C.deleted : [], F = C.synced_at !== void 0 ? C.synced_at : C.since !== void 0 ? C.since : null);
        const B = E.map((z) => t.mapper.ingress(z));
        if (y.store && !y.store.initializationError)
          c.kind ? c.kind === "table" || c.kind === "list" || c.kind === "chart" ? y.store.applyQuery(B, { total: s.detail.total }).then(function(z) {
            c.queryGen != null && !t._isCurrentGen(c.targetEl, c.queryGen) || (q(c.targetEl, "ln-" + c.kind + ":set-loading", { loading: !1 }), q(c.targetEl, "ln-" + c.kind + ":set-data", {
              data: z,
              total: s.detail.total !== void 0 ? s.detail.total : z.length,
              filtered: s.detail.filtered !== void 0 ? s.detail.filtered : z.length,
              offset: s.detail.offset,
              queryGen: s.detail.queryGen
            }), t._boundDelivered.set(c.targetEl, !0));
          }) : c.kind === "options" ? y.store.applyQuery(B, { total: s.detail.total }).then(function() {
            return y.store.getAll({});
          }).then(function(z) {
            c.queryGen != null && !t._isCurrentGen(c.targetEl, c.queryGen) || q(c.targetEl, "ln-options:set-data", { data: z.data });
          }) : c.kind === "stat" && y.store.applyQuery(B, { total: s.detail.total }).then(function() {
            if (c.queryGen != null && !t._isCurrentGen(c.targetEl, c.queryGen)) return;
            const z = s.detail.filtered !== void 0 ? s.detail.filtered : s.detail.total !== void 0 ? s.detail.total : B.length;
            q(c.targetEl, "ln-stat:set-count", { count: z });
          }) : y.store.applySync(B, D, F || Math.floor(Date.now() / 1e3), {
            total: s.detail.total,
            filtered: s.detail.filtered,
            offset: s.detail.offset,
            queryGen: s.detail.queryGen,
            targetEl: c.targetEl
          });
        else if (c.targetEl && c.kind) {
          if (c.kind === "table" || c.kind === "list" || c.kind === "chart")
            q(c.targetEl, "ln-" + c.kind + ":set-loading", { loading: !1 }), q(c.targetEl, "ln-" + c.kind + ":set-data", {
              data: B,
              total: s.detail.total !== void 0 ? s.detail.total : B.length,
              filtered: s.detail.filtered !== void 0 ? s.detail.filtered : B.length,
              offset: s.detail.offset,
              queryGen: s.detail.queryGen
            }), t._boundDelivered.set(c.targetEl, !0);
          else if (c.kind === "options")
            q(c.targetEl, "ln-options:set-data", { data: B });
          else if (c.kind === "stat") {
            const z = s.detail.filtered !== void 0 ? s.detail.filtered : s.detail.total !== void 0 ? s.detail.total : B.length;
            q(c.targetEl, "ln-stat:set-count", { count: z });
          }
        }
      },
      connCreated: function(s) {
        const c = t.findChildren(), y = s.detail.meta || {}, C = t.mapper.ingress(s.detail.record);
        (c.storeEl ? t._requestStoreMutation(c, "update", { id: y.tempId, data: C }) : Promise.resolve()).then(function() {
          t._toastFromMessage(s.detail.message), y.queued && c.queue && q(c.queueEl, "ln-api-queue:resolve-create", {
            entryId: y.entryId,
            oldKey: y.tempId,
            newId: C.id
          });
        }).catch(function(D) {
          t._reportReconciliationError("create-reconcile", D, y);
        });
      },
      connUpdated: function(s) {
        const c = t.findChildren(), y = s.detail.meta || {}, C = t.mapper.ingress(s.detail.record);
        (c.storeEl ? t._requestStoreMutation(c, "update", { id: y.id, data: C }) : Promise.resolve()).then(function() {
          t._toastFromMessage(s.detail.message), y.queued && c.queue && q(c.queueEl, "ln-api-queue:ack", { entryId: y.entryId });
        }).catch(function(D) {
          t._reportReconciliationError("update-reconcile", D, y);
        });
      },
      connDeleted: function(s) {
        const c = t.findChildren(), y = s.detail.meta || {};
        t._toastFromMessage(s.detail.message), y.queued && c.queue && q(c.queueEl, "ln-api-queue:ack", { entryId: y.entryId });
      },
      connBulkDeleted: function(s) {
        const c = t.findChildren(), y = s.detail.meta || {};
        t._toastFromMessage(s.detail.message), y.queued && c.queue && q(c.queueEl, "ln-api-queue:ack", { entryId: y.entryId });
      },
      connError: function(s) {
        const c = s.detail || {}, y = c.meta || {}, C = y.op || c.action, E = c.status || c.error && c.error.status || 0, D = t.findChildren();
        if (C === "sync") {
          D.storeEl && q(D.storeEl, "ln-data-store:request-sync-failed", {
            error: c.error,
            status: E
          }), console.error("[ln-data-coordinator] Sync failed:", c.error);
          return;
        }
        if (C === "query") {
          y.targetEl && y.kind && (q(y.targetEl, "ln-" + y.kind + ":set-loading", { loading: !1 }), (y.kind === "table" || y.kind === "list") && q(y.targetEl, "ln-" + y.kind + ":page-failed", { offset: y.offset })), t._reportReconciliationError("query", c.error || c, y);
          return;
        }
        const F = E === 401 || E === 419, B = E === 0 || E >= 500, z = E === 409 || E === 412;
        if (F) {
          t._toastFromDict("auth"), y.queued && D.queue && q(D.queueEl, "ln-api-queue:nack", { entryId: y.entryId, reason: "auth" });
          return;
        }
        if (B) {
          y.queued && D.queue ? q(D.queueEl, "ln-api-queue:nack", { entryId: y.entryId, reason: "retry" }) : t._toastFromDict("network");
          return;
        }
        let U = Promise.resolve();
        if (z && C === "update") {
          const G = c.data && c.data.remote ? t.mapper.ingress(c.data.remote) : null;
          G && D.storeEl && (U = t._requestStoreMutation(D, "update", { id: y.id, data: G })), t._toastFromDict("conflict");
        } else C === "create" && D.storeEl && (U = t._requestStoreMutation(D, "delete", { id: y.tempId })), t._toastFromDict("rejected");
        y.queued && D.queue ? U.then(function() {
          q(D.queueEl, "ln-api-queue:nack", { entryId: y.entryId, reason: "drop" });
        }).catch(function(G) {
          t._reportReconciliationError("deterministic-reconcile", G, y);
        }) : U.catch(function(G) {
          t._reportReconciliationError("deterministic-reconcile", G, y);
        });
      },
      // ─── Store Initialized (Sync Ownership) ───────────────
      storeInitialized: function(s) {
        const c = t.findChildren(), y = c.store;
        if (!y || y.initializationError || !c.connector || t._noAutosync || y.isSyncing) return;
        (s.detail || {}).hasCache ? t._isStale() && y.forceSync() : y.forceSync();
      },
      // A (re)opened socket may have missed pushes — catch up with a delta
      // sync over whichever connector takes requests.
      socketConnected: function() {
        const s = t.findChildren(), c = s.store;
        !c || c.initializationError || !s.connector || t._noAutosync || !c.isInitialized || c.isSyncing || c.forceSync();
      },
      // ─── View Binder Handlers ─────────────────────────────
      reqTableData: function(s) {
        t._serveData(s, "table");
      },
      reqListData: function(s) {
        t._serveData(s, "list");
      },
      reqChartData: function(s) {
        t._serveData(s, "chart");
      },
      reqOptions: function(s) {
        t._serveOptions(s);
      },
      reqStat: function(s) {
        t._serveStat(s);
      },
      refreshQuery: function() {
        t._refreshAll(null, !0);
      },
      refresh: function(s) {
        t._mutationReceipts.resolve(s.detail), t._refreshAll(null, !1);
      },
      mutationError: function(s) {
        t._mutationReceipts.reject(s.detail);
      },
      refreshSynced: function(s) {
        s.detail && s.detail.changed && t._refreshAll(s.detail.meta, !1);
      },
      searchChange: function(s) {
        s.preventDefault();
        const c = s.detail && s.detail.term != null ? s.detail.term : "";
        c !== (t.dom.getAttribute(d) || "") && t.dom.setAttribute(d, c);
      },
      filterChange: function(s) {
        s.preventDefault();
        const c = s.detail && s.detail.key;
        if (!c) return;
        const y = (s.detail.values || []).slice(), C = t._currentQuery().filters, E = C[c];
        if (E ? E.length === y.length && E.every((z, U) => z === y[U]) : !y.length) return;
        y.length ? C[c] = y : delete C[c];
        const F = new URLSearchParams();
        Object.keys(C).forEach(function(z) {
          C[z].forEach(function(U) {
            F.append(z, U);
          });
        });
        const B = F.toString();
        B ? t.dom.setAttribute(h, B) : t.dom.removeAttribute(h);
      },
      sortChange: function(s) {
        s.preventDefault();
        const c = s.detail && s.detail.field, y = s.detail && s.detail.direction, C = c && y && y !== "none" ? { field: c, direction: y } : null, E = t._currentQuery().sort;
        !E && !C || E && C && E.field === C.field && E.direction === C.direction || (C ? (t.dom.setAttribute(p, C.field), t.dom.setAttribute(g, C.direction)) : (t.dom.removeAttribute(p), t.dom.removeAttribute(g)));
      }
    }, t.dom.addEventListener("ln-data-store:request-remote-sync", t._handlers.sync), t.dom.addEventListener("ln-data-store:request-page", t._handlers.requestPage), t.dom.addEventListener("ln-data-coordinator:request-create", t._handlers.reqCreate), t.dom.addEventListener("ln-data-coordinator:request-update", t._handlers.reqUpdate), t.dom.addEventListener("ln-data-coordinator:request-delete", t._handlers.reqDelete), t.dom.addEventListener("ln-data-coordinator:request-bulk-delete", t._handlers.reqBulkDelete), t.dom.addEventListener("ln-api-queue:send", t._handlers.queueSend), t.dom.addEventListener("ln-api-queue:failed", t._handlers.queueFailed), t.dom.addEventListener("ln-data-store:initialized", t._handlers.storeInitialized), t.dom.addEventListener("ln-websocket-connector:connected", t._handlers.socketConnected), document.addEventListener("submit", t._handlers.formSubmit), r.forEach(function(s) {
      t.dom.addEventListener(s + ":fetched", t._handlers.connFetched), t.dom.addEventListener(s + ":created", t._handlers.connCreated), t.dom.addEventListener(s + ":updated", t._handlers.connUpdated), t.dom.addEventListener(s + ":deleted", t._handlers.connDeleted), t.dom.addEventListener(s + ":bulk-deleted", t._handlers.connBulkDeleted), t.dom.addEventListener(s + ":error", t._handlers.connError);
    }), document.addEventListener("ln-table:request-data", t._handlers.reqTableData), document.addEventListener("ln-list:request-data", t._handlers.reqListData), document.addEventListener("ln-chart:request-data", t._handlers.reqChartData), document.addEventListener("ln-options:request-data", t._handlers.reqOptions), document.addEventListener("ln-stat:request-count", t._handlers.reqStat), t.dom.addEventListener("ln-data-store:ready", t._handlers.refresh), t.dom.addEventListener("ln-data-store:created", t._handlers.refresh), t.dom.addEventListener("ln-data-store:updated", t._handlers.refresh), t.dom.addEventListener("ln-data-store:deleted", t._handlers.refresh), t.dom.addEventListener("ln-data-store:mutation-error", t._handlers.mutationError), t.dom.addEventListener("ln-data-store:synced", t._handlers.refreshSynced), t.dom.addEventListener("ln-data-store:query-changed", t._handlers.refreshQuery), t.dom.addEventListener("ln-search:change", t._handlers.searchChange), t.dom.addEventListener("ln-filter:change", t._handlers.filterChange), t.dom.addEventListener("ln-sort:change", t._handlers.sortChange);
  }
  o.prototype._owns = function(t) {
    return !!t && t === this._name;
  }, o.prototype._currentQuery = function() {
    const t = this.dom.getAttribute(p), s = this.dom.getAttribute(g), c = new URLSearchParams(this.dom.getAttribute(h) || ""), y = {};
    for (const C of new Set(c.keys())) y[C] = c.getAll(C);
    return {
      search: this.dom.getAttribute(d) || "",
      filters: y,
      sort: t && s ? { field: t, direction: s } : null
    };
  }, o.prototype._nextQueryGen = function(t) {
    const s = (this._queryGens.get(t) || 0) + 1;
    return this._queryGens.set(t, s), s;
  }, o.prototype._isCurrentGen = function(t, s) {
    return this._queryGens.get(t) === s;
  }, o.prototype._serveData = function(t, s) {
    const c = t.target, y = s === "table" ? "data-ln-table-source" : s === "list" ? "data-ln-list-source" : "data-ln-chart-source", C = c.getAttribute(y);
    if (!C || !this._owns(C)) return;
    const E = t.detail || {}, D = gn(E);
    this._boundQueries.set(c, D);
    const F = this.findChildren(), B = this, z = F.store;
    return (z && z.ready ? z.ready : Promise.resolve()).then(function() {
      if (B._destroyed) return;
      const G = fe(z, F.connector), V = We(D, B._currentQuery());
      if (G === "remote") {
        const j = B._nextQueryGen(c);
        q(c, "ln-" + s + ":set-loading", { loading: !0 }), q(F.connectorEl, i(F.connectorEl) + ":request-query", {
          query: V,
          meta: { targetEl: c, kind: s, offset: V.offset, limit: V.limit, queryGen: j }
        });
        return;
      }
      if (G !== "store") {
        q(c, "ln-" + s + ":set-loading", { loading: !1 });
        return;
      }
      const $ = ge(z, F.connector, G), Q = $ ? B._nextQueryGen(c) : null;
      return $ && q(F.connectorEl, i(F.connectorEl) + ":request-query", {
        query: V,
        meta: { targetEl: c, kind: s, offset: V.offset, limit: V.limit, queryGen: Q }
      }), z.getAll(V).then(function(j) {
        if (B._destroyed || !B._boundDelivered || $ && !B._isCurrentGen(c, Q)) return;
        const K = {
          data: j.data,
          total: j.total,
          filtered: j.filtered,
          offset: E.offset !== void 0 ? E.offset : j.offset,
          queryGen: E.queryGen !== void 0 ? E.queryGen : j.queryGen,
          // The store answered from its own records while the server query
          // is still out; the view renders it but keeps the refresh showing.
          provisional: $ || j.provisional === !0
        };
        q(c, "ln-" + s + ":set-data", K), B._boundDelivered.set(c, !0);
      });
    }).catch(function(G) {
      B._destroyed || (q(c, "ln-" + s + ":set-loading", { loading: !1 }), q(B.dom, "ln-data-coordinator:error", {
        operation: "query",
        kind: s,
        store: C,
        target: c,
        error: G
      }));
    });
  }, o.prototype._serveOptions = function(t) {
    const s = t.target, c = s.getAttribute("data-ln-options");
    if (!this._owns(c)) return;
    const y = this.findChildren(), C = y.store, E = C && C.ready ? C.ready : Promise.resolve(), D = this;
    return E.then(function() {
      if (D._destroyed) return;
      const F = fe(C, y.connector);
      if (F === "remote") {
        const U = D._nextQueryGen(s);
        q(y.connectorEl, i(y.connectorEl) + ":request-query", {
          query: {},
          meta: { targetEl: s, kind: "options", queryGen: U }
        });
        return;
      }
      if (F !== "store") return;
      const B = ge(C, y.connector, F), z = B ? D._nextQueryGen(s) : null;
      return B && q(y.connectorEl, i(y.connectorEl) + ":request-query", {
        query: {},
        meta: { targetEl: s, kind: "options", queryGen: z }
      }), C.getAll({}).then(function(U) {
        D._destroyed || B && !D._isCurrentGen(s, z) || q(s, "ln-options:set-data", { data: U.data });
      });
    }).catch(function(F) {
      D._destroyed || D._reportReconciliationError("options-query", F, { targetEl: s, kind: "options" });
    });
  }, o.prototype._serveStat = function(t) {
    const s = t.target, c = s.getAttribute("data-ln-stat");
    if (!this._owns(c)) return;
    const y = t.detail && t.detail.filters ? t.detail.filters : null, C = this.findChildren(), E = C.store, D = E && E.ready ? E.ready : Promise.resolve(), F = this;
    return D.then(function() {
      if (F._destroyed) return;
      const B = y && Object.keys(y).length > 0, z = !!(C.connector && E && (E.windowed && B || E.noLocalQuery)), U = z ? "remote" : fe(E, C.connector);
      if (U === "remote") {
        const $ = F._nextQueryGen(s);
        q(C.connectorEl, i(C.connectorEl) + ":request-query", {
          query: { filters: y },
          meta: { targetEl: s, kind: "stat", queryGen: $ }
        });
        return;
      }
      if (U !== "store") return;
      const G = !z && ge(E, C.connector, U), V = G ? F._nextQueryGen(s) : null;
      return G && q(C.connectorEl, i(C.connectorEl) + ":request-query", {
        query: { filters: y },
        meta: { targetEl: s, kind: "stat", queryGen: V }
      }), E.count(y).then(function($) {
        F._destroyed || G && !F._isCurrentGen(s, V) || q(s, "ln-stat:set-count", { count: $ });
      });
    }).catch(function(B) {
      F._destroyed || F._reportReconciliationError("stat-query", B, { targetEl: s, kind: "stat" });
    });
  }, o.prototype._refreshAll = function(t, s) {
    const c = this, y = document.querySelectorAll("[data-ln-table-source],[data-ln-list-source],[data-ln-chart-source],[data-ln-options],[data-ln-stat]");
    for (let C = 0; C < y.length; C++) {
      const E = y[C];
      let D, F;
      if (E.hasAttribute("data-ln-table-source") ? (D = E.getAttribute("data-ln-table-source"), F = "table") : E.hasAttribute("data-ln-list-source") ? (D = E.getAttribute("data-ln-list-source"), F = "list") : E.hasAttribute("data-ln-chart-source") ? (D = E.getAttribute("data-ln-chart-source"), F = "chart") : E.hasAttribute("data-ln-options") ? (D = E.getAttribute("data-ln-options"), F = "options") : E.hasAttribute("data-ln-stat") && (D = E.getAttribute("data-ln-stat"), F = "stat"), !c._owns(D)) continue;
      const B = c.findChildren(), z = B.store;
      if (F === "table" || F === "list") {
        const U = F === "table" ? "data-ln-table-window" : "data-ln-list-window";
        if (E.hasAttribute(U)) {
          q(E, "ln-" + F + (s ? ":request-invalidate" : ":request-revalidate"), {});
          continue;
        }
      }
      if (F === "table" || F === "list" || F === "chart") {
        const U = c._boundQueries.get(E) || { sort: null, filters: {}, search: "" }, G = We(U, c._currentQuery());
        if (fe(z, B.connector) === "remote") {
          const Q = c._nextQueryGen(E);
          q(E, "ln-" + F + ":set-loading", { loading: !0 }), q(B.connectorEl, i(B.connectorEl) + ":request-query", {
            query: G,
            meta: { targetEl: E, kind: F, offset: G.offset, limit: G.limit, queryGen: Q }
          });
          continue;
        }
        const V = ge(z, B.connector, fe(z, B.connector)), $ = V ? c._nextQueryGen(E) : null;
        V && q(B.connectorEl, i(B.connectorEl) + ":request-query", {
          query: G,
          meta: { targetEl: E, kind: F, offset: G.offset, limit: G.limit, queryGen: $ }
        }), (function(Q, j, K, ee) {
          z.getAll(G).then(function(ne) {
            if (c._destroyed || !c._boundDelivered || K && !c._isCurrentGen(Q, ee)) return;
            const ye = {
              data: ne.data,
              total: t && t.total !== void 0 ? t.total : ne.total,
              filtered: t && t.filtered !== void 0 ? t.filtered : ne.filtered,
              offset: ne.offset !== void 0 ? ne.offset : t && t.offset !== void 0 ? t.offset : U.offset,
              queryGen: ne.queryGen !== void 0 ? ne.queryGen : t && t.queryGen !== void 0 ? t.queryGen : U.queryGen
            };
            q(Q, "ln-" + j + ":set-loading", { loading: !1 }), q(Q, "ln-" + j + ":set-data", ye), c._boundDelivered.set(Q, !0);
          }).catch(function() {
          });
        })(E, F, V, $);
      } else if (F === "options")
        (function(U) {
          z.getAll({}).then(function(G) {
            c._destroyed || q(U, "ln-options:set-data", { data: G.data });
          }).catch(function() {
          });
        })(E);
      else if (F === "stat") {
        const U = E.getAttribute("data-ln-stat-filter");
        let G = null;
        if (U) {
          const V = U.indexOf(":");
          if (V !== -1) {
            const $ = U.slice(0, V).trim(), Q = U.slice(V + 1).trim();
            $ && (G = {}, G[$] = [Q]);
          }
        }
        (function(V, $) {
          z.count($).then(function(Q) {
            c._destroyed || q(V, "ln-stat:set-count", { count: Q });
          }).catch(function() {
          });
        })(E, G);
      }
    }
  }, o.prototype.destroy = function() {
    if (!this.dom[n]) return;
    this._destroyed = !0;
    const t = this;
    t._handlers && (t.dom.removeEventListener("ln-data-store:request-remote-sync", t._handlers.sync), t.dom.removeEventListener("ln-data-store:request-page", t._handlers.requestPage), t.dom.removeEventListener("ln-data-coordinator:request-create", t._handlers.reqCreate), t.dom.removeEventListener("ln-data-coordinator:request-update", t._handlers.reqUpdate), t.dom.removeEventListener("ln-data-coordinator:request-delete", t._handlers.reqDelete), t.dom.removeEventListener("ln-data-coordinator:request-bulk-delete", t._handlers.reqBulkDelete), t.dom.removeEventListener("ln-api-queue:send", t._handlers.queueSend), t.dom.removeEventListener("ln-api-queue:failed", t._handlers.queueFailed), t.dom.removeEventListener("ln-data-store:initialized", t._handlers.storeInitialized), t.dom.removeEventListener("ln-websocket-connector:connected", t._handlers.socketConnected), document.removeEventListener("submit", t._handlers.formSubmit), r.forEach(function(s) {
      t.dom.removeEventListener(s + ":fetched", t._handlers.connFetched), t.dom.removeEventListener(s + ":created", t._handlers.connCreated), t.dom.removeEventListener(s + ":updated", t._handlers.connUpdated), t.dom.removeEventListener(s + ":deleted", t._handlers.connDeleted), t.dom.removeEventListener(s + ":bulk-deleted", t._handlers.connBulkDeleted), t.dom.removeEventListener(s + ":error", t._handlers.connError);
    }), document.removeEventListener("ln-table:request-data", t._handlers.reqTableData), document.removeEventListener("ln-list:request-data", t._handlers.reqListData), document.removeEventListener("ln-chart:request-data", t._handlers.reqChartData), document.removeEventListener("ln-options:request-data", t._handlers.reqOptions), document.removeEventListener("ln-stat:request-count", t._handlers.reqStat), t.dom.removeEventListener("ln-data-store:ready", t._handlers.refresh), t.dom.removeEventListener("ln-data-store:created", t._handlers.refresh), t.dom.removeEventListener("ln-data-store:updated", t._handlers.refresh), t.dom.removeEventListener("ln-data-store:deleted", t._handlers.refresh), t.dom.removeEventListener("ln-data-store:mutation-error", t._handlers.mutationError), t.dom.removeEventListener("ln-data-store:synced", t._handlers.refreshSynced), t.dom.removeEventListener("ln-data-store:query-changed", t._handlers.refreshQuery), t.dom.removeEventListener("ln-search:change", t._handlers.searchChange), t.dom.removeEventListener("ln-filter:change", t._handlers.filterChange), t.dom.removeEventListener("ln-sort:change", t._handlers.sortChange), t._handlers = null), t._boundQueries = null, t._boundDelivered = null, t._queryGens = null, t._queueQueryRefresh = null, t._mutationReceipts.close(new Error("Data coordinator destroyed")), t._mutationReceipts = null, b.delete(this), N(), delete this.dom[n];
  }, Z(e, n, o, "ln-data-coordinator", {
    attributes: A
  });
})();
(function() {
  const e = "data-ln-list", n = "lnList", a = "data-ln-list-empty";
  if (window[n] !== void 0) return;
  function w(r, i) {
    if (!r || !r.isDataDriven) return;
    const o = r.dom.hasAttribute("data-ln-list-window");
    if (o && !r._windowed)
      r._enterWindowedMode(), r._kickWindowInitial();
    else if (!o && r._windowed)
      r._exitWindowedMode();
    else if (o && r._windowed) {
      const v = parseInt(i, 10);
      v > 0 && r._cache.configure({ windowSize: v });
    }
  }
  function m(r, i) {
    if (!r || !r.isDataDriven || !r._windowed || !r._cache) return;
    const o = parseInt(i, 10);
    o > 0 && r._cache.configure({ pageSize: o });
  }
  function A(r, i) {
    if (!r || !r.isDataDriven || !r._windowed || !r._cache) return;
    const o = parseInt(i, 10);
    o >= 0 && r._cache.configure({ threshold: o });
  }
  function f(r, i) {
    if (!r || !r.isDataDriven || !r._windowed || !r._cache) return;
    const o = parseInt(i, 10);
    o >= 0 && r._cache.setGrandTotal(o);
  }
  const b = {
    "data-ln-list": { prop: "name", type: "string", read: ie, fallback: "", description: "List instance name or identifier" },
    "data-ln-list-source": { prop: "source", type: "string", read: ie, fallback: "", description: "Source store or coordinator addressing" },
    "data-ln-list-selectable": { prop: "_selectable", type: "boolean", read: De, description: "Enables item selection controls" },
    "data-ln-list-window": { type: "integer", fallback: 1e3, min: 10, effect: w, description: "Virtual scrolling window size in items" },
    "data-ln-list-window-page": { type: "integer", fallback: 200, min: 5, effect: m, description: "Virtual scrolling slice page size" },
    "data-ln-list-window-threshold": { type: "integer", fallback: 50, min: 0, effect: A, description: "Scroll threshold margin in pixels to trigger page fetch" },
    "data-ln-list-count": { type: "integer", min: 0, effect: f, description: "Total item count override for virtual scrollbar calculation" },
    "data-ln-list-empty": { type: "marker", description: "Container for list empty state" },
    "data-ln-list-field": { type: "string", description: "Field name mapping for list item binding" }
  }, L = ce(b);
  function x(r, i) {
    if (r == null || isNaN(r)) return "";
    try {
      return new Intl.NumberFormat(Be(i)).format(r);
    } catch {
      return String(r);
    }
  }
  function O(r) {
    let i = r;
    for (; i && i !== document.body && i !== document.documentElement; ) {
      const v = getComputedStyle(i).overflowY;
      if (v === "auto" || v === "scroll") return i;
      i = i.parentElement;
    }
    return null;
  }
  function S(r) {
    const i = r._scrollContainer || O(r.dom);
    return {
      container: i,
      top: i ? i.scrollTop : window.scrollY
    };
  }
  function R(r) {
    r.container ? r.container.scrollTop = r.top : window.scrollTo(window.scrollX, r.top);
  }
  function N(r) {
    if (!r) return 0;
    const i = getComputedStyle(r), o = parseFloat(i.marginTop) || 0, v = parseFloat(i.marginBottom) || 0;
    return r.offsetHeight + o + v;
  }
  function M(r) {
    this.dom = r, le(this, r, L), this.tbody = r.querySelector("[data-ln-list-body]") || r, this.isDataDriven = r.hasAttribute("data-ln-list-source"), this._totalSpan = r.querySelector("[data-ln-list-total]"), this._filteredSpan = r.querySelector("[data-ln-list-filtered]"), this._filteredSpan && (this._filteredWrap = this._filteredSpan.parentElement !== r ? this._filteredSpan.parentElement : null), this._selectedSpan = r.querySelector("[data-ln-list-selected]"), this._selectedSpan && (this._selectedWrap = this._selectedSpan.parentElement !== r ? this._selectedSpan.parentElement : null), this._data = [], this._filteredData = [], this.selectedIds = /* @__PURE__ */ new Set(), this._searchTerm = "", this._filters = {}, this._sortField = null, this._sortDir = null, this._virtual = !1, this._itemHeight = 0, this._vStart = -1, this._vEnd = -1, this._rafId = null, this._scrollHandler = null, this._resizeHandler = null, this._scrollContainer = null, this.isUl = this.tbody.tagName === "UL" || this.tbody.tagName === "OL";
    const i = this;
    return this._onSetSearch = function(o) {
      const v = (o.detail && o.detail.query != null ? o.detail.query : o.detail && o.detail.term != null ? o.detail.term : "").trim();
      i.isDataDriven ? (i.currentSearch = v, q(r, "ln-list:search", {
        list: i.name,
        query: i.currentSearch
      }), i._requestData()) : (i._searchTerm = v.toLowerCase(), i._applyFilterAndSort(), i._vStart = -1, i._vEnd = -1, i._render(), i._updateFooter(), q(r, "ln-list:filter", {
        term: i._searchTerm,
        matched: i._filteredData.length,
        total: i._data.length
      }));
    }, r.addEventListener("ln-list:set-search", this._onSetSearch), this._onSearchChange = function(o) {
      o.preventDefault(), i._onSetSearch(o);
    }, r.addEventListener("ln-search:change", this._onSearchChange), this._onRequestClearFilters = function() {
      i.isDataDriven ? (i.currentFilters = {}, i.currentSearch = "", q(r, "ln-list:clear-filters", { list: i.name }), i._requestData()) : (i._searchTerm = "", i._filters = {}, i._sortField = null, i._sortDir = null, i._applyFilterAndSort(), i._vStart = -1, i._vEnd = -1, i._render(), i._updateFooter(), q(r, "ln-list:filter", {
        term: "",
        matched: i._filteredData.length,
        total: i._data.length
      }));
    }, r.addEventListener("ln-list:request-clear-filters", this._onRequestClearFilters), this._selectableActive = !1, this._selectable && this._enableSelection(), this.isDataDriven ? (this.isLoaded = !1, this.totalCount = 0, this.visibleCount = 0, this.currentSort = null, this.currentFilters = {}, this.currentSearch = "", this._lastTotal = 0, this._lastFiltered = 0, this._hasInitialSeed = !1, this._windowed = !1, this._cache = null, r.hasAttribute("data-ln-list-window") && this._enterWindowedMode(), this._onSetData = function(o) {
      const v = o.detail || {}, t = v.data || [], s = v.total != null ? v.total : t.length;
      if (!(i._hasInitialSeed && !i.isLoaded && t.length === 0 && s === 0)) {
        if (i._windowed) {
          i._cache.ingest(v) && !v.provisional && r.classList.remove("ln-list--loading");
          return;
        }
        i._data = t, i._lastTotal = s, i._lastFiltered = v.filtered != null ? v.filtered : i._data.length, i.totalCount = i._lastTotal, i.visibleCount = i._lastFiltered, i.isLoaded = !0, i._hasInitialSeed = !1, r.classList.remove("ln-list--loading"), i._vStart = -1, i._vEnd = -1, i._applyFilterAndSort(), i._render(), i._updateFooter(), q(r, "ln-list:rendered", {
          list: i.name,
          total: i.totalCount,
          visible: i.visibleCount
        });
      }
    }, r.addEventListener("ln-list:set-data", this._onSetData), this._onSetLoading = function(o) {
      const v = o.detail && o.detail.loading;
      r.classList.toggle("ln-list--loading", !!v), v && (i.isLoaded = !1);
    }, r.addEventListener("ln-list:set-loading", this._onSetLoading), this._onPageFailed = function(o) {
      !i._windowed || !i._cache || i._cache.release(o.detail && o.detail.offset);
    }, r.addEventListener("ln-list:page-failed", this._onPageFailed), this._onRequestRevalidate = function() {
      !i._windowed || !i._cache || i._cache.revalidate();
    }, r.addEventListener("ln-list:request-revalidate", this._onRequestRevalidate), this._onRequestInvalidate = function() {
      !i._windowed || !i._cache || i._requestData();
    }, r.addEventListener("ln-list:request-invalidate", this._onRequestInvalidate), this._onSort = function(o) {
      o.detail.field != null && (o.preventDefault(), i.currentSort = o.detail.direction === "none" ? null : { field: o.detail.field, direction: o.detail.direction }, i._requestData());
    }, r.addEventListener("ln-sort:change", this._onSort), this._onItemClick = function(o) {
      if (o.target.closest("[data-ln-item-select]") || o.target.closest("[data-ln-item-action]") || o.target.closest("a") || o.target.closest("button") || o.ctrlKey || o.metaKey || o.button === 1) return;
      const v = o.target.closest("[data-ln-item]");
      if (!v) return;
      const t = v.getAttribute("data-ln-item-id"), s = v._lnRecord || {};
      q(r, "ln-list:item-click", {
        list: i.name,
        id: t,
        record: s
      });
    }, this.tbody && this.tbody.addEventListener("click", this._onItemClick), this._onItemAction = function(o) {
      const v = o.target.closest("[data-ln-item-action]");
      if (!v) return;
      const t = v.closest("[data-ln-item]");
      if (!t) return;
      const s = v.getAttribute("data-ln-item-action"), c = t.getAttribute("data-ln-item-id"), y = t._lnRecord || {};
      q(r, "ln-list:item-action", {
        list: i.name,
        id: c,
        action: s,
        record: y
      });
    }, this.tbody && this.tbody.addEventListener("click", this._onItemAction), this.tbody && this.tbody.children.length > 0 && this._parseChildren(), this._windowed ? this._kickWindowInitial() : q(r, "ln-list:request-data", {
      list: this.name,
      sort: this.currentSort,
      filters: this.currentFilters,
      search: this.currentSearch
    })) : (this._emptyObserver = null, this.tbody && this.tbody.children.length > 0 ? this._parseChildren() : this.tbody && (this._emptyObserver = new MutationObserver(function() {
      i.tbody.children.length > 0 && (i._emptyObserver.disconnect(), i._emptyObserver = null, i._parseChildren());
    }), this._emptyObserver.observe(this.tbody, { childList: !0 })), this._onFilterChange = function(o) {
      if (o.preventDefault(), !o.detail) return;
      const v = o.detail.key, t = o.detail.values || [];
      if (v) {
        if (t.length === 0)
          delete i._filters[v];
        else {
          const s = [];
          for (let c = 0; c < t.length; c++)
            s.push(t[c].toLowerCase());
          i._filters[v] = s;
        }
        i._applyFilterAndSort(), i._vStart = -1, i._vEnd = -1, i._render(), i._updateFooter(), q(r, "ln-list:filter", {
          term: i._searchTerm,
          matched: i._filteredData.length,
          total: i._data.length
        });
      }
    }, r.addEventListener("ln-filter:change", this._onFilterChange), this._onSort = function(o) {
      if (o.detail && o.detail.field == null) return;
      o.preventDefault();
      const v = o.detail && o.detail.direction === "none" ? null : o.detail && o.detail.direction;
      i._sortField = v === null ? null : o.detail && o.detail.field, i._sortDir = v, i._applyFilterAndSort(), i._vStart = -1, i._vEnd = -1, i._render(), i._updateFooter(), q(r, "ln-list:sorted", {
        field: i._sortField,
        direction: o.detail && o.detail.direction,
        matched: i._filteredData.length,
        total: i._data.length
      });
    }, r.addEventListener("ln-sort:change", this._onSort)), this;
  }
  M.prototype._parseChildren = function() {
    const r = Array.from(this.tbody.children).filter((i) => !i.classList.contains("ln-list__spacer"));
    this._data = [], r.length > 0 && (this._itemHeight = N(r[0]) || 50);
    for (let i = 0; i < r.length; i++) {
      const o = r[i], v = o.getAttribute("data-ln-item-id") || o.getAttribute("id"), t = o.textContent.trim().toLowerCase();
      let s = null;
      if (this.isDataDriven) {
        s = {}, v != null && (s.id = v);
        const C = o.querySelectorAll("[data-ln-list-field]");
        for (let E = 0; E < C.length; E++) {
          const D = C[E], F = D.getAttribute("data-ln-list-field");
          F && (s[F] = Ne(D));
        }
      }
      const c = {}, y = o.querySelectorAll("[data-ln-list-field], [data-ln-field]");
      for (let C = 0; C < y.length; C++) {
        const E = y[C], D = E.getAttribute("data-ln-list-field") || E.getAttribute("data-ln-field");
        D && (c[D] = Ne(E));
      }
      for (let C = 0; C < o.attributes.length; C++) {
        const E = o.attributes[C];
        if (E.name.startsWith("data-") && !E.name.startsWith("data-ln-")) {
          const D = E.name.slice(5);
          D && (c[D] = E.value);
        }
      }
      this._data.push({
        html: o.outerHTML,
        id: v,
        searchText: t,
        fields: c,
        ...s || {}
      });
    }
    this._filteredData = this._data.slice(), this._data.length > 0 && (this._hasInitialSeed = !0), this.isDataDriven && (this._lastTotal = this._data.length, this._lastFiltered = this._data.length, this.totalCount = this._data.length, this.visibleCount = this._data.length, this._updateFooter()), this._render(), q(this.dom, "ln-list:ready", {
      total: this._data.length
    });
  }, M.prototype._applyFilterAndSort = function() {
    if (this.isDataDriven)
      this._filteredData = this._data ? this._data.slice() : [], this.visibleCount = this.isDataDriven && this._lastFiltered != null ? this._lastFiltered : this._filteredData.length;
    else {
      const r = this._searchTerm, i = r ? r.split(/\s+/).filter(Boolean) : [], o = this._filters || {}, v = Object.keys(o).length > 0;
      if (i.length === 0 && !v ? this._filteredData = this._data.slice() : this._filteredData = this._data.filter(function(t) {
        if (i.length > 0 && !i.every(function(c) {
          return t.searchText && t.searchText.indexOf(c) !== -1;
        }))
          return !1;
        if (v)
          for (const s in o) {
            const c = o[s];
            if (c && c.length > 0) {
              const y = t.fields && t.fields[s] !== void 0 ? t.fields[s] : t[s] !== void 0 ? t[s] : null, C = y != null ? String(y).toLowerCase() : "";
              if (c.indexOf(C) === -1) return !1;
            }
          }
        return !0;
      }), this._sortField && this._sortDir) {
        const t = this._sortField, s = this._sortDir === "desc" ? -1 : 1, c = typeof Intl < "u" ? new Intl.Collator(Be(this.dom), { sensitivity: "base" }) : null, y = this._filteredData.map(function(E) {
          return E.fields && E.fields[t] !== void 0 ? E.fields[t] : E[t];
        }), C = nt(y);
        this._filteredData.sort(function(E, D) {
          const F = E.fields && E.fields[t] !== void 0 ? E.fields[t] : E[t], B = D.fields && D.fields[t] !== void 0 ? D.fields[t] : D[t];
          return rt(F, B, C, c) * s;
        });
      }
    }
  }, M.prototype._render = function() {
    if (this.tbody)
      if (this.isDataDriven) {
        if (this._windowed) {
          this._renderWindowed();
          return;
        }
        const r = this._lastTotal, i = this.visibleCount;
        if (r === 0 || this._filteredData.length === 0 || i === 0) {
          this._disableVirtualScroll(), this._showEmptyState();
          return;
        }
        this._filteredData.length > 200 ? (this._enableVirtualScroll(), this._renderVirtual()) : (this._disableVirtualScroll(), this._renderAll());
      } else {
        const r = this._filteredData.length;
        r === 0 && (this._searchTerm || Object.keys(this._filters || {}).length > 0) ? (this._disableVirtualScroll(), this._showEmptyState()) : r > 200 ? (this._enableVirtualScroll(), this._renderVirtual()) : (this._disableVirtualScroll(), this._renderAll());
      }
  }, M.prototype._renderAll = function() {
    if (this.isDataDriven) {
      const r = this._filteredData, i = document.createDocumentFragment();
      for (let v = 0; v < r.length; v++) {
        const t = this._buildItem(r[v]);
        t && i.appendChild(t);
      }
      const o = S(this);
      this.tbody.replaceChildren(i), R(o), this._selectable && this._updateSelectAll();
    } else {
      const r = [], i = this._filteredData;
      for (let v = 0; v < i.length; v++) r.push(i[v].html);
      const o = S(this);
      this.tbody.innerHTML = r.join(""), R(o), this._selectable && this._restoreSelection();
    }
  }, M.prototype._readGridLayout = function() {
    const r = getComputedStyle(this.tbody), i = r.gridTemplateColumns;
    let o = 1;
    if (i && i !== "none") {
      const t = i.trim().split(/\s+/).filter(Boolean);
      t.length > 0 && (o = t.length);
    }
    const v = parseFloat(r.rowGap);
    return { columns: o, rowGap: isNaN(v) ? 0 : v };
  }, M.prototype._measureItemHeight = function() {
    if (this._windowed) {
      const r = this._cache.peek(), i = r ? this._buildItem(r) : this._buildPlaceholderItem();
      i && (this.tbody.textContent = "", this.tbody.appendChild(i), this._itemHeight = N(i) || 50, this.tbody.textContent = "");
    } else if (this.isDataDriven) {
      if (this._data.length > 0) {
        const r = this._buildItem(this._data[0]);
        r && (this.tbody.textContent = "", this.tbody.appendChild(r), this._itemHeight = N(r) || 50, this.tbody.textContent = "");
      }
    } else {
      const r = this.tbody.children;
      r.length > 0 && (this._itemHeight = N(r[0]) || 50);
    }
  }, M.prototype._enableVirtualScroll = function() {
    if (this._virtual) return;
    this._virtual = !0, this._vStart = -1, this._vEnd = -1;
    const r = this;
    this._itemHeight || this._measureItemHeight(), this._scrollContainer = O(this.dom);
    const i = this._scrollContainer || window;
    this._scrollHandler = function() {
      r._rafId || (r._rafId = requestAnimationFrame(function() {
        r._rafId = null, r._windowed ? r._renderWindowed() : r._renderVirtual();
      }));
    }, this._resizeHandler = function() {
      r._itemHeight = 0, r._measureItemHeight(), r._vStart = -1, r._vEnd = -1, r._windowed ? r._renderWindowed() : r._renderVirtual();
    }, i.addEventListener("scroll", this._scrollHandler, { passive: !0 }), window.addEventListener("resize", this._resizeHandler, { passive: !0 });
  }, M.prototype._disableVirtualScroll = function() {
    this._virtual && (this._virtual = !1, this._scrollHandler && ((this._scrollContainer || window).removeEventListener("scroll", this._scrollHandler), this._scrollHandler = null), this._resizeHandler && (window.removeEventListener("resize", this._resizeHandler), this._resizeHandler = null), this._scrollContainer = null, this._rafId && (cancelAnimationFrame(this._rafId), this._rafId = null), this._vStart = -1, this._vEnd = -1);
  }, M.prototype._renderVirtual = function() {
    const r = this._filteredData, i = r.length, o = this._itemHeight;
    if (!o || !i) return;
    const v = this._scrollContainer;
    let t, s;
    if (v) {
      const Q = this.tbody.getBoundingClientRect(), j = v.getBoundingClientRect(), K = v === this.tbody ? 0 : Q.top - j.top + v.scrollTop;
      t = v.scrollTop - K, s = v.clientHeight;
    } else {
      const j = this.tbody.getBoundingClientRect().top + window.scrollY;
      t = window.scrollY - j, s = window.innerHeight;
    }
    const c = this._readGridLayout(), y = c.columns, C = c.rowGap, E = o + C, D = Math.ceil(i / y);
    let F = Math.max(0, Math.floor(t / E) - 15);
    F = Math.min(F, D);
    const B = Math.ceil(s / E) + 30, z = Math.min(F + B, D), U = Math.min(F * y, i), G = Math.min(z * y, i);
    if (U === this._vStart && G === this._vEnd) return;
    this._vStart = U, this._vEnd = G;
    const V = F * E, $ = (D - z) * E;
    if (this.isDataDriven) {
      const Q = document.createDocumentFragment();
      if (V > 0) {
        const K = document.createElement(this.isUl ? "li" : "div");
        K.className = "ln-list__spacer", K.setAttribute("aria-hidden", "true"), K.style.height = V + "px", Q.appendChild(K);
      }
      for (let K = U; K < G; K++) {
        const ee = this._buildItem(r[K]);
        ee && Q.appendChild(ee);
      }
      if ($ > 0) {
        const K = document.createElement(this.isUl ? "li" : "div");
        K.className = "ln-list__spacer", K.setAttribute("aria-hidden", "true"), K.style.height = $ + "px", Q.appendChild(K);
      }
      const j = S(this);
      this.tbody.replaceChildren(Q), R(j), this._selectable && this._updateSelectAll();
    } else {
      let Q = "";
      V > 0 && (Q += `<${this.isUl ? "li" : "div"} class="ln-list__spacer" aria-hidden="true" style="height:${V}px"></${this.isUl ? "li" : "div"}>`);
      for (let K = U; K < G; K++)
        Q += r[K].html;
      $ > 0 && (Q += `<${this.isUl ? "li" : "div"} class="ln-list__spacer" aria-hidden="true" style="height:${$}px"></${this.isUl ? "li" : "div"}>`);
      const j = S(this);
      this.tbody.innerHTML = Q, R(j), this._selectable && this._restoreSelection();
    }
  }, M.prototype._buildPlaceholderItem = function() {
    const r = document.createElement(this.isUl ? "li" : "div");
    return r.className = "ln-list__placeholder", r.setAttribute("aria-hidden", "true"), r.style.height = this._itemHeight + "px", r;
  }, M.prototype._renderWindowed = function() {
    if (this.isLoaded && this._cache.logicalTotal === 0) {
      this._disableVirtualScroll(), this._showEmptyState();
      return;
    }
    this._virtual || this._enableVirtualScroll();
    const r = this._itemHeight;
    if (!r) return;
    const i = this._scrollContainer;
    let o, v;
    if (i) {
      const j = this.tbody.getBoundingClientRect(), K = i.getBoundingClientRect(), ee = i === this.tbody ? 0 : j.top - K.top + i.scrollTop;
      o = i.scrollTop - ee, v = i.clientHeight;
    } else {
      const K = this.tbody.getBoundingClientRect().top + window.scrollY;
      o = window.scrollY - K, v = window.innerHeight;
    }
    const t = this._readGridLayout(), s = t.columns, c = t.rowGap, y = r + c, C = this._cache.logicalTotal, E = Math.ceil(C / s);
    let D = Math.max(0, Math.floor(o / y) - 15);
    D = Math.min(D, E);
    const F = Math.ceil(v / y) + 30, B = Math.min(D + F, E), z = Math.min(D * s, C), U = Math.min(B * s, C), G = D * y, V = (E - B) * y, $ = document.createDocumentFragment();
    if (G > 0) {
      const j = document.createElement(this.isUl ? "li" : "div");
      j.className = "ln-list__spacer", j.setAttribute("aria-hidden", "true"), j.style.height = G + "px", $.appendChild(j);
    }
    for (let j = z; j < U; j++)
      if (this._cache.has(j)) {
        const K = this._buildItem(this._cache.get(j));
        K && $.appendChild(K);
      } else
        $.appendChild(this._buildPlaceholderItem());
    if (V > 0) {
      const j = document.createElement(this.isUl ? "li" : "div");
      j.className = "ln-list__spacer", j.setAttribute("aria-hidden", "true"), j.style.height = V + "px", $.appendChild(j);
    }
    const Q = S(this);
    this.tbody.replaceChildren($), R(Q), this._vStart = z, this._vEnd = U, this._cache.ensure(z, U);
  }, M.prototype._showEmptyState = function() {
    let r = null;
    if (this.isDataDriven) {
      const i = this._lastTotal != null ? this._lastTotal : this._data.length, v = this.visibleCount === 0 && i > 0, t = v ? this.name + "-empty-filtered" : this.name + "-empty";
      if (r = Ce(this.dom, t, "ln-list"), !r) {
        const s = this.dom.querySelector("template[data-ln-empty], template[data-ln-list-empty]");
        if (s) {
          const c = v ? "search" : "initial", y = s.content.querySelector(`[data-ln-empty-when="${c}"]`) || s.content.firstElementChild;
          y && (r = document.importNode(y, !0));
        }
      }
    } else {
      const i = this.dom.querySelector(`template[${a}]`);
      if (i) {
        const o = i.content.firstElementChild;
        o && (r = document.importNode(o, !0));
      }
    }
    if (r)
      if (r.tagName === "LI" || r.tagName === "TR")
        this.tbody.replaceChildren(r);
      else {
        const i = document.createElement(this.isUl ? "li" : "div");
        i.appendChild(r), this.tbody.replaceChildren(i);
      }
    else
      this.tbody.replaceChildren();
    q(this.dom, "ln-list:empty", {
      term: this.isDataDriven ? this.currentSearch || "" : this._searchTerm,
      total: this.isDataDriven ? this._lastTotal != null ? this._lastTotal : this._data.length : this._data.length
    });
  }, M.prototype._buildItem = function(r) {
    let i = Ce(this.dom, this.name + "-row", "ln-list");
    if (!i) {
      const v = this.dom.querySelector("template[data-ln-item]");
      v && (i = document.importNode(v.content, !0));
    }
    let o = i ? i.querySelector("[data-ln-item]") || i.firstElementChild : null;
    if (o)
      Ie(o, r), _e(o, r);
    else if (r && r.html) {
      const v = document.createElement(this.isUl ? "ul" : "div");
      v.innerHTML = r.html, o = v.firstElementChild;
    } else if (o = document.createElement(this.isUl ? "li" : "div"), o.setAttribute("data-ln-item", ""), r && typeof r == "object") {
      for (const v in r)
        if (v !== "html" && r[v] != null) {
          const t = document.createElement("span");
          t.setAttribute("data-ln-field", v), t.textContent = String(r[v]), o.appendChild(t);
        }
    }
    if (o._lnRecord = r, r && r.id != null && (o.setAttribute("data-ln-item-id", r.id), this._selectable && this.selectedIds.has(String(r.id)))) {
      o.classList.add("ln-item-selected");
      const v = o.querySelector("[data-ln-item-select]");
      v && (v.checked = !0);
    }
    return o;
  }, M.prototype._restoreSelection = function() {
    if (!this.tbody) return;
    const r = this.tbody.querySelectorAll("[data-ln-item]");
    for (let i = 0; i < r.length; i++) {
      const o = r[i].getAttribute("data-ln-item-id"), v = o != null && this.selectedIds.has(String(o));
      r[i].classList.toggle("ln-item-selected", v);
      const t = r[i].querySelector("[data-ln-item-select]");
      t && (t.checked = v);
    }
    this._updateSelectAll();
  }, M.prototype._enableSelection = function() {
    if (this._selectableActive) return;
    this._selectableActive = !0;
    const r = this;
    this._onSelectionChange = function(i) {
      const o = i.target.closest("[data-ln-item-select]");
      if (!o) return;
      const v = o.closest("[data-ln-item]");
      if (!v) return;
      const t = v.getAttribute("data-ln-item-id");
      t != null && (o.checked ? (r.selectedIds.add(String(t)), v.classList.add("ln-item-selected")) : (r.selectedIds.delete(String(t)), v.classList.remove("ln-item-selected")), r._updateSelectAll(), r._updateFooter(), q(r.dom, "ln-list:select", {
        list: r.name,
        selectedIds: r.selectedIds,
        count: r.selectedIds.size
      }));
    }, this.tbody.addEventListener("change", this._onSelectionChange), this._selectAllCheckbox = this.dom.querySelector("[data-ln-list-select-all]"), this._selectAllCheckbox && (this._onSelectAll = function() {
      const i = r._selectAllCheckbox.checked, o = r.tbody.querySelectorAll("[data-ln-item]");
      for (let v = 0; v < o.length; v++) {
        const t = o[v], s = t.getAttribute("data-ln-item-id"), c = t.querySelector("[data-ln-item-select]");
        s != null && (i ? (r.selectedIds.add(String(s)), t.classList.add("ln-item-selected")) : (r.selectedIds.delete(String(s)), t.classList.remove("ln-item-selected")), c && (c.checked = i));
      }
      q(r.dom, "ln-list:select-all", { list: r.name, selected: i }), q(r.dom, "ln-list:select", {
        list: r.name,
        selectedIds: r.selectedIds,
        count: r.selectedIds.size
      }), r._updateFooter();
    }, this._selectAllCheckbox.addEventListener("change", this._onSelectAll));
  }, M.prototype._updateSelectAll = function() {
    if (!this._selectAllCheckbox) return;
    const r = this.tbody.querySelectorAll("[data-ln-item]");
    let i = r.length > 0;
    for (let o = 0; o < r.length; o++) {
      const v = r[o].getAttribute("data-ln-item-id");
      if (v != null && !this.selectedIds.has(String(v))) {
        i = !1;
        break;
      }
    }
    this._selectAllCheckbox.checked = i;
  }, M.prototype._requestData = function() {
    if (this._windowed) {
      this.dom.classList.add("ln-list--loading"), this._cache.invalidate({
        sort: this.currentSort,
        filters: this.currentFilters,
        search: this.currentSearch
      });
      return;
    }
    Et(this, "ln-list:request-data", "list");
  }, M.prototype._enterWindowedMode = function() {
    const r = this, i = this.dom, o = parseInt(i.getAttribute("data-ln-list-window"), 10), v = parseInt(i.getAttribute("data-ln-list-window-page"), 10), t = parseInt(i.getAttribute("data-ln-list-window-threshold"), 10);
    this._onCacheChange = function() {
      !r._windowed || !r._cache || (r.totalCount = r._cache.grandTotal, r.visibleCount = r._cache.logicalTotal, r._lastTotal = r._cache.grandTotal, r.isLoaded = !0, r._vStart = -1, r._vEnd = -1, r._render(), r._updateFooter(), q(i, "ln-list:rendered", {
        list: r.name,
        total: r.totalCount,
        visible: r.visibleCount
      }));
    }, this._renderBatch = it(this._onCacheChange), this._cache = Wt({
      windowSize: o > 0 ? o : 1e3,
      pageSize: v > 0 ? v : 200,
      threshold: t >= 0 ? t : 25,
      fetchDebounce: 120,
      requestPage: function(s, c, y) {
        q(i, "ln-list:request-data", {
          list: r.name,
          sort: s.sort,
          filters: s.filters,
          search: s.search,
          offset: c,
          limit: y,
          queryGen: r._cache.queryGen
        });
      },
      onChange: this._renderBatch
    }), this._windowed = !0, this._selectable && this._selectAllCheckbox && this._selectAllCheckbox.classList.add("hidden");
  }, M.prototype._kickWindowInitial = function() {
    if (this._data.length > 0) {
      const r = parseInt(this.dom.getAttribute("data-ln-list-count"), 10), i = r > 0 ? r : this._data.length;
      this._cache.ingest({
        data: this._data,
        offset: 0,
        total: i,
        filtered: i
      });
    } else
      this.dom.classList.add("ln-list--loading"), this._cache.requestInitial({
        sort: this.currentSort,
        filters: this.currentFilters,
        search: this.currentSearch
      });
  }, M.prototype._exitWindowedMode = function() {
    this._disableVirtualScroll(), this._cache && this._cache.destroy(), this._cache = null, this._windowed = !1, this._renderBatch = null, this._onCacheChange = null, this._selectAllCheckbox && this._selectAllCheckbox.classList.remove("hidden"), this._itemHeight = 0, this._vStart = -1, this._vEnd = -1, this._data = [], this._filteredData = [], this.dom.classList.add("ln-list--loading"), this._requestData();
  }, M.prototype._updateFooter = function() {
    let r = 0, i = 0;
    this.isDataDriven ? (r = this._lastTotal != null ? this._lastTotal : this._data.length, i = this.visibleCount) : (r = this._data.length, i = this._filteredData.length);
    const o = i < r;
    if (this._totalSpan && (this._totalSpan.textContent = x(r, this.dom)), this._filteredSpan && (this._filteredSpan.textContent = o ? x(i, this.dom) : ""), this._filteredWrap && this._filteredWrap.classList.toggle("hidden", !o), this._selectedSpan) {
      const v = this.selectedIds ? this.selectedIds.size : 0;
      this._selectedSpan.textContent = v > 0 ? x(v, this.dom) : "", this._selectedWrap && this._selectedWrap.classList.toggle("hidden", v === 0);
    }
  }, M.prototype.destroy = function() {
    this.dom[n] && (this._disableVirtualScroll(), this.dom.removeEventListener("ln-list:set-search", this._onSetSearch), this.dom.removeEventListener("ln-search:change", this._onSearchChange), this.dom.removeEventListener("ln-list:request-clear-filters", this._onRequestClearFilters), this.isDataDriven ? (this._cache && this._cache.destroy(), this.dom.removeEventListener("ln-list:set-data", this._onSetData), this.dom.removeEventListener("ln-list:set-loading", this._onSetLoading), this.dom.removeEventListener("ln-list:page-failed", this._onPageFailed), this.dom.removeEventListener("ln-list:request-revalidate", this._onRequestRevalidate), this.dom.removeEventListener("ln-list:request-invalidate", this._onRequestInvalidate), this.dom.removeEventListener("ln-sort:change", this._onSort), this.tbody && (this.tbody.removeEventListener("click", this._onItemClick), this.tbody.removeEventListener("click", this._onItemAction))) : (this._emptyObserver && (this._emptyObserver.disconnect(), this._emptyObserver = null), this._onFilterChange && this.dom.removeEventListener("ln-filter:change", this._onFilterChange), this._onSort && this.dom.removeEventListener("ln-sort:change", this._onSort)), this._onSelectionChange && this.tbody && this.tbody.removeEventListener("change", this._onSelectionChange), this._selectAllCheckbox && this._onSelectAll && this._selectAllCheckbox.removeEventListener("change", this._onSelectAll), this._data = [], this._filteredData = [], delete this.dom[n]);
  }, Z(e, n, M, "ln-list", {
    attributes: b
  });
})();
export {
  Ye as cloneTemplate,
  q as dispatch,
  _e as fill,
  Ie as fillTemplate,
  qt as registerDataMapper
};
