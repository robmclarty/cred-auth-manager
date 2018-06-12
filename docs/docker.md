# Docker

NOTE: Docker usage is not currently finalized as new updates are being made.

## Reference commands

`docker pull <image name>` - pull an image stored on docker hub down to local machine

`docker images` - list images stored locally

`docker run <image name> <command>` - run a docker *container* based on an *image*

`docker run alpine ls -l` - run image 'alpine' as container and list files in root

`docker run alpine /bin/sh` - run image 'alpine' as container and launch bash session

To launch container with an *interactive terminal* without exiting, use the
`-it` flag for `docker run` (type `exit` to get out of it):

`docker run -it alpine /bin/sh` - launch interactive terminal in alphine container

`docker run --name <new container name> -p 80:80 -d <image name>`

`docker ps` - List all containers that are currently running

`docker ps -a` - List all containers that have run in the past too

`docker stop <container name>` - stop a running container

`docker rm $(docker ps -a -q)` - destroy all containers

`docker rmi $(docker images -q)` - destroy all images

`docker-compose up` - build any unbuilt images and launch containers

`docker-compose up --build` - force rebuild of images before launching containers

`docker-compose up --force-recreate` - force recreate of all images

`docker-compose down` - tear down any active containers


To initialize the database with migrations from an app container, first start
up the app + the db containers in daemon mode (using `-d`) and then use the
`docker-compose exec <container> <command>` syntax to run your migration scripts.

```
docker-compose up -d db
docker-compose up -d app
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

(the commands `db:migrate` and `db:seed` are examples of defined scriptions in
a `package.json` for the `app` container)

Watch logs using `docker-compose logs <container>`

`docker-compose stop db`
`docker-compose stop app`

Check running containers with `docker-compose ps`

Launch using multiple compose files (using the `-f` option). Subsequent
compose file values will override values from previous compose files:

`docker-compose -f docker-compose.yml -f docker-compose-production.yml up -d`
