# Chat API (AKN chatbot proxy)

These endpoints proxy requests from this backend to the AKN chatbot service configured by `AKN_CHAT_BASE_URL`.

## Base

`/api/v1/chat`

## Auth

All endpoints require `Authorization: Bearer <access_token>`.

Non-admin users can only access their own chat (`user_id` must match `req.user.userId`). Admins can query any user.

## Endpoints

### POST `/message`

Request body:

```json
{
  "user_id": "6a097f8b3de57fa0971f3555",
  "message": "Hi, hello"
}
```

Notes:
- `user_id` is optional; if omitted, backend uses the authenticated user id (`req.user.userId`).
- Add `?raw=1` to return the chatbot service response directly (without the backend `sendResponse` wrapper).

Default response (wrapped):

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Chat reply generated successfully",
  "data": {
    "user_id": "6a097f8b3de57fa0971f3555",
    "reply": "Hey there! How's your day going so far?",
    "timestamp": "2026-05-22T09:17:53.122100"
  }
}
```

### GET `/history/:user_id`

Fetch chat history from the chatbot service.

### DELETE `/history/:user_id`

Delete chat history from the chatbot service.

### GET `/memory/:user_id`

Fetch the chatbot memory/context from the chatbot service.

