import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { toggleMessageReaction, type ReactionResponse } from '../services/personaService';

interface Reaction {
  id: string;
  type: 'LIKE' | 'DISLIKE';
  userId: string;
  createdAt: string;
}

interface MessageReactionProps {
  messageId: string;
  reactions?: Reaction[];
  currentUserId: string;
  onReactionUpdate?: (messageId: string, reaction: ReactionResponse['data']) => void;
  disabled?: boolean;
}

const MessageReaction: React.FC<MessageReactionProps> = ({
  messageId,
  reactions = [],
  currentUserId,
  onReactionUpdate,
  disabled = false,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user's reaction
  const currentUserReaction = reactions.find(r => r.userId === currentUserId);
  const likeCount = reactions.filter(r => r.type === 'LIKE').length;
  const dislikeCount = reactions.filter(r => r.type === 'DISLIKE').length;

  const handleReactionClick = async (type: 'LIKE' | 'DISLIKE') => {
    if (disabled || isUpdating) return;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await toggleMessageReaction(messageId, type);
      
      // Call the callback to update parent state
      if (onReactionUpdate) {
        onReactionUpdate(messageId, response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to update reaction';
      setError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
        {/* Like Button */}
        <Tooltip title={`${likeCount} like${likeCount !== 1 ? 's' : ''}`}>
          <IconButton
            size="small"
            onClick={() => handleReactionClick('LIKE')}
            disabled={disabled || isUpdating}
            sx={{
              color: currentUserReaction?.type === 'LIKE' ? '#1976d2' : '#666',
              bgcolor: currentUserReaction?.type === 'LIKE' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: currentUserReaction?.type === 'LIKE' 
                  ? 'rgba(25, 118, 210, 0.2)' 
                  : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            {isUpdating ? (
              <CircularProgress size={16} />
            ) : (
              <ThumbUpIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {/* Dislike Button */}
        <Tooltip title={`${dislikeCount} dislike${dislikeCount !== 1 ? 's' : ''}`}>
          <IconButton
            size="small"
            onClick={() => handleReactionClick('DISLIKE')}
            disabled={disabled || isUpdating}
            sx={{
              color: currentUserReaction?.type === 'DISLIKE' ? '#d32f2f' : '#666',
              bgcolor: currentUserReaction?.type === 'DISLIKE' ? 'rgba(211, 47, 47, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: currentUserReaction?.type === 'DISLIKE' 
                  ? 'rgba(211, 47, 47, 0.2)' 
                  : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            {isUpdating ? (
              <CircularProgress size={16} />
            ) : (
              <ThumbDownIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MessageReaction; 