import { JuiceManualProvider } from './JuiceManualProvider'
import { MipsProvider } from './MipsProvider'

const PROVIDERS = {
  juice:     JuiceManualProvider,
  mips_card: MipsProvider,
}

export function getProvider(method) {
  return PROVIDERS[method] ?? null
}

export { JuiceManualProvider, MipsProvider }
