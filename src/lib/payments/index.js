import { JuiceManualProvider } from './JuiceManualProvider'

const PROVIDERS = {
  juice: JuiceManualProvider,
  // juice_peach: PeachJuiceProvider,   // V2
  // mips:        MipsProvider,         // V2
}

export function getProvider(method) {
  return PROVIDERS[method] ?? null
}

export { JuiceManualProvider }
