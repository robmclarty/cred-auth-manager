# Cred Auth Manager

A centralized auth management system for handling user accounts and setting
their permissions to be used across multiple independent resource APIs by
exchanging JSON Web Tokens for valid cred(entials).

This is a demonstration and a starting point for making your own auth app for
managing your users. It includes a UI (React SPA), a simple build pipeline using
Gulp 4, and a deployment process using Gulp with rsync and ssh.

The server itself has no front-end. It is a simple JSON API. But the React app
accesses its interface and enables a UI for changing settings.

Your customer-facing apps can access the API in the same way this React app
does using the JSON API to login, get tokens, and manage settings.
