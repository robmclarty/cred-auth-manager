# Resources

The authentication system can support more than just itself. You may define
additional resources/servers/apps here called "resources" and define what
actions users may optionally be permitted.


## Create new Resource

Create a new "resource" in the system. "Resources" are pointers to other server
APIs that share the same authentication system (this system). JWTs generated
from this API may be used to access data on other servers (i.e., the
"resources").

The name of the resource must be a URL-friendly string, ideally all lowercase
with words separated by dashes (e.g., "my-app-name"). The URL is the base
location on the internet where the resource server lives. This is used for
discovery by other multi-server apps.

Requires admin level access.

### Request

```shell
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{ "name": "my-app-name", "url": "https://myapp.com" }' \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/resources
```

### Response

```json
{
  "ok": true,
  "message": "Resource created",
  "resource": {
    "id": 123,
    "name": "my-app-name",
    "url": "https://myapp.com",
    "isActive": true,
    "actions": [],
    "updatedAt": "2015-11-18T18:56:09.923Z",
    "createdAt": "2015-11-18T18:56:09.922Z"
  }
}
```

## List Resources

Get a list of all resources in the system. Requires admin-level access.

### Request

```shell
curl \
  -X GET \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/resources
```

### Response

```json
{
  "ok": true,
  "message": "Resources found",
  "apps": [
    {
      "id": 1111,
      "name": "my-app-name",
      "url":"https://myapp.com",
      "isActive": true,
      "actions": [
        "users:read",
        "users:write",
        "special-action",
        "something-else"
      ],
      "updatedAt": "2015-11-18T19:48:03.668Z",
      "createdAt": "2015-11-18T18:55:41.587Z"
    },
    {
      "id": 2222,
      "name": "another-resource",
      "url":"https://another-resource.com",
      "isActive": true,
      "actions": [],
      "updatedAt": "2015-11-18T18:56:09.923Z",
      "createdAt": "2015-11-18T18:56:09.922Z"
    }
  ]
}
```


## Get Resource Details

Get information about an app. Requires either a super-admin or a user with the
"admin" permission for this app.

### Request

```shell
curl \
  -X GET \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/resources/my-app-name
```

### Response

```json
{
  "ok": true,
  "message": "Resource found",
  "app": {
    "id": 1111,
    "name": "my-app-name",
    "url":"https://myapp.com",
    "isActive": true,
    "actions": [
      "users:read",
      "users:write",
      "special-action",
      "something-else"
    ],
    "updatedAt": "2015-11-30T20:29:23.396Z",
    "createdAt": "2015-11-30T19:53:44.184Z"
  }
}
```


## Update a Resource

Change the details of a resource. Requires either an admin or a user with the
"admin" permission for this resource. Only include the data that is changing. If
an attribute remains the same, you may simply omit it.

### Requests

```shell
curl
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"name": "my-new-app-name", "isActive": false}' \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/resources/1111
```

### Response

```json
{
  "ok": true,
  "message": "Resource updated",
  "app": {
    "id": 1111,
    "name": "my-new-app-name",
    "url":"https://myapp.com",
    "isActive": false,
    "actions": [
      "users:read",
      "users:write",
      "special-action",
      "something-else"
    ],
    "updatedAt": "2015-11-18T21:10:17.767Z",
    "createdAt": "2015-11-18T18:55:41.587Z"
  }
}
```


## Remove a Resource

Delete a resource from the system. Requires either an admin or a user with the
"admin" permission for this resource.

### Request

```shell
curl \
  -X DELETE \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/resources/1111
```

### Response

```json
{
  "ok": true,
  "message": "Resource deleted",
  "app": {
    "id": 1111,
    "name": "my-new-app-name",
    "url":"https://myapp.com",
    "isActive": false,
    "actions": [
      "users:read",
      "users:write",
      "special-action",
      "something-else"
    ],
    "updatedAt": "2015-11-18T21:20:39.078Z",
    "createdAt": "2015-11-18T21:20:39.073Z"
  }
}
```


## Add Actions to an existing Resource

Create a new action for a resource. Requires an admin or a user with the "admin"
permission for this resource.

"Actions" are the permissible actions which may be assigned to a user for
different authorization control. For example, a user with the "users:read"
action will be able to `GET` user data and read it, but without the
"users:write" action they will not be able to change, modify, or delete any user
data. This is an example of how you might want to grant limited access to
certain accounts while enabling greater control for other, more trusted,
accounts.

These actions represent what's *possible* for this resource and will show up in
the list of permissions that may be assigned to users on their details pages.

The main thing to keep in mind, is that these actions need to be enforced on the
resource server for them to have any meaning. You can make as many actions as
you like. You could use very general actions like "admin" and "user", or you
could get very granular like "can-write-resource-name" (which would potentially
allow a user to change a resource's name, but nothing else). You could build up
a large set of specific actions in order to enable users to have very fine-
grained control over resources. Just keep in mind that the corresponding
resource server needs to enforce these actions (i.e., restrict access based on
these specific action names as permissions attached to the user's JWT).

NOTE: Modifications are done by creating an array of all unique action names.
Duplicates will be dropped such that there is only one instance of each unique
name. Using this action with the `PUT` verb is only additive. Any actions sent
to the server will be added and none will be removed.

In the example below, the resource already has `["admin", "user"]` actions, and
thus, the new "admin" action name sent in the request to the server is ignored
because it already exists. However, the "test" action name does not yet exist,
so it is appended.

Returns the newly updated array of actions for the resource.

### Request

```shell
curl \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{ "actions": ["admin", "test"] }' \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/resources/1111/actions
```

### Response

```json
{
  "ok": true,
  "message": "Actions updated",
  "actions": [
    "admin",
    "user",
    "test"
  ]
}
```


## Get list of Actions for Resource

Get an array of all actions for a resource. Requires an admin or a user with the
"admin" permission for the resource. Will return an array of actions for the
resource.

### Request

```shell
curl \
  -X GET \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/resources/1111/actions
```

### Response

```json
{
  "ok": true,
  "message": "Actions found",
  "actions": [
    "user",
    "admin",
    "test"
  ]
}
```


## Delete Actions from Resource

Remove actions from a resource. Requires an admin or a user with the "admin"
permission for this resource. Send an array labeled "actions" with a list of all
actions to be removed. Actions which do not exist will be ignored. An array of
the remaining, valid, actions is returned in the response.

### Request

```shell
curl \
  -X DELETE \
  -H "Content-Type: application/json" \
  -d '{ "actions": ["test"] }' \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/resources/1111/actions
```

### Response

```json
{
  "ok": true,
  "message": "Action removed",
  "actions": [
    "user",
    "admin"
  ]
}
```
