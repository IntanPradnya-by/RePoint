<script setup>
import { computed } from 'vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseCard from '../components/base/BaseCard.vue'
import BaseBadge from '../components/base/BaseBadge.vue'
import TransactionList from '../components/shared/TransactionList.vue'
import {
  claimStatusInfo,
  formatDateTime,
  formatNumber
} from '../composables/useFormatters'
import { items } from '../data/items'
import { usePointsStore } from '../stores/usePointsStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useRewardStore } from '../stores/useRewardStore'
import { useTransactionStore } from '../stores/useTransactionStore'

const { userName } = useAuthStore()
const { balance, totalEarned, totalSpent, totalWasteKg } = usePointsStore()
const { rewards } = useRewardStore()
const { transactions, transactionsByType } = useTransactionStore()

const pendingCount = computed(
  () => transactions.value.filter((t) => t.type === 'setoran' && t.status === 'menunggu').length
)
const popularRewards = computed(() => rewards.value.slice(0, 3))
const popularItems = items.filter((item) => item.points !== null).slice(0, 3)
const recentTransactions = computed(() => transactions.value.slice(0, 4))
const redemptions = computed(() => transactionsByType('penukaran'))
const activeClaim = computed(() =>
  transactions.value.find((transaction) => transaction.type === 'penukaran' && transaction.claimStatus !== 'selesai')
)
</script>

<template>
  <div class="container page">
    <section class="hero">
      <div class="hero-orbs" aria-hidden="true">
        <span class="orb orb--blue" />
        <span class="orb orb--green" />
        <span class="orb orb--yellow" />
      </div>
      <div class="hero-content">
        <p class="hero-greeting">Selamat datang kembali, {{ userName }}</p>
        <h1 class="hero-title">Setiap sampah yang kamu pilah menjadi poin.</h1>
        <p class="hero-tagline">Recycle Today, Reward Tomorrow.</p>
        <div class="hero-actions">
          <BaseButton to="/waste">Lihat Katalog Sampah</BaseButton>
          <BaseButton to="/rewards" variant="ghost">Tukar Reward</BaseButton>
        </div>
      </div>
    </section>

    <section class="stats grid grid--4">
      <BaseCard hoverable>
        <p class="stat-label">Saldo poin</p>
        <p class="stat-value num">{{ formatNumber(balance) }} <span>poin</span></p>
      </BaseCard>
      <BaseCard hoverable>
        <p class="stat-label">Total diperoleh</p>
        <p class="stat-value num stat-plus">{{ formatNumber(totalEarned) }}</p>
      </BaseCard>
      <BaseCard hoverable>
        <p class="stat-label">Total digunakan</p>
        <p class="stat-value num stat-minus">{{ formatNumber(totalSpent) }}</p>
      </BaseCard>
      <BaseCard hoverable>
        <p class="stat-label">Sampah terkumpul</p>
        <p class="stat-value num">{{ formatNumber(totalWasteKg) }} <span>kg</span></p>
      </BaseCard>
    </section>

    <section v-if="pendingCount > 0" class="pending-hero">
      <div class="pending-hero-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 6a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm1 9h-2v-5h2v5z" fill="currentColor"/></svg>
      </div>
      <div class="pending-hero-text">
        <p class="pending-hero-title">Kamu punya {{ pendingCount }} setoran menunggu persetujuan</p>
        <p class="muted">Poin akan masuk ke dompet setelah petugas memvalidasi setoran kamu.</p>
      </div>
      <BaseButton to="/history" size="sm" variant="secondary">Lihat Riwayat</BaseButton>
    </section>

    <section v-if="activeClaim" class="claim-banner">
      <div>
        <p class="claim-banner-title">Klaim reward kamu: {{ activeClaim.title }}</p>
        <p class="muted">Tunjukkan kode klaim kepada petugas untuk menerima reward.</p>
      </div>
      <BaseBadge :tone="claimStatusInfo(activeClaim.claimStatus).tone">
        {{ claimStatusInfo(activeClaim.claimStatus).label }}
      </BaseBadge>
      <BaseButton to="/claim" size="sm" variant="secondary">Lihat Klaim</BaseButton>
    </section>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Reward populer</h2>
        <BaseButton to="/rewards" variant="ghost" size="sm">Semua reward</BaseButton>
      </div>
      <div class="grid grid--3">
        <RouterLink v-for="reward in popularRewards" :key="reward.id" to="/rewards" class="mini-card">
          <img :src="reward.imageUrl" :alt="reward.name" loading="lazy" />
          <div class="mini-body">
            <p class="mini-title">{{ reward.name }}</p>
            <p class="mini-meta num">{{ formatNumber(reward.price) }} poin | Stok {{ reward.stock }}</p>
          </div>
        </RouterLink>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Katalog sampah populer</h2>
        <BaseButton to="/waste" variant="ghost" size="sm">Semua sampah</BaseButton>
      </div>
      <div class="grid grid--3">
        <RouterLink v-for="item in popularItems" :key="item.id" to="/waste" class="mini-card">
          <img :src="item.imageUrl" :alt="item.title" loading="lazy" />
          <div class="mini-body">
            <p class="mini-title">{{ item.title }}</p>
            <p class="mini-meta num">{{ formatNumber(item.points) }} poin per {{ item.unit }}</p>
          </div>
        </RouterLink>
      </div>
    </section>

    <section v-if="redemptions.length > 0" class="section">
      <div class="section-head">
        <h2 class="section-title">Riwayat penukaran reward</h2>
        <BaseButton to="/history" variant="ghost" size="sm">Lihat semua</BaseButton>
      </div>
      <ul class="redeem-list">
        <li v-for="redemption in redemptions" :key="redemption.id" class="redeem-row">
          <div class="redeem-main">
            <h3 class="redeem-title">{{ redemption.title }}</h3>
            <p class="redeem-date">{{ formatDateTime(redemption.date) }}</p>
          </div>
          <div class="redeem-meta">
            <span class="redeem-points num">-{{ formatNumber(redemption.points) }} poin</span>
            <BaseBadge :tone="claimStatusInfo(redemption.claimStatus).tone">
              {{ claimStatusInfo(redemption.claimStatus).label }}
            </BaseBadge>
          </div>
        </li>
      </ul>
    </section>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Riwayat transaksi terbaru</h2>
        <BaseButton to="/history" variant="ghost" size="sm">Lihat semua</BaseButton>
      </div>
      <TransactionList :transactions="recentTransactions" empty-title="Belum ada transaksi" />
    </section>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  padding: 40px 24px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 35%, #10b981 70%, #f59e0b 100%);
  background-size: 200% 200%;
  animation: gradient-shift 8s ease infinite;
  color: var(--neutral-0);
  box-shadow: var(--shadow-md);
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero-orbs {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  opacity: 0.25;
}

.orb--blue {
  width: 180px;
  height: 180px;
  top: -40px;
  right: 10%;
  background: radial-gradient(circle, #93c5fd 0%, transparent 70%);
  animation: float-orb 7s ease-in-out infinite;
}

.orb--green {
  width: 140px;
  height: 140px;
  bottom: -30px;
  left: 5%;
  background: radial-gradient(circle, #6ee7b7 0%, transparent 70%);
  animation: float-orb-reverse 6s ease-in-out infinite;
}

.orb--yellow {
  width: 100px;
  height: 100px;
  top: 40%;
  right: 30%;
  background: radial-gradient(circle, #fcd34d 0%, transparent 70%);
  animation: float-orb 9s ease-in-out infinite 1s;
  opacity: 0.2;
}

.hero-content {
  position: relative;
  z-index: 1;
  animation: fade-up 0.6s var(--ease) both;
}

.hero-greeting {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.hero-title {
  margin-top: 8px;
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  color: var(--neutral-0);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.hero-tagline {
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.hero-actions :deep(.base-button--ghost) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  color: var(--neutral-0);
  backdrop-filter: blur(4px);
}

.hero-actions :deep(.base-button--ghost:hover) {
  background: rgba(255, 255, 255, 0.25);
  color: var(--neutral-0);
}

@media (min-width: 768px) {
  .hero {
    padding: 48px 40px;
  }
}

.stats {
  margin-top: var(--space-4);
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}

.stat-value {
  margin-top: 6px;
  font-size: 26px;
  font-weight: 700;
  color: var(--primary-700);
}

.stat-plus {
  color: var(--secondary-700);
}

.stat-minus {
  color: var(--accent-700);
}

.stat-value span {
  font-size: 14px;
  color: var(--text-muted);
}

.pending-hero {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-3);
  background: var(--info-bg);
  border: 1px solid var(--primary-300);
  border-radius: var(--radius-md);
}

.pending-hero-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: var(--radius-pill);
  background: var(--primary-700);
  color: var(--neutral-0);
}

.pending-hero-icon svg {
  width: 22px;
  height: 22px;
}

.pending-hero-text {
  flex: 1;
  min-width: 200px;
}

.pending-hero-title {
  font-weight: 700;
  color: var(--info-text);
}

.claim-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-3);
  background: var(--accent-50);
  border: 1px solid var(--accent-300);
  border-radius: var(--radius-md);
}

.claim-banner > div {
  flex: 1;
  min-width: 200px;
}

.claim-banner-title {
  font-weight: 700;
}

.mini-card {
  display: block;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: transform 0.25s var(--ease), box-shadow 0.25s var(--ease);
}

.mini-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.mini-card img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.mini-body {
  padding: var(--space-2) var(--space-2) var(--space-3);
}

.mini-title {
  font-weight: 700;
}

.mini-meta {
  margin-top: 4px;
  font-size: 14px;
  color: var(--text-muted);
}

.redeem-list {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.redeem-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-3);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: border-color 0.2s var(--ease), box-shadow 0.2s var(--ease);
}

.redeem-row:hover {
  border-color: var(--primary-300);
  box-shadow: var(--shadow-md);
}

.redeem-main {
  display: grid;
  gap: 6px;
}

.redeem-title {
  font-size: 16px;
}

.redeem-date {
  font-size: 13px;
  color: var(--text-muted);
}

.redeem-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.redeem-points {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-700);
}
</style>
