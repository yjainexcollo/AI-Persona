import React from "react";
import { Box } from "@mui/material";
import ChatHistoryItem from "./ChatHistoryItem";

export interface Chat {
  avatar: string;
  name: string;
  message: string;
  date: string;
  archived?: boolean;
  onClick?: () => void;
  onRightClick?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onShare?: () => void;
  onConversationSettings?: () => void;
}

interface ChatHistoryListProps {
  chats: Chat[];
}

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({
  chats,
}) => (
  <Box ml={2}>
    {chats.map((chat, idx) => (
      <Box key={idx} sx={{ mb: 0.5 }}>
        <ChatHistoryItem 
          avatar={chat.avatar}
          name={chat.name}
          message={chat.message}
          date={chat.date}
          archived={chat.archived}
          onClick={chat.onClick}
          onRightClick={chat.onRightClick}
          onArchive={chat.onArchive}
          onUnarchive={chat.onUnarchive}
          onShare={chat.onShare}
          onConversationSettings={chat.onConversationSettings}
        />
      </Box>
    ))}
  </Box>
);

export default ChatHistoryList;