import { AddToast, ToastsContext } from "../providers/ToastsProvider"

import { useContext } from "react"

const useToast = (): { addToast: AddToast } => {
  return useContext(ToastsContext)
}
export default useToast
