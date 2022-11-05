import path from "node:path";
import RequestWrapper from "../../../../ProcessURL/RequestWrapper.js";
import {sendStaticFile} from "./utils.js";
import {frameworkFiles} from '../../../../../Settings/ProjectConsts.js';

interface buildIn {
    path?: string;
    ext?: string;
    type: string;
    inServer?: string;
    content?: string;
}

const staticFilesDirectory = () => path.join(frameworkFiles, 'StaticFiles', 'client');

const staticInfo: buildIn[] = [{
    path: "serv/temp.js",
    type: "js",
    inServer: "buildTemplate.js"
},
    {
        path: "serv/connect.js",
        type: "js",
        inServer: "makeConnection.js"
    },
    {
        path: "serv/md.js",
        type: "js",
        inServer: "markdownCopy.js"
    }];

export default function staticFiles(wrapper: RequestWrapper) {
    const haveStringFile = staticInfo.find(x => x.path == wrapper.path.nested);
    if (!haveStringFile) {
        return false;
    }

    const fullFilePath = path.join(staticFilesDirectory(), haveStringFile.inServer);
    return sendStaticFile(fullFilePath, haveStringFile.type, wrapper);
}