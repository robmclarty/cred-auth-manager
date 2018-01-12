# Groups

A group is a way for users to organize their friendships with other users.
You may group other people into collections (e.g., "family", "teammates",
"doctors", etc.). You must still accept each user as a friend before you may add
them to one of your groups.

A group is just an sub-array of your friends with a label applied to it.


## Create a New Group

`POST /users/:user_id/groups`

Create a new group for yourself out of your list of existing friends. Give it
a name, and an array of ids which is a subset of your total friends.

### Request

```shell
curl \
  -X POST \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Family", "members": [12, 34, 56] }' \
  http://localhost:3000/users/1111/groups
```

### Response

```json
{
  "ok": true,
  "message": "Group created",
  "group": {
    "id": 123,
    "name": "Family",
    "members": [
      {
        "id": 12,
        "username": "john"
      },
      {
        "id": 34,
        "username": "jane"
      },
      {
        "id": 56,
        "username": "alberto"
      }
    ]
  }
}
```


## List Groups

`GET /users/:user_id/groups`

Get a list of all your active groups. Will return an array of each group, which
themselves include a `members` array of each user which is a member.

### Request

```shell
curl \
  -X GET \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/users/1111/groups
```

### Response

```json
{
  "ok": true,
  "message": "Groups found",
  "groups": [
    {
      "id": 123,
      "name": "Family",
      "members": [...]
    }, {
      "id": 456,
      "name": "Friends",
      "members": [...]
    }
  ]
}
```


## Get Group Details

`GET /users/:user_id/groups/:group_id`

Retrieve an individual group, which its array of members.

### Request

```shell
curl \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/users/1111/groups/123
```

### Response

```json
{
  "ok": true,
  "message": "Group found",
  "group": {
    "id": 123,
    "name": "Family",
    "members": [
      {
        "id": 56,
        "username": "alberto"
      }
    ]
  }
}
```


## Update a Group

`PUT /users/:user_id/groups/:group_id`

Modify the values for an existing group.

### Request

```shell
curl \
  -X PUT \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Family", "members": [2222, 3333] }' \
  http://localhost:3000/users/1111/groups/123
```

### Response

```json
{
  "ok": true,
  "message": "Group updated",
  "group": {
    "id": 123,
    "name": "Family",
    "contacts": [
      {
        "id": 2222,
        "username": "peter"
      },
      {
        "id": 3333,
        "username": "amy"
      }
    ]
  }
}
```


## Delete a Group

`DELETE /users/:user_id/groups/:group_id`

Remove a group from your account.

### Request

```shell
curl \
  -X DELETE \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/users/1111/groups/123
```

### Response

```json
{
  "ok": true,
  "message": "Group deleted"
}
```


## Add members to an existing group

`POST /users/:user_id/groups/:group_id/contacts`

If you already have a group but you want to add more friends to it, add any of
your existing members to append them to a group that matches the `group_id`.

### Request

```shell
curl \
  -X PUT \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  -H "Content-Type: application/json" \
  -d '{ "members": [2222, 3333] }' \
  http://localhost:3000/users/1111/groups/123/members
```

### Response

```json
{
  "ok": true,
  "message": "Members added to group"
}
```


## Remove a member from an existing group

Remove a member from an existing group. This does not destroy the friend
themselves, it just removes them from this specific group.

### Request

```shell
curl \
  -X DELETE \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  -d '{ "members": [2222, 3333] }' \
  http://localhost:3000/users/1111/groups/123/members
```

### Response

```json
{
  "ok": true,
  "message": "Members removed from group"
}
```
