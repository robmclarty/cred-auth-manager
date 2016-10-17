1. how do a completely rebuild my image from scratch if I change something in my
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
