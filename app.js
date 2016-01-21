var fs = require('fs');
var proc = require('child_process');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var base_dir = __dirname;
var hosts = require('./config')

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var gitupdate = function(data, callback){
    var command = '';
    var repo_name = data.branch+'__'+data.repository_url.split('/').pop();
    if(!fs.existsSync(data.destination)){
        fs.mkdirSync(data.destination);
    }
    if(!fs.existsSync(path.join(data.bare_repo,repo_name))){
        // bare mirroring of the repository
        command+= 'mkdir -p '+data.bare_repo+' && cd '+data.bare_repo+' && ';
        command+= '/usr/bin/git clone --mirror '+data.repository_url+' && ';
        command+= '/bin/mv '+data.repository_url.split('/').pop()+' '+repo_name+' && ';
        command+= 'cd '+repo_name+' && ';
        command+= 'GIT_WORK_TREE='+data.destination+' /usr/bin/git checkout -f '+data.branch+' && ';
    }
    command+= 'cd '+path.join(data.bare_repo,repo_name)+' && ';
    command+= '/usr/bin/git fetch && ';
    command+= 'GIT_WORK_TREE='+data.destination+' /usr/bin/git checkout -f';
    if(data.postcmd){
        command+= ' && cd '+data.destination+' && '+data.postcmd;
    }
    var timeout = (typeof data.timeout !== 'undefined') ? data.timeout : '600'; // 10 minutes
    command = '( flock -x -w '+timeout+' 200 || exit 1; su - '+data.user+' -c "'+command+'"; ) 200>/tmp/gitDeploy.lock';
    console.log(command);
    proc.exec(command,function(error,stdout,stderr){
        if (error === null) {
            callback(true);
        } else {
            console.log(error,stdout,stderr);
            callback(false);
        }
    });
};

var update = function(req,data,callback){
    console.log('======================================');
    console.log('data=',data);
    console.log('body=',req.body);
    var toupdate = false;
    var changes = (typeof req.body.push.changes !== 'undefined') ? req.body.push.changes : false;
    console.log('changes=',changes);
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
            console.log('gitupdate result=',result);
            callback(result);
            return;
        });
    } else {
        console.log('Unhandled!!!',req.body);
        callback(true);
    }
};

for(var i=0;i<hosts.length;i++){
    var domain_data = hosts[i];
    (function(domain_data){
        app.post('/'+domain_data.route, function (req, res) {
            console.log('Processing '+domain_data.name);
            update(req, domain_data ,function(result){
                if(result){
                    console.log('sync done');
                    res.sendStatus(200);
                } else {
                    console.log('sync failed');
                    res.sendStatus(500);
                }
            });
        });
    })(domain_data);
}

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
