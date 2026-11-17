/* =========================================================
 *  越南跨年之旅 — 資料檔
 *  要改航班、住宿、待辦、待買、會話卡、緊急電話，只改這個檔案。
 *  注意：這個 repo 是公開的，不要放訂位代號、護照號碼、個人電話。
 * ========================================================= */

/* Apps Script 網頁應用程式網址（部署後貼在引號裡；空白＝單機模式） */
const API_URL = '';

const TRIP = {
  title: '越南跨年之旅',
  appName: 'Family trip',
  dest: '越南・胡志明市',
  destLocal: 'Thành phố Hồ Chí Minh',
  tz: 'Asia/Ho_Chi_Minh',          // 行程當地時區（比台灣慢 1 小時）
  tzOffset: '+07:00',
  depart: '2026-12-31T14:00:00+08:00', // 出發倒數的目標（去程起飛，台灣時間）
  days: [
    { key: '12/31', date: '2026-12-31', dow: '四' },
    { key: '1/1',   date: '2027-01-01', dow: '五' },
    { key: '1/2',   date: '2027-01-02', dow: '六' },
    { key: '1/3',   date: '2027-01-03', dow: '日' }
  ],
  pax: 4,
  cur: { code: 'VND', name: '越南盾', sym: '₫', unit: 10000 },  // unit：匯率顯示用（1 萬盾 = 多少台幣）
  home: { code: 'TWD', name: '台幣', sym: 'NT$' },
  defaultRate: 0.00122,            // 抓不到匯率時的備用值：1 越南盾 ≈ 0.00122 台幣
  navMode: 'transit',              // 旅行當天點景點的導航方式：transit 大眾運輸／driving 開車（估 Grab 車程）
  enterLocal: 'Nhấn để vào',
  doneStamp: 'ĐÃ XONG'             // 打勾印章上的字（越南文「完成」）
};

/* 圖片：封面與分頁橫幅。用 Gemini 畫好後放進 images/，改這裡的檔名即可。
 * banners 可不設；要用的話寫成 { home:'images/b-home.jpg', flight:'…', itin:'…', prep:'…', wallet:'…' } */
const IMG = { cover: 'images/cover.svg', banners: null };

/* 組別（只有一組時，畫面不會出現組別切換） */
const GROUPS = [{ id: 'A', name: '全家' }];

/* 天氣城市（Open-Meteo 用經緯度） */
const CITIES = [
  { name: '胡志明市', local: 'TP. Hồ Chí Minh', lat: 10.7769, lon: 106.7009 }
];

/* ---------- 航班 ---------- */
const FLIGHTS = [
  {
    id: 'out', group: 'A', dir: '去程', date: '2026-12-31', dow: '四',
    airline: '星宇航空', no: 'JX713',
    from: { code: 'TPE', city: '桃園', term: 'T2', time: '14:00' },
    to:   { code: 'SGN', city: '胡志明市', term: 'T2', time: '16:50' },
    dur: '3 時 50 分', note: '兩地時差 1 小時（越南較慢）'
  },
  {
    id: 'back', group: 'A', dir: '回程', date: '2027-01-03', dow: '日',
    airline: '星宇航空', no: 'JX714',
    from: { code: 'SGN', city: '胡志明市', term: 'T2', time: '18:00' },
    to:   { code: 'TPE', city: '桃園', term: 'T2', time: '22:20' },
    dur: '3 時 20 分', note: '要退稅請提早到機場'
  }
];

/* ---------- 住宿（訂好後照範例填，可以有很多段） ----------
 * nights：這間住哪幾晚（用「每日」的日期寫法）
 * addrLocal：越南文地址，「給司機看」會用大字顯示
 */
const HOTELS = [
  /* 範例：
  {
    name: '飯店中文或英文名',
    nameLocal: 'Khách sạn ...',
    addrLocal: '123 Đường Lê Lợi, Phường Bến Thành, TP. Hồ Chí Minh',
    tel: '+84 28 0000 0000',
    checkin: '14:00', checkout: '12:00',
    station: '地鐵 1 號線 Bến Thành 站 步行 5 分',
    nights: ['12/31', '1/1', '1/2']
  }
  */
];

/* ---------- 預設行程（第一次登入會寫進試算表，之後以試算表為準） ---------- */
const DAYS = [
  { date: '12/31', title: '抵達西貢・跨年倒數', hotel: '尚未安排', pax: 4 },
  { date: '1/1',   title: '市中心經典散步',     hotel: '尚未安排', pax: 4 },
  { date: '1/2',   title: '古芝地道・濱城市場', hotel: '尚未安排', pax: 4 },
  { date: '1/3',   title: '粉紅教堂・採買・回家', hotel: '', pax: 4 }
];

/* 欄位：date 日期, time 時間, type 類型(景點/餐廳/交通/備註), text 內容, trans 交通,
 *       place 地點(Google 地圖搜尋字), close 關門時間, group 組別, pax 人數, tbd 待定, note 備註 */
const ITIN = [
  // 12/31（四）
  { date: '12/31', time: '11:30', type: '交通', text: '桃園機場 T2 集合・報到託運', trans: '', place: '桃園國際機場第二航廈', note: '起飛前 2.5 小時到' },
  { date: '12/31', time: '14:00', type: '交通', text: '星宇 JX713 起飛', trans: '飛機', place: '', note: '16:50 抵達新山一機場 T2（當地時間）' },
  { date: '12/31', time: '16:50', type: '交通', text: '抵達胡志明市・入境領行李', trans: '', place: 'Sân bay Tân Sơn Nhất', note: '出示電子簽證；機場換一點越南盾、買網卡' },
  { date: '12/31', time: '18:30', type: '交通', text: 'Grab 前往住宿 check-in', trans: 'Grab', place: '', tbd: true, note: '跨年夜市中心傍晚起封路，車只能到管制區外' },
  { date: '12/31', time: '19:30', type: '餐廳', text: '晚餐（住宿附近）', trans: '步行', place: '', tbd: true },
  { date: '12/31', time: '21:30', type: '景點', text: '阮惠步行街 跨年倒數', trans: '步行', place: 'Phố đi bộ Nguyễn Huệ', note: '人非常多，手機錢包放前面；約定走散的會合點' },
  { date: '12/31', time: '23:45', type: '景點', text: '西貢河畔看跨年煙火', trans: '步行', place: 'Bến Bạch Đằng', note: '往年 00:00–00:15 施放，地點以市府公告為準' },

  // 1/1（五）
  { date: '1/1', time: '09:00', type: '餐廳', text: '早餐：越南河粉 Phở', trans: 'Grab', place: 'Phở Hòa Pasteur', tbd: true },
  { date: '1/1', time: '10:00', type: '景點', text: '統一宮（獨立宮）', trans: 'Grab', place: 'Dinh Độc Lập', close: '16:30' },
  { date: '1/1', time: '12:00', type: '餐廳', text: '午餐', trans: '步行', place: '', tbd: true },
  { date: '1/1', time: '13:30', type: '景點', text: '戰爭遺跡博物館', trans: '步行', place: 'Bảo tàng Chứng tích Chiến tranh', close: '17:30', tbd: true, note: '部分展區照片較沉重，可視家人狀況調整' },
  { date: '1/1', time: '15:30', type: '景點', text: '西貢聖母院（外觀）＋中央郵局', trans: 'Grab', place: 'Bưu điện Trung tâm Sài Gòn', close: '18:00', note: '聖母院整修中，只能看外觀' },
  { date: '1/1', time: '16:30', type: '景點', text: '胡志明市書街', trans: '步行', place: 'Đường Sách Nguyễn Văn Bình' },
  { date: '1/1', time: '17:30', type: '景點', text: '咖啡公寓 喝咖啡看夜景', trans: '步行', place: '42 Nguyễn Huệ, Hồ Chí Minh' },
  { date: '1/1', time: '19:00', type: '餐廳', text: '晚餐', trans: '步行', place: '', tbd: true },
  { date: '1/1', time: '20:30', type: '景點', text: '西貢觀景台 Saigon Skydeck', trans: '步行', place: 'Bitexco Financial Tower', close: '21:30', tbd: true },

  // 1/2（六）
  { date: '1/2', time: '07:45', type: '交通', text: '飯店大廳集合・包車往古芝', trans: '包車', place: '', note: '車程約 1.5 小時；也可改成湄公河（美萩）一日遊' },
  { date: '1/2', time: '09:30', type: '景點', text: '古芝地道（Bến Đình）', trans: '', place: 'Địa đạo Củ Chi Bến Đình', close: '17:00', note: '穿好走的鞋，防蚊液' },
  { date: '1/2', time: '12:30', type: '餐廳', text: '午餐', trans: '', place: '', tbd: true },
  { date: '1/2', time: '14:00', type: '交通', text: '回市區', trans: '包車', place: '' },
  { date: '1/2', time: '16:00', type: '景點', text: '濱城市場 逛街採買', trans: '', place: 'Chợ Bến Thành', close: '18:00', note: '記得殺價；晚上外圍有夜市' },
  { date: '1/2', time: '18:30', type: '餐廳', text: '晚餐', trans: '步行', place: '', tbd: true },
  { date: '1/2', time: '20:00', type: '景點', text: '按摩 Spa／碧文街散步', trans: 'Grab', place: 'Phố đi bộ Bùi Viện', tbd: true },

  // 1/3（日）
  { date: '1/3', time: '08:30', type: '餐廳', text: '早餐：越式法國麵包 Bánh mì', trans: '步行', place: '', tbd: true },
  { date: '1/3', time: '09:30', type: '景點', text: '粉紅教堂（耶穌聖心堂）', trans: 'Grab', place: 'Nhà thờ Tân Định', note: '週日有彌撒，以外觀拍照為主' },
  { date: '1/3', time: '10:30', type: '景點', text: '新定市場', trans: '步行', place: 'Chợ Tân Định' },
  { date: '1/3', time: '12:00', type: '備註', text: '退房・行李寄放櫃檯', trans: '', place: '' },
  { date: '1/3', time: '12:30', type: '餐廳', text: '午餐', trans: '', place: '', tbd: true },
  { date: '1/3', time: '13:30', type: '景點', text: '超市買伴手禮', trans: 'Grab', place: 'Saigon Centre', tbd: true },
  { date: '1/3', time: '14:45', type: '交通', text: '飯店集合・Grab 往機場', trans: 'Grab', place: 'Sân bay Tân Sơn Nhất', note: '週日下午容易塞車，抓 45 分鐘以上' },
  { date: '1/3', time: '15:30', type: '備註', text: '新山一 T2 報到・退稅・安檢', trans: '', place: '', note: '退稅要先給海關看商品，再去託運' },
  { date: '1/3', time: '18:00', type: '交通', text: '星宇 JX714 起飛', trans: '飛機', place: '', note: '22:20 抵達桃園 T2（台灣時間）' }
];

/* 整天覆寫：例如 { id: 'p1', date: '1/2', items: [ ...跟 ITIN 同格式... ] }
 * 每個 id 只會套用一次，套用前會自動備份到「行程備份」分頁。 */
const ITIN_PATCHES = [];

/* ---------- 出發前待辦（每個人可以自己增減、打勾） ---------- */
const TODO = [
  { id: 't1',  text: '確認護照效期還有 6 個月以上' },
  { id: 't2',  text: '申請越南電子簽證 e-visa（每人 US$25，出發前 2–3 週送件）' },
  { id: 't3',  text: '電子簽證 PDF 存手機＋印一份紙本' },
  { id: 't4',  text: '訂好 3 晚住宿，把地址填進網站' },
  { id: 't5',  text: '買旅平險／不便險' },
  { id: 't6',  text: '買越南網卡或 eSIM' },
  { id: 't7',  text: '下載 Grab 並綁定信用卡' },
  { id: 't8',  text: '下載胡志明市離線 Google 地圖' },
  { id: 't9',  text: '準備美金或台幣現鈔（到當地換越南盾）' },
  { id: 't10', text: '出發前 3 天內填 PAI 入境預先申報（非強制，可加快通關）' },
  { id: 't11', text: '星宇線上報到（起飛前 48 小時開放）' },
  { id: 't12', text: '準備常用藥、防蚊液、防曬' },
  { id: 't13', text: '把這個網站加到手機主畫面' }
];

/* ---------- 待買清單 ---------- */
const BUY = [
  { id: 'b1', text: '越南咖啡粉／G7 即溶咖啡' },
  { id: 'b2', text: '滴漏咖啡壺 Phin' },
  { id: 'b3', text: '腰果、果乾（芒果乾、菠蘿蜜乾）' },
  { id: 'b4', text: '椰子糖、綠豆糕' },
  { id: 'b5', text: 'Marou 巧克力' },
  { id: 'b6', text: '河粉／Hảo Hảo 泡麵' },
  { id: 'b7', text: '藤編包、刺繡小物' }
];

/* ---------- 記帳 ---------- */
const CATS = ['餐飲', '交通', '景點', '購物', '住宿', '按摩娛樂', '其他'];
const QUICK = {
  VND: [20000, 50000, 100000, 200000, 500000],   // 一杯咖啡、一碗河粉、Grab、一餐、按摩
  TWD: [50, 100, 200, 500, 1000]
};

/* ---------- 越南語會話卡 ---------- */
const PHRASES = [
  { zh: '你好', lo: 'Xin chào', cat: '基本' },
  { zh: '謝謝', lo: 'Cảm ơn', cat: '基本' },
  { zh: '不好意思／對不起', lo: 'Xin lỗi', cat: '基本' },
  { zh: '我不會說越南語', lo: 'Tôi không biết tiếng Việt', cat: '基本' },
  { zh: '請幫我們拍照好嗎？', lo: 'Chụp ảnh giúp chúng tôi được không?', cat: '基本' },
  { zh: '我們四個人', lo: 'Chúng tôi có bốn người', cat: '點餐' },
  { zh: '請給我菜單', lo: 'Cho tôi xem thực đơn', cat: '點餐' },
  { zh: '我要這個', lo: 'Cho tôi cái này', cat: '點餐' },
  { zh: '不要辣', lo: 'Không cay', cat: '點餐' },
  { zh: '不要香菜', lo: 'Không bỏ ngò (rau mùi)', cat: '點餐' },
  { zh: '不要冰塊', lo: 'Không đá', cat: '點餐' },
  { zh: '少糖', lo: 'Ít đường', cat: '點餐' },
  { zh: '內用／外帶', lo: 'Ăn ở đây / Mang về', cat: '點餐' },
  { zh: '我對花生過敏', lo: 'Tôi bị dị ứng đậu phộng', cat: '過敏' },
  { zh: '我對海鮮過敏', lo: 'Tôi bị dị ứng hải sản', cat: '過敏' },
  { zh: '這個多少錢？', lo: 'Cái này bao nhiêu tiền?', cat: '結帳' },
  { zh: '可以便宜一點嗎？', lo: 'Bớt một chút được không?', cat: '結帳' },
  { zh: '請結帳', lo: 'Tính tiền', cat: '結帳' },
  { zh: '可以刷卡嗎？', lo: 'Có thể trả bằng thẻ không?', cat: '結帳' },
  { zh: '廁所在哪裡？', lo: 'Nhà vệ sinh ở đâu?', cat: '問路' },
  { zh: '請帶我去這個地址', lo: 'Làm ơn đưa tôi đến địa chỉ này', cat: '問路' },
  { zh: '請在這裡停車', lo: 'Dừng ở đây', cat: '問路' },
  { zh: '我迷路了', lo: 'Tôi bị lạc đường', cat: '問路' },
  { zh: '請幫幫我', lo: 'Làm ơn giúp tôi', cat: '緊急' },
  { zh: '請幫我叫救護車', lo: 'Làm ơn gọi xe cấp cứu', cat: '緊急' },
  { zh: '我的護照不見了', lo: 'Tôi bị mất hộ chiếu', cat: '緊急' }
];

/* ---------- 緊急電話（查證日期 2026-11-17，來源見 README） ---------- */
const SOS = [
  { name: '報警', tel: '113', note: '越南全國通用，接聽多為越南語' },
  { name: '救護車', tel: '115', note: '越南全國通用' },
  { name: '消防', tel: '114', note: '越南全國通用' },
  { name: '胡志明市觀光資訊專線', tel: '1087', note: '市觀光局專線（越／英語）；出發前請再確認是否仍服務' },
  { name: '駐胡志明市辦事處 急難救助', tel: '+84903927019', show: '+84-903-927-019', note: '24 小時，車禍、搶劫等緊急狀況專用；越南境內撥 0903-927-019' },
  { name: '駐胡志明市辦事處 辦公室', tel: '+842838349160', show: '+84-28-3834-9160', note: '上班時間 08:00–17:30；護照遺失等一般事項' },
  { name: '外交部旅外國人急難救助', tel: '+886800085095', show: '+886-800-085-095', note: '24 小時全球免付費專線' }
];
const SOS_OFFICE = {
  name: '駐胡志明市台北經濟文化辦事處',
  addr: '336 Nguyễn Tri Phương, Phường Vườn Lài, TP. Hồ Chí Minh'
};

/* ---------- 旅遊須知（查證日期 2026-11-17） ---------- */
const TIPS = [
  { t: '簽證', d: '台灣護照需要先辦電子簽證 e-visa：單次 US$25，官方審核約 3 個工作天（建議提早 2–3 週）。只在官方網站 evisa.gov.vn 申請，其他多是加價代辦。護照效期要 6 個月以上。' },
  { t: '入境申報', d: '越南有 PAI 入境預先申報（prearrival.immigration.gov.vn），抵達前 3 天內可填，目前是「非強制」，填了通關較快。健康申報目前沒有全面強制，出發前再看一次官方公告。' },
  { t: '錢與刷卡', d: '路邊攤、市場、小店幾乎只收現金；百貨、飯店、連鎖店可刷卡。鈔票面額零很多，2 萬與 50 萬都是藍色，付錢前數一下零。換錢到銀行或有掛牌的金飾店。' },
  { t: '交通', d: '市區移動以 Grab 最方便（上車前價錢就固定）。計程車選 Vinasun 或 Mai Linh 並請司機跳表。地鐵 1 號線（濱城—仙泉）可到市中心幾站。過馬路請慢慢、等速前進，不要突然停或跑。' },
  { t: '跨年夜', d: '12/31 傍晚起市中心（阮惠步行街、西貢河畔一帶）會交通管制，車進不去、人潮非常多。隨身物品放前面，先約好走散時的會合點。' },
  { t: '安全', d: '在路邊用手機要小心機車搶奪：手機拿在靠建築物那一側，包包斜背在身前。' },
  { t: '飲食', d: '不要喝生水，買瓶裝水。冰塊在正規店家通常沒問題，腸胃敏感的人可以說「Không đá」不要冰。' },
  { t: '小費', d: '沒有強制小費。按摩通常會給技師小費（店家多有建議金額），飯店行李、房務可給 2–5 萬盾。' },
  { t: '退稅', d: '同一天、同一家有退稅標章的店買滿 200 萬盾可退稅，實拿約為稅額的 85%。要在出境前 60 天內購買，離境時先把商品與發票給海關查驗（最晚起飛前 30 分鐘），再去託運。要退稅請至少提早 3 小時到機場。' },
  { t: '電子菸', d: '越南自 2025 年起禁止電子菸與加熱菸，請不要攜帶入境。' },
  { t: '電壓與時差', d: '電壓 220V，插座多為雙圓孔與雙扁孔通用，台灣插頭大多能直接插；注意電器是否支援 220V。時間比台灣慢 1 小時。' },
  { t: '回程機場', d: '新山一國際線在 T2。假日車多、安檢排隊長，建議起飛前 2.5–3 小時抵達。' }
];
