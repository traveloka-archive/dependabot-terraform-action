const exec = require('child_process').exec;
const fs = require('fs');
const yaml = require('js-yaml');
const core = require('@actions/core');
const github = require('@actions/github');

run();

async function run() {
    console.log("Running action...")
    try {
        const scheduleInterval = core.getInput('schedule-interval');
        const excludedPaths = core.getInput('excluded-paths').split(',');
        const labels = core.getInput('labels')
            .split(',').filter(el => el !== '');

        fetchData()
            .then(async dirData => {
                filteredData = dirData
                    .filter(data => data !== '' && !excludedPaths.includes(data));
                console.log(filteredData)
                core.setOutput('file-has-changed',
                    createFile(labels, scheduleInterval, filteredData));
            })
            .catch(err => {
                throw err;
            });
    } catch (error) {
        core.setFailed(error.message);
    }
}

function fetchData() {
    const fetchEntryCommand = `find . -type f -not -path "*/.terraform/*" -name \\*.tf | sed s/^.// | sed 's/\\/[^/]\\+\\.tf$//g' | uniq`;
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

function checkNeedUpdate(yamlData, existingFilePath) {
    const existingFileStr = fs.readFileSync(existingFilePath, {
        encoding: 'utf8'
    });

    return existingFileStr !== yamlData;
}

function createFile(labels, scheduleInterval, dirData) {
    const dir = '.github';
    const filePath = '.github/dependabot.yml';
    const yamlTemplate = {
        version: 2,
        updates: []
    };

    for (let data of dirData) {
        const entryLabels = labels.map(el => el);
        yamlTemplate.updates.push({
            "package-ecosystem": 'terraform',
            directory: data,
            labels: entryLabels,
            schedule: {
                interval: scheduleInterval
            }
        });
    }

    const yamlStr = yaml.dump(yamlTemplate, { quotingType: "\"", forceQuotes: true });
    console.log(yamlStr)

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    let needUpdate = true;
    if (fs.existsSync(filePath)) {
        needUpdate = checkNeedUpdate(yamlStr, filePath);
    }
    if (needUpdate) {
        fs.writeFileSync(filePath, yamlStr, 'utf8');
    }

    return needUpdate;
}
