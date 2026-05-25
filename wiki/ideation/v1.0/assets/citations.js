// MCP Manager Ideation v1.0 — citation registry + tooltips + footnote section
//
// Page setup:
//   <body data-citations="./data/citations.json">
//     ...
//     <main>...</main>
//     <script type="module" src="../assets/citations.js"></script>
//   </body>
//
// In prose: <cite data-ref="mcp-spec-2025-06"></cite>
//
// citations.json shape:
//   {
//     "entries": [
//       {
//         "id": "mcp-spec-2025-06",
//         "title": "Model Context Protocol Specification",
//         "url": "https://modelcontextprotocol.io/specification/2025-06-18/",
//         "accessed": "2026-05-24",
//         "note": "optional context for the source"
//       }
//     ]
//   }

let cache = null;

async function load(url) {
  if (cache) return cache;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    cache = await r.json();
  } catch (e) {
    console.warn("[citations] failed to load", url, e);
    cache = { entries: [] };
  }
  return cache;
}

function findEntry(id) {
  return cache?.entries?.find((e) => e.id === id) ?? null;
}

let tooltipEl = null;
function ensureTooltip() {
  if (tooltipEl) return tooltipEl;
  tooltipEl = document.createElement("div");
  tooltipEl.className = "citation-tooltip";
  tooltipEl.setAttribute("role", "tooltip");
  document.body.appendChild(tooltipEl);
  return tooltipEl;
}

function showTooltip(targetEl, entry) {
  const tip = ensureTooltip();

  const title = document.createElement("div");
  title.className = "citation-title";
  title.textContent = entry.title;

  const srcDiv = document.createElement("div");
  srcDiv.className = "src";
  const link = document.createElement("a");
  link.href = entry.url;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = entry.url;
  srcDiv.appendChild(link);

  const parts = [title, srcDiv];
  if (entry.note) {
    const noteDiv = document.createElement("div");
    noteDiv.className = "src";
    noteDiv.textContent = entry.note;
    parts.push(noteDiv);
  }
  tip.replaceChildren(...parts);

  tip.style.display = "block";
  const r = targetEl.getBoundingClientRect();
  const top = window.scrollY + r.bottom + 6;
  const tipW = 380;
  const left = Math.min(
    window.scrollX + r.left,
    window.scrollX + window.innerWidth - tipW - 10
  );
  tip.style.top = top + "px";
  tip.style.left = Math.max(window.scrollX + 10, left) + "px";
  tip.style.pointerEvents = "auto";
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.style.display = "none";
}

function buildFootnoteItem(id, e) {
  const li = document.createElement("li");
  li.id = `cite-${cssEscape(id)}`;

  const titleSpan = document.createElement("span");
  titleSpan.className = "citation-title";
  titleSpan.textContent = e.title;
  li.appendChild(titleSpan);

  li.appendChild(document.createTextNode(" — "));

  const a = document.createElement("a");
  a.href = e.url;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = e.url;
  li.appendChild(a);

  if (e.accessed) {
    const span = document.createElement("span");
    span.style.color = "var(--fg-faint)";
    span.textContent = ` (accessed ${e.accessed})`;
    li.appendChild(span);
  }
  if (e.note) {
    const nd = document.createElement("div");
    nd.style.color = "var(--fg-muted)";
    nd.style.fontSize = "0.85em";
    nd.style.marginTop = "0.15rem";
    nd.textContent = e.note;
    li.appendChild(nd);
  }
  return li;
}

export async function init() {
  const url = document.body.getAttribute("data-citations");
  if (!url) return;
  await load(url);

  const refs = document.querySelectorAll("cite[data-ref]");
  const usedOrder = [];

  refs.forEach((el) => {
    const id = el.getAttribute("data-ref");
    const entry = findEntry(id);
    if (!entry) {
      const span = document.createElement("span");
      span.className = "citation-ref";
      span.style.color = "var(--danger)";
      span.textContent = `[?:${id}]`;
      span.title = `Unknown citation id "${id}". Add it to citations.json.`;
      el.replaceWith(span);
      return;
    }
    if (!usedOrder.includes(id)) usedOrder.push(id);
    const num = usedOrder.indexOf(id) + 1;
    const a = document.createElement("a");
    a.className = "citation-ref";
    a.href = `#cite-${cssEscape(id)}`;
    a.textContent = `[${num}]`;
    a.setAttribute("aria-describedby", `cite-${id}`);
    a.addEventListener("mouseenter", () => showTooltip(a, entry));
    a.addEventListener("mouseleave", hideTooltip);
    a.addEventListener("focus", () => showTooltip(a, entry));
    a.addEventListener("blur", hideTooltip);
    el.replaceWith(a);
  });

  if (!usedOrder.length) return;

  let section = document.getElementById("citations");
  if (!section) {
    section = document.createElement("section");
    section.id = "citations";
    (document.querySelector("main") || document.body).appendChild(section);
  }
  const h2 = document.createElement("h2");
  h2.textContent = "Citations";
  const ol = document.createElement("ol");
  usedOrder.forEach((id) => {
    const e = findEntry(id);
    ol.appendChild(buildFootnoteItem(id, e));
  });
  section.replaceChildren(h2, ol);
}

function cssEscape(s) { return String(s).replace(/[^a-zA-Z0-9_-]/g, "_"); }

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
