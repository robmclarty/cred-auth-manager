# Groups

A group is a way for users to organize their relationships. You may group other
people into collections (e.g., "family", "teammates", "doctors", etc.).

## Create a New Group

POST `/users/:user_id/groups`

Create a new group for yourself out of your list of existing user ids. If you
do not provide an array of `memberIds`, the group will still be created, but
with only the owner as a member.

### Request

```shell
curl \
  -X POST \
  -H "Authorization: Bearer xxxxx.yyyyy.zzzzz" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Family", "memberIds": [12, 34, 56] }' \
  https://disruptor.mbenablers.com/users/1111/groups
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

GET `/users/:user_id/groups`

Get a list of all your active groups. Will return an array of each group, which
themselves include a `members` array of each user which is a member.

### Request

```shell
curl \
  -X GET \
  -H "Authorization: Bearer xxxxx.yyyyy.zzzzz" \
  https://disruptor.mbenablers.com/users/1111/groups
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

GET `/users/:user_id/groups/:group_id`

Retrieve an individual group by its id, with its array of members.

### Request

```shell
curl \
  -H "Authorization: Bearer xxxxx.yyyyy.zzzzz" \
  https://disruptor.mbenablers.com/users/1111/groups/123
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

PUT `/users/:user_id/groups/:group_id`

Modify the values for an existing group. The array `membersIds` that is
provided will overwrite any existing members in the group (i.e., any user ids
currently in the group, which are NOT included in `membersIds` will be removed
from the group).

Omitting `name` will keep the existing group name.

Omitting `membersIds` will be treated as if it were an empty array, effectively
removing all members from the group, except the owner.

NOTE: If you would like to add members to an existing group by only supplying
the new member ids, use the POST `/users/:user_id/groups/:group_id/members`
endpoint instead.

### Request

```shell
curl \
  -X PUT \
  -H "Authorization: Bearer xxxxx.yyyyy.zzzzz" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Family", "memberIds": [2222, 3333] }' \
  https://disruptor.mbenablers.com/users/1111/groups/123
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

DELETE `/users/:user_id/groups/:group_id`

Remove a group from a user's account.

### Request

```shell
curl \
  -X DELETE \
  -H "Authorization: Bearer xxxxx.yyyyy.zzzzz" \
  https://disruptor.mbenablers.com/users/1111/groups/123
```

### Response

```json
{
  "ok": true,
  "message": "Group deleted"
}
```


## Add members to an existing group

POST `/users/:user_id/groups/:group_id/members`

If you already have a group but you want to add more user ids to it, include any
of your existing members to append them to a group that matches the `group_id`.

Duplicates will be ignored, and existing members will remain in the group. This
only adds new members.

### Request

```shell
curl \
  -X PUT \
  -H "Authorization: Bearer xxxxx.yyyyy.zzzzz" \
  -H "Content-Type: application/json" \
  -d '{ "memberIds": [2222, 3333] }' \
  https://disruptor.mbenablers.com/users/1111/groups/123/members
```

### Response

```json
{
  "ok": true,
  "message": "Members added to group"
}
```


## Remove a member from an existing group

DELETE `/users/:user_id/groups/:group_id/members`

Remove members from an existing group. This does not destroy the user
themselves, it just removes them from this specific group.

Existing members not included in `memberIds` will remain members of the group.

### Request

```shell
curl \
  -X DELETE \
  -H "Authorization: Bearer xxxxx.yyyyy.zzzzz" \
  -d '{ "memberIds": [2222, 3333] }' \
  https://disruptor.mbenablers.com/users/1111/groups/123/members
```

### Response

```json
{
  "ok": true,
  "message": "Members removed from group"
}
```
