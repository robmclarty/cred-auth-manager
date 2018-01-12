# Permissions

Permissions grant granular authorization to users over specific resources
in the authentication system.


## Get Permissions

Get all permissible actions for a single resource for a specific user. Requires
an admin or a user with the "admin" permission for this resource.

### Request

```shell
curl \
  -X GET \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/users/1111/permissions/my-app-name
```

### Response

```json
{
  "ok": true,
  "message": "Permissions found.",
  "actions": [
    "users:read",
    "users:write"
  ]
}
```


## Create or Update Permissions

Permissions are set as an array of strings associated with a single resource.
The resource's set of actions determines which actions are allowed to be added
to a user's permissions. Only admin's can modify a user's permissions.

**IMPORTANT**: Omitting an action which already exists in a user's permission
for an app will *remove* it. *Only* the actions which are submitted through this
endpoint will be saved and omitted actions will be removed (i.e., this endpoint
overwrites existing permission/action data). For example, the user in the
example below may have had the "admin" permission assigned to them, but through
updating this user with an array of actions which only include ["test", "user"],
that permission will be removed.

One more note: any actions which are submitted which do not correspond to the
set of valid actions stored in the resource itself will simply be ignored. For
example, the request below includes a "fake-action" which is not included in the
user's `my-app-name` permissions because it does not exist in the `my-app-name`
resource's set of valid actions.

### Request

```shell
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"actions": ["users:read", "users:write", "fake-action"]}' \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/users/1111/permissions/my-app-name
```

### Response

```json
{
  "ok": true,
  "message": "Permissions updated.",
  "user": {
    "id": 1111,
    "username": "rob",
    "email": "rob@email.com",
    "isActive": true,
    "isSuperAdmin": false,
    "permissions": {
      "my-app-name": {
        "actions": [
          "users:read",
          "users:write"
        ]
      },
      "another-app": {
        "actions": [
          "something",
          "another:thing"
        ]
      }
    },
    "createdAt": "2015-11-18T16:22:33.214Z",
    "updatedAt": "2015-11-19T17:54:42.152Z"
  }
}
```


## Remove Permissions

Remove all permissions for a single resource from a user. Requires an admin or
a user with the "admin" permission for this resource.

**NOTE**: The same effect could be had by using the update endpoint above and
supplying an empty array, however this endpoint completely removes the entire
resource permissions entry from the user altogether (which saves a bit of space
in the token payload).

### Request

```shell
curl \
  -X DELETE \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/users/1111/permissions/another-app
```

### Response

```json
{
  "ok": true,
  "message": "Permissions deleted.",
  "user": {
    "id": 1111,
    "username": "rob",
    "email": "rob@email.com",
    "isActive": true,
    "isSuperAdmin": false,
    "permissions": {
      "my-app-name": {
        "actions": [
          "users:read",
          "users:write"
        ]
      }
    },
    "createdAt": "2015-11-18T16:22:33.214Z",
    "updatedAt": "2015-11-19T17:54:42.152Z"
  }
}
```
