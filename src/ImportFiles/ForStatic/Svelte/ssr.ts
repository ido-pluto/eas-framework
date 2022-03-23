import path from "path";
import { SessionBuild } from "../../../CompileCode/Session";
import  { Capitalize, preprocess } from "./preprocess";
import * as svelte from 'svelte/compiler';
import { CompileOptions } from "svelte/types/compiler/interfaces";
import { BasicSettings, getTypes } from "../../../RunTimeBuild/SearchFileSystem";
import { PrintIfNew } from "../../../OutputInput/PrintNew";
import EasyFs from "../../../OutputInput/EasyFs";
import { clearModule, resolve } from "../../redirectCJS";

export default async function registerExtension(filePath: string, smallPath: string, sessionInfo: SessionBuild) {
    const name = path.parse(filePath).name.replace(/^\d/, '_$&').replace(/[^a-zA-Z0-9_$]/g, '');

    const options: CompileOptions = {
        filename: filePath,
        name: Capitalize(name),
        generate: 'ssr',
        format: 'cjs',
        dev: sessionInfo.debug,
    };

    const {svelteFiles, code, map, dependencies} = await preprocess(filePath, smallPath,'.ssr.cjs');
    Object.assign(sessionInfo.dependencies,dependencies);
    options.sourcemap = map;

    const promises = [];
    for(const file of svelteFiles){
        clearModule(resolve(file)); // delete old imports
        promises.push(registerExtension(file, BasicSettings.relative(file), sessionInfo))
    }

    await Promise.all(promises);
    const { js, css, warnings } = svelte.compile(code, <any>options);

    if (sessionInfo.debug) {
        warnings.forEach(warning => {
            PrintIfNew({
                errorName: warning.code,
                type: 'warn',
                text: warning.message + '\n' + warning.frame
            });
        });
    }

    const inStaticFile = path.relative(getTypes.Static[2], smallPath);
    const fullCompilePath = getTypes.Static[1] + inStaticFile;

    const fullImportPath = fullCompilePath + '.ssr.cjs';
    await EasyFs.writeFile(fullImportPath, js.code);

    if (css.code) {
        css.map.sources[0] = '/' + inStaticFile.split(/\/|\//).pop() + '?source=true';
        css.code += '\n/*# sourceMappingURL=' + css.map.toUrl() + '*/';
    }

    await EasyFs.writeFile(fullCompilePath + '.css', css.code ?? '');

    return fullImportPath;
}
