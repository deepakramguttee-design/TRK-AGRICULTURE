export const JuiceManualProvider = {
  id: 'juice',
  beneficiaryNumber: '57745306',
  beneficiaryName: 'TRK Agriculture Limited',

  buildOrderPayload() {
    return {
      payment_method: 'juice',
      payment_provider: 'manual',
      payment_status: 'pending',
    }
  },

  markPaidPayload() {
    return {
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
    }
  },
}
