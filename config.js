var hosts = [
    {
        'name':'www.example.com',
        'route':'7d2a5d619bae1e6ce5bd44ecbc67a0fbc1b74a5745eff8a575ae22ae4a5cb0d1',
        'repository_url':'git@bitbucket.org:matteomattei/myrepository.git',
        'bare_repo': '/var/www/www.example.com/bare_repo',
        'destination': '/var/www/www.example.com/public_html',
        'branch': 'master',
        'user': 'user1',
        'postcmd': 'npm install',
        'timeout': '600'
    },
    {
        'name':'api.example.com',
        'route':'cc2d5d2fb15656200c50f8e9528f84f952d78e2c207d2f2bc3d637820f0f5e71',
        'repository_url':'git@bitbucket.org:matteomattei/apirepository.git',
        'bare_repo': '/var/www/api.example.com/bare_repo',
        'destination': '/var/www/api.example.com/public_html',
        'branch': 'master',
        'user': 'user2',
        'postcmd': 'npm install && bower install && gulp build',
        'timeout': '3600'
    },
];

module.exports = hosts;
