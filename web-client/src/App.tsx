import { TypeOfLogin } from 'kukai-embed';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import './App.css';
import { PROVIDERS } from './types/constants';
import { BEACON, KUKAI_EMBED } from './utils/wallet-connectors';
import { initWalletConnectors } from './utils/wallet-utils';

const REDIRECT_DEEPLINK = 'unitydl://'

const LOGIN_CONFIG = {
  loginOptions: [TypeOfLogin.Google, TypeOfLogin.Facebook, TypeOfLogin.Twitter],
  wideButtons: [true, true, true]
}

enum STATUS {
  LOADING,
  READY,
}

enum PARAM_TYPES {
  OPERATION_PAYLOAD = 'operationPayload'
}

function makeDeeplinkWithAddress(address: string) {
  return `${REDIRECT_DEEPLINK}kukai-embed/?address=${address}`
}

function App() {
  const [error, setError] = useState('')
  const [status, setStatus] = useState(STATUS.LOADING)
  const [, setAccount] = useState<{ provider: PROVIDERS, address: string } | undefined>(undefined)
  const operationQueue = useRef<any[]>([])

  async function handleOperation(payload: any[], provider: PROVIDERS) {
    try {
      provider === PROVIDERS.BEACON
        ? await BEACON.requestOperation({ operationDetails: payload })
        : await KUKAI_EMBED.send(payload)
    } catch {
      console.log('error::operation')
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(decodeURIComponent(window.location.search))

    const operationPayload = params.get(PARAM_TYPES.OPERATION_PAYLOAD)

    if (operationPayload) {
      operationQueue.current.push({ payload: JSON.parse(operationPayload) })
    }

    initWalletConnectors()
      .then(({ activeAddress, provider }) => {
        if (activeAddress) {
          setAccount({ address: activeAddress, provider: provider! })

          if (operationQueue.current.length) {
            const { payload } = operationQueue.current.pop()
            handleOperation(payload, provider!)
              .then(() => {
                window.location.href = makeDeeplinkWithAddress(activeAddress)
              })
              .catch((error) => setError(error?.message))
          }
        }
      })
      .catch((error) => {
        setError(error?.message)
      })
      .finally(() => {
        setStatus(STATUS.READY)
      })

    return () => {
      // handle logout
    }
  }, [])

  async function handleLogin(event: MouseEvent<HTMLButtonElement>) {
    const { type } = event.currentTarget.dataset
    let address: string | undefined, provider: PROVIDERS | undefined

    if (type === PROVIDERS.BEACON) {
      const account = await BEACON.requestPermissions()
      address = account.address
      provider = PROVIDERS.BEACON
    } else {
      const account = await KUKAI_EMBED.login(LOGIN_CONFIG)
      address = account.pkh
      provider = PROVIDERS.KUKAI_EMBED
    }

    setAccount({ address, provider })

    if (operationQueue.current.length) {
      const { payload } = operationQueue.current.pop()
      handleOperation(payload, provider)
        .then(() => {
          window.location.href = makeDeeplinkWithAddress(address!)
        })
        .catch((error) => setError(error?.message))
    } else {
      window.location.href = makeDeeplinkWithAddress(address!)
    }
  }

  const isLoading = status === STATUS.LOADING

  return (
    <div className="parent">
      <div>{isLoading ? "Loading..." : "Choose Wallet"}</div>
      <div className="wallet-connectors">
        <button disabled={isLoading} data-type={PROVIDERS.BEACON} onClick={handleLogin}>Login with Beacon</button>
        <button disabled={isLoading} data-type={PROVIDERS.KUKAI_EMBED} onClick={handleLogin}>Login with Kukai Embed</button>
      </div>
      {error && <div className='error'>Status: {error}</div>}
    </div>
  );
}

export default App;
