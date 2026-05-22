export type AknChatMessageRequest = {
  user_id: string;
  message: string;
};

export type AknChatMessageResponse = {
  user_id: string;
  reply: string;
  timestamp: string;
};

