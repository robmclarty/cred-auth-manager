A few initial requirements should be performed upon first installing the server.

1. Create an admin user.

  `gulp create-user --username admin --password password --email admin@email.com --admin true`

2. Create a "resource" for the auth manager server (this server). Other
   resources can also be added (for other, different servers). Include the url
   of the actual server (here we're just using localhost for dev). And finally
   include a set of actions which from which users may be given permissions.

   `gulp create-resource --name cred-auth-manager --url http://localhost:3000 --actions admin`

3. Give your admin user the "admin" permission for this resource.

   `gulp add-permissions --username admin --resource cred-auth-manager --actions admin`

This is the basic way of authorizing access to the server. There is also a
separate global attribute called "isAdmin" included in each user's token which
is set when creating your user. You could optionally make use of this attribute
in your own custom middleware as a way of perhaps overriding all other
authorization mechanisms. This isn't implemented here as it could potentially
be done in many different ways. But using the user's "permissions" is just as
valid.

If you wanted to make an overriding middleware, you might write a custom
authorization middleware function that looks something like the following (just
as an example based on the `auth.js` module used in this app):

```javascript
const { tokenFromReq } = require('cred')

const customAuthorize = regularAuthorize => (req, res, next) => {
  const token = tokenFromReq(req)
  const payload = jwt.decode(token)

  return payload.isAdmin ? next() : regularAuthorize(req, res, next)
}
```

And then in your routes file (or wherever you do your authorization), you could
use your new function like this:

```javascript
const { authorizedAccess } = require('../auth.js')

router.route('/authorized-resource')
  .all(customAuthorize(authorizedAccess(['an-action', 'another-action'])))
  .post()
  .get()
  .delete()
```

This way, if a user has `isAdmin` in their token set to true, they are
immediately granted access, otherwise, they will need to posses the permissions
defined in the `authorizedAccess` array.

The point is, it's flexible and can be used in conjuction with your own
middleware to give you all the control you need to manage authorization.
