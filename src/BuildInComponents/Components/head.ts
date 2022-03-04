import StringTracker from '../../EasyDebug/StringTracker';
import { tagDataObjectArray, StringNumberMap, setDataHTMLTag, BuildInComponent, SessionInfo, BuildScriptWithoutModule } from '../../CompileCode/XMLHelpers/CompileTypes';
import path from 'path';
import EasyFs from '../../OutputInput/EasyFs';
import { BasicSettings, getTypes } from '../../RunTimeBuild/SearchFileSystem';
import Base64Id from '../../StringMethods/Id';

export default async function BuildCode(path: string, pathName: string, LastSmallPath: string, type: StringTracker, dataTag: tagDataObjectArray, BetweenTagData: StringTracker, dependenceObject: StringNumberMap, isDebug: boolean, InsertComponent: any, buildScript: BuildScriptWithoutModule, sessionInfo: SessionInfo): Promise<BuildInComponent> {
    return {
        compiledString: new StringTracker(type.DefaultInfoText).Plus$`<head${InsertComponent.ReBuildTagData(BetweenTagData.DefaultInfoText, dataTag)}>${await InsertComponent.StartReplace(BetweenTagData, pathName, path, LastSmallPath, isDebug, dependenceObject, buildScript, sessionInfo)
            }@DefaultInsertBundle</head>`,
        checkComponents: false
    }
}

function makeName(fullCompilePath: string) {
    let name = fullCompilePath.split(/\/|\\/).pop().split('.' + BasicSettings.pageTypes.page).shift(); // create name
    name += '-' + Base64Id(name, 5) + '.pub';

    return [name, path.join(fullCompilePath, '../' + name)];
}

function addHTMLTags(sessionInfo: SessionInfo) {

    const makeAttributes = (i: setDataHTMLTag) => i.attributes ? ' ' + Object.keys(i.attributes).map(x => i.attributes[x] ? x + `="${i.attributes[x]}"` : x).join(' ') : '';

    const addTypeInfo = sessionInfo.typeName == getTypes.Logs[2] ? '?t=l': '';
    let buildBundleString = ''; // add scripts add css
    for (const i of sessionInfo.styleURLSet)
        buildBundleString += `<link rel="stylesheet" href="${i.url+addTypeInfo}"${makeAttributes(i)}/>`;
    for (const i of sessionInfo.scriptURLSet)
        buildBundleString += `<script src="${i.url+addTypeInfo}"${makeAttributes(i)}></script>`;

    return buildBundleString + sessionInfo.headHTML;
}

function addScriptAndStyle(sessionInfo: SessionInfo, compilePath: string, name: string) {
    const inSitePath = (sessionInfo.typeName == getTypes.Logs[2] ? path.relative(getTypes.Logs[1], compilePath + '/../' + name) : path.relative(getTypes.Static[1], compilePath + '/../' + name)).replace(/\\/gi, '/');

    //add script
    if (sessionInfo.script.notEmpty()) { // add default script
        sessionInfo.scriptURLSet.push({ url: `/${inSitePath}.js`, attributes: {defer: null} });
        EasyFs.writeFile(compilePath + '.js', sessionInfo.script.createDataWithMap());
    }

    if (sessionInfo.scriptModule.notEmpty()) {
        sessionInfo.scriptURLSet.push({ url: `/${inSitePath}.module.js`, attributes: {type: 'module'} });
        EasyFs.writeFile(compilePath + '.module.js', sessionInfo.scriptModule.createDataWithMap());
    }

    //add style
    if (sessionInfo.style.notEmpty()) { // add default style
        sessionInfo.styleURLSet.push({ url: `/${inSitePath}.css` });
        EasyFs.writeFile(compilePath + '.css', sessionInfo.style.createDataWithMap());
    }
}

export async function addFinalizeBuild(pageData: StringTracker, sessionInfo: SessionInfo, fullCompilePath: string) {
    const [name, compilePath] = makeName(fullCompilePath);

    addScriptAndStyle(sessionInfo, compilePath, name);

    const buildBundleString = addHTMLTags(sessionInfo);

    const bundlePlaceholder = [/@InsertBundle(;?)/, /@DefaultInsertBundle(;?)/];
    const removeBundle = () => {bundlePlaceholder.forEach(x => pageData = pageData.replace(x, '')); return pageData};


    if (!buildBundleString)  // there isn't anything to bundle
        return removeBundle();

    const replaceWith = new StringTracker(null, buildBundleString); // add bundle to page
    let bundleSucceed = false;

    for (let i = 0; i < bundlePlaceholder.length && !bundleSucceed; i++)
        pageData = pageData.replacer(bundlePlaceholder[i], () => (bundleSucceed = true) && replaceWith);

    if(bundleSucceed)
        return removeBundle();

    return pageData.Plus(replaceWith);
}