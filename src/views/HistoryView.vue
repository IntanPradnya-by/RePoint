<script setup>
import { computed, ref } from 'vue'
import BaseAlert from '../components/base/BaseAlert.vue'
import TransactionList from '../components/shared/TransactionList.vue'
import { useTransactionStore } from '../stores/useTransactionStore'

const filters = [
  { value: 'semua', label: 'Semua' },
  { value: 'setoran', label: 'Setoran sampah' },
  { value: 'penambahan', label: 'Penambahan poin' },
  { value: 'penukaran', label: 'Penukaran reward' }
]

const activeFilter = ref('semua')
const { transactions, transactionsByType } = useTransactionStore()

const filteredTransactions = computed(() =>
  activeFilter.value === 'semua' ? transactions.value : transactionsByType(activeFilter.value)
)

const pendingCount = computed(
  () => transactions.value.filter((t) => t.status === 'menunggu').length
)
</script>

<template>
  <div class="container page">
    <header class="page-header">
      <h1 class="page-title">Riwayat Transaksi</h1>
      <p class="page-subtitle">
        Seluruh setoran, penambahan poin, dan penukaran reward kamu tercatat di sini. Status setoran berubah
        setelah petugas menyetujui atau menolaknya.
      </p>
    </header>

    <BaseAlert v-if="pendingCount > 0" tone="info" class="pending-banner">
      <div class="pending-row">
        <span>
          Kamu punya <strong class="num">{{ pendingCount }}</strong> setoran yang masih menunggu persetujuan
          petugas. Poin akan bertambah setelah disetujui.
        </span>
      </div>
    </BaseAlert>

    <div class="chip-row filter-row" role="group" aria-label="Filter jenis transaksi">
      <button
        v-for="filter in filters"
        :key="filter.value"
        type="button"
        class="chip"
        :aria-pressed="activeFilter === filter.value"
        @click="activeFilter = filter.value"
      >
        {{ filter.label }}
      </button>
    </div>

    <TransactionList
      :transactions="filteredTransactions"
      empty-title="Tidak ada transaksi"
      empty-description="Belum ada transaksi untuk filter ini."
    />
  </div>
</template>

<style scoped>
.pending-banner {
  margin-bottom: 16px;
}

.pending-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-row {
  margin-bottom: 24px;
}
</style>
