# Users

Each user in the system has a separate method of authenticating and accessing
resources which is manage through JSON Web Tokens (JWT).


## List Users

Get an array of all user objects from the server. Only admins have permission to
execute this action.

### Request

```shell
curl \
  -X GET \
  -H "Authorization: Bearer eyJhbGciOiJ.eyJ1c2aaiphBq8qLA.RYqNqAFkYa8YJh" \
  http://localhost:3000/users
```

### Response

```json
{
  "ok": true,
  "message": "Users found",
  "users": [
    {
      "id": 1111,
      "username": "admin",
      "email": "admin@email.com",
      "isActive": true,
      "isAdmin": true,
      "permissions": {},
      "createdAt": "2015-11-18T16:16:29.974Z",
      "updatedAt": "2015-11-18T16:16:30.169Z"
    },
    {
      "id": 2222,
      "username": "rob",
      "email": "rob@email.com",
      "isActive": true,
      "isAdmin": false,
      "permissions": {},
      "createdAt": "2015-11-18T16:22:33.214Z",
      "updatedAt": "2015-11-18T16:22:33.408Z"
    },
    {
      "id": 3333,
      "username": "rob2",
      "email": "rob+2@email.com",
      "isActive": true,
      "isAdmin": false,
      "permissions": {},
      "createdAt": "2015-11-18T16:23:14.320Z",
      "updatedAt": "2015-11-18T16:23:14.516Z"
    }
  ]
}
```

## List Filtered Users (Basic)

You may also filter users by matching against their email address using a query
parameter and get back a list which includes only each user's id and their
profile.

### Request

```shell
curl \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/users/basic?query=rob
```

### Response

```json
{
  "ok": true,
  "message": "Users found",
  "users": [
    {
      "id": 2222,
      "profile": {
        "firstName": "Rob",
        "lastName": "McLarty"
      }
    },
    {
      "id": 3333,
      "profile": {
        "firstName": "Rob2",
        "lastName": "McLarty"
      }
    }
  ]
}
```


## Create User

Create a new user account. Only admins have permissions to perform this action.

### Request

```shell
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"rob", "password":"password", "email": "rob@email.com"}' \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/users
```

### Response

```json
{
  "ok":true,
  "message":"User created.",
  "user":{
    "id": 3333,
    "username": "rob2",
    "email": "rob+2@email.com",
    "isActive": true,
    "isAdmin": false,
    "permissions": {}
  }
}
```

## Get User

Get a user's details. Only the user themselves or an admin have permission.

### Request

```shell
curl \
  -X GET \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/users/3333
```

### Response

```json
{
  "ok": true,
  "message": "User found.",
  "user": {
    "id": 3333,
    "username": "rob2",
    "email": "rob+2@email.com",
    "isActive": true,
    "isAdmin": false,
    "permissions": {},
    "createdAt": "2015-11-18T16:23:14.320Z",
    "updatedAt": "2015-11-18T16:23:14.516Z"
  }
}
```

## Update User

Change a user's details. Only the user themselves or an admin have permission.

### Request

```shell
curl \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"email": "rob+3@email.com"}' \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/users/3333
```

### Response

```json
{
  "ok": true,
  "message": "User updated.",
  "user": {
    "id": 3333,
    "username": "rob2",
    "email": "rob+3@email.com",
    "isActive": true,
    "isAdmin": false,
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


## Remove User

Remove a user from the system. Only the user themselves or an admin have
permission.

### Request

```shell
curl \
  -X DELETE \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/users/3333
```

### Response

```json
{
  "ok": true,
  "message": "User deleted.",
  "user": {
    "id": 3333,
    "username": "rob2",
    "password": "[redacted]",
    "email": "rob+3@email.com",
    "isActive": true,
    "isAdmin": false,
    "permissions": {},
    "createdAt": "2015-11-18T16:23:14.320Z",
    "updatedAt": "2015-11-18T22:02:00.323Z"
  }
}
```
