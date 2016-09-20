# Sequelize


## Migrations

https://github.com/sequelize/cli
http://docs.sequelizejs.com/en/latest/docs/migrations/

Install command line tools for sequelize.

`npm install --save sequelize-cli`

Run migration tasks. Sequelize will look in `/db/migrations` by default.

```
sequelize init:migrations             Initializes the migrations.
sequelize migration:create            Generates a new migration file. Aliases: migration:generate
sequelize db:migrate                  Run pending migrations.
sequelize db:migrate:old_schema       Update legacy migration table
sequelize db:migrate:undo             Revert the last migration run.
sequelize db:migrate:undo:all         Revert all migrations ran.
sequelize help:db:migrate             The documentation for "sequelize db:migrate".
sequelize help:db:migrate:old_schema  The documentation for "sequelize db:migrate:old_schema".
sequelize help:db:migrate:undo        The documentation for "sequelize db:migrate:undo".
sequelize help:db:migrate:undo:all    The documentation for "sequelize db:migrate:undo:all".
sequelize help:init:migrations        The documentation for "sequelize init:migrations".
sequelize help:migration:create       The documentation for "sequelize migration:create".
```


## Seeders

https://github.com/sequelize/cli

Install command line tools for sequelize.

`npm install --save sequelize-cli`

Run seeders tasks. Sequelize will look in `/db/seeders` by default.

```
sequelize init:seeders           Initializes the seeders.
sequelize seed:create            Generates a new seed file. Aliases: seed:generate
sequelize db:seed                Run seeders.
sequelize db:seed:undo           Deletes data from the database.
sequelize db:seed:undo:all       Deletes data from the database.
sequelize help:db:seed           The documentation for "sequelize db:seed".
sequelize help:db:seed:undo      The documentation for "sequelize db:seed:undo".
sequelize help:db:seed:undo:all  The documentation for "sequelize db:seed:undo:all".
sequelize help:init:seeders      The documentation for "sequelize init:seeders".
sequelize help:seed:create       The documentation for "sequelize seed:create".
```
