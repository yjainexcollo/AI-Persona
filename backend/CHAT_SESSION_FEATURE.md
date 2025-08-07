# Chat Session Management Feature

## Overview

The Chat Session Management feature provides comprehensive tracking and management of user interactions with n8n personas. Each time a user sends a message to a persona, a unique session is created that tracks the entire conversation flow, status, and metadata.

## Key Features

### 🎯 **Session Tracking**

- **Unique Session IDs**: Each user message creates a unique session identifier
- **Status Management**: Track sessions as ACTIVE, COMPLETED, FAILED, TIMEOUT, or CANCELLED
- **Metadata Storage**: Store user agent, IP address, device info, and custom metadata
- **Error Tracking**: Capture and store error messages for failed sessions

### 🔄 **Lifecycle Management**

- **Automatic Creation**: Sessions are created when messages are sent to n8n
- **Status Updates**: Automatic status updates based on webhook responses
- **Cleanup Jobs**: Background jobs clean up expired sessions
- **Session Cancellation**: Users can cancel active sessions

### 📊 **Analytics & Monitoring**

- **Session Statistics**: Get detailed stats by user, persona, or globally
- **Performance Tracking**: Monitor session success rates and response times
- **Debugging Support**: Full session history for troubleshooting

## Database Schema

### ChatSession Model

```sql
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL UNIQUE,
    "status" "ChatSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "errorMessage" TEXT,
    PRIMARY KEY ("id")
);
```

### Message Model Updates

```sql
ALTER TABLE "messages" ADD COLUMN "chatSessionId" TEXT;
-- Foreign key to chat_sessions table
```

## API Endpoints

### Session Management

```http
# Get user's chat sessions
GET /api/chat-sessions?status=ACTIVE&limit=50&offset=0

# Get specific session details
GET /api/chat-sessions/:sessionId

# Cancel active session
PATCH /api/chat-sessions/:sessionId/cancel

# Get session statistics
GET /api/chat-sessions/stats?personaId=persona123

# Clean up expired sessions (Admin only)
POST /api/chat-sessions/cleanup
```

### Conversation Sessions

```http
# Get active sessions for a conversation
GET /api/conversations/:conversationId/chat-sessions
```

## Service Integration

### PersonaService Integration

The `sendMessage` function now:

1. **Creates a session** before sending to n8n
2. **Includes sessionId** in webhook payload
3. **Links messages** to the session
4. **Updates status** based on webhook response
5. **Handles errors** and marks sessions as failed

```javascript
// Example webhook payload sent to n8n
{
  "message": "Hello, how are you?",
  "conversationId": "conv123",
  "personaId": "persona456",
  "userId": "user789",
  "sessionId": "abc123def456" // New session identifier
}
```

## Background Jobs

### Session Cleanup

- **Frequency**: Every 6 hours
- **Purpose**: Mark old sessions as TIMEOUT
- **Configurable**: Max age (default: 24 hours)
- **Safe**: Only updates status, doesn't delete data

```javascript
// Schedule cleanup job
scheduleChatSessionCleanup(6); // Run every 6 hours
```

## Session Status Flow

```
ACTIVE → COMPLETED (successful response)
     ↓
     → FAILED (webhook error)
     → TIMEOUT (cleanup job)
     → CANCELLED (user action)
```

## Usage Examples

### Creating a Session

```javascript
const session = await chatSessionService.createChatSession(
  conversationId,
  personaId,
  userId,
  {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
    deviceInfo: req.headers["sec-ch-ua"],
  }
);
```

### Updating Session Status

```javascript
// Mark as completed
await chatSessionService.updateChatSessionStatus(sessionId, "COMPLETED");

// Mark as failed with error
await chatSessionService.updateChatSessionStatus(
  sessionId,
  "FAILED",
  "Webhook timeout after 10 seconds"
);
```

### Getting Session Statistics

```javascript
const stats = await chatSessionService.getChatSessionStats(userId);
// Returns: { total: 150, active: 5, byStatus: { ACTIVE: 5, COMPLETED: 140, FAILED: 5 } }
```

## Error Handling

### Session Creation Failures

- Database errors are caught and logged
- User receives appropriate error message
- No session is created if database fails

### Webhook Failures

- Session status updated to FAILED
- Error message stored in session
- Circuit breaker tracks failures
- Audit events logged

### Cleanup Failures

- Background job errors are logged
- Job continues running despite individual failures
- Manual cleanup endpoint available for admins

## Security Considerations

### Access Control

- Users can only access their own sessions
- Admin endpoints require ADMIN role
- Session data includes user ownership validation

### Data Privacy

- Session metadata includes IP addresses
- Consider GDPR implications for data retention
- Implement data retention policies

### Rate Limiting

- Session endpoints use persona rate limiter
- Prevents abuse of session creation
- Configurable limits per user

## Monitoring & Analytics

### Key Metrics

- **Session Success Rate**: COMPLETED / TOTAL
- **Average Response Time**: Time from creation to completion
- **Failure Distribution**: Types of failures (timeout, webhook error, etc.)
- **Active Sessions**: Real-time count of active sessions

### Debugging Support

- **Full Session History**: All messages in a session
- **Error Details**: Specific error messages for failed sessions
- **Metadata Tracking**: User agent, IP, device info
- **Timeline**: Start time, end time, duration

## Configuration

### Environment Variables

```bash
# Session cleanup interval (hours)
CHAT_SESSION_CLEANUP_INTERVAL=6

# Session timeout (hours)
CHAT_SESSION_TIMEOUT_HOURS=24

# Enable session tracking
ENABLE_CHAT_SESSIONS=true
```

### Database Indexes

Optimized indexes for common queries:

- `sessionId` (unique)
- `userId + status` (user sessions)
- `conversationId + status` (conversation sessions)
- `lastActivityAt` (cleanup queries)

## Testing

### Unit Tests

- Service layer tests for all functions
- Mock database interactions
- Error scenario testing
- Status transition testing

### Integration Tests

- End-to-end session creation
- Webhook integration testing
- Cleanup job testing
- API endpoint testing

## Migration Guide

### Database Migration

```bash
# Run the migration
npx prisma migrate dev --name add_chat_sessions

# Apply to production
npx prisma migrate deploy
```

### Code Updates

1. Update `personaService.sendMessage()` calls to include metadata
2. Add session tracking to existing message flows
3. Update frontend to handle session IDs in responses
4. Add session management UI components

## Future Enhancements

### Planned Features

- **Session Analytics Dashboard**: Real-time session monitoring
- **Session Templates**: Predefined session configurations
- **Session Export**: Export session data for analysis
- **Advanced Filtering**: Filter sessions by multiple criteria
- **Session Recovery**: Resume interrupted sessions

### Performance Optimizations

- **Session Caching**: Redis-based session caching
- **Batch Operations**: Bulk session status updates
- **Async Processing**: Background session processing
- **Database Partitioning**: Partition by date for large datasets

## Troubleshooting

### Common Issues

#### Session Not Created

- Check database connectivity
- Verify user authentication
- Check conversation ownership
- Review error logs

#### Session Status Not Updated

- Verify webhook response handling
- Check error handling in personaService
- Review session service logs
- Validate session ID format

#### Cleanup Job Not Running

- Check cron job scheduling
- Verify database permissions
- Review background job logs
- Check server timezone settings

### Debug Commands

```bash
# Check active sessions
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/chat-sessions?status=ACTIVE"

# Get session statistics
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/chat-sessions/stats"

# Manual cleanup (admin only)
curl -X POST -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:3000/api/chat-sessions/cleanup" \
  -d '{"maxAgeHours": 24}'
```

## Support

For issues or questions about the Chat Session Management feature:

1. Check the logs for error details
2. Review session statistics for patterns
3. Test with the debug endpoints
4. Contact the development team with session IDs and error messages
