import * as dotenv from "dotenv";
import { createEthereumProvider } from "./services/ethereum";
import logger from "./utils/logger";

dotenv.config();

const provider = createEthereumProvider(process.env.RPC_URL!);

async function main() {
    /**
     * The main function serves as the entry point for the application.
     * It connects to the Ethereum network and retrieves the latest block number.
     */
    try {
        logger.info("Connecting to the Ethereum network...");
        const blockNumber = await provider.getBlockNumber();
        logger.info(`Latest block number: ${blockNumber}`);
    } catch (error) {
        logger.error({ error }, "Error while fetching the block number");
    }
}

main();
