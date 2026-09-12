import React, { useState } from 'react';
import { Modal, View, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, fonts } from './theme';
import { T, Tap, Card } from './ui';
import { Icon, BrandMark, FruitArt, MoodFace } from './Icons';
import { journeys, RecordList, sampleRecords } from './screens';
import { getWeekInfo, formatWeight, formatLength, trimesterLabel, monthLabel } from './weekData';
import { KickCounter, ContractionTimer, HospitalBag } from './ToolScreens';
import { WeightTracker, BirthPlanBuilder, DoctorQuestions, BabyNameMatcher } from './MoreToolScreens';
import { ToolsHub } from './ToolsHub';

const titles={
  journey:'Yolculuğun nerede?',profile:'Senin yolculuğun',appointment:'Doktor randevun',
  week:'Bu hafta ikiniz',log:'Yeni kayıt',records:'Günlük kayıtların',note:'Bugünü sakla',
  notes:'Sana ait notlar',article:'Güvenli bağ, küçük anlarla başlar',assistantAnswer:'Sorunu birlikte saklayalım',
  community:'Anneler birbirine iyi gelir',categories:'İhtiyacın olanı keşfet',sponsored:'Ürün önerileri',
  dailyMood:'Bugün nasıl hissediyorsun?',
  kickCounter:'Tekme Sayacı',contractionTimer:'Kasılma Sayacı',hospitalBag:'Doğum Çantası',
  weight:'Kilo Takibi & BMI',birthPlan:'Doğum Planı',doctorQuestions:'Doktora Sorular',babyNames:'Bebek İsim Rehberi',
  toolsHub:'Momora Araçlar',
};
export default function DetailSheet({ sheet, close, state, update, addRecord, choose, open, toast }) {
  const {kind,data={}}=sheet;
  const [text,setText]=useState(kind==='profile'?state.name:kind==='appointment'?state.appointment.title:'');
  const [secondary,setSecondary]=useState(kind==='profile'?state.babyName:kind==='appointment'?state.appointment.date:'');
  const [time,setTime]=useState(state.appointment.time);
  const [side,setSide]=useState('Sağ meme');
  const [selectedMood,setSelectedMood]=useState(state.mood??0);
  const [moodNote,setMoodNote]=useState('');
  const [error,setError]=useState('');
  function save(){
    if(kind==='profile'){if(!text.trim())return setError('Adını yazabilir misin?');update({name:text.trim(),babyName:secondary.trim()||'Ada'});}
    else if(kind==='appointment'){if(!text.trim()||!secondary.trim()||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))return setError('Randevu adını, tarihini ve saati (10:00 gibi) doldur.');update({appointment:{title:text.trim(),date:secondary.trim(),time}});}
    else if(kind==='log'){
      if(data.type==='Bez')addRecord(data.type,side==='Sağ meme'?'Temiz':side);
      else {const number=Number(text.replace(',','.'));if(!Number.isFinite(number)||number<=0||number>(data.type==='Biberon'?1000:1440))return setError('Geçerli bir miktar gir.');addRecord(data.type,data.type==='Biberon'?`${number} ml`:data.type==='Emzirme'?`${side} • ${number} dk`:`${number} dk`);}
    }else if(kind==='note'||kind==='week') {if(!text.trim())return setError('Önce küçük bir not yaz.');update(old=>({notes:[{id:Date.now().toString(),text:text.trim()},...old.notes]}));}
    else if(kind==='dailyMood') {
      const todayStr=new Date().toISOString().slice(0,10);
      const labels=['Harika','İyi','Normal','Yorgun','Zor'];
      update(old=>{
        const patch={mood:selectedMood,lastMoodDate:todayStr};
        if(moodNote.trim())patch.notes=[{id:Date.now().toString(),text:`[${labels[selectedMood]}] ${moodNote.trim()}`},...old.notes];
        return patch;
      });
      close();return toast('Günün kaydedildi 🌸');
    }
    close();toast('Kaydın saklandı');
  }
  const input=(label,value,onChange,props={})=><View style={{marginTop:16}}><T bold style={s.label}>{label}</T><TextInput accessibilityLabel={label} value={value} onChangeText={onChange} placeholderTextColor="#A79AA7" style={[s.input,props.multiline&&{minHeight:100,textAlignVertical:'top'}]} maxLength={props.multiline?1000:80} {...props}/></View>;
  const button=(label,onPress,secondary=false)=><Tap onPress={onPress} style={[s.button,secondary&&s.secondary]}><T bold style={{color:secondary?colors.purple:'white',fontSize:16}}>{label}</T></Tap>;
  return <Modal visible transparent animationType="fade" onRequestClose={close}><KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={s.backdrop}><Tap label="Pencereyi kapat" style={StyleSheet.absoluteFill} onPress={close}/><View style={s.sheet}><View style={s.handle}/><View style={s.heading}><View style={{flex:1}}><T style={s.kicker}>MOMORA · YANINDA</T><T bold style={s.title}>{kind==='log'?`${data.type} kaydı`:titles[kind]}</T></View><Tap onPress={close} label="Kapat" style={s.close}><Icon name="close" size={22}/></Tap></View><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingBottom:28}} showsVerticalScrollIndicator={false}>
    {kind==='journey'&&journeys.map(j=><Tap key={j.key} onPress={()=>{choose(j.key);close()}} style={s.option}><T bold style={{flex:1}}>{j.title.replace('\n',' ')}</T><Icon name="chevron"/></Tap>)}
    {kind==='profile'&&<><View style={s.profileHeader}><BrandMark size={55}/><View><T bold style={{fontSize:19}}>{state.name}</T><T style={s.body}>Her adımda, daha güçlü bir sen.</T></View></View>{input('Adın',text,setText)}{input('Bebeğinin adı',secondary,setSecondary)}{button('Bilgilerimi kaydet',save)}{button('Yolculuğumu değiştir',()=>open('journey'),true)}{button(`Notlarım (${state.notes.length})`,()=>open('notes'),true)}<T style={s.demo}>Yerel demo · Kayıtlar bu cihazda saklanır.{ '\n' }Supabase bağlantısı sonraki aşamada eklenecek.</T></>}
    {kind==='appointment'&&<>{input('Randevu adı',text,setText)}{input('Tarih',secondary,setSecondary,{placeholder:'16 Mayıs Cuma'})}{input('Saat',time,setTime,{placeholder:'10:00',maxLength:5})}{button('Randevuyu kaydet',save)}<T style={s.demo}>Randevu günlüğüne kaydedilir; bu demoda telefon bildirimi gönderilmez.</T></>}
    {kind==='log'&&<><T style={s.body}>{data.type==='Bez'?'Alt değiştirme kaydını ekle.':'Küçük bir kayıt, günün akışını hatırlamana yardımcı olur.'}</T>{data.type==='Emzirme'&&<View style={s.chips}>{['Sağ meme','Sol meme'].map(v=><Tap key={v} onPress={()=>setSide(v)} style={[s.chip,side===v&&s.chipSelected]}><T>{v}</T></Tap>)}</View>}{data.type==='Bez'?<View style={s.chips}>{['Temiz','Islak','Kirli'].map(v=><Tap key={v} onPress={()=>setSide(v)} style={[s.chip,(side===v||v==='Temiz'&&side==='Sağ meme')&&s.chipSelected]}><T>{v}</T></Tap>)}</View>:input(data.type==='Biberon'?'Miktar (ml)':'Süre (dakika)',text,setText,{keyboardType:'decimal-pad',placeholder:data.type==='Biberon'?'120':'15'})}{button('Kaydet',save)}</>}
    {kind==='records'&&<><T style={s.demo}>Yerel demo · Yeni kayıtların en üstte görünür.</T><RecordList records={[...state.records,...sampleRecords]}/></>}
    {(kind==='note'||kind==='week')&&<>{kind==='week'&&(()=>{
      const wi=getWeekInfo(data.week||24);
      return <>
        {/* Büyük meyve görseli */}
        <View style={ds.weekFruitBox}>
          <FruitArt type={wi.fruit} size={130}/>
          <View style={ds.weekFruitInfo}>
            <T bold style={{fontSize:22,color:'#4A2860'}}>{data.week||24}. Hafta</T>
            <T style={{fontSize:13,color:'#9A779A',marginTop:3}}>{monthLabel(wi.month)} · {trimesterLabel(wi.trimester)}</T>
            <View style={{flexDirection:'row',gap:16,marginTop:10}}>
              <View style={ds.weekStat}><Icon name="ruler" size={14} color="#9A779A"/><T style={ds.weekStatVal}>{formatLength(wi.lengthCm)}</T></View>
              <View style={ds.weekStat}><Icon name="scale" size={14} color="#9A779A"/><T style={ds.weekStatVal}>{formatWeight(wi.weightG)}</T></View>
            </View>
            <T style={{fontSize:12,color:'#C4A8D0',marginTop:6}}>{wi.fruitName} büyüklüğünde</T>
          </View>
        </View>
        {/* 3'lü Kıyaslama Şeridi */}
        <View style={{flexDirection:'row',gap:8,marginTop:12,backgroundColor:'#F4EEF7',padding:10,borderRadius:14}}>
          <View style={{flex:1,alignItems:'center'}}>
            <T style={{fontSize:16}}>🍏</T>
            <T bold numberOfLines={1} style={{fontSize:11,color:'#5C396B',marginTop:2}}>{wi.fruitName}</T>
            <T style={{fontSize:9,color:'#8C709A'}}>Meyve</T>
          </View>
          <View style={{width:1,backgroundColor:'#E1D2E6'}}/>
          <View style={{flex:1,alignItems:'center'}}>
            <T style={{fontSize:16}}>{wi.animalEmoji || '🐾'}</T>
            <T bold numberOfLines={1} style={{fontSize:11,color:'#5C396B',marginTop:2}}>{wi.animalName || 'Yavru'}</T>
            <T style={{fontSize:9,color:'#8C709A'}}>Hayvan</T>
          </View>
          <View style={{width:1,backgroundColor:'#E1D2E6'}}/>
          <View style={{flex:1,alignItems:'center'}}>
            <T style={{fontSize:16}}>{wi.sweetEmoji || '🧁'}</T>
            <T bold numberOfLines={1} style={{fontSize:11,color:'#5C396B',marginTop:2}}>{wi.sweetName || 'Tatlı'}</T>
            <T style={{fontSize:9,color:'#8C709A'}}>Tatlı / Nesne</T>
          </View>
        </View>
        {/* Ultrason Bilgisi */}
        {!!wi.ultrasound && (
          <View style={{marginTop:10,backgroundColor:'#FAF5FD',padding:12,borderRadius:14,borderWidth:1,borderColor:'#EBE0F2'}}>
            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
              <T bold style={{fontSize:12,color:'#5C396B'}}>🩺 {wi.ultrasound.scan}</T>
              <View style={{backgroundColor:'#E8D5EB',paddingHorizontal:6,paddingVertical:2,borderRadius:8}}>
                <T style={{fontSize:9,color:'#4A2860'}}>{wi.ultrasound.badge}</T>
              </View>
            </View>
            <T style={{fontSize:11,color:'#6A4878',marginTop:4,lineHeight:16}}>{wi.ultrasound.milestone}</T>
          </View>
        )}
        {/* Bebek bu hafta */}
        <T bold style={{fontSize:16,marginTop:18,marginBottom:8}}>🍼 Bebeğinde bu hafta</T>
        {wi.baby.map((b,i)=><View key={i} style={ds.bulletRow}><View style={ds.dot}/><T style={ds.bulletText}>{b}</T></View>)}
        {/* Anne bu hafta */}
        <T bold style={{fontSize:16,marginTop:16,marginBottom:8}}>💜 Sende bu hafta</T>
        {wi.mom.map((m,i)=><View key={i} style={ds.bulletRow}><View style={[ds.dot,{backgroundColor:'#D4A0C0'}]}/><T style={ds.bulletText}>{m}</T></View>)}
        <View style={ds.divider}/>
        {input('Bu haftana bir not bırak ✍️',text,setText,{multiline:true,placeholder:'Bugün ilk kez hissettim…'})}
        {button('Notumu sakla',save)}
      </>;
    })()}</>}}
    {kind==='notes'&&<>{state.notes.length?state.notes.map(n=><Card key={n.id} style={{marginTop:12}}><T style={{lineHeight:23}}>{n.text}</T><Tap label="Notu sil" onPress={()=>update(old=>({notes:old.notes.filter(x=>x.id!==n.id)}))} style={{alignSelf:'flex-end',paddingTop:12}}><T style={{fontSize:12,color:colors.muted}}>Sil</T></Tap></Card>):<T style={s.body}>Henüz not eklemedin. İlk küçük anını saklayabilirsin.</T>}{button('Yeni not ekle',()=>open('note'))}</>}
    {kind==='article'&&<><T style={s.demo}>Örnek içerik · MOMORA</T>{data.video?<T style={s.body}>Video henüz eklenmedi.</T>:['1. Birlikte geçirdiğiniz küçük anlara yer açın.','2. Onunla konuşun, sesinizi duymasını sağlayın.','3. Bebeğinizin tepkilerini tanımaya zaman ayırın.','4. Kendinize de dinlenmek için alan açın.','5. Her ailenin ritminin farklı olduğunu hatırlayın.'].map(v=><T key={v} style={[s.body,{marginBottom:14}]}>{v}</T>)}</>}
    {kind==='assistantAnswer'&&<><T bold style={{fontSize:18,lineHeight:25,marginTop:16}}>{data.question}</T><T style={s.body}>Sorunu notlarına ekledim. Bu yerel demoda canlı yapay zekâ bağlantısı henüz yok; gerçek yanıt üretmiyorum. Randevularını ve takip kayıtlarını buradan açabilirsin.</T>{button('Notlarıma git',()=>open('notes'))}{button('Takip kayıtlarını aç',()=>open('records'),true)}</>}
    {kind==='community'&&<><T style={s.body}>Buradaki paylaşım örnek veridir. Canlı topluluk Supabase bağlantısıyla birlikte açılacak.</T>{button('Kendime bir not bırak',()=>open('note'))}</>}
    {kind==='categories'&&['Bebek bezi','Islak mendil','Beslenme','Banyo'].map(v=><View key={v} style={s.option}><T>{v}</T></View>)}
    {kind==='sponsored'&&<T style={s.body}>Bu ürün kartları tasarım demosudur. Gerçek sponsor, satın alma bağlantısı veya ödeme işlemi yoktur. + düğmesiyle ürünleri yerel listene ekleyebilirsin.</T>}
    {kind==='dailyMood'&&(()=>{
      const labels=['Harika','İyi','Normal','Yorgun','Zor'];
      const moodMessages=[
        'Enerjin daim olsun! Bebeğinle harika bir gün seni bekliyor. ✨',
        'Huzurun ve dinginliğin hiç eksilmesin, harika gidiyorsun. 💛',
        'Her günün bir ritmi var; sakin ve dengeli anlar çok kıymetlidir. 🌿',
        'Bedenin mucizevi bir süreçten geçiyor, lütfen bugün kendine dinlenmek için alan aç. 🛌',
        'Yalnız değilsin; her duygunun bir yeri var. Sana sarılıyoruz, bugün kendine şefkat göster. 💜'
      ];
      return (
        <View style={{marginTop:6}}>
          <T style={s.body}>Günün ritmine başlamadan önce kendine bir an ayır. Bedenin ve kalbin bugün nasıl hissediyor?</T>
          <View style={[s.chips,{justifyContent:'space-between',marginVertical:18,gap:4}]}>
            {labels.map((label,idx)=>(
              <Tap
                key={label}
                label={'Ruh hali: '+label}
                onPress={()=>setSelectedMood(idx)}
                style={[
                  {alignItems:'center',paddingVertical:10,paddingHorizontal:6,borderRadius:18,borderWidth:1.5,borderColor:'transparent'},
                  selectedMood===idx&&{backgroundColor:'#F6EDF7',borderColor:'#BFA4C2'}
                ]}
              >
                <MoodFace index={idx} size={46}/>
                <T bold={selectedMood===idx} style={{fontSize:12,marginTop:6,color:selectedMood===idx?colors.purple:colors.ink}}>{label}</T>
              </Tap>
            ))}
          </View>
          <Card style={{backgroundColor:'#FAF5FA',padding:14,borderRadius:16,borderColor:'#EDE2EE',marginBottom:6}}>
            <T style={{fontSize:13,lineHeight:20,color:'#664770',textAlign:'center'}}>
              {moodMessages[selectedMood]||moodMessages[0]}
            </T>
          </Card>
          {input('Bugüne dair küçük bir not (opsiyonel)',moodNote,setMoodNote,{multiline:true,placeholder:'İçinden geçen bir his ya da an...'})}
          {button('Günüme Devam Et 🌸',save)}
          <Tap onPress={()=>{update({lastMoodDate:new Date().toISOString().slice(0,10)});close();}} style={{alignItems:'center',marginTop:14,padding:8}}>
            <T style={{fontSize:13,color:colors.muted}}>Şimdilik atla</T>
          </Tap>
        </View>
      );
    })()}
    {kind==='kickCounter'&&<KickCounter state={state} update={update} toast={toast} close={close}/>}
    {kind==='contractionTimer'&&<ContractionTimer state={state} update={update} toast={toast} close={close}/>}
    {kind==='hospitalBag'&&<HospitalBag state={state} update={update} toast={toast} close={close}/>}
    {kind==='weight'&&<WeightTracker state={state} update={update} toast={toast} close={close}/>}
    {kind==='birthPlan'&&<BirthPlanBuilder state={state} update={update} toast={toast} close={close}/>}
    {kind==='doctorQuestions'&&<DoctorQuestions state={state} update={update} toast={toast} close={close}/>}
    {kind==='babyNames'&&<BabyNameMatcher state={state} update={update} toast={toast} close={close}/>}
    {kind==='toolsHub'&&<ToolsHub open={open} state={state} update={update} toast={toast} close={close}/>}
    {!!error&&<T accessibilityRole="alert" style={{color:'#A95769',marginTop:12}}>{error}</T>}
    </ScrollView></View></KeyboardAvoidingView></Modal>;
}
const s=StyleSheet.create({backdrop:{flex:1,backgroundColor:'#211A304D',alignItems:'center',justifyContent:'flex-end'},sheet:{width:'100%',maxWidth:440,maxHeight:'86%',backgroundColor:colors.canvas,borderTopLeftRadius:30,borderTopRightRadius:30,paddingHorizontal:24},handle:{height:4,width:40,borderRadius:3,backgroundColor:'#D9CDD7',alignSelf:'center',marginTop:10,marginBottom:23},heading:{flexDirection:'row',alignItems:'center',gap:12,paddingBottom:17,borderBottomWidth:1,borderColor:colors.line},kicker:{fontSize:10,letterSpacing:2,color:colors.purple,marginBottom:8},title:{fontSize:23},close:{height:38,width:38,borderRadius:19,alignItems:'center',justifyContent:'center',backgroundColor:'#F1EAEF'},body:{fontSize:15,color:'#787080',lineHeight:23,marginTop:12},label:{fontSize:14,marginBottom:8},input:{fontFamily:fonts.regular,fontSize:16,color:colors.ink,padding:14,borderWidth:1,borderColor:'#DED2DB',borderRadius:15,backgroundColor:'#FFFDFA',outlineStyle:'none'},button:{backgroundColor:colors.purple,borderRadius:18,minHeight:50,alignItems:'center',justifyContent:'center',marginTop:16,padding:12},secondary:{backgroundColor:'#F0E8F2'},option:{flexDirection:'row',alignItems:'center',padding:18,backgroundColor:'#F2EAEE',borderRadius:17,marginTop:13},profileHeader:{flexDirection:'row',alignItems:'center',gap:12,marginVertical:12},demo:{fontSize:12,color:colors.muted,lineHeight:19,marginTop:16},chips:{flexDirection:'row',gap:10,marginTop:18},chip:{padding:14,borderRadius:16,borderWidth:1,borderColor:colors.line},chipSelected:{backgroundColor:'#E7D8EB',borderColor:'#B89DC0'}});
const ds=StyleSheet.create({
  weekFruitBox:{flexDirection:'row',alignItems:'center',gap:16,marginTop:16,padding:16,backgroundColor:'#F7F0FA',borderRadius:20},
  weekFruitInfo:{flex:1},
  weekStat:{flexDirection:'row',alignItems:'center',gap:5},
  weekStatVal:{fontSize:13,color:'#6A4878'},
  bulletRow:{flexDirection:'row',alignItems:'flex-start',gap:10,marginBottom:9},
  dot:{width:7,height:7,borderRadius:4,backgroundColor:'#C4A8D0',marginTop:6},
  bulletText:{fontSize:14,flex:1,lineHeight:20,color:'#555060'},
  divider:{height:1,backgroundColor:'#EDE5F0',marginVertical:16},
});
