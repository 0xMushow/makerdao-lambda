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
 * Determines whether a specific job is workable.
 * @param jobAddress - The address of the job.
 * @param provider - The Ethereum provider.
 * @param network - The name of the keeper network.
 * @returns True if the job is workable, false otherwise.
 */
export async function isJobWorkable(jobAddress: string, provider: ethers.providers.JsonRpcProvider, network: string): Promise<boolean> {
    const jobAbi = [
        "function workable(bytes32 network) external view returns (bool canWork, bytes memory args)"
    ];
    const jobContract = new ethers.Contract(jobAddress, jobAbi, provider);
    const [canWork] = await jobContract.workable(ethers.utils.formatBytes32String(network));
    return canWork;
}
