import { ethers } from "ethers";

export function createEthereumProvider(rpcUrl: string) {
    return new ethers.providers.JsonRpcProvider(rpcUrl);
}