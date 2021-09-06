import { getTypes } from '../RunTimeBuild/SearchFileSystem.js';
import { ImportFile, RequireOnce } from '../ImportFiles/Script.js';
import EasyFs from '../OutputInput/EasyFs.js';
export async function StartRequire(array, isDebug) {
    const arrayFuncServer = [];
    for (const i of array) {
        const b = await ImportFile(i, getTypes.Static, isDebug);
        if (typeof b.StartServer == 'function') {
            arrayFuncServer.push(b.StartServer);
        }
    }
    return arrayFuncServer;
}
export async function SettingsExsit(filePath) {
    return await EasyFs.existsFile(filePath + '.ts') || await EasyFs.existsFile(filePath + '.js');
}
export async function GetSettings(filePath, isDebug) {
    if (await EasyFs.existsFile(filePath + '.ts')) {
        filePath += '.ts';
    }
    else {
        filePath += '.js';
    }
    const data = await RequireOnce(filePath, isDebug);
    return data.default;
}
