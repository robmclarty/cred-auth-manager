# Middleware

Cred Auth Manager is mainly a set of Express middleware which can be used to
enhance your existing Express application with auth-specific routes and
functions. This is a list of what you can enable and how they work, assuming
you have instantiated a variables called `app` as the result of the
cred-auth-manager intitialization function.


## `app.publicMiddleware`

Public non-authenticated endpoints used, say, for a public-facing marketing
website or other informational-type content that is not part of your app proper.

### Routes

GET `/` or `/index.html`


## `app.loginMiddleware`

The login middleware provides endpoints that are not authenticated by access
tokens which are used to either generate new tokens, refresh them, or revoke
them.

### Routes

POST    `/tokens`             
POST    `/tokens/facebook`    
POST    `/tokens/google`      
POST    `/tokens/github`      
PUT     `/tokens`             
DELETE  `/tokens`             


## `app.registerMiddleware`

The register middleware is simply an endpoint that can be used for creating new
user accounts with the system for a given username + password. This is held as
a separate middleware to give you more flexibility in case you want to
implement this functionality differently (e.g., using your own custom
registration flow) or if you do not want a register endpoint at all because it
is handled by a separate system (e.g., social login or other OAuth system).

### Routes

POST `/register`  


## `app.adminMiddleware`

You may optionally install a pre-built front-end administration web application
served from the `/admin` URI which can be used to perform basic admin tasks
such as modifying user permissions, setting up access to online resources, and
creating new user accounts directly. This is merely a convenience app and is
not necessary for the core functionality of Cred Auth Manager, but is an easy
way to hit the ground running if you so desire.

### Routes

GET `/admin`


## `app.authMiddleware`

This represents the core locking mechanism for your application. All Express
routes defined after this middleware will require a valid access token provided
in the `Authorization` header as well as an active user account.

Along with the locking mechanism, this middleware also provides basic routes
for users and resources (the core data for the system).

### Routes

POST    `/users`
GET     `/users`
GET     `/users/:id`
PUT     `/users/:id`
DELETE  `/users/:id`
POST    `/users/:id/permissions/:resource_name`
GET     `/users/:id/permissions/:resource_name`
DELETE  `/users/:id/permissions/:resource_name`

POST    `/users/:id/metadata`
GET     `/users/:id/metadata`
GET     `/users/:user_id/metadata/:id`
PUT     `/users/:user_id/metadata/:id`
DELETE  `/users/:user_id/metadata/:id`

POST    `/resources`
GET     `/resources`
GET     `/resources/:id`
PUT     `/resources/:id`
DELETE  `/resources/:id`
GET     `/resources/:id/actions`
PUT     `/resources/:id/actions`
DELETE  `/resources/:id/actions`


## `app.friendshipMiddleware`

A set of routes for creating and managing friendships. This can be used as a
mechanism for inter-user relationships. There is the ability for one user to
"request" a friendship with another user, and that other user can then choose
how to respond by either "accepting", "declining", "banning", or "rejecting".
In this way, "friendships" are *mutually* agreed upon user-to-user associations
which can be used as a sign of trust between two users. As soon as one user has
had enough, the friendship is broken.

### Routes

POST    `/users/:user_id/friendships`
GET     `/users/:user_id/friendships`
DELETE  `/users/:user_id/friendships`
GET     `/users/:user_id/friendships/:id`
DELETE  `/users/:user_id/friendships/:id`

POST    `/users/:user_id/friends`
GET     `/users/:user_id/friends`
GET     `/users/:user_id/friends/pending`
GET     `/users/:user_id/friends/:id`
DELETE  `/users/:user_id/friends/:id`

POST    `/users/:user_id/friends/:id/accept`
POST    `/users/:user_id/friends/:id/decline`
POST    `/users/:user_id/friends/:id/reject`
POST    `/users/:user_id/friends/:id/ban`


## `app.groupMiddleware`

Besides friends and friendships, users may want to make their own, private,
groups of users (regardless of what the other users think of them). This could
be used as a way or organizing contacts, creating group-based permission
systems (e.g., a set of family-oriented functionality that, say, is controlled
by parent users, but followed by child users). Each user can create their own
group for their own purposes, or your app can manage this group concept itself
if you want to create an application that takes advantage of these features but
you don't necessarily want to give your users that direct capability.

### Routes

GET     `/groups`
POST    `/groups`
GET     `/groups/:id`
PUT     `/groups/:id`
DELETE  `/groups/:id`

POST    `/users/:user_id/groups`
GET     `/users/:user_id/groups`
GET     `/users/:user_id/groups/:id`
PUT     `/users/:user_id/groups/:id`
DELETE  `/users/:user_id/groups/:id`

POST    `/groups/:group_id/users`
DELETE  `/groups/:group_id/users/:id`


## `app.errorMiddleware`

The error middleware can handle API responses for certain error types. This is
optional in the case that you want to handle errors generated by your
application in a more custom way.  This is a list of supported error types.
The main types are stored as a set of constant variables in the `errorHelper`
which you can use in your application to throw an error of a certain type to
these handlers.

### Errors

Generic Sequelize/Database Error (returns 422 - UNPROCESSABLE)

Uniqueness conflict Sequelize/Database Error (returns 409 - CONFLICT)

400 - BAD_REQUEST
401 - UNAUTHORIZED
403 - FORBIDDEN
404 - NOT_FOUND
409 - CONFLICT
422 - UNPROCESSABLE
500 - GENERIC_ERROR


## `app.cred`

This is a convenience reference to the underlying `cred` instance for use in
custom authentication endpoints and token reference within your app.

See https://github.com/robmclarty/cred for more details.


## `app.models`

This is a convenience reference to all the Sequelize models that have been
loaded into your app. Use this as a means of accessing those models in your
application for accessing the database.

For example, within your Express middleware, you could get a list of users
this way:

```javascript
const myMiddleware = (req, res, next) => {
  const { User } = req.app.models

  User.findById(userId)
    .then(user => {
      // do something with `user`
    })
    .catch(next)
}
```


## `app.errorHelper`

This is a convenience reference to the built-in error helper which has a list
of pre-baked error types as well as a `createError` function for throwing
errors to the error handlers defined above.

### Error Constants

### `createError`

```javascript
const myMiddlware = (req, res, next) => {
  const { BAD_REQUEST, createError } = req.app.errorHelper
  // ...do some logic

  if (anErrorHappened) {
    return next(createError({
      status: BAD_REQUEST,
      message: 'Something is missing that is necessary for this to work.'
    }))
  }

  // ...regular non-error response
}
```

## `app.requireRefreshToken`

This is a convenience reference to the `requireRefreshToken` middleware so that
you can make use of it in you application in a custom way if, for example, you
wish to exclude the built-in `loginMiddleware` and implement your own endpoints
for creating and managing tokens by using `cred` directly. This middleware can
be used out of the box to require a valid refresh token for a given route
(for example, as a means of generating new access tokens, or for creating a
custom logout endpoint).

```javascript
app.delete('/logout', app.requireRefreshToken, customLogoutMiddleware)
```
