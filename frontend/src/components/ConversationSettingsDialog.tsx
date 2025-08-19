import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ConversationVisibilityToggle from './ConversationVisibilityToggle';
import ConversationArchiveToggle from './ConversationArchiveToggle';
import { type Conversation } from '../services/personaService';

interface ConversationSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  onConversationUpdate?: (conversationId: string, updates: Partial<Conversation>) => void;
}

const ConversationSettingsDialog: React.FC<ConversationSettingsDialogProps> = ({
  open,
  onClose,
  conversation,
  onConversationUpdate,
}) => {
  const [localConversation, setLocalConversation] = useState<Conversation | null>(conversation);

  // Update local state when conversation prop changes
  React.useEffect(() => {
    setLocalConversation(conversation);
  }, [conversation]);

  const handleVisibilityChange = (conversationId: string, newVisibility: 'PRIVATE' | 'SHARED') => {
    // Update local state
    if (localConversation) {
      const updatedConversation = { ...localConversation, visibility: newVisibility };
      setLocalConversation(updatedConversation);
      
      // Notify parent component
      if (onConversationUpdate) {
        onConversationUpdate(conversationId, { visibility: newVisibility });
      }
    }
  };

  const handleArchiveChange = (conversationId: string, _archived: boolean, archivedAt: string | null) => {
    // Update local state
    if (localConversation) {
      const updatedConversation = { ...localConversation, archivedAt };
      setLocalConversation(updatedConversation);
      
      // Notify parent component
      if (onConversationUpdate) {
        onConversationUpdate(conversationId, { archivedAt });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!localConversation) {
    return null;
  }

  const isArchived = !!localConversation.archivedAt;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon color="primary" />
          <Typography variant="h6">Conversation Settings</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Conversation Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Conversation Details
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MessageIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Title:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {localConversation.title || 'Untitled Conversation'}
              </Typography>
            </Box>

            {/* Persona */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Persona:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {localConversation.persona.name}
              </Typography>
            </Box>

            {/* Message Count */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MessageIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Messages:
              </Typography>
              <Chip 
                label={`${localConversation._count?.messages || localConversation.messageCount || 0} messages`} 
                size="small" 
                variant="outlined"
              />
            </Box>

            {/* Created Date */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Created:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatDate(localConversation.createdAt)}
              </Typography>
            </Box>

            {/* Archive Status */}
            {isArchived && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Archived:
                </Typography>
                <Chip 
                  label={formatDate(localConversation.archivedAt!)} 
                  size="small" 
                  color="warning"
                  variant="outlined"
                />
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Visibility Settings */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Privacy Settings
          </Typography>
          
          {isArchived ? (
            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Visibility cannot be changed for archived conversations.
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Current visibility:
                </Typography>
                <Chip 
                  label={localConversation.visibility} 
                  size="small" 
                  variant="outlined"
                />
              </Box>
            </Box>
          ) : (
            <ConversationVisibilityToggle
              conversation={localConversation}
              onVisibilityChange={handleVisibilityChange}
              showLabel={false}
            />
          )}
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {localConversation.visibility === 'PRIVATE' 
              ? 'Only you can see this conversation.' 
              : 'Anyone in your workspace can see this conversation.'
            }
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Archive Settings */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Archive Settings
          </Typography>
          
          <ConversationArchiveToggle
            conversation={localConversation}
            onArchiveChange={handleArchiveChange}
            variant="button"
          />
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {isArchived 
              ? 'This conversation is archived and cannot receive new messages or be edited.' 
              : 'Archive this conversation to move it out of your active conversations.'
            }
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConversationSettingsDialog;