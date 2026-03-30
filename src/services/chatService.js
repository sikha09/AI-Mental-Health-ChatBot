import { COLAB_API_URL } from "../config/constants";

// ── Send message to Colab and get response ─────────────────────────
export const sendMessage = async (userMessage, history = []) => {
  try {
    const response = await fetch(`${COLAB_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        history: history,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    // Returns: { response: "...", emotion: "Anxiety", history: [...] }
    return data;

  } catch (error) {
    if (error.message.includes("Failed to fetch")) {
      throw new Error(
        "Cannot reach the AI model. Make sure Colab is running and the ngrok URL is updated in constants.js"
      );
    }
    throw error;
  }
};

// ── Check if Colab API is alive ────────────────────────────────────
export const checkConnection = async () => {
  try {
    const response = await fetch(`${COLAB_API_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(8000), // 8 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
};