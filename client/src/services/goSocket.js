let ws = null;

export const connectGoSocket = async (onMessage) => {
  if (ws) return ws;

    const res = await fetch(
    `${process.env.REACT_APP_API_BASE_URL}/auth/ws-token`,
    { credentials: "include" }
  );
    const { wsToken } = await res.json();
  ws = new WebSocket(`${process.env.REACT_APP_API_BASE_URL_2}/ws?token=${wsToken}`);
  ws.onopen = () => {
    console.log("✅ Go WebSocket connected");
  };

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
