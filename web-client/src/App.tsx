import { TypeOfLogin } from 'kukai-embed';
import { MouseEvent, useEffect, useState } from 'react';
import './App.css';
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

enum PROVIDERS {
  BEACON = "beacon",
  KUKAI_EMBED = "kukai-embed",
}

function makeDeeplinkWithAddress(address: string) {
  return `${REDIRECT_DEEPLINK}kukai-embed/?address=${address}`
}

function App() {
  const [error, setError] = useState('')
  const [status, setStatus] = useState(STATUS.LOADING)
  const [, setAddress] = useState<String | undefined>(undefined)

  useEffect(() => {
    initWalletConnectors()
      .then((activeAddress) => {
        if (activeAddress) {
          window.location.href = `${REDIRECT_DEEPLINK}kukai-embed/?address=${activeAddress}`
          setAddress(activeAddress)
        }
      })
      .catch((error) => {
        setError(error?.message)
      })
      .finally(() => {
        setStatus(STATUS.READY)
      })

    return () => {
      // @TODO: handle logout
    }

  }, [])

  async function handleLogin(event: MouseEvent<HTMLButtonElement>) {
    const { type } = event.currentTarget.dataset
    if (type === PROVIDERS.BEACON) {
      const account = await BEACON.requestPermissions()
      window.location.href = makeDeeplinkWithAddress(account.address)
    } else {
      const account = await KUKAI_EMBED.login(LOGIN_CONFIG)
      window.location.href = makeDeeplinkWithAddress(account.pkh)
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
