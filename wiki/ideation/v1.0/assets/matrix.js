// MCP Manager Ideation v1.0 — interactive ranking matrix
//
// Drop into any page:
//   <div data-matrix-src="./data/foo-ranking.json"></div>
//   <script type="module" src="../assets/matrix.js"></script>
//
// JSON shape:
//   {
//     "title": "optional title",
//     "options": ["Option A", "Option B"],
//     "criteria": [
//       { "key": "isolation", "label": "Isolation strength", "weight": 0.3 }
//     ],
//     "scores": {
//       "Option A": {
//         "isolation": 4,
//         "_evidence": { "isolation": ["#cite-mcp-spec", "#cite-nix-manual"] }
//       }
//     }
//   }
//
// Scores are 0–5 by convention but the widget tolerates any non-negative number.

export async function renderMatrix(container, dataOrUrl) {
  const data = typeof dataOrUrl === "string"
    ? await (await fetch(dataOrUrl)).json()
    : dataOrUrl;

  const defaultWeights = Object.fromEntries(
    data.criteria.map((c) => [c.key, c.weight ?? (1 / data.criteria.length)])
  );
  const state = { weights: { ...defaultWeights } };

  const root = document.createElement("div");
  root.className = "matrix-wrapper";

  const controls = document.createElement("div");
  controls.className = "matrix-controls";

  data.criteria.forEach((c) => {
    const label = document.createElement("label");
    label.dataset.key = c.key;
    const span = document.createElement("span");
    span.textContent = c.label;
    const range = document.createElement("input");
    range.type = "range";
    range.min = "0";
    range.max = "100";
    range.step = "1";
    range.value = String(Math.round(state.weights[c.key] * 100));
    range.setAttribute("aria-label", `Weight for ${c.label}`);
    const val = document.createElement("span");
    val.className = "weight-value";
    val.textContent = `${range.value}%`;
    range.addEventListener("input", () => {
      val.textContent = `${range.value}%`;
      state.weights[c.key] = Number(range.value) / 100;
      redraw();
    });
    label.append(span, range, val);
    controls.appendChild(label);
  });

  const reset = document.createElement("button");
  reset.className = "reset";
  reset.type = "button";
  reset.textContent = "Reset weights";
  reset.addEventListener("click", () => {
    data.criteria.forEach((c) => {
      state.weights[c.key] = defaultWeights[c.key];
      const lbl = controls.querySelector(`label[data-key="${CSS.escape(c.key)}"]`);
      const range = lbl?.querySelector("input[type=range]");
      const val = lbl?.querySelector(".weight-value");
      if (range) {
        range.value = String(Math.round(defaultWeights[c.key] * 100));
        if (val) val.textContent = `${range.value}%`;
      }
    });
    redraw();
  });
  controls.appendChild(reset);
  root.appendChild(controls);

  const tableWrap = document.createElement("div");
  tableWrap.style.overflowX = "auto";
  const table = document.createElement("table");
  table.className = "matrix";
  const thead = document.createElement("thead");
  thead.appendChild(buildHeader(data, state));
  const tbody = document.createElement("tbody");
  table.append(thead, tbody);
  tableWrap.appendChild(table);
  root.appendChild(tableWrap);

  function score(opt) {
    let total = 0;
    let wsum = 0;
    for (const c of data.criteria) {
      const s = data.scores?.[opt]?.[c.key] ?? 0;
      total += Number(s) * state.weights[c.key];
      wsum += state.weights[c.key];
    }
    return wsum > 0 ? total / wsum : 0;
  }

  function redraw() {
    const ths = thead.querySelectorAll("th");
    data.criteria.forEach((c, i) => {
      const th = ths[i + 1];
      if (th) th.title = `weight ${(state.weights[c.key] * 100).toFixed(0)}%`;
    });
    const ranked = data.options.slice().sort((a, b) => score(b) - score(a));
    const maxTotal = Math.max(...ranked.map(score), 0.0001);
    const rows = ranked.map((opt, idx) => buildRow(opt, idx, score(opt), maxTotal, data));
    tbody.replaceChildren(...rows);
  }

  redraw();
  container.replaceChildren();
  if (data.title) {
    const title = document.createElement("p");
    title.style.color = "var(--fg-muted)";
    title.style.fontSize = "0.9rem";
    title.style.margin = "0 0 0.5rem";
    title.textContent = data.title;
    container.appendChild(title);
  }
  container.appendChild(root);
}

function buildHeader(data, state) {
  const tr = document.createElement("tr");
  const th0 = document.createElement("th");
  th0.textContent = "Option";
  tr.appendChild(th0);
  data.criteria.forEach((c) => {
    const th = document.createElement("th");
    th.textContent = c.label;
    th.title = `weight ${(state.weights[c.key] * 100).toFixed(0)}%`;
    tr.appendChild(th);
  });
  const totalTh = document.createElement("th");
  totalTh.textContent = "Score";
  tr.appendChild(totalTh);
  return tr;
}

function buildRow(opt, idx, total, maxTotal, data) {
  const tr = document.createElement("tr");
  if (idx === 0) tr.classList.add("top-rank");

  const nameTd = document.createElement("td");
  nameTd.className = "option-name";
  nameTd.textContent = opt;
  tr.appendChild(nameTd);

  data.criteria.forEach((c) => {
    const td = document.createElement("td");
    td.className = "score-cell";
    const s = data.scores?.[opt]?.[c.key];
    td.textContent = s == null ? "—" : String(s);
    const ev = data.scores?.[opt]?._evidence?.[c.key] ?? [];
    ev.forEach((ref, i) => {
      td.appendChild(document.createTextNode(" "));
      const a = document.createElement("a");
      a.className = "evidence-link";
      a.href = ref;
      a.title = `evidence ${i + 1}`;
      a.textContent = `[${i + 1}]`;
      td.appendChild(a);
    });
    tr.appendChild(td);
  });

  const totalTd = document.createElement("td");
  totalTd.className = "total-cell";
  totalTd.textContent = total.toFixed(2);
  const bar = document.createElement("span");
  bar.className = "score-bar";
  const barFill = document.createElement("span");
  barFill.style.width = `${(total / maxTotal * 100).toFixed(0)}%`;
  bar.appendChild(barFill);
  totalTd.appendChild(bar);
  tr.appendChild(totalTd);

  return tr;
}

export async function autoInit() {
  for (const el of document.querySelectorAll("[data-matrix-src]")) {
    const src = el.getAttribute("data-matrix-src");
    try {
      await renderMatrix(el, src);
    } catch (e) {
      const p = document.createElement("p");
      p.style.color = "var(--danger)";
      p.textContent = `Failed to load matrix from ${src}: ${e.message}`;
      el.replaceChildren(p);
    }
  }
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }
}
