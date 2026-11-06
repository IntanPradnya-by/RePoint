<script setup>
import { computed } from 'vue'
import BaseAlert from '../components/base/BaseAlert.vue'
import BaseBadge from '../components/base/BaseBadge.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseCard from '../components/base/BaseCard.vue'
import EmptyState from '../components/shared/EmptyState.vue'
import { claimStatusInfo, formatDateTime, formatNumber } from '../composables/useFormatters'
import { useRewardStore } from '../stores/useRewardStore'
import { useTransactionStore } from '../stores/useTransactionStore'

const { transactionsByType } = useTransactionStore()
const { findReward } = useRewardStore()

const claim = computed(() => transactionsByType('penukaran')[0] ?? null)
const reward = computed(() => (claim.value ? findReward(claim.value.refId) : null))
const statusInfo = computed(() => (claim.value ? claimStatusInfo(claim.value.claimStatus) : null))

const steps = [
  'Datang ke meja bank sampah sekolah pada jam layanan.',
  'Tunjukkan kode klaim di layar ini kepada petugas.',
  'Petugas memverifikasi kode, lalu kamu menerima reward.'
]
</script>

<template>
  <div class="container page">
    <header class="page-header">
      <h1 class="page-title">Klaim Reward</h1>
      <p class="page-subtitle">Tunjukkan kode klaim ini kepada petugas untuk menerima reward kamu.</p>
    </header>

    <EmptyState
      v-if="!claim"
      title="Belum ada klaim reward"
      description="Tukar poin kamu dengan reward untuk membuat kode klaim."
    >
      <BaseButton to="/rewards">Lihat Katalog Reward</BaseButton>
    </EmptyState>

    <div v-else class="claim-layout">
      <BaseCard class="claim-card">
        <div class="claim-reward">
          <img v-if="reward" :src="reward.imageUrl" :alt="reward.name" class="claim-image" />
          <div>
            <p class="claim-label">Reward yang ditukar</p>
            <h2 class="claim-name">{{ claim.title }}</h2>
            <p class="claim-points num">{{ formatNumber(claim.points) }} poin</p>
          </div>
        </div>

        <div class="claim-code-box">
          <p class="claim-label">Kode klaim</p>
          <p class="claim-code num">{{ claim.claimCode }}</p>
        </div>

        <div class="claim-meta">
          <div>
            <p class="claim-label">Tanggal klaim</p>
            <p>{{ formatDateTime(claim.date) }}</p>
          </div>
          <div>
            <p class="claim-label">Status klaim</p>
            <BaseBadge :tone="statusInfo.tone">{{ statusInfo.label }}</BaseBadge>
          </div>
        </div>

        <div class="claim-action">
          <BaseAlert v-if="claim.claimStatus === 'selesai'" tone="success">
            Reward sudah diterima. Terima kasih sudah menjaga lingkungan sekolah!
          </BaseAlert>
          <BaseAlert v-else-if="claim.claimStatus === 'diverifikasi'" tone="info">
            Kode sudah diverifikasi. Silakan ambil reward kamu di meja bank sampah.
          </BaseAlert>
          <p v-else class="muted claim-hint">
            Tunjukkan kode ini kepada petugas. Petugas akan memverifikasi kode dan menandai reward kamu.
          </p>
        </div>
      </BaseCard>

      <BaseCard>
        <h2 class="section-title">Cara menerima reward</h2>
        <ol class="steps">
          <li v-for="step in steps" :key="step">{{ step }}</li>
        </ol>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.claim-layout {
  display: grid;
  gap: var(--space-3);
}

@media (min-width: 900px) {
  .claim-layout {
    grid-template-columns: 1.4fr 1fr;
    align-items: start;
  }
}

.claim-card {
  display: grid;
  gap: var(--space-3);
}

.claim-reward {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.claim-image {
  width: 88px;
  height: 88px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.claim-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}

.claim-name {
  margin-top: 6px;
  font-size: 22px;
}

.claim-points {
  margin-top: 6px;
  color: var(--primary-700);
  font-weight: 600;
}

.claim-code-box {
  padding: var(--space-4);
  text-align: center;
  background: var(--primary-50);
  border: 2px dashed var(--primary-300);
  border-radius: var(--radius-md);
}

.claim-code {
  margin-top: var(--space-1);
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--primary-700);
}

.claim-meta {
  display: grid;
  gap: var(--space-2);
  grid-template-columns: 1fr 1fr;
}

.claim-meta > div {
  display: grid;
  gap: 6px;
  justify-items: start;
}

.claim-hint {
  margin-top: var(--space-1);
  font-size: 13px;
}

.steps {
  display: grid;
  gap: var(--space-2);
  margin: var(--space-2) 0 0;
  padding-left: 20px;
  color: var(--text);
}
</style>
