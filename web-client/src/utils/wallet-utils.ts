import { BEACON, KUKAI_EMBED } from "./wallet-connectors"

export async function initWalletConnectors() {
    await KUKAI_EMBED.init()

    let activeAddress: string | undefined

    const activeKukaiEmbedUser = KUKAI_EMBED.user

    if (!!activeKukaiEmbedUser) {
        activeAddress = activeKukaiEmbedUser.pkh
    } else {
        const activeAccount = await BEACON.getActiveAccount()
        if (activeAccount?.address) {
            activeAddress = activeAccount.address
        }
    }

    return activeAddress
}