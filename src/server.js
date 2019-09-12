const express = require('express');
const path = require('path');
const fs = require('fs');
const {exec} = require('child_process');
const args = require('minimist')(process.argv.slice(2));
const app = express();
const repoPath = args.p;
const absoluteRepoPath = path.resolve(__dirname, repoPath);

app.get('/api/repos/', (req, res) => {
    if (!fs.existsSync(absoluteRepoPath)) {
        res.json({error: 'Wrong path to repositories folder.'});
        return;
    }
    fs.readdir(absoluteRepoPath, (err, files) => {
        if (err) {
            console.log(err);
            return;
        }
        res.set('Content-Type', 'application/json').send(JSON.stringify(files));
    })

});

app.get('/api/repos/:repositoryId/commits/:commitHash', (req, res) => {
   const {repositoryId} = req.params;
   const {commitHash} = req.params;

    if (!commitHash) {
        exec(`git log`, {cwd: `${absoluteRepoPath}/${repositoryId}`}, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
                return;
            }
            res.set('Content-Type', 'application/json').send(JSON.stringify(stdout));
        })
    } else {
        exec(`git log ${commitHash}`, {cwd: `${absoluteRepoPath}/${repositoryId}`}, (err, stdout, stderr) => {
            if (err) {
                if(err.message.indexOf('unknown revision') > -1) {
                    res.status(404).json({error: '404. No such commit'});
                    return;
                }
                return;
            }

            res.set('Content-Type', 'application/json').send(JSON.stringify(stdout));
        })
    }
});

app.get('/api/repos/:repositoryId/commits/:commitHash/diff', (req, res) => {
    const {repositoryId} = req.params;
    const {commitHash} = req.params;

        exec(`git diff ${commitHash}~ ${commitHash}`, {cwd: `${absoluteRepoPath}/${repositoryId}`}, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
                return;
            }
            res.set('Content-Type', 'application/json').send(JSON.stringify(stdout));
        })

});

app.get(['/api/repos/:repositoryId', '/api/repos/:repositoryId/tree/:commitHash?/:path?'], (req, res) => {
    const {repositoryId} = req.params;
    const {commitHash} = req.params;
    const {path} = req.params;
    if (req.originalUrl.indexOf('tree') > -1) {
        exec(`git rev-parse ${commitHash}`, {cwd: `${absoluteRepoPath}/${repositoryId}`}, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
                return;
            }
            const branchHash = stdout;
            exec(`git ls-tree --name-only ${commitHash} ${path}`, {cwd: `${absoluteRepoPath}/${repositoryId}`}, (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.set('Content-Type', 'application/json').send(JSON.stringify(stdout));

            });

        });
        res.send('tree')
    } else {
        //fixme: Should return from Main branch
        exec(`git ls-tree HEAD --name-only`, {cwd: `${absoluteRepoPath}/${repositoryId}`}, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
                return;
            }
            res.set('Content-Type', 'application/json').send(JSON.stringify(stdout));
        })
    }
});
app.listen(3000);

