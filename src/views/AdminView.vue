<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseAlert from '../components/base/BaseAlert.vue'
import BaseBadge from '../components/base/BaseBadge.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseCard from '../components/base/BaseCard.vue'
import TransactionList from '../components/shared/TransactionList.vue'
import { formatNumber } from '../composables/useFormatters'
import { items } from '../data/items'
import { useAdminStore } from '../stores/useAdminStore'

const filters = [
  { value: 'menunggu', label: 'Perlu tindakan' },
  { value: 'setoran', label: 'Setoran' },
  { value: 'penukaran', label: 'Klaim reward' },
  { value: 'semua', label: 'Semua transaksi' }
]

const itemPointsMap = Object.fromEntries(items.map((item) => [item.id, item.points]))

const admin = useAdminStore()
const activeFilter = ref('menunggu')
const allTransactions = ref([])
const loading = ref(true)
const loadError = ref(false)
const actionError = ref('')
const busyId = ref(null)
const batchLoading = ref(false)
const batchResult = ref(null)

const pendingDeposits = computed(
  () => allTransactions.value.filter((t) => t.type === 'setoran' && t.status === 'menunggu')
)
const pendingClaims = computed(
  () => allTransactions.value.filter((t) => t.type === 'penukaran' && t.claimStatus !== 'selesai')
)
const totalProcessed = computed(
  () => allTransactions.value.filter((t) => t.status === 'berhasil').length
)

function estimatedPoints(transaction) {
  if (transaction.type !== 'setoran' || transaction.weight === null) return null
  const pointsPerKg = itemPointsMap[transaction.refId]
  if (pointsPerKg === undefined || pointsPerKg === null) return null
  return Math.round(pointsPerKg * transaction.weight)
}

function prioritySort(list) {
  return [...list].sort((a, b) => {
    const aUrgent = needsAttention(a) ? 0 : 1
    const bUrgent = needsAttention(b) ? 0 : 1
    if (aUrgent !== bUrgent) return aUrgent - bUrgent
    return Date.parse(b.date) - Date.parse(a.date)
  })
}

const visibleTransactions = computed(() => {
  let result
  if (activeFilter.value === 'semua') result = allTransactions.value
  else if (activeFilter.value === 'menunggu') result = allTransactions.value.filter(needsAttention)
  else if (activeFilter.value === 'setoran') result = allTransactions.value.filter((t) => t.type === 'setoran')
  else if (activeFilter.value === 'penukaran') result = allTransactions.value.filter((t) => t.type === 'penukaran')
  else result = allTransactions.value
  return prioritySort(result)
})

function needsAttention(transaction) {
  if (transaction.type === 'setoran') return transaction.status === 'menunggu'
  if (transaction.type === 'penukaran') return ['menunggu', 'diverifikasi'].includes(transaction.claimStatus)
  return false
}

async function loadTransactions() {
  loading.value = true
  loadError.value = false
  batchResult.value = null
  try {
    allTransactions.value = await admin.fetchTransactions()
  } catch (cause) {
    console.error('admin transactions load failed', cause)
    loadError.value = true
  } finally {
    loading.value = false
  }
}

async function runAction(transaction, action) {
  busyId.value = transaction.id
  actionError.value = ''
  try {
    await action(transaction.id)
    await loadTransactions()
  } catch (cause) {
    console.error('admin action failed', cause)
    actionError.value = 'Tindakan belum berhasil. Muat ulang halaman lalu coba lagi.'
  } finally {
    busyId.value = null
  }
}

async function handleBatchApprove() {
  if (pendingDeposits.value.length === 0) return
  batchLoading.value = true
  actionError.value = ''
  batchResult.value = null
  try {
    const ids = pendingDeposits.value.map((t) => t.id)
    const count = await admin.batchApproveDeposits(ids)
    batchResult.value = count
    await loadTransactions()
  } catch (cause) {
    console.error('batch approve failed', cause)
    actionError.value = 'Persetujuan massal belum berhasil. Muat ulang halaman lalu coba lagi.'
  } finally {
    batchLoading.value = false
  }
}

const approve = (transaction) => runAction(transaction, admin.approveDeposit)
const reject = (transaction) => runAction(transaction, admin.rejectDeposit)
const verify = (transaction) => runAction(transaction, admin.verifyClaim)
const complete = (transaction) => runAction(transaction, admin.completeClaim)

onMounted(loadTransactions)
</script>

<template>
  <div class="container page">
    <header class="page-header">
      <h1 class="page-title">Persetujuan Transaksi</h1>
      <p class="page-subtitle">
        Periksa setoran sampah siswa, lalu setujui atau tolak. Poin hanya bertambah setelah setoran disetujui.
      </p>
    </header>

    <section class="summary-grid">
      <BaseCard class="summary-card summary-card--pending">
        <div class="summary-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 6a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm1 9h-2v-5h2v5z" fill="currentColor"/></svg>
        </div>
        <div>
          <p class="summary-value num">{{ pendingDeposits.length }}</p>
          <p class="summary-label">Setoran menunggu validasi</p>
        </div>
      </BaseCard>
      <BaseCard class="summary-card summary-card--claim">
        <div class="summary-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5 1.4-1.4L9 14.2 18.6 4.6 20 6z" fill="currentColor"/></svg>
        </div>
        <div>
          <p class="summary-value num">{{ pendingClaims.length }}</p>
          <p class="summary-label">Klaim reward menunggu</p>
        </div>
      </BaseCard>
      <BaseCard class="summary-card summary-card--done">
        <div class="summary-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6 4.8 2.3 7.4L12 17l-6.3 4.6L8 14.2 2 9.4h7.6L12 2z" fill="currentColor"/></svg>
        </div>
        <div>
          <p class="summary-value num">{{ totalProcessed }}</p>
          <p class="summary-label">Transaksi selesai</p>
        </div>
      </BaseCard>
    </section>

    <section v-if="pendingDeposits.length > 0" class="batch-bar">
      <div class="batch-info">
        <p class="batch-title">Persetujuan massal</p>
        <p class="muted">
          Setujui semua <strong class="num">{{ pendingDeposits.length }}</strong> setoran yang menunggu sekaligus
          agar siswa tidak perlu menunggu berhari-hari.
        </p>
      </div>
      <BaseButton :disabled="batchLoading" @click="handleBatchApprove">
        {{ batchLoading ? 'Memproses...' : 'Setujui Semua Setoran' }}
      </BaseButton>
    </section>

    <BaseAlert v-if="batchResult !== null" tone="success" class="action-alert">
      <strong class="num">{{ batchResult }}</strong> setoran berhasil disetujui. Poin sudah masuk ke dompet siswa.
    </BaseAlert>

    <div class="chip-row filter-row" role="group" aria-label="Filter transaksi">
      <button
        v-for="filter in filters"
        :key="filter.value"
        type="button"
        class="chip"
        :aria-pressed="activeFilter === filter.value"
        @click="activeFilter = filter.value"
      >
        {{ filter.label }}
        <span v-if="filter.value === 'menunggu' && pendingDeposits.length + pendingClaims.length > 0" class="chip-badge num">
          {{ pendingDeposits.length + pendingClaims.length }}
        </span>
      </button>
    </div>

    <BaseAlert v-if="actionError" tone="danger" class="action-alert">{{ actionError }}</BaseAlert>

    <BaseAlert v-if="loadError" tone="danger">
      <div class="retry-row">
        <span>Daftar transaksi belum dapat dimuat.</span>
        <BaseButton variant="ghost" size="sm" @click="loadTransactions">Coba lagi</BaseButton>
      </div>
    </BaseAlert>

    <p v-else-if="loading" class="muted loading-text">Memuat transaksi...</p>

    <TransactionList
      v-else
      :transactions="visibleTransactions"
      empty-title="Tidak ada yang perlu ditindak"
      empty-description="Semua setoran dan klaim reward sudah diproses."
    >
      <template #actions="{ transaction }">
        <div class="action-info">
          <p class="student-line">Siswa: <strong>{{ transaction.studentName ?? 'Tidak diketahui' }}</strong></p>
          <p v-if="transaction.type === 'setoran' && transaction.weight !== null" class="student-line">
            Berat setoran: <span class="num">{{ formatNumber(transaction.weight) }} kg</span>
          </p>
          <p
            v-if="transaction.type === 'setoran' && transaction.status === 'menunggu' && estimatedPoints(transaction) !== null"
            class="student-line est-points"
          >
            Perkiraan poin: <span class="num">+{{ formatNumber(estimatedPoints(transaction)) }} poin</span>
          </p>
          <p v-if="transaction.type === 'penukaran'" class="student-line">
            Kode klaim: <span class="num claim-code">{{ transaction.claimCode }}</span>
          </p>
        </div>

        <div class="action-buttons">
          <template v-if="transaction.type === 'setoran' && transaction.status === 'menunggu'">
            <BaseButton size="sm" :disabled="busyId === transaction.id" @click="approve(transaction)">
              Setujui
            </BaseButton>
            <BaseButton
              variant="danger"
              size="sm"
              :disabled="busyId === transaction.id"
              @click="reject(transaction)"
            >
              Tolak
            </BaseButton>
          </template>

          <template v-if="transaction.type === 'penukaran'">
            <BaseButton
              v-if="transaction.claimStatus === 'menunggu'"
              variant="secondary"
              size="sm"
              :disabled="busyId === transaction.id"
              @click="verify(transaction)"
            >
              Verifikasi Kode
            </BaseButton>
            <BaseButton
              v-else-if="transaction.claimStatus === 'diverifikasi'"
              size="sm"
              :disabled="busyId === transaction.id"
              @click="complete(transaction)"
            >
              Tandai Reward Diterima
            </BaseButton>
            <BaseBadge v-else tone="info">Klaim selesai</BaseBadge>
          </template>
        </div>
      </template>
    </TransactionList>
  </div>
</template>

<style scoped>
.summary-grid {
  display: grid;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .summary-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.summary-card {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.summary-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
}

.summary-icon svg {
  width: 28px;
  height: 28px;
}

.summary-card--pending .summary-icon {
  background: var(--warning-bg);
  color: var(--warning-text);
}

.summary-card--claim .summary-icon {
  background: var(--info-bg);
  color: var(--info-text);
}

.summary-card--done .summary-icon {
  background: var(--success-bg);
  color: var(--success-text);
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
}

.summary-label {
  font-size: 13px;
  color: var(--text-muted);
}

.batch-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--primary-50);
  border: 1px solid var(--primary-100);
  border-radius: var(--radius-lg);
}

.batch-info {
  flex: 1;
  min-width: 240px;
}

.batch-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-700);
}

.batch-bar .muted {
  margin-top: 4px;
  font-size: 14px;
}

.filter-row {
  margin-bottom: var(--space-3);
}

.chip-badge {
  display: inline-grid;
  place-items: center;
  margin-left: 6px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--radius-pill);
  background: var(--accent-500);
  color: var(--neutral-0);
  font-size: 12px;
}

.chip[aria-pressed='true'] .chip-badge {
  background: var(--neutral-0);
  color: var(--brand);
}

.action-alert {
  margin-bottom: var(--space-2);
}

.retry-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.loading-text {
  padding: var(--space-4) 0;
  text-align: center;
}

.action-info {
  display: grid;
  gap: 6px;
  width: 100%;
}

.student-line {
  font-size: 14px;
  color: var(--text-muted);
}

.student-line strong {
  color: var(--text);
}

.est-points {
  color: var(--secondary-700);
  font-weight: 600;
}

.claim-code {
  font-weight: 700;
  color: var(--primary-700);
  letter-spacing: 0.04em;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  align-items: center;
}
</style>
