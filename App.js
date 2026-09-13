import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions, ActivityIndicator, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from './src/theme';
import { Icon, BrandMark } from './src/Icons';
import { T, Tap, LanguageToggle, InAppNotificationBanner } from './src/ui';
import { Onboarding, Pregnancy, Postpartum, Baby, Discover, Assistant } from './src/screens';
import { ToolsHub } from './src/ToolsHub';
import DetailSheet from './src/DetailSheet';
import { ProfileScreen } from './src/ProfileScreen';
import { AuthModal } from './src/AuthScreens';
import { useMomoraStore } from './src/store';
import { supabase } from './src/supabaseClient';
import { t } from './src/i18n/index.js';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  rescheduleAllReminders,
  syncPushTokenWithSupabase,
  loadNotificationSettings,
} from './src/notifications';
import { ErrorBoundary } from './src/ErrorBoundary';
import { analytics } from './src/services/analytics';

function Momora() {
  const {
    state,
    update,
    addRecord,
    addTrackerRecord,
    updateTrackerRecord,
    deleteTrackerRecord,
    undoLastAction,
    ready,
    storageError,
    cloudStatus,
    refreshFromCloud,
  } = useMomoraStore();
  const [page,setPage]=useState(null);const [sheet,setSheet]=useState(null);const [notice,setNotice]=useState('');
  const insets=useSafeAreaInsets();const {width,height}=useWindowDimensions();
  const desktop=Platform.OS==='web'&&width>=850;
  const active = page || state.mode || (state.hasCompletedOnboarding === false ? 'onboarding' : 'pregnancy');
  const lang=state.lang||'tr';

  const previewScreens=[
    ['onboarding', t('preview.onboarding', lang)],
    ['auth', t('preview.auth', lang)],
    ['pregnancy', t('preview.pregnancy', lang)],
    ['tools', t('preview.tools', lang)],
    ['discover', t('preview.discover', lang)],
    ['assistant', t('preview.assistant', lang)],
    ['profile', t('preview.profile', lang)],
    ['postpartum', t('preview.postpartum', lang)],
    ['baby', t('preview.baby', lang)],
  ];

  function choose(mode){update({mode, hasCompletedOnboarding: true});setPage(mode)}
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

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        update(old => ({
          user: data.session.user,
          name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || old.name,
        }));
        refreshFromCloud().catch(() => {});
      }
    }).catch(() => {});

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        update(old => ({
          user: session.user,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || old.name,
        }));
        refreshFromCloud().catch(() => {});
        if (page === 'auth') {
          setPage(state.mode || 'pregnancy');
        }
        if (sheet?.kind === 'auth') {
          setSheet(null);
        }
        setNotice(t('common.toastSignedIn', lang));
      } else if (event === 'SIGNED_OUT') {
        update(old => ({
          user: {
            id: 'usr_local_' + (old.role || 'mother'),
            displayName: old.name,
            locale: old.lang || 'tr',
            activeRole: old.role || 'mother',
          },
        }));
      }
    });
    return () => listener?.subscription?.unsubscribe();
  }, [page, sheet, state.mode, lang]);

  useEffect(() => {
    let sub = null;
    async function initNotifications() {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token && state.user?.id) {
          syncPushTokenWithSupabase(token, state.user.id);
        }
        const savedSettings = await loadNotificationSettings();
        await rescheduleAllReminders(savedSettings, state.pregnancyWeek || 24, lang);
      } catch (err) {
        console.warn('Push notification init error:', err);
      }
    }
    initNotifications();

    try {
      if (Notifications?.addNotificationResponseReceivedListener) {
        sub = Notifications.addNotificationResponseReceivedListener(response => {
          const data = response?.notification?.request?.content?.data || {};
          if (data.tool === 'water' || data.tool === 'vitamin') {
            open('waterVitamin');
          } else if (data.tool === 'kicks') {
            open('kickCounter');
          } else if (data.tool === 'contractions') {
            open('contractionTimer');
          } else if (data.tool === 'appointment') {
            open('appointment');
          } else if (data.tool === 'notifications') {
            open('notifications');
          } else if (data.screen === 'discover') {
            setPage('discover');
          } else if (data.screen === 'profile') {
            setPage('profile');
          } else if (data.screen === 'tools') {
            setPage('tools');
          }
        });
      }
    } catch (e) {
      // noop
    }

    return () => {
      try {
        if (sub && typeof sub.remove === 'function') {
          sub.remove();
        } else if (sub && Notifications?.removeNotificationSubscription) {
          Notifications.removeNotificationSubscription(sub);
        }
      } catch (e) {}
    };
  }, [state.user?.id]);

  const props = {
    state,
    update,
    addRecord,
    addTrackerRecord,
    updateTrackerRecord,
    deleteTrackerRecord,
    undoLastAction,
    open,
    cloudStatus,
    refreshFromCloud,
    lang,
    choose,
    setPage,
  };
  const renderPage=()=>{switch(active){case'pregnancy':return <Pregnancy {...props}/>;case'tools':return <ToolsHub {...props} toast={setNotice}/>;case'postpartum':return <Postpartum {...props}/>;case'baby':return <Baby {...props}/>;case'discover':return <Discover {...props}/>;case'assistant':return <Assistant {...props} toast={setNotice}/>;case'profile':return <ProfileScreen {...props} toast={setNotice} choose={choose}/>;case'auth':return <AuthModal close={()=>setPage(state.mode||'pregnancy')} toast={setNotice} onAuthSuccess={u=>{update({user:u});if(u?.user_metadata?.full_name)update({name:u.user_metadata.full_name});setPage(state.mode||'pregnancy');}} lang={lang}/>;default:return <Onboarding choose={choose} update={update} toast={setNotice} lang={lang} open={open} setPage={setPage} state={state}/>}};
  return <View style={[s.root,desktop&&s.desktop]}>
    {desktop&&<View style={s.sidebar}><View style={s.desktopBrand}><BrandMark size={55}/><T style={s.desktopWordmark}>MOMORA</T></View><T style={s.desktopTag}>{t('preview.desktopTag', lang)}</T><View style={{flexDirection:'row',alignItems:'center',gap:8,marginTop:12}}><T style={{fontSize:12,color:colors.muted}}>{t('common.language', lang)}:</T><LanguageToggle lang={lang} onChange={l=>update({lang:l})}/></View><View style={{gap:8,marginTop:28}}>{previewScreens.map(([id,label],index)=><Tap key={id} onPress={()=>setPage(id)} label={'Ekran: '+label} accessibilityState={{selected:active===id}} style={[s.previewTab,active===id&&s.previewTabActive]}><T style={[s.previewNumber,active===id&&{color:colors.purple}]}>{String(index+1).padStart(2,'0')}</T><T bold={active===id} style={{fontSize:15}}>{label}</T><View style={{flex:1}}/>{active===id&&<Icon name="chevron" color={colors.purple} size={18}/>}</Tap>)}</View><View style={s.localBadge}><View style={s.dot}/><T style={{fontSize:12,color:colors.muted}}>{t('preview.devPreview', lang)}</T></View></View>}
    <View style={[s.phone,desktop&&[s.phoneDesktop,{height:Math.min(944,height-44)}]]}>
      <StatusBar style="dark"/>
      {desktop ? (
        <View style={s.statusMock}>
          <T bold style={{fontSize:13}}>9:41</T>
          <View style={s.island}/>
          <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
            <LanguageToggle lang={lang} onChange={l=>update({lang:l})} compact/>
            <T style={{fontSize:13}}>▮▮▮  ▰</T>
          </View>
        </View>
      ) : (
        <View style={{ height: Math.max(insets.top, Platform.OS === 'ios' ? 44 : 0) }} />
      )}
      <View style={{flex:1}} key={active}>{renderPage()}</View>
      {!['onboarding', 'auth'].includes(active) && <View style={[s.nav,{paddingBottom:desktop?19:Math.max(12,insets.bottom)}]}>{[
        {label:t('nav.today', lang),icon:'home',selected:['pregnancy','postpartum','baby'].includes(active),action:()=>setPage(state.mode||'pregnancy')},
        {label:t('nav.tools', lang),icon:'track',selected:active==='tools',action:()=>setPage('tools')},
        {label:t('nav.discover', lang),icon:'book',selected:active==='discover',action:()=>setPage('discover')},
        {label:t('nav.community', lang),icon:'community',selected:active==='assistant',action:()=>setPage('assistant')},
        {label:t('nav.profile', lang),icon:'profile',selected:active==='profile',action:()=>setPage('profile')},
      ].map(tab=><Tap key={tab.label} label={tab.label} onPress={tab.action} accessibilityState={{selected:tab.selected}} style={s.navItem}><Icon name={tab.icon} size={22} color={tab.selected?'#5F4D7D':'#7C7E83'} fill={tab.selected&&(tab.icon==='home'||tab.icon==='book')?'#5F4D7D':'none'}/><T style={[s.navLabel,tab.selected&&{color:'#5F4D7D',fontFamily:fonts.bold}]}>{tab.label}</T></Tap>)}</View>}
      {['onboarding', 'auth'].includes(active) && !desktop && <View style={{height:insets.bottom}}/>}
      <InAppNotificationBanner
        lang={lang}
        onOpen={(data) => {
          if (data?.tool) open(data.tool);
          else if (data?.screen) setPage(data.screen);
        }}
      />
      {!!notice&&<View style={s.toast}><T style={{color:'white',fontSize:14,textAlign:'center'}}>{notice}</T></View>}
    </View>
    {sheet&&<DetailSheet key={sheet.key} sheet={sheet} close={()=>setSheet(null)} {...props} choose={choose} toast={setNotice} lang={lang}/>}
  </View>;
}
export default function App(){
  const [fontsLoaded] = useFonts({
    Lato: require('./assets/fonts/Lato-Regular.ttf'),
    LatoBold: require('./assets/fonts/Lato-Bold.ttf'),
    Caveat: require('./assets/fonts/Caveat.ttf'),
  });

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        {fontsLoaded ? <Momora /> : (
          <View style={s.loading}>
            <ActivityIndicator size="large" color={colors.purple} />
          </View>
        )}
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:colors.canvas,alignItems:'center'},desktop:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:72,backgroundColor:'#F2EDE6'},loading:{flex:1,alignItems:'center',justifyContent:'center',gap:20,backgroundColor:colors.canvas},phone:{flex:1,width:'100%',maxWidth:500,backgroundColor:colors.canvas,overflow:'hidden'},phoneDesktop:{flexGrow:0,flexShrink:0,flexBasis:390,width:390,borderRadius:48,borderWidth:8,borderColor:'#282729',shadowColor:'#5B4949',shadowOpacity:0.18,shadowRadius:35,shadowOffset:{width:0,height:16}},sidebar:{width:287,alignSelf:'center'},desktopBrand:{flexDirection:'row',alignItems:'center',gap:8},desktopWordmark:{fontSize:39,letterSpacing:-1.7,fontFamily:fonts.regular},desktopTag:{fontSize:14,color:'#8A768C',marginTop:8},previewTab:{flexDirection:'row',alignItems:'center',gap:13,borderRadius:14,padding:15},previewTabActive:{backgroundColor:'#E8DEE9'},previewNumber:{fontSize:12,color:'#A699A7'},localBadge:{flexDirection:'row',alignItems:'center',gap:8,marginTop:39},dot:{width:6,height:6,borderRadius:3,backgroundColor:'#8BA48C'},statusMock:{height:42,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:24},island:{position:'absolute',width:106,height:27,borderRadius:20,backgroundColor:'#121214',top:8,left:'50%',marginLeft:-53},nav:{flexDirection:'row',paddingTop:12,paddingHorizontal:9,backgroundColor:'#FCF9F5',borderTopWidth:1,borderColor:'#EEE7E4'},navItem:{flex:1,minHeight:39,alignItems:'center',justifyContent:'center',gap:5},navLabel:{fontSize:10,color:'#85818B'},toast:{position:'absolute',bottom:95,left:20,right:20,padding:15,borderRadius:18,backgroundColor:'#695773F2'}});
