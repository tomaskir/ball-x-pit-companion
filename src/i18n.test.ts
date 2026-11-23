// 中文化验证：语言层默认英文（jsdom 与上游一致），这里显式切到中文，
// 检查目录、派生文案与融合合成都落在中文词表上，并保证词表覆盖
// 全部实体（缺键会回退英文，用户会看到混排）。
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

async function zh() {
  vi.resetModules();
  const i18n = await import('./i18n');
  i18n.setLang('zh');
  return i18n;
}

describe('中文词表', () => {
  beforeEach(() => { vi.resetModules(); });

  it('覆盖全部球体、被动、角色与三阶文本', async () => {
    const i18n = await zh();
    const { BALLS } = await import('./i18n/catalog');
    const { PASSIVES } = await import('./i18n/catalog');
    const { CHARACTERS } = await import('./i18n/catalog');
    const { LEVEL_3_EFFECTS } = await import('./data/level-3');

    for (const ball of BALLS) {
      expect(ball.name, ball.id).toMatch(/[\u4e00-\u9fff]/);
      expect(ball.effects, ball.id).toMatch(/[\u4e00-\u9fff]/);
      if (LEVEL_3_EFFECTS[ball.id]) {
        expect(i18n.level3Effect(ball.id, 'MISSING'), ball.id).not.toBe('MISSING');
        expect(i18n.level3Effect(ball.id, 'MISSING'), ball.id).toMatch(/[\u4e00-\u9fff]/);
      }
    }
    for (const passive of PASSIVES) {
      expect(passive.name, passive.id).toMatch(/[\u4e00-\u9fff]/);
      expect(passive.effects, passive.id).toMatch(/[\u4e00-\u9fff]/);
    }
    for (const character of CHARACTERS) {
      expect(character.name, character.id).toMatch(/[\u4e00-\u9fff]/);
      expect(character.quirk, character.id).toMatch(/[\u4e00-\u9fff]/);
    }
  });

  it('界面文案与标签使用中文', async () => {
    const i18n = await zh();
    expect(i18n.t('editions.base')).toBe('本体');
    // 切回英文后词典仍可回退（右上角按钮的路径）
    i18n.setLang('en');
    expect(i18n.t('editions.base')).toBe('Base game');
    expect(i18n.tagLabel('status-effect')).toBe('status-effect');
    i18n.setLang('zh');
    expect(i18n.t('nav.balls')).toBe('弹珠');
    expect(i18n.tagLabel('status-effect')).toBe('状态效果');
    expect(i18n.propertyLabel('Cooldown')).toBe('冷却');
    expect(i18n.propertyValue('max 5 stacks')).toBe('最多 5 层');
  });

  it('融合合成输出中文文本，并把伤害区间抽象为 X', async () => {
    await zh();
    const { ballMap } = await import('./catalog');
    const { fuse } = await import('./fusion');
    const sun = ballMap.get('sun')!;
    const dark = ballMap.get('dark')!;
    const result = fuse(sun, dark)!;
    expect(result.name).toContain('×');
    expect(result.paragraphs[0]).toMatch(/[\u4e00-\u9fff]/);
    // 三阶文本里的具体数值被抽象掉，机制词保留
    expect(result.paragraphs[0]).not.toMatch(/9–15/);
    expect(result.paragraphs[0]).toContain('X伤害');
    expect(result.notes[0]).toContain('社区');
  });

  it('角色提示与构筑提示使用中文', async () => {
    const i18n = await zh();
    const { createViewState } = await import('./view-state');
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    expect(i18n.t('characters.hint.second')).toBe('再选择一名角色…');
    expect(vm.slotHint).toBe('再选择一名角色…');
  });

  it('静态外壳默认英文，切换后回填中文并同步下拉框', async () => {
    const i18n = await zh();
    document.body.innerHTML = `
      <select id="langSelect"><option value="en">English</option><option value="zh">中文</option></select>
      <button data-i18n="nav.balls">Balls</button>`;
    const select = document.querySelector<HTMLSelectElement>('#langSelect')!;
    const tab = document.querySelector<HTMLButtonElement>('[data-i18n="nav.balls"]')!;
    document.title = 'Ball x Pit Companion';

    i18n.setLang('en');
    i18n.applyStaticI18n(document);
    expect(select.value).toBe('en');
    expect(tab.textContent).toBe('Balls');

    i18n.setLang('zh');
    i18n.applyStaticI18n(document);
    expect(select.value).toBe('zh');
    expect(tab.textContent).toBe('弹珠');
    // Brand title stays English in both languages.
    expect(document.title).toBe('Ball x Pit Companion');
    expect(select.getAttribute('aria-label')).toBe('切换语言');
    document.body.innerHTML = '';
  });
});
