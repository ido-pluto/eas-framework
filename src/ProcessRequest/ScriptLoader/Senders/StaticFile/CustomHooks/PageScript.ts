import path from "node:path";
import { directories } from "../../../../../Settings/ProjectConsts.js";
import RequestWarper from "../../../../ProcessURL/RequestWarper.js";
import { sendStaticFile } from "./utils.js";

const pageInfoTypes = [{
    ext: '.pub.js',
    type: 'js'
},
{
    ext: '.pub.mjs',
    type: 'js'
},
{
    ext: '.pub.css',
    type: 'css'
}];

export default async function serverBuildByType(warper: RequestWarper) {
    const havePageExt = pageInfoTypes.find(x => warper.path.nested.endsWith(x.ext));
    if (!havePageExt) {
        return;
    }

    const fullCompilePath = path.join(directories.Locate.Static.compile, warper.path.nested);
    return sendStaticFile(fullCompilePath, havePageExt.type, warper)
}