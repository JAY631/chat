export interface ChatMessage {
  username: string;
  text: string;
}

export interface IncomingMessage {
  type: string;
  payload: ChatMessage;
}
