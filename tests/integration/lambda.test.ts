import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { handler } from "../../src";
import { ethers } from "ethers";
import logger from "../../src/utils/logger";

// Mock ethers.js
jest.mock("ethers");

describe("Lambda Function Integration Tests", () => {
    let mockAxios: MockAdapter;

    beforeAll(() => {
        // Mock axios for Discord API calls
        mockAxios = new MockAdapter(axios);

        // Mock environment variables
        process.env.RPC_URL = "https://mock-rpc-url";
        process.env.SEQUENCER_ADDRESS = "0xSequencerAddress";
        process.env.DISCORD_WEBHOOK_URL = "https://mock-discord-webhook-url";
    });

    afterEach(() => {
        // Reset mocks after each test
        mockAxios.reset();
        jest.clearAllMocks();
    });

    afterAll(() => {
        // Restore axios to its original state
        mockAxios.restore();
    });

    it("should send a Discord alert for a non-workable job", async () => {
        // Mock Ethereum provider and Sequencer contract
        const mockProvider = {
            getBlockNumber: jest.fn().mockResolvedValue(100),
        };
        const mockSequencerContract = {
            numJobs: jest.fn().mockResolvedValue(1),
            jobAt: jest.fn().mockResolvedValue("0xNonWorkableJobAddress"),
        };
        const mockJobContract = {
            workable: jest.fn().mockResolvedValue([false]), // Job is not workable
        };

        // Mock ethers.Contract to return the mock job contract
        (ethers.Contract as unknown as jest.Mock).mockImplementation((address: string) => {
            if (address === process.env.SEQUENCER_ADDRESS) return mockSequencerContract;
            if (address === "0xNonWorkableJobAddress") return mockJobContract;
            throw new Error("Unknown contract address");
        });

        // Mock Discord API to intercept the alert
        mockAxios.onPost(process.env.DISCORD_WEBHOOK_URL!).reply(200);

        // Spy on logger to verify logs
        const loggerInfoSpy = jest.spyOn(logger, "info");
        const loggerWarnSpy = jest.spyOn(logger, "warn");

        // Invoke the Lambda function
        await handler({}, {});

        // Verify Discord alert was sent
        expect(mockAxios.history.post.length).toBe(1);
        expect(mockAxios.history.post[0].data).toEqual(
            JSON.stringify({ content: "Job 0 at address 0xNonWorkableJobAddress has NOT been workable in the last 10 blocks." })
        );

        // Verify logs
        expect(loggerWarnSpy).toHaveBeenCalledWith(`Job 0 has NOT been workable in the last 10 blocks.`);
        expect(loggerInfoSpy).toHaveBeenCalledWith("Discord alert sent for Job 0.");
    });

    it("should not send a Discord alert for a workable job", async () => {
        // Mock Ethereum provider and Sequencer contract
        const mockProvider = {
            getBlockNumber: jest.fn().mockResolvedValue(100),
        };
        const mockSequencerContract = {
            numJobs: jest.fn().mockResolvedValue(1),
            jobAt: jest.fn().mockResolvedValue("0xWorkableJobAddress"),
        };
        const mockJobContract = {
            workable: jest.fn().mockResolvedValue([true]), // Job is workable
        };

        // Mock ethers.Contract to return the mock job contract
        (ethers.Contract as unknown as jest.Mock).mockImplementation((address: string) => {
            if (address === process.env.SEQUENCER_ADDRESS) return mockSequencerContract;
            if (address === "0xWorkableJobAddress") return mockJobContract;
            throw new Error("Unknown contract address");
        });

        // Mock Discord API to intercept the alert
        mockAxios.onPost(process.env.DISCORD_WEBHOOK_URL!).reply(200);

        // Spy on logger to verify logs
        const loggerInfoSpy = jest.spyOn(logger, "info");
        const loggerWarnSpy = jest.spyOn(logger, "warn");

        // Invoke the Lambda function
        await handler({}, {});

        // Verify no Discord alert was sent
        expect(mockAxios.history.post.length).toBe(0);

        // Verify logs
        expect(loggerInfoSpy).toHaveBeenCalledWith("Job 0 is workable.");
        expect(loggerWarnSpy).not.toHaveBeenCalled();
    });
});