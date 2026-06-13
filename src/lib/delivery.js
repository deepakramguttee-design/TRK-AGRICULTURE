export const FREE_DELIVERY_THRESHOLD = 3500

export const DISTRICTS = [
  { name: 'Port Louis',          fee: 150 },
  { name: 'Pamplemousses',       fee: 150 },
  { name: 'Rivière du Rempart',  fee: 200 },
  { name: 'Flacq',               fee: 200 },
  { name: 'Grand Port',          fee: 200 },
  { name: 'Savanne',             fee: 250 },
  { name: 'Plaines Wilhems',     fee: 150 },
  { name: 'Moka',                fee: 150 },
  { name: 'Black River',         fee: 250 },
]

export function getDeliveryFee(districtName, subtotal) {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0
  const zone = DISTRICTS.find(d => d.name === districtName)
  if (!zone) return 0
  return zone.fee
}

export function isValidMauritiusPhone(phone) {
  const cleaned = phone.replace(/[\s\-().]/g, '').replace(/^\+230/, '')
  return /^\d{8}$/.test(cleaned)
}
