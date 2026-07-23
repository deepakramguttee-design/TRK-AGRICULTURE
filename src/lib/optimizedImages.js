// Auto-généré : SKUs disposant de variantes photo optimisées (WebP + JPG,
// 800/400) partagées avec le site vitrine Kailash Farming. Sert de source
// d'images optimisées dans ProductCard (fallback : image_url Supabase).
export const OPTIMIZED_SKUS = new Set([
  'BRE-001', 'BRE-002', 'BRE-003', 'BRE-004',
  'EPI-001', 'EPI-002', 'EPI-003', 'EPI-004',
  'LEG-001', 'LEG-003', 'LEG-004', 'LEG-005', 'LEG-007', 'LEG-010',
  'LEG-011', 'LEG-013', 'LEG-016', 'LEG-017', 'LEG-018', 'LEG-019',
  'LEG-020', 'LEG-022', 'LEG-023', 'LEG-026', 'LEG-027',
  'SAL-002', 'SAL-003', 'SAL-004',
])

export function optimizedSources(sku) {
  if (!sku || !OPTIMIZED_SKUS.has(sku)) return null
  const b = `/produits/${sku}`
  return {
    webp: `${b}-400.webp 400w, ${b}-800.webp 800w`,
    jpg: `${b}-400.jpg 400w, ${b}-800.jpg 800w`,
    fallback: `${b}-800.jpg`,
  }
}
