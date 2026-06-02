import type { Locale } from "@/lib/i18n";

export type Localized = Record<Locale, string>;

export type Clipping = {
  id: string;
  title: Localized;
  year: string;
  medium: Localized;
  src: string;
  gifSrc: string;
  note: Localized;
  ratio: string;
};

const l = (en: string, zhCN: string, zhTW: string): Localized => ({
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
});

const medium = l("digital clipping / image collage", "数字剪贴 / 图像拼贴", "數位剪貼 / 圖像拼貼");

export const clippings: Clipping[] = [
  {
    id: "C-001",
    title: l("Tea for Two, Before Thunder", "雷声前的双人茶", "雷聲前的雙人茶"),
    year: "2026",
    medium,
    src: "/clippings/01-tea-for-two.jpg",
    gifSrc: "/clipping-gifs/01-tea-for-two.gif",
    ratio: "922 / 1999",
    note: l(
      "A storm sky, a masked tenderness, the card table, the cat, and Kitty as a social ritual gone slightly wrong.",
      "暴风天空、被遮住的温柔、牌桌、猫与 Kitty，像一场稍微出错的社交仪式。",
      "暴風天空、被遮住的溫柔、牌桌、貓與 Kitty，像一場稍微出錯的社交儀式。",
    ),
  },
  {
    id: "C-002",
    title: l("Love in Mess", "混乱里的爱", "混亂裡的愛"),
    year: "2026",
    medium,
    src: "/clippings/02-love-in-mess.jpg",
    gifSrc: "/clipping-gifs/02-love-in-mess.gif",
    ratio: "922 / 1999",
    note: l(
      "A porcelain shelter with nails, burning waste, borrowed romance, and the body learning to stay unsafe safely.",
      "钉子里的瓷杯避难所、燃烧的垃圾、借来的浪漫，以及身体学习如何安全地不安全。",
      "釘子裡的瓷杯避難所、燃燒的垃圾、借來的浪漫，以及身體學習如何安全地不安全。",
    ),
  },
  {
    id: "C-003",
    title: l("Blue Threshold", "蓝色门槛", "藍色門檻"),
    year: "2026",
    medium,
    src: "/clippings/03-blue-threshold.jpg",
    gifSrc: "/clipping-gifs/03-blue-threshold.gif",
    ratio: "922 / 1999",
    note: l(
      "A lone figure stands before a cold glass surface, as if the aquarium, screen, and dream all became one wall.",
      "一个人站在冷玻璃前，像水族箱、屏幕和梦一起变成了一堵墙。",
      "一個人站在冷玻璃前，像水族箱、螢幕和夢一起變成了一堵牆。",
    ),
  },
  {
    id: "C-004",
    title: l("Afterimage Room", "残影房间", "殘影房間"),
    year: "2026",
    medium,
    src: "/clippings/04-afterimage-room.jpg",
    gifSrc: "/clipping-gifs/04-afterimage-room.gif",
    ratio: "1080 / 2340",
    note: l(
      "Blurred bodies and light leaks fold into a private darkroom where memory arrives as motion damage.",
      "模糊身体和漏光折进私人暗房，记忆以运动损坏的形式抵达。",
      "模糊身體和漏光摺進私人暗房，記憶以運動損壞的形式抵達。",
    ),
  },
  {
    id: "C-005",
    title: l("Ego / Nature", "自我 / 自然", "自我 / 自然"),
    year: "2026",
    medium,
    src: "/clippings/05-ego-nature.jpg",
    gifSrc: "/clipping-gifs/05-ego-nature.gif",
    ratio: "1179 / 2554",
    note: l(
      "Two glowing heads, two hands almost touching, and a diagram of instinct trying to survive its own naming.",
      "两个发光的头、几乎相触的手，以及本能试图在命名中幸存的图解。",
      "兩個發光的頭、幾乎相觸的手，以及本能試圖在命名中倖存的圖解。",
    ),
  },
  {
    id: "C-006",
    title: l("Noodle Clock", "面条时钟", "麵條時鐘"),
    year: "2026",
    medium,
    src: "/clippings/06-noodle-clock.jpg",
    gifSrc: "/clipping-gifs/06-noodle-clock.gif",
    ratio: "1080 / 2340",
    note: l(
      "Time melts through noodles, clocks, fish, and a seated figure arranged like a small devotional machine.",
      "时间从面条、时钟、鱼和盘坐的人之间融化，像一台小型祈祷机器。",
      "時間從麵條、時鐘、魚和盤坐的人之間融化，像一台小型祈禱機器。",
    ),
  },
  {
    id: "C-007",
    title: l("Something Was Left Behind", "有东西被留下", "有東西被留下"),
    year: "2026",
    medium,
    src: "/clippings/07-left-behind.jpg",
    gifSrc: "/clipping-gifs/07-left-behind.gif",
    ratio: "2049 / 4440",
    note: l(
      "Water, plastic wrap, sofa, clouds: a domestic scene behaves like a browser tab that never fully closed.",
      "水、保鲜膜、沙发、云：一个家庭场景像从未真正关闭的浏览器标签。",
      "水、保鮮膜、沙發、雲：一個家庭場景像從未真正關閉的瀏覽器標籤。",
    ),
  },
  {
    id: "C-008",
    title: l("Rabbit Scarf System", "兔子围巾系统", "兔子圍巾系統"),
    year: "2026",
    medium,
    src: "/clippings/08-rabbit-scarf.png",
    gifSrc: "/clipping-gifs/08-rabbit-scarf.gif",
    ratio: "912 / 1976",
    note: l(
      "Soft toy garments, yellow drawers, lips on a phone, and a pink cat sketch make cuteness slightly suspicious.",
      "软玩具式衣物、黄色抽屉、手机里的嘴唇和粉色猫，让可爱变得有点可疑。",
      "軟玩具式衣物、黃色抽屜、手機裡的嘴唇和粉色貓，讓可愛變得有點可疑。",
    ),
  },
  {
    id: "C-009",
    title: l("Water Ring", "水环", "水環"),
    year: "2026",
    medium,
    src: "/clippings/09-water-ring.jpg",
    gifSrc: "/clipping-gifs/09-water-ring.gif",
    ratio: "1024 / 2215",
    note: l(
      "A pool, a mouth, ice, a purple ring, and a sleeping gesture assemble a wet grammar of disappearance.",
      "泳池、嘴唇、冰块、紫色圆环和睡眠姿势，拼出一种关于消失的潮湿语法。",
      "泳池、嘴唇、冰塊、紫色圓環和睡眠姿勢，拼出一種關於消失的潮濕語法。",
    ),
  },
  {
    id: "C-010",
    title: l("Forest Bottles", "森林瓶", "森林瓶"),
    year: "2026",
    medium,
    src: "/clippings/10-forest-bottles.jpg",
    gifSrc: "/clipping-gifs/10-forest-bottles.gif",
    ratio: "2049 / 4440",
    note: l(
      "A hand enters a warped landscape of animals, cut wood, forest glass, and preserved flowers.",
      "一只手进入由动物、切开的木头、森林玻璃与封存花朵组成的扭曲风景。",
      "一隻手進入由動物、切開的木頭、森林玻璃與封存花朵組成的扭曲風景。",
    ),
  },
  {
    id: "C-011",
    title: l("Window Sea", "窗中海", "窗中海"),
    year: "2026",
    medium,
    src: "/clippings/11-window-sea.jpg",
    gifSrc: "/clipping-gifs/11-window-sea.gif",
    ratio: "1024 / 2215",
    note: l(
      "A handshake, a running cat, a sea-window, and a diner body turn distance into a staged interior.",
      "握手、奔跑的猫、海上窗景与餐车身体，把距离变成被布置过的室内。",
      "握手、奔跑的貓、海上窗景與餐車身體，把距離變成被佈置過的室內。",
    ),
  },
  {
    id: "C-012",
    title: l("Twilight Paper", "暮光纸页", "暮光紙頁"),
    year: "2026",
    medium,
    src: "/clippings/12-twilight-paper.png",
    gifSrc: "/clipping-gifs/12-twilight-paper.gif",
    ratio: "1104 / 2391",
    note: l(
      "Black-and-white romance, newspaper desire, and a silhouetted body sit inside a gothic reading habit.",
      "黑白浪漫、报纸欲望和剪影身体，被安放在一种哥特式阅读习惯里。",
      "黑白浪漫、報紙慾望和剪影身體，被安放在一種哥德式閱讀習慣裡。",
    ),
  },
  {
    id: "C-013",
    title: l("Red Citrus Heart", "红柚心脏", "紅柚心臟"),
    year: "2026",
    medium,
    src: "/clippings/13-red-citrus.png",
    gifSrc: "/clipping-gifs/13-red-citrus.gif",
    ratio: "723 / 1563",
    note: l(
      "A flaming heart floats over red pulp and smiling flesh, sweet enough to be dangerous.",
      "燃烧的心漂浮在红色果肉和微笑的肉身上方，甜到危险。",
      "燃燒的心漂浮在紅色果肉和微笑的肉身上方，甜到危險。",
    ),
  },
  {
    id: "C-014",
    title: l("Mouth Heat", "口腔热度", "口腔熱度"),
    year: "2026",
    medium,
    src: "/clippings/14-mouth-heat.png",
    gifSrc: "/clipping-gifs/14-mouth-heat.gif",
    ratio: "1024 / 2218",
    note: l(
      "Close-up skin, mouth, hair, and fire form a body map where intimacy arrives as temperature.",
      "皮肤、嘴、头发与火焰的近景，组成一张以温度抵达的亲密地图。",
      "皮膚、嘴、頭髮與火焰的近景，組成一張以溫度抵達的親密地圖。",
    ),
  },
  {
    id: "C-015",
    title: l("Warm Bed Archive", "暖床档案", "暖床檔案"),
    year: "2026",
    medium,
    src: "/clippings/15-warm-bed.jpg",
    gifSrc: "/clipping-gifs/15-warm-bed.gif",
    ratio: "1164 / 2520",
    note: l(
      "A glowing bed, suspended rabbits, one eye, and many faces turn rest into a crowded psychic room.",
      "发光的床、悬挂的兔子、一只眼睛和许多脸，把休息变成拥挤的精神房间。",
      "發光的床、懸掛的兔子、一隻眼睛和許多臉，把休息變成擁擠的精神房間。",
    ),
  },
  {
    id: "C-016",
    title: l("Dream Survival Text", "梦中生存文本", "夢中生存文本"),
    year: "2026",
    medium,
    src: "/clippings/16-dream-survive.png",
    gifSrc: "/clipping-gifs/16-dream-survive.gif",
    ratio: "1024 / 2218",
    note: l(
      "Red text crosses city, bridge, sea, and boat: a survival instruction written in dream language.",
      "红字穿过城市、桥、海与船：一条用梦的语言写下的生存指令。",
      "紅字穿過城市、橋、海與船：一條用夢的語言寫下的生存指令。",
    ),
  },
  {
    id: "C-017",
    title: l("Red Room Evidence", "红房间证物", "紅房間證物"),
    year: "2026",
    medium,
    src: "/clippings/17-red-room.jpg",
    gifSrc: "/clipping-gifs/17-red-room.gif",
    ratio: "1893 / 4095",
    note: l(
      "A red interior, a framed skull-body, stained hands, and a seated figure make an altar of evidence.",
      "红色室内、框中的骷髅身体、染色的手和坐着的人，组成一座证物祭坛。",
      "紅色室內、框中的骷髏身體、染色的手和坐著的人，組成一座證物祭壇。",
    ),
  },
  {
    id: "C-018",
    title: l("Famous Elm Pokemon", "著名 Elm Pokemon", "著名 Elm Pokemon"),
    year: "2026",
    medium,
    src: "/clippings/18-ipod-eye.png",
    gifSrc: "/clipping-gifs/18-ipod-eye.gif",
    ratio: "1893 / 4095",
    note: l(
      "An opened iPod, eye, candles, and a flower turn old technology into an emotional reliquary.",
      "被打开的 iPod、眼睛、蜡烛与花，把旧科技变成情绪圣物盒。",
      "被打開的 iPod、眼睛、蠟燭與花，把舊科技變成情緒聖物盒。",
    ),
  },
  {
    id: "C-019",
    title: l("Skin Eye Study", "皮肤与眼睛研究", "皮膚與眼睛研究"),
    year: "2026",
    medium,
    src: "/clippings/19-skin-eye.png",
    gifSrc: "/clipping-gifs/19-skin-eye.gif",
    ratio: "2049 / 4440",
    note: l(
      "Wounds, gloss, dolls, eyes, and two tiny figures build a clinical fairy tale about looking too closely.",
      "伤痕、光泽、玩偶、眼睛和两个小人，构成一则关于看得太近的临床童话。",
      "傷痕、光澤、玩偶、眼睛和兩個小人，構成一則關於看得太近的臨床童話。",
    ),
  },
  {
    id: "C-020",
    title: l("River Dress", "河流裙", "河流裙"),
    year: "2026",
    medium,
    src: "/clippings/20-river-dress.png",
    gifSrc: "/clipping-gifs/20-river-dress.gif",
    ratio: "2049 / 4440",
    note: l(
      "A wet dress, a giant face, lilies, and pale figures gather around a river that behaves like memory.",
      "湿裙、巨大的脸、睡莲和苍白人群，围绕一条像记忆一样行动的河。",
      "濕裙、巨大的臉、睡蓮和蒼白人群，圍繞一條像記憶一樣行動的河。",
    ),
  },
];
