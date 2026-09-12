export const localDay = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function parseDay(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const [y,m,d] = value.split('-').map(Number);
  const date = new Date(y,m-1,d,12);
  return date.getFullYear() === y && date.getMonth() === m-1 && date.getDate() === d ? date : null;
}
export const daysBetween = (a,b) => Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/86400000);
export function pregnancyAt(state, now = new Date()) {
  const due = parseDay(state.dueDate);
  const elapsed = due ? 280-daysBetween(now,due) : Number(state.week || 24)*7;
  return { week: Math.max(4,Math.min(40,Math.floor(elapsed/7))), day: Math.max(0,elapsed%7), remaining: due ? daysBetween(now,due) : (40-Number(state.week||24))*7 };
}
export function dateLabel(value) { const date = parseDay(value); return date ? date.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'}) : value || ''; }
export const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
export const normalizeSearch = text => String(text || '').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
export function numericInput(value, min, max) { const str=String(value).trim().replace(',','.'); if(!/^\d+(\.\d+)?$/.test(str))return null; const n=Number(str);return n>=min && n<=max ? n : null; }
export function validateAppointment(entry) {
  if(!entry.title?.trim())return 'Randevuya bir ad ver.';
  if(!parseDay(entry.date))return 'Geçerli bir tarih yaz. Örnek: 2026-10-15';
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(entry.time||''))return 'Saati 24 saat biçiminde yaz. Örnek: 10:30';
  return null;
}
export const upsertEntry = (items, entry) => [entry,...items.filter(item=>item.id!==entry.id)];
export const secondsLabel = seconds => `${String(Math.floor(Math.max(0,seconds)/60)).padStart(2,'0')}:${String(Math.floor(Math.max(0,seconds)%60)).padStart(2,'0')}`;
export const defaultLists = {
  bag: [ ['Anne','Kimlik ve hastane belgeleri'],['Anne','Rahat kıyafet ve terlik'],['Anne','Kişisel bakım çantası'],['Anne','Telefon ve şarj cihazı'],['Bebek','Mevsime uygun kıyafet'],['Bebek','Bebek bezi'],['Bebek','Battaniye'],['Yolculuk','Dönüş için bebek oto koltuğu'] ].map(([group,text],i)=>({id:`bag-${i}`,group,text,done:false})),
  questions: [], todos: [],
};
export const sampleWeights = [
  { id: 'w1', value: 65.4, week: 24, date: '12 Eylül 2026', time: '08:30' },
  { id: 'w2', value: 64.9, week: 23, date: '5 Eylül 2026', time: '08:45' },
  { id: 'w3', value: 64.2, week: 22, date: '29 Ağustos 2026', time: '08:15' },
  { id: 'w4', value: 60.0, week: 12, date: '15 Haziran 2026', time: '09:00' },
];

export const sampleKickSessions = [
  { id: 'ks1', count: 10, duration: 18 * 60, date: '12 Eylül 2026', time: '14:25', week: 24 },
  { id: 'ks2', count: 10, duration: 22 * 60, date: '11 Eylül 2026', time: '20:10', week: 24 },
  { id: 'ks3', count: 10, duration: 15 * 60, date: '10 Eylül 2026', time: '13:45', week: 23 },
];

export const sampleContractionSessions = [
  { id: 'cs1', duration: 42, interval: 8 * 60, date: '12 Eylül 2026', time: '16:10', intensity: 'Hafif' },
  { id: 'cs2', duration: 48, interval: 9 * 60, date: '12 Eylül 2026', time: '16:18', intensity: 'Orta' },
];

export const extendedDefaults = {
  version:2,dueDate:'2026-07-24',birthDate:'',profileComplete:true,waterGoal:8,dailyDate:localDay(),
  savedArticles:[],readArticles:[],
  weights:sampleWeights,
  appointments:[{ id: 'app1', title: 'Detaylı Ultrason Kontrolü', date: '2026-05-16', time: '10:00' }],
  kickSessions:sampleKickSessions,
  contractionSessions:sampleContractionSessions,
  journal:[],lists:defaultLists,birthPlan:{ bp1: true, bp4: true, bp6: true },activeKick:null,activeContraction:null,
};
export function migrateState(saved = {}, defaults = {}, now = new Date()) {
  const safe = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  const state = {...defaults,...extendedDefaults,...safe,version:2};
  for(const key of ['records','notes','favorites','messages','savedArticles','readArticles','weights','appointments','kickSessions','contractionSessions','journal','favNames','vitaminsList'])state[key]=Array.isArray(state[key])&&state[key].length?state[key]:(extendedDefaults[key]||[]);
  state.birthPlan = typeof safe.birthPlan === 'object' && safe.birthPlan && !Array.isArray(safe.birthPlan) ? safe.birthPlan : extendedDefaults.birthPlan;
  state.lists = Object.fromEntries(Object.entries(defaultLists).map(([key,items])=>[key,Array.isArray(safe.lists?.[key])?safe.lists[key]:items.map(item=>({...item}))]));
  if(state.dailyDate!==localDay(now)){state.dailyDate=localDay(now);state.water=4;state.vitamin=true;state.mood=0;state.postpartumMood=null;}
  return state;
}
