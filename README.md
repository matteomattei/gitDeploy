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
pm2 start --watch --ignore-watch=repos app.js
pm2 startup systemd
su root -c "pm2 dump && pm2 kill" && su root -c "systemctl daemon-reload && systemctl enable pm2 && systemctl start pm2"
```

From now on, even if the server restarts, pm2 will be always re-launched.
