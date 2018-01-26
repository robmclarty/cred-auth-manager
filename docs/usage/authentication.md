# Authentication

Users may authenticate using either the *basic* (username+password) method or
using *facebook* login. If valid credentials are provided, two JSON Web Tokens
will be returned which are used for authorizing access to resources.


## Login (Basic)

Logging into the system requires a valid username + password combination which
can be exchanged for two JSON Web Tokens (`accessToken` and `refreshToken`).
The `accessToken` may be used to request resources and makes changes to other
resource servers and the auth-manager server. The `refreshToken` is used only
for 1) revoking the tokens (i.e., logging out), or 2) refreshging the
`accessToken` if it becomes expired. The `refreshToken` will remain valid for
approximately 1 week while the `accessToken` is only valid for approximately
1 hour.

### Request

```shell
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin", "password":"password"}' \
  http://localhost:3000/tokens
```

### Response

```json
{
  "ok": true,
  "message": "Tokens generated successfully",
  "accessToken": "eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFkZGU2.i9YYifTpQsmKWA4G",
  "refreshToken": "i9YYifTpQsmKWA4G.eyJqdGkiOiJhMDFkZGU2.eyJ0eXAiOiJKV1"
}
```


## Login (Facebook)

You may alternatively login using Facebook's login.

### Request

```shell
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{ "facebookId": "623523423", "facebookToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9" }' \
  http://localhost:3000/tokens/facebook
```

### Response

```json
{
  "ok": true,
  "message": "Tokens generated successfully",
  "accessToken": "eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFkZGU2.i9YYifTpQsmKWA4G",
  "refreshToken": "i9YYifTpQsmKWA4G.eyJqdGkiOiJhMDFkZGU2.eyJ0eXAiOiJKV1",
  "userId": 123,
  "username": "john"
}
```


## Logout or Revoke Token

Logging out is essentially revoking the long-lived refresh token, preventing
new access tokens from being generated without inputing credentials again. The
server maintains a whitelist of valid tokens in an LRU cache and when a token
naturally expires, or is explicitly revoked with this endpoint, it is removed
from the whitelist and is no longer valid.

To revoke a refresh token, you must provide a valid refresh token in the
Authorization header, and revoke a token in one of two ways:

1. Simply revoke the token in the Authorization header

2. Revoke a different token by providing it in the body (only works if the
user associated with the token in the Auth header has permission to do so)

**NOTE**: only this endpoint, and the refresh endpoint (below) take the refresh
token in the Authorization header like this. Every other endpoint takes the
*access* token.

### Request

**revoke your own token**

```shell
curl \
  -X DELETE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/tokens
```

**revoke someone else's token**

```shell
curl \
  -X DELETE \
  -H "Content-Type: application/json" \
  -d '{"token": "i9YYifTpQsmKWA4G.eyJqdGkiOiJhMDFkZGU2.eyJ0eXAiOiJKV1"}' \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/tokens
```

### Response

```json
{
  "ok": true,
  "message": "Token revoked",
  "token": "eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG"
}
```


## Refresh Access Token

Access tokens are short-lived by design so that if they are intercepted or
discovered (for whatever reason) they will automatically expire and become
invalid without any action being taken. However, users may want to continue
using the system without requiring to login every hour. This is why we also
provide a longer-lived refresh token which may be used to automatically request
new, valid, access tokens. The longer-lived refresh token is referenced from
a whitelist which can optionally be revoked by an admin or otherwise invalidated
by the user to prevent a potential attacker who has compromised the token from
using it.

To refresh an access token, simply PUT to the `/tokens` endpoint with the
refresh token in the Authorization header. NOTE: only this endpoint, and the
revocation endpoint (above) take the refresh token in the Authorization header
like this. Every other endpoint takes the *access* token.

### Request

```shell
curl \
  -X PUT \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/tokens
```

### Response

```json
{
  "ok": true,
  "message": "Token refreshed",
  "accessToken": "eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG",
  "refereshToken": "eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG"
}
```


## Email Password Reset Link

Requesting a password-reset link be sent to a user's email will *always*
return a successful 200 response, even if the email sent does not exist in the
system. Because this endpoint is public and does not require authentication,
this behaviour helps protect user email accounts from attackers that would use
this endpoint to validate existing email addresses. If every response returns
200 regardless of validity, attackers will not be able to use this endpoint to
gain any meaningful information from the system.

### Request

```shell
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "rob@email.com"}' \
  http://localhost:3000/password-reset
```

```shell
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "rob@email.com"}' \
  http://localhost:3000/password-reset
```

### Response

```
200
```


## Get Password Reset Form

While not absolutely necessary, this form represents the page that is rendered
from the URL sent in the password-reset email link. It will include the reset
token which is also in the link and submit the update-password request with
that token. The update-password request *could* be executed by another means
as long as the reset token is provided in the Authorization header like in the
following example.

### Request

```shell
curl \
  -X GET \
  http://localhost:3000/admin/reset_password?
token=eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG
```

### Response

```
200 / HTML Form
```


## Update User Password

Send a new password to the server. The user account that receives the new
password is in the reset token. Only the owner of the account, or an admin,
will have permissions to change the password. The reset token can optionally be
included in the url as "?token=aaa.bbb.ccc".

### Request

**reset token in body**

```shell
curl \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"password": "new-password"}' \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/password-reset
```

**reset token in url**

```shell
curl \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"password": "password2"}' \
  http://localhost:3000/password-reset?
token=eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG
```

### Response

```json
{
  "ok": true,
  "message": "Password updated",
  "user": {
    "id": 123,
    "username": "rob",
    "email": "rob@email.com",
    "isActive": true,
    "isAdmin": false,
    "permissions": {}
  }
}
```
