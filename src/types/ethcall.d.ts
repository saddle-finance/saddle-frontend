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
  /**
   *  TODO: TS can't infer tuple types
   *  so this huge type supports either arrays of calls with the same return type (eg BigNumber[])
   *  Or a tuple of up to 4 distinct calls *as const* (meaning you can use map or push)
   *  eg `const calls = [getNum(), getStr(), getBN()] as const; await p.all(calls)`
   *  Want to build a larger tuple of calls? Just add more to this definition.
   *  */
  all<A extends MulticallCall>(
    calls: readonly [A],
    overrides: CallOverrides,
  ): Promise<[A["outputs"]]>
  all<A extends MulticallCall, B extends MulticallCall>(
    calls: readonly [A, B],
    overrides: CallOverrides,
  ): Promise<[A["outputs"], B["outputs"]]>
  all<
    A extends MulticallCall,
    B extends MulticallCall,
    C extends MulticallCall
  >(
    calls: readonly [A, B, C],
    overrides: CallOverrides,
  ): Promise<[A["outputs"], B["outputs"], C["outputs"]]>
  all<
    A extends MulticallCall,
    B extends MulticallCall,
    C extends MulticallCall,
    D extends MulticallCall
  >(
    calls: readonly [A, B, C, D],
    overrides: CallOverrides,
  ): Promise<[A["outputs"], B["outputs"], C["outputs"], D["outputs"]]>
  all<O>(calls: MulticallCall<I, O>[], overrides: CallOverrides): Promise<O[]> // fallthrough to array type
}
