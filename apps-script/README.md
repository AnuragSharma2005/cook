# Apps Script Backend Setup

This folder contains the Google Apps Script backend for collaborator/admin login, collaborator management, and collaborator posts.

## Sheet tabs

Create a Google Sheet with these tabs, or let the script create them on first run:

- `Users`
- `Sessions`
- `Posts`

## Script properties

Set these in Apps Script project settings:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

If they are not set, the script seeds a default admin account.

## Deploy

1. Open the sheet in Apps Script.
2. Paste `Code.gs` into the editor.
3. Save the project.
4. Deploy as a Web App.
5. Allow access to `Anyone` or your preferred audience.
6. Copy the Web App URL.
7. Set `VITE_APPS_SCRIPT_WEB_APP_URL` in the frontend environment.

## Frontend env

Example:

```bash
VITE_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

## Login behavior

- Only admin-created accounts can log in.
- Invalid email/password is rejected by Apps Script.
- Collaborators can update their profile and publish posts from the studio page.
- Public likes remain browser-based in localStorage.
