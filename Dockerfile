FROM ubuntu:16.04

MAINTAINER Rob McLarty <r@robmclarty.com> (robmclarty.com)

EXPOSE 80 443

RUN apt-get update \
  && apt-get install -yq \
    curl \
    software-properties-common \
  && add-apt-repository ppa:nginx/stable \
  && curl -sL https://deb.nodesource.com/setup_6.x | bash - \
  && apt-get update \
  && apt-get install -yq \
    build-essential \
    git \
    nginx \
    nodejs \
    postgresql \
    postgresql-client \
    postgresql-contrib \
  && apt-get upgrade -yq openssl \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get -y autoclean

# Login to postgres and setup user
USER postgres

RUN /etc/init.d/postgresql start \
  && psql --command "CREATE USER docker WITH SUPERUSER PASSWORD 'pguser';" \
  && createdb -O pguser cred-auth-manager

ENV DATABASE=postgres://pguser@127.0.0.1:5432/cred-auth-manager

USER root

RUN mkdir -p /opt/cred-auth-manager/config \
  && mkdir -p /etc/opt/cred-auth-manager \
  && mkdir -p /var/opt/cred-auth-manager \
  && mkdir -p /srv/opt/cred-auth-manager

WORKDIR /opt/cred-auth-manager

COPY server db package.json .sequelizerc /opt/cred-auth-manager/
COPY config/server.js config/database.js /opt/cred-auth-manager/config/
COPY config/nginx-standalone.conf /etc/nginx/nginx.conf
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
COPY config/cred-auth-manager-standalone.conf /etc/nginx/sites-enabled/
COPY build /srv/opt/cred-auth-manager/

RUN npm install --production --quiet \
  && ./node_modules/.bin/sequelize db:migrate --env production \
  && ./node_modules/.bin/sequelize db:seed:all

CMD npm start && nginx
#CMD ["npm", "start", "&&", "nginx"]
