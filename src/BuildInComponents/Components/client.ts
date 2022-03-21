import StringTracker from '../../EasyDebug/StringTracker';
import { tagDataObjectArray, BuildInComponent, BuildScriptWithoutModule } from '../../CompileCode/XMLHelpers/CompileTypes';
import JSParser from '../../CompileCode/JSParser'
import { minify } from "terser";
import { PrintIfNew } from '../../OutputInput/PrintNew';
import { SessionBuild } from '../../CompileCode/Session';
import InsertComponent from '../../CompileCode/InsertComponent';

function replaceForClient(BetweenTagData: string, exportInfo: string) {
    BetweenTagData = BetweenTagData.replace(`"use strict";Object.defineProperty(exports, "__esModule", {value: true});`, exportInfo);
    return BetweenTagData;
}

const serveScript = '/serv/temp.js';

async function template(BuildScriptWithoutModule: BuildScriptWithoutModule, name: string, params: string, selector: string, mainCode: StringTracker, path: string, isDebug: boolean) {
    const parse = await JSParser.RunAndExport(mainCode, path, isDebug);
    return `function ${name}({${params}}, selector = "${selector}", out_run_script = {text: ''}){
        const {write, writeSafe, setResponse, sendToSelector} = new buildTemplate(out_run_script);
        ${replaceForClient(
        await BuildScriptWithoutModule(parse),
        `var exports = ${name}.exports;`
    )
        }
        return sendToSelector(selector, out_run_script.text);
    }\n${name}.exports = {};`
}

export default async function BuildCode(path: string, pathName: string, LastSmallPath: string, type: StringTracker, dataTag: tagDataObjectArray, BetweenTagData: StringTracker, InsertComponent: InsertComponent, BuildScriptWithoutModule: BuildScriptWithoutModule, sessionInfo: SessionBuild): Promise<BuildInComponent> {

    BetweenTagData = await InsertComponent.StartReplace(BetweenTagData, pathName, path, LastSmallPath, (x: StringTracker) => x.eq, sessionInfo);

    sessionInfo.script(serveScript, {async: null});

    let scriptInfo = await template(
        BuildScriptWithoutModule,
        dataTag.getValue('name'),
        dataTag.getValue('params'),
        dataTag.getValue('selector'),
        BetweenTagData,
        pathName,
        sessionInfo.debug && !InsertComponent.SomePlugins("SafeDebug")
    );

    const minScript = InsertComponent.SomePlugins("MinJS") || InsertComponent.SomePlugins("MinAll");

    if (minScript) {
        try {
            scriptInfo = (await minify(scriptInfo, { module: false, format: { comments: 'all' } })).code;
        } catch (err) {
            PrintIfNew({
                errorName: 'minify',
                text: BetweenTagData.debugLine(err)
            })
        }
    }

    sessionInfo.addScriptStylePage('script', dataTag, type).addText(scriptInfo); // add script

    return {
        compiledString: new StringTracker()
    }
}