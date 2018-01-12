# Friendships

Friendships are just users which have accepted to be associated with another
user. Before being able to send information to another user, that other user
must first be one of your "friends".

We're using the term "friends" here as an abstract concept for representing a
relationship between two user models. You can think of them as simply
"relationships" or "associations" for your business application if that helps ;)

## Create new friendships

To add a user as one of your friends, you must first request from them if they
will accept being your friend. Issuing a new request will add your user id to
their pending friendship requests list, from which they can choose to accept or
deny your request.

You can make friendship requests by sending one of three different types of
arrays to the server: 1) usernames, 2) emails, 3) user ids. The example below
shows a list of usernames, but you could alternatively use emails or ids. The
resulting "friendships" are not yet full *friends*, but merely represent
*requests* waiting to be accepted or declined. You can always see the status of
any of your friendships using by GETing it.

### Request

```shell
curl \
  -X POST \
  -H "Authorization: Bearer eyJhbGciOiJFUzM4NCIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpc0FjdGl2ZSI6dHJ1ZSwiaXNBZG1pbiI6dHJ1ZSwicGVybWlzc2lvbnMiOnsieWV0LWFub3RoZXItcmVzb3VyY2UiOnsiYWN0aW9ucyI6W119LCJpbXNpLXF1b3RhLW1hbmFnZXIiOnsiYWN0aW9ucyI6WyJ1c2VyczpyZWFkIiwidXNlcnM6d3JpdGUiLCJyZXNvdXJjZXM6cmVhZCIsInJlc291cmNlczp3cml0ZSIsInBlcm1pc3Npb25zOnJlYWQiLCJwZXJtaXNzaW9uczp3cml0ZSJdfSwibmV3LXJlc291cmNlIjp7ImFjdGlvbnMiOltdfSwiZGlhbWV0ZXItcXVvdGEiOnsiYWN0aW9ucyI6WyJwcm9maWxlczpyZWFkIiwicHJvZmlsZXM6d3JpdGUiLCJxdW90YXM6cmVhZCIsInF1b3Rhczp3cml0ZSIsImRldmljZXM6cmVhZCIsImRldmljZXM6d3JpdGUiXX0sInJvYmNoYXQiOnsiYWN0aW9ucyI6WyJyZWFkOnByb2ZpbGVzIiwid3JpdGU6cHJvZmlsZXMiLCJjaGF0IiwicmVhZDpmcmllbmRzIiwid3JpdGU6ZnJpZW5kcyJdfX0sImlhdCI6MTUxNTQyNzgwOSwiZXhwIjoxNTE1NTE0MjA5LCJpc3MiOiJjcmVkLWF1dGgtbWFuYWdlci1leGFtcGxlIiwic3ViIjoiYWNjZXNzIiwianRpIjoiU3lGa2R6Yk5HIn0.1SFRfcbZeV---YaXM37t4vlMP6B01BNVvgVqXOMPoJfSSoPD8DcDh3gVb1A65o7ATyVFGXVfhcSRM1fB3_MpcdN1DO31bE5E0PdSnBMdIq3SqCI6ZmaPLUI-uPls2rXb" \
  -H "Content-Type: application/json" \
  -d '{"usernames": ["rob", "another-user", "harry"] }' \
  http://localhost:3000/users/1/friendships
```

### Response

```json
{
  "ok": true,
  "message": "Friendships created.",
  "friendships": {
    "sent": [
      {
        "id": 12345,
        "username": "alisha",
        "issuedAt": "2015-11-18T18:56:09.923Z"
      },
      {
        "id": 34678,
        "username": "rob",
        "issuedAt": "2015-11-18T18:56:09.923Z"
      }
    ],
    "received": [
      {
        "id": 65443,
        "username": "john",
        "issuedAt": "2015-11-18T18:56:09.923Z"
      }
    ]
  }
}
```

## List pending friendship requests

Get a list of your pending friendships, both those you've sent out, and
ones others have requested of you.

Returns an object with two attributes: `sent` and `received`. Each is an array
of basic friend data for each user (friend request).

### Request

```shell
curl \
  -X GET \
  -H "Authorization: Bearer eyJhbGciOiJFUzM4NCIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpc0FjdGl2ZSI6dHJ1ZSwiaXNBZG1pbiI6dHJ1ZSwicGVybWlzc2lvbnMiOnsieWV0LWFub3RoZXItcmVzb3VyY2UiOnsiYWN0aW9ucyI6W119LCJpbXNpLXF1b3RhLW1hbmFnZXIiOnsiYWN0aW9ucyI6WyJ1c2VyczpyZWFkIiwidXNlcnM6d3JpdGUiLCJyZXNvdXJjZXM6cmVhZCIsInJlc291cmNlczp3cml0ZSIsInBlcm1pc3Npb25zOnJlYWQiLCJwZXJtaXNzaW9uczp3cml0ZSJdfSwibmV3LXJlc291cmNlIjp7ImFjdGlvbnMiOltdfSwiZGlhbWV0ZXItcXVvdGEiOnsiYWN0aW9ucyI6WyJwcm9maWxlczpyZWFkIiwicHJvZmlsZXM6d3JpdGUiLCJxdW90YXM6cmVhZCIsInF1b3Rhczp3cml0ZSIsImRldmljZXM6cmVhZCIsImRldmljZXM6d3JpdGUiXX0sInJvYmNoYXQiOnsiYWN0aW9ucyI6WyJyZWFkOnByb2ZpbGVzIiwid3JpdGU6cHJvZmlsZXMiLCJjaGF0IiwicmVhZDpmcmllbmRzIiwid3JpdGU6ZnJpZW5kcyJdfX0sImlhdCI6MTUxNTQyNzgwOSwiZXhwIjoxNTE1NTE0MjA5LCJpc3MiOiJjcmVkLWF1dGgtbWFuYWdlci1leGFtcGxlIiwic3ViIjoiYWNjZXNzIiwianRpIjoiU3lGa2R6Yk5HIn0.1SFRfcbZeV---YaXM37t4vlMP6B01BNVvgVqXOMPoJfSSoPD8DcDh3gVb1A65o7ATyVFGXVfhcSRM1fB3_MpcdN1DO31bE5E0PdSnBMdIq3SqCI6ZmaPLUI-uPls2rXb" \
  -H "Content-Type: application/json" \
  http://localhost:3000/users/1/friendships/pending
```

### Response

```json
{
  "ok": true,
  "message": "Contact requests found.",
  "friendships": {
    "sent": [
      {
        "id": 12345,
        "username": "alisha",
        "issuedAt": "2015-11-18T18:56:09.923Z"
      },
      {
        "id": 34678,
        "username": "rob",
        "issuedAt": "2015-11-18T18:56:09.923Z"
      }
    ],
    "received": [
      {
        "id": 65443,
        "username": "john",
        "issuedAt": "2015-11-18T18:56:09.923Z"
      }
    ]
  }
}
```

## List all friendships

Get a list of all your current friendships (all statuses).

### Request

```shell
curl \
  -X GET \
  -H "Authorization: Bearer eyJhbGciOiJFUzM4NCIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpc0FjdGl2ZSI6dHJ1ZSwiaXNBZG1pbiI6dHJ1ZSwicGVybWlzc2lvbnMiOnsieWV0LWFub3RoZXItcmVzb3VyY2UiOnsiYWN0aW9ucyI6W119LCJpbXNpLXF1b3RhLW1hbmFnZXIiOnsiYWN0aW9ucyI6WyJ1c2VyczpyZWFkIiwidXNlcnM6d3JpdGUiLCJyZXNvdXJjZXM6cmVhZCIsInJlc291cmNlczp3cml0ZSIsInBlcm1pc3Npb25zOnJlYWQiLCJwZXJtaXNzaW9uczp3cml0ZSJdfSwibmV3LXJlc291cmNlIjp7ImFjdGlvbnMiOltdfSwiZGlhbWV0ZXItcXVvdGEiOnsiYWN0aW9ucyI6WyJwcm9maWxlczpyZWFkIiwicHJvZmlsZXM6d3JpdGUiLCJxdW90YXM6cmVhZCIsInF1b3Rhczp3cml0ZSIsImRldmljZXM6cmVhZCIsImRldmljZXM6d3JpdGUiXX0sInJvYmNoYXQiOnsiYWN0aW9ucyI6WyJyZWFkOnByb2ZpbGVzIiwid3JpdGU6cHJvZmlsZXMiLCJjaGF0IiwicmVhZDpmcmllbmRzIiwid3JpdGU6ZnJpZW5kcyJdfX0sImlhdCI6MTUxNTQyNzgwOSwiZXhwIjoxNTE1NTE0MjA5LCJpc3MiOiJjcmVkLWF1dGgtbWFuYWdlci1leGFtcGxlIiwic3ViIjoiYWNjZXNzIiwianRpIjoiU3lGa2R6Yk5HIn0.1SFRfcbZeV---YaXM37t4vlMP6B01BNVvgVqXOMPoJfSSoPD8DcDh3gVb1A65o7ATyVFGXVfhcSRM1fB3_MpcdN1DO31bE5E0PdSnBMdIq3SqCI6ZmaPLUI-uPls2rXb" \
  -H "Content-Type: application/json" \
  http://localhost:3000/users/1/friendships
```

### Response

```json
{
  "ok": true,
  "message": "Contact requests found.",
  "friendships": [
    {
      "id": 12345,
      "username": "alisha",
      "status": "declined",
      "issuedAt": "2015-11-18T18:56:09.923Z"
    },
    {
      "id": 34678,
      "username": "rob",
      "status": "accepted",
      "issuedAt": "2015-11-18T18:56:09.923Z"
    },
    {
      "id": 65443,
      "username": "john",
      "status": "pending",
      "issuedAt": "2015-11-18T18:56:09.923Z"
    }
  ]
}
```

## Accept a friendship request

If someone has requested you be their friend, this endpoint will accept and
connect the two of you together so you may exchange information.

### Request

```shell
curl \
  -X POST \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/users/1111/friends/123/accept
```

### Response

```json
{
  "ok": true,
  "message": "Friendship request accepted.",
  "friend": {
    "id": 123,
    "username": "rob"
  }
}
```

## Decline a friendship request

If someone has requested to be your friend, you may deline and prevent them
from being able to send you info (and vice versa). They will not be able to
send you anything (nor you to them) until you have explicitly accepted their
friendship request.

### Request

```shell
curl \
  -X POST \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/users/1111/friends/123/decline
```

### Response

```json
{
  "ok": true,
  "message": "Friendship request declined."
}
```

## Reject a friendship request

This "destroys" a friendship and removes it from existence. This is different
from "declining" a friendship request, which records that you have disapproved
of the relationship and saves it to the database. This, on the other hand,
removes the relationship record altogether.

### Request

```shell
curl \
  -X DELETE \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1.eyJqdGkiOiJhMDFU2.i9YYifTpQsmKWAG" \
  http://localhost:3000/users/1111/friendships/2222
```

### Response

```json
{
  "ok": true,
  "message": "Friendship request rejected."
}
```

## Modify friendship

```shell
curl \
  -X PUT \
  -H "Authorization: Bearer xxxxx.yyyyyy.zzzzz" \
  -H "Content-Type: application/json" \
  -d '{ "status": "accepted" }' \
  http://localhost:3000/friendships/2
```

## List Friends

```shell
curl \
  -X GET \
  -H "Authorization: Bearer eyJhbGciOiJFUzM4NCIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpc0FjdGl2ZSI6dHJ1ZSwiaXNBZG1pbiI6dHJ1ZSwicGVybWlzc2lvbnMiOnsieWV0LWFub3RoZXItcmVzb3VyY2UiOnsiYWN0aW9ucyI6W119LCJpbXNpLXF1b3RhLW1hbmFnZXIiOnsiYWN0aW9ucyI6WyJ1c2VyczpyZWFkIiwidXNlcnM6d3JpdGUiLCJyZXNvdXJjZXM6cmVhZCIsInJlc291cmNlczp3cml0ZSIsInBlcm1pc3Npb25zOnJlYWQiLCJwZXJtaXNzaW9uczp3cml0ZSJdfSwibmV3LXJlc291cmNlIjp7ImFjdGlvbnMiOltdfSwiZGlhbWV0ZXItcXVvdGEiOnsiYWN0aW9ucyI6WyJwcm9maWxlczpyZWFkIiwicHJvZmlsZXM6d3JpdGUiLCJxdW90YXM6cmVhZCIsInF1b3Rhczp3cml0ZSIsImRldmljZXM6cmVhZCIsImRldmljZXM6d3JpdGUiXX0sInJvYmNoYXQiOnsiYWN0aW9ucyI6WyJyZWFkOnByb2ZpbGVzIiwid3JpdGU6cHJvZmlsZXMiLCJjaGF0IiwicmVhZDpmcmllbmRzIiwid3JpdGU6ZnJpZW5kcyJdfX0sImlhdCI6MTUxNTQyNzgwOSwiZXhwIjoxNTE1NTE0MjA5LCJpc3MiOiJjcmVkLWF1dGgtbWFuYWdlci1leGFtcGxlIiwic3ViIjoiYWNjZXNzIiwianRpIjoiU3lGa2R6Yk5HIn0.1SFRfcbZeV---YaXM37t4vlMP6B01BNVvgVqXOMPoJfSSoPD8DcDh3gVb1A65o7ATyVFGXVfhcSRM1fB3_MpcdN1DO31bE5E0PdSnBMdIq3SqCI6ZmaPLUI-uPls2rXb" \
  -H "Content-Type: application/json" \
  http://localhost:3000/users/1/friends
```

## Check an individual friendship

Sometimes you might want to check the status of an individual friendship to
determine if your request has been accepted or rejected.

```
curl \
  -X GET \
  -H "Authorization: Bearer xxxxx.yyyyyy.zzzzz" \
  -H "Content-Type: application/json" \
  http://localhost:3000/friendships/2
```
