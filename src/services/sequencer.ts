import { ethers } from "ethers";
import { sequencerAbi } from "../contracts/sequencer";

/**
 * Creates a contract instance for the Sequencer.
 * @param provider - The Ethereum provider.
 * @param address - The address of the Sequencer contract.
 * @returns An ethers.Contract instance.
 */
export function createSequencerContract(provider: ethers.providers.JsonRpcProvider, address: string) {
    return new ethers.Contract(address, sequencerAbi, provider);
}

/**
 * Fetches the total number of jobs in the Sequencer.
 * @param sequencer - The Sequencer contract instance.
 * @returns The number of jobs.
 */
export async function getNumberOfJobs(sequencer: ethers.Contract): Promise<number> {
    return await sequencer.numJobs();
}

/**
 * Fetches the address of a job at a specific index.
 * @param sequencer - The Sequencer contract instance.
 * @param index - The index of the job.
 * @returns The address of the job.
 */
export async function getJobAt(sequencer: ethers.Contract, index: number): Promise<string> {
    return await sequencer.jobAt(index);
}

/**
 * Checks if a job has been workable in the last N blocks.
 * @param jobAddress - The address of the job.
 * @param provider - The Ethereum provider.
 * @param network - The name of the keeper network.
 * @param blockWindow - The number of blocks to check.
 * @returns True if the job was workable in any of the last N blocks, false otherwise.
 */
export async function isJobWorkableInLastBlocks(
    jobAddress: string,
    provider: ethers.providers.JsonRpcProvider,
    network: string,
    blockWindow: number
): Promise<boolean> {
    const currentBlock = await provider.getBlockNumber();
    for (let i = 0; i < blockWindow; i++) {
        const blockNumber = currentBlock - i;
        const jobAbi = [
            "function workable(bytes32 network) external view returns (bool canWork, bytes memory args)"
        ];
        const jobContract = new ethers.Contract(jobAddress, jobAbi, provider);
        const [canWork] = await jobContract.workable(ethers.utils.formatBytes32String(network), { blockTag: blockNumber });
        if (canWork) {
            return true;
        }
    }
    return false;
}
