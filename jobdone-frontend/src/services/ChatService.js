export class ChatService {
  constructor(onMessageReceived) {
    this.connected = false;
    this.onMessageReceived = onMessageReceived;
  }

  connect() {
    console.log("[ChatService] Connecting to real-time socket...");
    setTimeout(() => {
      this.connected = true;
      console.log("[ChatService] Connected.");
    }, 500);
  }

  sendMessage(chatId, messageText) {
    if (!this.connected) return;
    console.log(`[ChatService] Sending message to ${chatId}: ${messageText}`);
    
    // Simulate real-time read receipt after 2 seconds
    setTimeout(() => {
      console.log(`[ChatService] Message read by recipient in ${chatId}`);
    }, 2000);

    // Simulate real-time reply
    setTimeout(() => {
      if (this.onMessageReceived) {
        this.onMessageReceived(chatId, {
          sender: 'other',
          text: `Got it. Thanks for letting me know! (Auto-reply)`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    }, 4000);
  }
}
