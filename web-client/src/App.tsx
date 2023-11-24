import { TypeOfLogin } from 'kukai-embed';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import './App.css';
import { PROVIDERS } from './types/constants';
import { BEACON, KUKAI_EMBED } from './utils/wallet-connectors';
import { initWalletConnectors } from './utils/wallet-utils';

const REDIRECT_DEEPLINK = 'unitydl://'
const INCOMPATIBLE_ADDRESS = 'The operation is not associated with this wallet. Please try again.'

const LOGIN_CONFIG = {
  loginOptions: [TypeOfLogin.Google, TypeOfLogin.Facebook, TypeOfLogin.Twitter],
  wideButtons: [true, true, true]
}

enum STATUS {
  LOADING,
  READY,
}

enum PARAM_TYPES {
  OPERATION_PAYLOAD = 'operationPayload',
  ADDRESS = 'address',
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
    } catch (error) {
      console.warn('error::', error)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(decodeURIComponent(window.location.search))

    const operationPayload = params.get(PARAM_TYPES.OPERATION_PAYLOAD)

    if (operationPayload) {
      const address = params.get(PARAM_TYPES.ADDRESS)
      operationQueue.current.push({ payload: JSON.parse(operationPayload), address })
    }

    initWalletConnectors()
      .then(({ activeAddress, provider }) => {
        if (activeAddress) {
          setAccount({ address: activeAddress, provider: provider! })

          if (operationQueue.current.length) {
            const { payload, address } = operationQueue.current.pop()

            if (address !== activeAddress) {
              handleWrongAddress(provider!)
              return
            }

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

  async function handleWrongAddress(provider: PROVIDERS) {
    setError(INCOMPATIBLE_ADDRESS)
    provider === PROVIDERS.BEACON ? await BEACON.removeAllAccounts() : await KUKAI_EMBED.logout()
  }

  async function handleLogin(event: MouseEvent<HTMLButtonElement>) {
    try {

      const { type } = event.currentTarget.dataset
      let activeAddress: string | undefined, provider: PROVIDERS | undefined

      if (type === PROVIDERS.BEACON) {
        const account = await BEACON.requestPermissions()
        activeAddress = account.address
        provider = PROVIDERS.BEACON
      } else {
        const account = await KUKAI_EMBED.login(LOGIN_CONFIG)
        activeAddress = account.pkh
        provider = PROVIDERS.KUKAI_EMBED
      }

      setAccount({ address: activeAddress, provider })

      if (operationQueue.current.length) {
        const { payload, address } = operationQueue.current.pop()

        if (activeAddress !== address) {
          handleWrongAddress(provider)
          return
        }

        handleOperation(payload, provider)
          .then(() => {
            window.location.href = makeDeeplinkWithAddress(address!)
          })
          .catch((error) => setError(error?.message))
      } else {
        window.location.href = makeDeeplinkWithAddress(activeAddress!)
      }
    } catch (error) {
      console.warn(error)
      return
    }
  }

  const isLoading = status === STATUS.LOADING

  return (
    <div className="parent">
      <h1>{isLoading ? "Loading..." : "Choose Wallet"}</h1>
      <div className="wallet-connectors">
        <button disabled={isLoading} data-type={PROVIDERS.BEACON} onClick={handleLogin}>Login with Beacon</button>
        <button disabled={isLoading} data-type={PROVIDERS.KUKAI_EMBED} onClick={handleLogin}>Login with Kukai Embed</button>
      </div>
      {error && <div className='error'>⚠ {error}</div>}
    </div>
  );
}

export default App;
