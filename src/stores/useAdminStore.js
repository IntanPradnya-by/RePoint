import { supabase } from '../lib/supabase'
import { toTransaction } from './useTransactionStore'

export function useAdminStore() {
  async function fetchTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map(toTransaction)
  }

  async function callAdminAction(fn, id) {
    const { error } = await supabase.rpc(fn, { p_id: id })
    if (error) throw error
  }

  async function batchApproveDeposits(ids) {
    const { data, error } = await supabase.rpc('batch_approve_deposits', { p_ids: ids })
    if (error) throw error
    return data
  }

  return {
    fetchTransactions,
    approveDeposit: (id) => callAdminAction('approve_deposit', id),
    rejectDeposit: (id) => callAdminAction('reject_deposit', id),
    verifyClaim: (id) => callAdminAction('verify_claim', id),
    completeClaim: (id) => callAdminAction('complete_claim', id),
    batchApproveDeposits
  }
}
