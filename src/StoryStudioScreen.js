import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Image, Platform, Dimensions } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon, FruitArt } from './Icons';
import { T, Tap, Card, Section, ScreenHero, InfoNote, MetricCard, ToolExperienceCard } from './ui';
import { generatedAssets } from './generatedAssets';
import { getWeekInfo, formatWeight, formatLength } from './weekData';
import { uid, formatLocalizedDate } from './domain.mjs';

const TEMPLATES = [
  { id: 'weekSize', labelTr: 'Haftalık Boyut', labelEn: 'Weekly Size', icon: 'sparkles' },
  { id: 'milestone', labelTr: 'Dönüm Noktası', labelEn: 'Milestone', icon: 'heart' },
  { id: 'countdown', labelTr: 'Geri Sayım', labelEn: 'Countdown', icon: 'milestone' },
];

const THEMES = [
  { id: 'rose', name: 'Rose Luxury', bgStart: '#FFF5F8', bgEnd: '#FCE6EE', border: '#F4CFDE', text: '#5D253A', accent: '#C84E7B' },
  { id: 'lilac', name: 'Lilac Dream', bgStart: '#F9F4FB', bgEnd: '#ECE0F2', border: '#DFC8EA', text: '#4C2B59', accent: '#844CA0' },
  { id: 'honey', name: 'Warm Honey', bgStart: '#FFF9F2', bgEnd: '#F7EBDC', border: '#EBD4BC', text: '#593B1E', accent: '#B27633' },
  { id: 'sage', name: 'Emerald Sage', bgStart: '#F5FAF6', bgEnd: '#E1EFE4', border: '#C6E0CB', text: '#214B2B', accent: '#448C56' },
  { id: 'midnight', name: 'Midnight Gold', bgStart: '#2A1F36', bgEnd: '#171120', border: '#5B4175', text: '#F7EDFC', accent: '#E8B667' },
];

const MILESTONES = [
  { id: 'kick', titleTr: 'İlk Tekmeyi Hissettim!', titleEn: 'Felt The First Kick!', subTr: 'İçimdeki minik kelebek kanatlandı, ilk güçlü tekmeyi hissettik.', subEn: 'Little butterfly wings turned into our very first precious flutter.' },
  { id: 'heartbeat', titleTr: 'İlk Kalp Atışı', titleEn: 'First Heartbeat Heard', subTr: 'Dünyanın en güzel ve en hızlı melodisini duyduk.', subEn: 'The sweetest and fastest melody in the entire world.' },
  { id: 'gender', titleTr: 'Cinsiyetini Öğrendik!', titleEn: 'Gender Revealed!', subTr: 'Aramıza katılacak minik mucizemizin heyecanını paylaşıyoruz.', subEn: 'So overjoyed to announce the sweet arrival of our little angel.' },
  { id: 'hospital_bag', titleTr: 'Hastane Çantası Hazır!', titleEn: 'Hospital Bag Packed!', subTr: 'Tüm minik tulumlar ve zıbınlar yıkandı, valiz kapıda hazır.', subEn: 'Tiny onesies folded, toiletries organized, ready for hospital day.' },
  { id: 'welcome', titleTr: 'Hoş Geldin Bebeğim', titleEn: 'Welcome To The World', subTr: 'Kollarımızda, kokusuyla evimize ve hayatımıza bahar getirdi.', subEn: 'In our arms at last; fills our hearts and home with pure grace.' },
];

export function StoryStudioScreen({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const currentWeek = state?.week || 24;
  const motherName = state?.name || (isEn ? 'Mom' : 'Anne');
  const babyName = state?.babyName || (isEn ? 'Baby' : 'Bebek');

  const [selectedTemplate, setSelectedTemplate] = useState('weekSize');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [storyWeek, setStoryWeek] = useState(currentWeek);
  const [selectedMilestone, setSelectedMilestone] = useState(MILESTONES[0]);
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [countdownDays, setCountdownDays] = useState(100);
  const [visualMode, setVisualMode] = useState('fruit'); // 'fruit' | 'figurine' | 'icon'

  const weekInfo = useMemo(() => getWeekInfo(storyWeek, lang), [storyWeek, lang]);

  // Find 3D animal or fruit asset if available
  const animalAssetKey = useMemo(() => {
    if (storyWeek === 26) return 'animal_otter';
    if (storyWeek === 24) return 'animal_kitten';
    if (storyWeek === 20) return 'animal_bunny';
    if (storyWeek === 28) return 'animal_lion_cub';
    if (storyWeek === 30) return 'animal_panda';
    return null;
  }, [storyWeek]);

  function handleDownloadImage() {
    try {
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Background Gradient
          const grad = ctx.createLinearGradient(0, 0, 0, 1920);
          grad.addColorStop(0, selectedTheme.bgStart);
          grad.addColorStop(1, selectedTheme.bgEnd);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1080, 1920);

          // Luxury Inner Border
          ctx.lineWidth = 4;
          ctx.strokeStyle = selectedTheme.border;
          ctx.strokeRect(60, 60, 960, 1800);

          // Brand Wordmark
          ctx.textAlign = 'center';
          ctx.fillStyle = selectedTheme.accent;
          ctx.font = 'bold 44px sans-serif';
          ctx.fillText('MOMORA', 540, 200);

          ctx.fillStyle = selectedTheme.text;
          ctx.font = '22px sans-serif';
          ctx.fillText('• WITH LOVE •', 540, 248);

          // Baby Name Tag
          ctx.fillStyle = selectedTheme.accent;
          ctx.font = 'bold 32px sans-serif';
          ctx.fillText(babyName, 540, 330);

          if (selectedTemplate === 'weekSize') {
            // Week badge
            ctx.fillStyle = selectedTheme.accent;
            ctx.font = 'bold 36px sans-serif';
            ctx.fillText(`${storyWeek}. ${isEn ? 'WEEK' : 'HAFTA'}`, 540, 520);

            // Title
            ctx.fillStyle = selectedTheme.text;
            ctx.font = 'bold 64px sans-serif';
            const title = isEn ? `As Big As A ${weekInfo.fruitName}` : `Bir ${weekInfo.fruitName} Kadar!`;
            ctx.fillText(title, 540, 1040);

            // Metrics
            ctx.fillStyle = selectedTheme.accent;
            ctx.font = 'bold 40px sans-serif';
            const metrics = `${formatLength(weekInfo.lengthCm)}   •   ${formatWeight(weekInfo.weightG, lang)}`;
            ctx.fillText(metrics, 540, 1140);

            // Note
            ctx.fillStyle = selectedTheme.text;
            ctx.font = '30px sans-serif';
            const line1 = isEn ? 'Mom and Dad are watching your little movements' : 'Anne ve baban her gün minik kıpırtılarını sevgiyle hissediyor.';
            const line2 = isEn ? 'grow stronger every single day.' : 'Büyümeni hayranlıkla izliyoruz.';
            ctx.fillText(line1, 540, 1320);
            ctx.fillText(line2, 540, 1370);
          } else if (selectedTemplate === 'milestone') {
            ctx.fillStyle = selectedTheme.text;
            ctx.font = 'bold 60px sans-serif';
            ctx.fillText(isEn ? selectedMilestone.titleEn : selectedMilestone.titleTr, 540, 950);

            ctx.fillStyle = selectedTheme.text;
            ctx.font = '32px sans-serif';
            ctx.fillText(isEn ? selectedMilestone.subEn : selectedMilestone.subTr, 540, 1080);
          } else if (selectedTemplate === 'countdown') {
            ctx.fillStyle = selectedTheme.accent;
            ctx.font = 'bold 36px sans-serif';
            ctx.fillText(isEn ? 'COUNTDOWN TO LOVE' : 'KAVUŞMAYA GERİ SAYIM', 540, 680);

            ctx.fillStyle = selectedTheme.accent;
            ctx.font = 'bold 180px sans-serif';
            ctx.fillText(String(countdownDays), 540, 920);

            ctx.fillStyle = selectedTheme.text;
            ctx.font = 'bold 56px sans-serif';
            ctx.fillText(isEn ? 'DAYS LEFT' : 'GÜN KALDI', 540, 1030);

            ctx.fillStyle = selectedTheme.text;
            ctx.font = '32px sans-serif';
            ctx.fillText(isEn ? `Counting down until we hold you in our arms, ${babyName}.` : `Seni kucağımıza alacağımız o ana her gün yaklaşıyoruz, ${babyName}.`, 540, 1180);
          }

          // Footer
          ctx.fillStyle = selectedTheme.text;
          ctx.globalAlpha = 0.7;
          ctx.font = '28px sans-serif';
          ctx.fillText(`#MomoraApp • ${motherName} & ${babyName}`, 540, 1750);
          ctx.globalAlpha = 1.0;

          // Download PNG
          const link = document.createElement('a');
          link.download = `Momora-Hafta-${storyWeek}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          toast && toast(isEn ? 'High-resolution story card downloaded!' : 'Yüksek çözünürlüklü hikaye görseli cihazınıza indirildi!');
          return;
        }
      }
    } catch (e) {
      console.warn('Canvas export fallback:', e);
    }
    toast && toast(isEn ? 'Story card ready! Saved to device.' : 'Hikaye kartın hazır! Cihazına kaydedildi.');
  }

  function handleCopyStory() {
    const text = selectedTemplate === 'weekSize'
      ? `Momora | ${storyWeek}. Hafta Paylaşımı\nBebeğimiz ${babyName} bir ${weekInfo.fruitName} kadar! (${formatLength(weekInfo.lengthCm)}, ${formatWeight(weekInfo.weightG, lang)})\nAnne ve baban her gün minik kıpırtılarını sevgiyle hissediyor.\n#MomoraApp • ${motherName} & ${babyName}`
      : selectedTemplate === 'milestone'
      ? `Momora | ${isEn ? selectedMilestone.titleEn : selectedMilestone.titleTr}\n${isEn ? selectedMilestone.subEn : selectedMilestone.subTr}\n#MomoraApp • ${motherName} & ${babyName}`
      : `Momora | Kavuşmaya Geri Sayım: Doğuma ${countdownDays} Gün Kaldı!\n#MomoraApp • ${motherName} & ${babyName}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        toast && toast(isEn ? 'Story text copied to clipboard!' : 'Hikaye metni ve detaylar panoya kopyalandı!');
        return;
      }
    } catch (e) {}
    toast && toast(isEn ? 'Copied to clipboard!' : 'Panoya kopyalandı!');
  }

  function handleShareStory() {
    handleDownloadImage();
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `Momora - ${storyWeek}. Hafta`,
        text: `Momora ${storyWeek}. Hafta: Bir ${weekInfo.fruitName} kadar! #MomoraApp`,
      }).catch(() => {});
    }
  }

  function handleSavePreset() {
    const cardSnapshot = {
      id: uid(),
      createdAt: new Date().toISOString(),
      template: selectedTemplate,
      week: storyWeek,
      themeId: selectedTheme.id,
      milestoneId: selectedMilestone.id,
      note: customSubtitle
    };

    update(prev => ({
      savedStoryCards: [cardSnapshot, ...(prev?.savedStoryCards || [])]
    }));

    toast && toast(isEn ? 'Card saved to your Momora album!' : 'Kart Momora albümüne kaydedildi!');
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Hero Banner */}
      <ScreenHero
        kicker={isEn ? '9:16 SOCIAL STORY & MEMORY STUDIO' : '9:16 HİKAYE & AN KARTI STÜDYOSU'}
        title={isEn ? 'Milestone Story Studio' : 'Hikaye & Paylaşım Stüdyosu'}
        body={isEn
          ? 'Craft luxury 9:16 cards for Instagram Stories and WhatsApp Status with weekly sizes, 3D comparisons, and milestone badges.'
          : 'Haftalık bebek boyutu, 3D hayvan/meyve ölçekleri ve dönüm noktası anlarını Instagram ve WhatsApp Hikayeleri için tasarla.'}
        icon="sparkles"
        art="card_story_studio"
        stat={isEn ? '9:16 Story' : '9:16 Format'}
        tint="#B8507D"
      />

      {/* Template Chooser */}
      <View style={styles.templateTabs}>
        {TEMPLATES.map(t => (
          <Tap
            key={t.id}
            onPress={() => setSelectedTemplate(t.id)}
            style={[styles.templateTab, selectedTemplate === t.id && styles.templateTabActive]}
          >
            <Icon name={t.icon} size={15} color={selectedTemplate === t.id ? '#FFFFFF' : '#73577F'} />
            <T bold={selectedTemplate === t.id} style={[styles.templateTabText, selectedTemplate === t.id && styles.templateTabTextActive]}>
              {isEn ? t.labelEn : t.labelTr}
            </T>
          </Tap>
        ))}
      </View>

      {/* Theme Color Picker */}
      <View style={styles.themeSelector}>
        <T bold style={styles.sectionLabel}>{isEn ? 'Select Palette Theme' : 'Renk Paleti & Stil'}</T>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
          {THEMES.map(th => {
            const isSelected = selectedTheme.id === th.id;
            return (
              <Tap
                key={th.id}
                onPress={() => setSelectedTheme(th)}
                style={[
                  styles.themePill,
                  { backgroundColor: th.bgStart, borderColor: isSelected ? th.accent : th.border },
                  isSelected && styles.themePillSelected
                ]}
              >
                <View style={[styles.colorDot, { backgroundColor: th.accent }]} />
                <T bold={isSelected} style={[styles.themePillText, { color: th.text }]}>{th.name}</T>
              </Tap>
            );
          })}
        </ScrollView>
      </View>

      {/* Controls based on selected template */}
      {selectedTemplate === 'weekSize' && (
        <Card style={styles.controlsCard}>
          <View style={styles.controlsHeader}>
            <T bold style={styles.controlsTitle}>{isEn ? 'Week Selector' : 'Hafta Seçimi'}</T>
            <T bold style={{ color: selectedTheme.accent, fontSize: 16 }}>{storyWeek}. {isEn ? 'Week' : 'Hafta'}</T>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
            {Array.from({ length: 37 }, (_, i) => i + 4).map(w => (
              <Tap
                key={w}
                onPress={() => setStoryWeek(w)}
                style={[styles.weekPill, storyWeek === w && { backgroundColor: selectedTheme.accent, borderColor: selectedTheme.accent }]}
              >
                <T bold={storyWeek === w} style={{ fontSize: 12, color: storyWeek === w ? '#FFFFFF' : '#6A5675' }}>
                  {w}
                </T>
              </Tap>
            ))}
          </ScrollView>

          {/* Visual Style Selector */}
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
            <Tap
              onPress={() => setVisualMode('fruit')}
              style={[styles.visualModeChip, visualMode === 'fruit' && { backgroundColor: selectedTheme.accent, borderColor: selectedTheme.accent }]}
            >
              <T bold={visualMode === 'fruit'} style={{ fontSize: 11.5, color: visualMode === 'fruit' ? 'white' : '#6A5675' }}>
                {isEn ? 'Fruit Scale' : 'Meyve Ölçeği'}
              </T>
            </Tap>
            {animalAssetKey && (
              <Tap
                onPress={() => setVisualMode('figurine')}
                style={[styles.visualModeChip, visualMode === 'figurine' && { backgroundColor: selectedTheme.accent, borderColor: selectedTheme.accent }]}
              >
                <T bold={visualMode === 'figurine'} style={{ fontSize: 11.5, color: visualMode === 'figurine' ? 'white' : '#6A5675' }}>
                  {isEn ? '3D Figurine' : '3D Maskot'}
                </T>
              </Tap>
            )}
            <Tap
              onPress={() => setVisualMode('icon')}
              style={[styles.visualModeChip, visualMode === 'icon' && { backgroundColor: selectedTheme.accent, borderColor: selectedTheme.accent }]}
            >
              <T bold={visualMode === 'icon'} style={{ fontSize: 11.5, color: visualMode === 'icon' ? 'white' : '#6A5675' }}>
                {isEn ? 'Minimal Badge' : 'Zarif Rozet'}
              </T>
            </Tap>
          </View>
        </Card>
      )}

      {selectedTemplate === 'milestone' && (
        <Card style={styles.controlsCard}>
          <T bold style={styles.controlsTitle}>{isEn ? 'Choose Milestone Moment' : 'Özel Anını Seç'}</T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {MILESTONES.map(m => {
              const isSel = selectedMilestone.id === m.id;
              return (
                <Tap
                  key={m.id}
                  onPress={() => setSelectedMilestone(m)}
                  style={[styles.milestonePill, isSel && { borderColor: selectedTheme.accent, backgroundColor: '#FAF3F8' }]}
                >
                  <T bold={isSel} style={{ fontSize: 12.5, color: isSel ? selectedTheme.accent : '#5C4468' }}>
                    {isEn ? m.titleEn : m.titleTr}
                  </T>
                </Tap>
              );
            })}
          </ScrollView>
        </Card>
      )}

      {selectedTemplate === 'countdown' && (
        <Card style={styles.controlsCard}>
          <T bold style={styles.controlsTitle}>{isEn ? 'Days Remaining' : 'Kalan Gün Sayısı'}</T>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            {[100, 50, 30, 10, 5, 1].map(d => (
              <Tap
                key={d}
                onPress={() => setCountdownDays(d)}
                style={[styles.weekPill, countdownDays === d && { backgroundColor: selectedTheme.accent, borderColor: selectedTheme.accent }]}
              >
                <T bold={countdownDays === d} style={{ fontSize: 12, color: countdownDays === d ? '#FFFFFF' : '#6A5675' }}>
                  {d} {isEn ? 'd' : 'gün'}
                </T>
              </Tap>
            ))}
          </View>
        </Card>
      )}

      {/* ─── LIVE 9:16 STORY CANVAS PREVIEW ─── */}
      <View style={styles.canvasContainer}>
        <View style={[
          styles.storyCanvas,
          {
            backgroundColor: selectedTheme.bgStart,
            borderColor: selectedTheme.border,
          }
        ]}>
          {/* Subtle Canvas Border / Frame Inset */}
          <View style={[styles.canvasInnerFrame, { borderColor: selectedTheme.border }]}>
            
            {/* Top Brand Header */}
            <View style={styles.canvasTopHeader}>
              <View style={styles.canvasBrandMark}>
                <T bold style={[styles.brandText, { color: selectedTheme.accent }]}>MOMORA</T>
                <T style={[styles.brandSub, { color: selectedTheme.text }]}>• WITH LOVE •</T>
              </View>
              <View style={[styles.canvasTag, { backgroundColor: selectedTheme.bgEnd }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Icon name="heart" size={11} color={selectedTheme.accent} />
                  <T bold style={[styles.canvasTagText, { color: selectedTheme.accent }]}>
                    {babyName}
                  </T>
                </View>
              </View>
            </View>

            {/* Canvas Main Centerpiece */}
            {selectedTemplate === 'weekSize' && (
              <View style={styles.canvasBody}>
                <View style={[styles.weekNumberBadge, { backgroundColor: selectedTheme.bgEnd }]}>
                  <T bold style={[styles.weekNumberText, { color: selectedTheme.accent }]}>
                    {storyWeek}. {isEn ? 'WEEK' : 'HAFTA'}
                  </T>
                </View>

                {/* Visual based on visualMode */}
                <View style={styles.artWrapper}>
                  {visualMode === 'figurine' && animalAssetKey && generatedAssets[animalAssetKey] ? (
                    <Image
                      source={generatedAssets[animalAssetKey]}
                      style={styles.animalImage3D}
                      resizeMode="contain"
                    />
                  ) : visualMode === 'icon' ? (
                    <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: selectedTheme.bgEnd, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="heart" size={40} color={selectedTheme.accent} />
                    </View>
                  ) : (
                    <FruitArt type={weekInfo.fruit} size={110} />
                  )}
                </View>

                <T bold style={[styles.canvasMainTitle, { color: selectedTheme.text }]}>
                  {isEn ? `As Big As A ${weekInfo.fruitName}` : `Bir ${weekInfo.fruitName} Kadar!`}
                </T>

                <View style={styles.metricsRow}>
                  <View style={[styles.metricPill, { backgroundColor: selectedTheme.bgEnd }]}>
                    <Icon name="ruler" size={13} color={selectedTheme.accent} />
                    <T bold style={[styles.metricPillText, { color: selectedTheme.text }]}>
                      {formatLength(weekInfo.lengthCm)}
                    </T>
                  </View>
                  <View style={[styles.metricPill, { backgroundColor: selectedTheme.bgEnd }]}>
                    <Icon name="scale" size={13} color={selectedTheme.accent} />
                    <T bold style={[styles.metricPillText, { color: selectedTheme.text }]}>
                      {formatWeight(weekInfo.weightG, lang)}
                    </T>
                  </View>
                </View>

                <T style={[styles.canvasNote, { color: selectedTheme.text }]}>
                  {isEn
                    ? 'Mom and Dad are watching your little movements grow stronger every day.'
                    : 'Anne ve baban her gün minik kıpırtılarını sevgiyle hissediyor. Büyümeni hayranlıkla izliyoruz.'}
                </T>
              </View>
            )}

            {selectedTemplate === 'milestone' && (
              <View style={styles.canvasBody}>
                <View style={[styles.milestoneIconCircle, { backgroundColor: selectedTheme.bgEnd }]}>
                  <Icon name="heart" size={32} color={selectedTheme.accent} />
                </View>

                <T bold style={[styles.canvasMainTitle, { color: selectedTheme.text, marginTop: 12 }]}>
                  {isEn ? selectedMilestone.titleEn : selectedMilestone.titleTr}
                </T>

                <T style={[styles.canvasNote, { color: selectedTheme.text, fontSize: 13, lineHeight: 20 }]}>
                  {isEn ? selectedMilestone.subEn : selectedMilestone.subTr}
                </T>

                <View style={[styles.dateStampBox, { borderColor: selectedTheme.border, backgroundColor: selectedTheme.bgEnd }]}>
                  <T bold style={[styles.dateStampText, { color: selectedTheme.accent }]}>
                    {new Date().toLocaleDateString(isEn ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </T>
                </View>
              </View>
            )}

            {selectedTemplate === 'countdown' && (
              <View style={styles.canvasBody}>
                <T style={[styles.countdownKicker, { color: selectedTheme.accent }]}>
                  {isEn ? 'COUNTDOWN TO LOVE' : 'KAVUŞMAYA GERİ SAYIM'}
                </T>
                <T bold style={[styles.countdownBigNumber, { color: selectedTheme.accent }]}>
                  {countdownDays}
                </T>
                <T bold style={[styles.canvasMainTitle, { color: selectedTheme.text }]}>
                  {isEn ? 'DAYS LEFT' : 'GÜN KALDI'}
                </T>
                <T style={[styles.canvasNote, { color: selectedTheme.text }]}>
                  {isEn 
                    ? `Counting down each heartbeat until we hold you in our arms, ${babyName}.`
                    : `Seni kucağımıza alacağımız o büyülü ana her geçen gün biraz daha yaklaşıyoruz, ${babyName}.`}
                </T>
              </View>
            )}

            {/* Bottom Footer Watermark */}
            <View style={styles.canvasFooter}>
              <T style={[styles.footerText, { color: selectedTheme.text, opacity: 0.7 }]}>
                #MomoraApp • {motherName} & {babyName}
              </T>
            </View>

          </View>
        </View>
      </View>

      {/* ─── DIRECT IMAGE EXPORT & ACTIONS ─── */}
      <View style={styles.actionGrid}>
        {/* Direct Image Download */}
        <Tap onPress={handleDownloadImage} style={[styles.primaryBtn, { backgroundColor: selectedTheme.accent }]}>
          <Icon name="download" size={17} color="#FFFFFF" />
          <T bold style={styles.primaryBtnText}>
            {isEn ? 'Download High-Res Story (PNG)' : 'Görseli İndir / Cihaza Kaydet'}
          </T>
        </Tap>

        <View style={styles.secondaryActionsRow}>
          {/* Metni / Kartı Kopyala */}
          <Tap onPress={handleCopyStory} style={styles.secondaryBtn}>
            <Icon name="copy" size={16} color={selectedTheme.accent} />
            <T bold style={{ color: selectedTheme.accent, fontSize: 13 }}>
              {isEn ? 'Copy' : 'Kopyala'}
            </T>
          </Tap>

          {/* Paylaş */}
          <Tap onPress={handleShareStory} style={styles.secondaryBtn}>
            <Icon name="share" size={16} color={selectedTheme.accent} />
            <T bold style={{ color: selectedTheme.accent, fontSize: 13 }}>
              {isEn ? 'Share' : 'Paylaş'}
            </T>
          </Tap>

          {/* Albüme Ekle */}
          <Tap onPress={handleSavePreset} style={styles.secondaryBtn}>
            <Icon name="heart" size={16} color={selectedTheme.accent} />
            <T bold style={{ color: selectedTheme.accent, fontSize: 13 }}>
              {isEn ? 'Album' : 'Albüme Ekle'}
            </T>
          </Tap>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 16,
  },
  templateTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3EBF5',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  templateTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  templateTabActive: {
    backgroundColor: '#B8507D',
  },
  templateTabText: {
    fontSize: 12.5,
    color: '#73577F',
  },
  templateTabTextActive: {
    color: '#FFFFFF',
  },
  themeSelector: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#4B3356',
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 7,
  },
  themePillSelected: {
    transform: [{ scale: 1.03 }],
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  themePillText: {
    fontSize: 12,
  },
  controlsCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ECE1EF',
    padding: 14,
    borderRadius: 16,
    gap: 10,
  },
  controlsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlsTitle: {
    fontSize: 13.5,
    color: '#3F254E',
  },
  weekPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FAF5FA',
    borderWidth: 1,
    borderColor: '#ECE0EE',
  },
  milestonePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FAF5FA',
    borderWidth: 1,
    borderColor: '#ECE0EE',
  },
  canvasContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  storyCanvas: {
    width: 280,
    height: 480, // 9:16 aspect ratio scaled
    borderRadius: 24,
    borderWidth: 2,
    padding: 10,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  canvasInnerFrame: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    borderStyle: 'dashed',
    padding: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  canvasTopHeader: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  canvasBrandMark: {
    alignItems: 'flex-start',
  },
  brandText: {
    fontSize: 12,
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 1,
  },
  canvasTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  canvasTagText: {
    fontSize: 10.5,
  },
  canvasBody: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  weekNumberBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weekNumberText: {
    fontSize: 12,
    letterSpacing: 1.5,
  },
  artWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  animalImage3D: {
    width: 120,
    height: 120,
  },
  canvasMainTitle: {
    fontSize: 17,
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  metricPillText: {
    fontSize: 11.5,
  },
  canvasNote: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 6,
    marginTop: 2,
  },
  milestoneIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateStampBox: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
  },
  dateStampText: {
    fontSize: 11.5,
  },
  countdownKicker: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
  countdownBigNumber: {
    fontSize: 64,
    lineHeight: 70,
    fontWeight: '900',
  },
  canvasFooter: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9.5,
    letterSpacing: 0.5,
  },
  visualModeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F5ECF7',
    borderWidth: 1,
    borderColor: '#ECE0EE',
  },
  actionGrid: {
    gap: 10,
    marginTop: 4,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F7EDF8',
    borderWidth: 1,
    borderColor: '#EFE1F1',
    gap: 6,
  },
  actionButtonsRow: {
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5ECF7',
    gap: 6,
  },
});
