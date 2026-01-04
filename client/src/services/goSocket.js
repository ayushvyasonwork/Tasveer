let ws = null;

export const connectGoSocket = (onMessage) => {
  if (ws) return ws;

  ws = new WebSocket(`${process.env.REACT_APP_API_BASE_URL_2}/ws`);

  ws.onopen = () => {
    console.log("✅ Go WebSocket connected");
  };

  // 🔥 THIS WAS MISSING
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📩 WS → UI:", data);
      onMessage(data); // ✅ SEND TO CHATPAGE
    } catch (e) {
      console.error("Invalid WS message", e);
    }
  };

  ws.onerror = (err) => {
    console.error("Go WebSocket error", err);
  };

  ws.onclose = () => {
    console.log("❌ Go WebSocket closed");
    ws = null;
  };

  return ws;
};

export const sendGoMessage = (payload) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
};

export const disconnectGoSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
};
