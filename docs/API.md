# CollabSpace API Documentation

## Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user and get tokens
- `POST /api/auth/refresh` - Get a new access token using refresh token

## Workspaces
- `GET /api/workspaces` - Get all workspaces for the logged-in user
- `POST /api/workspaces` - Create a new workspace
- `GET /api/workspaces/:id` - Get details of a specific workspace
- `POST /api/workspaces/:id/invite` - Invite a user to the workspace (Admin only)

## Tasks
- `GET /api/tasks?workspaceId=...` - Get tasks for a workspace (supports cursor pagination)
- `POST /api/tasks` - Create a new task in a workspace
- `PUT /api/tasks/:id` - Update task details
- `DELETE /api/tasks/:id` - Delete a task (Admin only)
- `POST /api/tasks/reorder` - Update task order (drag-and-drop)
- `GET /api/tasks/analytics?workspaceId=...` - Get task statistics

## Socket Events
- **Client Emits:** `join-workspace`, `leave-workspace`
- **Server Emits:** `task-created`, `task-updated`, `task-deleted`, `task-moved`
