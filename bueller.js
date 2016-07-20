'use strict';

var GitHubApi = require('github'),
    moment = require('moment'),
    _ = require('lodash'),
    token = process.env.GITHUB_API_TOKEN;

var github = new GitHubApi({
    //debug: true,
    protocol: 'https',
    headers: {
        'user-agent': 'bueller'
    },
    Promise: require('bluebird')
});

if (token) {
    github.authenticate({
        type: 'oauth',
        token: token
    });
}

var outdated_repos = [];
var total_repo_count = 0;

github.repos.getForOrg({
    org: '18F',
    per_page: 100
}, mapOutdatedRepos);

function mapOutdatedRepos(err, data) {
    if (err) {
        return false;
    }
    _.map(data, function(repo) {
        total_repo_count += 1;
        var d = new Date();
        d.setMonth(d.getMonth() - 9);
        var outdated = moment(repo.pushed_at) < moment(d);
        if (outdated) {
            outdated_repos.push(repo);
        }
    });
    if (github.hasNextPage(data)) {
        github.getNextPage(data, mapOutdatedRepos)
    } else {
        outputRepos();
    }
}

function outputRepos() {
    console.log(outdated_repos.map(function(repo) { return repo['full_name']; }));
    console.log('outdated repos: ' + outdated_repos.length);
    console.log('total repos:    ' + total_repo_count);
}