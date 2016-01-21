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
    var timeout = (typeof data.timeout !== 'undefined') ? data.timeout : '600'; // default 10 minutes
    var postcmd = (typeof data.postcmd !== 'undefined') ? data.postcmd : ''; // optional

    var script = path.join(__dirname,'update.sh');
    var params = [];
    params.push('-r',data.branch+'__'+data.repository_url.split('/').pop());
    params.push('-b',data.bare_repo);
    params.push('-u',data.repository_url);
    params.push('-a',data.repository_url.split('/').pop());
    params.push('-n',data.branch);
    params.push('-w',path.join(data.bare_repo,data.branch+'__'+data.repository_url.split('/').pop()));
    params.push('-d',data.destination);
    params.push('-t',timeout);
    params.push('-i',data.user);
    params.push('-c',"'"+postcmd+"'");
    proc.execFile(script, params, function(error,stdout,stderr){
        if (error === null) {
            console.log(stdout,stderr);
            callback(true);
        } else {
            console.log(error,stdout,stderr);
            callback(false);
        }
    });
};

var update = function(req,data,callback){
    console.log('======================================');
    var toupdate = false;
    var changes = (typeof req.body.push.changes !== 'undefined') ? req.body.push.changes : false;
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
            res.status(200).send('OK, task scheduled');
            console.log('Processing '+domain_data.name);
            update(req, domain_data ,function(result){
                if(result){
                    console.log('sync done');
                } else {
                    console.log('sync failed');
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
