import { useContract, useAccount } from "@starknet-react/core";
import AINEST_ABI from "@/utils/AINEST_ABI.json";
import STRK_ABI from "@/utils/STRK_ABI.json";

export const AINEST_ADDRESS =
  "0x006533d0f5009d378c230bdf3104054886eac25d321140875a61bda4f9e6b819"; // your deployed registry

export const STRK_ADDRESS =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"; // your STRK token

export function useContracts() {
  const { account } = useAccount();
  const ainest = useContract({
    abi: AINEST_ABI as any,
    address: AINEST_ADDRESS,
  });
  const strk = useContract({
    abi: STRK_ABI as any,
    address: STRK_ADDRESS,
  });
  return { account, ainest, strk };
}
