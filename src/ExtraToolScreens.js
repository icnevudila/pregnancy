import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Image } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, Progress, ScreenHero, MetricCard, ToolExperienceCard } from './ui';
import { uid, localDay } from './domain.mjs';
import { generatedAssets } from './generatedAssets';
import { offlineSyncQueue } from './services/offlineSyncQueue';
import { createTrackerEvent } from './domain/types';

// ─── 1. SÜT STOĞU & DONDURUCU ENVANTERİ (MILK FREEZER STASH) ─────────────────
export function MilkStashTrackerScreen({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const stash = state.milkStash || [
    { id: 'ms1', date: localDay(), ml: 120, location: 'freezer', expiresAt: '6 ay sonra' },
    { id: 'ms2', date: localDay(), ml: 90, location: 'fridge', expiresAt: '3 gün sonra' },
  ];

  const [amountMl, setAmountMl] = useState('100');
  const [selectedLocation, setSelectedLocation] = useState('freezer'); // 'freezer' | 'fridge'

  const totalFreezerMl = stash.filter(s => s.location === 'freezer').reduce((sum, s) => sum + s.ml, 0);
  const totalFridgeMl = stash.filter(s => s.location === 'fridge').reduce((sum, s) => sum + s.ml, 0);
  const grandTotalMl = totalFreezerMl + totalFridgeMl;

  function handleAddStash() {
    const mlNum = parseInt(amountMl, 10);
    if (!mlNum || mlNum <= 0) {
      toast && toast(isEn ? 'Please enter a valid amount' : 'Lütfen geçerli bir miktar girin');
      return;
    }

    const newItem = {
      id: uid(),
      date: localDay(),
      ml: mlNum,
      location: selectedLocation,
      expiresAt: selectedLocation === 'freezer' ? (isEn ? 'in 6 months' : '6 ay sonra') : (isEn ? 'in 4 days' : '4 gün sonra'),
      createdAt: new Date().toISOString(),
    };

    update(old => ({
      milkStash: [newItem, ...(old.milkStash || stash)],
    }));

    offlineSyncQueue.enqueue(createTrackerEvent({
      type: 'milk_stash',
      metadata: { ml: mlNum, location: selectedLocation },
    })).catch(() => {});

    toast && toast(isEn ? `🍼 ${mlNum} ml milk stored in ${selectedLocation === 'freezer' ? 'freezer' : 'fridge'}!` : `🍼 ${mlNum} ml süt ${selectedLocation === 'freezer' ? 'dondurucuya' : 'buzdolabına'} eklendi!`);
    setAmountMl('100');
  }

  function handleUseStash(id) {
    const item = stash.find(s => s.id === id);
    update(old => ({
      milkStash: (old.milkStash || stash).filter(s => s.id !== id),
    }));
    toast && toast(isEn ? `✓ ${item ? item.ml : ''} ml used from stash` : `✓ ${item ? item.ml : ''} ml stoktan kullanıldı`);
  }

  return (
    <View style={ets.container}>
      <ScreenHero
        kicker={isEn ? 'MILK INVENTORY' : 'SÜT ENVANTERİ'}
        title={isEn ? 'Breast Milk Freezer Stash' : 'Süt Stoğu & Dondurucu'}
        body={isEn ? 'Manage refrigerated and frozen breast milk with FIFO rule (use oldest milk first).' : 'Buzdolabı ve dondurucudaki anne sütü poşetlerini ilk giren ilk çıkar (FIFO) kuralıyla yönet.'}
        icon="bottle"
        asset="btn_breast_pump"
        stat={`${grandTotalMl} ml ${isEn ? 'total' : 'toplam'}`}
        tint="#9B4E76"
      />

      <ToolExperienceCard
        lang={lang}
        title={isEn ? 'Never waste a single drop' : 'Tek damla sütü ziyan etme'}
        steps={isEn ? ['Log pump session volume.', 'Choose fridge (4 days) or freezer (6 months).', 'Always thaw the oldest batch first.'] : ['Sağılan süt miktarını gir.', 'Buzdolabı (4 gün) veya dondurucu (6 ay) seç.', 'Daima en eski tarihi önce tüket.']}
        outcome={isEn ? 'Total stock volume always visible at a glance.' : 'Toplam süt stoğu tek bakışta hazır görünür.'}
        asset="btn_breast_pump"
        tint="#C75B7A"
      />

      {/* İkili Stok Özeti */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <MetricCard
          title={isEn ? 'FREEZER STASH' : 'DONDURUCU STOĞU'}
          value={`${totalFreezerMl} ml`}
          unit={isEn ? 'frozen' : 'dondurulmuş'}
          subtext={isEn ? 'Up to 6 months shelf life' : '6 aya kadar saklanabilir'}
          icon="moon"
          tint="#4896BC"
        />
        <MetricCard
          title={isEn ? 'FRIDGE STASH' : 'DOLAP STOĞU'}
          value={`${totalFridgeMl} ml`}
          unit={isEn ? 'fresh' : 'taze'}
          subtext={isEn ? 'Consume within 4 days' : '4 gün içinde tüketin'}
          icon="bottle"
          tint="#9B4E76"
        />
      </View>

      {/* Hızlı Süt Ekleme Alanı */}
      <Card style={{ padding: 16, gap: 12 }}>
        <T bold style={{ fontSize: 15, color: colors.ink }}>{isEn ? 'Add Expressed Milk to Stash' : 'Stoğa Sağılmış Süt Ekle'}</T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Tap
            onPress={() => setSelectedLocation('freezer')}
            style={[ets.locTab, selectedLocation === 'freezer' && ets.locTabActive]}
          >
            <T bold={selectedLocation === 'freezer'} style={[ets.locTabText, selectedLocation === 'freezer' && { color: 'white' }]}>
              ❄️ {isEn ? 'Freezer (-18°C)' : 'Dondurucu (-18°C)'}
            </T>
          </Tap>
          <Tap
            onPress={() => setSelectedLocation('fridge')}
            style={[ets.locTab, selectedLocation === 'fridge' && ets.locTabActive]}
          >
            <T bold={selectedLocation === 'fridge'} style={[ets.locTabText, selectedLocation === 'fridge' && { color: 'white' }]}>
              🥛 {isEn ? 'Fridge (+4°C)' : 'Buzdolabı (+4°C)'}
            </T>
          </Tap>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TextInput
            value={amountMl}
            onChangeText={setAmountMl}
            keyboardType="numeric"
            style={ets.mlInput}
            placeholder="100"
          />
          <T bold style={{ fontSize: 16, color: colors.ink }}>ml</T>
          <Tap onPress={handleAddStash} style={ets.addBtn}>
            <T bold style={{ color: 'white', fontSize: 14 }}>{isEn ? 'Store Milk' : 'Stoğa Kaydet'}</T>
          </Tap>
        </View>
      </Card>

      {/* Stok Poşetleri Listesi */}
      <Section title={isEn ? 'Stored Milk Bags (Oldest First)' : 'Saklanan Süt Poşetleri (Önce Tüketilecekler)'} />
      {stash.length === 0 ? (
        <Card style={{ padding: 20, alignItems: 'center' }}>
          <T style={{ color: colors.muted, fontSize: 13 }}>{isEn ? 'No milk bags stored yet.' : 'Henüz stokta süt poşeti bulunmuyor.'}</T>
        </Card>
      ) : (
        stash.map(item => (
          <Card key={item.id} style={{ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[ets.stashBadge, { backgroundColor: item.location === 'freezer' ? '#EBF5FA' : '#FAF0F6' }]}>
                <T style={{ fontSize: 20 }}>{item.location === 'freezer' ? '❄️' : '🥛'}</T>
              </View>
              <View>
                <T bold style={{ fontSize: 15, color: colors.ink }}>{item.ml} ml</T>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                  {item.date} · {item.location === 'freezer' ? (isEn ? 'Freezer' : 'Dondurucu') : (isEn ? 'Fridge' : 'Dolap')} · {item.expiresAt}
                </T>
              </View>
            </View>
            <Tap onPress={() => handleUseStash(item.id)} style={ets.useBtn}>
              <T bold style={{ fontSize: 12, color: colors.purple }}>{isEn ? 'Thaw / Use' : 'Kullanıldı'}</T>
            </Tap>
          </Card>
        ))
      )}
    </View>
  );
}

// ─── 2. PARTNER GÖREV PANOSU (PARTNER TASK BOARD) ────────────────────────────
export function PartnerTaskBoardScreen({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const defaultTasks = isEn ? [
    { id: 'pt1', title: 'Fill mommy\'s water bottle before bedtime', done: true, tag: 'Hydration' },
    { id: 'pt2', title: 'Pick up newborn diapers & water wipes from pharmacy', done: false, tag: 'Shopping' },
    { id: 'pt3', title: 'Properly secure baby car seat in vehicle', done: false, tag: 'Safety' },
    { id: 'pt4', title: 'Bring ultrasound memory file to the clinic visit', done: true, tag: 'Documents' },
  ] : [
    { id: 'pt1', title: 'Gece uyumadan önce annenin başucu suyunu doldur', done: true, tag: 'Hidrasyon' },
    { id: 'pt2', title: 'Eczaneden yenidoğan bebek bezi & saf su mendili al', done: false, tag: 'Alışveriş' },
    { id: 'pt3', title: 'Oto koltuğu pusetini arabaya sağlam şekilde sabitle', done: false, tag: 'Güvenlik' },
    { id: 'pt4', title: 'Klinik kontrolüne giderken ultrason dosyasını çantaya koy', done: true, tag: 'Evrak' },
  ];

  const tasks = state.partnerTasks || defaultTasks;
  const [newTaskText, setNewTaskText] = useState('');

  const doneCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  function toggleTask(id) {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    update(old => ({ partnerTasks: updated }));
    toast && toast(isEn ? 'Task status updated' : 'Görev durumu güncellendi');
  }

  function handleAddTask() {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: uid(),
      title: newTaskText.trim(),
      done: false,
      tag: isEn ? 'Support' : 'Destek',
      createdAt: new Date().toISOString(),
    };
    update(old => ({ partnerTasks: [newTask, ...tasks] }));
    setNewTaskText('');
    toast && toast(isEn ? 'Task assigned to partner!' : 'Görev eşe atandı!');
  }

  return (
    <View style={ets.container}>
      <ScreenHero
        kicker={isEn ? 'HOUSEHOLD COLLABORATION' : 'AİLE İŞ BİRLİĞİ'}
        title={isEn ? 'Partner Support Task Board' : 'Eş & Partner Görev Panosu'}
        body={isEn ? 'Coordinate household logistics, pharmacy errands, and hospital preparation smoothly together.' : 'Ev lojistiğini, hastane hazırlıklarını ve bebek ihtiyaçlarını eşinle uyum içinde koordine et.'}
        icon="community"
        asset="topic_partner_guide"
        stat={`${doneCount}/${totalCount} ${isEn ? 'done' : 'tamam'}`}
        tint="#4F79A1"
      />

      <ToolExperienceCard
        lang={lang}
        title={isEn ? 'Share the mental load' : 'Zihinsel yükü paylaş'}
        steps={isEn ? ['List logistical tasks.', 'Assign errands to your partner.', 'Tick off items as completed.'] : ['Lojistik işleri listele.', 'Görevleri eşine ata.', 'Tamamlandıkça işaretle.']}
        outcome={isEn ? 'Both parents stay aligned without confusion.' : 'Her iki ebeveyn de kafa karışıklığı olmadan aynı sayfada kalır.'}
        asset="topic_partner_guide"
        tint="#5A7D9A"
      />

      {/* İlerleme Çubuğu */}
      <Card style={{ padding: 16, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T bold style={{ fontSize: 14, color: colors.ink }}>{isEn ? 'Household Preparation' : 'Aile Hazırlık İlerlemesi'}</T>
          <T bold style={{ fontSize: 14, color: colors.purple }}>%{percent}</T>
        </View>
        <Progress value={percent} tint={colors.purple} />
        <T style={{ fontSize: 11.5, color: colors.muted }}>
          {doneCount === totalCount ? (isEn ? '🎉 All tasks completed together!' : '🎉 Tüm görevler birlikte tamamlandı!') : `${totalCount - doneCount} ${isEn ? 'tasks remaining' : 'görev kaldı'}`}
        </T>
      </Card>

      {/* Görev Ekleme */}
      <View style={ets.taskAddRow}>
        <TextInput
          value={newTaskText}
          onChangeText={setNewTaskText}
          placeholder={isEn ? 'Assign a task to partner...' : 'Eşe bir görev ata...'}
          placeholderTextColor={colors.muted}
          style={ets.taskInput}
          onSubmitEditing={handleAddTask}
        />
        <Tap onPress={handleAddTask} style={ets.taskAddBtn}>
          <Icon name="plus" size={16} color="white" />
          <T bold style={{ color: 'white', fontSize: 12 }}>{isEn ? 'Assign' : 'Ata'}</T>
        </Tap>
      </View>

      {/* Görev Listesi */}
      <View style={{ gap: 8 }}>
        {tasks.map(t => (
          <Tap
            key={t.id}
            onPress={() => toggleTask(t.id)}
            style={[ets.taskRow, t.done && ets.taskRowDone]}
          >
            <View style={[ets.taskCheck, t.done && ets.taskCheckDone]}>
              {t.done && <Icon name="check" size={13} color="white" />}
            </View>
            <View style={{ flex: 1 }}>
              <T style={[ets.taskTitle, t.done && ets.taskTitleDone]}>{t.title}</T>
              <View style={ets.tagPill}>
                <T style={{ fontSize: 9.5, color: colors.purple }}>#{t.tag}</T>
              </View>
            </View>
          </Tap>
        ))}
      </View>
    </View>
  );
}

const ets = StyleSheet.create({
  container: { gap: 14, paddingBottom: 24 },
  locTab: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    alignItems: 'center', backgroundColor: '#F0EAF2',
  },
  locTabActive: { backgroundColor: colors.purple },
  locTabText: { fontSize: 12, color: colors.ink },
  mlInput: {
    flex: 1, backgroundColor: '#FAF6F9', borderWidth: 1, borderColor: '#E5D6E6',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16,
    color: colors.ink, fontWeight: '700',
  },
  addBtn: {
    backgroundColor: colors.purple, paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 12, alignItems: 'center',
  },
  stashBadge: {
    width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  useBtn: {
    backgroundColor: '#F2E8F4', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
  },
  taskAddRow: { flexDirection: 'row', gap: 8 },
  taskInput: {
    flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#E2DBD5',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: colors.ink,
  },
  taskAddBtn: {
    backgroundColor: colors.purple, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, borderRadius: 12,
  },
  taskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    backgroundColor: 'white', borderRadius: 14, borderWidth: 1, borderColor: '#EAE1D9',
  },
  taskRowDone: { backgroundColor: '#F9F7F5', opacity: 0.7 },
  taskCheck: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    borderColor: '#C6B9C7', alignItems: 'center', justifyContent: 'center',
  },
  taskCheckDone: { backgroundColor: colors.purple, borderColor: colors.purple },
  taskTitle: { fontSize: 13.5, color: colors.ink, lineHeight: 19 },
  taskTitleDone: { textDecorationLine: 'line-through', color: colors.muted },
  tagPill: {
    alignSelf: 'flex-start', backgroundColor: '#F3EAF5', paddingHorizontal: 6,
    paddingVertical: 2, borderRadius: 6, marginTop: 4,
  },
});
