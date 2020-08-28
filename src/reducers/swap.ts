import { LOADED_SWAPS, SwapAction } from "../actions"
import { Swap } from "../types"

export interface SwapState {
  all?: Swap[]
}

export const swapReducer = (
  state: SwapState = { all: [] },
  action: SwapAction,
) => {
  switch (action.type) {
    case LOADED_SWAPS:
      return {
        ...state,
        ...action.payload,
      }
  }
  return state
}
