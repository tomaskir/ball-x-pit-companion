// 国际化层：站点保持上游的英文默认，右上角下拉框可切换到简体中文
// （《球比伦战记》官方术语）。语言在 index.astro 的内联脚本里先确定，
// 再由此模块读取：选择写入 localStorage 后重载页面，因此模块级派生的集合
// （localizedBalls 等）和一次性烤进 DOM 的文案不会在运行中失效。
//
// 边界：数据文件保持英文原文（生成物、融合规则的英文正则与测试都依赖它），
// 展示时统一经过这里的访问器；catalog 的索引也建立在本地化集合之上，因此
// 渲染器拿到的 name/effects 已经是目标语言。
import type { Ball } from '../data/balls';
import type { Passive } from '../data/passives';
import type { Character } from '../data/characters';
import { BALLS } from '../data/balls';
import { PASSIVES } from '../data/passives';
import { CHARACTERS } from '../data/characters';
import { BALL_ZH } from './zh/balls';
import { PASSIVE_ZH } from './zh/passives';
import { CHARACTER_ZH } from './zh/characters';
import { LEVEL_3_ZH } from './zh/level3';
import {
  UI,
  TAG_COPY,
  VERDICT_NOTE_ZH,
  FUSION_NOTE_ZH,
  FUSION_EXCEPTION_ZH,
  PROPERTY_LABEL_ZH,
} from './zh/ui';

export type Lang = 'zh' | 'en';

const STORAGE_KEY = 'bxp-lang';

function storedLang(): Lang | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'zh' || value === 'en' ? value : null;
  } catch {
    return null;
  }
}

/** 语言来源优先级：localStorage → 页面 <html lang>（index.astro 的内联
 *  脚本已把 ?lang 覆盖与持久化偏好写在这里）→ 英文默认。jsdom 的文档没有
 *  语言标记，因此既有英文断言不受影响。 */
function detectLang(): Lang {
  const stored = storedLang();
  if (stored) return stored;
  if (typeof document !== 'undefined') {
    const tag = document.documentElement.lang.toLowerCase();
    if (tag.startsWith('zh')) return 'zh';
  }
  return 'en';
}

let lang: Lang = detectLang();

export const getLang = (): Lang => lang;
export const isZh = (): boolean => lang === 'zh';

/** 切换语言：写入偏好并重载页面（静态站点最可靠的整页重渲染方式）。
 *  重载保留当前 hash，因此构筑页与分享链接的路由不会丢失。 */
export function chooseLanguage(next: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // 隐私模式下无法持久化：退回 URL 参数（保留 hash）
    const url = new URL(location.href);
    url.searchParams.set('lang', next);
    location.replace(url.toString());
    return;
  }
  // A ?lang override is a one-shot entry point; clear it so a later dropdown
  // choice is not undone by the bootstrap script on the next reload.
  const url = new URL(location.href);
  if (url.searchParams.has('lang')) {
    url.searchParams.delete('lang');
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }
  location.reload();
}

/** 测试与小工具用：不重载页面，直接切换当前语言。 */
export function setLang(next: Lang): void {
  lang = next;
  ballsCache = null;
  passivesCache = null;
  charactersCache = null;
}

const interpolate = (text: string, vars?: Record<string, string | number>): string =>
  vars
    ? text.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String(vars[key]) : m))
    : text;

/** 界面文案。未知键回退为键名（开发期可见）。 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const copy = UI[key];
  if (!copy) return key;
  return interpolate(copy[lang], vars);
}

/** 静态外壳套用：英文是标记原文，中文由词典回填；英文模式是幂等写入。
 *  键来自元素自身的 data-i18n / -placeholder / -aria / -title 属性，因此
 *  新增静态文案不需要再登记一份白名单。 */
export function applyStaticI18n(root: ParentNode = document): void {
  const apply = (
    attr: 'data-i18n' | 'data-i18n-placeholder' | 'data-i18n-aria' | 'data-i18n-title',
    write: (el: HTMLElement, text: string) => void,
  ): void => {
    for (const el of root.querySelectorAll<HTMLElement>(`[${attr}]`)) {
      const key = el.getAttribute(attr);
      if (key) write(el, t(key));
    }
  };
  apply('data-i18n', (el, text) => { el.textContent = text; });
  apply('data-i18n-placeholder', (el, text) => el.setAttribute('placeholder', text));
  apply('data-i18n-aria', (el, text) => el.setAttribute('aria-label', text));
  apply('data-i18n-title', (el, text) => el.setAttribute('title', text));

  const langSelect = document.querySelector<HTMLSelectElement>('#langSelect');
  if (langSelect) {
    langSelect.value = lang;
    langSelect.setAttribute('aria-label', t('header.lang'));
    langSelect.setAttribute('title', t('header.lang'));
  }
  // The brand title (H1 and <title>) stays English in both languages;
  // only the description follows the selected language.
  if (typeof document !== 'undefined') {
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('doc.desc'));
  }
}

// ---------- 实体文案 ----------

const zh = <T>(value: T | undefined, fallback: T): T => (lang === 'zh' && value !== undefined ? value : fallback);

export const ballName = (b: Ball): string => zh(BALL_ZH[b.id]?.name, b.name);
export const ballEffect = (b: Ball): string => zh(BALL_ZH[b.id]?.effect, b.effects);
export const passiveName = (p: Passive): string => zh(PASSIVE_ZH[p.id]?.name, p.name);
export const passiveEffect = (p: Passive): string => zh(PASSIVE_ZH[p.id]?.effect, p.effects);
export const characterName = (c: Character): string => zh(CHARACTER_ZH[c.id]?.name, c.name);
export const characterQuirk = (c: Character): string => zh(CHARACTER_ZH[c.id]?.quirk, c.quirk);

/** 三阶文本（融合面板合成用）；缺中文时回退英文原文。 */
export const level3Effect = (id: string, fallback: string): string =>
  zh(LEVEL_3_ZH[id], fallback);

let ballsCache: Ball[] | null = null;
let passivesCache: Passive[] | null = null;
let charactersCache: Character[] | null = null;

/** 按当前语言产出展示用的集合（name/effects/quirk 已替换）。按语言缓存，
 *  站点只会在加载时确定一次语言，切换语言走整页重载。 */
export const localizedBalls = (): Ball[] => {
  ballsCache ??= lang === 'zh'
    ? BALLS.map((b) => ({ ...b, name: ballName(b), effects: ballEffect(b) }))
    : [...BALLS];
  return ballsCache;
};

export const localizedPassives = (): Passive[] => {
  passivesCache ??= lang === 'zh'
    ? PASSIVES.map((p) => ({ ...p, name: passiveName(p), effects: passiveEffect(p) }))
    : [...PASSIVES];
  return passivesCache;
};

export const localizedCharacters = (): Character[] => {
  charactersCache ??= lang === 'zh'
    ? CHARACTERS.map((c) => ({
        ...c,
        name: characterName(c),
        quirk: characterQuirk(c),
        verdicts: c.verdicts.map((v) => ({ ...v, note: v.note ? verdictNote(v.note) : v.note })),
      }))
    : [...CHARACTERS];
  return charactersCache;
};

/** 协同判定说明：中文词表优先，缺失时保留英文原句。 */
export function verdictNote(note: string): string {
  return zh(VERDICT_NOTE_ZH[note], note);
}

/** 标签徽章与说明。 */
export const tagLabel = (id: string): string => {
  // 英文界面沿用原始标签 id（历史行为），中文界面显示短标签
  if (lang !== 'zh') return id;
  const copy = TAG_COPY[id];
  return copy ? copy.zh : id;
};
export const tagDescription = (id: string): string => {
  const copy = TAG_COPY[id];
  return copy ? (lang === 'zh' ? copy.descZh : copy.descEn) : id;
};

/** 融合面板的已报告说明。 */
export const fusionNote = (text: string): string => zh(FUSION_NOTE_ZH[text], text);

/** 融合面板的例外行。 */
export function fusionException(pair: string, title: string, detail: string): { title: string; detail: string } {
  const copy = FUSION_EXCEPTION_ZH[pair];
  return copy && lang === 'zh' ? copy : { title, detail };
}

/** 融合结果行的属性名与取值。 */
export const propertyLabel = (label: string): string => zh(PROPERTY_LABEL_ZH[label], label);

export function propertyValue(value: string): string {
  if (lang !== 'zh') return value;
  const seconds = /^(\d+(?:\.\d+)?) seconds?$/.exec(value);
  if (seconds) return `${seconds[1]} 秒`;
  const tiles = /^(\d+)x(\d+) tiles$/.exec(value);
  if (tiles) return `${tiles[1]}x${tiles[2]} 格`;
  const stacks = /^max (\d+) stacks$/.exec(value);
  if (stacks) return `最多 ${stacks[1]} 层`;
  if (value === 'indefinitely') return '永久';
  return value;
}

/** 被动数据里的 requirement 字段（英文短句 → 中文）。 */
export function requirementText(value: string): string {
  if (lang !== 'zh') return value;
  const table: Record<string, string> = {
    'Must be level 5': '需达到 5 级',
    'Must have a shield': '需要拥有护盾',
    'Must be poisoned': '需要处于中毒状态',
    'Must have a baby ball': '需要拥有小球',
    'Must have a fused ball': '需要拥有融合球',
  };
  return table[value] ?? value;
}

/** 被动可用性提示里的角色名列表连接词。 */
export const listJoin = (names: readonly string[]): string => {
  if (names.length <= 1) return names[0] ?? '';
  if (lang === 'zh') return names.join('、');
  if (names.length === 2) return `${names[0]} or ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, or ${names[names.length - 1]}`;
};
