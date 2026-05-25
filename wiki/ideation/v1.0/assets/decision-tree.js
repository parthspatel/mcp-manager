// MCP Manager Ideation v1.0 — decision tree renderer
//
// Drop into any page:
//   <div data-tree-src="./data/foo-tree.json"></div>
//   <script type="module" src="../assets/decision-tree.js"></script>
//
// JSON shape (recursive):
//   {
//     "title": "Pick an isolation strategy",
//     "root": {
//       "question": "Need reproducible per-server toolchains?",
//       "branches": [
//         { "label": "Yes", "node": { "question": "...", "branches": [...] } },
//         { "label": "No",  "node": { "answer": "Use raw npx/uvx", "note": "...", "ref": "#cite-foo" } }
//       ]
//     }
//   }

export async function renderTree(container, dataOrUrl) {
  const data = typeof dataOrUrl === "string"
    ? await (await fetch(dataOrUrl)).json()
    : dataOrUrl;
  const root = document.createElement("div");
  root.className = "decision-tree";
  if (data.title) {
    const t = document.createElement("h4");
    t.style.marginTop = "0";
    t.textContent = data.title;
    root.appendChild(t);
  }
  root.appendChild(renderNode(data.root || data));
  container.replaceChildren(root);
}

function renderNode(node) {
  const wrap = document.createElement("div");
  wrap.className = "dt-node" + (node.answer ? " dt-answer" : "");

  if (node.question) {
    const q = document.createElement("div");
    q.className = "dt-q";
    q.textContent = node.question;
    wrap.appendChild(q);

    if (node.note) {
      const n = document.createElement("div");
      n.className = "dt-note";
      n.textContent = node.note;
      wrap.appendChild(n);
    }

    const children = document.createElement("div");
    children.className = "dt-children";
    (node.branches || []).forEach((b) => {
      const branchWrap = document.createElement("div");
      branchWrap.className = "dt-branch";
      const edge = document.createElement("div");
      edge.className = "dt-edge";
      edge.textContent = b.label || "—";
      branchWrap.appendChild(edge);
      branchWrap.appendChild(renderNode(b.node));
      children.appendChild(branchWrap);
    });
    wrap.appendChild(children);
  } else if (node.answer) {
    const a = document.createElement("div");
    a.className = "dt-q";
    a.textContent = "→ " + node.answer;
    wrap.appendChild(a);
    if (node.note) {
      const n = document.createElement("div");
      n.className = "dt-note";
      n.textContent = node.note;
      wrap.appendChild(n);
    }
    if (node.ref) {
      const r = document.createElement("a");
      r.href = node.ref;
      r.className = "evidence-link";
      r.textContent = "[evidence]";
      r.style.marginTop = "0.35rem";
      r.style.display = "inline-block";
      wrap.appendChild(r);
    }
  }

  return wrap;
}

export async function autoInit() {
  for (const el of document.querySelectorAll("[data-tree-src]")) {
    const src = el.getAttribute("data-tree-src");
    try {
      await renderTree(el, src);
    } catch (e) {
      const p = document.createElement("p");
      p.style.color = "var(--danger)";
      p.textContent = `Failed to load decision tree from ${src}: ${e.message}`;
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
