import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section } from './ui';
import { uid, localDay } from './domain.mjs';

// ─── EKRAN 20: DOĞUM AYI KULÜBÜ (BIRTH MONTH CIRCLES) ────────────────────────
export const communityPosts = [
  {
    id: 'p1',
    user: 'Merve B.',
    week: '24. Hafta',
    title: 'Ayrıntılı ultrason için doktor / perinatolog önerisi olan var mı?',
    desc: 'Anadolu yakasında detaylı ultrason çektiren anneler, hekiminizden memnun kaldınız mı? Neye dikkat etmeliyim?',
    likes: 38,
    comments: 14,
    cat: 'Doktor & Hastane',
    verified: true,
  },
  {
    id: 'p2',
    user: 'Gözde S. (Anonim)',
    week: '18. Hafta',
    title: 'Geceleri şiddetli bacak krampları yaşayan var mı?',
    desc: 'Uykudan uyandıran kramplar başladı. Doktorum magnezyum önerdi, siz nasıl rahatladınız?',
    likes: 29,
    comments: 19,
    cat: 'Belirtiler & Aşerme',
    verified: false,
  },
  {
    id: 'p3',
    user: 'Selin T.',
    week: '31. Hafta',
    title: 'Bebek arabası seçimi: Travel sistem mi, kabin boy mu?',
    desc: 'Apartmanda asansör var ama bagaj küçük. Şehir içi pratik kullanım için hangisini tavsiye edersiniz?',
    likes: 45,
    comments: 32,
    cat: 'Bebek Alışverişi',
    verified: false,
  },
];

export function BirthMonthClubScreen({ onOpenThread }) {
  const [filter, setFilter] = useState('Tümü');
  const filters = ['Tümü', 'Doktor & Hastane', 'Belirtiler & Aşerme', 'Bebek Alışverişi', 'Dertleşme'];

  const filtered = communityPosts.filter(p => filter === 'Tümü' || p.cat === filter);

  return (
    <View style={cs.container}>
      {/* Kulüp Başlık Banner'ı */}
      <Card style={cs.clubBanner}>
        <LinearGradient
          colors={['#8F6E8F', '#6D4E6D']}
          style={StyleSheet.absoluteFill}
        />
        <View style={cs.bannerRow}>
          <View style={cs.bannerIcon}>
            <T style={{ fontSize: 24 }}>🌸</T>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <T bold style={{ color: 'white', fontSize: 17 }}>Temmuz 2026 Anneleri</T>
            <T style={{ color: '#E8D5E8', fontSize: 12, marginTop: 2 }}>
              4.280 Anne · Aynı ayda kavuşuyoruz 💕
            </T>
          </View>
        </View>
      </Card>

      {/* Konu Filtreleri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {filters.map(f => (
          <Tap
            key={f}
            onPress={() => setFilter(f)}
            label={f}
            style={[cs.filterPill, filter === f && cs.filterPillActive]}
          >
            <T bold={filter === f} style={{ fontSize: 12, color: filter === f ? 'white' : colors.ink }}>
              {f}
            </T>
          </Tap>
        ))}
      </ScrollView>

      {/* Gönderi Kartları */}
      <View style={{ gap: 12 }}>
        {filtered.map(post => (
          <Tap
            key={post.id}
            onPress={() => onOpenThread && onOpenThread(post)}
            label={post.title}
            style={cs.postCard}
          >
            <View style={cs.postHeader}>
              <View style={cs.avatar}>
                <T style={{ fontSize: 13 }}>👩</T>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <T bold style={{ fontSize: 13 }}>{post.user}</T>
                <T style={{ fontSize: 10, color: colors.muted }}>{post.week} · {post.cat}</T>
              </View>
              {post.verified && (
                <View style={cs.verifiedBadge}>
                  <T style={{ fontSize: 10, color: colors.purple }}>Uzman Yanıtı ✓</T>
                </View>
              )}
            </View>

            <T bold style={{ fontSize: 14, color: colors.ink, marginTop: 8, lineHeight: 20 }}>
              {post.title}
            </T>
            <T style={{ fontSize: 12, color: '#554A5A', marginTop: 4, lineHeight: 18 }}>
              {post.desc}
            </T>

            <View style={cs.postFooter}>
              <View style={cs.statRow}>
                <Icon name="heart" size={15} color={colors.muted} />
                <T style={{ fontSize: 12, color: colors.muted }}>{post.likes}</T>
              </View>
              <View style={cs.statRow}>
                <Icon name="chat" size={15} color={colors.muted} />
                <T style={{ fontSize: 12, color: colors.muted }}>{post.comments} yanıt</T>
              </View>
            </View>
          </Tap>
        ))}
      </View>
    </View>
  );
}

// ─── EKRAN 21: TOPLULUK SORU & CEVAP DETAY EKRANI ────────────────────────────
export function CommunityThreadScreen({ post, toast }) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Ebe Ayşe Yılmaz',
      role: 'Uzman Ebe & Doğum Koçu',
      isExpert: true,
      text: 'Magnezyum takviyesi ve yatmadan önce 10 dakika ılık duş bacak kramplarını belirgin şekilde azaltır. Ayrıca gün içinde kalsiyum alımınıza ve bol su tüketmeye dikkat edin.',
      time: '3 saat önce',
      helpful: 42,
    },
    {
      id: 'c2',
      author: 'Deniz K.',
      role: '26. Hafta',
      isExpert: false,
      text: 'Ben muz tüketimini artırdım ve yatarken bacaklarımın altına rulo havlu koydum, gerçekten çok fark etti!',
      time: '1 saat önce',
      helpful: 12,
    },
  ]);

  const p = post || communityPosts[1];

  function addComment() {
    if (!commentText.trim()) return;
    const newC = {
      id: uid(),
      author: 'Sen',
      role: '24. Hafta',
      isExpert: false,
      text: commentText.trim(),
      time: 'Az önce',
      helpful: 0,
    };
    setComments([newC, ...comments]);
    setCommentText('');
    toast && toast('Yanıtınız paylaşıldı 🌸');
  }

  return (
    <View style={cs.container}>
      {/* Ana Soru Kartı */}
      <Card style={cs.mainThreadCard}>
        <View style={cs.postHeader}>
          <View style={cs.avatar}>
            <T style={{ fontSize: 14 }}>👩</T>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <T bold style={{ fontSize: 14 }}>{p.user}</T>
            <T style={{ fontSize: 11, color: colors.muted }}>{p.week} · {p.cat}</T>
          </View>
        </View>
        <T bold style={{ fontSize: 16, color: colors.ink, marginTop: 10, lineHeight: 22 }}>
          {p.title}
        </T>
        <T style={{ fontSize: 14, color: '#4E4453', marginTop: 6, lineHeight: 21 }}>
          {p.desc}
        </T>
      </Card>

      <Section title={`Topluluk Yanıtları (${comments.length})`} />

      {/* Yanıtlar Akışı */}
      <View style={{ gap: 10 }}>
        {comments.map(c => (
          <Card
            key={c.id}
            style={[
              cs.commentCard,
              c.isExpert && { borderColor: '#8E6E8E', backgroundColor: '#FAF6FA' },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[cs.commentAvatar, c.isExpert && { backgroundColor: '#8E6E8E' }]}>
                <T style={{ fontSize: 12, color: c.isExpert ? 'white' : colors.ink }}>
                  {c.isExpert ? '🩺' : '💬'}
                </T>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <T bold style={{ fontSize: 13 }}>{c.author}</T>
                  {c.isExpert && (
                    <View style={cs.expertTag}>
                      <T bold style={{ fontSize: 9, color: 'white' }}>UZMAN EBE</T>
                    </View>
                  )}
                </View>
                <T style={{ fontSize: 10, color: colors.muted }}>{c.time}</T>
              </View>
            </View>

            <T style={{ fontSize: 13, color: '#413A47', marginTop: 8, lineHeight: 20 }}>
              {c.text}
            </T>
          </Card>
        ))}
      </View>

      {/* Yanıt Yazma Çubuğu */}
      <View style={cs.replyBar}>
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Düşünceni veya tecrübeni paylaş..."
          placeholderTextColor={colors.muted}
          style={cs.replyInput}
          onSubmitEditing={addComment}
        />
        <Tap onPress={addComment} label="Gönder" style={cs.replySend}>
          <Icon name="send" size={16} color="white" />
        </Tap>
      </View>
    </View>
  );
}

const cs = StyleSheet.create({
  container: { gap: 14, paddingBottom: 24 },
  clubBanner: { height: 95, borderRadius: 20, overflow: 'hidden', padding: 16, justifyContent: 'center' },
  bannerRow: { flexDirection: 'row', alignItems: 'center' },
  bannerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF33', alignItems: 'center', justifyContent: 'center' },
  filterPill: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#EFEAEF' },
  filterPillActive: { backgroundColor: colors.purple },
  postCard: { backgroundColor: '#FFFDFA', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#EDE4EC', ...shadow },
  postHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F3EAF4', alignItems: 'center', justifyContent: 'center' },
  verifiedBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: '#F3EAF5' },
  postFooter: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderColor: colors.line },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  // Thread styles
  mainThreadCard: { padding: 18 },
  commentCard: { padding: 14 },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EEE6F0', alignItems: 'center', justifyContent: 'center' },
  expertTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: colors.purple },
  replyBar: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 10 },
  replyInput: { flex: 1, height: 46, borderRadius: 18, borderWidth: 1, borderColor: '#DED3DB', paddingHorizontal: 14, backgroundColor: '#FFFDFA', fontSize: 13, color: colors.ink },
  replySend: { width: 46, height: 46, borderRadius: 18, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
});
