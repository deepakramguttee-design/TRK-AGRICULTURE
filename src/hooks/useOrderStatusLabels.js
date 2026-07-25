import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Ordre du cycle de vie — les statuts sont du code, les libellés sont des
// données (table order_status_labels, lecture publique).
export const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'prepared', 'shipped', 'delivered']
export const MAX_STEP = 5

// Cache module : la table est petite et stable, on ne la charge qu'une fois
// par session quel que soit le nombre de composants consommateurs.
let cachedRows = null
let pendingLoad = null

function loadLabels() {
  if (cachedRows) return Promise.resolve(cachedRows)
  if (!pendingLoad) {
    pendingLoad = supabase
      .from('order_status_labels')
      .select('status, fulfillment_type, lang, step, label')
      .then(({ data, error }) => {
        if (error) {
          pendingLoad = null
          throw error
        }
        cachedRows = data ?? []
        return cachedRows
      })
  }
  return pendingLoad
}

function findRow(rows, status, fulfillmentType, lang) {
  const ft = fulfillmentType || 'delivery'
  return (
    rows.find(r => r.status === status && r.fulfillment_type === ft && r.lang === lang) ||
    // Repli automatique sur le français (aligné sur order_status_label() côté SQL)
    rows.find(r => r.status === status && r.fulfillment_type === ft && r.lang === 'fr') ||
    null
  )
}

/**
 * Libellés de statut de commande, chargés depuis order_status_labels.
 * Le libellé dépend du mode (pickup/delivery) et de la langue active,
 * avec repli sur le français si la langue n'est pas couverte (ex. kreol).
 */
export function useOrderStatusLabels() {
  const [rows, setRows] = useState(cachedRows ?? [])
  const [ready, setReady] = useState(!!cachedRows)

  useEffect(() => {
    let mounted = true
    loadLabels()
      .then(data => { if (mounted) { setRows(data); setReady(true) } })
      .catch(() => { if (mounted) setReady(true) })
    return () => { mounted = false }
  }, [])

  function getLabel(status, fulfillmentType, lang) {
    const row = findRow(rows, status, fulfillmentType, lang)
    return row?.label ?? status
  }

  function getStep(status, fulfillmentType) {
    const row = findRow(rows, status, fulfillmentType, 'fr')
    return row?.step ?? null
  }

  // Libellé affiché sur la barre pour une étape donnée : celui du statut
  // courant si l'étape correspond (utile à l'étape 4 en livraison où
  // prepared et shipped partagent l'étape), sinon le premier statut du cycle
  // atteignant cette étape.
  function getStepLabel(step, currentStatus, fulfillmentType, lang) {
    const currentStep = getStep(currentStatus, fulfillmentType)
    if (currentStep === step) return getLabel(currentStatus, fulfillmentType, lang)
    const status = STATUS_ORDER.find(s => getStep(s, fulfillmentType) === step)
    return status ? getLabel(status, fulfillmentType, lang) : ''
  }

  return { ready, getLabel, getStep, getStepLabel }
}
