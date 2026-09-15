import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, ScreenHero, InfoNote, MetricCard } from './ui';
import { saveTrackingEvent } from './backendSync';

export const CDC_MILESTONES = [
  {
    month: 2,
    titleTr: '2. Ay Gelişim Basamakları',
    titleEn: '2-Month Milestones',
    motorTr: [
      { id: 'm2_1', text: 'Yüzüstü yatarken başını yukarı kaldırıp kısa süre tutabilir' },
      { id: 'm2_2', text: 'Her iki kol ve bacağını simetrik olarak hareket ettirir' },
      { id: 'm2_3', text: 'Ellerini kısa süre açık tutmaya başlar' },
    ],
    motorEn: [
      { id: 'm2_1', text: 'Holds head up when on tummy' },
      { id: 'm2_2', text: 'Moves both arms and both legs smoothly' },
      { id: 'm2_3', text: 'Briefly opens hands from tight fists' },
    ],
    cognitiveTr: [
      { id: 'c2_1', text: 'Hareket eden nesneleri ve insanları gözleriyle kısa süre takip eder' },
      { id: 'c2_2', text: 'Etrafındaki parlak ışıklara veya renklere ilgiyle bakar' },
    ],
    cognitiveEn: [
      { id: 'c2_1', text: 'Watches parents move across the room' },
      { id: 'c2_2', text: 'Looks at a toy for several seconds' },
    ],
    languageTr: [
      { id: 'l2_1', text: 'Agu benzeri ünlü sesler (ooh, aah) çıkarır' },
      { id: 'l2_2', text: 'Yüksek veya ani bir ses duyduğunda irkilir ya da başını sese çevirir' },
    ],
    languageEn: [
      { id: 'l2_1', text: 'Makes vocal cooing sounds like "ooh" and "aah"' },
      { id: 'l2_2', text: 'Reacts or startles to sudden loud noises' },
    ],
    socialTr: [
      { id: 's2_1', text: 'Konuşulduğunda veya gülümsendiğinde ilk bilinçli sosyal gülümsemeyi verir' },
      { id: 's2_2', text: 'Kucağa alındığında veya sevildiğinde sakinleşir' },
    ],
    socialEn: [
      { id: 's2_1', text: 'Smiles at people when spoken to' },
      { id: 's2_2', text: 'Can calm down briefly when comforted' },
    ],
    redFlagsTr: [
      'Yüksek seslere hiç tepki vermiyorsa',
      'Hareket eden şeyleri gözleriyle takip etmiyorsa',
      'Ellerini hiç ağzına götürmüyorsa',
      'Yüzüstü yatarken başını hiç kaldıramıyorsa',
    ],
    redFlagsEn: [
      'Does not respond to loud sounds',
      'Does not watch things as they move',
      'Does not bring hands to mouth',
      'Cannot hold head up when on stomach',
    ],
    tummyGoalMin: 15, // 15 min/day
  },
  {
    month: 4,
    titleTr: '4. Ay Gelişim Basamakları',
    titleEn: '4-Month Milestones',
    motorTr: [
      { id: 'm4_1', text: 'Destekle kucakta dik tutulduğunda başını sallanmadan sabit tutar' },
      { id: 'm4_2', text: 'Yüzüstü yatarken önkolları üzerine dayanıp göğsünü kaldırır' },
      { id: 'm4_3', text: 'Oyuncaklara uzanır ve yakalamaya çalışır' },
      { id: 'm4_4', text: 'Sırtüstünden yan pozisyona dönme denemeleri yapar' },
    ],
    motorEn: [
      { id: 'm4_1', text: 'Holds head steady without support when held' },
      { id: 'm4_2', text: 'Pushes up onto forearms when on tummy' },
      { id: 'm4_3', text: 'Reaches for a toy with intentional movement' },
      { id: 'm4_4', text: 'Rolls from tummy to back or side' },
    ],
    cognitiveTr: [
      { id: 'c4_1', text: 'Acıktığında veya sıkıldığında farklı ağlama tonları kullanır' },
      { id: 'c4_2', text: 'Ellerini ilgiyle inceler ve birbiriyle oynatır' },
      { id: 'c4_3', text: 'Aynadaki görüntüsüne merakla bakar' },
    ],
    cognitiveEn: [
      { id: 'c4_1', text: 'Uses different cries for hunger vs discomfort' },
      { id: 'c4_2', text: 'Looks at hands with fascination' },
      { id: 'c4_3', text: 'Smiles at reflection in baby-safe mirror' },
    ],
    languageTr: [
      { id: 'l4_1', text: 'Neşeli kıkırdamalar ve sesli kahkahalar atar' },
      { id: 'l4_2', text: 'Duyduğu sesleri taklit etmeye çalışır' },
    ],
    languageEn: [
      { id: 'l4_1', text: 'Chuckles or laughs out loud' },
      { id: 'l4_2', text: 'Makes sounds back when talked to' },
    ],
    socialTr: [
      { id: 's4_1', text: 'İnsanlarla oyun oynamayı sever; oyun durduğunda ağlayabilir' },
      { id: 's4_2', text: 'Yüz ifadelerini (şaşkınlık, neşe) taklit eder' },
    ],
    socialEn: [
      { id: 's4_1', text: 'Enjoys social play and may cry when it stops' },
      { id: 's4_2', text: 'Copies facial expressions like smiling or frowning' },
    ],
    redFlagsTr: [
      'Göz temasından kaçınıyorsa',
      'Başını dik ve sabit tutamıyorsa',
      'Gülümsemiyor veya sesli gülmüyorsa',
      'Bir veya iki gözü sürekli içe/dışa kayıyorsa',
    ],
    redFlagsEn: [
      'Does not make steady eye contact',
      'Cannot hold head steady',
      'Does not smile or coo',
      'Has trouble moving one or both eyes in all directions',
    ],
    tummyGoalMin: 30, // 30 min/day
  },
  {
    month: 6,
    titleTr: '6. Ay Gelişim Basamakları',
    titleEn: '6-Month Milestones',
    motorTr: [
      { id: 'm6_1', text: 'Her iki yöne (karından sırta ve sırttan karına) rahatça yuvarlanır' },
      { id: 'm6_2', text: 'Desteksiz kısa süreler oturabilir (tripod pozisyonu)' },
      { id: 'm6_3', text: 'Bir nesneyi bir elinden diğerine aktarır' },
      { id: 'm6_4', text: 'Ayakları yere bastırıldığında bacaklarına ağırlık verir' },
    ],
    motorEn: [
      { id: 'm6_1', text: 'Rolls over in both directions (front to back, back to front)' },
      { id: 'm6_2', text: 'Begins to sit without support (tripod sit)' },
      { id: 'm6_3', text: 'Passes a toy from one hand to the other' },
      { id: 'm6_4', text: 'Supports weight on legs when held standing' },
    ],
    cognitiveTr: [
      { id: 'c6_1', text: 'Uzağındaki nesnelere ulaşmak için çaba gösterir' },
      { id: 'c6_2', text: 'Ağzına götürerek nesnelerin dokusunu keşfeder' },
    ],
    cognitiveEn: [
      { id: 'c6_1', text: 'Reaches purposefully for out-of-reach objects' },
      { id: 'c6_2', text: 'Brings objects to mouth to explore textures' },
    ],
    languageTr: [
      { id: 'l6_1', text: 'Ünsüz harfleri birleştirerek babıldar (ba-ba, ma-ma, da-da)' },
      { id: 'l6_2', text: 'Kendi adına seslenildiğinde başını çevirip bakar' },
    ],
    languageEn: [
      { id: 'l6_1', text: 'Strings vowels together and babbles ("ba-ba", "da-da")' },
      { id: 'l6_2', text: 'Responds to own name by turning head' },
    ],
    socialTr: [
      { id: 's6_1', text: 'Tanıdık yüzleri yabancılardan net şekilde ayırt eder' },
      { id: 's6_2', text: 'Aynada kendi aksine neşeyle dokunur ve güler' },
    ],
    socialEn: [
      { id: 's6_1', text: 'Knows familiar faces and begins to show stranger awareness' },
      { id: 's6_2', text: 'Likes to look at self in a mirror' },
    ],
    redFlagsTr: [
      'Nesnelere uzanmaya çalışmıyorsa',
      'Ebeveynine sevgi/bağ belirtisi göstermiyorsa',
      'Etrafındaki seslere tepki vermiyorsa',
      'Yuvarlanamıyorsa',
    ],
    redFlagsEn: [
      'Doesn’t try to get things that are in reach',
      'Shows no affection for caregivers',
      'Doesn’t respond to sounds around them',
      'Doesn’t roll over in either direction',
    ],
    tummyGoalMin: 45,
  },
  {
    month: 9,
    titleTr: '9. Ay Gelişim Basamakları',
    titleEn: '9-Month Milestones',
    motorTr: [
      { id: 'm9_1', text: 'Kendi başına oturma pozisyonuna geçer ve desteksiz dengeli oturur' },
      { id: 'm9_2', text: 'Emekler veya karnı üzerinde sürünerek ilerler' },
      { id: 'm9_3', text: 'Mobilyalara tutunarak ayağa kalkar' },
      { id: 'm9_4', text: 'Başparmak ve işaret parmağıyla küçük lokmaları tutar (Kıskaç / Pincer Grasp)' },
    ],
    motorEn: [
      { id: 'm9_1', text: 'Gets into sitting position and sits without support' },
      { id: 'm9_2', text: 'Crawls or scoots across the room' },
      { id: 'm9_3', text: 'Pulls up to stand holding furniture' },
      { id: 'm9_4', text: 'Uses pincer grasp (thumb and index finger) to pick up small puffs' },
    ],
    cognitiveTr: [
      { id: 'c9_1', text: 'Saklanan veya battaniye altına konan oyuncağı arar (Nesne Sürekliliği)' },
      { id: 'c9_2', text: 'Ce-e (Peek-a-boo) oyunundan büyük keyif alır' },
    ],
    cognitiveEn: [
      { id: 'c9_1', text: 'Looks for things they see you hide (object permanence)' },
      { id: 'c9_2', text: 'Plays peek-a-boo with high engagement' },
    ],
    languageTr: [
      { id: 'l9_1', text: '"Hayır" kelimesinin tonunu anlar ve duraksar' },
      { id: 'l9_2', text: 'Farklı heceleri art arda tekrarlar (mamama, bababa)' },
    ],
    languageEn: [
      { id: 'l9_1', text: 'Understands "no" and pauses briefly' },
      { id: 'l9_2', text: 'Makes many different consonant sounds' },
    ],
    socialTr: [
      { id: 's9_1', text: 'Yabancılardan çekinir; anneden ayrılırken yapışır (Ayrılık Kaygısı)' },
      { id: 's9_2', text: 'Favori oyuncakları veya battaniyesi vardır' },
    ],
    socialEn: [
      { id: 's9_1', text: 'Clingy with familiar adults around strangers (separation anxiety)' },
      { id: 's9_2', text: 'Has favorite soft toys or blankets' },
    ],
    redFlagsTr: [
      'Destekle dahi bacaklarına basamıyorsa',
      'Desteksiz oturamıyorsa',
      'Babıldamıyorsa (ba, da, ma sesleri)',
      'Adına tepki vermiyorsa',
    ],
    redFlagsEn: [
      'Doesn’t bear weight on legs with support',
      'Doesn’t sit with help',
      'Doesn’t babble ("mama", "baba")',
      'Doesn’t respond to own name',
    ],
    tummyGoalMin: 60,
  },
  {
    month: 12,
    titleTr: '12. Ay Gelişim Basamakları',
    titleEn: '12-Month Milestones',
    motorTr: [
      { id: 'm12_1', text: 'Mobilyalara tutunarak sıralar (Cruising) ve ilk bağımsız adımlarını atabilir' },
      { id: 'm12_2', text: 'Ayakta desteksiz birkaç saniye durabilir' },
      { id: 'm12_3', text: 'Bardağı tutmaya ve yardımla içmeye çalışır' },
    ],
    motorEn: [
      { id: 'm12_1', text: 'Cruises along furniture and may take first independent steps' },
      { id: 'm12_2', text: 'Stands alone for a few seconds' },
      { id: 'm12_3', text: 'Drinks from an open cup with help' },
    ],
    cognitiveTr: [
      { id: 'c12_1', text: 'Eşyaları kabın içine koyup tekrar çıkarır' },
      { id: 'c12_2', text: 'Basit komutları vücut diliyle takip eder ("Bana ver")' },
    ],
    cognitiveEn: [
      { id: 'c12_1', text: 'Puts things in a container and takes them out' },
      { id: 'c12_2', text: 'Follows simple one-step directions ("give me the ball")' },
    ],
    languageTr: [
      { id: 'l12_1', text: 'Bilinçli olarak "mama", "baba", "dede" veya 1-2 gerçek kelime söyler' },
      { id: 'l12_2', text: 'İsteklerini belirtmek için işaret parmağıyla gösterir' },
    ],
    languageEn: [
      { id: 'l12_1', text: 'Says 1-2 intentional words besides mama/dada' },
      { id: 'l12_2', text: 'Points to objects they want' },
    ],
    socialTr: [
      { id: 's12_1', text: 'El sallar (Bay-bay), alkış yapar ve öpücük gönderir' },
      { id: 's12_2', text: 'Ebeveyn odadan çıktığında ağlayarak peşinden emekler' },
    ],
    socialEn: [
      { id: 's12_1', text: 'Waves "bye-bye" and claps hands playfully' },
      { id: 's12_2', text: 'Shows distress when parent leaves room' },
    ],
    redFlagsTr: [
      'Emeklemiyor veya vücudunu hareket ettiremiyorsa',
      'Ayakta tutulduğunda basmıyorsa',
      'İşaret parmağıyla göstermiyorsa',
      'Hiç anlamlı kelime veya hece üretmiyorsa',
    ],
    redFlagsEn: [
      'Doesn’t crawl',
      'Can’t stand when supported',
      'Doesn’t point to things',
      'Doesn’t say single words like "mama" or "dada"',
    ],
    tummyGoalMin: 60,
  },
];

export function BabyMilestonesScreen({ state, update, toast, close, lang: propLang }) {
  const lang = propLang || state?.lang || 'tr';
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState('milestones'); // 'milestones' | 'tummy' | 'redflags'
  const [selectedMonth, setSelectedMonth] = useState(6);

  // Tummy Time Timer state
  const [tummyRunning, setTummyRunning] = useState(false);
  const [tummySeconds, setTummySeconds] = useState(0);
  const timerRef = useRef(null);

  const completedMilestones = state.babyMilestones || {};

  const currentBracket = useMemo(() => {
    return CDC_MILESTONES.find(b => b.month === selectedMonth) || CDC_MILESTONES[2];
  }, [selectedMonth]);

  // Tummy time ticking effect
  useEffect(() => {
    if (tummyRunning) {
      timerRef.current = setInterval(() => {
        setTummySeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [tummyRunning]);

  const toggleMilestone = (id) => {
    const next = { ...completedMilestones, [id]: !completedMilestones[id] };
    update && update({ babyMilestones: next });
  };

  const handleSaveTummyTime = () => {
    if (tummySeconds < 10) {
      toast && toast(isEn ? 'Session too short to save.' : 'Kayıt için seans çok kısa (en az 10 sn).');
      return;
    }
    setTummyRunning(false);
    const mins = Math.round(tummySeconds / 60);

    const newSession = {
      id: `tt_${Date.now()}`,
      date: new Date().toISOString(),
      durationSec: tummySeconds,
      month: selectedMonth,
    };

    const pastSessions = state.tummyTimeSessions || [];
    update && update({ tummyTimeSessions: [newSession, ...pastSessions] });

    saveTrackingEvent({
      type: 'tummy_time',
      title: 'Tummy Time Seansı',
      value: `${tummySeconds} sn (${mins} dk)`,
      metadata: newSession,
    }).catch(() => {});

    toast && toast(isEn ? `Great job! ${mins} min tummy time recorded.` : `Tebrikler! ${mins} dakikalık karın üstü seansı kaydedildi.`);
    setTummySeconds(0);
  };

  // Stats for current bracket
  const currentTotal = (currentBracket.motorTr.length + currentBracket.cognitiveTr.length + currentBracket.languageTr.length + currentBracket.socialTr.length);
  const currentDone = [
    ...currentBracket.motorTr,
    ...currentBracket.cognitiveTr,
    ...currentBracket.languageTr,
    ...currentBracket.socialTr,
  ].filter(item => completedMilestones[item.id]).length;

  const pct = Math.round((currentDone / currentTotal) * 100);

  const formatTimer = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      <ScreenHero
        title={isEn ? 'CDC Baby Milestones & Tummy Time' : 'CDC Gelişim Basamakları & Tummy Time'}
        subtitle={isEn ? 'AAP / CDC 2022 developmental checklist & neck muscle coach' : 'Amerikan Pediatri Akademisi (AAP) onaylı gelişim takibi ve karın üstü koçu'}
        badge="CDC / AAP 2022"
        badgeColor="#059669"
        art="card_baby_milestones"
      />

      {/* Top Clinical Safety Notice */}
      <View style={styles.medicalDisclaimerCard}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <T style={{ fontSize: 16 }}>⚠️</T>
          <View style={{ flex: 1 }}>
            <T bold style={styles.medicalDisclaimerTitle}>
              {isEn ? 'CDC / AAP Developmental Health Notice' : 'Gelişim Takibi & Pediatrik Uyarı'}
            </T>
            <T style={styles.medicalDisclaimerText}>
              {isEn
                ? 'CDC milestones represent what ≥75% of children achieve at each age bracket. Every child develops at their own unique pace. If you notice any persistent red flags or lack of response, share them promptly with your pediatrician.'
                : 'CDC gelişim basamakları aynı yaştaki bebeklerin en az %75’inin ulaştığı dönüm noktalarıdır. Her bebeğin gelişim hızı farklıdır. Kırmızı bayraklar veya şüphelendiğiniz bir gerilik durumunda gecikmeden çocuk doktorunuza danışınız.'}
            </T>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Tap
          onPress={() => setActiveTab('milestones')}
          style={[styles.tabBtn, activeTab === 'milestones' && styles.tabBtnActive]}
        >
          <T bold={activeTab === 'milestones'} style={{ color: activeTab === 'milestones' ? colors.primary : colors.textMuted, fontSize: 13 }}>
            {isEn ? 'Milestones' : 'Gelişim'}
          </T>
        </Tap>
        <Tap
          onPress={() => setActiveTab('tummy')}
          style={[styles.tabBtn, activeTab === 'tummy' && styles.tabBtnActive]}
        >
          <T bold={activeTab === 'tummy'} style={{ color: activeTab === 'tummy' ? colors.primary : colors.textMuted, fontSize: 13 }}>
            ⏱️ {isEn ? 'Tummy Time' : 'Tummy Time'}
          </T>
        </Tap>
        <Tap
          onPress={() => setActiveTab('redflags')}
          style={[styles.tabBtn, activeTab === 'redflags' && styles.tabBtnActive]}
        >
          <T bold={activeTab === 'redflags'} style={{ color: activeTab === 'redflags' ? colors.primary : colors.textMuted, fontSize: 13 }}>
            🚩 {isEn ? 'Red Flags' : 'Kırmızı Bayrak'}
          </T>
        </Tap>
      </View>

      {/* Month Selector Carousel */}
      <View style={{ marginTop: 14, paddingHorizontal: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {CDC_MILESTONES.map((b) => (
            <Tap
              key={b.month}
              onPress={() => setSelectedMonth(b.month)}
              style={[styles.monthChip, selectedMonth === b.month && styles.monthChipActive]}
            >
              <T bold style={{ color: selectedMonth === b.month ? 'white' : colors.textDark, fontSize: 13 }}>
                {b.month}. {isEn ? 'Month' : 'Ay'}
              </T>
            </Tap>
          ))}
        </ScrollView>
      </View>

      {activeTab === 'milestones' && (
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          {/* Progress Card */}
          <Card style={styles.summaryCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <T bold style={{ fontSize: 16, color: colors.textDark }}>
                  {isEn ? currentBracket.titleEn : currentBracket.titleTr}
                </T>
                <T style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>
                  {currentDone} / {currentTotal} {isEn ? 'skills mastered' : 'beceri tamamlandı'}
                </T>
              </View>
              <View style={styles.pctBadge}>
                <T bold style={{ fontSize: 16, color: '#059669' }}>%{pct}</T>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>
          </Card>

          {/* 1. Motor Skills */}
          <View style={{ marginTop: 16 }}>
            <T bold style={styles.domainHeading}>
              🏃 {isEn ? 'Motor & Movement Skills' : 'Kaba & İnce Motor Becerileri'}
            </T>
            {(isEn ? currentBracket.motorEn : currentBracket.motorTr).map((item) => (
              <Tap key={item.id} onPress={() => toggleMilestone(item.id)} style={styles.milestoneItem}>
                <View style={[styles.checkbox, completedMilestones[item.id] && styles.checkboxChecked]}>
                  {completedMilestones[item.id] && <T bold style={{ color: 'white', fontSize: 13 }}>✓</T>}
                </View>
                <T style={[styles.milestoneText, completedMilestones[item.id] && styles.milestoneTextDone]}>
                  {item.text}
                </T>
              </Tap>
            ))}
          </View>

          {/* 2. Cognitive Skills */}
          <View style={{ marginTop: 16 }}>
            <T bold style={styles.domainHeading}>
              💡 {isEn ? 'Cognitive & Problem Solving' : 'Bilişsel & Merak'}
            </T>
            {(isEn ? currentBracket.cognitiveEn : currentBracket.cognitiveTr).map((item) => (
              <Tap key={item.id} onPress={() => toggleMilestone(item.id)} style={styles.milestoneItem}>
                <View style={[styles.checkbox, completedMilestones[item.id] && styles.checkboxChecked]}>
                  {completedMilestones[item.id] && <T bold style={{ color: 'white', fontSize: 13 }}>✓</T>}
                </View>
                <T style={[styles.milestoneText, completedMilestones[item.id] && styles.milestoneTextDone]}>
                  {item.text}
                </T>
              </Tap>
            ))}
          </View>

          {/* 3. Language Skills */}
          <View style={{ marginTop: 16 }}>
            <T bold style={styles.domainHeading}>
              🗣️ {isEn ? 'Language & Communication' : 'Dil & İletişim'}
            </T>
            {(isEn ? currentBracket.languageEn : currentBracket.languageTr).map((item) => (
              <Tap key={item.id} onPress={() => toggleMilestone(item.id)} style={styles.milestoneItem}>
                <View style={[styles.checkbox, completedMilestones[item.id] && styles.checkboxChecked]}>
                  {completedMilestones[item.id] && <T bold style={{ color: 'white', fontSize: 13 }}>✓</T>}
                </View>
                <T style={[styles.milestoneText, completedMilestones[item.id] && styles.milestoneTextDone]}>
                  {item.text}
                </T>
              </Tap>
            ))}
          </View>

          {/* 4. Social & Emotional */}
          <View style={{ marginTop: 16 }}>
            <T bold style={styles.domainHeading}>
              ❤️ {isEn ? 'Social & Emotional' : 'Sosyal & Duygusal'}
            </T>
            {(isEn ? currentBracket.socialEn : currentBracket.socialTr).map((item) => (
              <Tap key={item.id} onPress={() => toggleMilestone(item.id)} style={styles.milestoneItem}>
                <View style={[styles.checkbox, completedMilestones[item.id] && styles.checkboxChecked]}>
                  {completedMilestones[item.id] && <T bold style={{ color: 'white', fontSize: 13 }}>✓</T>}
                </View>
                <T style={[styles.milestoneText, completedMilestones[item.id] && styles.milestoneTextDone]}>
                  {item.text}
                </T>
              </Tap>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'tummy' && (
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          {/* Tummy Time Coach Card */}
          <Card style={styles.timerCard}>
            <T bold style={{ fontSize: 16, color: colors.textDark, textAlign: 'center' }}>
              🐢 {isEn ? 'Tummy Time Live Coach' : 'Karın Üstü Egzersiz Koçu'}
            </T>
            <T style={{ fontSize: 12.5, color: colors.textMuted, textAlign: 'center', marginTop: 4 }}>
              {selectedMonth}. {isEn ? `Month Target: ${currentBracket.tummyGoalMin} min/day` : `Ay Günlük Hedefi: ${currentBracket.tummyGoalMin} dk/gün`}
            </T>

            {/* Timer Dial Display */}
            <View style={styles.timerDial}>
              <T bold style={styles.timerDigits}>{formatTimer(tummySeconds)}</T>
              <T style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                {tummyRunning ? (isEn ? 'Active Session...' : 'Egzersiz Yapılıyor...') : (isEn ? 'Ready' : 'Hazır')}
              </T>
            </View>

            {/* Controls */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Tap
                onPress={() => setTummyRunning(!tummyRunning)}
                style={[styles.timerControlBtn, { backgroundColor: tummyRunning ? '#EF4444' : colors.primary, flex: 1.5 }]}
              >
                <T bold style={{ color: 'white', fontSize: 15 }}>
                  {tummyRunning ? (isEn ? '⏸️ Pause' : '⏸️ Duraklat') : (isEn ? '▶️ Start Tummy Time' : '▶️ Başlat')}
                </T>
              </Tap>
              <Tap
                onPress={handleSaveTummyTime}
                style={[styles.timerControlBtn, { backgroundColor: '#10B981', flex: 1 }]}
              >
                <T bold style={{ color: 'white', fontSize: 14 }}>
                  💾 {isEn ? 'Save' : 'Kaydet'}
                </T>
              </Tap>
            </View>
          </Card>

          {/* Pediatric Education Note */}
          <Card style={[styles.infoCard, { marginTop: 16 }]}>
            <T bold style={{ fontSize: 14.5, color: '#1E3A8A', marginBottom: 8 }}>
              💡 {isEn ? 'Why is Tummy Time Essential?' : 'Neden Her Gün Tummy Time Yapılmalı?'}
            </T>
            <T style={styles.infoText}>
              {isEn
                ? '• Prevents positional plagiocephaly (flat head syndrome).\n• Strengthens neck, shoulders, and core muscles needed for rolling and crawling.\n• Improves sensory integration and hand-eye coordination.\n• If baby fusses, place a mirror or high-contrast card in front of them, or lie chest-to-chest.'
                : '• Düz kafa sendromunu (plagiocephaly) önler.\n• Boyun, omuz ve sırt kaslarını güçlendirerek yuvarlanma ve emeklemeye hazırlar.\n• Bebek huzursuzlanırsa göğsünüze yatırarak ten tene temas kurun ya da önüne kırılmaz bebek aynası koyun.'}
            </T>
          </Card>
        </View>
      )}

      {activeTab === 'redflags' && (
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Card style={styles.redFlagCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <T bold style={{ fontSize: 16, color: '#991B1B' }}>
                🚩 {selectedMonth}. {isEn ? 'Month Clinical Red Flags' : 'Ay Gelişimsel Kırmızı Bayraklar'}
              </T>
            </View>
            <T style={{ fontSize: 13, color: '#7F1D1D', marginBottom: 12, lineHeight: 19 }}>
              {isEn
                ? 'The following signs warrant an evaluation with your pediatrician during your well-baby checkup:'
                : 'Aşağıdaki durumlardan bir veya birkaçı mevcutsa, rutin doktor kontrolünüzde pediatristinize danışmanız önerilir:'}
            </T>

            {(isEn ? currentBracket.redFlagsEn : currentBracket.redFlagsTr).map((rf, idx) => (
              <View key={idx} style={styles.redFlagRow}>
                <T style={{ color: '#DC2626', fontSize: 14, fontWeight: '700' }}>•</T>
                <T style={{ color: '#991B1B', fontSize: 13.5, flex: 1, lineHeight: 20 }}>
                  {rf}
                </T>
              </View>
            ))}
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: 'white',
    ...shadow.sm,
  },
  monthChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  monthChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'white',
    ...shadow.sm,
  },
  pctBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  domainHeading: {
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 8,
    paddingLeft: 4,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    ...shadow.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  checkboxChecked: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  milestoneText: {
    fontSize: 13.5,
    color: colors.textDark,
    flex: 1,
    lineHeight: 19,
  },
  milestoneTextDone: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  timerCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    ...shadow.sm,
  },
  timerDial: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#F0FDF4',
    borderWidth: 6,
    borderColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  timerDigits: {
    fontSize: 34,
    color: '#065F46',
    fontWeight: '800',
  },
  timerControlBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
  redFlagCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  redFlagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  medicalDisclaimerCard: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#FEF3F2',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FECDCA',
    padding: 12,
  },
  medicalDisclaimerTitle: {
    fontSize: 13,
    color: '#B42318',
    marginBottom: 4,
  },
  medicalDisclaimerText: {
    fontSize: 11.5,
    color: '#7A271A',
    lineHeight: 17,
  },
});
