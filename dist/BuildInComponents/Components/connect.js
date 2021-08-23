import StringTracker from '../../EasyDebug/StringTracker.js';
import { compileValues, makeValidationJSON } from './serv-connect/index.js';
const serveScript = '/serv/connect.js';
function template(name) {
    return `function ${name}(...args){return connector("${name}", args)}`;
}
export default async function BuildCode(type, dataTag, BetweenTagData, isDebug, { SomePlugins }, sessionInfo) {
    const name = dataTag.getValue('name'), sendTo = dataTag.getValue('sendTo'), validator = dataTag.getValue('validate');
    let message = dataTag.have('message'); // show error message
    if (!message)
        message = isDebug && !SomePlugins("SafeDebug");
    sessionInfo.scriptURLSet.push({
        url: serveScript,
        attributes: { async: null }
    });
    sessionInfo.script.addText(template(name));
    sessionInfo.connectorArray.push({
        type: 'connect',
        name,
        sendTo,
        message: message != null,
        validator: validator && validator.split(',').map(x => x.trim())
    });
    return {
        compiledString: BetweenTagData,
        checkComponents: true
    };
}
export function addFinalizeBuild(pageData, sessionInfo) {
    if (!sessionInfo.connectorArray.length)
        return pageData;
    let buildObject = '';
    for (const i of sessionInfo.connectorArray) {
        if (i.type != 'connect')
            continue;
        buildObject += `,
        {
            name:"${i.name}",
            sendTo:${i.sendTo},
            message:${i.message},
            validator:[${(i.validator && i.validator.map(compileValues).join(',')) || ''}]
        }`;
    }
    buildObject = `[${buildObject.substring(1)}]`;
    const addScript = `
        if(Post?.connectorCall){
            if(await handelConnector("connect", page, ${buildObject})){
                return;
            }
        }`;
    if (pageData.includes("@ConnectHere"))
        pageData = pageData.replacer(/@ConnectHere(;?)/, () => new StringTracker(null, addScript));
    else
        pageData.AddTextAfter(addScript);
    return pageData;
}
export async function handelConnector(thisPage, connectorArray) {
    if (!thisPage.Post?.connectorCall)
        return false;
    const have = connectorArray.find(x => x.name == thisPage.Post.connectorCall.name);
    if (!have)
        return false;
    const values = thisPage.Post.connectorCall.values;
    const isValid = have.validator.length && await makeValidationJSON(values, have.validator);
    thisPage.setResponse('');
    if (!have.validator.length || isValid === true) {
        const obj = await have.sendTo(...values);
        thisPage.Response.setHeader('Content-Type', 'application/json');
        thisPage.Response.end(JSON.stringify(obj));
    }
    else if (have.message)
        thisPage.Response.json({
            error: isValid.shift()
        });
    else
        thisPage.Response.status(400);
    return true;
}
//# sourceMappingURL=connect.js.map