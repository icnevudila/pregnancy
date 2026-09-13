import React, { useState } from 'react';
import { Modal, View, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, fonts } from './theme';
import { T, Tap, Card, ToolExperienceCard } from './ui';
import { Icon, BrandMark, FruitArt, ComparisonArt, MoodFace } from './Icons';
import { journeys, RecordList, sampleRecords } from './screens';
import { getWeekInfo, formatWeight, formatLength, trimesterLabel, monthLabel } from './weekData';
import { KickCounter, ContractionTimer, HospitalBag, LaborBreathingGuide } from './ToolScreens';
import { WeightTracker, BirthPlanBuilder, DoctorQuestions, BabyNameMatcher } from './MoreToolScreens';
import { ToolsHub } from './ToolsHub';
import { SizeComparisonHub, UltrasoundAtlas, MedicalTimeline, OrganDevelopment } from './MedicalScreens';
import { FoodSafetyChecker, TopicHubScreen, EditorialArticleScreen } from './ExploreScreens';
import { DailyBabyLetterScreen, DailyTimelineFeed, WaterVitaminQuickModal } from './DailyFeedScreens';
import { BirthMonthClubScreen, CommunityThreadScreen } from './CommunityScreens';
import { NursingTimerScreen, SleepWhiteNoiseScreen, DiaperTrackerScreen, PostpartumSelfCareScreen } from './PostpartumBabyScreens';
import { ProfileScreen } from './ProfileScreen';
import { AuthModal } from './AuthScreens';
import { NotificationSettingsScreen } from './NotificationSettingsScreen';
import { MilkStashTrackerScreen, PartnerTaskBoardScreen } from './ExtraToolScreens';
import { t } from './i18n/index.js';

export default function DetailSheet({ sheet, close, state, update, addRecord, deleteTrackerRecord, undoLastAction, choose, open, toast, lang: propLang }) {
  const lang = propLang || state?.lang || 'tr';
  const isEn = lang === 'en';
  const {kind,data={}}=sheet;
  const [text,setText]=useState(kind==='profile'?state.name:kind==='appointment'?state.appointment.title:'');
  const [secondary,setSecondary]=useState(kind==='profile'?state.babyName:kind==='appointment'?state.appointment.date:'');
  const [time,setTime]=useState(state.appointment.time);
  const [side,setSide]=useState(isEn ? 'Right breast' : 'Sağ meme');
  const [selectedMood,setSelectedMood]=useState(state.mood??0);
  const [moodNote,setMoodNote]=useState('');
  const [error,setError]=useState('');
  function save(){
    if(kind==='profile'){if(!text.trim())return setError(isEn ? 'Please enter your name.' : 'Adını yazabilir misin?');update({name:text.trim(),babyName:secondary.trim()||'Ada'});}
    else if(kind==='appointment'){if(!text.trim()||!secondary.trim()||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))return setError(isEn ? 'Please fill title, date and time (e.g. 10:00).' : 'Randevu adını, tarihini ve saati (10:00 gibi) doldur.');update({appointment:{title:text.trim(),date:secondary.trim(),time}});}
    else if(kind==='log'){
      if(data.type==='Bez')addRecord(data.type,side==='Sağ meme'||side==='Right breast'?(isEn?'Clean':'Temiz'):side);
      else {const number=Number(text.replace(',','.'));if(!Number.isFinite(number)||number<=0||number>(data.type==='Biberon'?1000:1440))return setError(isEn ? 'Please enter a valid amount.' : 'Geçerli bir miktar gir.');addRecord(data.type,data.type==='Biberon'?`${number} ml`:data.type==='Emzirme'?`${side} • ${number} ${isEn?'min':'dk'}`:`${number} ${isEn?'min':'dk'}`);}
    }else if(kind==='note'||kind==='week') {if(!text.trim())return setError(isEn ? 'Please write a brief note first.' : 'Önce küçük bir not yaz.');update(old=>({notes:[{id:Date.now().toString(),text:text.trim()},...old.notes]}));}
    else if(kind==='dailyMood') {
      const todayStr=new Date().toISOString().slice(0,10);
      const labels=isEn ? ['Great','Good','Normal','Tired','Hard'] : ['Harika','İyi','Normal','Yorgun','Zor'];
      update(old=>{
        const patch={mood:selectedMood,lastMoodDate:todayStr};
        if(moodNote.trim())patch.notes=[{id:Date.now().toString(),text:`🌸 ${labels[selectedMood]} · ${moodNote.trim()}`},...old.notes];
        return patch;
      });
      close();return toast(isEn ? 'Your day has been saved 🌸' : 'Günün kaydedildi 🌸');
    }
    close();toast(t('common.toastSaved', lang));
  }
  const input=(label,value,onChange,props={})=><View style={{marginTop:16}}><T bold style={s.label}>{label}</T><TextInput accessibilityLabel={label} value={value} onChangeText={onChange} placeholderTextColor="#A79AA7" style={[s.input,props.multiline&&{minHeight:100,textAlignVertical:'top'}]} maxLength={props.multiline?1000:80} {...props}/></View>;
  const button=(label,onPress,secondary=false)=><Tap onPress={onPress} style={[s.button,secondary&&s.secondary]}><T bold style={{color:secondary?colors.purple:'white',fontSize:16}}>{label}</T></Tap>;
  const sheetTitle = t('sheets.titles.' + kind, lang) || (kind === 'log' ? (isEn ? `${data.type} entry` : `${data.type} kaydı`) : kind);

  const premiumSheetIntro = {
    journey: [isEn ? 'Choose the right journey' : 'Doğru yolculuğu seç', isEn ? ['Pick pregnancy, postpartum, or baby care.', 'Momora adjusts daily cards and tools.', 'You can change it later from profile.'] : ['Hamilelik, lohusalık veya bebek bakımını seç.', 'Momora günlük kartları ve araçları buna göre ayarlar.', 'Sonra profilden değiştirebilirsin.'], 'onboarding_fetal_journey', '#8A5BA4'],
    appointment: [isEn ? 'Prepare the visit cleanly' : 'Kontrolü düzenli hazırla', isEn ? ['Name the visit.', 'Add date and time.', 'Use reminders and doctor questions together.'] : ['Randevuyu adlandır.', 'Tarih ve saati ekle.', 'Hatırlatma ve doktor sorularını birlikte kullan.'], 'card_appointment', '#7B5FA3'],
    log: [isEn ? 'Add one clean care record' : 'Tek temiz bakım kaydı ekle', isEn ? ['Choose the right type.', 'Enter only the needed amount or duration.', 'Save it to the daily rhythm.'] : ['Doğru kayıt türünü seç.', 'Sadece gerekli miktar veya süreyi gir.', 'Günün ritmine kaydet.'], 'ui_nursing_dual_timer', '#B66C7E'],
    records: [isEn ? 'Review the day before the next log' : 'Yeni kayıttan önce günü oku', isEn ? ['Latest records stay at the top.', 'Look for rhythm, not perfection.', 'Cloud sync keeps the family aligned.'] : ['Son kayıtlar üstte kalır.', 'Mükemmellik değil ritim ara.', 'Bulut eşitleme aileyi aynı yerde tutar.'], 'settings_cloud_sync_backup', '#6E5A96'],
    note: [isEn ? 'Save the moment while it is fresh' : 'Anı tazeyken sakla', isEn ? ['Write a feeling or question.', 'Keep it short.', 'Return from notes or week screens later.'] : ['Bir his veya soru yaz.', 'Kısa tut.', 'Sonra notlar veya hafta ekranından dön.'], 'blog_postpartum_selfcare', '#A75E7B'],
    notes: [isEn ? 'Your private memory shelf' : 'Sana ait anı rafı', isEn ? ['Review saved notes.', 'Remove what no longer matters.', 'Add today’s small memory.'] : ['Kayıtlı notları gözden geçir.', 'Artık gerekmeyeni sil.', 'Bugünün küçük anısını ekle.'], 'ui_baby_letter_envelope', '#8A5BA4'],
    dailyMood: [isEn ? 'Start with yourself' : 'Önce kendini dinle', isEn ? ['Pick the closest feeling.', 'Add a small note if needed.', 'Continue the day with one gentle cue.'] : ['Sana en yakın hissi seç.', 'Gerekirse küçük not ekle.', 'Güne tek nazik ipucuyla devam et.'], 'mood_good', '#B66C7E'],
    notifications: [isEn ? 'Notification & Alert Center' : 'Bildirim & Hatırlatıcı Merkezi', isEn ? ['Manage clinical reminders.', 'Choose your preferred times.', 'Send instant test alerts.'] : ['Klinik hatırlatıcıları yönet.', 'Tercih ettiğin saatleri belirle.', 'Canlı test bildirimleri gönder.'], 'settings_notification_bell', '#7E4E8A'],
  }[kind];

  if (kind === 'editorialArticle') {
    return (
      <Modal visible transparent animationType="slide" onRequestClose={close}>
        <View style={s.fullscreenBackdrop}>
          <View style={s.fullscreenReader}>
            <EditorialArticleScreen
              article={data?.article}
              close={close}
              toast={toast}
              lang={lang}
              openArticle={(newArt) => open('editorialArticle', { article: newArt })}
            />
          </View>
        </View>
      </Modal>
    );
  }

  return <Modal visible transparent animationType="fade" onRequestClose={close}><KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={s.backdrop}><Tap label={isEn ? 'Close dialog' : 'Pencereyi kapat'} style={StyleSheet.absoluteFill} onPress={close}/><View style={s.sheet}><View style={s.handle}/><View style={s.heading}><View style={{flex:1}}><T style={s.kicker}>MOMORA · {isEn ? 'WITH YOU' : 'YANINDA'}</T><T bold style={s.title}>{sheetTitle}</T>{premiumSheetIntro&&<T style={{fontSize:12.5,color:colors.muted,marginTop:3}}>{premiumSheetIntro[0]}</T>}</View><Tap onPress={close} label={isEn ? 'Close' : 'Kapat'} style={s.close}><Icon name="close" size={22}/></Tap></View><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingBottom:28}} showsVerticalScrollIndicator={false}>
    {kind==='journey'&&journeys.map(j=><Tap key={j.key} onPress={()=>{choose(j.key);close()}} style={s.option}><T bold style={{flex:1}}>{j.title.replace('\n',' ')}</T><Icon name="chevron"/></Tap>)}
    {kind==='profile'&&<ProfileScreen state={state} update={update} open={open} toast={toast} choose={choose} close={close} lang={lang}/>}
    {kind==='appointment'&&(()=>{
      const initialTitle = (isEn && (text === 'Detaylı Ultrason Kontrolü' || !text)) ? 'Detailed Ultrasound Checkup' : text;
      const initialDate = (isEn && (secondary === '16 Mayıs Cuma' || !secondary)) ? 'Friday, May 16' : secondary;
      return <>{input(isEn?'Appointment Title':'Randevu adı',initialTitle,setText)}{input(isEn?'Date':'Tarih',initialDate,setSecondary,{placeholder:isEn?'Friday, May 16':'16 Mayıs Cuma'})}{input(isEn?'Time':'Saat',time,setTime,{placeholder:'10:00',maxLength:5})}{button(isEn?'Save Appointment':'Randevuyu kaydet',save)}<T style={s.helper}>{isEn?'Saved to your appointment diary; can be used as a reminder.':'Randevu günlüğüne kaydedilir; bildirim ayarı bağlandığında hatırlatma olarak kullanılabilir.'}</T></>;
    })()}
    {kind==='log'&&<><T style={s.body}>{data.type==='Bez'?(isEn?'Add diaper change log.':'Alt değiştirme kaydını ekle.'):(isEn?'A quick entry helps you recall your daily rhythm.':'Küçük bir kayıt, günün akışını hatırlamana yardımcı olur.')}</T>{data.type==='Emzirme'&&<View style={s.chips}>{[isEn?'Right breast':'Sağ meme',isEn?'Left breast':'Sol meme'].map(v=><Tap key={v} onPress={()=>setSide(v)} style={[s.chip,side===v&&s.chipSelected]}><T>{v}</T></Tap>)}</View>}{data.type==='Bez'?<View style={s.chips}>{[isEn?'Clean':'Temiz',isEn?'Wet':'Islak',isEn?'Dirty':'Kirli'].map(v=><Tap key={v} onPress={()=>setSide(v)} style={[s.chip,(side===v||v===(isEn?'Clean':'Temiz')&&side===(isEn?'Right breast':'Sağ meme'))&&s.chipSelected]}><T>{v}</T></Tap>)}</View>:input(data.type==='Biberon'?(isEn?'Amount (ml)':'Miktar (ml)'):(isEn?'Duration (min)':'Süre (dakika)'),text,setText,{keyboardType:'decimal-pad',placeholder:data.type==='Biberon'?'120':'15'})}{button(t('common.save', lang),save)}</>}
    {kind==='records'&&<><T style={s.helper}>{isEn?'Your latest records appear at the top. Synced across devices when cloud account is linked.':'Yeni kayıtların en üstte görünür. Bulut hesabı bağlandığında cihazlar arasında eşitlenir.'}</T><RecordList records={[...state.records,...sampleRecords]} trackerEvents={state.trackerEvents} onDelete={deleteTrackerRecord} onUndo={undoLastAction} lastUndoAction={state.lastUndoAction} lang={lang}/></>}
    {kind==='note'&&<>{input(isEn?'Leave a note for today ✍️':'Bugüne ait bir not bırak ✍️',text,setText,{multiline:true,placeholder:isEn?'A feeling or moment from your heart...':'İçinden geçen bir his ya da an...'})}{button(isEn?'Save Note':'Notumu sakla',save)}</>}
    {kind==='week'&&(()=>{
      const wi=getWeekInfo(data.week||24, lang);
      return <>
        {/* Büyük meyve görseli */}
        <View style={ds.weekFruitBox}>
          <FruitArt type={wi.fruit} size={130}/>
          <View style={ds.weekFruitInfo}>
            <T bold style={{fontSize:22,color:'#4A2860'}}>{isEn ? `Week ${data.week||24}` : `${data.week||24}. Hafta`}</T>
            <T style={{fontSize:13,color:'#9A779A',marginTop:3}}>{monthLabel(wi.month, lang)} · {trimesterLabel(wi.trimester, lang)}</T>
            <View style={{flexDirection:'row',gap:16,marginTop:10}}>
              <View style={ds.weekStat}><Icon name="ruler" size={14} color="#9A779A"/><T style={ds.weekStatVal}>{formatLength(wi.lengthCm)}</T></View>
              <View style={ds.weekStat}><Icon name="scale" size={14} color="#9A779A"/><T style={ds.weekStatVal}>{formatWeight(wi.weightG, lang)}</T></View>
            </View>
            <T style={{fontSize:12,color:'#C4A8D0',marginTop:6}}>{isEn ? `Size of a ${wi.fruitName}` : `${wi.fruitName} büyüklüğünde`}</T>
          </View>
        </View>
        {/* 3'lü Kıyaslama Şeridi (Gerçek 3D Porselen Kil Modellerimiz) */}
        <View style={{flexDirection:'row',gap:8,marginTop:12,backgroundColor:'#F4EEF7',padding:10,borderRadius:16}}>
          <View style={{flex:1,alignItems:'center'}}>
            <View style={{width:34,height:34,alignItems:'center',justifyContent:'center'}}>
              <FruitArt type={wi.fruit} size={32}/>
            </View>
            <T bold numberOfLines={1} style={{fontSize:11,color:'#5C396B',marginTop:3}}>{wi.fruitName}</T>
            <T style={{fontSize:9,color:'#8C709A'}}>{isEn ? 'Fruit' : 'Meyve'}</T>
          </View>
          <View style={{width:1,backgroundColor:'#E1D2E6'}}/>
          <View style={{flex:1,alignItems:'center'}}>
            <View style={{width:34,height:34,alignItems:'center',justifyContent:'center'}}>
              <ComparisonArt mode="animal" type={wi.animal} size={32} info={wi} week={data.week||24}/>
            </View>
            <T bold numberOfLines={1} style={{fontSize:11,color:'#5C396B',marginTop:3}}>{wi.animalName || (isEn ? 'Animal' : 'Yavru')}</T>
            <T style={{fontSize:9,color:'#8C709A'}}>{isEn ? 'Animal' : 'Hayvan'}</T>
          </View>
          <View style={{width:1,backgroundColor:'#E1D2E6'}}/>
          <View style={{flex:1,alignItems:'center'}}>
            <View style={{width:34,height:34,alignItems:'center',justifyContent:'center'}}>
              <ComparisonArt mode="sweet" type={wi.sweet} size={32} info={wi} week={data.week||24}/>
            </View>
            <T bold numberOfLines={1} style={{fontSize:11,color:'#5C396B',marginTop:3}}>{wi.sweetName || (isEn ? 'Sweet' : 'Tatlı')}</T>
            <T style={{fontSize:9,color:'#8C709A'}}>{isEn ? 'Sweet / Object' : 'Tatlı / Nesne'}</T>
          </View>
        </View>
        {/* Ultrason Bilgisi (Tıklanabilir Atlas Köprüsü) */}
        {!!wi.ultrasound && (
          <Tap
            label={isEn ? 'Open Ultrasound Atlas' : 'Ultrason Atlasını Aç'}
            onPress={() => open('ultrasoundAtlas', { week: data.week || 24 })}
            style={{marginTop:10,backgroundColor:'#FAF5FD',padding:12,borderRadius:16,borderWidth:1,borderColor:'#E2D2EB',flexDirection:'row',gap:12,alignItems:'center'}}
          >
            <ComparisonArt mode="ultrasound" size={56} week={data.week||24} />
            <View style={{flex:1}}>
              <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                <T bold style={{fontSize:12,color:'#5C396B'}}>🩺 {wi.ultrasound.scan}</T>
                <View style={{backgroundColor:'#E8D5EB',paddingHorizontal:6,paddingVertical:2,borderRadius:8}}>
                  <T style={{fontSize:9,color:'#4A2860'}}>{wi.ultrasound.badge}</T>
                </View>
              </View>
              <T style={{fontSize:11,color:'#6A4878',marginTop:4,lineHeight:16}}>{wi.ultrasound.milestone}</T>
              <T bold style={{fontSize:10.5,color:colors.purple,marginTop:4}}>{isEn ? 'Open 2D & 3D Atlas →' : '2D & 3D Atlası Aç →'}</T>
            </View>
          </Tap>
        )}
        {/* Bebek bu hafta */}
        <T bold style={{fontSize:16,marginTop:18,marginBottom:8}}>{isEn ? 'Your baby this week' : 'Bebeğinde bu hafta'}</T>
        {wi.baby.map((b,i)=><View key={i} style={ds.bulletRow}><View style={ds.dot}/><T style={ds.bulletText}>{b}</T></View>)}
        {/* Anne bu hafta */}
        <T bold style={{fontSize:16,marginTop:16,marginBottom:8}}>{isEn ? 'In your body this week' : 'Sende bu hafta'}</T>
        {wi.mom.map((m,i)=><View key={i} style={ds.bulletRow}><View style={[ds.dot,{backgroundColor:'#D4A0C0'}]}/><T style={ds.bulletText}>{m}</T></View>)}
        <View style={ds.divider}/>
        {input(isEn ? 'Leave a note for this week' : 'Bu haftana bir not bırak',text,setText,{multiline:true,placeholder:isEn ? 'Felt it for the first time today...' : 'Bugün ilk kez hissettim…'})}
        {button(isEn ? 'Save Note' : 'Notumu sakla',save)}
      </>;
    })()}
    {kind==='notes'&&<>{state.notes.length?state.notes.map(n=><Card key={n.id} style={{marginTop:12}}><T style={{lineHeight:23}}>{n.text}</T><Tap label={isEn ? 'Delete note' : 'Notu sil'} onPress={()=>update(old=>({notes:old.notes.filter(x=>x.id!==n.id)}))} style={{alignSelf:'flex-end',paddingTop:12}}><T style={{fontSize:12,color:colors.muted}}>{isEn?'Delete':'Sil'}</T></Tap></Card>):<T style={s.body}>{isEn?'No notes saved yet. You can save your first little memory.':'Henüz not eklemedin. İlk küçük anını saklayabilirsin.'}</T>}{button(isEn?'Add new note':'Yeni not ekle',()=>open('note'))}</>}
    {kind==='assistantAnswer'&&<View style={{marginTop:8}}>
      <T bold style={{fontSize:18,lineHeight:25,color:colors.ink}}>{data.question}</T>
      {data.answer ? (
        <Card style={{marginTop:12,padding:16,backgroundColor:'#FAF5FA',borderWidth:1,borderColor:'#EDE2EE'}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:8}}>
            <T style={{fontSize:18}}>👩‍⚕️</T>
            <T bold style={{fontSize:13,color:colors.purple}}>{isEn ? 'Editorial Reference Note' : 'Editoryal Kaynak Notu'}</T>
          </View>
          <T style={{fontSize:14,lineHeight:22,color:'#3E3643'}}>{data.answer}</T>
          {data.faq?.tags ? (
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:12}}>
              {data.faq.tags.map(t=><View key={t} style={{backgroundColor:'#F0E5F2',paddingHorizontal:8,paddingVertical:3,borderRadius:8}}><T style={{fontSize:10,color:'#77587B'}}>#{t}</T></View>)}
            </View>
          ) : null}
        </Card>
      ) : (
        <T style={s.body}>{isEn ? 'Added your question to notes. You can browse articles or view your appointments here.' : 'Sorunu notlarına ekledim. Bu soru için bilgi bankasını inceleyebilir veya randevularını ve takip kayıtlarını buradan açabilirsin.'}</T>
      )}
      {button(isEn ? 'Go to my notes' : 'Notlarıma git',()=>open('notes'))}
      {button(isEn ? 'FAQ & Guides Library' : 'Sıkça Sorulan Sorular Kütüphanesi',()=>open('topicHub'),true)}
    </View>}
    {kind==='community'&&<BirthMonthClubScreen onOpenThread={p=>open('communityThread',p)} lang={lang}/>}
    {kind==='categories'&&[isEn?'Diapers':'Bebek bezi',isEn?'Wipes':'Islak mendil',isEn?'Feeding':'Beslenme',isEn?'Bath':'Banyo'].map(v=><View key={v} style={s.option}><T>{v}</T></View>)}
    {kind==='sponsored'&&<T style={s.body}>{isEn ? 'You can add recommended items to your own shopping checklist according to your family needs.' : 'Bu alanda önerilen ürünleri kendi alışveriş listene ekleyebilir, satın alma kararını kendi tercihlerin ve ihtiyaçlarınla verebilirsin.'}</T>}
    {kind==='dailyMood'&&(()=>{
      const labels=isEn ? ['Great','Good','Normal','Tired','Hard'] : ['Harika','İyi','Normal','Yorgun','Zor'];
      const moodMessages=isEn ? [
        'May your energy be high! A wonderful day awaits you with your baby. ✨',
        'Peace and calmness be with you; you are doing great. 💛',
        'Every day has its rhythm; quiet and balanced moments are precious. 🌿',
        'Your body is performing a miracle; allow yourself space to rest today. 🛌',
        'You are not alone; every feeling is valid. We embrace you with kindness. 💜'
      ] : [
        'Enerjin daim olsun! Bebeğinle harika bir gün seni bekliyor. ✨',
        'Huzurun ve dinginliğin hiç eksilmesin, harika gidiyorsun. 💛',
        'Her günün bir ritmi var; sakin ve dengeli anlar çok kıymetlidir. 🌿',
        'Bedenin mucizevi bir süreçten geçiyor, lütfen bugün kendine dinlenmek için alan aç. 🛌',
        'Yalnız değilsin; her duygunun bir yeri var. Sana sarılıyoruz, bugün kendine şefkat göster. 💜'
      ];
      return (
        <View style={{marginTop:6}}>
          <T style={s.body}>{isEn ? 'Take a moment before starting your day. How are your heart and body feeling today?' : 'Günün ritmine başlamadan önce kendine bir an ayır. Bedenin ve kalbin bugün nasıl hissediyor?'}</T>
          <View style={[s.chips,{justifyContent:'space-between',marginVertical:18,gap:4}]}>
            {labels.map((label,idx)=>(
              <Tap
                key={label}
                label={(isEn ? 'Mood: ' : 'Ruh hali: ')+label}
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
          {input(isEn ? 'A small note for today (optional)' : 'Bugüne dair küçük bir not (opsiyonel)',moodNote,setMoodNote,{multiline:true,placeholder:isEn ? 'A feeling or memory from your heart...' : 'İçinden geçen bir his ya da an...'})}
          {button(isEn ? 'Continue My Day 🌸' : 'Günüme Devam Et 🌸',save)}
          <Tap onPress={()=>{update({lastMoodDate:new Date().toISOString().slice(0,10)});close();}} style={{alignItems:'center',marginTop:14,padding:8}}>
            <T style={{fontSize:13,color:colors.muted}}>{isEn ? 'Skip for now' : 'Şimdilik atla'}</T>
          </Tap>
        </View>
      );
    })()}
    {kind==='auth'&&<AuthModal close={close} toast={toast} lang={lang} onAuthSuccess={u=>{update({user:u});if(u?.user_metadata?.full_name)update({name:u.user_metadata.full_name});}}/>}
    {kind==='kickCounter'&&<KickCounter state={state} update={update} toast={toast} close={close} lang={lang}/>}
    {kind==='contractionTimer'&&<ContractionTimer state={state} update={update} toast={toast} close={close} lang={lang}/>}
    {kind==='hospitalBag'&&<HospitalBag state={state} update={update} toast={toast} close={close} lang={lang}/>}
    {kind==='breathingGuide'&&<LaborBreathingGuide state={state} update={update} toast={toast} close={close} lang={lang}/>}
    {kind==='weight'&&<WeightTracker state={state} update={update} toast={toast} close={close} lang={lang}/>}
    {kind==='birthPlan'&&<BirthPlanBuilder state={state} update={update} toast={toast} close={close} lang={lang}/>}
    {kind==='doctorQuestions'&&<DoctorQuestions state={state} update={update} toast={toast} close={close} lang={lang}/>}
    {kind==='babyNames'&&<BabyNameMatcher state={state} update={update} toast={toast} close={close} lang={lang}/>}
    {kind==='toolsHub'&&<ToolsHub open={open} state={state} update={update} toast={toast} inSheet close={close} lang={lang}/>}
    {/* Modül 2: Gelişim & Medikal */}
    {kind==='sizeGuide'&&<SizeComparisonHub state={state} toast={toast} lang={lang}/>}
    {kind==='ultrasoundAtlas'&&<UltrasoundAtlas state={state} lang={lang} initialWeek={data?.week}/>}
    {kind==='medicalTimeline'&&<MedicalTimeline state={state} update={update} open={open} lang={lang}/>}
    {kind==='organDevelopment'&&<OrganDevelopment state={state} lang={lang}/>}
    {/* Modül 3: Keşfet & Makale */}
    {kind==='foodSafety'&&<FoodSafetyChecker toast={toast} lang={lang}/>}
    {kind==='topicHub'&&<TopicHubScreen openArticle={(article)=>open('editorialArticle', {article})} openFoodChecker={()=>open('foodSafety')} lang={lang}/>}
    {/* Modül 4: Bugün & Günlük Akış */}
    {kind==='babyLetter'&&<DailyBabyLetterScreen state={state} toast={toast} lang={lang}/>}
    {kind==='timelineFeed'&&<DailyTimelineFeed lang={lang}/>}
    {kind==='waterVitamin'&&<WaterVitaminQuickModal state={state} update={update} toast={toast} lang={lang}/>}
    {/* Modül 5: Topluluk */}
    {kind==='birthMonthClub'&&<BirthMonthClubScreen onOpenThread={p=>open('communityThread',p)} lang={lang}/>}
    {kind==='communityThread'&&<CommunityThreadScreen post={data} toast={toast} lang={lang}/>}
    {/* Modül 6: Lohusalık & Yenidoğan */}
    {kind==='nursingTimer'&&<NursingTimerScreen state={state} update={update} toast={toast} lang={lang}/>}
    {kind==='sleepWhiteNoise'&&<SleepWhiteNoiseScreen state={state} update={update} toast={toast} lang={lang}/>}
    {kind==='diaperTracker'&&<DiaperTrackerScreen update={update} toast={toast} lang={lang}/>}
    {kind==='postpartumCare'&&<PostpartumSelfCareScreen state={state} update={update} toast={toast} lang={lang}/>}
    {kind==='milkStash'&&<MilkStashTrackerScreen state={state} update={update} toast={toast} lang={lang}/>}
    {kind==='partnerTasks'&&<PartnerTaskBoardScreen state={state} update={update} toast={toast} lang={lang}/>}
    {kind==='notifications'&&<NotificationSettingsScreen toast={toast} lang={lang} week={state.week||24} close={close}/>}
    {!!error&&<T accessibilityRole="alert" style={{color:'#A95769',marginTop:12}}>{error}</T>}
    </ScrollView></View></KeyboardAvoidingView></Modal>;
}
const s=StyleSheet.create({fullscreenBackdrop:{flex:1,backgroundColor:'#1E142433',alignItems:'center',justifyContent:'center'},fullscreenReader:{flex:1,width:'100%',maxWidth:500,backgroundColor:colors.canvas,overflow:'hidden'},backdrop:{flex:1,backgroundColor:'#211A304D',alignItems:'center',justifyContent:'flex-end'},sheet:{width:'100%',maxWidth:440,maxHeight:'86%',backgroundColor:colors.canvas,borderTopLeftRadius:30,borderTopRightRadius:30,paddingHorizontal:24},handle:{height:4,width:40,borderRadius:3,backgroundColor:'#D9CDD7',alignSelf:'center',marginTop:10,marginBottom:23},heading:{flexDirection:'row',alignItems:'center',gap:12,paddingBottom:17,borderBottomWidth:1,borderColor:colors.line},kicker:{fontSize:10,letterSpacing:2,color:colors.purple,marginBottom:8},title:{fontSize:23},close:{height:38,width:38,borderRadius:19,alignItems:'center',justifyContent:'center',backgroundColor:'#F1EAEF'},body:{fontSize:15,color:'#787080',lineHeight:23,marginTop:12},label:{fontSize:14,marginBottom:8},input:{fontFamily:fonts.regular,fontSize:16,color:colors.ink,padding:14,borderWidth:1,borderColor:'#DED2DB',borderRadius:15,backgroundColor:'#FFFDFA',outlineStyle:'none'},button:{backgroundColor:colors.purple,borderRadius:18,minHeight:50,alignItems:'center',justifyContent:'center',marginTop:16,padding:12},secondary:{backgroundColor:'#F0E8F2'},option:{flexDirection:'row',alignItems:'center',padding:18,backgroundColor:'#F2EAEE',borderRadius:17,marginTop:13},profileHeader:{flexDirection:'row',alignItems:'center',gap:12,marginVertical:12},helper:{fontSize:12,color:colors.muted,lineHeight:19,marginTop:16},chips:{flexDirection:'row',gap:10,marginTop:18},chip:{padding:14,borderRadius:16,borderWidth:1,borderColor:colors.line},chipSelected:{backgroundColor:'#E7D8EB',borderColor:'#B89DC0'}});
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
