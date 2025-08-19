import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { createShareableLink, type ShareableLinkResponse } from '../services/personaService';

interface ShareConversationButtonProps {
  conversationId: string;
  disabled?: boolean;
}

const ShareConversationButton: React.FC<ShareConversationButtonProps> = ({
  conversationId,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<number>(30);

  const handleOpen = () => {
    setOpen(true);
    setError(null);
    setShareLink(null);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setShareLink(null);
    setCopied(false);
  };

  const handleCreateLink = async () => {
    if (!conversationId) {
      setError('No conversation ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: ShareableLinkResponse = await createShareableLink(
        conversationId,
        expiresInDays
      );
      
      setShareLink(response.data.url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create shareable link';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy link to clipboard');
    }
  };

  return (
    <>
      <Tooltip title="Share conversation">
        <IconButton
          onClick={handleOpen}
          disabled={disabled}
          sx={{
            color: '#666',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ShareIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Share Conversation</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Create a shareable link for this conversation. Anyone with the link can view the conversation.
            </Typography>
            
            <TextField
              label="Expires in (days)"
              type="number"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              inputProps={{ min: 1, max: 365 }}
              fullWidth
              sx={{ mb: 2 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {shareLink && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Shareable Link:
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    wordBreak: 'break-all',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  }}
                >
                  {shareLink}
                </Box>
                <Button
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyLink}
                  sx={{ mt: 1 }}
                >
                  Copy Link
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleCreateLink}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Creating...' : shareLink ? 'Refresh Link' : 'Create Link'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setCopied(false)} severity="success">
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareConversationButton; 