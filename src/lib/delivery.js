export const DISTRICTS = [
  { name: 'Port Louis',          fee: 150, freeThreshold: 2000 },
  { name: 'Pamplemousses',       fee: 150, freeThreshold: 2000 },
  { name: 'Rivière du Rempart',  fee: 200, freeThreshold: 2500 },
  { name: 'Flacq',               fee: 200, freeThreshold: 2500 },
  { name: 'Grand Port',          fee: 200, freeThreshold: 2500 },
  { name: 'Savanne',             fee: 250, freeThreshold: 3000 },
  { name: 'Plaines Wilhems',     fee: 150, freeThreshold: 2000 },
  { name: 'Moka',                fee: 150, freeThreshold: 2000 },
  { name: 'Black River',         fee: 250, freeThreshold: 3000 },
]

export function getDeliveryFee(districtName, subtotal) {
  const zone = DISTRICTS.find(d => d.name === districtName)
  if (!zone) return subtotal < 1000 ? 100 : 0
  return subtotal >= zone.freeThreshold ? 0 : zone.fee
}

export function isValidMauritiusPhone(phone) {
  const cleaned = phone.replace(/[\s\-().]/g, '').replace(/^\+230/, '')
  return /^\d{8}$/.test(cleaned)
}
