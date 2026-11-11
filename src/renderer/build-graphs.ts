// The plan screen's build graphs (one collapsible panel per namespace, below
// the plan sections). They paint from vm.buildGraph's laid-out models
// (src/build-graph.ts derives and lays out; this only paints). The canvas
// rebuilds only when the graph's structure changed (reconcile's diff — nodes
// and edges are dynamic content, same exception as the plan entries);
// everything else — counts, done/suppressed, positions, edge paths, the focus
// highlight — repaints in place, found by each node's data-id and each edge's
// stamped endpoints. Internal to the renderer facade.
import { BUILD_GRAPH_METRICS, BUILD_GRAPH_ROWS } from '../build-graph';
import { emitAction } from './seam';
import { reconcile } from './reconcile';
import { icon } from './dom';
import type { ViewModel } from '../view-state';

interface GraphSectionEls {
  section: HTMLElement;
  toggle: HTMLButtonElement;
  empty: HTMLElement;
  cols: HTMLElement;
  canvas: HTMLElement;
  svg: SVGSVGElement;
}

let graphEls: { balls: GraphSectionEls; passives: GraphSectionEls } | null = null;

const GRAPH_EMPTY_HINTS = {
  balls: 'Balls or fused pairs in your plan will show every step to build them here.',
  passives: 'Passives in your plan will show every step to build them here.',
} as const;

const GRAPH_TITLES = { balls: 'Ball build graph', passives: 'Passive build graph' } as const;

/** Append the two graph panels below the plan sections and bind their
 *  collapse toggles through the build seam. */
export function buildBuildGraphs() {
  const root = document.getElementById('planView')!;
  root.insertAdjacentHTML('beforeend', (['balls', 'passives'] as const).map((ns) => `
      <section class="plan-graph" data-graph="${ns}">
        <button class="plan-graph-toggle" type="button" aria-expanded="true">
          <span class="plan-graph-title">${GRAPH_TITLES[ns]}</span>
          <span class="plan-graph-caret" aria-hidden="true">▾</span>
        </button>
        <div class="plan-graph-body">
          <p class="plan-graph-empty">${GRAPH_EMPTY_HINTS[ns]}</p>
          <div class="plan-graph-cols">
            <div class="plan-graph-rowlabels" aria-hidden="true">
              ${BUILD_GRAPH_ROWS[ns].labels.map((l) => `<span class="plan-graph-rowlabel" style="height:${BUILD_GRAPH_METRICS.rowH}px">${l}</span>`).join('')}
            </div>
            <div class="plan-graph-scroll"><div class="plan-graph-canvas"><svg class="plan-graph-edges" aria-hidden="true"></svg></div></div>
          </div>
        </div>
      </section>`).join(''));
  const q = (s: string) => root.querySelector(s)!;
  const graphSection = (ns: 'balls' | 'passives'): GraphSectionEls => {
    const el = q(`.plan-graph[data-graph="${ns}"]`);
    const toggle = el.querySelector('.plan-graph-toggle') as HTMLButtonElement;
    // the collapse toggle reports through the build seam like every other
    // built-in click handler
    toggle.addEventListener('click', () => emitAction({ type: 'toggleGraphCollapse', which: ns }));
    return {
      section: el as HTMLElement,
      toggle,
      empty: el.querySelector('.plan-graph-empty') as HTMLElement,
      cols: el.querySelector('.plan-graph-cols') as HTMLElement,
      canvas: el.querySelector('.plan-graph-canvas') as HTMLElement,
      svg: el.querySelector('.plan-graph-edges') as SVGSVGElement,
    };
  };
  graphEls = { balls: graphSection('balls'), passives: graphSection('passives') };
}

/** One edge's identity: the stamped endpoints, shared by the reconcile key,
 *  the path lookup, and the DOM dataset stamp — one spelling, all uses. */
const edgeKey = (from: string, to: string): string => `${from}>${to}`;

/** Position one node card inside the canvas — the single geometry write,
 *  used by the rebuild and the in-place repaint alike so they cannot
 *  drift. */
function placeNode(el: HTMLElement, n: { x: number; y: number; w: number }): void {
  el.style.left = `${n.x}px`;
  el.style.top = `${n.y}px`;
  el.style.width = `${n.w}px`;
  el.style.height = `${BUILD_GRAPH_METRICS.nodeH}px`;
}

export function paintBuildGraphs(vm: ViewModel) {
  if (!graphEls) return;
  const bg = vm.buildGraph;
  for (const ns of ['balls', 'passives'] as const) {
    const els = graphEls[ns];
    const layout = bg[ns];
    els.section.classList.toggle('collapsed', bg.collapsed[ns]);
    els.toggle.setAttribute('aria-expanded', String(!bg.collapsed[ns]));
    const empty = layout.nodes.length === 0;
    els.empty.hidden = !empty;
    els.cols.hidden = empty;
    if (empty) {
      // clear through reconcile too — a plan that empties must not leave the
      // previous graph's nodes behind (the svg edge layer lives inside the
      // canvas, so the clear removes everything but it)
      reconcile(els.canvas, '', () => {
        for (const el of [...els.canvas.children]) if (el !== els.svg) el.remove();
        els.svg.replaceChildren();
        els.canvas.style.width = '';
        els.canvas.style.height = '';
      });
      continue;
    }

    // the key is STRUCTURE only — which nodes and which edges exist, sorted
    // so a pure reorder (done marks move disabled nodes right) is NOT a
    // rebuild: per-node state AND positions repaint in place below, so a
    // done-mark toggle never recreates the canvas's <img>s
    const key =
      layout.nodes.map((n) => `${n.id}|${n.final ? 1 : 0}`).sort().join(',') +
      '#' +
      layout.edges.map((e) => edgeKey(e.from, e.to)).sort().join(',');
    reconcile(els.canvas, key, () => {
      // rebuild = replace: clear the previous node cards first (the svg edge
      // layer lives inside the canvas and stays) — appending would stack a
      // second graph under the first
      for (const child of [...els.canvas.children]) if (child !== els.svg) child.remove();
      els.canvas.style.width = `${layout.width}px`;
      els.canvas.style.height = `${layout.height}px`;
      els.svg.setAttribute('width', String(layout.width));
      els.svg.setAttribute('height', String(layout.height));
      els.svg.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
      els.svg.replaceChildren(...layout.edges.map((e) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', e.path);
        path.dataset.from = e.from;
        path.dataset.to = e.to;
        return path;
      }));
      for (const n of layout.nodes) {
        // a div, not a button: done-able nodes carry their own check button
        // inside (no nested interactive elements)
        const el = document.createElement('div');
        el.className =
          `build-node${n.final ? ' final' : ''}${n.row === BUILD_GRAPH_ROWS.balls.fusionRow ? ' fused' : ''}` +
          `${n.done ? ' done' : ''}${n.suppressed ? ' suppressed' : ''}`;
        el.dataset.id = n.id;
        placeNode(el, n);
        // icons ride one row wrapper — the fused pair's two icons sit side by
        // side (bare second img would stack under the first in the column)
        const imgs = n.row === BUILD_GRAPH_ROWS.balls.fusionRow
          ? `<img src="${icon(n.icon)}" alt="" width="28" height="28">${n.icon2 ? `<img src="${icon(n.icon2)}" alt="" width="28" height="28">` : ''}`
          : `<img src="${icon(n.icon)}" alt="${n.name}" width="28" height="28">`;
        // the done check: evolved/T3/fusion nodes only — base balls dim
        // automatically when their remaining demand hits zero. State
        // (label, hidden) paints in place below; the button exists whenever
        // the node kind does.
        const check = n.row > 0 ? '<button class="build-check" type="button" hidden>✓</button>' : '';
        el.innerHTML = `<span class="build-icons">${imgs}</span><span class="build-name">${n.name}</span><span class="build-count"></span>${check}`;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          emitAction({ type: 'toggleGraphFocus', id: n.id });
        });
        el.querySelector('.build-check')?.addEventListener('click', (e) => {
          e.stopPropagation();
          emitAction({ type: 'toggleGraphDone', id: n.id });
        });
        els.canvas.appendChild(el);
      }
    });

    // per-node state repaints in place, found by data-id (never a rebuild —
    // the graph's <img>s stay put through done toggles and focus changes);
    // positions update too, because done toggles reorder rows
    const nodeById = new Map(layout.nodes.map((n) => [n.id, n]));
    for (const el of els.canvas.querySelectorAll<HTMLElement>('.build-node')) {
      const id = el.dataset.id ?? '';
      const n = nodeById.get(id);
      if (!n) continue;
      placeNode(el, n);
      // focus highlight
      el.classList.toggle('focused', bg.focus === id);
      el.classList.toggle('related', bg.focus !== null && bg.focus !== id && bg.related.has(id));
      el.classList.toggle('dimmed', bg.focus !== null && !bg.related.has(id));
      // remaining copies: "n" when every path needs that many, "min-max"
      // when alternates widen it, "0" once done marks freed every path
      const countEl = el.querySelector('.build-count');
      if (countEl) countEl.textContent = n.min === n.max ? `${n.min}` : `${n.min}-${n.max}`;
      el.classList.toggle('done', n.done);
      el.classList.toggle('suppressed', n.suppressed);
      // the check's state: a suppressed node needs no check — it already
      // sits at zero through other nodes' done marks
      const check = el.querySelector<HTMLButtonElement>('.build-check');
      if (check) {
        check.hidden = n.suppressed;
        check.ariaLabel = n.done ? 'Mark as not done' : 'Mark as done';
        check.title = n.done ? 'Not done yet' : 'Done this run';
      }
    }
    // edges: paths follow their endpoints' new positions after a reorder;
    // an edge lights when both endpoints sit in the focused chain
    const edgePath = new Map(layout.edges.map((e) => [edgeKey(e.from, e.to), e.path]));
    for (const path of els.svg.querySelectorAll<SVGPathElement>('path')) {
      const d = edgePath.get(edgeKey(path.dataset.from ?? '', path.dataset.to ?? ''));
      if (d) path.setAttribute('d', d);
      const lit = bg.focus !== null && bg.related.has(path.dataset.from ?? '') && bg.related.has(path.dataset.to ?? '');
      path.classList.toggle('lit', lit);
    }
  }
}
