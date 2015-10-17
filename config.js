var hosts = [
    {
        'name':'www.example.com',
        'route':'7d2a5d619bae1e7ce5bd44ecbc67a0fbc1b74a5745eff3a575ae22ae4a5cb0d1',
        'repository_url':'git@bitbucket.org:matteomattei/myrepository.git',
        'destination': '/var/www/www.example.com/public_html',
        'branch': 'master',
        'user': 'user1'
    },
    {
        'name':'api.example.com',
        'route':'cc2d5d2fb1565b200c50f8e9528f84f972d78e2c207d2f2bc3d637820f0f5e71',
        'repository_url':'git@bitbucket.org:matteomattei/apirepository.git',
        'destination': '/var/www/api.example.com/public_html',
        'branch': 'master',
        'user': 'user2'
    },
];

module.exports = hosts;
