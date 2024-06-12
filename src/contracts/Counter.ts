import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type CounterConfig = {
  counterValue: number;
  recentSenderAddress: Address;
  ownerAddress: Address;
};

export function counterConfigToCell(config: CounterConfig): Cell {
  return beginCell()
    .storeUint(config.counterValue, 32)
    .storeAddress(config.recentSenderAddress)
    .storeAddress(config.ownerAddress)
    .endCell();
}

export class Counter implements Contract {
  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

  static createFromAddress(address: Address) {
    return new Counter(address);
  }

  static createFromConfig(config: CounterConfig, code: Cell, workchain = 0) {
    const data = counterConfigToCell(config);
    const init = { code, data };
    return new Counter(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async sendIncrement(provider: ContractProvider, via: Sender, value: bigint, increment: number) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(1, 32).storeUint(increment, 32).endCell(),
    });
  }

  async sendDeposit(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(2, 32).endCell(),
    });
  }

  async sendWithdraw(provider: ContractProvider, via: Sender, value: bigint, amount: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(3, 32).storeCoins(amount).endCell(),
    });
  }

  async getContractStorage(provider: ContractProvider) {
    const { stack } = await provider.get("get_contract_data", [])
    return {
      counterValue: stack.readNumber(),
      recentSenderAddress: stack.readAddress(),
      ownerAddress: stack.readAddress(),
    };
  }

  async getBalance(provider: ContractProvider) {
    const { stack } = await provider.get("balance", [])
    return {
      balance: stack.readNumber()
    };
  }
}
