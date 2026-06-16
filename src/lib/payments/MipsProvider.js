const MERCHANT_ID = import.meta.env.VITE_MIPS_MERCHANT_ID ?? ''
const GATEWAY_URL = import.meta.env.VITE_MIPS_GATEWAY_URL ?? ''

export const MipsProvider = {
  id: 'mips_card',

  get isAvailable() {
    return Boolean(MERCHANT_ID && MERCHANT_ID !== 'pending' && GATEWAY_URL)
  },

  buildOrderPayload() {
    return {
      payment_method: 'mips_card',
      payment_provider: 'mips',
      payment_status: 'pending',
    }
  },

  redirectToGateway(orderNumber, amountMur) {
    const origin = window.location.origin
    const fields = {
      merchant_id:  MERCHANT_ID,
      order_id:     orderNumber,
      amount:       Number(amountMur).toFixed(2),
      currency:     'MUR',
      return_url:   `${origin}/commande/retour-mips`,
      cancel_url:   `${origin}/commande`,
      description:  `TRK Agriculture — ${orderNumber}`,
    }

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = GATEWAY_URL
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input')
      input.type  = 'hidden'
      input.name  = name
      input.value = value
      form.appendChild(input)
    })
    document.body.appendChild(form)
    form.submit()
  },
}
