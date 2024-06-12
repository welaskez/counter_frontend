import './App.css'
import { TonConnectButton } from '@tonconnect/ui-react'
import useCounterContract from './hooks/useCounterContract'
import useTonConnect from './hooks/useTonConnect';
import { fromNano } from '@ton/core';

function App() {
  const {
    contract_address,
    counter_value,
    recent_sender,
    owner_address,
    contract_balance,
    sendIncrement,
    sendDeposit,
    sendWithdraw,
  } = useCounterContract();

  const { connected } = useTonConnect();

  return (
    <>
    <div>
      <TonConnectButton />
    </div>
    <div>
      <div className='Card'>
        <b>Our contract address</b>
        <div className="Hint">{contract_address?.slice(0, 30) + "..."}</div>
        <b>Our contract balance</b>
        {contract_balance && <div>{fromNano(contract_balance)}</div>}
        <b>Recent sender address</b>
        <div className="Hint">{recent_sender?.toString().slice(0, 4) + "..." + recent_sender?.toString().slice(44, 48)}</div>
        <b>Owner address</b>
        <div className="Hint">{owner_address?.toString().slice(0, 4) + "..." + owner_address?.toString().slice(44, 48)}</div>
      </div>

      <div className="Card">
        <b>Counter value</b>
        <div>{counter_value ?? "Loading..."}</div>
      </div>

      {connected && (
        <a onClick={() => {
          sendIncrement()
        }}>
          Increment by 5
        </a>
      )}

      <br />

      {connected && (
        <a onClick={() => {
          sendDeposit()
        }}>
          Deposit 1 ton
        </a>
      )}

      <br />

      {connected && (
        <a onClick={() => {
          sendWithdraw()
        }}>
          Withrdaw 1 ton
        </a>
      )}

    </div>

    </>
  )
}

export default App
