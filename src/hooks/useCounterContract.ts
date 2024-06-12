import { useEffect, useState } from "react";
import { Counter } from "../contracts/Counter";
import useTonClient from "./useTonClient";
import useAsyncInitialize from "./useAsyncInitialize";
import { Address, OpenedContract, toNano } from "@ton/core";
import useTonConnect from "./useTonConnect";

export default function useCounterContract() {
  const client = useTonClient();
  const { sender } = useTonConnect();

  const sleep = (time: number) =>
    new Promise((resolve) => setTimeout(resolve, time));

  const [contractData, setContractData] = useState<null | {
    counter_value: number,
    recent_sender: Address,
    owner_address: Address,
  }>();

  const [balance, setBalance] = useState<number | null>(null);

  const counterContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new Counter(
      Address.parse('EQBLQlZ_aPD_9WWoApPI0-Vd_ojJuQfd3qeElO3K8DdCKoV3')
    );
    return client.open(contract) as OpenedContract<Counter>
  }, [client]);

  useEffect(() => {
    async function getValue() {
      if (!counterContract) return;
      setContractData(null);
      const val = await counterContract.getContractStorage();
      const { balance } = await counterContract.getBalance();
      setContractData({
        counter_value: val.counterValue,
        recent_sender: val.recentSenderAddress,
        owner_address: val.ownerAddress,
      });
      setBalance(balance);
      await sleep(5000);
      getValue();
    }

    getValue();
  }, [counterContract])

  return {
    contract_address: counterContract?.address.toString(),
    contract_balance: balance,
    ...contractData,
    sendIncrement: async () => {
      return counterContract?.sendIncrement(sender, toNano("0.05"), 5);
    },
    sendDeposit: async () => {
      return counterContract?.sendDeposit(sender, toNano("1"));
    },
    sendWithdraw: async () => {
      return counterContract?.sendWithdraw(sender, toNano("0.05"), toNano("1"));
    }
  };
}