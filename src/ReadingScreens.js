import React, {useState, useRef, useEffect} from 'react';
import { View, Image, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { T, Tap, Card, Page, Section, Progress, ScreenHero, ToolExperienceCard } from './ui';
import { Icon, FruitArt } from './Icons';
import { colors } from './theme';
import { generatedAssets, getAsset } from './generatedAssets';
import { Header, Button, Chips, Field, Empty, Hint, RowLink, SourceLink, f } from './FlowUI';
import { articles, topics, articleById, weeklyArticles } from './content';
import { getWeekInfo, formatLength, formatWeight, trimesterLabel } from './weekData';
import { normalizeSearch, pregnancyAt, uid, localDay } from './domain.mjs';

export function ArticleRow({article,onPress,read}) {return <Tap label={article.title} onPress={onPress} style={r.articleRow}><Image source={generatedAssets[article.image] || getAsset(article.image)} style={r.thumb} resizeMode="cover"/><View style={{flex:1,gap:6}}><T style={f.label}>{topics.find(t=>t.id===article.topic)?.title.toLocaleUpperCase('tr')}</T><T bold style={{fontSize:15,lineHeight:21}}>{article.title}</T><T style={f.meta}>{article.minutes} dk okuma{read?' · Okundu':''}</T></View><Icon name="chevron" size={16} color={colors.purple}/></Tap>;}
export function ReadingRail({week,navigate,state}) {return <View><Section title="Bu haftana eşlik etsin" action="Tüm yazılar" onPress={()=>navigate('library')}/>{weeklyArticles(week).slice(0,2).map(article=><ArticleRow key={article.id} article={article} read={state.readArticles.includes(article.id)} onPress={()=>navigate('article',{id:article.id})}/>)}</View>;}
export function Library({state,navigate,back,data={}}) {
  const [query,setQuery]=useState('');const [topic,setTopic]=useState(data.topic||'all');const [tab,setTab]=useState(data.saved?'saved':'all');
  const shown=articles.filter(a=>(topic==='all'||a.topic===topic)&&(tab!=='saved'||state.savedArticles.includes(a.id))&&normalizeSearch(`${a.title} ${a.subtitle} ${topics.find(t=>t.id===a.topic)?.title}`).includes(normalizeSearch(query)));
  return <Page><Header title="Keşfet" subtitle="Merak ettiklerine, kendi hızında." back={back}/>

    <ScreenHero
      kicker="MOMORA KÜTÜPHANE"
      title="Bugün ihtiyacın olan rehberi seç"
      body="Haftana, belirtilerine ve hazırlıklarına göre yazıları düzenli bir anne-bebek kütüphanesi gibi kullan."
      icon="book"
      asset="topic_prenatal_nutrition"
      stat="65+ rehber"
      tint={colors.purple}
    />
    <ToolExperienceCard
      title="Okuma planını küçük tut"
      steps={['Bir konu seç veya arama yap.', 'Öne çıkan noktaları önce tara.', 'İşine yarayan yazıyı kaydet ve sonra devam et.']}
      outcome="Kütüphane blog listesi gibi değil, günlük karar destek alanı gibi çalışır."
      asset="ui_doctor_verified_badge"
      tint="#7C5B8B"
    /><Field label="İçerik ara" value={query} onChangeText={setQuery} placeholder="Örn. hareket, doğum, günlük"/>
    <Chips items={[{id:'all',title:'Sana özel'},{id:'saved',title:`Kaydedilenler · ${state.savedArticles.length}`}]} value={tab} onChange={setTab}/>
    {!query&&topic==='all'&&tab==='all'&&<><Tap label="Doğuma hazırlık konusunu keşfet" onPress={()=>setTopic('birth')} style={r.cover}><Image source={generatedAssets.blog_hospital_bag_pack || getAsset('blog_hospital_bag_pack')} style={StyleSheet.absoluteFill} resizeMode="cover"/><LinearGradient colors={['transparent','#30212AE6']} style={StyleSheet.absoluteFill}/><View style={r.coverCopy}><T style={{color:'#F0DEE6',fontSize:11,letterSpacing:2}}>BİRLİKTE HAZIRLANALIM</T><T bold style={{color:'white',fontSize:25,lineHeight:30}}>Büyük güne,{ '\n' }küçük adımlarla.</T><T style={{color:'white',fontSize:13}}>Doğuma hazırlık rehberleri  →</T></View></Tap>
    <Section title="Neyi merak ediyorsun?"/><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:12}}>{topics.map(t=><Tap key={t.id} label={`${t.title} konusunu aç`} onPress={()=>setTopic(t.id)} style={r.topic}><Image source={generatedAssets[t.image] || getAsset(t.image)} style={r.topicImage} resizeMode="cover"/><T bold style={{fontSize:14,marginTop:9}}>{t.title}</T><T style={f.meta}>{articles.filter(a=>a.topic===t.id).length} rehber</T></Tap>)}</ScrollView></>}
    <Chips items={[{id:'all',title:'Tüm konular'},...topics]} value={topic} onChange={setTopic}/>
    <T style={f.meta}>{shown.length} rehber{query?` · “${query}”`:''}</T>
    {shown.length?shown.map(a=><ArticleRow key={a.id} article={a} read={state.readArticles.includes(a.id)} onPress={()=>navigate('article',{id:a.id})}/>):<Empty title={tab==='saved'?'Burada sana ait bir kitaplık olacak':'Aradığını bulamadık'} text={tab==='saved'?'Yazılardaki kaydet düğmesine dokun. Seçtiğin konuya ait kayıtlar burada görünür.':'Daha kısa bir kelime deneyebilir veya konu filtresini kaldırabilirsin.'} action="Tüm rehberleri göster" onPress={()=>{setQuery('');setTopic('all');setTab('all');}}/>}
  </Page>;
}
export function ArticleDetail({data,state,update,navigate,back,toast}) {
  const a=articleById(data.id);const [large,setLarge]=useState(false);const [progress,setProgress]=useState(0);
  if(!a)return <Page><Header title="Yazı bulunamadı" back={back}/><Empty title="Bu içerik burada değil" text="Diğer rehberlere göz atabilirsin." action="Keşfet'e dön" onPress={()=>navigate('library')}/></Page>;
  const saved=state.savedArticles.includes(a.id),read=state.readArticles.includes(a.id);
  return <Page onScroll={event=>{const {contentOffset,contentSize,layoutMeasurement}=event.nativeEvent;setProgress(Math.min(100,contentOffset.y/Math.max(1,contentSize.height-layoutMeasurement.height)*100));}} scrollEventThrottle={80}>
    <Header title="Okuma köşesi" back={back} action={<Tap label={saved?'Yazıyı kaydedilenlerden çıkar':'Yazıyı kaydet'} onPress={()=>update(old=>({savedArticles:saved?old.savedArticles.filter(id=>id!==a.id):[...old.savedArticles,a.id]}))} style={f.iconButton}><Icon name={saved?'check':'book'} color={colors.purple}/></Tap>}/>
    <Progress value={progress} color={colors.purple} style={{height:3}}/>

    <ToolExperienceCard
      title="Yazıyı bitirmeden de değer al"
      steps={['Kapak ve alt başlıkla bağlamı yakala.', 'Öne çıkan noktaları tara.', 'Kaynak notunu ve ilgili rehberleri kontrol et.']}
      outcome="Makale ekranı sade blog sayfası değil, güven veren editoryal okuma deneyimi sunar."
      asset="ui_badge_certified_obgyn"
      tint="#8A5BA4"
    /><Image source={generatedAssets[a.image] || getAsset(a.image)} style={r.articleCover} resizeMode="cover"/>
    <View style={{gap:10}}>
      <T style={f.label}>{topics.find(t=>t.id===a.topic)?.title.toLocaleUpperCase('tr')}</T>
      <T bold style={{fontSize:27,lineHeight:34}}>{a.title}</T>
      <T style={f.body}>{a.subtitle}</T>
      {a.doctor && (
        <View style={[f.row,{gap:8,alignItems:'center',backgroundColor:'#F5EFF7',paddingHorizontal:12,paddingVertical:8,borderRadius:12,marginTop:2}]}>
          <Icon name="book" size={16} color={colors.purple}/>
          <T style={{fontSize:12,color:colors.purple,fontWeight:'600',flex:1}}>Kaynak: {a.doctor}</T>
        </View>
      )}
      <View style={[f.row,{justifyContent:'space-between',marginTop:4}]}>
        <T style={f.meta}>Momora Rehberi · {a.minutes} dk okuma</T>
        <Tap label="Yazı boyutunu değiştir" onPress={()=>setLarge(!large)} style={f.iconButton}><T bold style={{fontSize:large?21:16}}>Aa</T></Tap>
      </View>
    </View>
    {a.keyPoints && a.keyPoints.length > 0 && (
      <Card style={{backgroundColor:'#FAF7F3',borderWidth:1,borderColor:'#EDE7E1',borderRadius:16,padding:14,gap:8,marginTop:10}}>
        <View style={[f.row,{gap:6,alignItems:'center'}]}>
          <Icon name="star" size={15} color={colors.purple}/>
          <T bold style={{fontSize:12,color:colors.purple,letterSpacing:0.5}}>ÖNE ÇIKAN NOKTALAR</T>
        </View>
        {a.keyPoints.map((kp,idx)=>(
          <View key={idx} style={[f.row,{gap:8,alignItems:'flex-start'}]}>
            <T style={{color:colors.purple,fontSize:13,lineHeight:18}}>•</T>
            <T style={{fontSize:13,color:colors.ink,lineHeight:19,flex:1}}>{kp}</T>
          </View>
        ))}
      </Card>
    )}
    {a.sections.map((section,i)=><View key={section.title} style={{gap:9,paddingVertical:10}}>
      <T style={f.label}>0{i+1}</T>
      <T bold style={{fontSize:large?23:20,lineHeight:28}}>{section.title}</T>
      {section.image && (
        <View style={{marginVertical:8,height:210,borderRadius:18,overflow:'hidden',backgroundColor:'#F0EAF1',position:'relative'}}>
          <Image source={generatedAssets[section.image] || getAsset(section.image)} style={StyleSheet.absoluteFill} resizeMode="cover"/>
        </View>
      )}
      {section.caption && (
        <T style={{fontSize:12,color:colors.muted,fontStyle:'italic',marginTop:-2,marginBottom:4}}>{section.caption}</T>
      )}
      <T style={[f.body,{fontSize:large?19:16,lineHeight:large?31:27}]}>{section.text}</T>
      {section.tip && (
        <View style={{backgroundColor:'#FBF4EB',padding:12,borderRadius:12,borderWidth:1,borderColor:'#F2E4D5',marginTop:4}}>
          <T style={{fontSize:13,color:'#7A4D2E',lineHeight:19}}>{section.tip}</T>
        </View>
      )}
    </View>)}
    {a.source&&<Card><T bold style={{fontSize:13}}>Kaynak ve içerik notu</T><T style={[f.meta,{marginTop:6}]}>Genel bilgilendirme amaçlıdır; kişisel sağlık önerisi yerine geçmez. Kaynak kontrolü: 12 Eylül 2026.</T><SourceLink source={a.source} onError={toast}/></Card>}
    {a.action&&<Button onPress={()=>navigate(a.action.route,a.action.data)}>{a.action.label} →</Button>}
    <Button secondary onPress={()=>{update(old=>({readArticles:read?old.readArticles.filter(id=>id!==a.id):[...old.readArticles,a.id]}));toast(read?'Okundu işareti kaldırıldı':'Okuma tamamlandı');}}>{read?'Okundu ✓ · İşareti kaldır':'Okudum'}</Button>
    <Section title="Buradan devam edebilirsin"/>{articles.filter(other=>other.id!==a.id&&other.topic===a.topic).slice(0,2).map(other=><ArticleRow key={other.id} article={other} onPress={()=>navigate('article',{id:other.id})}/>)}
  </Page>;
}
export function WeekStrip({week,onChange}) {
  const ref=useRef(null);useEffect(()=>{ref.current?.scrollTo({x:Math.max(0,(week-6)*52),animated:false});},[week]);
  return <ScrollView ref={ref} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:6,paddingVertical:8}} style={{flexGrow:0}}>{Array.from({length:37},(_,i)=>i+4).map(w=><Tap key={w} label={`${w}. haftayı incele`} accessibilityState={{selected:week===w}} onPress={()=>onChange(w)} style={[r.week,week===w&&{backgroundColor:colors.purple}]}><T bold={week===w} style={{color:week===w?'white':colors.ink}}>{w}</T><T style={{fontSize:9,color:week===w?'white':colors.muted}}>HAFTA</T></Tap>)}</ScrollView>;
}
export function WeekDetail({data={},state,update,navigate,back,toast,measure=false}) {
  const actual=pregnancyAt(state).week;const [week,setWeek]=useState(data.week||actual);const [section,setSection]=useState('baby');const [note,setNote]=useState('');const info=getWeekInfo(week);
  const notes=state.journal.filter(n=>n.week===week);
  return <Page><Header title={measure?'Ölçü rehberi':'Bu hafta ikiniz'} subtitle={`${week}. hafta · ${trimesterLabel(info.trimester)}`} back={back}/><WeekStrip week={week} onChange={setWeek}/>

    <ToolExperienceCard
      title={measure ? 'Boyutu hissederek karşılaştır' : 'Haftayı tek bakışta sahiplen'}
      steps={measure
        ? ['Haftanı seç.', 'Meyve, boy ve ağırlık bilgisini birlikte oku.', 'Gelişim yazısına dönüp bağlamı tamamla.']
        : ['Bebeğinde ve sende neler değişiyor gör.', 'Merak edersen ölçü rehberini aç.', 'Bu haftadan kalacak bir not sakla.']}
      outcome="Hafta ekranı ansiklopedi değil, kişisel yolculuk sayfası gibi hissettirir."
      asset="fruit_apple"
      tint="#8A5BA4"
    />
    {week!==actual&&<View style={[f.row,{justifyContent:'space-between'}]}><T style={f.meta}>Şu an {week}. haftayı inceliyorsun.</T><Tap onPress={()=>setWeek(actual)} label="Kendi haftama dön" style={{padding:8,minHeight:44,justifyContent:'center'}}><T bold style={{fontSize:12,color:colors.purple}}>Benim haftam</T></Tap></View>}
    <View style={r.fruitStage}><LinearGradient colors={['#EEE5F1','#FAF1EA']} style={StyleSheet.absoluteFill}/><T style={f.label}>MİNİK BİR KARŞILAŞTIRMA</T><FruitArt type={info.fruit} size={measure?176:140}/><T bold style={{fontSize:23}}>{info.fruitName} büyüklüğünde</T><T style={f.meta}>Her bebek kendi hızında büyür.</T><View style={r.stats}><View style={r.stat}><T style={f.meta}>Yaklaşık boy</T><T bold style={{fontSize:24}}>{formatLength(info.lengthCm)}</T></View><View style={r.stat}><T style={f.meta}>Yaklaşık ağırlık</T><T bold style={{fontSize:24}}>{formatWeight(info.weightG)}</T></View></View></View>
    {measure?<><Hint>Meyve karşılaştırmaları boyutu hayal etmene yardımcı olur. Ekrandaki görsel gerçek fiziksel boyutu göstermez; ölçüler kişisel ultrason sonucunun yerine geçmez.</Hint><Button onPress={()=>navigate('week',{week})}>Bu haftanın gelişimini oku</Button><View style={[f.row,{justifyContent:'space-between'}]}><Button secondary disabled={week===4} onPress={()=>setWeek(week-1)}>← Önceki</Button><Button secondary disabled={week===40} onPress={()=>setWeek(week+1)}>Sonraki →</Button></View></>:<>
    <RowLink title="Ölçü rehberini aç" subtitle="Haftalar arasında boyutu karşılaştır" art={`fruit_${info.fruit}`} onPress={()=>navigate('measure',{week})}/>
    <Chips items={[{id:'baby',title:'Bebeğinde'},{id:'mom',title:'Sende'},{id:'notes',title:`Notların · ${notes.length}`}]} value={section} onChange={setSection}/>
    {section!=='notes'?<Card style={{gap:16}}><T bold style={{fontSize:19}}>{section==='baby'?'Küçük dünyasında neler oluyor?':'Bu hafta kendine de kulak ver'}</T>{info[section].map((text,i)=><View key={i} style={[f.row,{alignItems:'flex-start'}]}><View style={r.number}><T bold style={{color:colors.purple,fontSize:12}}>{i+1}</T></View><T style={[f.body,{flex:1}]}>{text}</T></View>)}<T style={f.meta}>Haftalık bilgiler geneldir; deneyimler ve ölçümler kişiden kişiye değişebilir.</T></Card>:<>
    <Field label="Bu haftadan hatırlamak istediğin" value={note} onChangeText={setNote} multiline placeholder="Bir his, ilk kıpırtı, küçük bir an…"/><Button disabled={!note.trim()} onPress={()=>{update(old=>({journal:[{id:uid(),title:`${week}. haftadan bir an`,text:note.trim(),date:localDay(),week},...old.journal]}));setNote('');toast('Haftalık notun kaydedildi');}}>Notumu sakla</Button>
    {notes.map(n=><Card key={n.id}><T style={f.meta}>{n.date}</T><T style={f.body}>{n.text}</T></Card>)}
    </>}
    <ReadingRail week={week} navigate={navigate} state={state}/></>}
  </Page>;
}
export function TodayExtras({state,navigate}) {const {week,remaining}=pregnancyAt(state);return <View style={{gap:12}}><ToolExperienceCard title="Bugünün küçük planı" steps={['Yolculuk bilgini kontrol et.', 'Bir hazırlık veya takip aracını tamamla.', 'Haftana eşlik eden rehberlerden birini oku.']} outcome="Bu alan ana ekrandan sonra ikinci günlük devam noktasıdır." asset="onboarding_daily_guidance" tint="#8A5BA4"/><RowLink title="Yolculuğun" subtitle={state.dueDate?`${remaining>0?`${remaining} gün kaldı`:'Beklenen tarihin geldi'} · Tarihlerini düzenle`:'Tahmini doğum tarihini ekle'} icon="calendar" onPress={()=>navigate('profile')}/><Section title="Küçük hazırlıklar" action="Tüm araçlar" onPress={()=>navigate('tracker')}/><View style={f.row}>{[{title:'Hastane çantam',art:'card_hospital_bag',route:'checklist',data:{list:'bag'}},{title:'Kilo günlüğüm',art:'card_scale',route:'weight'}].map(item=><Tap key={item.title} label={item.title} onPress={()=>navigate(item.route,item.data)} style={r.quick}><Image source={generatedAssets[item.art]} style={{width:70,height:64}} resizeMode="contain"/><T bold style={{fontSize:13}}>{item.title}</T><T style={f.meta}>Aç →</T></Tap>)}</View><ReadingRail week={week} navigate={navigate} state={state}/><RowLink title="Kendine bir not bırak" subtitle="Bu günün küçük bir anısını sakla" art="blog_postpartum_selfcare" onPress={()=>navigate('journal')}/></View>;}
const r=StyleSheet.create({articleRow:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:13,borderBottomWidth:1,borderColor:colors.line},thumb:{height:85,width:85,borderRadius:15},cover:{height:245,borderRadius:23,overflow:'hidden',marginTop:6},coverCopy:{position:'absolute',bottom:22,left:22,right:18,gap:12},topic:{width:143,paddingBottom:8},topicImage:{width:143,height:103,borderRadius:17},articleCover:{width:'100%',height:210,borderRadius:22},week:{width:46,minHeight:53,borderRadius:17,alignItems:'center',justifyContent:'center',gap:3,backgroundColor:'#F0EAEF'},fruitStage:{borderRadius:24,overflow:'hidden',padding:22,alignItems:'center',gap:10},stats:{flexDirection:'row',alignSelf:'stretch',marginTop:10},stat:{flex:1,alignItems:'center',gap:5},number:{width:27,height:27,borderRadius:14,backgroundColor:colors.lavender,alignItems:'center',justifyContent:'center'},quick:{flex:1,backgroundColor:'#FFFDF9',borderWidth:1,borderColor:colors.line,borderRadius:20,padding:14,gap:8}});
