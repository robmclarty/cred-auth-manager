1. how do I completely rebuild my image from scratch if I change something in my
docker-compose.yml?

2. what should be in my individual Dockerfiles for my node app?

a) It looked like you made a very barebones image for jstools, but should i be
using something more for cred-auth-manager? Like, for example, installing ubuntu +
node (e.g., https://github.com/nodesource/docker-node)?

b) Does docker compose just copy everything over or do i need to do some
specific setup (like copy app files and config files)?

4. How do I startup my node app?

I tried using my startup script (start.js) which is supposed to be an executable
which tries to run node from /user/bin/env but docker keeps complaining that
"/bin/sh: 1: [node,: not found". I was simply running "npm start" from my
Dockerfile which in turn runs "start.js" but maybe some references are wrong or
the executable doesn't have the right env, idk

5. My goal is two-fold: 1) create a Dockerfile which can build an image that can
be used in docker-compose to build other production environments which depend on
this image. 2) create a docker-compose.yml which can be used to spin up a single
stand-alone environment (i.e., app + db) if that's all you want to do (and maybe
that can be used for dev too)

So, does that mean this container should be very barebones in that it *only*
deals with node and doesn't think about the OS (i.e., that would be decided by a
higher-level docker compose setup which would include this into some bigger
system)?

If that's the case, does my small standalone docker-compose need to incorporate
something like that to mash some OS-level container with my node app container?

6. how to pm2 in this environment? Do I make that decision in my app container,
or leave that for someone implementing a higher-level OS container?

7. Does file hierarchy matter in containers?

8. How do I incorporate nginx for a production setup?


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

`docker-compose up -d db`
`docker-compose up -d app`
`docker-compose exec app npm run db:migrate`
`docker-compose exec app npm run db:seed`
(the commands `db:migrate` and `db:seed` are defined in the `package.json` for
the `app` container)

Watch logs using `docker-compose logs <container>`

`docker-compose stop db`
`docker-compose stop app`

Check running containers with `docker-compose ps`
