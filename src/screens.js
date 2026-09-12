import React, { useState, useRef } from 'react';
import { View, Image, StyleSheet, TextInput, Keyboard, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { assets, colors, fonts, shadow } from './theme';
import { Icon, BrandMark, ProductArt, FruitArt } from './Icons';
import { generatedAssets } from './generatedAssets';
import { T, Tap, Card, RoundButton, Section, Tabs, MoodPicker, Progress, SmallStat, Page } from './ui';
import { getWeekInfo, formatWeight, formatLength, trimesterLabel, monthLabel, pregnancyProgress, TOTAL_WEEKS } from './weekData';
import { usePulse, useCrossFade } from './anim';

export const journeys = [
  { key: 'pregnancy', title: 'Hamileyim', sub: 'Bebeğimle tanışmaya\nhazırlanıyorum', image: assets.pregnancy, tint: '#F5E7E8' },
  { key: 'postpartum', title: 'Yeni doğum yaptım', sub: 'Lohusalık sürecimde\nyanımda ol', image: assets.mother, tint: '#F5E5E7' },
  { key: 'baby', title: 'Bebeğimi\nbüyütüyorum', sub: 'Her gününde birlikte', image: assets.baby, tint: '#EAEAE3' },
];

export function Onboarding({ choose }) {
  return <Page contentStyle={s.onboarding}>
    <View style={s.brand}><BrandMark size={38}/><T style={s.wordmark}>MOMORA</T></View>
    <View style={s.welcome}><T bold style={s.welcomeTitle}>Yolculuğun nerede?</T><T style={s.welcomeText}>Sana en uygun deneyimi sunalım.{ '\n' }İstediğin zaman değiştirebilirsin.</T></View>
    <View style={{ gap: 20 }}>{journeys.map(j => <Tap key={j.key} label={j.title.replace('\n',' ')} onPress={() => choose(j.key)} style={[s.journey, { backgroundColor: j.tint }]}>
      <View style={s.journeyPhoto}><Image source={j.image} style={s.journeyImage}/><LinearGradient colors={['transparent', j.tint]} start={{x:0.72,y:0}} end={{x:1,y:0}} style={StyleSheet.absoluteFill}/></View>
      <View style={s.journeyCopy}><T bold style={s.journeyTitle}>{j.title}</T><T style={s.journeySub}>{j.sub}</T></View><Icon name="chevron" size={22}/>
    </Tap>)}</View>
    <View style={s.motto}><Icon name="heart" color="#A68A9C" size={29}/><T style={s.handwritten}>Daha bilinçli, daha huzurlu{ '\n' }bir yolculuk için</T></View>
  </Page>;
}

// ─── Animasyonlu Meyve Hero ───────────────────────────────────────────────────
function FruitHero({ week, info, onPress }) {
  const scale = usePulse(0.94, 1.06, 1800);
  const fade  = useCrossFade(week, 280);
  const progress = pregnancyProgress(week);
  return (
    <Tap onPress={onPress} label="Bu haftaki gelişimi gör" style={s.fruitHero}>
      <LinearGradient colors={['#6A4F7A22', 'transparent']} start={{x:0,y:0}} end={{x:1,y:0}} style={StyleSheet.absoluteFill} />
      {/* Sol — sayısal bilgi */}
      <View style={s.fruitHeroLeft}>
        <T bold style={s.fruitWeekNum}>{week}. Hafta</T>
        <T style={s.fruitMeta}>{monthLabel(info.month)} · {trimesterLabel(info.trimester)}</T>
        <View style={s.fruitStats}>
          <View style={s.fruitStat}>
            <Icon name="ruler" size={14} color="#9A779A"/>
            <T style={s.fruitStatVal}>{formatLength(info.lengthCm)}</T>
          </View>
          <View style={s.fruitStat}>
            <Icon name="scale" size={14} color="#9A779A"/>
            <T style={s.fruitStatVal}>{formatWeight(info.weightG)}</T>
          </View>
        </View>
        {/* İlerleme çubuğu */}
        <View style={{marginTop:10}}>
          <T style={{fontSize:10,color:'#B89DC0',marginBottom:4}}>{progress}% tamamlandı</T>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, {width: `${progress}%`}]} />
          </View>
        </View>
        <View style={s.fruitHeroBtn}>
          <T style={{fontSize:12,color:'#9A779A'}}>Detayları gör</T>
          <Icon name="arrow" size={15} color="#9A779A"/>
        </View>
      </View>
      {/* Sağ — animasyonlu meyve */}
      <Animated.View style={[s.fruitRight, {transform:[{scale}], opacity: fade}]}>
        <FruitArt type={info.fruit} size={108} />
        <T style={s.fruitName}>{info.fruitName}</T>
        <T style={s.fruitSub}>büyüklüğünde</T>
      </Animated.View>
    </Tap>
  );
}

// ─── Hamilelik Ekranı ─────────────────────────────────────────────────────────
export function Pregnancy({ state, update, open }) {
  const week = state.week ?? 24;
  const info = getWeekInfo(week);
  // Hafta şeridi: mevcut hafta ±5, tüm geçerli hafta aralığında
  const strip = [];
  for (let w = Math.max(4, week - 4); w <= Math.min(TOTAL_WEEKS, week + 5); w++) strip.push(w);

  return <Page>
    {/* Üst başlık */}
    <View style={s.topline}>
      <View>
        <T bold style={{color:'#684574',fontSize:17}}>Merhaba, {state.name} <T>🌸</T></T>
        <T style={s.subtitle}>Harika gidiyorsun!</T>
      </View>
      <Tap onPress={() => open('appointment')} label="Randevularım" style={s.iconHit}>
        <Icon name="bell" size={26}/>
      </Tap>
    </View>

    {/* Hafta şeridi — yatay kaydırmalı */}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.weekStrip}>
      {strip.map(n => (
        <Tap key={n} label={`${n}. hafta`} onPress={() => update({week:n})}
          accessibilityState={{selected: week === n}}
          style={[s.weekPill, week === n && s.weekActive]}>
          <T style={[{fontSize:13}, week === n && {color:'white',fontFamily:fonts.bold}]}>{n}</T>
          <T style={[{fontSize:9,marginTop:1,color: week===n?'#EEE5F4':colors.muted}]}>
            {getWeekInfo(n).fruitName.split(' ')[0]}
          </T>
        </Tap>
      ))}
    </ScrollView>

    {/* Animasyonlu meyve hero */}
    <FruitHero week={week} info={info} onPress={() => open('week', {week})} />

    {/* Bebek bu hafta — hızlı 3 madde */}
    <Card style={{padding:14}}>
      <View style={[s.row,{gap:8,marginBottom:10}]}>
        <T bold style={{fontSize:15}}>🍼 Bebeğinde bu hafta</T>
      </View>
      {info.baby.map((b,i) => (
        <View key={i} style={[s.row,{gap:8,marginBottom:i<info.baby.length-1?8:0}]}>
          <View style={s.bullet}/>
          <T style={{fontSize:13,flex:1,lineHeight:19,color:'#555060'}}>{b}</T>
        </View>
      ))}
      <Tap onPress={() => open('week',{week})} style={s.seeMore}>
        <T style={{fontSize:13,color:colors.purple}}>Annenin bu haftasını ve not almayı gör</T>
        <Icon name="chevron" size={16} color={colors.purple}/>
      </Tap>
    </Card>

    {/* Ruh hali */}
    <Card style={{padding:12}}><MoodPicker value={state.mood} onChange={mood => update({mood})}/></Card>

    {/* Randevu kartı */}
    <Tap onPress={() => open('appointment')} style={s.appointment}>
      <View style={{flex:1}}>
        <T style={{fontSize:13}}>{state.appointment.title}</T>
        <View style={[s.row,{marginTop:8,gap:13}]}>
          <Icon name="calendar" size={28}/>
          <T bold style={{fontSize:15,lineHeight:20}}>{state.appointment.date}{'\n'}{state.appointment.time}</T>
        </View>
      </View>
      <View style={s.appointmentIcon}><Icon name="bottle" size={23} color="#A69BCF" fill="#E5DDF6"/></View>
    </Tap>

    {/* Su & Vitamin hatırlatıcı */}
    <View style={[s.row,{gap:9}]}>
      <Tap onPress={() => update(old=>({water:Math.min(8,old.water+1)}))} label="Bir bardak su ekle" style={{flex:1}}>
        <LinearGradient colors={['#E8EEEA','#F5F7F2']} style={s.reminder}>
          {generatedAssets['card_water'] ? (
            <Image source={generatedAssets['card_water']} style={{width:38,height:38}} resizeMode="contain"/>
          ) : (
            <Icon name="cup" size={30} color="#72BDDE"/>
          )}
          <View style={{flex:1}}>
            <T bold style={s.reminderTitle}>Su hatırlatıcı</T>
            <T style={s.reminderSub}>{state.water}/8 bardak</T>
            <Progress value={state.water/8*100} color="#B7DBE5" style={{height:6,marginTop:6}}/>
          </View>
        </LinearGradient>
      </Tap>
      <Tap onPress={() => update(old=>({vitamin:!old.vitamin}))} label="Vitamin alındı durumunu değiştir" style={{flex:1}}>
        <LinearGradient colors={['#F8E5DE','#FCF5EF']} style={s.reminder}>
          {generatedAssets['card_vitamin'] ? (
            <Image source={generatedAssets['card_vitamin']} style={{width:38,height:38}} resizeMode="contain"/>
          ) : (
            <Icon name={state.vitamin?'check':'pill'} size={29} color="#E99986"/>
          )}
          <View style={{flex:1}}>
            <T bold style={s.reminderTitle}>Vitamin zamanı</T>
            <T style={s.reminderSub}>{state.vitamin ? 'Bugün aldın ✓' : 'Günlük dozunu\nunutma'}</T>
          </View>
        </LinearGradient>
      </Tap>
    </View>
  </Page>;
}


export function Postpartum({state,update,open}) {
  const [tab,setTab]=useState('Bugün');
  const tasks=['Bol sıvı tüket','Hafif yürüyüş yap','Pelvik taban egzersizlerini yap','Kendine zaman ayır','Destek al, yalnız değilsin 💜'];
  return <Page>
    <View style={s.topline}><View><T bold style={s.pageTitle}>Lohusalık · 12. gün</T><T style={s.subtitle}>İyileşiyorsun, harika gidiyorsun. 💜</T></View><RoundButton icon="down" label="Yolculuğunu değiştir" onPress={()=>open('journey')}/></View>
    <Tabs items={['Bugün','İyileşme','Ruh Halim','Notlar']} active={tab} onChange={setTab}/>
    {tab==='Bugün'||tab==='Ruh Halim'?<Card style={{padding:13}}><MoodPicker postpartum value={state.postpartumMood} onChange={postpartumMood=>update({postpartumMood})}/>{tab==='Bugün'&&<View style={[s.row,{gap:10,marginTop:16,paddingTop:12,borderTopWidth:1,borderColor:colors.line}]}><SmallStat title="Uyku" value="6 sa 20 dk" icon="moon" tint="#F0EAF5" onPress={()=>open('log',{type:'Uyku'})}/><SmallStat title="Su" value={`${state.water}/8 bardak`} icon="drop" tint="#E6F0F4" onPress={()=>update(old=>({water:Math.min(8,old.water+1)}))}/></View>}</Card>:null}
    {(tab==='Bugün'||tab==='İyileşme')&&<><Card style={{padding:13}}><T bold style={{fontSize:16}}>Bugün yapabileceklerin</T><T style={s.taskMeta}>{state.tasks.filter(Boolean).length}/5 tamamlandı</T>{tasks.map((task,i)=><Tap key={task} label={task} accessibilityRole="checkbox" accessibilityState={{checked:state.tasks[i]}} onPress={()=>update(old=>({tasks:old.tasks.map((v,n)=>n===i?!v:v)}))} style={s.task}><View style={[s.checkbox,state.tasks[i]&&{backgroundColor:colors.sage,borderColor:colors.sage}]}>{state.tasks[i]&&<Icon name="check" color="white" size={16}/>}</View><T style={s.taskText}>{task}</T><Icon name="chevron" size={18} color={colors.muted}/></Tap>)}</Card><Card style={{padding:14}}><View style={s.topline}><T bold>İyileşme yolculuğun</T><Icon name="leaf" color={colors.sage} fill="#9FB7A4" size={28}/></View><View style={[s.row,{gap:12,marginTop:10}]}><Progress value={state.tasks.filter(Boolean).length*20} style={{flex:1}}/><T style={{fontSize:13}}>%{state.tasks.filter(Boolean).length*20}</T></View><T style={{fontSize:12,color:colors.muted,marginTop:9}}>Her gün biraz daha güçleniyorsun.</T></Card></>}
    {tab==='Notlar'&&<><Section title="Sana ait küçük notlar" action="Not ekle" onPress={()=>open('note')}/>{state.notes.length?state.notes.map(n=><Card key={n.id}><T style={{lineHeight:23}}>{n.text}</T></Card>):<Card><T style={{lineHeight:23}}>Bir his, küçük bir an, doktoruna sormak istediğin bir soru… Hepsine burada yer var.</T><Tap onPress={()=>open('note')} style={s.primary}><T style={{color:'white'}}>İlk notunu ekle</T></Tap></Card>}</>}
  </Page>;
}

const babyActions=[
  {type:'Emzirme',key:'btn_nursing',icon:'nursing',bg:'#FCF4F7',border:'#F5E1EC',titleColor:'#6E3958',sub:'Sağ meme • 15 dk'},
  {type:'Biberon',key:'btn_bottle',icon:'bottle',bg:'#F7F4FB',border:'#EBE1F8',titleColor:'#523977',sub:'120 ml'},
  {type:'Uyku',key:'btn_sleep',icon:'moon',bg:'#F2F5FB',border:'#DFE8F8',titleColor:'#38517B',sub:'1 sa 20 dk'},
  {type:'Bez',key:'btn_diaper',icon:'diaper',bg:'#F2F7F4',border:'#DDEEE4',titleColor:'#305D44',sub:'Temiz'}
];
export const sampleRecords=[{id:'s1',type:'Emzirme',value:'Sağ meme • 15 dk',time:'19:20'},{id:'s2',type:'Bez',value:'Temiz',time:'17:10'},{id:'s3',type:'Uyku',value:'1 sa 20 dk',time:'15:30'},{id:'s4',type:'Biberon',value:'120 ml',time:'13:10'}];
export function RecordList({records}) {return <View>{records.map(r=>{const a=babyActions.find(a=>a.type===r.type)||{icon:'heart',color:colors.purple};return <View key={r.id} style={s.record}><T style={s.recordTime}>{r.time}</T><View style={[s.recordIcon,{backgroundColor:a.titleColor+'22'}]}>{generatedAssets[a.key] ? <Image source={generatedAssets[a.key]} style={{width:24,height:24}} resizeMode="contain"/> : <Icon name={a.icon} size={23} color={a.titleColor}/>}</View><View style={{flex:1}}><T bold style={{fontSize:14}}>{r.type}</T><T style={s.recordValue}>{r.value}</T></View></View>})}</View>}
export function Baby({state,open}) {
  const records=[...state.records,...sampleRecords].slice(0,4);
  return <Page>
    <View style={s.topline}><View style={s.row}><View style={s.avatar}><Image source={assets.baby} style={s.avatarImage}/></View><View style={{marginLeft:12}}><T bold style={{fontSize:19}}>{state.babyName} · 6 haftalık</T><T style={{fontSize:13,color:colors.muted,marginTop:7}}>Minik mutluluğumuz 💛</T></View></View><RoundButton icon="down" label="Yolculuğunu değiştir" onPress={()=>open('journey')}/></View>
    <View style={s.babyGrid}>
      {babyActions.map(a=>(
        <Tap key={a.type} onPress={()=>open('log',{type:a.type})} label={a.type+' kaydı ekle'} style={s.babyAction}>
          <View style={[s.babyCard, { backgroundColor: a.bg, borderColor: a.border }]}>
            <View style={s.babyHeroBox}>
              {generatedAssets[a.key] ? (
                <Image source={generatedAssets[a.key]} style={s.babyHeroImg} resizeMode="contain"/>
              ) : (
                <Icon name={a.icon} color={a.titleColor} size={50} strokeWidth={1.4}/>
              )}
            </View>
            <T bold style={[s.babyCardTitle, { color: a.titleColor }]}>{a.type}</T>
            <T style={s.babyCardSub}>{a.sub}</T>
          </View>
        </Tap>
      ))}
    </View>
    <Section title="Bugünkü kayıtlar" action="Tümünü gör" onPress={()=>open('records')}/><RecordList records={records}/>
    <Tap onPress={()=>open('log',{type:'Uyku'})} style={s.nextSleep}><View style={s.sleepIcon}>{generatedAssets['banner_next_sleep'] ? <Image source={generatedAssets['banner_next_sleep']} style={{width:54,height:54}} resizeMode="contain"/> : <Icon name="moon" size={42} color="white" fill="#AE98D4"/>}</View><View style={{flex:1}}><T style={{fontSize:13}}>Bir sonraki uyku zamanı</T><T bold style={{fontSize:22,marginTop:5}}>1 sa 15 dk</T><T style={{fontSize:11,marginTop:6}}>{state.babyName} genellikle 21:00 civarı uyuyor.</T></View></Tap>
  </Page>;
}

const categories=[{title:'Bebek bezi',type:'diaper',color:'#E1EBF3'},{title:'Islak mendil',type:'wipes',color:'#E2EBF3'},{title:'Beslenme',type:'bowl',color:'#F5E1E5'},{title:'Banyo',type:'soap',color:'#E4ECE3'}];
const products=[{id:'food',title:'Organik bebek maması\n6+ ay',type:'jar'},{id:'wipes',title:'Hassas ciltler için\nıslak mendil',type:'wipes'}];
export function Discover({state,update,open}) {
  const [tab,setTab]=useState('Sana özel'); const [search,setSearch]=useState(''); const [category,setCategory]=useState(null);
  const shown=products.filter(p=>p.title.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr'))&&(!category||p.type===category||category==='bowl'&&p.type==='jar'));
  return <Page contentStyle={{gap:10}}>
    <T bold style={s.pageTitle}>Keşfet</T>
    <View style={s.search}><Icon name="search" size={20} color="#6D6B72"/><TextInput value={search} onChangeText={setSearch} placeholder="Makale, ürün veya konu ara..." placeholderTextColor="#89818A" style={s.searchInput} accessibilityLabel="İçerik ara"/>{search?<Tap onPress={()=>setSearch('')} label="Aramayı temizle"><Icon name="close" size={17}/></Tap>:null}</View>
    <Tabs items={['Sana özel','Uzmanlardan','Alışveriş','Videolar']} active={tab} onChange={setTab}/>
    {tab!=='Alışveriş'&&!search&&<Tap onPress={()=>open('article',{video:tab==='Videolar'})} style={s.article}><Image source={assets.mother} style={s.articleImage}/><LinearGradient colors={['#EBDDD3','#EBDDD300']} start={{x:0,y:0}} end={{x:0.78,y:0}} style={StyleSheet.absoluteFill}/><T style={s.articleTag}>{tab==='Videolar'?'Yakında · video':'Uzman yazısı'}</T><View style={s.articleCopy}><T bold style={{fontSize:19,lineHeight:25}}>Bebeğinizle güvenli{ '\n' }bağ kurmanın 5 yolu</T><T style={{fontSize:12,marginTop:10}}>Uzman Psikolog Derya Kaya</T></View><View style={s.articleArrow}><Icon name="chevron" size={20}/></View></Tap>}
    {tab!=='Uzmanlardan'&&tab!=='Videolar'&&<><Section title="Senin için öneriler" action={category?'Filtreyi kaldır':'Tümünü gör'} onPress={()=>category?setCategory(null):open('categories')}/><View style={s.categories}>{categories.map(c=><Tap label={c.title} key={c.title} onPress={()=>setCategory(category===c.type?null:c.type)} accessibilityState={{selected:category===c.type}} style={[s.category,{backgroundColor:c.color,borderColor:category===c.type?colors.purple:c.color}]}><ProductArt type={c.type} size={52}/><T bold style={{fontSize:13}}>{c.title}</T></Tap>)}</View><Section title={search?'Arama sonuçları':'Öne çıkan ürünler'} action="Sponsorlu" onPress={()=>open('sponsored')}/><View style={[s.row,{gap:10,alignItems:'stretch'}]}>{shown.map(p=><View key={p.id} style={s.product}><ProductArt type={p.type} size={69}/><Tap label={p.title.replace('\n',' ')+' kaydet'} onPress={()=>update(old=>({favorites:old.favorites.includes(p.id)?old.favorites.filter(id=>id!==p.id):[...old.favorites,p.id]}))} style={s.productPlus}><Icon name={state.favorites.includes(p.id)?'check':'plus'} size={18}/></Tap><T bold style={{fontSize:12,lineHeight:17}}>{p.title}</T></View>)}</View>{!shown.length&&<Card><T>Bu aramada ürün bulunamadı.</T><Tap style={{marginTop:12}} onPress={()=>{setCategory(null);setSearch('')}}><T bold>Tüm ürünleri göster</T></Tap></Card>}</>}
    {tab==='Videolar'&&<Card><T bold>Birlikte öğrenelim</T><T style={{lineHeight:23,marginTop:8}}>Video içerikleri henüz eklenmedi. Hazır olduğunda bu alanda bulabileceksin.</T></Card>}
  </Page>;
}

export function Assistant({state,update,open}) {
  const [message,setMessage]=useState('');
  const prompts=['Bu hafta beni neler bekliyor?','Emzirme kaydına bak','Doktor randevumu hatırlat','Lohusalıkta nelere dikkat etmeli?'];
  function send(value) {
    const clean=(value||message).trim();if(!clean)return;
    update(old=>({messages:[...old.messages,{id:Date.now().toString(),text:clean}],notes:[...old.notes,{id:Date.now().toString(),text:clean}]}));setMessage('');Keyboard.dismiss();open('assistantAnswer',{question:clean});
  }
  function promptAction(p,i){if(i===1)open('records');else if(i===2)open('appointment');else send(p)}
  return <Page contentStyle={{gap:11}}>
    <View style={s.assistantHeader}><BrandMark size={51} outline/><T bold style={s.assistantTitle}>Momora Asistan</T><T style={{color:'#86668F',fontSize:15,marginTop:5}}>Sor, paylaş, birlikte düşünelim. 💜</T></View>
    <Card style={s.bubble}><T style={{fontSize:16,lineHeight:23}}>Merhaba! Ben Momora Asistan.{ '\n' }Hamilelik, bebek bakımı, lohusalık ve günlük yaşamda aklına takılan konularda sana rehberlik etmek için buradayım. 🌿</T></Card>
    <View style={{gap:9}}>{prompts.map((p,i)=><Tap key={p} onPress={()=>promptAction(p,i)} style={s.prompt}><T style={{fontSize:15,flex:1}}>{p}</T><Icon name="chevron" size={21}/></Tap>)}</View>
    {state.messages.length>0&&<Tap onPress={()=>open('notes')} style={s.sentMessage}><T style={{fontSize:13}}>Son sorun: {state.messages[state.messages.length-1].text}</T></Tap>}
    <View style={s.messageInput}><TextInput value={message} onChangeText={setMessage} onSubmitEditing={()=>send()} maxLength={600} placeholder="Bana bir şey sor..." placeholderTextColor="#928A92" style={[s.searchInput,{fontSize:14}]} accessibilityLabel="Asistana sor" returnKeyType="send"/><Tap label="Soruyu gönder" onPress={()=>send()} style={s.send}><Icon name="send" size={20} color="white"/></Tap></View>
    <Card style={{padding:13,marginTop:5}}><Section title="Toplulukta neler var?" action="Tümünü gör" onPress={()=>open('community')}/><View style={[s.row,{gap:9}]}><View style={s.smallAvatar}><Image source={assets.pregnancy} style={{height:42,width:63}}/></View><View><T bold style={{fontSize:12}}>Elif K.</T><T style={{fontSize:10,color:colors.muted,marginTop:3}}>2 saat önce</T></View></View><View style={[s.row,{marginTop:8,gap:12}]}><T style={{fontSize:12,lineHeight:19,flex:1}}>6 haftalık bebeğim gece sık uyanıyor. Sizde normal mi? Nasıl başa çıktınız? 💛</T><View style={s.postPhoto}><Image source={assets.mother} style={{width:150,height:100}}/></View></View><View style={[s.row,{gap:20,marginTop:9}]}><Tap onPress={()=>update(old=>({liked:!old.liked}))} label="Paylaşımı beğen" style={[s.row,{gap:5}]}><Icon name="heart" size={17} color={state.liked?'#C58EA5':colors.muted} fill={state.liked?'#C58EA5':'none'}/><T style={{fontSize:11,color:colors.muted}}>{state.liked?25:24}</T></Tap><Tap onPress={()=>open('community')} label="Yorumları gör" style={[s.row,{gap:5}]}><Icon name="chat" size={17} color={colors.muted}/><T style={{fontSize:11,color:colors.muted}}>12</T></Tap></View></Card>
  </Page>;
}

const s=StyleSheet.create({
  row:{flexDirection:'row',alignItems:'center'},topline:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  onboarding:{paddingHorizontal:23,paddingTop:44,paddingBottom:24,gap:0},brand:{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:8},wordmark:{fontSize:29,fontWeight:'300',letterSpacing:-0.7},
  welcome:{alignItems:'center',marginTop:29,marginBottom:35},welcomeTitle:{fontSize:26,letterSpacing:-0.5},welcomeText:{textAlign:'center',fontSize:15,lineHeight:22,marginTop:10},
  journey:{minHeight:145,borderRadius:25,overflow:'hidden',flexDirection:'row',alignItems:'center',paddingRight:14,borderWidth:1,borderColor:'#EDE1E2',...shadow},journeyPhoto:{position:'absolute',left:0,top:0,bottom:0,width:140,overflow:'hidden'},journeyImage:{width:230,height:154,position:'absolute',left:-12,top:0},journeyCopy:{marginLeft:132,flex:1,paddingVertical:20},journeyTitle:{fontSize:18,lineHeight:24},journeySub:{fontSize:13,lineHeight:20,marginTop:7},motto:{alignItems:'center',marginTop:30,gap:7},handwritten:{fontFamily:fonts.script,fontSize:23,lineHeight:25,color:'#9A8495',textAlign:'center'},
  subtitle:{color:'#8C6B94',fontSize:15,marginTop:5},iconHit:{width:42,height:42,justifyContent:'center',alignItems:'center'},pageTitle:{fontSize:25,letterSpacing:-0.5},
  weekStrip:{flexDirection:'row',gap:7,paddingBottom:4},weekPill:{minWidth:58,alignItems:'center',paddingVertical:8,paddingHorizontal:6,borderRadius:20,backgroundColor:'#EEE8E6'},weekActive:{backgroundColor:'#A28ABB',shadowColor:'#9A80B4',shadowOpacity:0.35,shadowRadius:6,shadowOffset:{width:0,height:2}},
  // Fruit hero
  fruitHero:{borderRadius:24,overflow:'hidden',backgroundColor:'#F7F0FA',borderWidth:1,borderColor:'#EDE0EF',flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingLeft:18,paddingRight:8,paddingVertical:16,...shadow},
  fruitHeroLeft:{flex:1,paddingRight:8},
  fruitWeekNum:{fontSize:22,letterSpacing:-0.5,color:'#4A2860'},
  fruitMeta:{fontSize:12,color:'#9A779A',marginTop:3},
  fruitStats:{flexDirection:'row',gap:14,marginTop:10},
  fruitStat:{flexDirection:'row',alignItems:'center',gap:5},
  fruitStatVal:{fontSize:12,color:'#6A4878'},
  progressTrack:{height:6,backgroundColor:'#E5D8EE',borderRadius:4,overflow:'hidden'},
  progressFill:{height:'100%',backgroundColor:'#A28ABB',borderRadius:4},
  fruitHeroBtn:{flexDirection:'row',alignItems:'center',gap:4,marginTop:12},
  fruitRight:{alignItems:'center',paddingRight:6},
  fruitName:{fontSize:12,color:'#6A4878',marginTop:5,fontFamily:fonts.bold},
  fruitSub:{fontSize:10,color:'#9A779A'},
  // Bullet list
  bullet:{width:6,height:6,borderRadius:3,backgroundColor:'#C4A8D0',marginTop:6},
  seeMore:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:12,paddingTop:12,borderTopWidth:1,borderColor:'#EDE5F0'},
  // Legacy (kept for postpartum / baby / etc.)
  hero:{height:283,borderRadius:22,overflow:'hidden',backgroundColor:'#9C7789'},heroTitle:{fontSize:25,color:'white',letterSpacing:-0.3},heroTrimester:{fontSize:15,color:'white',marginTop:4},heroBottom:{position:'absolute',left:16,right:14,bottom:13},heroCaption:{color:'white',fontSize:13,lineHeight:17,textShadowColor:'#6A485A',textShadowRadius:2,textShadowOffset:{width:0,height:1}},heroBottomRow:{flexDirection:'row',alignItems:'center',gap:12,marginTop:4},melon:{width:62,height:55,alignItems:'center',justifyContent:'center'},heroLink:{flex:1,borderRadius:24,paddingHorizontal:14,paddingVertical:12,backgroundColor:'#FFFAF0E8',flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  appointment:{backgroundColor:'#F2EBF4',borderRadius:19,padding:15,flexDirection:'row',alignItems:'center'},appointmentIcon:{height:49,width:49,borderRadius:25,borderWidth:1.5,borderColor:'#CEC0E2',alignItems:'center',justifyContent:'center',backgroundColor:'#F7F2FA'},
  reminder:{minHeight:90,borderRadius:18,padding:10,flexDirection:'row',alignItems:'center',gap:8},reminderTitle:{fontSize:12},reminderSub:{fontSize:11,lineHeight:16,marginTop:7},
  taskMeta:{fontSize:12,color:colors.muted,marginTop:6,marginBottom:8},task:{flexDirection:'row',alignItems:'center',gap:11,paddingVertical:12,borderTopWidth:1,borderColor:'#F1EAE6'},checkbox:{width:22,height:22,borderRadius:12,borderWidth:1,borderColor:'#9B9CA0',alignItems:'center',justifyContent:'center'},taskText:{flex:1,fontSize:14,color:'#555460'},primary:{backgroundColor:colors.purple,borderRadius:18,padding:16,alignItems:'center',marginTop:20},
  avatar:{width:65,height:65,borderRadius:34,overflow:'hidden',borderWidth:2,borderColor:'#E6DACE',backgroundColor:'#EAE8E0'},avatarImage:{width:122,height:81,position:'absolute',left:-8,top:-2},
  babyGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:12,marginTop:6,marginBottom:4},
  babyAction:{width:'48%'},
  babyCard:{borderRadius:24,borderWidth:1.5,paddingVertical:18,paddingHorizontal:10,alignItems:'center',justifyContent:'center',...shadow},
  babyHeroBox:{width:84,height:84,alignItems:'center',justifyContent:'center',marginBottom:6},
  babyHeroImg:{width:84,height:84},
  babyCardTitle:{fontSize:16,letterSpacing:-0.3},
  babyCardSub:{fontSize:11,color:colors.muted,marginTop:3},
  record:{flexDirection:'row',alignItems:'center',gap:11,paddingVertical:10,borderTopWidth:1,borderColor:colors.line},recordTime:{fontSize:13,width:44},recordIcon:{width:38,height:38,borderRadius:19,alignItems:'center',justifyContent:'center'},recordValue:{fontSize:12,color:'#666175',marginTop:4},nextSleep:{backgroundColor:'#EEE5F5',borderRadius:19,padding:15,flexDirection:'row',alignItems:'center',gap:16,marginTop:4},sleepIcon:{height:50,width:50,borderRadius:25,backgroundColor:'#B9A2D9',alignItems:'center',justifyContent:'center'},
  search:{flexDirection:'row',alignItems:'center',gap:9,backgroundColor:'#EFEAE6',borderRadius:24,paddingHorizontal:14,minHeight:44},searchInput:{flex:1,fontFamily:fonts.regular,color:colors.ink,fontSize:13,paddingVertical:10,outlineStyle:'none'},article:{height:184,borderRadius:20,overflow:'hidden',backgroundColor:'#ECDED3'},articleImage:{position:'absolute',width:370,height:247,right:-170,top:-20,transform:[{scaleX:-1}]},articleTag:{position:'absolute',top:16,left:15,fontSize:11,color:'#686266',backgroundColor:'#FFFCF9EE',borderRadius:15,paddingHorizontal:12,paddingVertical:6},articleCopy:{position:'absolute',left:15,bottom:17},articleArrow:{position:'absolute',right:12,bottom:13,width:30,height:30,borderRadius:15,backgroundColor:'#FFFCF9',alignItems:'center',justifyContent:'center'},
  categories:{flexDirection:'row',flexWrap:'wrap',gap:10},category:{width:'48%',flexGrow:1,alignItems:'center',paddingVertical:6,borderRadius:14,borderWidth:1.5},product:{flex:1,borderWidth:1,borderColor:colors.line,borderRadius:16,padding:11,backgroundColor:'#FFFCF8',...shadow},productPlus:{position:'absolute',right:10,top:22,width:28,height:28,borderRadius:14,backgroundColor:'white',alignItems:'center',justifyContent:'center',...shadow},
  assistantHeader:{alignItems:'center',paddingTop:0,paddingBottom:7},assistantTitle:{fontSize:23,color:'#77518F',marginTop:5},bubble:{borderRadius:24,padding:17,backgroundColor:'#FEFBF8'},prompt:{borderWidth:1,borderColor:'#DED4D8',borderRadius:24,paddingVertical:12,paddingHorizontal:17,flexDirection:'row',alignItems:'center',backgroundColor:'#FCF9F5'},messageInput:{borderRadius:28,borderWidth:1,borderColor:'#DED5D5',flexDirection:'row',alignItems:'center',paddingLeft:17,paddingRight:6,minHeight:49,marginTop:11,backgroundColor:'#FFFCF9',...shadow},send:{height:33,width:33,borderRadius:20,backgroundColor:'#A0839E',alignItems:'center',justifyContent:'center'},sentMessage:{borderRadius:15,backgroundColor:'#F0E8F3',padding:12},smallAvatar:{width:32,height:32,borderRadius:16,overflow:'hidden'},postPhoto:{width:81,height:77,borderRadius:12,overflow:'hidden'},
});

