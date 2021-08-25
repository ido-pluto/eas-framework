import path from 'path';
import EasyFs from '../OutputInput/EasyFs.js';
import { BasicSettings, getTypes, CheckDependencyChange } from './SearchFileSystem.js';
import { FastCompile } from './SearchPages.js';
import { print } from '../OutputInput/Console.js';
import { ImportFile, AddExtension } from '../ImportFiles/Script.js';
import { handelConnectorService } from '../BuildInComponents/index.js';
//@ts-ignore-next-line
import ImportWithoutCache from '../ImportFiles/ImportWithoutCache.cjs';
import { CutTheLast, SplitFirst } from '../StringMethods/Splitting.js';
const Export = {
    PageLoadRam: {},
    PageRam: true
};
const CacheRequireFiles = {};
async function makeDependencies(dependencies) {
    const dependenciesMap = {};
    for (const filePath of dependencies)
        dependenciesMap[filePath] = await EasyFs.stat(filePath, 'mtimeMs', true);
    return dependenciesMap;
}
function compareDependenciesSame(oldDeps, newDeps) {
    for (const name in oldDeps)
        if (newDeps[name] != oldDeps[name])
            return false;
    return true;
}
function countTillLastChange(oldDeps, newDeps) {
    let counter = 0, change = 0;
    for (const name in oldDeps) {
        counter++;
        if (newDeps[name] != oldDeps[name])
            change = counter;
    }
    return change > 1 ? change : 0; // if there is one, that mean only the file changed without any dependencies
}
async function RequireFile(filePath, pathname, typeArray, LastRequire, isDebug) {
    const ReqFile = LastRequire[filePath];
    let fileExists, newDeps;
    if (ReqFile) {
        if (!isDebug || isDebug && (ReqFile.status == -1))
            return ReqFile.model;
        fileExists = await EasyFs.stat(typeArray[0] + ReqFile.path, 'mtimeMs', true, 0);
        if (fileExists) {
            newDeps = await makeDependencies(Object.keys(ReqFile.dependencies));
            if (compareDependenciesSame(ReqFile.dependencies, newDeps))
                return ReqFile.model;
        }
        else if (ReqFile.status == 0)
            return ReqFile.model;
    }
    const copyPath = filePath;
    let static_modules = false;
    if (!ReqFile) {
        if (filePath[0] == '.') {
            if (filePath[1] == '/')
                filePath = filePath.substring(2);
            filePath = pathname && (pathname + '/' + filePath) || filePath;
        }
        else if (filePath[0] != '/')
            static_modules = true;
        else
            filePath = filePath.substring(1);
    }
    else {
        filePath = ReqFile.path;
        static_modules = ReqFile.static;
    }
    if (static_modules)
        LastRequire[copyPath] = { model: await import(filePath), status: -1, static: true, path: filePath };
    else {
        // add serv.js or serv.ts if needed
        filePath = AddExtension(filePath);
        const fullPath = typeArray[0] + filePath;
        fileExists = fileExists ?? await EasyFs.stat(fullPath, 'mtimeMs', true, 0);
        if (fileExists) {
            const haveModel = CacheRequireFiles[filePath];
            if (haveModel && compareDependenciesSame(haveModel.dependencies, newDeps ?? await makeDependencies(Object.keys(haveModel.dependencies))))
                LastRequire[copyPath] = haveModel;
            else {
                newDeps = newDeps ?? {};
                LastRequire[copyPath] = { model: await ImportFile(filePath, typeArray, isDebug, newDeps, haveModel && countTillLastChange(haveModel.dependencies, newDeps)), dependencies: newDeps, path: filePath };
            }
        }
        else
            LastRequire[copyPath] = { model: {}, status: 0, path: filePath };
    }
    const builtModel = LastRequire[copyPath];
    CacheRequireFiles[builtModel.path] = builtModel;
    return builtModel.model;
}
async function RequirePage(filePath, pathname, typeArray, LastRequire, DataObject) {
    const ReqFilePath = LastRequire[filePath];
    const resModel = () => ReqFilePath.model(DataObject);
    let fileExists;
    if (ReqFilePath) {
        if (!DataObject.isDebug)
            return resModel();
        if (ReqFilePath.date == -1) {
            fileExists = await EasyFs.existsFile(ReqFilePath.path);
            if (!fileExists)
                return resModel();
        }
    }
    const copyPath = filePath;
    let extname = path.extname(filePath).substring(1);
    if (!extname) {
        extname = BasicSettings.pageTypes.page;
        filePath += '.' + extname;
    }
    if (filePath[0] == '.') {
        if (filePath[1] == '/')
            filePath = filePath.substring(2);
        else
            filePath = filePath.substring(1);
        filePath = pathname && (pathname + '/' + filePath) || filePath;
    }
    const fullPath = typeArray[0] + filePath;
    if (![BasicSettings.pageTypes.page, BasicSettings.pageTypes.component].includes(extname)) {
        const importText = await EasyFs.readFile(fullPath);
        DataObject.write(importText);
        return importText;
    }
    fileExists = fileExists ?? await EasyFs.existsFile(fullPath);
    if (!fileExists) {
        LastRequire[copyPath] = { model: () => { }, date: -1, path: fullPath };
        return LastRequire[copyPath].model;
    }
    const ForSavePath = typeArray[2] + '/' + filePath.substring(0, filePath.length - extname.length - 1);
    const reBuild = DataObject.isDebug && (!await EasyFs.existsFile(typeArray[1] + filePath + '.cjs') || await CheckDependencyChange(ForSavePath));
    if (reBuild)
        await FastCompile(filePath, typeArray);
    if (Export.PageLoadRam[ForSavePath] && !reBuild) {
        LastRequire[copyPath] = { model: Export.PageLoadRam[ForSavePath][0] };
        return await LastRequire[copyPath].model(DataObject);
    }
    const func = await LoadPage(ForSavePath, extname);
    if (Export.PageRam) {
        if (!Export.PageLoadRam[ForSavePath]) {
            Export.PageLoadRam[ForSavePath] = [];
        }
        Export.PageLoadRam[ForSavePath][0] = func;
    }
    LastRequire[copyPath] = { model: func };
    return await func(DataObject);
}
const GlobalVar = {};
function getFullPath(url) {
    return path.resolve() + '/' + BasicSettings.WebSiteFolder + CutTheLast('/', '/' + url);
}
function getFullPathCompile(url) {
    const SplitInfo = SplitFirst('/', url);
    const typeArray = getTypes[SplitInfo[0]];
    return typeArray[1] + SplitInfo[1] + "." + BasicSettings.pageTypes.page + '.cjs';
}
async function LoadPage(url, ext = BasicSettings.pageTypes.page) {
    const SplitInfo = SplitFirst('/', url);
    const __dirname = getFullPath(url);
    const Debug__filename = url + "." + ext;
    const __filename = __dirname + '/' + url.split('/').pop() + "." + ext;
    const pathname = CutTheLast('/', '/' + SplitInfo[1]);
    const typeArray = getTypes[SplitInfo[0]];
    const LastRequire = {};
    function _require(DataObject, p) {
        return RequireFile(p, pathname, typeArray, LastRequire, DataObject.isDebug);
    }
    function _include(DataObject, p, WithObject = {}) {
        return RequirePage(p, pathname, typeArray, LastRequire, { ...WithObject, ...DataObject });
    }
    const compiledPath = path.join(typeArray[1], SplitInfo[1] + "." + ext + '.cjs');
    const private_var = {};
    try {
        const MyModule = await ImportWithoutCache(compiledPath);
        return MyModule(__dirname, __filename, _require, _include, private_var, handelConnectorService);
    }
    catch (e) {
        print.log("Error path -> ", Debug__filename, "->", e.message);
        return (DataObject) => DataObject.out_run_script.text += `<div style="color:red;text-align:left;font-size:16px;"><p>Error path: ${Debug__filename}</p><p>Error message: ${e.message}</p></div>`;
    }
}
function BuildPage(LoadPageFunc, run_script_name) {
    const RequireVar = {};
    return (async function (Response, Request, Post, Query, Cookies, Session, Files, isDebug) {
        const out_run_script = { text: '' };
        function ToStringInfo(str) {
            if (typeof str == 'object') {
                return JSON.stringify(str);
            }
            else {
                return String(str);
            }
        }
        function setResponse(text) {
            out_run_script.text = ToStringInfo(text);
        }
        function write(text = '') {
            out_run_script.text += ToStringInfo(text);
        }
        ;
        function safeWrite(str = '') {
            str = ToStringInfo(str);
            for (const i of str) {
                out_run_script.text += '&#' + i.charCodeAt(0) + ';';
            }
        }
        let redirectPath = false;
        Response.redirect = (path, status) => {
            redirectPath = String(path);
            if (status != null) {
                Response.status(status);
            }
            return Response;
        };
        Response.reload = () => {
            Response.redirect(Request.url);
        };
        function sendFile(filePath, deleteAfter = false) {
            redirectPath = { file: filePath, deleteAfter };
        }
        const DataSend = {
            sendFile,
            safeWrite,
            write,
            setResponse,
            out_run_script,
            run_script_name,
            Response,
            Request,
            Post,
            Query,
            Session,
            Files,
            Cookies,
            isDebug,
            RequireVar,
            codebase: ''
        };
        await LoadPageFunc(DataSend);
        return { out_run_script: out_run_script.text, redirectPath };
    });
}
export { LoadPage, BuildPage, getFullPathCompile, Export, SplitFirst };
