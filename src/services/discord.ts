import axios from "axios";

/**
 * Sends an alert to a Discord webhook.
 * @param webhookUrl - The Discord webhook URL.
 * @param message - The message to send.
 */
export async function sendDiscordAlert(webhookUrl: string, message: string) {
    try {
        await axios.post(webhookUrl, { content: message });
        console.log("Alert sent to Discord:", message);
    } catch (error) {
        console.error("Error sending Discord alert:", error);
    }
}