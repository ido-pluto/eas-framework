import server, {Settings}  from './MainBuild/Server';
import asyncRequire from './ImportFiles/Script';
import {getTypes} from './RunTimeBuild/SearchFileSystem';
import SearchRecord from './BuildInFunc/SearchRecord';
export type {Request, Response} from './MainBuild/Types';

export const AsyncImport = (path:string, importFrom = 'async import') => asyncRequire(importFrom, path, getTypes.Static, Settings.development);
export {Settings, SearchRecord};
export default server;
