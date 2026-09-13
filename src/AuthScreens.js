import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Modal,
  Image,
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
  authenticateGoogleUser,
  authenticateAppleUser,
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

export function AuthModal({ close, toast, onAuthSuccess, lang = 'tr' }) {
  const isEn = lang === 'en';
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
      setErrorMsg(isEn ? 'Please enter your email and password.' : 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }
    setLoading(true);
    const { data, error } = await signInWithEmailPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || (isEn ? 'Sign in failed. Please check your credentials.' : 'Giriş yapılamadı. Bilgilerinizi kontrol edin.'));
      return;
    }

    toast && toast(isEn ? 'Welcome to Momora 🌸' : 'Momora\'ya hoş geldiniz 🌸');
    onAuthSuccess && onAuthSuccess(data?.user);
    close && close();
  }

  async function handleSignUp() {
    setErrorMsg('');
    if (!fullName.trim()) {
      setErrorMsg(isEn ? 'Please enter your full name.' : 'Lütfen adınızı ve soyadınızı girin.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      setErrorMsg(isEn ? 'Please set an email and password.' : 'Lütfen e-posta ve şifre belirleyin.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg(isEn ? 'Password must be at least 6 characters.' : 'Şifreniz en az 6 karakter olmalıdır.');
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
      setErrorMsg(error.message || (isEn ? 'An error occurred during registration.' : 'Kayıt sırasında bir hata oluştu.'));
      return;
    }

    toast && toast(isEn ? 'Account created successfully! Welcome 🤍' : 'Hesabınız başarıyla oluşturuldu! Hoş geldiniz 🤍');
    onAuthSuccess && onAuthSuccess(data?.user);
    close && close();
  }

  const [legalModal, setLegalModal] = useState(null); // 'terms' | 'privacy' | null
  const [googlePromptVisible, setGooglePromptVisible] = useState(false);
  const [promptGoogleEmail, setPromptGoogleEmail] = useState('');
  const [promptGoogleName, setPromptGoogleName] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const [applePromptVisible, setApplePromptVisible] = useState(false);
  const [promptAppleEmail, setPromptAppleEmail] = useState('');
  const [promptAppleName, setPromptAppleName] = useState('');
  const [appleLoading, setAppleLoading] = useState(false);
  const [appleError, setAppleError] = useState('');

  async function handleOAuth(provider) {
    setErrorMsg('');
    if (provider === 'google') {
      setGoogleError('');
      setPromptGoogleEmail(email.trim() || '');
      setPromptGoogleName(fullName.trim() || '');
      setGooglePromptVisible(true);
    } else if (provider === 'apple') {
      setAppleError('');
      setPromptAppleEmail(email.trim() || '');
      setPromptAppleName(fullName.trim() || '');
      setApplePromptVisible(true);
    } else {
      setLoading(true);
      const { error } = await signInWithOAuthProvider(provider);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message || (isEn ? 'OAuth sign in failed.' : 'Giriş işlemi başarısız oldu.'));
      }
    }
  }

  async function handleConfirmGoogleSignIn() {
    setGoogleError('');
    if (!promptGoogleEmail.trim() || !promptGoogleEmail.includes('@')) {
      setGoogleError(isEn ? 'Please enter a valid Google email address.' : 'Lütfen geçerli bir Google e-posta adresi girin.');
      return;
    }
    setGoogleLoading(true);
    const { data, error } = await authenticateGoogleUser({
      email: promptGoogleEmail.trim(),
      fullName: promptGoogleName.trim() || fullName.trim(),
      role,
    });
    setGoogleLoading(false);

    if (error) {
      setGoogleError(error.message || (isEn ? 'Google sign in failed.' : 'Google ile giriş yapılamadı.'));
      return;
    }

    setGooglePromptVisible(false);
    toast && toast(isEn ? 'Signed in with Google account 🌸' : 'Google hesabınızla başarıyla giriş yapıldı 🌸');
    onAuthSuccess && onAuthSuccess(data?.user);
    close && close();
  }

  async function handleConfirmAppleSignIn() {
    setAppleError('');
    if (!promptAppleEmail.trim() || !promptAppleEmail.includes('@')) {
      setAppleError(isEn ? 'Please enter a valid Apple ID email address.' : 'Lütfen geçerli bir Apple ID / iCloud e-posta adresi girin.');
      return;
    }
    setAppleLoading(true);
    const { data, error } = await authenticateAppleUser({
      email: promptAppleEmail.trim(),
      fullName: promptAppleName.trim() || fullName.trim(),
      role,
    });
    setAppleLoading(false);

    if (error) {
      setAppleError(error.message || (isEn ? 'Apple sign in failed.' : 'Apple ile giriş yapılamadı.'));
      return;
    }

    setApplePromptVisible(false);
    toast && toast(isEn ? 'Signed in with Apple account 🍏' : 'Apple hesabınızla başarıyla giriş yapıldı 🍏');
    onAuthSuccess && onAuthSuccess(data?.user);
    close && close();
  }

  async function handleForgotPassword() {
    setErrorMsg('');
    if (!email.trim()) {
      setErrorMsg(isEn ? 'Please enter your registered email address.' : 'Lütfen kayıtlı e-posta adresinizi girin.');
      return;
    }
    setLoading(true);
    const { error } = await resetPasswordForEmail(email.trim());
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || (isEn ? 'Could not send password reset email.' : 'Şifre sıfırlama e-postası gönderilemedi.'));
      return;
    }

    toast && toast(isEn ? 'Password reset link sent to your email.' : 'Şifre sıfırlama bağlantısı e-postanıza iletildi.');
    setTab('signin');
  }

  async function handleSaveKey() {
    if (!manualKey.trim()) return;
    const ok = await setManualSupabaseKey(manualKey.trim());
    if (ok) {
      setConfigured(true);
      setTab('signin');
      toast && toast(isEn ? 'Supabase key saved and connected!' : 'Supabase anahtarı kaydedildi ve bağlandı!');
    } else {
      setErrorMsg(isEn ? 'Invalid key.' : 'Geçersiz anahtar.');
    }
  }

  return (
    <View style={s.container}>
      {/* Top Navigation Bar with Back & Close */}
      <View style={s.topBar}>
        <Tap onPress={() => close && close()} style={s.backBtn} label={isEn ? 'Back' : 'Geri'}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke={colors.ink} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <T bold style={s.backBtnText}>{isEn ? 'Back' : 'Geri'}</T>
        </Tap>
        <T bold style={s.topBarTitle}>
          {tab === 'signup'
            ? (isEn ? 'Create Account' : 'Hesap Oluştur')
            : tab === 'forgot'
            ? (isEn ? 'Reset Password' : 'Şifre Sıfırla')
            : tab === 'key'
            ? 'Supabase Key'
            : (isEn ? 'Sign In' : 'Giriş Yap')}
        </T>
        <Tap onPress={() => close && close()} style={s.closeBtn} label={isEn ? 'Close' : 'Kapat'}>
          <Icon name="close" size={18} color={colors.muted} />
        </Tap>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.brandRow}>
            <BrandMark size={40} />
            <T style={s.brandTitle}>MOMORA</T>
          </View>
          <T style={s.subtitle}>
            {tab === 'signin' && (isEn ? 'Sign in to your account to sync baby logs.' : 'Hamilelik ve bebek takibine kaldığın yerden devam et.')}
            {tab === 'signup' && (isEn ? 'Create an account to track development together.' : 'Anne & baba ortak hesabı oluştur, birlikte takip edin.')}
            {tab === 'forgot' && (isEn ? 'Enter your email to receive a password reset link.' : 'Kayıtlı e-postanı gir, şifre sıfırlama bağlantısı gönderelim.')}
            {tab === 'key' && (isEn ? 'Supabase Anon / Publishable Key setup' : 'Supabase Anon / Publishable Key yapılandırması')}
          </T>
        </View>

        {/* Proje Durumu / Key Uyarısı */}
        {!configured && tab !== 'key' && (
          <View style={s.keyNotice}>
            <Icon name="refresh" size={16} color={colors.purple} />
            <View style={{ flex: 1 }}>
              <T bold style={{ fontSize: 13, color: colors.purple }}>
                Supabase: rnkrjmblgcdqlyslbhob
              </T>
              <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                {isEn ? 'Awaiting Publishable / Anon Key for cloud sync.' : 'Canlı bağlantı için Publishable / Anon Key bekleniyor.'}
              </T>
            </View>
            <Tap onPress={() => setTab('key')} style={s.keyEnterBtn}>
              <T bold style={{ fontSize: 11, color: 'white' }}>{isEn ? 'Enter Key' : 'Key Gir'}</T>
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
                {isEn ? 'Sign In' : 'Giriş Yap'}
              </T>
            </Tap>
            <Tap
              onPress={() => { setTab('signup'); setErrorMsg(''); }}
              style={[s.tabButton, tab === 'signup' && s.tabButtonActive]}
            >
              <T bold={tab === 'signup'} style={[s.tabText, tab === 'signup' && s.tabTextActive]}>
                {isEn ? 'Create Account' : 'Hesap Oluştur'}
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
              <T bold style={s.inputLabel}>{isEn ? 'Email Address' : 'E-posta Adresi'}</T>
              <TextInput
                style={s.input}
                placeholder={isEn ? 'example@momora.app' : 'ornek@momora.app'}
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
                <T bold style={s.inputLabel}>{isEn ? 'Password' : 'Şifre'}</T>
                <Tap onPress={() => { setTab('forgot'); setErrorMsg(''); }}>
                  <T style={s.forgotLink}>{isEn ? 'Forgot Password?' : 'Şifremi Unuttum'}</T>
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
                <T bold style={s.primaryBtnText}>{isEn ? 'Sign In' : 'Giriş Yap'}</T>
              )}
            </Tap>
          </View>
        )}

        {/* ─── HESAP OLUŞTUR FORMU ─────────────────────────────────────────── */}
        {tab === 'signup' && (
          <View style={s.form}>
            {/* Rol Seçimi */}
            <View style={s.inputGroup}>
              <T bold style={s.inputLabel}>{isEn ? 'Select Your Role' : 'Rolünüzü Seçin'}</T>
              <View style={s.roleRow}>
                <Tap
                  onPress={() => setRole('mother')}
                  style={[s.roleCard, role === 'mother' && s.roleCardActive]}
                >
                  <View style={s.roleTop}>
                    <T bold style={[s.roleTitle, role === 'mother' && s.roleTitleActive]}>
                      {isEn ? "I'm the Mother" : 'Ben Anneyim'}
                    </T>
                    {role === 'mother' && <Icon name="check" size={16} color={colors.purple} />}
                  </View>
                  <T style={s.roleDesc}>{isEn ? 'Pregnancy, symptoms and baby care' : 'Gebelik, belirti ve bebek takibi'}</T>
                </Tap>

                <Tap
                  onPress={() => setRole('father')}
                  style={[s.roleCard, role === 'father' && s.roleCardActive]}
                >
                  <View style={s.roleTop}>
                    <T bold style={[s.roleTitle, role === 'father' && s.roleTitleActive]}>
                      {isEn ? "I'm the Father" : 'Ben Babayım'}
                    </T>
                    {role === 'father' && <Icon name="check" size={16} color={colors.purple} />}
                  </View>
                  <T style={s.roleDesc}>{isEn ? 'Partner support and dad guide' : 'Eş desteği ve baba rehberi'}</T>
                </Tap>
              </View>
            </View>

            <View style={s.inputGroup}>
              <T bold style={s.inputLabel}>{isEn ? 'Full Name' : 'Adınız ve Soyadınız'}</T>
              <TextInput
                style={s.input}
                placeholder={isEn ? 'Emma Watson' : 'Zeynep Yılmaz'}
                placeholderTextColor="#A499A6"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={s.inputGroup}>
              <T bold style={s.inputLabel}>{isEn ? 'Email Address' : 'E-posta Adresi'}</T>
              <TextInput
                style={s.input}
                placeholder={isEn ? 'emma@example.com' : 'zeynep@example.com'}
                placeholderTextColor="#A499A6"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={s.inputGroup}>
              <T bold style={s.inputLabel}>{isEn ? 'Password' : 'Şifre'}</T>
              <TextInput
                style={s.input}
                placeholder={isEn ? 'At least 6 characters' : 'En az 6 karakter'}
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
                {showPartnerCodeInput
                  ? (isEn ? 'Hide partner code' : 'Eş kodunu gizle')
                  : (isEn ? 'Have a partner family code (Shared)' : 'Eşimin aile kodu var (Birlikte Takip)')}
              </T>
            </Tap>

            {showPartnerCodeInput && (
              <View style={[s.inputGroup, { marginTop: 4 }]}>
                <T style={s.inputLabel}>{isEn ? "Partner's Momora Code" : 'Eşinizin Momora Kodu'}</T>
                <TextInput
                  style={[s.input, { letterSpacing: 2, textTransform: 'uppercase' }]}
                  placeholder="MOM-7829-TR"
                  placeholderTextColor="#A499A6"
                  autoCapitalize="characters"
                  value={partnerCode}
                  onChangeText={setPartnerCode}
                />
                <T style={s.helperText}>
                  {isEn
                    ? 'If your partner already registered, enter the code from their Profile tab here.'
                    : 'Eşiniz daha önce kayıt olduysa Profil sekmesindeki kodu buraya yazabilirsiniz.'}
                </T>
              </View>
            )}

            <Tap onPress={handleSignUp} style={s.primaryBtn} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <T bold style={s.primaryBtnText}>{isEn ? 'Create Account' : 'Hesap Oluştur'}</T>
              )}
            </Tap>
          </View>
        )}

        {/* ─── ŞİFREMİ UNUTTUM FORMU ───────────────────────────────────────── */}
        {tab === 'forgot' && (
          <View style={s.form}>
            <View style={s.inputGroup}>
              <T bold style={s.inputLabel}>{isEn ? 'Your Registered Email Address' : 'Kayıtlı E-posta Adresiniz'}</T>
              <TextInput
                style={s.input}
                placeholder={isEn ? 'example@momora.app' : 'ornek@momora.app'}
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
                <T bold style={s.primaryBtnText}>{isEn ? 'Send Reset Link' : 'Sıfırlama Bağlantısı Gönder'}</T>
              )}
            </Tap>

            <Tap onPress={() => setTab('signin')} style={s.textCancelBtn}>
              <T bold style={{ color: colors.purple, fontSize: 13 }}>{isEn ? '← Back to Sign In' : '← Giriş Ekranına Dön'}</T>
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
                {isEn
                  ? 'Paste the key copied from Supabase Dashboard > Project Settings > API here.'
                  : "Supabase Dashboard > Project Settings > API kısmından kopyaladığınız key'i buraya yapıştırabilirsiniz."}
              </T>
            </View>

            <Tap onPress={handleSaveKey} style={s.primaryBtn}>
              <T bold style={s.primaryBtnText}>{isEn ? 'Save Key & Connect' : "Key'i Kaydet ve Bağlan"}</T>
            </Tap>

            <Tap onPress={() => setTab('signin')} style={s.textCancelBtn}>
              <T bold style={{ color: colors.purple, fontSize: 13 }}>{isEn ? '← Back to Sign In' : '← Giriş Ekranına Dön'}</T>
            </Tap>
          </View>
        )}

        {/* ─── OAUTH BUTONLARI (GOOGLE & APPLE) ─────────────────────────────── */}
        {tab !== 'forgot' && tab !== 'key' && (
          <View style={s.oauthSection}>
            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <T style={s.dividerText}>{isEn ? 'or continue with' : 'veya şununla devam et'}</T>
              <View style={s.dividerLine} />
            </View>

            <View style={s.oauthButtons}>
              <Tap
                onPress={() => handleOAuth('google')}
                style={s.googleBtn}
                disabled={loading}
              >
                <GoogleIcon size={20} />
                <T bold style={s.googleBtnText}>{isEn ? 'Continue with Google' : 'Google ile Devam Et'}</T>
              </Tap>

              <Tap
                onPress={() => handleOAuth('apple')}
                style={s.appleBtn}
                disabled={loading}
              >
                <AppleIcon size={20} color="#FFFFFF" />
                <T bold style={s.appleBtnText}>{isEn ? 'Continue with Apple' : 'Apple ile Devam Et'}</T>
              </Tap>
            </View>
          </View>
        )}

        {/* Güvenlik & Aile Senkronizasyon Rozeti */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, opacity: 0.8 }}>
          <Icon name="check" size={12} color={colors.purple} />
          <T style={{ fontSize: 11.5, color: colors.muted }}>
            {isEn ? 'Private & encrypted · Shared family cloud sync' : 'Gizlilik odaklı & şifreli · Ortak aile eşitlemesi'}
          </T>
        </View>

        {/* Yasal Şartlar & Gizlilik Linkleri */}
        <View style={s.legalSection}>
          <T style={s.legalNotice}>
            {isEn ? 'By signing in or creating an account, you agree to Momora’s ' : 'Giriş yaparak veya hesap oluşturarak Momora '}
            <T bold style={s.legalLink} onPress={() => setLegalModal('terms')}>
              {isEn ? 'Terms of Service' : 'Kullanım Koşulları'}
            </T>
            {isEn ? ' and ' : ' ve '}
            <T bold style={s.legalLink} onPress={() => setLegalModal('privacy')}>
              {isEn ? 'Privacy Policy' : 'Gizlilik Politikası'}
            </T>
            {isEn ? '.' : '’nı kabul etmiş sayılırsınız.'}
          </T>
        </View>

        {/* Misafir Olarak Devam Et */}
        <Tap onPress={() => close && close()} style={s.guestBtn}>
          <T style={s.guestBtnText}>{isEn ? 'Continue as guest for now' : 'Şimdilik misafir olarak devam et'}</T>
        </Tap>
      </ScrollView>

      {/* ─── GOOGLE SIGN-IN DIALOG ────────────────────────────────────────── */}
      <Modal visible={googlePromptVisible} transparent animationType="slide" onRequestClose={() => setGooglePromptVisible(false)}>
        <View style={s.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setGooglePromptVisible(false)} />
          <View style={s.googleSheet}>
            <View style={s.sheetHandle} />
            <View style={s.googleHeader}>
              <GoogleIcon size={28} />
              <View style={{ flex: 1 }}>
                <T bold style={{ fontSize: 17, color: colors.ink }}>
                  {isEn ? 'Sign in with Google' : 'Google ile Hızlı Giriş'}
                </T>
                <T style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                  {isEn ? 'Connect your Google account to Momora' : 'Google hesabını Momora ile bağla'}
                </T>
              </View>
              <Tap onPress={() => setGooglePromptVisible(false)} style={s.sheetCloseBtn}>
                <Icon name="close" size={18} color={colors.muted} />
              </Tap>
            </View>

            <View style={s.googleDivider} />

            {!!googleError && (
              <View style={[s.errorBox, { marginBottom: 14 }]}>
                <Icon name="close" size={16} color="#B42318" />
                <T style={s.errorText}>{googleError}</T>
              </View>
            )}

            <View style={{ gap: 12 }}>
              <View style={s.inputGroup}>
                <T bold style={s.inputLabel}>{isEn ? 'Your Google Email' : 'Google E-posta Adresiniz'}</T>
                <TextInput
                  style={s.input}
                  placeholder={isEn ? 'e.g. yourname@gmail.com' : 'Örn: adiniz@gmail.com'}
                  placeholderTextColor="#A499A6"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={promptGoogleEmail}
                  onChangeText={setPromptGoogleEmail}
                />
              </View>

              <View style={s.inputGroup}>
                <T bold style={s.inputLabel}>{isEn ? 'Your Full Name (Optional)' : 'Adınız & Soyadınız (İsteğe Bağlı)'}</T>
                <TextInput
                  style={s.input}
                  placeholder={isEn ? 'e.g. Emma Miller' : 'Örn: Zeynep Yılmaz'}
                  placeholderTextColor="#A499A6"
                  value={promptGoogleName}
                  onChangeText={setPromptGoogleName}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
              <Tap onPress={() => setGooglePromptVisible(false)} style={s.cancelModalBtn}>
                <T bold style={{ color: colors.muted, fontSize: 13 }}>{isEn ? 'Cancel' : 'Vazgeç'}</T>
              </Tap>
              <Tap
                onPress={handleConfirmGoogleSignIn}
                style={[s.confirmGoogleBtn, { flex: 2 }]}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color={colors.purple} />
                ) : (
                  <>
                    <GoogleIcon size={18} />
                    <T bold style={{ color: '#3C4043', fontSize: 13.5 }}>
                      {isEn ? 'Sign In with Google' : 'Google ile Bağlan'}
                    </T>
                  </>
                )}
              </Tap>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── APPLE SIGN-IN DIALOG ─────────────────────────────────────────── */}
      <Modal visible={applePromptVisible} transparent animationType="slide" onRequestClose={() => setApplePromptVisible(false)}>
        <View style={s.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setApplePromptVisible(false)} />
          <View style={s.appleSheet}>
            <View style={s.sheetHandle} />
            <View style={s.appleHeader}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
                <AppleIcon size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <T bold style={{ fontSize: 17, color: colors.ink }}>
                  {isEn ? 'Sign in with Apple' : 'Apple ile Hızlı Giriş'}
                </T>
                <T style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                  {isEn ? 'Connect your Apple ID or iCloud account' : 'Apple ID veya iCloud hesabını Momora ile bağla'}
                </T>
              </View>
              <Tap onPress={() => setApplePromptVisible(false)} style={s.sheetCloseBtn}>
                <Icon name="close" size={18} color={colors.muted} />
              </Tap>
            </View>

            <View style={s.googleDivider} />

            {!!appleError && (
              <View style={[s.errorBox, { marginBottom: 14 }]}>
                <Icon name="close" size={16} color="#B42318" />
                <T style={s.errorText}>{appleError}</T>
              </View>
            )}

            <View style={{ gap: 12 }}>
              <View style={s.inputGroup}>
                <T bold style={s.inputLabel}>{isEn ? 'Your Apple ID / iCloud Email' : 'Apple ID / iCloud E-posta Adresiniz'}</T>
                <TextInput
                  style={s.input}
                  placeholder={isEn ? 'e.g. user@icloud.com' : 'Örn: kullanici@icloud.com'}
                  placeholderTextColor="#A499A6"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={promptAppleEmail}
                  onChangeText={setPromptAppleEmail}
                />
              </View>

              <View style={s.inputGroup}>
                <T bold style={s.inputLabel}>{isEn ? 'Your Full Name (Optional)' : 'Adınız & Soyadınız (İsteğe Bağlı)'}</T>
                <TextInput
                  style={s.input}
                  placeholder={isEn ? 'e.g. Emma Miller' : 'Örn: Zeynep Yılmaz'}
                  placeholderTextColor="#A499A6"
                  value={promptAppleName}
                  onChangeText={setPromptAppleName}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
              <Tap onPress={() => setApplePromptVisible(false)} style={s.cancelModalBtn}>
                <T bold style={{ color: colors.muted, fontSize: 13 }}>{isEn ? 'Cancel' : 'Vazgeç'}</T>
              </Tap>
              <Tap
                onPress={handleConfirmAppleSignIn}
                style={[s.confirmAppleBtn, { flex: 2 }]}
                disabled={appleLoading}
              >
                {appleLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <AppleIcon size={18} color="#FFFFFF" />
                    <T bold style={{ color: '#FFFFFF', fontSize: 13.5 }}>
                      {isEn ? 'Sign In with Apple' : 'Apple ile Bağlan'}
                    </T>
                  </>
                )}
              </Tap>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── LEGAL MODAL (TERMS & PRIVACY) ─────────────────────────────────── */}
      <Modal visible={!!legalModal} transparent animationType="fade" onRequestClose={() => setLegalModal(null)}>
        <View style={s.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setLegalModal(null)} />
          <View style={s.legalSheet}>
            <View style={s.legalSheetHeader}>
              <T bold style={{ fontSize: 18, color: colors.ink }}>
                {legalModal === 'terms'
                  ? (isEn ? 'Terms of Service' : 'Kullanım Koşulları')
                  : (isEn ? 'Privacy & Data Protection' : 'Gizlilik ve Veri Güvenliği')}
              </T>
              <Tap onPress={() => setLegalModal(null)} style={s.sheetCloseBtn}>
                <Icon name="close" size={20} color={colors.muted} />
              </Tap>
            </View>
            <ScrollView style={{ maxHeight: 360, marginVertical: 12 }} showsVerticalScrollIndicator={false}>
              {legalModal === 'terms' ? (
                <View style={{ gap: 10 }}>
                  <T style={s.legalParagraph}>
                    {isEn
                      ? '1. Medical Disclaimer: Momora provides educational and tracking content for pregnancy, postpartum, and infant development. It is not a substitute for clinical medical diagnosis, obstetric consultation, or emergency care.'
                      : '1. Tıbbi Uyarı ve Sorumluluk Reddi: Momora, gebelik, lohusalık ve bebek gelişimi süreçlerine dair bilgilendirme ve kişisel takip desteği sunar. Uygulama içerisindeki hiçbir bilgi bir hekim muayenesi, klinik teşhis veya acil müdahale yerine geçmez.'}
                  </T>
                  <T style={s.legalParagraph}>
                    {isEn
                      ? '2. Account Security: You are responsible for keeping your account credentials safe. Momora encrypts all shared family partner connections.'
                      : '2. Hesap Güvenliği: Eş senkronizasyonu ve aile takip özellikleri uçtan uca güvenli anahtarlar ile korunur. Hesap giriş bilgilerinizi üçüncü kişilerle paylaşmayınız.'}
                  </T>
                  <T style={s.legalParagraph}>
                    {isEn
                      ? '3. Respectful Community: Forum discussions, birth stories, and question-answer features require mutual respect and kindness.'
                      : '3. Topluluk Kuralları: Momora topluluk alanlarında paylaşılan soru ve deneyimler saygı ve empati çerçevesinde yürütülür.'}
                  </T>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  <T style={s.legalParagraph}>
                    {isEn
                      ? '1. Health Data Protection: Sensitive health logs (kick counts, weight, ultrasound notes, contractions) are encrypted and never sold to advertisers.'
                      : '1. Sağlık Verisi Korunumu: Tekme sayacı, kilo takibi, ultrason anıları ve kasılma kayıtları gibi hassas verileriniz şifreli olarak saklanır ve asla reklam verenlerle paylaşılmaz.'}
                  </T>
                  <T style={s.legalParagraph}>
                    {isEn
                      ? '2. KVKK & GDPR Compliance: You retain full rights to delete your account, export your pregnancy journal, or disconnect partner sync at any time.'
                      : '2. KVKK ve GDPR Uyumu: Dilediğiniz an verilerinizi dışa aktarabilir, eş bağlantısını sonlandırabilir veya hesabınızı tamamen silebilirsiniz.'}
                  </T>
                  <T style={s.legalParagraph}>
                    {isEn
                      ? '3. Local-First Design: Your data remains available offline on your device, syncing to the cloud only when you are connected.'
                      : '3. Cihazda Öncelikli Mimari: Verileriniz öncelikle cihazınızda saklanır, internete bağlandığınızda aile bulutunuza güvenle senkronize edilir.'}
                  </T>
                </View>
              )}
            </ScrollView>
            <Tap onPress={() => setLegalModal(null)} style={s.primaryBtn}>
              <T bold style={s.primaryBtnText}>{isEn ? 'Understood' : 'Anladım'}</T>
            </Tap>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
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

  valueCard: {
    backgroundColor: '#FFFCF8',
    borderWidth: 1,
    borderColor: '#E9DDE8',
    borderRadius: 22,
    padding: 14,
    gap: 11,
    marginBottom: 18,
  },
  valueRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  valueDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1E7F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  valueTitle: {
    fontSize: 13,
    color: colors.ink,
  },
  valueText: {
    fontSize: 11.5,
    color: colors.muted,
    lineHeight: 16,
    marginTop: 2,
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

  /* ── Top Bar Navigation ── */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E8EF',
    backgroundColor: 'white',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: 14,
    color: colors.ink,
  },
  topBarTitle: {
    fontSize: 16,
    color: colors.ink,
    letterSpacing: 0.2,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 8,
  },

  /* ── Legal Section ── */
  legalSection: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  legalNotice: {
    fontSize: 11.5,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: colors.purple,
    textDecorationLine: 'underline',
  },

  /* ── Modals & Sheets ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 20, 32, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D6CBD7',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetCloseBtn: {
    padding: 6,
    borderRadius: 8,
  },

  /* ── Google Sheet ── */
  googleSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: Platform.OS === 'ios' ? 38 : 26,
    ...shadow.card,
  },
  googleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleDivider: {
    height: 1,
    backgroundColor: '#EBE5EB',
    marginVertical: 14,
  },
  googleAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F9F7FA',
    borderWidth: 1,
    borderColor: '#E6DDE8',
  },
  googleAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleSelectBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F0E6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DFD8E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2EDF3',
  },
  confirmGoogleBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DADCE0',
    ...shadow.soft,
  },

  /* ── Apple Sheet ── */
  appleSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: Platform.OS === 'ios' ? 38 : 26,
    ...shadow.card,
  },
  appleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appleCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8F6F9',
    borderWidth: 1,
    borderColor: '#E6DDE8',
  },
  relayToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingVertical: 6,
  },
  confirmAppleBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#000000',
    ...shadow.soft,
  },

  /* ── Legal Sheet ── */
  legalSheet: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 22,
    padding: 22,
    ...shadow.card,
  },
  legalSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E8EF',
  },
  legalParagraph: {
    fontSize: 12.5,
    color: colors.ink,
    lineHeight: 18,
  },
});
