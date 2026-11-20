<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseAlert from '../components/base/BaseAlert.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseCard from '../components/base/BaseCard.vue'
import { useAuthStore } from '../stores/useAuthStore'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const mode = ref('masuk')
const name = ref('')
const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')

const isSignUp = computed(() => mode.value === 'daftar')

const redirectTarget = computed(() => {
  const target = route.query.redirect
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : '/'
})

function setMode(nextMode) {
  mode.value = nextMode
  errorMessage.value = ''
}

<<<<<<< HEAD
// Prototype-friendly: accepts any input. A bare name like "budi" becomes budi@gmail.com
// so the demo works without a real email address.
function normalizeEmail(value) {
  const cleaned = value.trim().replace(/\s+/g, '').toLowerCase()
  if (!cleaned.includes('@')) return `${cleaned}@gmail.com`
  if (cleaned.endsWith('@')) return `${cleaned}gmail.com`
  return cleaned
}

function validate() {
  if (!email.value.trim()) {
    return 'Isi email atau nama panggilan kamu, contoh: budi.'
  }
  if (!password.value) {
    return 'Isi kata sandi kamu.'
  }
  if (isSignUp.value && password.value.length < 6) {
    return 'Untuk pendaftaran, kata sandi minimal 6 karakter (aturan sistem, bukan aturan prototype).'
  }
  if (isSignUp.value && !name.value.trim()) {
    return 'Isi nama lengkap kamu.'
  }
  return ''
}

async function submit() {
  errorMessage.value = validate()
  if (errorMessage.value) return
=======
async function submit() {
  errorMessage.value = ''

  if (!email.value.trim() || password.value.length < 6) {
    errorMessage.value = 'Isi email dan kata sandi minimal 6 karakter.'
    return
  }
  if (isSignUp.value && !name.value.trim()) {
    errorMessage.value = 'Isi nama lengkap kamu.'
    return
  }
>>>>>>> f971b41379dff6461effdb7dac175aecdea14f18

  submitting.value = true
  try {
    if (isSignUp.value) {
<<<<<<< HEAD
      await auth.signUp(name.value.trim(), normalizeEmail(email.value), password.value)
    } else {
      await auth.signIn(normalizeEmail(email.value), password.value)
=======
      await auth.signUp(name.value.trim(), email.value.trim(), password.value)
    } else {
      await auth.signIn(email.value.trim(), password.value)
>>>>>>> f971b41379dff6461effdb7dac175aecdea14f18
    }
    router.replace(redirectTarget.value)
  } catch (cause) {
    console.error('auth failed', cause)
<<<<<<< HEAD
    const detail = cause?.message ?? ''
    if (detail.includes('Invalid login credentials')) {
      // Prototype-friendly fallback: if this demo account does not exist yet,
      // register it on the fly with the same credentials and continue.
      if (!isSignUp.value && emailLooksLikeDemo(normalizeEmail(email.value))) {
        try {
          await auth.signUp('Tamu Demo', normalizeEmail(email.value), password.value)
          router.replace(redirectTarget.value)
          return
        } catch (signUpCause) {
          console.error('demo signup fallback failed', signUpCause)
          errorMessage.value = 'Masuk demo belum berhasil. Coba lagi sebentar.'
          return
        }
      }
      errorMessage.value = 'Email atau kata sandi tidak sesuai. Coba lagi.'
    } else if (detail.includes('already registered')) {
      errorMessage.value = 'Email ini sudah terdaftar. Coba masuk saja.'
    } else {
      errorMessage.value = isSignUp.value
        ? 'Pendaftaran belum berhasil. Periksa data kamu lalu coba lagi.'
        : 'Masuk belum berhasil. Periksa koneksi lalu coba lagi.'
    }
=======
    errorMessage.value = isSignUp.value
      ? 'Pendaftaran belum berhasil. Periksa data kamu lalu coba lagi.'
      : 'Email atau kata sandi tidak sesuai. Coba lagi.'
>>>>>>> f971b41379dff6461effdb7dac175aecdea14f18
  } finally {
    submitting.value = false
  }
}
<<<<<<< HEAD

function emailLooksLikeDemo(value) {
  return value.endsWith('@repoint.test')
}

// Instant demo: signs in to the shared demo account, creating it on first use.
// Anyone can enter with one click, no form filling needed.
async function demoLogin() {
  submitting.value = true
  errorMessage.value = ''
  const demoEmail = 'demo@repoint.test'
  const demoPassword = 'demo123456'
  try {
    await auth.signIn(demoEmail, demoPassword)
  } catch {
    try {
      await auth.signUp('Tamu Demo', demoEmail, demoPassword)
    } catch (signUpCause) {
      console.error('demo signup failed', signUpCause)
      errorMessage.value = 'Masuk demo belum berhasil. Coba lagi sebentar.'
      return
    }
  }
  router.replace(redirectTarget.value)
}
=======
>>>>>>> f971b41379dff6461effdb7dac175aecdea14f18
</script>

<template>
  <div class="container page auth-page">
    <BaseCard class="auth-card">
      <header class="auth-header">
        <h1 class="page-title">{{ isSignUp ? 'Buat Akun Baru' : 'Masuk ke RePoint' }}</h1>
        <p class="page-subtitle">
          {{
            isSignUp
              ? 'Daftar untuk mulai menyetorkan sampah dan mengumpulkan poin.'
              : 'Masuk untuk melihat poin dan status setoran kamu.'
          }}
        </p>
      </header>

      <div class="chip-row auth-tabs" role="group" aria-label="Pilih mode akun">
        <button type="button" class="chip" :aria-pressed="!isSignUp" @click="setMode('masuk')">Masuk</button>
        <button type="button" class="chip" :aria-pressed="isSignUp" @click="setMode('daftar')">Daftar</button>
      </div>

      <form class="auth-form" novalidate @submit.prevent="submit">
        <label v-if="isSignUp" class="field">
          <span>Nama lengkap</span>
          <input v-model="name" type="text" autocomplete="name" maxlength="80" />
        </label>

        <label class="field">
<<<<<<< HEAD
          <span>Email atau nama bebas</span>
          <input
            v-model="email"
            type="text"
            :autocomplete="isSignUp ? 'off' : 'email'"
            inputmode="email"
            :placeholder="isSignUp ? 'Tulis apa saja, contoh: budi123' : 'username@gmail.com atau nama bebas'"
          />
=======
          <span>Email</span>
          <input v-model="email" type="email" autocomplete="email" />
>>>>>>> f971b41379dff6461effdb7dac175aecdea14f18
        </label>

        <label class="field">
          <span>Kata sandi</span>
          <input
            v-model="password"
            type="password"
            :autocomplete="isSignUp ? 'new-password' : 'current-password'"
<<<<<<< HEAD
            :placeholder="isSignUp ? 'Minimal 6 karakter untuk daftar' : 'Kata sandi apa saja'"
=======
>>>>>>> f971b41379dff6461effdb7dac175aecdea14f18
          />
        </label>

        <BaseAlert v-if="errorMessage" tone="danger">{{ errorMessage }}</BaseAlert>

<<<<<<< HEAD
        <p v-if="isSignUp" class="muted auth-note">
          Ini mode prototype: kamu tidak perlu email asli. Tulis nama bebas dan kata sandi apa saja
          (minimal 6 karakter untuk pendaftaran).
        </p>

        <BaseButton type="submit" block :disabled="submitting">
          {{ submitting ? 'Memproses...' : isSignUp ? 'Daftar Sekarang' : 'Masuk' }}
        </BaseButton>

        <div class="auth-divider" role="separator" aria-label="atau">
          <span>atau</span>
        </div>

        <BaseButton block variant="secondary" :disabled="submitting" @click="demoLogin">
          Masuk Demo Instan
        </BaseButton>

        <p class="muted auth-note">
          Klik tombol di atas untuk mencoba RePoint langsung tanpa mendaftar. Cocok untuk melihat
          cara kerja aplikasi sebelum membuat akun sendiri.
        </p>
=======
        <BaseButton type="submit" block :disabled="submitting">
          {{ submitting ? 'Memproses...' : isSignUp ? 'Daftar Sekarang' : 'Masuk' }}
        </BaseButton>
>>>>>>> f971b41379dff6461effdb7dac175aecdea14f18
      </form>
    </BaseCard>
  </div>
</template>

<style scoped>
.auth-page {
  display: grid;
  place-items: center;
  min-height: calc(100vh - var(--header-height) - 120px);
}

.auth-card {
  width: 100%;
  max-width: 440px;
  display: grid;
<<<<<<< HEAD
  gap: var(--space-3);
=======
  gap: 24px;
>>>>>>> f971b41379dff6461effdb7dac175aecdea14f18
}

.auth-header {
  display: grid;
  gap: 8px;
}

.auth-tabs {
  margin-bottom: 0;
}

.auth-form {
  display: grid;
<<<<<<< HEAD
  gap: var(--space-2);
}

.auth-note {
  font-size: 13px;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-muted);
  font-size: 13px;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
=======
  gap: 16px;
>>>>>>> f971b41379dff6461effdb7dac175aecdea14f18
}
</style>
