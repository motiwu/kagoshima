/** 行前須知 */

export const MEETING = {
  time: '13:00',
  place: '台中機場',
} as const;

/** 星宇航空，時間都是當地時間 */
export const FLIGHTS = [
  { label: '去程', date: '11/19（四）', no: 'JX316', from: '台中', depart: '15:05', to: '熊本', arrive: '18:15' },
  { label: '回程', date: '11/26（四）', no: 'JX317', from: '熊本', depart: '19:15', to: '台中', arrive: '21:05' },
] as const;

export type PrepIcon =
  | 'carry-on'
  | 'checked'
  | 'laundry'
  | 'liquid'
  | 'lighter'
  | 'battery'
  | 'passport'
  | 'pill'
  | 'toiletries'
  | 'shoes'
  | 'coat'
  | 'yen'
  | 'qr'
  | 'meat'
  | 'alcohol'
  | 'onsen';

export type PrepItem = { icon: PrepIcon; title: string; text?: string };

export const PREP_GROUPS: { title: string; ja: string; items: PrepItem[] }[] = [
  {
    title: '行李',
    ja: '荷物',
    items: [
      { icon: 'carry-on', title: '隨身行李', text: '每人 7 公斤' },
      {
        icon: 'checked',
        title: '托運行李',
        text: '每個家庭 1 個行李箱＋1 個旅行袋，各 23 公斤',
      },
    ],
  },
  {
    title: '登機規定',
    ja: '機内持ち込み',
    items: [
      {
        icon: 'liquid',
        title: '液體',
        text: '保養品用塑膠袋包好，放托運行李箱',
      },
      { icon: 'lighter', title: '打火機', text: '放身上，不能放行李箱' },
      {
        icon: 'battery',
        title: '行動電源',
        text: '不用帶，若想備用，記得要放身上\n飛機座位有 110V 插座、租車也能充電，可以隨身攜帶充電器、充電線',
      },
    ],
  },
  {
    title: '記得帶',
    ja: '持ち物',
    items: [
      { icon: 'passport', title: '護照' },
      {
        icon: 'laundry',
        title: '換洗衣物',
        text: '帶 4〜5 天份就夠：11/20、11/21 住飫肥，11/24、11/25 住重富，這兩個包棟住處都有洗衣機',
      },
      {
        icon: 'toiletries',
        title: '盥洗用品',
        text: '牙刷、牙膏須自備；毛巾住處都有提供',
      },
      {
        icon: 'pill',
        title: '常備藥',
        text: '備足每日日常用藥、暈車藥\n藥品留著原包裝或藥袋，入境日本時可能會被檢查',
      },
      {
        icon: 'shoes',
        title: '好走的鞋',
        text: '神社和城下町石階、坡道多，建議穿平常常穿、合腳的鞋',
      },
      { icon: 'coat', title: '大小外套', text: '山區早晚約 8 度' },
      {
        icon: 'yen',
        title: '日幣現金',
        text: '領隊小吳會幫大家換好日幣，到機場發放',
      },
    ],
  },
  {
    title: '入境與回國',
    ja: '入国と帰国',
    items: [
      {
        icon: 'qr',
        title: '入境資料',
        text: '領隊小吳會幫大家填好，入境時出示 QR Code 即可',
      },
      {
        icon: 'meat',
        title: '不能帶到日本和台灣',
        text: '肉製品（黑豬肉乾、肉鬆、含肉的泡麵或調理包）、新鮮水果和蔬菜（像櫻島小蜜柑）都不行，在當地吃完就好',
      },
      {
        icon: 'alcohol',
        title: '燒酎等酒類',
        text: '每人限帶 1 公升',
      },
    ],
  },
];
