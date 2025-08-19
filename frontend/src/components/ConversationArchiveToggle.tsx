import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import WarningIcon from '@mui/icons-material/Warning';
import { toggleConversationArchive, type Conversation } from '../services/personaService';

interface ConversationArchiveToggleProps {
  conversation: Conversation;
  onArchiveChange?: (conversationId: string, archived: boolean, archivedAt: string | null) => void;
  disabled?: boolean;
  variant?: 'button' | 'icon';
}

const ConversationArchiveToggle: React.FC<ConversationArchiveToggleProps> = ({
  conversation,
  onArchiveChange,
  disabled = false,
  variant = 'button',
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'archive' | 'unarchive' | null>(null);

  const isArchived = !!conversation.archivedAt;

  const handleArchiveClick = (action: 'archive' | 'unarchive') => {
    setPendingAction(action);
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    const willArchive = pendingAction === 'archive';
    setIsUpdating(true);
    setError(null);
    setConfirmDialogOpen(false);

    try {
      const response = await toggleConversationArchive(conversation.id, willArchive);
      
      // Call the callback to update parent state
      if (onArchiveChange) {
        onArchiveChange(
          conversation.id, 
          response.data.archived, 
          response.data.archivedAt
        );
      }

      setSuccess(
        willArchive 
          ? 'Conversation archived successfully' 
          : 'Conversation unarchived successfully'
      );
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to update conversation archive status';
      setError(errorMessage);
    } finally {
      setIsUpdating(false);
      setPendingAction(null);
    }
  };

  const handleCancelAction = () => {
    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  const renderButton = () => {
    if (variant === 'icon') {
      return (
        <Button
          onClick={() => handleArchiveClick(isArchived ? 'unarchive' : 'archive')}
          disabled={disabled || isUpdating}
          size="small"
          startIcon={
            isUpdating ? (
              <CircularProgress size={16} />
            ) : isArchived ? (
              <UnarchiveIcon />
            ) : (
              <ArchiveIcon />
            )
          }
          sx={{
            minWidth: 'auto',
            px: 1,
          }}
        >
          {isArchived ? 'Unarchive' : 'Archive'}
        </Button>
      );
    }

    return (
      <Button
        onClick={() => handleArchiveClick(isArchived ? 'unarchive' : 'archive')}
        disabled={disabled || isUpdating}
        variant={isArchived ? 'outlined' : 'contained'}
        color={isArchived ? 'primary' : 'warning'}
        startIcon={
          isUpdating ? (
            <CircularProgress size={16} />
          ) : isArchived ? (
            <UnarchiveIcon />
          ) : (
            <ArchiveIcon />
          )
        }
        sx={{
          mb: 1,
        }}
      >
        {isUpdating 
          ? (isArchived ? 'Unarchiving...' : 'Archiving...') 
          : (isArchived ? 'Unarchive Conversation' : 'Archive Conversation')
        }
      </Button>
    );
  };

  return (
    <Box>
      {renderButton()}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelAction}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h6">
            {pendingAction === 'archive' ? 'Archive Conversation' : 'Unarchive Conversation'}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {pendingAction === 'archive' ? (
              <>
                Are you sure you want to archive this conversation?
              </>
            ) : (
              <>
                Are you sure you want to unarchive this conversation?
              </>
            )}
          </Typography>
          
          {pendingAction === 'archive' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Archived conversations:</strong>
              </Typography>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Cannot receive new messages</li>
                <li>Cannot be edited</li>
                <li>Cannot change visibility settings</li>
                <li>Will be moved to archived section</li>
              </ul>
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelAction} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            variant="contained"
            color={pendingAction === 'archive' ? 'warning' : 'primary'}
            startIcon={pendingAction === 'archive' ? <ArchiveIcon /> : <UnarchiveIcon />}
          >
            {pendingAction === 'archive' ? 'Archive' : 'Unarchive'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default ConversationArchiveToggle;