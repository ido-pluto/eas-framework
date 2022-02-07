import StringTracker, { StringTrackerDataInfo } from '../EasyDebug/StringTracker';
import AddPlugin from '../Plugins/Index';
import { tagDataObjectArray, StringNumberMap, CompileInFileFunc, BuildScriptWithoutModule, StringArrayOrObject, SessionInfo } from './XMLHelpers/CompileTypes';
import { InsertComponentBase } from './BaseReader/Reader';
interface DefaultValues {
    value: StringTracker;
    elements: string[];
}
export default class InsertComponent extends InsertComponentBase {
    dirFolder: string;
    PluginBuild: AddPlugin;
    CompileInFile: CompileInFileFunc;
    RemoveEndType: (text: string) => string;
    MicroPlugins: StringArrayOrObject;
    GetPlugin: (name: string) => any;
    SomePlugins: (...names: string[]) => boolean;
    isTs: () => boolean;
    constructor(PluginBuild: AddPlugin);
    FindSpecialTagByStart(string: string): string[];
    tagData(text: StringTracker, a?: tagDataObjectArray): tagDataObjectArray;
    findIndexSearchTag(query: string, tag: StringTracker): number;
    ReBuildTagData(stringInfo: StringTrackerDataInfo, dataTagSplitter: tagDataObjectArray): StringTracker;
    CheckMinHTML(code: StringTracker): StringTracker;
    ReBuildTag(type: StringTracker, dataTag: StringTracker, dataTagSpliced: tagDataObjectArray, BetweenTagData: StringTracker, SendDataFunc: (text: StringTracker) => Promise<StringTracker>): Promise<StringTracker>;
    exportDefaultValues(fileData: StringTracker, foundSetters?: DefaultValues[]): any;
    addDefaultValues(arrayValues: DefaultValues[], fileData: StringTracker): StringTracker;
    parseComponentProps(tagData: tagDataObjectArray, component: StringTracker): StringTracker;
    buildTagBasic(fileData: StringTracker, tagData: tagDataObjectArray, path: string, pathName: string, FullPath: string, SmallPath: string, isDebug: boolean, dependenceObject: StringNumberMap, buildScript: BuildScriptWithoutModule, sessionInfo: SessionInfo, BetweenTagData?: StringTracker): Promise<StringTracker>;
    insertTagData(path: string, pathName: string, LastSmallPath: string, type: StringTracker, dataTag: StringTracker, { BetweenTagData, dependenceObject, isDebug, buildScript, sessionInfo }: {
        sessionInfo: SessionInfo;
        BetweenTagData?: StringTracker;
        buildScript: BuildScriptWithoutModule;
        dependenceObject: StringNumberMap;
        isDebug: boolean;
    }): Promise<StringTracker>;
    private CheckDoubleSpace;
    StartReplace(data: StringTracker, pathName: string, path: string, smallPath: string, isDebug: boolean, dependenceObject: StringNumberMap, buildScript: BuildScriptWithoutModule, sessionInfo: SessionInfo): Promise<StringTracker>;
    private RemoveUnnecessarySpace;
    Insert(data: StringTracker, path: string, pathName: string, smallPath: string, isDebug: boolean, dependenceObject: StringNumberMap, buildScript: BuildScriptWithoutModule, sessionInfo: SessionInfo): Promise<StringTracker>;
}
export {};
