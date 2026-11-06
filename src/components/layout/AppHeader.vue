<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { usePointsStore } from '../../stores/usePointsStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { formatNumber } from '../../composables/useFormatters'
import BaseButton from '../base/BaseButton.vue'

const router = useRouter()
const { balance } = usePointsStore()
const auth = useAuthStore()
const { isLoggedIn, isAdmin, userName } = auth
const menuOpen = ref(false)

const baseNavLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/waste', label: 'Katalog Sampah' },
  { to: '/rewards', label: 'Reward' },
  { to: '/wallet', label: 'Dompet Poin' },
  { to: '/history', label: 'Riwayat' },
  { to: '/about', label: 'Tentang' }
]

const navLinks = computed(() =>
  isAdmin.value ? [...baseNavLinks, { to: '/admin', label: 'Persetujuan' }] : baseNavLinks
)

const initials = computed(() =>
  userName.value
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
)

async function handleSignOut() {
  menuOpen.value = false
  try {
    await auth.signOut()
  } catch (cause) {
    console.error('sign out failed', cause)
    return
  }
  router.replace({ name: 'login' })
}
</script>

<template>
  <header class="app-header">
    <div class="container header-inner">
      <RouterLink to="/" class="brand" aria-label="RePoint - Dashboard">
        <span class="brand-mark">R</span>
        <span class="brand-name">RePoint</span>
      </RouterLink>

      <nav v-if="isLoggedIn" class="nav-desktop" aria-label="Navigasi utama">
        <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-link">
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="header-actions">
        <template v-if="isLoggedIn">
          <RouterLink to="/wallet" class="balance-chip" aria-label="Saldo poin">
            <span class="balance-label">Saldo</span>
            <span class="balance-value num">{{ formatNumber(balance) }} poin</span>
          </RouterLink>
          <div class="profile" :title="userName">
            <span class="avatar">{{ initials }}</span>
            <span class="profile-name">{{ userName }}</span>
          </div>
          <BaseButton variant="ghost" size="sm" @click="handleSignOut">Keluar</BaseButton>
        </template>
        <BaseButton v-else to="/login" size="sm">Masuk</BaseButton>
        <button
          v-if="isLoggedIn"
          type="button"
          class="menu-toggle"
          :aria-expanded="menuOpen ? 'true' : 'false'"
          aria-controls="mobile-nav"
          aria-label="Buka menu"
          @click="menuOpen = !menuOpen"
        >
          <span class="menu-bar" />
          <span class="menu-bar" />
          <span class="menu-bar" />
        </button>
      </div>
    </div>

    <nav v-show="isLoggedIn && menuOpen" id="mobile-nav" class="nav-mobile" aria-label="Navigasi seluler">
      <div class="container nav-mobile-list">
        <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-link" @click="menuOpen = false">
          {{ link.label }}
        </RouterLink>
        <BaseButton variant="ghost" @click="handleSignOut">Keluar</BaseButton>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: var(--header-height);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--brand-gradient);
  color: var(--neutral-0);
  font-weight: 700;
  font-size: 18px;
  transition: transform 0.3s var(--ease);
}

.brand:hover .brand-mark {
  transform: rotate(-8deg);
}

.brand-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-800);
}

.nav-desktop {
  display: none;
  gap: 4px;
}

.nav-link {
  padding: 8px 12px;
  border-radius: var(--radius-pill);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-muted);
  transition: background 0.2s var(--ease), color 0.2s var(--ease);
}

.nav-link:hover {
  background: var(--primary-50);
  color: var(--primary-800);
}

.nav-link.router-link-active {
  background: var(--primary-100);
  color: var(--primary-800);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.balance-chip {
  display: flex;
  flex-direction: column;
  padding: 4px 14px;
  border-radius: var(--radius-md);
  background: var(--primary-50);
  border: 1px solid var(--primary-100);
  transition: border-color 0.2s var(--ease);
}

.balance-chip:hover {
  border-color: var(--primary-500);
}

.balance-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.balance-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary-700);
}

.profile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-pill);
  background: var(--brand-gradient);
  color: var(--neutral-0);
  font-size: 13px;
  font-weight: 700;
}

.profile-name {
  font-size: 14px;
  font-weight: 600;
}

.menu-toggle {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 44px;
  height: 44px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
}

.menu-bar {
  display: block;
  height: 2px;
  border-radius: 2px;
  background: var(--text);
}

.nav-mobile {
  border-top: 1px solid var(--border);
  background: var(--surface);
}

.nav-mobile-list {
  display: grid;
  gap: 4px;
  padding-top: 8px;
  padding-bottom: 16px;
}

.nav-mobile-list .nav-link {
  padding: 12px 16px;
}

@media (max-width: 479px) {
  .balance-chip {
    padding: 4px 10px;
  }

  .balance-value {
    font-size: 13px;
  }

  .profile {
    display: none;
  }
}

@media (min-width: 960px) {
  .nav-desktop {
    display: flex;
  }

  .menu-toggle {
    display: none;
  }

  .nav-mobile {
    display: none;
  }
}

@media (min-width: 960px) and (max-width: 1180px) {
  .profile-name {
    display: none;
  }
}
</style>
