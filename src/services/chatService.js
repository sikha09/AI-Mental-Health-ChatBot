import { COLAB_API_URL, API_BASE_URL } from "../config/constants";
import { getAuthToken } from "./authService";

// ── Send message to Node Backend and get AI response ─────────────────────────
export const sendMessage = async (userMessage) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        message: userMessage
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    // Returns: { success: true, response: "...", emotion: "Anxiety", messageId: 1 }
    return data;

  } catch (error) {
    if (error.message.includes("Failed to fetch")) {
      throw new Error(
        "Cannot reach the server. Make sure the Node backend and AI server are running."
      );
    }
    throw error;
  }
};

// ── Fetch chat history from database ──────────────────────────────────────
export const getChatHistory = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/chat/history`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });
  
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      return data.history;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }
};

// ── Fetch mood analytics ───────────────────────────────────────────────
export const getMoodAnalytics = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/chat/mood-analytics`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });
  
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return await response.json();
    } catch (error) {
      console.error("Error fetching mood analytics:", error);
      return { trend: [], summary: [] };
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