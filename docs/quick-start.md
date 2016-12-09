# Quick Start Install

Just the code.


## 1. Make directories

#### local

```
ssh ubuntu@[SERVER_IP]
```

#### remote

```
sudo mkdir /opt/my-app-name
sudo chmod 750 /opt/my-app-name
sudo chown ubuntu:www-data /opt/my-app-name
```

```
sudo mkdir /etc/opt/my-app-name
sudo chmod 750 /opt/my-app-name
sudo chown ubuntu:www-data /opt/my-app-name
```

```
sudo mkdir /var/opt/my-app-name
sudo chmod 754 /opt/my-app-name
sudo chown ubuntu:www-data /opt/my-app-name
```

```
sudo mkdir /srv/opt/my-app-name
sudo chmod 754 /opt/my-app-name
sudo chown ubuntu:www-data /opt/my-app-name
```


## 2. Install server packages (including latest nginx, mongodb and openssl)

#### remote

```
sudo add-apt-repository ppa:nginx/stable
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y build-essential libkrb5-dev git nginx nodejs mongodb-org
sudo apt-get upgrade -y openssl
```


## 3. Install node 6 + pm2

#### remote

```
sudo npm install -g n
sudo n 6.2.2
sudo npm install -g pm2
```


## 4. Copy nginx config to /etc/nginx

#### local (from repo root)

```
scp ./config/nginx.conf ubuntu@[SERVER_IP]:/etc/nginx
scp ./config/my-app-name.conf ubuntu@[SERVER_IP]:/etc/nginx/sites-available
```

#### remote

```
sudo chmod 640 /etc/nginx/nginx.conf
sudo chmod 640 /etc/nginx/sites-available/my-app-name.conf
sudo ln -s /etc/nginx/sites-available/my-app-name.conf /etc/nginx/sites-enabled/my-app-name
sudo rm /etc/nginx/sites-enabled/default
```


## 5. Copy app config files to /etc/opt/my-app-name

#### local (from repo root)

```
scp ./config/pm2.json ubuntu@[SERVER_IP]:/etc/opt/my-app-name
```

#### remote

```
sudo chmod 600 /etc/opt/my-app-name/pm2.json
sudo chown root:root /etc/opt/my-app-name/pm2.json
```


## 6. Install SSL certs

#### remote

```
sudo mkdir /etc/nginx/ssl
sudo mkdir /etc/nginx/ssl/private
sudo chmod 755 /etc/nginx/ssl
sudo chmod 710 /etc/nginx/ssl/private
sudo chown ubuntu:www-data /etc/nginx/ssl
sudo chown ubuntu:www-data /etc/nginx/ssl/private
```

#### local (from where your certs are stored)

```
scp ./private.key ubuntu@[SERVER_IP]:/etc/nginx/ssl/private
scp ./cert.pem ubuntu@[SERVER_IP]:/etc/nginx/ssl
```

#### remote

```
sudo chmod 640 /etc/nginx/ssl/cert.pem
sudo chmod 600 /etc/nginx/ssl/private/private.key
sudo chown root:root /etc/nginx/ssl/cert.pem
sudo chown root:root /etc/nginx/ssl/private/private.key
```

generate dhparam key

```
openssl dhparam -out /etc/nginx/ssl/dhparam.pem 4096
sudo chmod 640 /etc/nginx/ssl/dhparam.pem
sudo chown root:root /etc/nginx/ssl/dhparam.pem
```


## 7. Add secret keys for pm2.json

#### remote

```
sudo vi /etc/opt/my-app-name/pm2.json
```

Add secret keys for the following attributes:

- `ACCESS_SECRET`
- `REFRESH_SECRET`
- `RESET_SECRET`
- `EMAIL_SES_ACCESS_KEY_ID`
- `EMAIL_SES_SECRET_ACCESS_KEY`

Recommend concatenating multiple values generated from
https://www.grc.com/passwords.htm for secret keys. For SES, use keys provided.


## 8. Restart nginx

#### remote

```
sudo service nginx restart
```


## 9. Deploy app files

#### local (from repo root)

```
gulp deploy --host ubuntu@[SERVER_IP]
```
