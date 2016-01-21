Installation
============

Download the package and install all dependencies:

```
git clone https://github.com/matteomattei/gitdeploy
cd gitdeploy
npm install
```

Now create a keypair to use with Bitbucket/Github:

```
# ssh-keygen -t rsa
Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa): /root/.ssh/bitbucket_rsa
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /root/.ssh/bitbucket_rsa.
Your public key has been saved in /root/.ssh/bitbucket_rsa.pub.
The key fingerprint is:
SHA256:vVYnSncst0XyuD2uiWw2IoD2quWHiH9EOxd/50aGYLY root@barracuda
The key's randomart image is:
+---[RSA 2048]----+
|                 |
|                 |
|              . .|
|    . . +.   . = |
|   ... =Soo.= * o|
|   o+.. E.o=+* = |
|. oooo.  .+=  o..|
|..o..o . o.++ o .|
| oo+o   . ++.o.. |
+----[SHA256]-----+
```

The **_rsa** file is your private key and it must be kept protected.
The **_rsa.pub** file is the public key and it has to be configured in Github/Bitbucket POST hooks.

Start daemon
============

Login to the server that will host the git repositories and then:

```
pm2 start --watch app.js
pm2 startup systemd
su root -c "pm2 dump && pm2 kill" && su root -c "systemctl daemon-reload && systemctl enable pm2 && systemctl start pm2"
```

From now on, even if the server restarts, pm2 will be always re-launched.

Configure NGINX
===============

In your NGINX virtualhost configuration add a new location to listen for POST requests and pass them to nodejs application that runs on port 8888:

```
server {
    listen 80;
    server_name  www.example.com;
    access_log   /var/www/www.example.com/logs/nginx.access.log;
    error_log    /var/www/www.example.com/logs/nginx.error.log;
    root /var/www/www.example.com/public_html;
    index index.html;

    # gitDeploy
    location ~ "/sync/(.*)$" {
        proxy_pass http://127.0.0.1:8888/$1;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # static website
    location / {
        try_files $uri $uri/ $uri.html =404;
        expires 7d;
    }
}
```

Every request to /sync/<something> will be processed by the nodejs instance of gitDeploy.

Configure gitDeploy
===================

Edit config.js to add a new git repository to sync in the hosts array:

```
var hosts = [
    {
        'name':'www.example.com', // domain name
        'route':'7d2a5d619bae1e7ce5bd44ecbc67a0fbc1b74a5745eff3a575ae22ae4a5cb0d1', // random generated route name
        'repository_url':'git@bitbucket.org:matteomattei/mytestrepo.git', // git repository (make sure it ends with .git)
        'destination': '/var/www/www.example.com/public_html', // destination folder on the server
        'branch': 'master', // git branch
        'user': 'user1', // user on the server that the files should belong to
        'timeout': '600', // seconds to wait before giving up
        'postcmd': 'npm install' // command to execute after sync (optional)
    },
    {
        'name':'api.example.com',
        'route':'5691017598b8f0eff189e456b116529d13384171c109d6737f0d878c1199ef0c',
        'repository_url':'git@bitbucket.org:matteomattei/myapirepo.git',
        'destination': '/var/www/api.example.com/public_html',
        'branch': 'master',
        'user': 'user2',
        'timeout': '300', // seconds to wait before giving up
    },
];
```

The route name should be a long sequence of letters and numbers (for example something like ```7d2a5d619bae1e7ce5bd44ecbc67a0fbc1b74a5745eff3a575ae22ae4a5cb0d1```) that only you and the GIT server should know.
