const exec = require('child_process').exec;
const fs = require('fs');
const yaml = require('js-yaml');
const core = require('@actions/core');
const github = require('@actions/github');

run();

async function run() {
    try {
        const labelsStr = core.getInput('labels');
        const scheduleInterval = core.getInput('schedule-interval');
        const excludedPaths = core.getInput('excluded-paths').split(',');

        fetchData()
            .then(async dirData => {
                filteredData = dirData
                    .filter(data => data !== '' && !excludedPaths.includes(data));
                createFile(labelsStr, scheduleInterval, filteredData);
                core.setOutput('need-update', await checkNeedUpdate());
            })
            .catch(err => {
                throw err;
            });
    } catch (error) {
      core.setFailed(error.message);
    }
}

function fetchData() {
    const fetchEntryCommand = `find . -type f -not -path "*/.terraform/*" -name \*.tf | sed s/^.// | sed 's/\/[^/]\+\.tf$//g' | uniq`;
    return new Promise((resolve, reject) => {
        exec(fetchEntryCommand,
            function (error, stdout, stderr) {
                if (error !== null) {
                   reject(error);
                }
                resolve(stdout.split('\n'));
            });
    });
}

function checkNeedUpdate() {
    return new Promise((resolve, reject) => {
        exec('git status -s',
            function (error, stdout, stderr) {
                if (error !== null) {
                   reject(error);
                }
                resolve(stdout === '');
            });
    });
}

function createFile(labelsStr, scheduleInterval, dirData) {
    const dir = '.github';
    const filePath = '.github/dependabot.yml';
    const yamlTemplate = {
        version: 2,
        updates: []
    };

    for(let data of dirData) {
        const processedLabels = [];
        labelsStr.split(',')
            .filter(el => el !== '')
            .forEach(el => processedLabels.push(el));
        yamlTemplate.updates.push({
            "package-ecosystem": 'terraform',
            directory: data,
            labels: processedLabels,
            schedule: {
                interval: scheduleInterval
            }
        });
    }

    const yamlStr = yaml.dump(yamlTemplate, {quotingType: "\"", forceQuotes: true});

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    fs.writeFileSync(filePath, yamlStr, 'utf8');
}
