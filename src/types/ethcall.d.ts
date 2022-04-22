import { Call, Contract, Provider } from "ethcall"
import { BigNumber } from "@ethersproject/bignumber"

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
} & Contract
export class MulticallProvider extends Provider {
  getEthBalance(account: string): MulticallCall<string, BigNumber>
  /**
   *  TODO: TS can't infer tuple types
   *  so this huge type supports either arrays of calls with the same return type (eg BigNumber[])
   *  Or a tuple of up to 4 distinct calls *as const* (meaning you can use map or push)
   *  eg `const calls = [getNum(), getStr(), getBN()] as const; await p.all(calls)`
   *  Want to build a larger tuple of calls? Just add more to this definition.
   *  */
  all<A extends MulticallCall>(
    calls: readonly [A],
    block?: number,
  ): Promise<[A["outputs"]]>
  all<A extends MulticallCall, B extends MulticallCall>(
    calls: readonly [A, B],
    block?: number,
  ): Promise<[A["outputs"], B["outputs"]]>
  all<
    A extends MulticallCall,
    B extends MulticallCall,
    C extends MulticallCall,
  >(
    calls: readonly [A, B, C],
    block?: number,
  ): Promise<[A["outputs"], B["outputs"], C["outputs"]]>
  all<
    A extends MulticallCall,
    B extends MulticallCall,
    C extends MulticallCall,
    D extends MulticallCall,
  >(
    calls: readonly [A, B, C, D],
    block?: number,
  ): Promise<[A["outputs"], B["outputs"], C["outputs"], D["outputs"]]>
  all<O>(calls: MulticallCall<I, O>[], block?: number): Promise<O[]> // fallthrough to array type
  tryEach<A extends MulticallCall>(
    calls: readonly [A],
    canFail: boolean[],
    block?: number,
  ): Promise<[A["outputs"]]>
  tryEach<A extends MulticallCall, B extends MulticallCall>(
    calls: readonly [A, B],
    canFail: boolean[],
    block?: number,
  ): Promise<[A["outputs"], B["outputs"]]>
  tryEach<
    A extends MulticallCall,
    B extends MulticallCall,
    C extends MulticallCall,
  >(
    calls: readonly [A, B, C],
    canFail: boolean[],
    block?: number,
  ): Promise<[A["outputs"], B["outputs"], C["outputs"]]>
  tryEach<
    A extends MulticallCall,
    B extends MulticallCall,
    C extends MulticallCall,
    D extends MulticallCall,
  >(
    calls: readonly [A, B, C, D],
    canFail: boolean[],
    block?: number,
  ): Promise<[A["outputs"], B["outputs"], C["outputs"], D["outputs"]]>
  tryEach<O>(
    calls: MulticallCall<I, O>[],
    canFail: boolean[],
    block?: number,
  ): Promise<O[]> // fallthrough to array type
}
