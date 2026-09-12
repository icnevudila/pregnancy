import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, G, Rect } from 'react-native-svg';
import { colors, fonts, shadow } from './theme';
import { Icon, BrandMark } from './Icons';
import { T, Tap } from './ui';
import {
  supabase,
  isSupabaseConfigured,
  signInWithEmailPassword,
  signUpWithEmail,
  signInWithOAuthProvider,
  resetPasswordForEmail,
  setManualSupabaseKey,
  getCurrentUser,
  DEFAULT_SUPABASE_URL,
} from './supabaseClient';

function GoogleIcon({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.39 7.35 24 12 24z"
      />
      <Path
        fill="#FBBC05"
        d="M5.28 14.27A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.27V6.58H1.26A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.26 5.42l4.02-3.15z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.61 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </Svg>
  );
}

function AppleIcon({ size = 20, color = '#FFFFFF' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.36c.62-.77 1.04-1.85.92-2.92-.95.04-2.07.64-2.73 1.41-.58.67-1.1 1.77-.96 2.82 1.06.08 2.15-.55 2.77-1.31z" />
    </Svg>
  );
}

export function AuthModal({ close, toast, onAuthSuccess }) {
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup' | 'forgot' | 'key'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('mother'); // 'mother' | 'father'
  const [partnerCode, setPartnerCode] = useState('');
  const [showPartnerCodeInput, setShowPartnerCodeInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [configured, setConfigured] = useState(isSupabaseConfigured());

  useEffect(() => {
    setConfigured(isSupabaseConfigured());
  }, []);

  async function handleSignIn() {
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Lütfen e-posta ve şifrenizi girin.');
      return;
    }
    setLoading(true);
    const { data, error } = await signInWithEmailPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
      return;
    }

    toast && toast('Momora\'ya hoş geldiniz 🌸');
    onAuthSuccess && onAuthSuccess(data?.user);
    close && close();
  }

  async function handleSignUp() {
    setErrorMsg('');
    if (!fullName.trim()) {
      setErrorMsg('Lütfen adınızı ve soyadınızı girin.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Lütfen e-posta ve şifre belirleyin.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    const { data, error } = await signUpWithEmail({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      role,
      partnerCode: partnerCode.trim(),
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Kayıt sırasında bir hata oluştu.');
      return;
    }

    toast && toast('Hesabınız başarıyla oluşturuldu! Hoş geldiniz 🤍');
    onAuthSuccess && onAuthSuccess(data?.user);
    close && close();
  }

  async function handleOAuth(provider) {
    setErrorMsg('');
    setLoading(true);
    const { data, error } = await signInWithOAuthProvider(provider);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || `${provider} ile giriş başlatılamadı.`);
      return;
    }
    toast && toast(`${provider === 'google' ? 'Google' : 'Apple'} ile giriş yapılıyor...`);
  }

  async function handleForgotPassword() {
    setErrorMsg('');
    if (!email.trim()) {
      setErrorMsg('Lütfen kayıtlı e-posta adresinizi girin.');
      return;
    }
    setLoading(true);
    const { error } = await resetPasswordForEmail(email.trim());
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Şifre sıfırlama e-postası gönderilemedi.');
      return;
    }

    toast && toast('Şifre sıfırlama bağlantısı e-postanıza iletildi.');
    setTab('signin');
  }

  async function handleSaveKey() {
    if (!manualKey.trim()) return;
    const ok = await setManualSupabaseKey(manualKey.trim());
    if (ok) {
      setConfigured(true);
      setTab('signin');
      toast && toast('Supabase anahtarı kaydedildi ve bağlandı!');
    } else {
      setErrorMsg('Geçersiz anahtar.');
    }
  }

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.brandRow}>
            <BrandMark size={48} />
            <T style={s.brandTitle}>MOMORA</T>
          </View>
          <T style={s.subtitle}>
            {tab === 'signin' && 'Hesabına giriş yap, hamilelik ve bebek takibine kaldığın yerden devam et.'}
            {tab === 'signup' && 'Anne & baba ortak hesabı oluştur, bebeğin gelişimini birlikte takip edin.'}
            {tab === 'forgot' && 'Kayıtlı e-postanı gir, şifre sıfırlama bağlantısını hemen gönderelim.'}
            {tab === 'key' && 'Supabase Anon / Publishable Key yapılandırması'}
          </T>
        </View>

        {/* Proje Durumu / Key Uyarısı */}
        {!configured && tab !== 'key' && (
          <View style={s.keyNotice}>
            <Icon name="sparkle" size={16} color={colors.purple} />
            <View style={{ flex: 1 }}>
              <T bold style={{ fontSize: 13, color: colors.purple }}>
                Supabase Projesi: fpcovwexojrauddbszab
              </T>
              <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                Canlı bağlantı için Publishable / Anon Key bekleniyor.
              </T>
            </View>
            <Tap onPress={() => setTab('key')} style={s.keyEnterBtn}>
              <T bold style={{ fontSize: 11, color: 'white' }}>Key Gir</T>
            </Tap>
          </View>
        )}

        {/* Tab Switcher (Giriş / Kayıt) */}
        {tab !== 'forgot' && tab !== 'key' && (
          <View style={s.tabSwitcher}>
            <Tap
              onPress={() => { setTab('signin'); setErrorMsg(''); }}
              style={[s.tabButton, tab === 'signin' && s.tabButtonActive]}
            >
              <T bold={tab === 'signin'} style={[s.tabText, tab === 'signin' && s.tabTextActive]}>
                Giriş Yap
              </T>
            </Tap>
            <Tap
              onPress={() => { setTab('signup'); setErrorMsg(''); }}
              style={[s.tabButton, tab === 'signup' && s.tabButtonActive]}
            >
              <T bold={tab === 'signup'} style={[s.tabText, tab === 'signup' && s.tabTextActive]}>
                Hesap Oluştur
              </T>
            </Tap>
          </View>
        )}

        {/* Hata Mesajı Kutusu */}
        {!!errorMsg && (
          <View style={s.errorBox}>
            <Icon name="close" size={16} color="#B42318" />
            <T style={s.errorText}>{errorMsg}</T>
          </View>
        )}

        {/* ─── GİRİŞ YAP FORMU ──────────────────────────────────────────────── */}
        {tab === 'signin' && (
          <View style={s.form}>
            <View style={s.inputGroup}>
              <T bold style={s.inputLabel}>E-posta Adresi</T>
              <TextInput
                style={s.input}
                placeholder="ornek@momora.app"
                placeholderTextColor="#A499A6"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={s.inputGroup}>
              <View style={s.labelRow}>
                <T bold style={s.inputLabel}>Şifre</T>
                <Tap onPress={() => { setTab('forgot'); setErrorMsg(''); }}>
                  <T style={s.forgotLink}>Şifremi Unuttum</T>
                </Tap>
              </View>
              <TextInput
                style={s.input}
                placeholder="••••••••"
                placeholderTextColor="#A499A6"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Tap onPress={handleSignIn} style={s.primaryBtn} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <T bold style={s.primaryBtnText}>Giriş Yap</T>
              )}
            </Tap>
          </View>
        )}

        {/* ─── HESAP OLUŞTUR FORMU ─────────────────────────────────────────── */}
        {tab === 'signup' && (
          <View style={s.form}>
            {/* Rol Seçimi */}
            <View style={s.inputGroup}>
              <T bold style={s.inputLabel}>Rolünüzü Seçin</T>
              <View style={s.roleRow}>
                <Tap
                  onPress={() => setRole('mother')}
                  style={[s.roleCard, role === 'mother' && s.roleCardActive]}
                >
                  <View style={s.roleTop}>
                    <T bold style={[s.roleTitle, role === 'mother' && s.roleTitleActive]}>
                      Ben Anneyim
                    </T>
                    {role === 'mother' && <Icon name="check" size={16} color={colors.purple} />}
                  </View>
                  <T style={s.roleDesc}>Gebelik, belirti ve bebek takibi</T>
                </Tap>

                <Tap
                  onPress={() => setRole('father')}
                  style={[s.roleCard, role === 'father' && s.roleCardActive]}
                >
                  <View style={s.roleTop}>
                    <T bold style={[s.roleTitle, role === 'father' && s.roleTitleActive]}>
                      Ben Babayım
                    </T>
                    {role === 'father' && <Icon name="check" size={16} color={colors.purple} />}
                  </View>
                  <T style={s.roleDesc}>Eş desteği ve baba rehberi</T>
                </Tap>
              </View>
            </View>

            <View style={s.inputGroup}>
              <T bold style={s.inputLabel}>Adınız ve Soyadınız</T>
              <TextInput
                style={s.input}
                placeholder="Zeynep Yılmaz"
                placeholderTextColor="#A499A6"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={s.inputGroup}>
              <T bold style={s.inputLabel}>E-posta Adresi</T>
              <TextInput
                style={s.input}
                placeholder="zeynep@example.com"
                placeholderTextColor="#A499A6"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={s.inputGroup}>
              <T bold style={s.inputLabel}>Şifre</T>
              <TextInput
                style={s.input}
                placeholder="En az 6 karakter"
                placeholderTextColor="#A499A6"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Eş Eşitleme Kodu (Opsiyonel) */}
            <Tap
              onPress={() => setShowPartnerCodeInput(!showPartnerCodeInput)}
              style={s.partnerCodeToggle}
            >
              <Icon name={showPartnerCodeInput ? 'chevron' : 'plus'} size={15} color={colors.purple} />
              <T bold style={{ fontSize: 13, color: colors.purple }}>
                {showPartnerCodeInput ? 'Eş kodunu gizle' : 'Eşimin aile kodu var (Birlikte Takip)'}
              </T>
            </Tap>

            {showPartnerCodeInput && (
              <View style={[s.inputGroup, { marginTop: 4 }]}>
                <T style={s.inputLabel}>Eşinizin Momora Kodu</T>
                <TextInput
                  style={[s.input, { letterSpacing: 2, textTransform: 'uppercase' }]}
                  placeholder="MOM-7829-TR"
                  placeholderTextColor="#A499A6"
                  autoCapitalize="characters"
                  value={partnerCode}
                  onChangeText={setPartnerCode}
                />
                <T style={s.helperText}>
                  Eşiniz daha önce kayıt olduysa Profil sekmesindeki kodu buraya yazabilirsiniz.
                </T>
              </View>
            )}

            <Tap onPress={handleSignUp} style={s.primaryBtn} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <T bold style={s.primaryBtnText}>Hesap Oluştur</T>
              )}
            </Tap>
          </View>
        )}

        {/* ─── ŞİFREMİ UNUTTUM FORMU ───────────────────────────────────────── */}
        {tab === 'forgot' && (
          <View style={s.form}>
            <View style={s.inputGroup}>
              <T bold style={s.inputLabel}>Kayıtlı E-posta Adresiniz</T>
              <TextInput
                style={s.input}
                placeholder="ornek@momora.app"
                placeholderTextColor="#A499A6"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Tap onPress={handleForgotPassword} style={s.primaryBtn} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <T bold style={s.primaryBtnText}>Sıfırlama Bağlantısı Gönder</T>
              )}
            </Tap>

            <Tap onPress={() => setTab('signin')} style={s.textCancelBtn}>
              <T bold style={{ color: colors.purple, fontSize: 13 }}>← Giriş Ekranına Dön</T>
            </Tap>
          </View>
        )}

        {/* ─── MANUEL KEY GİRİŞİ FORMU ────────────────────────────────────── */}
        {tab === 'key' && (
          <View style={s.form}>
            <View style={s.inputGroup}>
              <T bold style={s.inputLabel}>Supabase Anon / Publishable Key</T>
              <TextInput
                style={[s.input, { height: 90, textAlignVertical: 'top' }]}
                placeholder="sb_publishable_... veya eyJhbGci..."
                placeholderTextColor="#A499A6"
                multiline
                value={manualKey}
                onChangeText={setManualKey}
              />
              <T style={s.helperText}>
                Supabase Dashboard &gt; Project Settings &gt; API kısmından kopyaladığınız key'i buraya yapıştırabilirsiniz.
              </T>
            </View>

            <Tap onPress={handleSaveKey} style={s.primaryBtn}>
              <T bold style={s.primaryBtnText}>Key'i Kaydet ve Bağlan</T>
            </Tap>

            <Tap onPress={() => setTab('signin')} style={s.textCancelBtn}>
              <T bold style={{ color: colors.purple, fontSize: 13 }}>← Giriş Ekranına Dön</T>
            </Tap>
          </View>
        )}

        {/* ─── OAUTH BUTONLARI (GOOGLE & APPLE) ─────────────────────────────── */}
        {tab !== 'forgot' && tab !== 'key' && (
          <View style={s.oauthSection}>
            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <T style={s.dividerText}>veya şununla devam et</T>
              <View style={s.dividerLine} />
            </View>

            <View style={s.oauthButtons}>
              <Tap
                onPress={() => handleOAuth('google')}
                style={s.googleBtn}
                disabled={loading}
              >
                <GoogleIcon size={20} />
                <T bold style={s.googleBtnText}>Google ile Devam Et</T>
              </Tap>

              <Tap
                onPress={() => handleOAuth('apple')}
                style={s.appleBtn}
                disabled={loading}
              >
                <AppleIcon size={20} color="#FFFFFF" />
                <T bold style={s.appleBtnText}>Apple ile Devam Et</T>
              </Tap>
            </View>
          </View>
        )}

        {/* Misafir Olarak Devam Et */}
        <Tap onPress={() => close && close()} style={s.guestBtn}>
          <T style={s.guestBtnText}>Şimdilik misafir olarak devam et</T>
        </Tap>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontFamily: fonts.bold,
    letterSpacing: 2,
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  keyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F3EBF4',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6D7E8',
    marginBottom: 20,
  },
  keyEnterBtn: {
    backgroundColor: colors.purple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#EAE2DC',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: 'white',
    ...shadow.soft,
  },
  tabText: {
    fontSize: 14,
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.purple,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FECDCA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#B42318',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 13,
    color: colors.ink,
  },
  forgotLink: {
    fontSize: 12,
    color: colors.purple,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E6DED6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.ink,
  },
  helperText: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleCard: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#E6DED6',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  roleCardActive: {
    borderColor: colors.purple,
    backgroundColor: '#FAF5FB',
  },
  roleTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleTitle: {
    fontSize: 14,
    color: colors.ink,
  },
  roleTitleActive: {
    color: colors.purple,
  },
  roleDesc: {
    fontSize: 11,
    color: colors.muted,
  },
  partnerCodeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  primaryBtn: {
    backgroundColor: colors.purple,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...shadow.soft,
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  textCancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  oauthSection: {
    marginTop: 22,
    gap: 14,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E6DED6',
  },
  dividerText: {
    fontSize: 12,
    color: colors.muted,
  },
  oauthButtons: {
    gap: 10,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E6DED6',
    borderRadius: 14,
    paddingVertical: 13,
    ...shadow.soft,
  },
  googleBtnText: {
    fontSize: 14,
    color: '#3C4043',
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 13,
    ...shadow.soft,
  },
  appleBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  guestBtn: {
    alignItems: 'center',
    marginTop: 26,
    paddingVertical: 8,
  },
  guestBtnText: {
    fontSize: 13,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
});
