import { Reducer, useCallback, useReducer } from "react"
export interface LoadableType<T> {
  isLoading: boolean
  isLoaded: boolean
  isError: boolean
  isSuccess: boolean
  error: Error | string | null
  data?: T
}

export const EMPTY_LOADABLE = {
  isLoading: false,
  isLoaded: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: undefined,
}

enum LoadableActions {
  "START",
  "SUCCESS",
  "FAILURE",
}

type Action<T> = {
  type: LoadableActions
  data?: T
  error?: Error | string
}

function reducer<S>(
  state: LoadableType<S>,
  action: Action<S>,
): LoadableType<S> {
  switch (action.type) {
    case LoadableActions.START:
      return {
        ...state,
        isLoading: true,
      }
    case LoadableActions.SUCCESS:
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        isError: false,
        isSuccess: true,
        error: null,
        data: action.data,
      }
    case LoadableActions.FAILURE:
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        isError: true,
        isSuccess: false,
        error: action.error as Error | string,
      }
    default:
      return EMPTY_LOADABLE
  }
}

type ReturnType<T> = {
  state: LoadableType<T>
  onStart: () => void
  onSuccess: (data: T) => void
  onFailure: (error: Error | string) => void
}

/**
 * Hook for managing loadable state
 */
export function useLoadingState<T>(initialState?: T): ReturnType<T> {
  const [state, dispatch] = useReducer<Reducer<LoadableType<T>, Action<T>>>(
    reducer,
    {
      ...EMPTY_LOADABLE,
      data: initialState || undefined,
    } as LoadableType<T>,
  )
  const onStart = useCallback(
    () => dispatch({ type: LoadableActions.START }),
    [dispatch],
  )
  const onSuccess = useCallback(
    (data: T) => dispatch({ type: LoadableActions.SUCCESS, data }),
    [dispatch],
  )
  const onFailure = useCallback(
    (error: Error | string) => dispatch({ type: LoadableActions.START, error }),
    [dispatch],
  )

  return {
    state,
    onStart,
    onSuccess,
    onFailure,
  }
}

export function mergeLoadables<A, B>(
  a: LoadableType<A>,
  b: LoadableType<B>,
): LoadableType<[A, B] | undefined> {
  return {
    isLoading: a.isLoading || b.isLoading,
    isLoaded: a.isLoaded && b.isLoaded,
    isError: a.isError || b.isError,
    isSuccess: a.isSuccess && b.isSuccess,
    error: a.error || b.error,
    data: a.data && b.data ? [a.data, b.data] : undefined,
  }
}
