import { DAppClient, NetworkType } from "@airgap/beacon-sdk"
import { KukaiEmbed } from "kukai-embed"

export const KUKAI_EMBED = new KukaiEmbed({ net: "https://ghostnet.kukai.app", icon: false })

export const BEACON = new DAppClient({ name: 'My Sample DApp', network: { type: NetworkType.GHOSTNET } })
