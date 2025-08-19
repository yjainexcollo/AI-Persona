import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  Container,
  Button,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { getSharedConversation, type SharedConversationResponse } from '../services/personaService';
import FormattedOutput from '../components/FormattedOutput';

interface SharedConversationPageProps {}

const SharedConversationPage: React.FC<SharedConversationPageProps> = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversationData, setConversationData] = useState<SharedConversationResponse['data'] | null>(null);

  useEffect(() => {
    const loadSharedConversation = async () => {
      if (!token) {
        setError('No token provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await getSharedConversation(token);
        setConversationData(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load shared conversation';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadSharedConversation();
  }, [token]);

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading shared conversation...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
        }}
      >
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Go Back
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (!conversationData) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
        }}
      >
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="warning">
              No conversation data found
            </Alert>
            <Button
              variant="contained"
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
              sx={{ mt: 2 }}
            >
              Go Back
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        py: 2,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Paper sx={{ p: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
            <Typography variant="h5" component="h1">
              Shared Conversation
            </Typography>
          </Box>
          
          {/* Persona Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {conversationData.persona.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {conversationData.persona.description}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Messages */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Conversation
          </Typography>
          
          <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {conversationData.messages.map((message, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    mb: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: message.role === 'USER' ? 'primary.main' : 'secondary.main',
                      width: 32,
                      height: 32,
                      fontSize: '0.875rem',
                    }}
                  >
                    {message.role === 'USER' ? 'U' : 'A'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      {message.role === 'USER' ? 'User' : conversationData.persona.name}
                    </Typography>
                    
                    <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                      <FormattedOutput content={message.content} />
                      
                      {message.fileUrl && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Attachment:
                          </Typography>
                          <Box
                            component="a"
                            href={message.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              color: 'primary.main',
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            View File
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
                
                {index < conversationData.messages.length - 1 && (
                  <Divider sx={{ my: 2 }} />
                )}
              </Box>
            ))}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SharedConversationPage; 