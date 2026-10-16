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
  | 'glasses'
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
        text: '保養品用塑膠袋包好，放托運行李',
      },
      { icon: 'lighter', title: '打火機', text: '放身上、不可托運' },
      {
        icon: 'battery',
        title: '行動電源',
        text: '不用帶，若想備用請放身上、不可托運\n飛機座位有 110V 插座、租車也能充電，可以隨身攜帶充電器、充電線',
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
        text: '帶 4〜5 天份就夠：\n11/20、11/21 住飫肥、\n11/24、11/25 住鹿兒島，\n這兩個包棟住處都有洗烘衣機',
      },
      { icon: 'coat', title: '大小外套', text: '山區早晚約 8 度\n平地以薄長袖為基底的洋蔥式穿搭' },
      {
        icon: 'toiletries',
        title: '盥洗用品',
        text: '牙刷、牙膏須自備\n毛巾住處都有提供',
      },
      {
        icon: 'pill',
        title: '常備藥',
        text: '備足每日日常用藥、暈車藥\n藥品留著原包裝或藥袋，入境日本時可能會被檢查',
      },
      { icon: 'glasses', title: '老花眼鏡', text: '日文看不懂沒關係，至少要看得清楚' },
      {
        icon: 'shoes',
        title: '好走的鞋',
        text: '神社和城下町石階、坡道多，建議穿平常常穿、合腳的鞋',
      },
      {
        icon: 'yen',
        title: '日幣現金',
        text: '領隊小吳會幫大家換好日幣，到機場發放',
      },
    ],
  },
  {
    title: '出入境',
    ja: '出入国',
    items: [
      {
        icon: 'qr',
        title: '日本入境資料',
        text: '領隊小吳會幫大家填好，入境時出示 QR Code 即可',
      },
      {
        icon: 'meat',
        title: '不能帶入境',
        text: '肉製品（肉乾、肉鬆、含肉的泡麵或調理包）、新鮮水果和蔬菜都不行',
      },
      {
        icon: 'alcohol',
        title: '菸酒',
        text: '燒酎等酒類每人限帶 1 公升\n香菸每人限帶 1 條（200 支）',
      },
    ],
  },
];
