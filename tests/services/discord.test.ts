import axios from "axios";
import { sendDiscordAlert } from "../../src/services/discord";

jest.mock("axios");

describe("Discord Service", () => {
    const mockWebhookUrl = "https://discord.com/api/webhooks/12345";
    const mockMessage = "Test alert message";

    it("should send a Discord alert successfully", async () => {
        (axios.post as jest.Mock).mockResolvedValue({ status: 200 });

        await sendDiscordAlert(mockWebhookUrl, mockMessage);

        expect(axios.post).toHaveBeenCalledWith(mockWebhookUrl, { content: mockMessage });
    });

    it("should log an error when sending a Discord alert fails", async () => {
        const mockError = new Error("Network error");
        (axios.post as jest.Mock).mockRejectedValue(mockError);

        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        await sendDiscordAlert(mockWebhookUrl, mockMessage);

        expect(axios.post).toHaveBeenCalledWith(mockWebhookUrl, { content: mockMessage });

        expect(consoleErrorSpy).toHaveBeenCalledWith("Error sending Discord alert:", mockError);

        consoleErrorSpy.mockRestore();
    });
});