import { Call, Contract, Provider } from "ethcall"

export class MulticallCall<Inputs, Outputs> extends Call {
  inputs: Inputs
  outputs: Outputs
}

export type MulticallContract<ContractType> = {
  [Fn in keyof ContractType["functions"]]: (
    ...args: Parameters<ContractType[Fn]>
  ) => MulticallCall<
    Parameters<ContractType[Fn]>,
    ReturnType<ContractType[Fn]> extends Promise<infer V>
      ? V // if ReturnType is a Promise, unwrap it
      : ReturnType<ContractType[Fn]>
  >
} &
  Contract
export class MulticallProvider extends Provider {
  // TODO: this only support return values of the same type rather than mixed
  // TS can't infer tuple types :(
  all<O>(calls: MulticallCall<I, O>[], overrides: CallOverrides): Promise<O[]>
}
