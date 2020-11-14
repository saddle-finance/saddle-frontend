import {
  AddToast,
  ClearToasts,
  ToastsContext,
} from "../providers/ToastsProvider"

import { useContext } from "react"

export const useToast = (): {
  addToast: AddToast
  clearToasts: ClearToasts
} => {
  return useContext(ToastsContext)
}
