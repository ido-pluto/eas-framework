import EasyFs from '../OutputInput/EasyFs';
import { Dirent } from 'fs';
import { Insert, Components, GetPlugin } from '../CompileCode/InsertModels';
import { ClearWarning } from '../OutputInput/PrintNew'
import * as SearchFileSystem from './SearchFileSystem';
import ReqScript from '../ImportFiles/Script';
import StaticFiles from '../ImportFiles/StaticFiles';
import path from 'path';
import CompileState from './CompileState';
import { SessionBuild } from '../CompileCode/Session';
import { CheckDependencyChange, pageDeps } from '../OutputInput/StoreDeps';
import { ExportSettings } from '../MainBuild/SettingsTypes';
import { argv } from 'process';
import { createSiteMap } from './SiteMap';
import { isFileType, RemoveEndType } from './FileTypes';

async function compileFile(filePath: string, arrayType: string[], isDebug?: boolean, hasSessionInfo?: SessionBuild, nestedPage?: string, nestedPageData?: string) {
    const FullFilePath = path.join(arrayType[0], filePath), FullPathCompile = arrayType[1] + filePath + '.cjs';
    const dependenceObject: any = {
        thisPage: await EasyFs.stat(FullFilePath, 'mtimeMs')
    };

    const html = await EasyFs.readFile(FullFilePath, 'utf8');
    const ExcluUrl = (nestedPage ? nestedPage + '<line>' : '') + arrayType[2] + '/' + filePath;

    const sessionInfo = hasSessionInfo ?? new SessionBuild(arrayType[2] + '/' + filePath, arrayType[2], isDebug && !GetPlugin("SafeDebug"));
    const CompiledData = await Insert(html, FullPathCompile, FullFilePath, ExcluUrl, isDebug, dependenceObject, Boolean(nestedPage), nestedPageData, sessionInfo);

    if (!nestedPage) {
        await EasyFs.writeFile(FullPathCompile, <string>CompiledData);
        pageDeps.update(RemoveEndType(ExcluUrl), dependenceObject);
    }

    return { CompiledData, dependenceObject, sessionInfo };
}

async function FilesInFolder(arrayType: string[], path: string, state: CompileState) {
    const allInFolder = await EasyFs.readdir(arrayType[0] + path, { withFileTypes: true });

    for (const i of <Dirent[]>allInFolder) {
        const n = i.name, connect = path + n;
        if (i.isDirectory()) {
            await EasyFs.mkdir(arrayType[1] + connect);
            await FilesInFolder(arrayType, connect + '/', state);
        }
        else {
            if (isFileType(SearchFileSystem.BasicSettings.pageTypesArray, n)) {
                state.addPage(connect, arrayType[2]);
                if (await CheckDependencyChange(arrayType[2] + '/' + connect)) //check if not already compile from a 'in-file' call
                    await compileFile(connect, arrayType, false);
            } else if (arrayType == SearchFileSystem.getTypes.Static && isFileType(SearchFileSystem.BasicSettings.ReqFileTypesArray, n)) {
                state.addImport(connect);
                await ReqScript('Production Loader - ' + arrayType[2], connect, arrayType, false);
            } else {
                state.addFile(connect);
                await StaticFiles(connect, false);
            }
        }
    }
}

async function RequireScripts(scripts: string[]) {
    for (const path of scripts) {
        await ReqScript('Production Loader', path, SearchFileSystem.getTypes.Static, false);
    }
}

async function CreateCompile(t: string, state: CompileState) {
    const types = SearchFileSystem.getTypes[t];
    await SearchFileSystem.DeleteInDirectory(types[1]);
    return () => FilesInFolder(types, '', state);
}

/**
 * when page call other page;
 */
async function FastCompileInFile(path: string, arrayType: string[], sessionInfo?: SessionBuild, nestedPage?: string, nestedPageData?: string) {
    await EasyFs.makePathReal(path, arrayType[1]);
    return await compileFile(path, arrayType, true, sessionInfo, nestedPage, nestedPageData);
}

Components.CompileInFile = <any>FastCompileInFile;

export async function FastCompile(path: string, arrayType: string[]) {
    await FastCompileInFile(path, arrayType);
    ClearWarning();
}

export async function compileAll(Export: ExportSettings) {
    let state = !argv.includes('rebuild') && await CompileState.checkLoad()

    if (state) return () => RequireScripts(state.scripts)
    pageDeps.clear();
    
    state = new CompileState()

    const activateArray = [await CreateCompile(SearchFileSystem.getTypes.Static[2], state), await CreateCompile(SearchFileSystem.getTypes.Logs[2], state), ClearWarning];

    return async () => {
        for (const i of activateArray) {
            await i();
        }
        await createSiteMap(Export, state);
        state.export()
    }
}