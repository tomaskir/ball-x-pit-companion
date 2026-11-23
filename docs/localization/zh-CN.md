# 简体中文本地化说明

本仓库是 **BALL x PIT** 的粉丝伴侣站。站点保持上游的英文默认；页面右上角的
English / 中文 下拉框可切换语言，选择写入 `localStorage`（键 `bxp-lang`）
后重载页面。`?lang=en|zh` 查询参数可临时覆盖偏好。

## 词条来源与致谢

中文词条移植自 [@H0lyDiana 的 fork](https://github.com/H0lyDiana/ball-x-pit-companion)
（`src/i18n/zh/*`），由该分支从游戏内置官方简中文本提取并填充本站数值。
实体术语取自 **《球比伦战记》v1.308**（2026-10-12）；站点自身文案由该分支翻译。
Issue [#55](https://github.com/tomaskir/ball-x-pit-companion/issues/55) 中维护者建议
协调两 fork 的实现，因此此处保留其来源说明。

- 官方文本位于 `Balls_Data/resources.assets` 的 **I2 Localization** 字符串表
  （`I2Languages` / `I2Languages_DLC`，Unity 资源，MonoBehaviour 内嵌）。
- 用 UnityPy 解包后按 I2 的 `TermData` 结构读出每个词条的语言列；第 1 列为简体中文。
- 实体词条使用固定键：`Generated/hupg_<slug>_name/_desc`（弹珠）、
  `Generated/pass_<slug>_name/_desc`（被动物品）、
  `Generated/char_<slug>_name/_desc/_flavordesc`（角色）。

## 官方术语

| 英文 | 官方简中 |
| --- | --- |
| ball | 弹珠 |
| baby ball | 迷你弹珠 |
| passive | 被动物品 |
| fusion / Fusion Reactor | 融合 / 融合核心 |
| evolution | 进化 |
| the Pit | 深坑 |
| Risen Ballbylon（DLC） | 升天球比伦 |
| character | 角色 |

界面自身的新造词（如“构筑”“协同”）不属于游戏术语，保持站点风格。

## 覆盖范围

| 内容 | 条目 | 来源 |
| --- | --- | --- |
| 弹珠名称 | 115 | 114 条 `hupg_*_name` + 迷你弹珠（游戏 UI） |
| 弹珠一级效果 | 115 | 官方模板 + 本站数值填充 |
| 弹珠三阶效果（融合用） | 114 | 官方模板 + 本站三阶数值填充 |
| 被动物品名称 | 116 | `pass_*_name` |
| 被动物品效果 | 116 | 官方模板 + 数值填充 |
| 角色名称 | 31 | `char_*_name` |
| 角色特性 | 31 | `char_*_desc` 原文 |
| 界面文案 / 标签 / 判定说明 / 融合说明 | ~200 条 | 本站文案，术语对齐官方 |

官方模板中的 `{[变量]}` 用本站英文底稿里的具体数值填充（例如
`施加{[bleed_amt]}层流血` + `2` → `施加2层流血`）。当本站英文底稿省略了官方
模板的尾句时，保留能填满的句子，避免出现占位符。

## 实现

```
src/i18n/
  index.ts          语言状态、t()、实体访问器、静态外壳套用
  catalog.ts        展示层集合（name/effects/quirk 已本地化）
  zh/balls.ts       115 条弹珠词条（官方名称/效果）
  zh/passives.ts    116 条被动物品词条
  zh/characters.ts  31 条角色词条
  zh/level3.ts      114 条三阶文本
  zh/ui.ts          界面文案、标签、判定说明、融合说明、属性名
```

- 数据文件 `src/data/*.ts` 保持英文原文（生成物、测试与英文正则依赖它）；中文在
  `src/i18n/catalog.ts` 处替换后进入 `catalog` 索引。
- 融合推演的通道判定依赖英文效果文本的正则，因此 `componentText()` 仍读英文；
  展示段落走 `level3Effect()`。中文不参与规则判定。
- 融合合成时伤害区间抽象为 `X`：中文规则匹配“数字/区间 + 伤害”（如
  `50-70伤害`）；百分比与倍率因中间夹着 `%`／`倍` 而保留。
- `index.astro` 以内联脚本在模块加载前设置 `<html lang>`；语言切换后重载页面，
  因此构建期生成的 DOM 文本和模块级集合不会与当前语言不一致。

## 验证

- `src/i18n.test.ts`：词表覆盖（缺键回退英文）、官方术语、下拉框静态文案回填、
  中文融合输出与伤害区间抽象。
- `npm test` 是仓库唯一质量门禁，包含 `tsc --noEmit` 与既有英文断言。

## 维护

游戏更新后按 `slug` 更新 `src/i18n/zh/*.ts` 即可；数据管线与融合逻辑不需要改动。
若官方修改了术语，同步 `zh/ui.ts` 与静态外壳的 `data-i18n` 标记文案。
