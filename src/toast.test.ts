// Tests for the toast adapter (src/toast.ts): the whole toast lifecycle —
// build, show, hide, position, one-at-a-time replacement, and the
// document-level outside-tap dismissal — owned by one module. The
// touch-dismissal behavior here is the bug fix pinned in
// regression.test.ts ("toast touch dismissal").
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createToast, type ToastAdapter } from './toast';
import { ballMap, type Item } from './catalog';
import { iconUrl } from './icon-url';

const flash = () => ballMap.get('flash')!;
const vampireLord = () => ballMap.get('vampire-lord')!; // multi-recipe: recipe markup

/** An anchor in the document (getBoundingClientRect needs a attached node
 *  for layout; jsdom returns zeros, which the adapter must tolerate). */
const anchor = () => {
  const el = document.createElement('button');
  el.className = 'tile';
  document.body.appendChild(el);
  return el;
};

const toastEl = () => document.querySelector<HTMLElement>('body > .toast');

describe('toast adapter (jsdom)', () => {
  let toast: ToastAdapter;
  const emitted: (Item | null)[] = [];

  beforeEach(() => {
    emitted.length = 0;
    toast = createToast({ getVerdict: (item) => (emitted.push(item), null) });
  });
  afterEach(() => toast.destroy());

  it('showFor builds the toast: icon, name, effect text, recipe markup, tags', () => {
    toast.showFor(anchor(), vampireLord());
    const el = toastEl()!;
    expect(el).toBeTruthy();
    expect(el.querySelector('h4')!.textContent).toContain('Vampire Lord');
    expect(el.querySelector('h4 img')!.getAttribute('src')).toBe(iconUrl('/', vampireLord().icon));
    expect(el.querySelector('.eff')!.textContent).toBe(vampireLord().effects);
    // recipes are OR-of-ANDs — same compact per-slot notation as the tiles;
    // components render as icons (names ride the title/alt attributes)
    const recImgs = [...el.querySelectorAll('.rec img')].map((i) => i.getAttribute('title'));
    expect(recImgs).toContain('Vampire');
    expect(recImgs).toContain('Bleed');
    expect(recImgs).toContain('Dark');
    expect(el.querySelector('.rec img')!.getAttribute('src')).toBe(iconUrl('/', ballMap.get('vampire')!.icon));
    const tags = [...el.querySelectorAll('.tags span')].map((t) => t.textContent);
    expect(tags).toEqual(vampireLord().tags);
  });

  it('no verdict injected → no verdict line; a verdict → the line with color and note', () => {
    toast.showFor(anchor(), flash());
    expect(toastEl()!.querySelector('.verdicts')).toBeNull();
    toast.hide();
    expect(toastEl()).toBeNull();

    const green = createToast({
      getVerdict: () => ({ verdict: 'green', note: 'likes aoe' }),
    });
    try {
      green.showFor(anchor(), flash());
      const line = toastEl()!.querySelector('.verdicts span')!;
      expect(line.textContent).toContain('green');
      expect(line.textContent).toContain('likes aoe');
      expect(line.classList.contains('green')).toBe(true);
    } finally {
      green.destroy();
    }
  });

  it('a base ball with no recipes shows no recipe block', () => {
    toast.showFor(anchor(), ballMap.get('bleed')!);
    expect(toastEl()!.querySelector('.rec')).toBeNull();
  });

  it('one toast at a time: a second showFor replaces the first', () => {
    toast.showFor(anchor(), flash());
    toast.showFor(anchor(), vampireLord());
    const all = document.querySelectorAll('body > .toast');
    expect(all).toHaveLength(1);
    expect(all[0].textContent).toContain('Vampire Lord');
  });

  it('hide() removes the toast; hide() with none shown is a no-op', () => {
    toast.showFor(anchor(), flash());
    toast.hide();
    expect(toastEl()).toBeNull();
    expect(() => toast.hide()).not.toThrow();
  });

  it('bind: mouseenter shows, mouseleave hides (desktop path unchanged)', () => {
    const a = anchor();
    toast.bind(a, flash);
    a.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    expect(toastEl()!.textContent).toContain('Flash');
    a.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
    expect(toastEl()).toBeNull();
  });

  it('bind: touchstart shows (mobile show path unchanged)', () => {
    const a = anchor();
    toast.bind(a, flash);
    a.dispatchEvent(new Event('touchstart', { bubbles: true }));
    expect(toastEl()!.textContent).toContain('Flash');
  });

  it('bind: a getItem() returning null shows nothing', () => {
    const a = anchor();
    toast.bind(a, () => null);
    a.dispatchEvent(new MouseEvent('mouseenter'));
    expect(toastEl()).toBeNull();
  });

  // The bug fix: a tap (pointerdown) outside the toast dismisses it —
  // previously only mouseleave hid it, so on touch a toast stayed until
  // another toast replaced it.
  it('pointerdown outside the toast hides it (touch dismissal)', () => {
    const a = anchor();
    toast.bind(a, flash);
    a.dispatchEvent(new Event('touchstart', { bubbles: true }));
    expect(toastEl()).toBeTruthy();

    const elsewhere = document.createElement('div');
    document.body.appendChild(elsewhere);
    elsewhere.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(toastEl()).toBeNull();
  });

  it('pointerdown on the toast itself does not hide it', () => {
    toast.showFor(anchor(), flash());
    const el = toastEl()!;
    el.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(toastEl()).toBe(el);
  });

  it('pointerdown on a bound anchor does not hide (the anchor shows its own toast)', () => {
    const a = anchor();
    const b = anchor();
    toast.bind(a, flash);
    toast.bind(b, vampireLord);
    a.dispatchEvent(new Event('touchstart', { bubbles: true }));
    expect(toastEl()!.textContent).toContain('Flash');
    // tapping the other tile: its own show wins over the dismissal
    b.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    b.dispatchEvent(new Event('touchstart', { bubbles: true }));
    const all = document.querySelectorAll('body > .toast');
    expect(all).toHaveLength(1);
    expect(all[0].textContent).toContain('Vampire Lord');
  });

  it('positioning clamps the toast into the viewport (stubbed layout)', () => {
    const a = anchor();
    a.getBoundingClientRect = () => ({ left: 5000, top: 5000, width: 100, height: 100, right: 5100, bottom: 5100, x: 5000, y: 5000, toJSON: () => ({}) }) as DOMRect;
    toast.showFor(a, flash());
    const el = toastEl()!;
    const x = parseFloat(el.style.left);
    const y = parseFloat(el.style.top);
    expect(x).toBeGreaterThanOrEqual(8);
    expect(x).toBeLessThanOrEqual(window.innerWidth - el.offsetWidth - 8);
    expect(y).toBeGreaterThanOrEqual(8);
  });
});
