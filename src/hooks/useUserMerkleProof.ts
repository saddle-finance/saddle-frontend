import { MERKLETREE_DATA, PoolName } from "../constants"
import { useEffect, useState } from "react"

import { getMerkleProof } from "../utils/merkleTree"
import { isProduction } from "../utils/environment"
import { useActiveWeb3React } from "../hooks"
import usePoolData from "./usePoolData"
import { useSwapContract } from "./useContract"

export function useUserMerkleProof(
  poolName: PoolName,
): {
  userMerkleProof: string[] | null
  hasValidMerkleState: boolean
} {
  const { account, chainId } = useActiveWeb3React()
  const [, userShareData] = usePoolData(poolName)
  const swapContract = useSwapContract(poolName)

  const [userMerkleProof, setUserMerkleProof] = useState<string[] | null>(null)
  const [hasValidMerkleState, setHasValidMerkleState] = useState<boolean>(false)
  useEffect(() => {
    async function computeMerkleState(): Promise<void> {
      if (!account) {
        setUserMerkleProof([])
        setHasValidMerkleState(false)
        return
      }
      const isGuarded = await swapContract?.isGuarded()
      if (!isGuarded) {
        // merkle valation only required for guarded pools
        setUserMerkleProof([])
        setHasValidMerkleState(true)
        return
      }
      if (userShareData?.isAccountVerified) {
        // gas trick where we don't need to send proofs if already verified
        setUserMerkleProof([])
        setHasValidMerkleState(true)
        return
      }
      if (isProduction()) {
        const resp = await fetch(
          `https://ipfs.saddle.exchange/merkle-proofs/${account}`,
        )
        if (resp.ok) {
          resp.json().then((proof) => {
            setUserMerkleProof(proof)
            setHasValidMerkleState(true)
          })
        } else {
          // API will 404 if account proof doesn't exist
          setUserMerkleProof([])
          setHasValidMerkleState(false)
        }
      } else {
        if (chainId) {
          const data = await import(
            `../constants/merkleTreeData/${MERKLETREE_DATA[chainId]}`
          )
          const proof = getMerkleProof(data, account)
          setUserMerkleProof(proof)
          setHasValidMerkleState(proof.length > 0)
        }
      }
    }
    computeMerkleState()
  }, [account, chainId, userShareData?.isAccountVerified, swapContract])
  return {
    userMerkleProof,
    hasValidMerkleState,
  }
}
