const path = require('path');
const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');

const dag_json = core.getInput('dag_json') || 'dag.json';
const api_url = core.getInput('api_url') || "https://api.servc.io";
const api_token = core.getInput('api_token');
const debug = core.getInput('debug').toLowerCase() === 'true';

const dagText = fs.readFileSync(dag_json, 'utf8');
if (!dagText) {
    core.setFailed(`Failed to read DAG file: ${dag_json}`);
    return;
}
dag = JSON.parse(dagText);

const options = (method = "GET", extraOpts = {}) => ({
    method,
    headers: {
        "Content-Type": "application/json",
        "Apitoken": api_token,
    },
    ...extraOpts
})

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

const is_bad_html = (text) => text.toLowerCase().startsWith('<!DOCTYPE html>'.toLowerCase());

const publishdag = async ()=>{
    let success = false;
    try {
        const response = await fetch(
            api_url, 
            options("POST", {body: JSON.stringify(payload)})
        );
        const text = await response.text();
        if(text){
            if(is_bad_html(text)) {
                return publishdag();
            }

            const idurl = path.join(api_url, 'id', text);
            while(true){
                const idresponse = await fetch(idurl, options());
                const idtext = await idresponse.text();
                if(idtext){
                    if(is_bad_html(idtext)) continue
                    
                    core.info(`Response: ${idtext}`);
                    const responseJSON = JSON.parse(idtext);
                    if(responseJSON && (responseJSON.progress === 100 || responseJSON.isError)){
                        success = !!responseJSON.isError;

                        if(responseJSON.isError && !debug) {
                            core.setFailed(`Error: ${responseJSON.responseBody}`);
                            break;
                        }
                        core.info(responseJSON.responseBody);
                        break;
                    }
                }
            }

        }
    } catch (error) {
        core.error(`Error: ${error}`);
    }

    if(!success){
        core.setFailed('Failed to send data');
    }
};

publishdag().then(()=> true);