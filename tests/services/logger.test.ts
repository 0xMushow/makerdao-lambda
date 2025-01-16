import logger from "../../src/utils/logger";

describe("Logger Utility", () => {
    it("should log info messages", () => {
        const loggerSpy = jest.spyOn(logger, "info");
        logger.info("Test info message");
        expect(loggerSpy).toHaveBeenCalledWith("Test info message");
    });

    it("should log error messages", () => {
        const loggerSpy = jest.spyOn(logger, "error");
        logger.error("Test error message");
        expect(loggerSpy).toHaveBeenCalledWith("Test error message");
    });
});