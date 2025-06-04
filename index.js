const fs = require('fs');
const core = require('@actions/core');
// const github = require('@actions/github');

const dag_json = core.getInput('dag_json') || 'dag.json';
const api_url = core.getInput('api_url') || "https://api.servc.io";
const api_token = JSON.parse(core.getInput('api_token'));

const dagText = fs.readFileSync(dag_json, 'utf8');
if (!dagText) {
    core.setFailed(`Failed to read DAG file: ${dag_json}`);
    return;
}
dag = JSON.parse(dagText);

const payload = {
    type: "input",
    route: "orchestrator",
    argumentId: "plain",
    force: true,
    instanceId: null,
    inputs: {
        method: "add_dag",
        inputs: {
            dag,
        }
    }
}

(async ()=>{
    let success = false;
    let count = parseInt(core.getInput('retrycount') || '5', 10);
    while(count > 0) {
        try {
            const response = await fetch(api_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Apitoken": api_token,
                },
                body: JSON.stringify(payload),
                });
            const text = await response.text();

            if(text){
                const responseJSON = JSON.parse(text);
                if(responseJSON && (responseJSON.progress === 100 || responseJSON.isError)){
                    success = !!responseJSON.isError;
                    core.info(responseJSON.responseBody);
                    break;
                }
            }
        } catch (error) {
            core.error(`Error: ${error}`);
            count--;
        }
    }

    if(!success){
        core.setFailed('Failed to send data');
    }
})();