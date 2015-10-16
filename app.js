var fs = require('fs');
var proc = require('child_process');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var base_dir = __dirname;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var gitupdate = function(data, callback){
    var command = '';
    var repo_name = data.branch+'__'+data.repository_url.split('/').pop();
    if(!fs.existsSync(data.destination)){
        fs.mkdirSync(data.destination);
    }
    if(!fs.existsSync(base_dir+'/repos/'+repo_name)){
        // mirroring the repository (bare)
        command = 'cd '+base_dir+'/repos && ';
        command+= '/usr/bin/git clone --mirror '+data.repository_url+' && ';
        command+= '/bin/mv '+data.repository_url.split('/').pop()+' '+repo_name+' && ';
        command+= 'cd '+repo_name+' && ';
        command+= 'GIT_WORK_TREE='+data.destination+' /usr/bin/git checkout -f '+data.branch+' && ';
    }
    command+= 'cd '+base_dir+'/repos/'+repo_name+' && ';
    command+= '/usr/bin/git fetch && ';
    command+= 'GIT_WORK_TREE='+data.destination+' /usr/bin/git checkout -f && ';
    command+= '/bin/chown '+data.user+'.'+data.user+' -R '+data.destination;
    //console.log(command);
    proc.exec(command,function(error,stdout,stderr){
        if (error === null) {
            callback(true);
        } else {
            callback(false);
        }
    });
};

var update = function(req,data,callback){
    var toupdate = false;
    var changes = req.body.push.changes || false;
    if(changes){
        for(var i=0; i<changes.length; i++){
            if(changes[i].new.name == data.branch){
                toupdate=true;
                break;
            }
        }
    }
    if(toupdate){
        gitupdate(data,function(result){
            callback(result);
            return;
        });
    } else {
        console.log('Unhandled!!!',req.body);
        callback(true);
    }
};

app.post('/7d2a5d619bae1e7ce5bd44ecbc67a0fbc1b74a5745eff3a575ae22ae4a5cb0d1', function (req, res) {
    var data = {
        'repository_url':'git@bitbucket.org:matteomattei/myresapp_frontend_v2.1.git',
        'destination': '/var/www/dev2.myresapp.com/public_html',
        'branch': 'master',
        'user': 'web5009'
    }
    update(req,data,function(result){
        if(result){
            res.sendStatus(200);
        } else {
            res.sendStatus(500);
        }
    });
});

app.get('/', function (req, res) {
    res.send('GitDeploy - https://github.com/matteomattei/gitdeploy');
});

app.get('/:otherpage', function(req, res){
    if(req.params.otherpage != 'favicon.ico'){
        res.send('Not implemented');
        console.log('Not implemented: '+req.params.otherpage);
    }
});

var server = app.listen(8888, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('gitDeploy app is listening at http://%s:%s', host, port);
});