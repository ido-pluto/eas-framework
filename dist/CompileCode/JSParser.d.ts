import StringTracker, { StringTrackerDataInfo } from '../EasyDebug/StringTracker';
interface JSParserValues {
    type: 'text' | 'script' | 'none-track-script';
    text: StringTracker;
}
export default class JSParser {
    start: string;
    text: StringTracker;
    end: string;
    type: string;
    path: string;
    values: JSParserValues[];
    constructor(text: StringTracker, path: string, start?: string, end?: string, type?: string);
    ReplaceValues(find: string, replace: string): void;
    findEndOfDefGlobal(text: StringTracker): any;
    ScriptWithInfo(text: StringTracker): StringTracker;
    findScripts(): void;
    static fixText(text: StringTracker | string): string | StringTracker;
    ReBuildText(): StringTracker;
    BuildAll(isDebug: boolean): StringTracker;
    static printError(message: string): string;
    static RunAndExport(text: StringTracker, path: string, isDebug: boolean): StringTracker;
    private static split2FromEnd;
    static RestoreTrack(text: string, defaultInfo: StringTrackerDataInfo): StringTracker;
}
export declare class EnableGlobalReplace {
    private addText;
    private savedBuildData;
    private buildCode;
    private path;
    private replacer;
    constructor(addText?: string);
    load(code: StringTracker, path: string): Promise<void>;
    private ExtractAndSaveCode;
    private ParseOutsideOfComment;
    StartBuild(): string;
    private RestoreAsCode;
    RestoreCode(code: StringTracker): StringTracker;
}
export {};
