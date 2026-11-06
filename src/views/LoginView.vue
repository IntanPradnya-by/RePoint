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

  submitting.value = true
  try {
    if (isSignUp.value) {
      await auth.signUp(name.value.trim(), email.value.trim(), password.value)
    } else {
      await auth.signIn(email.value.trim(), password.value)
    }
    router.replace(redirectTarget.value)
  } catch (cause) {
    console.error('auth failed', cause)
    errorMessage.value = isSignUp.value
      ? 'Pendaftaran belum berhasil. Periksa data kamu lalu coba lagi.'
      : 'Email atau kata sandi tidak sesuai. Coba lagi.'
  } finally {
    submitting.value = false
  }
}
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
          <span>Email</span>
          <input v-model="email" type="email" autocomplete="email" />
        </label>

        <label class="field">
          <span>Kata sandi</span>
          <input
            v-model="password"
            type="password"
            :autocomplete="isSignUp ? 'new-password' : 'current-password'"
          />
        </label>

        <BaseAlert v-if="errorMessage" tone="danger">{{ errorMessage }}</BaseAlert>

        <BaseButton type="submit" block :disabled="submitting">
          {{ submitting ? 'Memproses...' : isSignUp ? 'Daftar Sekarang' : 'Masuk' }}
        </BaseButton>
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
  gap: 24px;
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
  gap: 16px;
}
</style>
