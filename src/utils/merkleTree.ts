interface MerkleTreeData {
  merkleRoot: string
  allowedAccounts: Record<string, Account>
}
interface Account {
  proof: string[]
  flags: {
    yearn: boolean
    curve: boolean
    yam: boolean
  }
}

export function getMerkleProof(
  merkleTreeData: MerkleTreeData,
  address?: string | null,
): string[] {
  const ALLOWED_ACCOUNTS = merkleTreeData.allowedAccounts
  if (address && address in ALLOWED_ACCOUNTS) {
    return ALLOWED_ACCOUNTS[address].proof
  }
  return []
}
