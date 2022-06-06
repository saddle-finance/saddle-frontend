import { ConfirmModalType, updateConfirmModal } from "../state/user"
import { useCallback } from "react"
import { useDispatch } from "react-redux"

export function useConfirmModal(): {
  enqueueConfirmModal: ({ options }: Partial<ConfirmModalType>) => void
} {
  const dispatch = useDispatch()
  const enqueueConfirmModal = useCallback(
    ({ options }: Partial<ConfirmModalType>) => {
      dispatch(
        updateConfirmModal({
          open: true,
          options,
        }),
      )
    },

    [dispatch],
  )

  return { enqueueConfirmModal }
}
