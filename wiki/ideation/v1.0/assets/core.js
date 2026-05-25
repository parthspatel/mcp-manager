// MCP Manager Ideation v1.0 — core UI behaviors.
// Loaded by every page (`<script type="module" src="./assets/core.js">`).
// Provides: theme toggle, tab/accordion controllers, site-wide sidebar.
//
// Why one file? Cross-file `import` statements between ES modules trigger
// CORS checks, which `file://` URLs cannot satisfy (every file:// URL is
// treated as a null origin). Keeping everything in a single module — no
// `import` statements — means the wiki opens correctly either via a static
// web server OR by double-clicking an HTML file straight from the disk.

// ─── Theme toggle ─────────────────────────────────────────────────────────

const THEME_KEY = "mcp-ideation-theme";

function applyTheme(theme) {
  if (theme === "dark" || theme === "light") {
    document.documentElement.setAttribute("data-theme", theme);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

function getStoredTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch { return null; }
}

function setStoredTheme(theme) {
  try {
    if (theme) localStorage.setItem(THEME_KEY, theme);
    else localStorage.removeItem(THEME_KEY);
  } catch { /* private mode etc */ }
}

function updateThemeLabel(btn) {
  const cur = document.documentElement.getAttribute("data-theme") || "auto";
  const labels = { dark: "🌙 Dark", light: "☀ Light", auto: "● Auto" };
  btn.textContent = labels[cur] || labels.auto;
  btn.setAttribute("aria-label", `Theme: ${cur}. Click to cycle.`);
}

function initTheme() {
  applyTheme(getStoredTheme());
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme");
      const next = cur === "dark" ? "light" : cur === "light" ? null : "dark";
      applyTheme(next);
      setStoredTheme(next);
      updateThemeLabel(btn);
    });
    updateThemeLabel(btn);
  });
}

// ─── Tabs ─────────────────────────────────────────────────────────────────

function initTabs() {
  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const list = root.querySelector(".tab-list");
    const panels = root.querySelectorAll(".tab-panel");
    if (!list) return;
    const btns = list.querySelectorAll(".tab-btn");
    const select = (idx) => {
      btns.forEach((b, i) => b.setAttribute("aria-selected", i === idx ? "true" : "false"));
      panels.forEach((p, i) => p.setAttribute("aria-hidden", i === idx ? "false" : "true"));
    };
    btns.forEach((b, i) => b.addEventListener("click", () => select(i)));
    const initial = Math.max(0, [...btns].findIndex((b) => b.getAttribute("aria-selected") === "true"));
    select(initial === -1 ? 0 : initial);
  });
}

// ─── Site-wide sidebar ────────────────────────────────────────────────────
// Single source of truth for the page list; no per-page HTML patches needed.

const SIDEBAR_STREAMS = [
  {
    id: "curious-otter-survey",
    n: 1,
    title: "MCP config landscape",
    pages: [
      { path: "index.html", label: "Stream overview", kind: "index" },
      { path: "research-mcp-config-landscape.html", label: "Landscape", kind: "research" },
      { path: "research-mcp-config-schema.html", label: "Schemas", kind: "research" },
      { path: "research-mcp-config-secrets.html", label: "Secrets", kind: "research" },
      { path: "research-mcp-config-transports.html", label: "Transports", kind: "research" },
      { path: "research-mcp-config-painpoints.html", label: "Pain points", kind: "research" },
      { path: "analysis-mcp-config-tradeoffs.html", label: "Tradeoffs", kind: "analysis" },
      { path: "matrix-mcp-config-ranking.html", label: "Ranking matrix", kind: "matrix" },
      { path: "recommendation-mcp-config-summary.html", label: "Recommendation", kind: "recommendation" },
    ],
  },
  {
    id: "stoic-badger-sandbox",
    n: 2,
    title: "Nix isolation",
    pages: [
      { path: "index.html", label: "Stream overview", kind: "index" },
      { path: "research-nix-isolation-primer.html", label: "Primer", kind: "research" },
      { path: "research-nix-isolation-runtime.html", label: "Runtime", kind: "research" },
      { path: "research-nix-isolation-per-server.html", label: "Per-server", kind: "research" },
      { path: "research-nix-isolation-secrets.html", label: "Secrets", kind: "research" },
      { path: "research-nix-isolation-escape-hatch.html", label: "Escape hatch", kind: "research" },
      { path: "analysis-nix-isolation-tradeoffs.html", label: "Tradeoffs", kind: "analysis" },
      { path: "matrix-nix-isolation-ranking.html", label: "Ranking matrix", kind: "matrix" },
      { path: "recommendation-nix-isolation-summary.html", label: "Recommendation", kind: "recommendation" },
    ],
  },
  {
    id: "steady-bear-foundation",
    n: 3,
    title: "Core architecture",
    pages: [
      { path: "index.html", label: "Stream overview", kind: "index" },
      { path: "research-core-architecture-daemon-vs-library.html", label: "Daemon vs library", kind: "research" },
      { path: "research-core-architecture-runtime.html", label: "Runtime", kind: "research" },
      { path: "research-core-architecture-state.html", label: "State", kind: "research" },
      { path: "research-core-architecture-transports.html", label: "Transports", kind: "research" },
      { path: "research-core-architecture-prior-art.html", label: "Prior art", kind: "research" },
      { path: "analysis-core-architecture-tradeoffs.html", label: "Tradeoffs", kind: "analysis" },
      { path: "matrix-core-architecture-ranking.html", label: "Ranking matrix", kind: "matrix" },
      { path: "recommendation-core-architecture-summary.html", label: "Recommendation", kind: "recommendation" },
    ],
  },
  {
    id: "precise-crane-conduit",
    n: 4,
    title: "Client API",
    pages: [
      { path: "index.html", label: "Stream overview", kind: "index" },
      { path: "research-client-api-surface.html", label: "Surface", kind: "research" },
      { path: "research-client-api-ipc.html", label: "IPC", kind: "research" },
      { path: "research-client-api-auth.html", label: "Auth", kind: "research" },
      { path: "research-client-api-streaming.html", label: "Streaming", kind: "research" },
      { path: "research-client-api-versioning.html", label: "Versioning", kind: "research" },
      { path: "analysis-client-api-tradeoffs.html", label: "Tradeoffs", kind: "analysis" },
      { path: "matrix-client-api-ranking.html", label: "Ranking matrix", kind: "matrix" },
      { path: "recommendation-client-api-summary.html", label: "Recommendation", kind: "recommendation" },
    ],
  },
  {
    id: "nimble-raven-toolkit",
    n: 5,
    title: "Client tooling",
    pages: [
      { path: "index.html", label: "Stream overview", kind: "index" },
      { path: "research-client-tools-cli.html", label: "CLI", kind: "research" },
      { path: "research-client-tools-tui.html", label: "TUI", kind: "research" },
      { path: "research-client-tools-gui.html", label: "GUI", kind: "research" },
      { path: "research-client-tools-shared.html", label: "Shared crate", kind: "research" },
      { path: "analysis-client-tools-tradeoffs.html", label: "Tradeoffs", kind: "analysis" },
      { path: "matrix-client-tools-ranking.html", label: "Ranking matrix", kind: "matrix" },
      { path: "recommendation-client-tools-summary.html", label: "Recommendation", kind: "recommendation" },
    ],
  },
  {
    id: "clever-fox-bridge",
    n: 6,
    title: "Toolchain projection",
    pages: [
      { path: "index.html", label: "Stream overview", kind: "index" },
      { path: "research-toolchain-known-clients.html", label: "Known clients", kind: "research" },
      { path: "research-toolchain-projection.html", label: "Projection", kind: "research" },
      { path: "research-toolchain-sync-modes.html", label: "Sync modes", kind: "research" },
      { path: "research-toolchain-discovery.html", label: "Discovery", kind: "research" },
      { path: "analysis-toolchain-tradeoffs.html", label: "Tradeoffs", kind: "analysis" },
      { path: "matrix-toolchain-sync-strategy.html", label: "Sync matrix", kind: "matrix" },
      { path: "recommendation-toolchain-summary.html", label: "Recommendation", kind: "recommendation" },
    ],
  },
  {
    id: "ui-shootout",
    n: 7,
    title: "GUI shootout (deferred)",
    pages: [
      { path: "index.html", label: "Shootout hub", kind: "index" },
      { path: "matrix-shootout.html", label: "Ranking matrix", kind: "matrix" },
      { path: "actix-tera/index.html", label: "Actix + Askama · overview", kind: "index" },
      { path: "actix-tera/research-stack.html", label: "Actix · stack", kind: "research" },
      { path: "actix-tera/research-mcp-manager-fit.html", label: "Actix · fit", kind: "research" },
      { path: "actix-tera/recommendation-actix-tera-summary.html", label: "Actix · recommendation", kind: "recommendation" },
      { path: "tauri-dioxus/index.html", label: "Dioxus · overview", kind: "index" },
      { path: "tauri-dioxus/research-stack.html", label: "Dioxus · stack", kind: "research" },
      { path: "tauri-dioxus/research-mcp-manager-fit.html", label: "Dioxus · fit", kind: "research" },
      { path: "tauri-dioxus/recommendation-tauri-dioxus-summary.html", label: "Dioxus · recommendation", kind: "recommendation" },
      { path: "tauri-leptos/index.html", label: "Leptos · overview", kind: "index" },
      { path: "tauri-leptos/research-stack.html", label: "Leptos · stack", kind: "research" },
      { path: "tauri-leptos/research-mcp-manager-fit.html", label: "Leptos · fit", kind: "research" },
      { path: "tauri-leptos/recommendation-tauri-leptos-summary.html", label: "Leptos · recommendation", kind: "recommendation" },
    ],
  },
  {
    id: "closing-gaps",
    n: 8,
    title: "Closing v1.0 gaps",
    pages: [
      { path: "index.html", label: "Closing-gaps hub", kind: "index" },
      { path: "server-registry/index.html", label: "Server registry · overview", kind: "index" },
      { path: "server-registry/research-mcp-registry-landscape.html", label: "Registry · landscape", kind: "research" },
      { path: "server-registry/analysis-registry-strategies-tradeoffs.html", label: "Registry · tradeoffs", kind: "analysis" },
      { path: "server-registry/recommendation-server-registry-summary.html", label: "Registry · recommendation", kind: "recommendation" },
      { path: "onboarding/index.html", label: "Onboarding · overview", kind: "index" },
      { path: "onboarding/research-onboarding-prior-art.html", label: "Onboarding · prior art", kind: "research" },
      { path: "onboarding/recommendation-onboarding-flow-summary.html", label: "Onboarding · recommendation", kind: "recommendation" },
      { path: "secrets-lifecycle/index.html", label: "Secrets · overview", kind: "index" },
      { path: "secrets-lifecycle/research-secrets-prior-art.html", label: "Secrets · prior art", kind: "research" },
      { path: "secrets-lifecycle/recommendation-secrets-summary.html", label: "Secrets · recommendation", kind: "recommendation" },
      { path: "version-management/index.html", label: "Versioning · overview", kind: "index" },
      { path: "version-management/research-versioning-prior-art.html", label: "Versioning · prior art", kind: "research" },
      { path: "version-management/analysis-versioning-tradeoffs.html", label: "Versioning · tradeoffs", kind: "analysis" },
      { path: "version-management/recommendation-versioning-summary.html", label: "Versioning · recommendation", kind: "recommendation" },
    ],
  },
];

const SIDEBAR_STREAM_IDS = new Set(SIDEBAR_STREAMS.map((s) => s.id));
const SIDEBAR_OPEN_KEY = "mcp-ideation-sidebar-open-streams";
const SIDEBAR_KIND_BADGE = {
  index: "·",
  research: "R",
  analysis: "A",
  matrix: "M",
  recommendation: "★",
};

// Determine page location from URL. Robust to file://, served root, trailing
// slash, and ANY depth of nesting (v1.0 root, research subdir, stream dir,
// nested-stream dir). The prefix is what every sidebar link is prepended with
// so paths resolve from any depth.
//
// Layout assumed:
//   v1.0/index.html                                  (root hub — isV1Root)
//   v1.0/future-features-v1.1.html                   (root)
//   v1.0/{product-overview,technical-design,ux-design}.html  (root, future)
//   v1.0/research/index.html                         (research hub)
//   v1.0/research/<stream>/<file>.html               (stream pages)
//   v1.0/research/<stream>/<sub>/<file>.html         (nested stream pages)
function computeSidebarLocation() {
  const path = location.pathname.replace(/\/$/, "/index.html");
  const segments = path.split("/").filter(Boolean);
  const file = segments[segments.length - 1] || "index.html";
  // Relative path from v1.0 root: e.g. "research/curious-otter-survey/foo.html"
  const relativeFromV1 = segments.join("/");

  // Find the first segment that matches a known stream id. Works whether
  // streams live at v1.0/<stream>/ (legacy) or v1.0/research/<stream>/ (current).
  let streamId = null;
  let streamIdx = -1;
  for (let i = 0; i < segments.length; i++) {
    if (SIDEBAR_STREAM_IDS.has(segments[i])) {
      streamId = segments[i];
      streamIdx = i;
      break;
    }
  }

  // isV1Root: we're at the v1.0 root level (one segment, the filename only).
  // Distinct from "no stream" — research/index.html has no stream but IS NOT root.
  const isV1Root = segments.length === 1;

  // Path from the stream's root to the current page, e.g.:
  //   research/curious-otter-survey/research-foo.html → "research-foo.html"
  //   research/ui-shootout/tauri-leptos/foo.html → "tauri-leptos/foo.html"
  const pathWithinStream = streamId !== null
    ? segments.slice(streamIdx + 1).join("/")
    : null;

  // "../" prefix needed to reach v1.0 root from current page.
  // Simply: one "../" per subdirectory between this file and the root.
  //   v1.0/index.html                      → segments.length=1 → 0 levels deep → "./"
  //   v1.0/research/index.html             → segments.length=2 → 1 level deep  → "../"
  //   v1.0/research/<stream>/foo.html      → segments.length=3 → 2 levels deep → "../../"
  //   v1.0/research/<stream>/<sub>/foo.html→ segments.length=4 → 3 levels deep → "../../../"
  const depthBelowRoot = segments.length - 1;
  const prefix = depthBelowRoot === 0 ? "./" : "../".repeat(depthBelowRoot);

  // isHub kept for backward-compat: true when at the v1.0 root.
  const isHub = isV1Root;

  return { file, relativeFromV1, streamId, pathWithinStream, isHub, isV1Root, prefix };
}

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    if (k === "class") node.className = v;
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === "open" && v === true) {
      node.setAttribute("open", "");
    } else {
      node.setAttribute(k, v);
    }
  }
  for (const c of children) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

function getSidebarOpenStreams() {
  try {
    const raw = localStorage.getItem(SIDEBAR_OPEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function setSidebarOpenStreams(set) {
  try {
    localStorage.setItem(SIDEBAR_OPEN_KEY, JSON.stringify([...set]));
  } catch { /* private mode: ignore */ }
}

function buildSidebarHubLink(loc) {
  const active = loc.isHub && loc.file === "index.html";
  return el(
    "a",
    {
      href: loc.prefix + "index.html",
      class: "sidebar-link sidebar-hub-link" + (active ? " is-active" : ""),
      "aria-current": active ? "page" : null,
    },
    [
      el("span", { class: "sidebar-link-badge kind-index", "aria-hidden": "true" }, ["⌂"]),
      el("span", { class: "sidebar-link-label" }, ["Synthesis hub"]),
    ]
  );
}

function buildSidebarFutureLink(loc) {
  const active = loc.isHub && loc.file === "future-features-v1.1.html";
  return el(
    "a",
    {
      href: loc.prefix + "future-features-v1.1.html",
      class: "sidebar-link sidebar-hub-link" + (active ? " is-active" : ""),
      "aria-current": active ? "page" : null,
      title: "Features deferred from v1.0",
    },
    [
      el("span", { class: "sidebar-link-badge kind-index", "aria-hidden": "true" }, ["»"]),
      el("span", { class: "sidebar-link-label" }, ["Future (v1.1)"]),
    ]
  );
}

function buildSidebarResearchHubLink(loc) {
  const active = loc.relativeFromV1 === "research/index.html";
  return el(
    "a",
    {
      href: loc.prefix + "research/index.html",
      class: "sidebar-link sidebar-hub-link" + (active ? " is-active" : ""),
      "aria-current": active ? "page" : null,
      title: "Product-research hub — streams, shootout, closing-gaps, UX exercise",
    },
    [
      el("span", { class: "sidebar-link-badge kind-research", "aria-hidden": "true" }, ["R"]),
      el("span", { class: "sidebar-link-label" }, ["Research"]),
    ]
  );
}

function buildSidebarStreamSection(stream, loc, storedOpen) {
  const isCurrentStream = loc.streamId === stream.id;

  const summary = el("summary", { class: "sidebar-stream-summary" }, [
    el("span", { class: `sidebar-stream-pill stream-${stream.n}` }, [`S${stream.n}`]),
    el("span", { class: "sidebar-stream-title" }, [stream.title]),
  ]);

  const pageList = el("ul", { class: "sidebar-pagelist" });
  for (const page of stream.pages) {
    // Compare full path-within-stream so nested entries (e.g.
    // ui-shootout/tauri-leptos/foo.html) activate on the correct page.
    const active = isCurrentStream && loc.pathWithinStream === page.path;
    const link = el(
      "a",
      {
        // Streams live under research/. prefix takes us to v1.0 root; then
        // research/<stream>/<page-path-within-stream>.
        href: loc.prefix + "research/" + stream.id + "/" + page.path,
        class:
          "sidebar-link sidebar-pagelink kind-" + page.kind + (active ? " is-active" : ""),
        "aria-current": active ? "page" : null,
        title: stream.id + " · " + page.label,
      },
      [
        el(
          "span",
          { class: "sidebar-link-badge kind-" + page.kind, "aria-hidden": "true" },
          [SIDEBAR_KIND_BADGE[page.kind] || "·"]
        ),
        el("span", { class: "sidebar-link-label" }, [page.label]),
      ]
    );
    pageList.appendChild(el("li", {}, [link]));
  }

  // Default: open if current stream OR previously opened. First-time
  // visitor (no stored state) sees all streams open to scan the structure.
  const isOpen = isCurrentStream || (storedOpen ? storedOpen.has(stream.id) : true);

  const details = el(
    "details",
    {
      class: "sidebar-stream" + (isCurrentStream ? " is-current" : ""),
      "data-stream": stream.id,
      open: isOpen,
    },
    [summary, pageList]
  );

  return { details, isOpen };
}

function buildSidebar(loc) {
  const sidebar = el("aside", {
    id: "site-sidebar",
    class: "sidebar",
    "aria-label": "Ideation pages",
  });

  sidebar.appendChild(
    el("div", { class: "sidebar-header" }, [
      el(
        "a",
        {
          href: loc.prefix + "index.html",
          class: "sidebar-brand",
          "aria-label": "Synthesis hub",
        },
        [
          el("strong", {}, ["MCP Manager"]),
          el("span", { class: "sidebar-brand-sub" }, ["ideation · v1.0"]),
        ]
      ),
    ])
  );

  sidebar.appendChild(
    el("div", { class: "sidebar-hub-section" }, [
      buildSidebarHubLink(loc),
      buildSidebarResearchHubLink(loc),
      buildSidebarFutureLink(loc),
    ])
  );

  const nav = el("nav", { class: "sidebar-nav", "aria-label": "Streams" });
  const storedOpen = getSidebarOpenStreams();
  const openSet = new Set();

  for (const stream of SIDEBAR_STREAMS) {
    const { details, isOpen } = buildSidebarStreamSection(stream, loc, storedOpen);
    if (isOpen) openSet.add(stream.id);
    details.addEventListener("toggle", () => {
      if (details.open) openSet.add(stream.id);
      else openSet.delete(stream.id);
      setSidebarOpenStreams(openSet);
    });
    nav.appendChild(details);
  }
  sidebar.appendChild(nav);

  sidebar.appendChild(
    el("div", { class: "sidebar-footer" }, [
      el("span", {}, ["53 pages · 266 citations"]),
    ])
  );

  return sidebar;
}

function initSidebar() {
  if (document.getElementById("site-sidebar")) return;

  const loc = computeSidebarLocation();

  const toggle = el(
    "button",
    {
      class: "sidebar-toggle",
      type: "button",
      "aria-label": "Toggle navigation",
      "aria-expanded": "false",
      "aria-controls": "site-sidebar",
    },
    [el("span", { class: "sidebar-toggle-icon", "aria-hidden": "true" }, ["☰"])]
  );

  const backdrop = el("div", { class: "sidebar-backdrop", "aria-hidden": "true" });
  const sidebar = buildSidebar(loc);

  const setOpen = (open) => {
    document.body.classList.toggle("sidebar-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };
  toggle.addEventListener("click", () => {
    setOpen(!document.body.classList.contains("sidebar-open"));
  });
  backdrop.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("sidebar-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.body.classList.add("has-sidebar");
  document.body.insertBefore(backdrop, document.body.firstChild);
  document.body.insertBefore(sidebar, document.body.firstChild);
  document.body.insertBefore(toggle, document.body.firstChild);

  // Scroll active link into view if outside the visible sidebar region.
  const activeLink = sidebar.querySelector(".is-active");
  if (activeLink) {
    const scrollIfNeeded = () => {
      const rect = activeLink.getBoundingClientRect();
      const sbRect = sidebar.getBoundingClientRect();
      if (rect.top < sbRect.top || rect.bottom > sbRect.bottom) {
        activeLink.scrollIntoView({ block: "center", behavior: "instant" });
      }
    };
    if (window.requestIdleCallback) requestIdleCallback(scrollIfNeeded);
    else setTimeout(scrollIfNeeded, 0);
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────

function init() {
  initTheme();
  initTabs();
  initSidebar();
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
