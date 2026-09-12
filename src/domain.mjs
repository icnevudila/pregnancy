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
export const extendedDefaults = {
  version:2,dueDate:'',birthDate:'',profileComplete:false,waterGoal:8,dailyDate:localDay(),
  savedArticles:[],readArticles:[],weights:[],appointments:[],kickSessions:[],contractionSessions:[],
  journal:[],lists:defaultLists,birthPlan:{},activeKick:null,activeContraction:null,
};
export function migrateState(saved = {}, defaults = {}, now = new Date()) {
  const safe = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  const state = {...defaults,...extendedDefaults,...safe,version:2};
  for(const key of ['records','notes','favorites','messages','savedArticles','readArticles','weights','appointments','kickSessions','contractionSessions','journal'])state[key]=Array.isArray(state[key])?state[key]:[];
  state.lists = Object.fromEntries(Object.entries(defaultLists).map(([key,items])=>[key,Array.isArray(safe.lists?.[key])?safe.lists[key]:items.map(item=>({...item}))]));
  if(state.dailyDate!==localDay(now)){state.dailyDate=localDay(now);state.water=0;state.vitamin=false;state.mood=null;state.postpartumMood=null;}
  return state;
}
