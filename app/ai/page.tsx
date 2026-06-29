"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { PageFrame } from "@/components/site-shell";
import type { Locale } from "@/lib/i18n";

type Localized = Record<Locale, string>;

type Choice = {
  color?: string;
  name: Localized;
  note: Localized;
};

const pageCopy = {
  "zh-CN": {
    eyebrow: "Tea studio / interactive",
    title: "做一杯适合今天精神状态的奶茶。",
    body: "一个轻量交互界面：选择茶底、奶感、糖、冰和配料，右侧会即时生成杯身层次与小票。没有 AI，没有上传，没有后台，只有一杯暂时稳定的饮料。",
    base: "茶底",
    milk: "奶感",
    topping: "配料",
    sugar: "糖度",
    ice: "冰量",
    mood: "今日备注",
    moodPlaceholder: "例如：不想说话、需要一点甜、假装稳定。",
    random: "随机一杯",
    reset: "重置",
    receipt: "小票",
    cup: "杯身预览",
    total: "情绪浓度",
    stamp: "tea for two / choco design studio",
  },
  "zh-TW": {
    eyebrow: "Tea studio / interactive",
    title: "做一杯適合今天精神狀態的奶茶。",
    body: "一個輕量互動介面：選擇茶底、奶感、糖、冰和配料，右側會即時生成杯身層次與小票。沒有 AI，沒有上傳，沒有後台，只有一杯暫時穩定的飲料。",
    base: "茶底",
    milk: "奶感",
    topping: "配料",
    sugar: "糖度",
    ice: "冰量",
    mood: "今日備註",
    moodPlaceholder: "例如：不想說話、需要一點甜、假裝穩定。",
    random: "隨機一杯",
    reset: "重置",
    receipt: "小票",
    cup: "杯身預覽",
    total: "情緒濃度",
    stamp: "tea for two / choco design studio",
  },
  en: {
    eyebrow: "Tea studio / interactive",
    title: "Build a milk tea for today's mental weather.",
    body: "A small interaction surface: choose tea base, milk texture, sugar, ice, and toppings. The cup layers and receipt update instantly. No AI, no upload, no backend, just one temporarily stable drink.",
    base: "Tea base",
    milk: "Milk body",
    topping: "Topping",
    sugar: "Sugar",
    ice: "Ice",
    mood: "Today's note",
    moodPlaceholder: "For example: no talking, needs sweetness, pretending to be stable.",
    random: "Random cup",
    reset: "Reset",
    receipt: "Receipt",
    cup: "Cup preview",
    total: "Mood density",
    stamp: "tea for two / choco design studio",
  },
} as const;

const teaBases: Choice[] = [
  {
    color: "#8b5a35",
    name: { "zh-CN": "阿萨姆红茶", "zh-TW": "阿薩姆紅茶", en: "Assam black tea" },
    note: { "zh-CN": "浓、直接、像凌晨的句号", "zh-TW": "濃、直接、像凌晨的句號", en: "Dense and direct, like a midnight full stop" },
  },
  {
    color: "#a47d4d",
    name: { "zh-CN": "焙火乌龙", "zh-TW": "焙火烏龍", en: "Roasted oolong" },
    note: { "zh-CN": "烟感、木质、慢一点", "zh-TW": "煙感、木質、慢一點", en: "Smoky, woody, slower" },
  },
  {
    color: "#6d8f60",
    name: { "zh-CN": "茉莉绿茶", "zh-TW": "茉莉綠茶", en: "Jasmine green tea" },
    note: { "zh-CN": "轻、冷、像刚洗过的玻璃", "zh-TW": "輕、冷、像剛洗過的玻璃", en: "Light and cold, like washed glass" },
  },
  {
    color: "#695247",
    name: { "zh-CN": "可可碎茶", "zh-TW": "可可碎茶", en: "Cacao tea" },
    note: { "zh-CN": "给 Choco 的苦甜版本", "zh-TW": "給 Choco 的苦甜版本", en: "A bittersweet version for Choco" },
  },
];

const milkBodies: Choice[] = [
  {
    color: "#ead8c0",
    name: { "zh-CN": "厚奶", "zh-TW": "厚奶", en: "Heavy milk" },
    note: { "zh-CN": "柔软覆盖一切", "zh-TW": "柔軟覆蓋一切", en: "Softly covers everything" },
  },
  {
    color: "#f3eadf",
    name: { "zh-CN": "燕麦奶", "zh-TW": "燕麥奶", en: "Oat milk" },
    note: { "zh-CN": "干净、植物、轻微自律", "zh-TW": "乾淨、植物、輕微自律", en: "Clean, plant-based, mildly disciplined" },
  },
  {
    color: "#dcc6a6",
    name: { "zh-CN": "焦糖奶", "zh-TW": "焦糖奶", en: "Caramel milk" },
    note: { "zh-CN": "一点烧焦的温柔", "zh-TW": "一點燒焦的溫柔", en: "A little burnt tenderness" },
  },
];

const toppings: Choice[] = [
  {
    name: { "zh-CN": "黑糖珍珠", "zh-TW": "黑糖珍珠", en: "Brown sugar pearls" },
    note: { "zh-CN": "底部有重量", "zh-TW": "底部有重量", en: "Weight at the bottom" },
  },
  {
    name: { "zh-CN": "仙草", "zh-TW": "仙草", en: "Grass jelly" },
    note: { "zh-CN": "切块的阴影", "zh-TW": "切塊的陰影", en: "Cubed shadow" },
  },
  {
    name: { "zh-CN": "奶盖", "zh-TW": "奶蓋", en: "Cheese foam" },
    note: { "zh-CN": "在上面假装平静", "zh-TW": "在上面假裝平靜", en: "Pretends to be calm on top" },
  },
  {
    name: { "zh-CN": "不要配料", "zh-TW": "不要配料", en: "No topping" },
    note: { "zh-CN": "今天先保持空白", "zh-TW": "今天先保持空白", en: "Leave it blank today" },
  },
];

const defaultOrder = {
  base: 0,
  ice: 35,
  milk: 0,
  mood: "",
  sugar: 50,
  topping: 0,
};

export default function AiPage() {
  const { locale } = useLanguage();
  const text = pageCopy[locale];
  const [order, setOrder] = useState(defaultOrder);
  const base = teaBases[order.base];
  const milk = milkBodies[order.milk];
  const topping = toppings[order.topping];

  const density = useMemo(() => Math.round((order.sugar + (100 - order.ice) + (order.milk + 1) * 12) / 3), [order]);

  function updateOrder(next: Partial<typeof order>) {
    setOrder((current) => ({ ...current, ...next }));
  }

  function randomize() {
    setOrder({
      base: Math.floor(Math.random() * teaBases.length),
      ice: [0, 25, 50, 75][Math.floor(Math.random() * 4)],
      milk: Math.floor(Math.random() * milkBodies.length),
      mood: "",
      sugar: [0, 30, 50, 70, 100][Math.floor(Math.random() * 5)],
      topping: Math.floor(Math.random() * toppings.length),
    });
  }

  return (
    <PageFrame>
      <section className="tea-studio">
        <div className="tea-intro">
          <p className="text-[10px] uppercase text-[var(--muted)]">{text.eyebrow}</p>
          <h1>{text.title}</h1>
          <p>{text.body}</p>
        </div>

        <div className="tea-layout">
          <div className="tea-controls">
            <ChoiceGroup label={text.base} locale={locale} onSelect={(baseIndex) => updateOrder({ base: baseIndex })} options={teaBases} selected={order.base} />
            <ChoiceGroup label={text.milk} locale={locale} onSelect={(milkIndex) => updateOrder({ milk: milkIndex })} options={milkBodies} selected={order.milk} />
            <ChoiceGroup label={text.topping} locale={locale} onSelect={(toppingIndex) => updateOrder({ topping: toppingIndex })} options={toppings} selected={order.topping} />

            <div className="tea-slider-panel">
              <Range label={text.sugar} onChange={(sugar) => updateOrder({ sugar })} suffix="%" value={order.sugar} />
              <Range label={text.ice} onChange={(ice) => updateOrder({ ice })} suffix="%" value={order.ice} />
            </div>

            <label className="tea-note" htmlFor="tea-mood">
              <span>{text.mood}</span>
              <textarea
                id="tea-mood"
                onChange={(event) => updateOrder({ mood: event.target.value })}
                placeholder={text.moodPlaceholder}
                value={order.mood}
              />
            </label>

            <div className="tea-actions">
              <button className="tea-action is-dark" onClick={randomize} type="button">
                {text.random}
              </button>
              <button className="tea-action" onClick={() => setOrder(defaultOrder)} type="button">
                {text.reset}
              </button>
            </div>
          </div>

          <div className="tea-preview-card">
            <div className="mb-4 flex items-center justify-between text-[10px] uppercase text-[var(--muted)]">
              <span>{text.cup}</span>
              <span>{text.stamp}</span>
            </div>

            <div
              className={`milk-tea-cup topping-${order.topping}`}
              style={
                {
                  "--base-color": base.color,
                  "--ice-opacity": order.ice / 100,
                  "--milk-color": milk.color,
                  "--milk-height": `${42 + order.milk * 8}%`,
                  "--sugar-height": `${Math.max(7, order.sugar / 4)}%`,
                } as CSSProperties
              }
            >
              <div className="cup-lid" />
              <div className="cup-straw" />
              <div className="cup-rim" />
              <div className="tea-liquid">
                <span className="tea-layer tea-base" />
                <span className="tea-layer tea-milk" />
                <span className="tea-layer tea-sugar" />
                <span className="ice-cube ice-1" />
                <span className="ice-cube ice-2" />
                <span className="ice-cube ice-3" />
                <span className="pearl p1" />
                <span className="pearl p2" />
                <span className="pearl p3" />
                <span className="pearl p4" />
                <span className="jelly j1" />
                <span className="jelly j2" />
                <span className="foam" />
              </div>
              <div className="cup-label">
                <span>CHoco</span>
                <span>tea studio</span>
              </div>
            </div>
          </div>

          <aside className="tea-receipt">
            <p className="text-[10px] uppercase text-[var(--muted)]">{text.receipt}</p>
            <h2>{base.name[locale]}</h2>
            <p>{base.note[locale]}</p>
            <div>
              <p>{text.milk}: {milk.name[locale]}</p>
              <p>{text.topping}: {topping.name[locale]}</p>
              <p>{text.sugar}: {order.sugar}%</p>
              <p>{text.ice}: {order.ice}%</p>
              <p>{text.total}: {density}%</p>
            </div>
            {order.mood && <blockquote>{order.mood}</blockquote>}
            <span>{text.stamp}</span>
          </aside>
        </div>
      </section>
    </PageFrame>
  );
}

function ChoiceGroup({
  label,
  locale,
  onSelect,
  options,
  selected,
}: {
  label: string;
  locale: Locale;
  onSelect: (index: number) => void;
  options: Choice[];
  selected: number;
}) {
  return (
    <section className="tea-choice-group">
      <p>{label}</p>
      <div className="tea-choice-list">
        {options.map((option, index) => (
          <button aria-pressed={selected === index} className="tea-choice" key={option.name.en} onClick={() => onSelect(index)} type="button">
            <span>{option.name[locale]}</span>
            <small>{option.note[locale]}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function Range({
  label,
  onChange,
  suffix,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  suffix: string;
  value: number;
}) {
  return (
    <label className="tea-range">
      <span>
        {label}
        <b>
          {value}
          {suffix}
        </b>
      </span>
      <input max="100" min="0" onChange={(event) => onChange(Number(event.target.value))} type="range" value={value} />
    </label>
  );
}
