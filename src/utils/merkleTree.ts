import { BytesLike } from "@ethersproject/bytes"
import merkleTreeData from "../constants/exampleMerkleTreeData.json"

interface Account {
  proof: string[]
  flags: {
    yearn: boolean
    curve: boolean
    yam: boolean
  }
}
const ALLOWED_ACCOUNTS: Record<string, Account> = merkleTreeData.allowedAccounts

export function getMerkleProof(address?: string | null): BytesLike[] {
  if (address && address in ALLOWED_ACCOUNTS) {
    return ALLOWED_ACCOUNTS[address].proof
  }
  return []
}
