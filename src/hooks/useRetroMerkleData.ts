import { useEffect, useState } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import { IS_PRODUCTION } from "../utils/environment"
import { RETROACTIVE_SDL_MERKLETREE_DATA } from "../constants"
import { useActiveWeb3React } from "."

type AccountMerkleData = {
  amount: string
  proof: string[]
}
type MerkleFile = {
  recipients: {
    [account: string]: AccountMerkleData
  }
}
type MerkleState = {
  amount: BigNumber
  proof: string[]
} | null
export function useRetroMerkleData(): MerkleState {
  const { account, chainId } = useActiveWeb3React()
  const [userMerkleData, setUserMerkleData] = useState<MerkleState>(null)
  useEffect(() => {
    async function fetchUserMerkleData() {
      if (!chainId || !account) return
      // eslint-disable-next-line no-constant-condition
      if (IS_PRODUCTION) {
        // TODO: do network stuff
        const resp = await fetch(
          `https://ipfs.saddle.exchange/token-merkle-proofs/${account}`,
        )
        if (resp.ok) {
          void resp.json().then((userData: AccountMerkleData) => {
            setUserMerkleData(
              userData
                ? {
                    proof: userData.proof,
                    amount: BigNumber.from(userData.amount),
                  }
                : null,
            )
          })
        } else {
          // API will 404 if account proof doesn't exist
          setUserMerkleData(null)
        }
      } else {
        const pathToFetch = RETROACTIVE_SDL_MERKLETREE_DATA[chainId]
        if (!pathToFetch) {
          console.log("No merkle data for chain")
          return
        }
        const data = (await import(
          `../constants/retroactiveSDLMerkleData/${pathToFetch}`
        )) as MerkleFile | null
        const userData = data?.recipients?.[account]
        setUserMerkleData(
          userData
            ? {
                proof: userData.proof,
                amount: BigNumber.from(userData.amount),
              }
            : null,
        )
      }
    }
    void fetchUserMerkleData()
  }, [chainId, account])
  return userMerkleData
}
