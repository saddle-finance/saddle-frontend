import { useEffect, useState } from "react"

import { MERKLETREE_DATA } from "../constants"
import { getMerkleProof } from "../utils/merkleTree"
import { isProduction } from "../utils/environment"
import { useActiveWeb3React } from "../hooks"

export function useUserMerkleProof(): string[] | null {
  const { account, chainId } = useActiveWeb3React()

  const [userMerkleProof, setUserMerkleProof] = useState<string[] | null>(null)
  useEffect(() => {
    if (!account) {
      setUserMerkleProof([])
      return
    }
    if (isProduction()) {
      fetch(`https://ipfs.saddle.exchange/merkle-proofs/${account}`).then(
        (resp) => {
          if (resp.ok) {
            resp.json().then((proof) => setUserMerkleProof(proof))
          } else {
            // API will 404 if account proof doesn't exist
            setUserMerkleProof([])
          }
        },
      )
    } else {
      if (chainId) {
        import(`../constants/merkleTreeData/${MERKLETREE_DATA[chainId]}`).then(
          (data) => {
            const proof = getMerkleProof(data, account)
            setUserMerkleProof(proof)
          },
        )
      }
    }
  }, [account, chainId])
  return userMerkleProof
}
