import * as dotenv from "dotenv";
import { createEthereumProvider } from "./services/ethereum";
import {
    createSequencerContract,
    getNumberOfJobs,
    getJobAt,
    isJobWorkableInLastBlocks
} from "./services/sequencer";
import { sendDiscordAlert } from "./services/discord";
import logger from "./utils/logger";

dotenv.config();
const BLOCK_WINDOW = 10;
/**
 * Initialize an Ethereum provider using the RPC URL from the environment variables.
 */
const provider = createEthereumProvider(process.env.RPC_URL!);

/**
 * Lambda handler function that acts as the entry point.
 * It connects to the Ethereum network, retrieves job details from the Sequencer contract,
 * checks if the jobs are workable, and sends Discord alerts for non-workable jobs.
 */
export const handler = async (event: any, context: any) => {
    try {
        logger.info("Connecting to the Ethereum network...");

        const provider = createEthereumProvider(process.env.RPC_URL!);
        const blockNumber = await provider.getBlockNumber();
        logger.info(`Latest block number: ${blockNumber}`);

        const sequencerAddress = process.env.SEQUENCER_ADDRESS!;
        const sequencer = createSequencerContract(provider, sequencerAddress);

        const numJobs = await getNumberOfJobs(sequencer);
        logger.info(`Number of jobs in the Sequencer: ${numJobs}`);

        for (let i = 0; i < numJobs; i++) {
            const jobAddress = await getJobAt(sequencer, i);
            logger.info(`Checking workability for Job ${i} at address: ${jobAddress}`);

            const isWorkable = await isJobWorkableInLastBlocks(jobAddress, provider, "MAINNET", BLOCK_WINDOW);

            if (!isWorkable) {
                logger.warn(`Job ${i} has NOT been workable in the last ${BLOCK_WINDOW} blocks.`);

                const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL!;
                const alertMessage = `Job ${i} at address ${jobAddress} has NOT been workable in the last ${BLOCK_WINDOW} blocks.`;
                await sendDiscordAlert(discordWebhookUrl, alertMessage);
                logger.info(`Discord alert sent for Job ${i}.`);
            } else {
                logger.info(`Job ${i} is workable.`);
            }
        }
    } catch (error) {
        logger.error({ error }, "Error in the Lambda function");
        throw error;
    }
};

if (require.main === module) {
    console.log("Running Lambda function locally...");
    handler({}, {})
        .then(() => console.log("Lambda function executed successfully."))
        .catch((error) => console.error("Error executing Lambda function:", error));
}