# Permissions

Users must create a valid JSON web token through the authentication endpoints
in order to access resources on this server, or another, supported, resource
server. But the token alone doesn't enable the user to do anything per se. S/he
must also have *permission* to do things on the server receiving his/her request.

In other words, having a valid token, simply, verifies that the user is a real
user in the system (i.e., they provided valid login credentials and received a
valid JWT in return). But *inside* the token is a set of more granular
*permissions* which allow or disallow the user to do specific actions with the
server they are interacting with.

For example, if I visit a hotel and, after checking in, I receive a magnetic
hotel key card, this card on its own may grant me access through the front door
but the concierge must also enable my card to open a specific room (and not
other rooms) as well as, perhaps, allow me to open the door to the pool and the
restaurant, but not allow me to open the door to the boiler room or
administration offices. Just like this hotel key card, a JWT can have a list of
specific permissions which the resource server owner must enforce.

It is important to note that the token simply contains a list of permissions;
it doesn't actually *do* the verification or prevent anyone from going where
they aren't supposed to be. The resource server handling the request which
includes this token is responsible for enforcement, but the list of permissions
(or lack there of) in the token makes this task pretty easy.

More technically, a "permission" means, simply, that the user has the following:

1. a valid JSON web token
2. an attribute in that token called `permissions`, which is an object in the
token's payload which itself contains a series of attributes named for the
"app-name" for which the permissions correspond (the "app-name" is defined in
the cred-auth-manager admin interface when setting up your "resources"). This
name corresponds to a specific resource server for which you want to manage
permissions.
3. zero or more "permissible actions". Within each resource "app-name" object is
an attribute called `actions` which is an array of string labels denoting the
permissions this token has for this particular resource server.

That's pretty abstract. Here's what a token actually looks like. It's a lot
simpler when you just look at it:

```json
{
  "userId": "89908iuh2bjb2",
  "name": "my name",
  "isAdmin": false,
  "permissions": {
    "app-name": {
      "actions": ["action1", "action2"]
    }
  }
}
```

In the above example, the user *has permission* to perform "action1" or
"action2" when making requests to the resource server that is called "app-name".

A more real-world example:

```json
{
  "userId": "89908iuh2bjb2",
  "name": "Rob McLarty",
  "isAdmin": false,
  "permissions": {
    "my-amazing-app": {
      "actions": ["users:write", "files:read"]
    }
  }
}
```

In this example, the user making the request with this token has both the
"users:write" and "files:read" actions assigned to his permissions for the app
called "my-amazing-app". This allows him to do everything a regular user is
allowed to do (such as, perhaps, loading their profile, sending feedback,
viewing content, etc.) while also being able to perform some more sensitive
actions  such as overwriting other user profiles (i.e., "users:write") and
reading files off the disk (i.e., "files:read"). What these actions *mean* is up
to the resource server itself. They don't actually do anything unless the server
is programmed to do something with this information.

On the server side, you might, then, add some kind of additional check in your
authorization system which, on top of requiring a valid token, on some
endpoints, also checks for certain permissible actions. In this example, perhaps
for an endpoint `GET /files` the server should check for the presence of the
"files:read" permissible action in the requester's token. If it is not present,
then the  server should reject the request, thus enforcing its authorization
strategy. It's very flexible and up to you how you want to implement this, but
the cred-auth-manager will help by providing granular settings which you can tap
into. You can invent any kind of permissions your system needs and set those
permissions on user accounts however you see fit in your app in order to have
total control over access to your data.

For convenience, cred-auth-manager also includes a top-level attribute called
`isAdmin` which is a boolean denoting whether or not the user is an
administrator for the resource server. This attribute, if set to `true`, can be
used to  enable a user to access any action on the server. It's easy to check
for and allow such users to pass through any additional authorization you've put
in  place. Most of the time, however, you'll simply leave this set to `false`
(the default).
