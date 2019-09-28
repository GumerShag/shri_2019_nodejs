const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const args = require('minimist')(process.argv.slice(2));
const app = express();
const repoPath = args.p;
const absoluteReposPath = path.resolve(__dirname, repoPath);
const cors = require('cors');

app.use(cors());
app.get('/api/repos/', (req, res) => {
    let { start, limit } = req.query;
    start = start ? parseInt(start) : undefined;
    limit = limit ? parseInt(limit) : undefined;

    if (!fs.existsSync(absoluteReposPath)) {
        res.status(404).json({ error: 'Wrong path to repositories folder.' });
        return;
    }

    fs.readdir(absoluteReposPath, (err, repos) => {
        if (err) {
            res.status(500).json({ error: err });
            return;
        }

        //Adding simple pagination
        if (typeof start !== 'undefined' && typeof limit !== 'undefined') {
            let reposPerPage = [];
            for (let i = start; i < limit + start; i++) {
                if (repos[i] && i < repos.length) {
                    reposPerPage.push({ id: repos[i] });
                }
            }
            return res.json(reposPerPage);
        } else {
            //Add some timeout to get it more realistic
            setTimeout(function () {
                res.json(repos.map(id => ({ id })));
            }, 500)

        }
    });
});

app.get('/api/repo/search', (req, res) => {
    exec(
        `git ls-tree -r master --name-only`,
        {cwd: `${absoluteReposPath}`},
        (err, content) => {
            if (err) {
                res.status(500).json({error: err});
                return;
            }
            const contentList = content.split('\n');
            res.json(contentList.filter(name => name).map(name => {return {id: path.basename(name)}}));
        }
    );
});

app.get('/api/repos/:repositoryId/commits/:commitHash', (req, res) => {
    const { repositoryId } = req.params;
    const { commitHash } = req.params;

    exec(
        `git rev-parse ${commitHash}`,
        { cwd: `${absoluteReposPath}/${repositoryId}` },
        (err, stdout) => {
            if (err) {
                if (err.message.indexOf('unknown revision') > -1) {
                    res.status(404).json({
                        error: `404. ${commitHash}: no such commit or branch`
                    });
                    return;
                }
                return;
            }
            const branchHash = stdout.trim();
            exec(
                'git --no-pager log ' +
                    branchHash +
                    ' --pretty=format:"{@commitHash@: @"%H"@,@message@: @"%s"@,@date@: @"%cd"@}"',
                { cwd: `${absoluteReposPath}/${repositoryId}` },
                (err, logData) => {
                    if (err) {
                        console.error(`exec error: ${err}`);
                        return;
                    }
                    let commitsArray = logData.replace(/@/g, '"').split('\n');
                    res.json(
                        commitsArray.map(commit => {
                            return JSON.parse(`${commit}`);
                        })
                    );
                }
            );
        }
    );
});
app.get('/*', (req, res) => {
    res.status(404).send();
});
app.get('/api/repos/:repositoryId/commits/:commitHash/diff', (req, res) => {
    const { repositoryId } = req.params;
    const { commitHash } = req.params;

    exec(
        `git diff ${commitHash}~ ${commitHash}`,
        { cwd: `${absoluteReposPath}/${repositoryId}` },
        (err, diff) => {
            if (err) {
                res.status(500).json({ error: err });
                return;
            }
            res.json({ diff });
        }
    );
});

app.get('/api/repos/:repositoryId/tree/:commitHash*', (req, res) => {
    const { repositoryId } = req.params;
    const { commitHash } = req.params;
    let path = req.params[0];

    exec(
        `git rev-parse ${commitHash}`,
        { cwd: `${absoluteReposPath}/${repositoryId}` },
        (err, commitHash) => {
            if (err) {
                res.status(500).json({ error: err });
                return;
            }
            const branchHash = commitHash.trim();
            path = path.length ? path : '/';
            exec(
                `git show ${branchHash}:${'.'.concat(path)}`,
                { cwd: `${absoluteReposPath}/${repositoryId}` },
                (err, content) => {
                    if (err) {
                        res.status(500).json({ error: err });
                        return;
                    }
                    //fixme: dirty hack to format output
                    const contentList = content.split('\n\n')[1].split('\n');
                    res.json(contentList.filter(name => name));
                }
            );
        }
    );
});

app.get('/api/repos/:repositoryId/blob/:commitHash*', (req, res) => {
    const { repositoryId } = req.params;
    const { commitHash } = req.params;
    const pathToFile = req.params[0];

    exec(
        `git rev-parse ${commitHash}`,
        { cwd: `${absoluteReposPath}/${repositoryId}` },
        (err, commitHash) => {
            if (err) {
                res.status(500).json({ error: err });
                return;
            }
            const branchHash = commitHash.trim();
            exec(
                `git show ${branchHash}:${'.'.concat(pathToFile)}`,
                { cwd: `${absoluteReposPath}/${repositoryId}` },
                (err, content) => {
                    if (err) {
                        res.status(500).json({ error: err });
                        return;
                    }
                    res.send(content);
                }
            );
        }
    );
});

app.route('/api/repos/:repositoryId')
    .get((req, res) => {
        const { repositoryId } = req.params;

        exec(
            `git ls-tree HEAD --name-only`,
            { cwd: `${absoluteReposPath}/${repositoryId}` },
            (err, content) => {
                if (err) {
                    res.status(500).json({ error: err });
                    return;
                }
                const contentList = content.split('\n');
                res.json(contentList.map(name => name));
            }
        );
    })
    .delete((req, res) => {
        const { repositoryId } = req.params;
        const command = os.platform() === 'win32' ? 'rmdir /Q /S' : 'rm -rf';

        exec(
            `${command} ${repositoryId}`,
            { cwd: `${absoluteReposPath}` },
            err => {
                if (err) {
                    res.status(500).json({ message: err });
                    return;
                }
                res.json({ message: 'OK' });
            }
        );
    })
    .post(bodyParser.json(), (req, res) => {
        const { repositoryId } = req.params;
        const { url } = req.body;

        exec(
            `git clone ${url} ${repositoryId}`,
            { cwd: `${absoluteReposPath}` },
            err => {
                if (err) {
                    if (
                        err.message.indexOf(
                            'HttpRequestException encountered'
                        ) > -1
                    ) {
                        res.status(404).json({
                            message: "Repository doesn't exist"
                        });
                        return;
                    }
                    res.status(500).json({ message: err });
                    return;
                }

                res.status(201).json({ message: 'OK', id: repositoryId });
            }
        );
    });

app.listen(3000);
console.log("Server started on http://localhost:3000");
