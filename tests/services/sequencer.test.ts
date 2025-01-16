import { ethers } from "ethers";
import { createSequencerContract, getNumberOfJobs, getJobAt, isJobWorkableInLastBlocks } from "../../src/services/sequencer";

jest.mock("ethers");

describe("Sequencer Service", () => {
    const mockProvider = {
        getBlockNumber: jest.fn().mockResolvedValue(100),
    };
    const mockSequencerContract = {
        numJobs: jest.fn().mockResolvedValue(2),
        jobAt: jest.fn()
            .mockResolvedValueOnce("0xJobAddress1")
            .mockResolvedValueOnce("0xJobAddress2"),
    };
    const mockJobContract = {
        workable: jest.fn()
            .mockResolvedValueOnce([false]) // Job 1 is not workable
            .mockResolvedValueOnce([true]), // Job 2 is workable
    };
    const mockNonWorkableJobContract = {
        workable: jest.fn()
            .mockResolvedValue([false]), // Job is not workable in any block
    };

    beforeEach(() => {
        (ethers.Contract as unknown as jest.Mock).mockImplementation((address: string) => {
            if (address === "0xSequencerAddress") return mockSequencerContract;
            if (address === "0xJobAddress1") return mockJobContract;
            if (address === "0xNonWorkableJobAddress") return mockNonWorkableJobContract;
            throw new Error("Unknown contract address");
        });
    });

    it("should create a Sequencer contract instance", () => {
        const sequencer = createSequencerContract(mockProvider as any, "0xSequencerAddress");
        expect(sequencer).toBeDefined();
    });

    it("should get the number of jobs", async () => {
        const numJobs = await getNumberOfJobs(mockSequencerContract as any);
        expect(numJobs).toBe(2);
    });

    it("should get a job at a specific index", async () => {
        const jobAddress = await getJobAt(mockSequencerContract as any, 0);
        expect(jobAddress).toBe("0xJobAddress1");
    });

    it("should return true if a job is workable in any of the last N blocks", async () => {
        const isWorkable = await isJobWorkableInLastBlocks("0xJobAddress1", mockProvider as any, "MAINNET", 2);
        expect(isWorkable).toBe(true);
    });

    it("should return false if a job is not workable in any of the last N blocks", async () => {
        const isWorkable = await isJobWorkableInLastBlocks("0xNonWorkableJobAddress", mockProvider as any, "MAINNET", 2);
        expect(isWorkable).toBe(false);
    });
});