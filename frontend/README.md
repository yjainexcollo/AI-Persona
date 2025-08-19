## AI Persona Frontend

A modern React + TypeScript application for the AI Persona platform. It provides persona discovery, chat, history, profile, and workspace UX with a clean MUI design and strong API integration.

## Overview

- Built with Vite, React 18, TypeScript, and MUI 5
- Uses REST APIs exposed by the backend (`VITE_BACKEND_URL`)
- Opinionated UX: minimal chrome, responsive layout, keyboard-friendly
- Branding: Crudo.ai across headers and sidebars

## Features

- Persona Discovery and viewing profiles
- One-click “Start Chat” with any persona
- Chat with file upload support (images, PDFs)
- Message editing (user messages) and AI response copying
- Reactions on AI messages (Like/Dislike); reactions are hidden on user messages
- Conversation Settings (visibility, archive) and Shareable links
- Chat History lists sessions from `/api/chat-sessions` and opens the exact session
- Favorites: toggle persona as favorite from the persona view page
- Profile popover (avatar, name, email) with Profile, Settings, Sign out
- Full-screen Settings dialog (prevents overflow on small screens)
- Robust CORS-safe avatar handling via `getAvatarUrl` helper

## Tech Stack

- React 18, TypeScript
- Vite 6
- Material-UI (MUI) 5
- React Router DOM 6
- ESLint

## Project Structure

```
src/
├── components/
│   ├── Auth/                    # Login/Register/Reset/2FA dialogs
│   ├── chatHistory/             # History list, item, tabs
│   ├── discover/                # Top header for Discovery & shared header UX
│   ├── personaSelector/         # Selector grid & header
│   ├── sidebar/                 # App sidebar with recent/favorites
│   ├── viewPersona/             # Persona view header, sections, sidebar
│   ├── ChatHeader.tsx           # Chat page header (Discover, Chat History)
│   ├── ChatInputBar.tsx         # Message input with file uploads
│   ├── CommonNavbar.tsx         # Workspace/User common navbar
│   ├── ConversationSettingsDialog.tsx
│   ├── FormattedOutput.tsx      # Render markdown-like content
│   ├── GlobalLoader.tsx         # Loader
│   ├── MessageReaction.tsx      # Like/Dislike on AI messages
│   ├── Pagination.tsx
│   ├── PersonaCard.tsx
│   └── PersonaGrid.tsx
├── pages/
│   ├── ChatPage.tsx             # Chat experience
│   ├── ChatHistoryPage.tsx      # Lists chat sessions (from /api/chat-sessions)
│   ├── Discovery.tsx            # Browse personas
│   ├── ProfilePage.tsx
│   ├── SettingsPage.tsx         # Full-screen dialog when opened from headers
│   ├── WorkspaceDashboard.tsx
│   └── ...                      # Other pages
├── services/                    # REST services (persona/chat/etc.)
├── utils/                       # fetchWithAuth, session mgmt, avatar helpers
├── hooks/
├── types/
├── App.tsx, main.tsx, index.css
```

## Routing Quick Reference

- `/discovery` — Persona discovery page (primary entry)
- `/chat/:personaId` — Chat with a persona
  - Opens chat with optional `?conversationId=<id>&sessionId=<id>`
  - If `sessionId` is present, loads full history via `/api/chat-sessions/:sessionId`
- `/chat-history` — Lists chat sessions from `/api/chat-sessions`
- `/view-persona/:personaId` — Persona profile with Favorite toggle
- `/profile` — User profile
- `/settings` — Settings (also opened as full-screen dialog from headers)
- `/` — Workspace landing (internal)

## Key UX Details

- Discover header and Chat header are aligned. The “Discover” button on Chat header navigates to `/discovery`.
- Profile avatar in headers uses the currently logged-in user; clicking opens a popover with: Profile, Settings, Sign out.
- Settings opens as a full-screen dialog to avoid overflow issues on mobile.
- View Persona page has a Favorite toggle button; the hamburger menu is removed to simplify actions.
- Chat page: reactions (Like/Dislike) are shown only for AI messages; user messages don’t show reactions.
- Chat page: user messages support edit, with a basic client-side recent-edit check.

## Services (API Client)

All services use `fetchWithAuth` which injects auth headers from session storage.

### Personas

- `getPersonas(favouritesOnly?: boolean)` → GET `/api/personas` (+ `?favouritesOnly=true`)
- `getPersonaById(personaId)` → GET `/api/personas/:personaId`
- `toggleFavourite(personaId)` → POST `/api/personas/:personaId/favourite` ⇒ `{ isFavourited }`

### Chat & Conversations

- `sendMessageToPersona(personaId, message, conversationId?, fileId?)`
  → POST `/api/personas/:personaId/chat` ⇒ `{ data: { reply, conversationId, messageId } }`
- `getConversations(archived?)` → GET `/api/conversations`
- `updateConversationVisibility(conversationId, visibility)` → PATCH `/api/conversations/:id/visibility`
- `toggleConversationArchive(conversationId, archived)` → PATCH `/api/conversations/:id/archive`
- `editMessage(messageId, content)` → PATCH `/api/messages/:messageId`
- `toggleMessageReaction(messageId, type)` → POST `/api/messages/:messageId/reactions`

### Files

- `requestFileUpload(conversationId, { filename, mimeType, sizeBytes })` → POST `/api/conversations/:id/files`
  - Returns a presigned URL + fileId. Use PUT to upload file, then include `fileId` on `sendMessageToPersona`.

### Sharing

- `createShareableLink(conversationId, expiresInDays?)` → POST `/api/conversations/:id/share`
- `getSharedConversation(token)` → GET `/p/:token`

### Sessions

- `getUserChatSessions()` → GET `/api/chat-sessions` (used for Chat History)
- `getChatSessionById(sessionId)` → GET `/api/chat-sessions/:sessionId`

## Components At-a-Glance

- `ChatHeader` — Top navigation for chat; Discover/Chat History buttons; profile popover; full-screen settings dialog.
- `discover/Header` — Shared header used on discovery/history; shows profile avatar/popover.
- `ChatInputBar` — Message input with drag-drop file upload; uses `requestFileUpload` then `sendMessageToPersona` with `fileId`.
- `MessageReaction` — Like/Dislike on AI messages only.
- `ConversationSettingsDialog` — Edit conversation visibility, archive/unarchive, generate share links.
- `chatHistory/*` — History list, item menu (Share + Conversation Settings), navigation passes `sessionId` so the chat opens with the exact session.
- `viewPersona/ViewPersonaHeader` — Persona profile header with Start Chat + Favorite toggle. Hamburger/menu removed.
- `sidebar/Sidebar` — Shows Favorites (derived from personas with `isFavourited`) and recent chats.

## Environment

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:3000
```

Tips:
- Images and avatars may be stored as relative paths like `/uploads/...`. The app uses `getAvatarUrl()` to build full URLs using `VITE_BACKEND_URL` and avoid browser CORS issues.
- Ensure the backend enables CORS for `http://localhost:5173` and serves `/uploads` with permissive headers.

## Development

1) Install deps: `npm install`
2) Start dev server: `npm run dev`
3) Lint: `npm run lint`
4) Build: `npm run build`
5) Preview: `npm run preview`

## Common Flows

- Open past chat from history: History fetches sessions via `/api/chat-sessions`. Clicking a chat navigates to `/chat/:personaId?conversationId=...&sessionId=...`. Chat page detects `sessionId` and loads full history.
- Share/Visibility/Archive: Use the item hamburger menu in history or sidebar recent chats to open Conversation Settings.
- Favorites: On View Persona, click “Mark as favorite” to toggle; button switches to “Remove Favorite”. Sidebar favorites section auto-populates from personas with `isFavourited`.

## Code Style & Conventions

- TypeScript-first, avoid `any` in new code
- DRY and small, focused components
- Early returns and flat control flow
- MUI styling via `sx`; avoid inline styles where possible

## Troubleshooting

- Avatars not loading (NotSameOrigin): set `VITE_BACKEND_URL`, ensure backend CORS for `/uploads`, and rely on `getAvatarUrl()`.
- Settings dialog overflow: handled by full-screen dialog; if you embed Settings elsewhere, consider `fullScreen` for small screens.
- Opening past chat shows new chat: ensure `sessionId` is passed from history; Chat reads it and loads session messages.

## Security

- Auth via `fetchWithAuth` (adds Authorization and workspace headers)
- Logout clears local storage and redirects to login

## Notes

- `getConversationById` was removed; use `getConversations()` and/or `getChatSessionById()`.
- Reactions UI hidden for user messages by design.


