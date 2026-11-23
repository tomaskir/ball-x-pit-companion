// 简体中文词表：角色（31）。名称与特性取自游戏内官方简体中文
// （I2Languages，v1.308 的 char_*_desc）。
export interface ZhCharacter {
  name: string;
  quirk: string;
}

export const CHARACTER_ZH: Record<string, ZhCharacter> = {
  "the-warrior": { name: "战士", quirk: "默认角色，没有特殊能力或限制。" },
  "the-itchy-finger": { name: "快枪手", quirk: "开火时无法精确射击，但是射速翻倍，而且会连续不断地射出手中的弹珠。开火时能够全速移动。" },
  "the-repentant": { name: "忏悔者", quirk: "每次反弹使弹珠的伤害提高5%。但是当触及上方的屏幕尽头区域时，弹珠将立刻返回并对经过的所有敌人造成伤害。" },
  "the-cohabitants": { name: "夫妇", quirk: "每次开火时朝镜像方向发射相同的弹珠。所有弹珠伤害减半。" },
  "the-cogitator": { name: "沉思者", quirk: "自动选择升级。" },
  "the-embedded": { name: "顽固老兵", quirk: "所有弹珠能够穿透敌人，此效果将在击中墙壁后消失。" },
  "the-shade": { name: "暗影", quirk: "从屏幕上方的尽头向下发射弹珠，并且拥有10%的基础暴击率。" },
  "the-shieldbearer": { name: "盾卫", quirk: "携带一面能够反弹弹珠的巨盾。每次通过盾牌反弹将使弹珠的伤害提高100%。" },
  "the-spendthrift": { name: "富贾", quirk: "以弧形轨迹发射所有弹珠。" },
  "the-juggler": { name: "杂耍者", quirk: "朝着场上目标区域向上空抛出弹珠。弹珠在落地前不会反弹。" },
  "the-empty-nester": { name: "空巢老人", quirk: "没有迷你弹珠。每次开火时，选择1种特殊弹珠并发射多颗相同的弹珠。" },
  "the-flagellant": { name: "鞭笞者", quirk: "底部区域会像墙壁一样反弹弹珠（弹珠不会在触底后自动返回）" },
  "the-makeshift-sisyphus": { name: "残缺的西西弗斯", quirk: "弹珠无法造成直接命中伤害，但是AOE与状态效果伤害提高4倍。没有迷你弹珠。" },
  "the-physicist": { name: "物理学家", quirk: "弹珠会受到重力牵引并向屏幕后方移动。" },
  "the-tactician": { name: "战术大师", quirk: "战斗改为以回合制进行。" },
  "the-radical": { name: "极端分子", quirk: "无法手动控制角色，自动选择升级。" },
  "the-falconer": { name: "驯鹰者", quirk: "盘旋于屏幕两侧的两只猎鹰将负责发射弹珠。" },
  "the-carouser": { name: "享乐者", quirk: "弹珠返回时将会短暂环绕角色飞行。" },
  "the-tunneller": { name: "隧道工", quirk: "弹珠将会在屏幕顶部与底部来回传送。" },
  "the-tiptoer": { name: "迷踪客", quirk: "不会被（除了Boss和迷你Boss以外）敌人发现，但生命值极低。" },
  "the-hoary-hoarder": { name: "苍白囤积狂", quirk: "只能拥有2个弹珠栏位，但是剩余的装备栏位将转变为被动物品栏位。" },
  "the-ballbearer": { name: "护球者", quirk: "拥有双倍弹珠栏位，但是没有任何被动物品栏位。" },
  "the-false-messiah": { name: "虚假弥赛亚", quirk: "在Twitch平台进行直播时，观众将可以投票决定特定抉择与随机事件。" },
  "the-conduit": { name: "引导者", quirk: "以玩家为中心触发所有弹珠的范围伤害效果。" },
  "the-potager": { name: "料理奇才", quirk: "将装备的所有特殊弹珠融合为1颗弹珠发射出去。无法正常融合弹珠，也没有任何迷你弹珠。" },
  "the-recollector": { name: "回溯者", quirk: "弹珠能够穿透敌人，并且将在抵达光标位置后返回。" },
  "the-right-hand-man": { name: "右客", quirk: "弹珠在命中右侧墙壁后伤害翻倍。弹珠在命中左侧墙壁后伤害减半，但是能够穿透敌人。" },
  "the-scandalmonger": { name: "妖言说客", quirk: "弹珠在返回过程中将短暂环绕光标飞行。" },
  "the-scrupulous-scoundrel": { name: "执妄恶徒", quirk: "弹珠只会以完美对角线反弹。" },
  "the-sentinel": { name: "哨兵", quirk: "能够瞄准与射击任意方向（包括你身后）。" },
  "the-wallbreaker": { name: "破墙者", quirk: "弹珠在首次命中墙壁后将传送至屏幕另一侧。" },
};
