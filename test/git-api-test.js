const assert = require('assert');
const { expect } = require('chai');
const axios = require('axios');
const REPO_URL = `https://github.com/jherax/array-sort-by.git`;
const REPO_NAME = 'TestingRepo';
const BASE_PATH = `http://localhost:3000/api/repos`;

describe('Testing GIT API', async () => {
    before(done => {
        axios
            .post(`${BASE_PATH}/${REPO_NAME}`, {
                url: REPO_URL
            })
            .then(response => {
                assert.deepEqual(response.data, {
                    message: 'OK',
                    id: REPO_NAME
                });
            })
            .then(done, done)
            .catch();
    });

    after(done => {
        axios
            .delete(`${BASE_PATH}/${REPO_NAME}`)
            .then(response => {
                assert.deepEqual(response.data, { message: 'OK' });
            })
            .then(done, done)
            .catch();
    });

    it('Tesing GET all repositories from folder', done => {
        axios
            .get(`${BASE_PATH}`)
            .then(response => {
                assert.deepEqual(response.data, [
                    {
                        id: 'TestingRepo'
                    }
                ]);
            })
            .then(done, done)
            .catch();
    });

    it('Tesing GET all repositories from folder', async () => {
        const response = await axios.get(`${BASE_PATH}`).then();
        expect(response.data).to.deep.equal([
            {
                id: 'TestingRepo'
            }
        ]);
    });

    it('Tesing GET content from repo root', done => {
        axios
            .get(`${BASE_PATH}/${REPO_NAME}`)
            .then(response => {
                assert.deepEqual(response.data, [
                    '.babelrc',
                    '.editorconfig',
                    '.eslintignore',
                    '.eslintrc.json',
                    '.gitignore',
                    '.nvmrc',
                    'LICENSE',
                    'README.md',
                    'dist',
                    'package-lock.json',
                    'package.json',
                    'src',
                    'test',
                    'webpack',
                    ''
                ]);
            })
            .then(done, done)
            .catch();
    });

    it('Tesing GET content from branch', done => {
        axios.get(`${BASE_PATH}/${REPO_NAME}/tree/master`).then(response => {
            done();
            assert.deepEqual(response.data, [
                '.babelrc',
                '.editorconfig',
                '.eslintignore',
                '.eslintrc.json',
                '.gitignore',
                '.nvmrc',
                'LICENSE',
                'README.md',
                'dist/',
                'package-lock.json',
                'package.json',
                'src/',
                'test/',
                'webpack/'
            ]);
        });
    });

    it('Tesing GET content from branch and path', done => {
        axios
            .get(`${BASE_PATH}/${REPO_NAME}/tree/master/src`)
            .then(response => {
                done();
                assert.deepEqual(response.data, [
                    'default-sort.js',
                    'escapeRegExp.js',
                    'generate-char-codes.js',
                    'ignore-accent.js',
                    'map-accents.js',
                    'memoize.js',
                    'polyfills.js',
                    'sort-by.js',
                    'sort-items.js'
                ]);
            });
    });

    it('Tesing GET content of the file', done => {
        axios
            .get(`${BASE_PATH}/${REPO_NAME}/tree/master/src/escapeRegExp.js`)
            .then(response => {
                done();
                assert.deepEqual(response.data, [
                    '/**',
                    ' * Escapes the special characters in the entry parameter, so that',
                    ' * it can be used as a pattern in a regular expression constructor.',
                    ' *',
                    ' * @param  {String} text: special characters to escape',
                    ' * @return {String}',
                    ' */',
                    'export default function escapeRegExp(text) {',
                    "  return text.replace(ESCAPE_CHARS, '\\\\$&');",
                    '}'
                ]);
            });
    });
});
