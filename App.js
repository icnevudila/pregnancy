import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions, ActivityIndicator, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from './src/theme';
import { Icon, BrandMark } from './src/Icons';
import { T, Tap } from './src/ui';
import { Onboarding, Pregnancy, Postpartum, Baby, Discover, Assistant } from './src/screens';
import { ToolsHub } from './src/ToolsHub';
import DetailSheet from './src/DetailSheet';
import { useDemoStore } from './src/store';

const previewScreens=[
  ['onboarding','Başlangıç'],
  ['pregnancy','Bugün (Hamilelik)'],
  ['tools','Araçlar & Sayaçlar (Appler)'],
  ['discover','Kütüphane & Magazin (Blog)'],
  ['assistant','Topluluk & Asistan'],
  ['postpartum','Lohusalık'],
  ['baby','Bebek Takibi'],
];
function Momora() {
  const {state,update,addRecord,ready,storageError}=useDemoStore();
  const [page,setPage]=useState(null);const [sheet,setSheet]=useState(null);const [notice,setNotice]=useState('');
  const insets=useSafeAreaInsets();const {width,height}=useWindowDimensions();
  const desktop=Platform.OS==='web'&&width>=850;
  const active=page||state.mode||'onboarding';
  function choose(mode){update({mode});setPage(mode)}
  function open(kind,data){setSheet({kind,data,key:Date.now()})}
  useEffect(()=>{if(notice){const timer=setTimeout(()=>setNotice(''),2700);return()=>clearTimeout(timer)}},[notice]);
  useEffect(()=>{if(storageError)setNotice(storageError)},[storageError]);
  useEffect(()=>{const sub=BackHandler.addEventListener('hardwareBackPress',()=>{if(sheet){setSheet(null);return true}if(page&&page!==state.mode){setPage(state.mode);return true}return false});return()=>sub.remove()},[sheet,page,state.mode]);
  useEffect(()=>{
    if(!ready||!state.mode||state.mode==='onboarding')return;
    const todayStr=new Date().toISOString().slice(0,10);
    if(state.lastMoodDate!==todayStr&&!sheet){
      const timer=setTimeout(()=>{open('dailyMood');},1100);
      return()=>clearTimeout(timer);
    }
  },[ready,state.mode,state.lastMoodDate]);
  const props={state,update,addRecord,open};
  const renderPage=()=>{switch(active){case'pregnancy':return <Pregnancy {...props}/>;case'tools':return <ToolsHub {...props} toast={setNotice}/>;case'postpartum':return <Postpartum {...props}/>;case'baby':return <Baby {...props}/>;case'discover':return <Discover {...props}/>;case'assistant':return <Assistant {...props}/>;default:return <Onboarding choose={choose}/>}};
  if(!ready)return <View style={s.loading}><BrandMark size={60}/><ActivityIndicator color={colors.purple}/></View>;
  return <View style={[s.root,desktop&&s.desktop]}>
    {desktop&&<View style={s.sidebar}><View style={s.desktopBrand}><BrandMark size={55}/><T style={s.desktopWordmark}>MOMORA</T></View><T style={s.desktopTag}>Her adımda, daha güçlü bir sen.</T><View style={{gap:8,marginTop:42}}>{previewScreens.map(([id,label],index)=><Tap key={id} onPress={()=>setPage(id)} label={'Ekran: '+label} accessibilityState={{selected:active===id}} style={[s.previewTab,active===id&&s.previewTabActive]}><T style={[s.previewNumber,active===id&&{color:colors.purple}]}>{String(index+1).padStart(2,'0')}</T><T bold={active===id} style={{fontSize:15}}>{label}</T><View style={{flex:1}}/>{active===id&&<Icon name="chevron" color={colors.purple} size={18}/>}</Tap>)}</View><View style={s.localBadge}><View style={s.dot}/><T style={{fontSize:12,color:colors.muted}}>Yerel demo · React Native / Expo Go</T></View></View>}
    <View style={[s.phone,desktop&&[s.phoneDesktop,{height:Math.min(944,height-44)}]]}>
      <StatusBar style="dark"/>
      {desktop?<View style={s.statusMock}><T bold style={{fontSize:13}}>9:41</T><View style={s.island}/><T style={{fontSize:13}}>▮▮▮  ▰</T></View>:<View style={{height:insets.top}}/>}
      <View style={{flex:1}} key={active}>{renderPage()}</View>
      {active!=='onboarding'&&<View style={[s.nav,{paddingBottom:desktop?19:Math.max(12,insets.bottom)}]}>{[
        {label:'Bugün',icon:'home',selected:['pregnancy','postpartum'].includes(active),action:()=>setPage(state.mode||'pregnancy')},
        {label:'Araçlar',icon:'track',selected:active==='tools',action:()=>setPage('tools')},
        {label:'Kütüphane',icon:'book',selected:active==='discover',action:()=>setPage('discover')},
        {label:'Topluluk',icon:'community',selected:active==='assistant',action:()=>setPage('assistant')},
        {label:'Profil',icon:'profile',selected:false,action:()=>open('profile')},
      ].map(tab=><Tap key={tab.label} label={tab.label} onPress={tab.action} accessibilityState={{selected:tab.selected}} style={s.navItem}><Icon name={tab.icon} size={22} color={tab.selected?'#5F4D7D':'#7C7E83'} fill={tab.selected&&(tab.icon==='home'||tab.icon==='book')?'#5F4D7D':'none'}/><T style={[s.navLabel,tab.selected&&{color:'#5F4D7D',fontFamily:fonts.bold}]}>{tab.label}</T></Tap>)}</View>}
      {active==='onboarding'&&!desktop&&<View style={{height:insets.bottom}}/>}
      {!!notice&&<View style={s.toast}><T style={{color:'white',fontSize:14,textAlign:'center'}}>{notice}</T></View>}
    </View>
    {sheet&&<DetailSheet key={sheet.key} sheet={sheet} close={()=>setSheet(null)} {...props} choose={choose} toast={setNotice}/>}
  </View>;
}
export default function App(){
  const [loaded,error]=useFonts({Lato:require('./assets/fonts/Lato-Regular.ttf'),LatoBold:require('./assets/fonts/Lato-Bold.ttf'),Caveat:require('./assets/fonts/Caveat.ttf')});
  if(!loaded&&!error)return <View style={s.loading}><ActivityIndicator color={colors.purple}/></View>;
  return <SafeAreaProvider><Momora/></SafeAreaProvider>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:colors.canvas,alignItems:'center'},desktop:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:72,backgroundColor:'#F2EDE6'},loading:{flex:1,alignItems:'center',justifyContent:'center',gap:20,backgroundColor:colors.canvas},phone:{flex:1,width:'100%',maxWidth:500,backgroundColor:colors.canvas,overflow:'hidden'},phoneDesktop:{flex:0,width:390,borderRadius:48,borderWidth:8,borderColor:'#282729',shadowColor:'#5B4949',shadowOpacity:0.18,shadowRadius:35,shadowOffset:{width:0,height:16}},sidebar:{width:287,alignSelf:'center'},desktopBrand:{flexDirection:'row',alignItems:'center',gap:8},desktopWordmark:{fontSize:39,letterSpacing:-1.7,fontFamily:fonts.regular},desktopTag:{fontSize:14,color:'#8A768C',marginTop:8},previewTab:{flexDirection:'row',alignItems:'center',gap:13,borderRadius:14,padding:15},previewTabActive:{backgroundColor:'#E8DEE9'},previewNumber:{fontSize:12,color:'#A699A7'},localBadge:{flexDirection:'row',alignItems:'center',gap:8,marginTop:39},dot:{width:6,height:6,borderRadius:3,backgroundColor:'#8BA48C'},statusMock:{height:42,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:24},island:{position:'absolute',width:106,height:27,borderRadius:20,backgroundColor:'#121214',top:8,left:'50%',marginLeft:-53},nav:{flexDirection:'row',paddingTop:12,paddingHorizontal:9,backgroundColor:'#FCF9F5',borderTopWidth:1,borderColor:'#EEE7E4'},navItem:{flex:1,minHeight:39,alignItems:'center',justifyContent:'center',gap:5},navLabel:{fontSize:10,color:'#85818B'},toast:{position:'absolute',bottom:95,left:20,right:20,padding:15,borderRadius:18,backgroundColor:'#695773F2'}});
