import React, { useState } from 'react';
import {
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Typography,
  CircularProgress,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ShareIcon from '@mui/icons-material/Share';
import { updateConversationVisibility, type Conversation } from '../services/personaService';

interface ConversationVisibilityToggleProps {
  conversation: Conversation;
  onVisibilityChange?: (conversationId: string, newVisibility: 'PRIVATE' | 'SHARED') => void;
  disabled?: boolean;
  showLabel?: boolean;
}

const ConversationVisibilityToggle: React.FC<ConversationVisibilityToggleProps> = ({
  conversation,
  onVisibilityChange,
  disabled = false,
  showLabel = true,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleVisibilityChange = async (
    _event: React.MouseEvent<HTMLElement>,
    newVisibility: 'PRIVATE' | 'SHARED' | null
  ) => {
    if (!newVisibility || newVisibility === conversation.visibility) {
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await updateConversationVisibility(conversation.id, newVisibility);
      
      // Call the callback to update parent state
      if (onVisibilityChange) {
        onVisibilityChange(conversation.id, response.data.visibility);
      }

      setSuccess(`Conversation visibility updated to ${newVisibility.toLowerCase()}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update conversation visibility';
      setError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  return (
    <Box>
      {showLabel && (
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Conversation Visibility
        </Typography>
      )}
      
      <ToggleButtonGroup
        value={conversation.visibility}
        exclusive
        onChange={handleVisibilityChange}
        disabled={disabled || isUpdating}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            px: 2,
            py: 1,
            border: '1px solid',
            borderColor: 'divider',
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            },
          },
        }}
      >
        <ToggleButton value="PRIVATE">
          <Tooltip title="Only you can see this conversation">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LockIcon fontSize="small" />
              <Typography variant="body2">Private</Typography>
              {isUpdating && conversation.visibility === 'PRIVATE' && (
                <CircularProgress size={16} />
              )}
            </Box>
          </Tooltip>
        </ToggleButton>
        
        <ToggleButton value="SHARED">
          <Tooltip title="Anyone in your workspace can see this conversation">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShareIcon fontSize="small" />
              <Typography variant="body2">Shared</Typography>
              {isUpdating && conversation.visibility === 'SHARED' && (
                <CircularProgress size={16} />
              )}
            </Box>
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>

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

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ConversationVisibilityToggle;