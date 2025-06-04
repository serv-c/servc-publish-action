/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 214:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const fs = __nccwpck_require__(896);
const core = __nccwpck_require__(214);
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
module.exports = __webpack_exports__;
/******/ })()
;