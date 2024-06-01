import { PROVIDERS } from "../types/constants"
import { BEACON, KUKAI_EMBED } from "./wallet-connectors"

export async function initWalletConnectors() {
    await KUKAI_EMBED.init()

    let activeAddress: string | undefined
    let provider: PROVIDERS | undefined

    const activeKukaiEmbedUser = KUKAI_EMBED.user

    if (!!activeKukaiEmbedUser) {
        activeAddress = activeKukaiEmbedUser.pkh
        provider = PROVIDERS.KUKAI_EMBED
    } else {
        const activeAccount = await BEACON.getActiveAccount()
        if (activeAccount?.address) {
            activeAddress = activeAccount.address
            provider = PROVIDERS.BEACON
        }
    }

    return { activeAddress, provider }
}