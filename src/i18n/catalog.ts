// 展示层数据集合：所有渲染路径共享同一份按语言替换过 name/effects 的数组。
// 逻辑仍以 id 为准，这里只负责文案；数据文件本身保持原文（生成物）。
// 语言在页面加载时确定，因此这里的模块级常量是安全的。
import { localizedBalls, localizedPassives, localizedCharacters } from './index';

export const BALLS = localizedBalls();
export const PASSIVES = localizedPassives();
export const CHARACTERS = localizedCharacters();
