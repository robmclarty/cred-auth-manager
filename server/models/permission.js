'use strict'

const mongoose = require('mongoose')
const URLSafe = require('base64-url')

// A small object type that contains a name (a unique identifier that is the
// name of a resource), and an array of strings representing permissible actions
// for that resource.
//
// NOTE: The name attribute is stored (in duplicate to the
// referenced resource itself) for performance reasons (e.g., there will be many
// more read operations than write operations, like when creating a token, so
// this stores everything that's needed for reading directly on the user
// document, but keeps a reference to the resource document through its id for
// verification).
const PermissionSchema = new mongoose.Schema({
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true
    validate: {
      validator: validator.isObjectid,
      message: '{ VALUE } is not a valid ObjectId'
    }
  },
  name: {
    type: String,
    required: true,
    validate: {
      validator: value => validator.matches(value, /^[A-Za-z0-9\-_]+$/),
      message: '{ VALUE } must be URL-safe (use hyphens instead of spaces, like "my-amazing-resource")'
    }
  },
  actions: [String]
}, {
  autoIndex: false
})

// Helper Methods
// --------------

const sanitizePermission = permission => {
  if (permission.isModified('name'))
    permission.name = validator.trim(permission.name)
    permission.name = base64url.escape(permission.name)

  if (permission.isModified('actions'))
    permission.actions = permission.actions.map(action => {
      validator.escape(validator.trim(action))
    })

  return permission
}

// Pre-save Methods
// ----------------

PermissionSchema.pre('save', function (next) {
  this = santizePermission(this)

  next()
}

// Instance Methods
// ----------------

const toJSON = () => ({
  actions: this.actions
})

// Merge custom methods with UserSchema.methods.
Object.assign(PermissionSchema.methods, {
  toJSON
})

module.exports = mongoose.model('Permission', PermissionSchema)
