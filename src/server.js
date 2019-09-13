const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const {exec} = require('child_process');
const bodyParser = require('body-parser');
const args = require('minimist')(process.argv.slice(2));
const app = express();
const repoPath = args.p;
const absoluteRepoPath = path.resolve(__dirname, repoPath);

app.get('/api/repos/', (req, res) => {
    if (!fs.existsSync(absoluteRepoPath)) {
        res.json({error: 'Wrong path to repositories folder.'});
        return;
    }
    fs.readdir(absoluteRepoPath, (err, repos) => {
        if (err) {
            console.log(err);
            return;
        }
        res.set('Content-Type', 'application/json').send(repos.map(id => ({id})));
    })

});

app.get('/api/repos/:repositoryId/commits/:commitHash', (req, res) => {
    const {repositoryId} = req.params;
    const {commitHash} = req.params;
    exec(`git rev-parse ${commitHash}`, {cwd: `${absoluteRepoPath}/${repositoryId}`}, (err, stdout) => {
        if (err) {
            if (err.message.indexOf('unknown revision') > -1) {
                res.status(404).json({error: `404. ${commitHash}: no such commit or branch`});
                return;
            }
            return;
        }
        const branchHash = stdout.trim();
        exec('git --no-pager log ' + branchHash + ' --pretty=format:"{@commitHash@: @"%H"@,@message@: @"%s"@,@date@: @"%cd"@}"',
            {cwd: `${absoluteRepoPath}/${repositoryId}`},
            (err, logData) => {
                if (err) {
                    console.error(`exec error: ${err}`);
                    return;
                }
                let commitsArray = logData.replace(/@/g, '"').split('\n');
                res.json(
                    commitsArray.map((commit) => {
                        return JSON.parse(`${commit}`)
                    })
                );
            });
    });
});

app.get('/api/repos/:repositoryId/commits/:commitHash/diff', (req, res) => {
    const {repositoryId} = req.params;
    const {commitHash} = req.params;

    exec(`git diff ${commitHash}~ ${commitHash}`, {cwd: `${absoluteRepoPath}/${repositoryId}`}, (err, stdout) => {
        if (err) {
            console.log(err);
            return;
        }
        res.json({diff: stdout});
    })

});

app.get(['/api/repos/:repositoryId', '/api/repos/:repositoryId/tree/:commitHash?/:path*'], (req, res) => {
    const {repositoryId} = req.params;
    const {commitHash} = req.params;
    const {path} = req.params;

    //todo: hack
    if (req.originalUrl.indexOf('tree') > -1) {
        exec(`git rev-parse ${commitHash}`, {cwd: `${absoluteRepoPath}/${repositoryId}`}, (err, commitHash) => {
            if (err) {
                res.status(500).json({error: err});
                return;
            }
            const branchHash = commitHash;
            exec(`git ls-tree --name-only ${branchHash} ${path}`, {cwd: `${absoluteRepoPath}/${repositoryId}`}, (err, content) => {
                if (err) {
                    console.log(err);
                    return;
                }

                const contentList = content.split('\n');
                res.json(contentList.map(name => name));

            });

        });
    } else {
        //fixme: Should return from Main branch
        exec(`git ls-tree HEAD --name-only`, {cwd: `${absoluteRepoPath}/${repositoryId}`}, (err, content) => {
            if (err) {
                console.log(err);
                return;
            }
            const contentList = content.split('\n');
            res.json(contentList.map(name => name));
        })
    }
});

app.delete('/api/repos/:repositoryId', (req, res) => {
    const {repositoryId} = req.params;
    const command = os.platform === 'win32' ? 'rmdir' : 'rm -rf';

    exec(`${command} ${repositoryId}`, {cwd: `${absoluteRepoPath}`}, (err) => {
        if (err) {
            res.status(500).json({message: err});
            return;
        }
        res.json({message: 'OK'});
    })
});

app.post('/api/repos/:repositoryId', bodyParser.urlencoded(), (req, res) => {
    const {repositoryId} = req.params;
    const {url} = req.body;

    exec(`git clone ${url} ${repositoryId}`, {cwd: `${absoluteRepoPath}`}, (err) => {
        if (err) {
            if (err.message.indexOf('HttpRequestException encountered') > -1) {
                res.status(404).json({message: "Repository doesn't exist"});
                return;
            }
            res.status(500).json({message: err});
            return;
        }

        res.status(201).json({message: 'OK', id: repositoryId});
    })
});

app.listen(3000);
