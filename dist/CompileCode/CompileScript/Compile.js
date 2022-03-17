import path from "path";
import SourceMapStore from "../../EasyDebug/SourceMapStore.js";
import StringTracker from "../../EasyDebug/StringTracker.js";
import { paramsImport } from "../../ImportFiles/Script.js";
import EasyFs from "../../OutputInput/EasyFs.js";
import { ConvertSyntaxMini } from "../../Plugins/Syntax/RazorSyntax.js";
import { BasicSettings, getTypes } from "../../RunTimeBuild/SearchFileSystem.js";
import { SplitFirst } from "../../StringMethods/Splitting.js";
import JSParser from "../JSParser.js";
export default class CRunTime {
    constructor(script, sessionInfo, smallPath, debug, isTs) {
        this.script = script;
        this.sessionInfo = sessionInfo;
        this.smallPath = smallPath;
        this.debug = debug;
        this.isTs = isTs;
        this.define = {};
    }
    templateScript(scripts) {
        const build = new StringTracker();
        build.AddTextAfterNoTrack(`const __writeArray = []
        var __write;

        function write(text){
            __write.text += text;
        }`);
        for (const i of scripts) {
            build.AddTextAfterNoTrack(`__write = {text: ''};
            __writeArray.push(__write);`);
            build.Plus(i);
        }
        build.AddTextAfterNoTrack(`return __writeArray`);
        return build;
    }
    methods(attributes) {
        const page__filename = BasicSettings.fullWebSitePath + this.smallPath;
        return {
            string: 'script,style,define,store,page__filename,page__dirname,attributes',
            funcs: [
                this.sessionInfo.script.bind(this.sessionInfo),
                this.sessionInfo.style.bind(this.sessionInfo),
                (key, value) => this.define[String(key)] = value,
                this.sessionInfo.compileRunTimeStore,
                page__filename,
                path.dirname(page__filename),
                attributes
            ]
        };
    }
    async compile(attributes) {
        this.script = await ConvertSyntaxMini(this.script, "@compile", "*");
        const parser = new JSParser(this.script, this.smallPath, '<%*', '%>');
        await parser.findScripts();
        if (parser.values.length == 1 && parser.values[0].type === 'text')
            return this.script;
        const [type, filePath] = SplitFirst('/', this.smallPath), typeArray = getTypes[type] ?? getTypes.Static, compilePath = typeArray[1] + filePath + '.comp.js';
        await EasyFs.makePathReal(filePath, typeArray[1]);
        const template = this.templateScript(parser.values.filter(x => x.type != 'text').map(x => x.text));
        const sourceMap = new SourceMapStore(compilePath, this.debug, false, false);
        sourceMap.addStringTracker(template);
        const { funcs, string } = this.methods(attributes);
        const toImport = await paramsImport(string, compilePath, filePath, typeArray, this.isTs, this.debug, template.eq, sourceMap.mapAsURLComment());
        const buildStrings = await toImport(...funcs);
        const build = new StringTracker();
        for (const i of parser.values) {
            if (i.type == 'text') {
                build.Plus(i.text);
                continue;
            }
            build.AddTextAfterNoTrack(buildStrings.pop().text);
        }
        return build;
    }
}
//# sourceMappingURL=Compile.js.map