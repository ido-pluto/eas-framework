import EasyFs from '../OutputInput/EasyFs';
import { BasicSettings } from '../RunTimeBuild/SearchFileSystem';
import { NoTrackStringCode, CreateFilePath, PathTypes, AddDebugInfo } from './XMLHelpers/CodeInfoAndDebug';
import { AllBuildIn, IsInclude, StartCompiling } from '../BuildInComponents/index';
import StringTracker, { StringTrackerDataInfo, ArrayMatch } from '../EasyDebug/StringTracker';
import AddPlugin from '../Plugins/Index';
import { tagDataObjectArray, StringNumberMap, tagDataObjectAsText, CompileInFileFunc, BuildScriptWithoutModule, StringArrayOrObject, StringAnyMap } from './XMLHelpers/CompileTypes';
import { PrintIfNew } from '../OutputInput/PrintNew';
import { InsertComponentBase, BaseReader } from './BaseReader/Reader';
import pathNode from 'path';
import ParseBasePage from './CompileScript/PageBase';
import { SessionBuild } from './Session';

interface DefaultValues {
    value: StringTracker,
    elements: string[]
}

export default class InsertComponent extends InsertComponentBase {
    public dirFolder: string;
    public PluginBuild: AddPlugin;
    public CompileInFile: CompileInFileFunc;
    public MicroPlugins: StringArrayOrObject;
    public GetPlugin: (name: string) => any;
    public SomePlugins: (...names: string[]) => boolean;
    public isTs: () => boolean;

    private regexSearch: RegExp;

    constructor(PluginBuild: AddPlugin) {
        super(PrintIfNew);
        this.dirFolder = 'Components';
        this.PluginBuild = PluginBuild;
        this.regexSearch = new RegExp(`<([\\p{Lu}_\\-:0-9]|${AllBuildIn.join('|')})`, 'u')
    }

    FindSpecialTagByStart(string: string) {
        for (const i of this.SkipSpecialTag) {
            if (string.substring(0, i[0].length) == i[0]) {
                return i;
            }
        }
    }

    /**
     * It takes a string of HTML and returns an array of objects that contain the name of the attribute,
     * the value of the attribute, and the character that comes after the attribute
     * @param {StringTracker} text - The text to parse.
     * @returns The return value is an object with two properties:
     */
    tagData(text: StringTracker): { data: tagDataObjectArray, mapAttributes: StringAnyMap } {
        const tokenArray = [], a: tagDataObjectArray = [], mapAttributes: StringAnyMap = {};

        text = text.trim().replacer(/(<%)([\w\W]+?)(%>)/, data => {
            tokenArray.push(data[2]);
            return data[1].Plus(data[3]);
        });

        const unToken = (text: StringTracker) => text.replacer(/(<%)(%>)/, (data) => data[1].Plus(tokenArray.shift()).Plus(data[2]))

        let fastText = text.eq;
        const SkipTypes = ['"', "'", '`'], BlockTypes = [
            ['{', '}'],
            ['(', ')']
        ];

        while (fastText.length) {
            let i = 0;
            for (; i < fastText.length; i++) {
                const char = fastText.charAt(i);
                if (char == '=') {
                    let nextChar = text.at(i + 1);
                    const nextCharEq = nextChar.eq, attrName = text.substring(0, i);

                    let value: StringTracker, endIndex: number, blockEnd: string;
                    if (SkipTypes.includes(nextCharEq)) {
                        endIndex = BaseReader.findEntOfQ(fastText.substring(i + 2), nextCharEq) + 1;
                        value = text.substr(i + 2, endIndex - 2);

                    } else if ((blockEnd = BlockTypes.find(x => x[0] == nextCharEq)?.[1]) != null) {
                        endIndex = BaseReader.findEndOfDef(fastText.substring(i + 2), [nextCharEq, blockEnd]) + 1;
                        value = text.substr(i + 1, endIndex + 1);

                    } else {
                        endIndex = fastText.substring(i + 1).search(/ |\n/);
                        if (endIndex == -1)
                            endIndex = fastText.length;
                        value = text.substr(i + 1, endIndex);
                        nextChar = new StringTracker();
                    }

                    const n = unToken(attrName), v = unToken(value);
                    mapAttributes[n.eq] = v.eq;
                    a.push({
                        n,
                        v,
                        char: nextChar
                    });
                    i += 1 + endIndex;
                    break;

                } else if (char == ' ' || i == fastText.length - 1 && ++i) {
                    const n = unToken(text.substring(0, i));
                    a.push({
                        n: n
                    });
                    mapAttributes[n.eq] = true;
                    break;
                }

            }

            fastText = fastText.substring(i).trim();
            text = text.substring(i).trim();
        }

        //methods to the array
        const index = (name: string) => a.findIndex(x => x.n.eq == name);
        const getValue = (name: string) => a.find(tag => tag.n.eq == name)?.v?.eq ?? '';
        const remove = (name: string) => {
            const nameIndex = index(name);
            if (nameIndex == -1)
                return '';
            return a.splice(nameIndex, 1).pop().v?.eq ?? '';
        };

        a.have = (name: string) => index(name) != -1;
        a.getValue = getValue;
        a.remove = remove;
        a.addClass = c => {
            const i = index('class');
            if (i == -1) {
                a.push({ n: new StringTracker(null, 'class'), v: new StringTracker(null, c), char: new StringTracker(null, '"') });
                return;
            }
            const item = a[i];
            if (item.v.length)
                c = ' ' + c;
            item.v.AddTextAfter(c);
        }
        return { data: a, mapAttributes };
    }

    findIndexSearchTag(query: string, tag: StringTracker) {
        const all = query.split('.');
        let counter = 0
        for (const i of all) {
            const index = tag.indexOf(i)
            if (index == -1) {
                PrintIfNew({
                    text: `Waring, can't find all query in tag -> ${tag.eq}\n${tag.lineInfo}`,
                    errorName: "query-not-found"
                });
                break
            }
            counter += index + i.length
            tag = tag.substring(index + i.length)
        }

        return counter + tag.search(/\ |\>/)
    }

    ReBuildTagData(stringInfo: StringTrackerDataInfo, dataTagSplitter: tagDataObjectArray) {
        let newAttributes = new StringTracker(stringInfo);

        for (const i of dataTagSplitter) {
            if (i.v) {
                newAttributes.Plus$`${i.n}=${i.char}${i.v}${i.char} `;
            } else {
                newAttributes.Plus(i.n, ' ');
            }
        }

        if (dataTagSplitter.length) {
            newAttributes = new StringTracker(stringInfo, ' ').Plus(newAttributes.substring(0, newAttributes.length - 1));
        }

        return newAttributes;
    }

    CheckMinHTML(code: StringTracker) {
        if (this.SomePlugins("MinHTML", "MinAll")) {
            code = code.SpaceOne(' ');
        }
        return code;
    }

    async ReBuildTag(type: StringTracker, dataTag: StringTracker, dataTagSpliced: tagDataObjectArray, BetweenTagData: StringTracker, SendDataFunc: (text: StringTracker) => Promise<StringTracker>) {
        if (BetweenTagData && this.SomePlugins("MinHTML", "MinAll")) {
            BetweenTagData = BetweenTagData.SpaceOne(' ');

            dataTag = this.ReBuildTagData(type.DefaultInfoText, dataTagSpliced);
        } else if (dataTag.eq.length) {
            dataTag = new StringTracker(type.DefaultInfoText, ' ').Plus(dataTag);
        }

        const tagData = new StringTracker(type.DefaultInfoText).Plus(
            '<', type, dataTag
        )

        if (BetweenTagData) {
            tagData.Plus$`>${await SendDataFunc(BetweenTagData)}</${type}>`;
        } else {
            tagData.Plus('/>');
        }

        return tagData;
    }

    exportDefaultValues(fileData: StringTracker, foundSetters: DefaultValues[] = []) {
        const indexBasic: ArrayMatch = fileData.match(/@default[ ]*\(([A-Za-z0-9{}()\[\]_\-$"'`%*&|\/\@ \n]*)\)[ ]*\[([A-Za-z0-9_\-,$ \n]+)\]/);

        if (indexBasic == null)
            return { fileData, foundSetters };

        const WithoutBasic = fileData.substring(0, indexBasic.index).Plus(fileData.substring(indexBasic.index + indexBasic[0].length));

        const arrayValues = indexBasic[2].eq.split(',').map(x => x.trim());

        foundSetters.push({
            value: indexBasic[1],
            elements: arrayValues
        });

        return this.exportDefaultValues(WithoutBasic, foundSetters);
    }

    addDefaultValues(arrayValues: DefaultValues[], fileData: StringTracker) {
        for (const i of arrayValues) {
            for (const be of i.elements) {
                fileData = fileData.replaceAll('#' + be, i.value);
            }
        }

        return fileData;
    }

    parseComponentProps(tagData: tagDataObjectArray, component: StringTracker) {

        // eslint-disable-next-line
        let { fileData, foundSetters } = this.exportDefaultValues(component);

        for (const i of tagData) {
            if (i.n.eq == '&') {
                let re = i.n.substring(1);

                let FoundIndex: number;

                if (re.includes('&')) {
                    const index = re.indexOf('&');
                    FoundIndex = this.findIndexSearchTag(re.substring(0, index).eq, fileData);
                    re = re.substring(index + 1);
                } else {
                    FoundIndex = fileData.search(/\ |\>/)
                }

                const fileDataNext = new StringTracker(fileData.DefaultInfoText);

                const startData = fileData.substring(0, FoundIndex);
                fileDataNext.Plus(
                    startData,
                    new StringTracker(fileData.DefaultInfoText).Plus$` ${re}="${i.v ?? ''}"`,
                    (startData.endsWith(' ') ? '' : ' '),
                    fileData.substring(FoundIndex)
                );

                fileData = fileDataNext;
            } else {
                const re = new RegExp("\\~" + i.n.eq, "gi");
                fileData = fileData.replace(re, i.v ?? i.n);
            }
        }

        return this.addDefaultValues(foundSetters, fileData);
    }

    async buildTagBasic(fileData: StringTracker, tagData: tagDataObjectArray, path: string, pathName: string, FullPath: string, SmallPath: string, buildScript: BuildScriptWithoutModule, sessionInfo: SessionBuild, BetweenTagData?: StringTracker) {
        fileData = await this.PluginBuild.BuildComponent(fileData, path, pathName, sessionInfo);

        fileData = this.parseComponentProps(tagData, fileData);

        fileData = fileData.replace(/<\:reader( )*\/>/gi, BetweenTagData ?? '');

        pathName = pathName + ' -> ' + SmallPath;

        fileData = await this.StartReplace(fileData, pathName, FullPath, SmallPath, buildScript, sessionInfo);

        fileData = await NoTrackStringCode(fileData, `${pathName} ->\n${SmallPath}`, sessionInfo.debug, buildScript);

        return fileData;
    }

    async insertTagData(path: string, pathName: string, LastSmallPath: string, type: StringTracker, dataTag: StringTracker, { BetweenTagData, buildScript, sessionInfo }: { sessionInfo: SessionBuild, BetweenTagData?: StringTracker, buildScript: BuildScriptWithoutModule}) {
        const { data, mapAttributes } = this.tagData(dataTag), BuildIn = IsInclude(type.eq);

        let fileData: StringTracker, SearchInComment = true, AllPathTypes: PathTypes = {}, addStringInfo: string;

        if (BuildIn) {//check if it build in component
            const { compiledString, checkComponents } = await StartCompiling(path, pathName, LastSmallPath, type, data, BetweenTagData ?? new StringTracker(), this, buildScript, sessionInfo);
            fileData = compiledString;
            SearchInComment = checkComponents;
        } else {
            let folder: boolean | string = data.have('folder');

            if (folder)
                folder = data.remove('folder') || '.';

            const tagPath = (folder ? folder + '/' : '') + type.replace(/:/gi, "/").eq;

            const relativesFilePathSmall = type.extractInfo('<line>'), relativesFilePath = pathNode.join(BasicSettings.fullWebSitePath, relativesFilePathSmall);
            AllPathTypes = CreateFilePath(relativesFilePath, relativesFilePathSmall, tagPath, this.dirFolder, BasicSettings.pageTypes.component);

            if (sessionInfo.cacheComponent[AllPathTypes.SmallPath] === null || sessionInfo.cacheComponent[AllPathTypes.SmallPath] === undefined && !await EasyFs.existsFile(AllPathTypes.FullPath)) {
                sessionInfo.cacheComponent[AllPathTypes.SmallPath] = null;

                if (folder) {
                    PrintIfNew({
                        text: `Component ${type.eq} not found! -> ${pathName}\n-> ${type.lineInfo}\n${AllPathTypes.SmallPath}`,
                        errorName: "component-not-found",
                        type: 'error'
                    });
                }

                return this.ReBuildTag(type, dataTag, data, BetweenTagData, BetweenTagData => this.StartReplace(BetweenTagData, pathName, path, LastSmallPath, buildScript, sessionInfo));
            }

            if (!sessionInfo.cacheComponent[AllPathTypes.SmallPath]?.mtimeMs)
                sessionInfo.cacheComponent[AllPathTypes.SmallPath] = { mtimeMs: await EasyFs.stat(AllPathTypes.FullPath, 'mtimeMs') }; // add to dependenceObject

            sessionInfo.dependencies[AllPathTypes.SmallPath] = sessionInfo.cacheComponent[AllPathTypes.SmallPath].mtimeMs

            const { allData, stringInfo } = await AddDebugInfo(pathName, AllPathTypes.FullPath, AllPathTypes.SmallPath, sessionInfo.cacheComponent[AllPathTypes.SmallPath]);
            const baseData = new ParseBasePage(allData, this.isTs());
            await baseData.loadSettings(sessionInfo, AllPathTypes.FullPath, AllPathTypes.SmallPath, pathName + ' -> ' + AllPathTypes.SmallPath, mapAttributes);

            fileData = baseData.scriptFile.Plus(baseData.clearData);
            addStringInfo = stringInfo;
        }

        if (SearchInComment && (fileData.length > 0 || BetweenTagData)) {
            const { SmallPath, FullPath } = AllPathTypes;

            fileData = await this.buildTagBasic(fileData, data, path, pathName, BuildIn ? type.eq : FullPath, BuildIn ? type.eq : SmallPath, buildScript, sessionInfo, BetweenTagData);

            if (addStringInfo)
                fileData.AddTextBeforeNoTrack(addStringInfo);
        }

        return fileData;
    }

    private CheckDoubleSpace(...data: StringTracker[]) {
        const mini = this.SomePlugins("MinHTML", "MinAll");
        let startData = data.shift();

        if (mini) {
            startData = startData.SpaceOne(' ');
        }

        for (let i of data) {
            if (mini && startData.endsWith(' ') && i.startsWith(' ')) {
                i = i.trimStart();
            }

            if (typeof startData == 'string') {
                1 == 1;
            }
            startData.Plus(i);
        }

        if (mini) {
            startData = startData.SpaceOne(' ');
        }

        return startData;
    }

    async StartReplace(data: StringTracker, pathName: string, path: string, smallPath: string, buildScript: BuildScriptWithoutModule, sessionInfo: SessionBuild): Promise<StringTracker> {
        let find: number;

        const promiseBuild: (StringTracker | Promise<StringTracker>)[] = [];

        while ((find = data.search(this.regexSearch)) != -1) {

            //heck if there is special tag - need to skip it
            const locSkip = data.eq;
            const specialSkip = this.FindSpecialTagByStart(locSkip.trim());

            if (specialSkip) {
                const start = locSkip.indexOf(specialSkip[0]) + specialSkip[0].length;
                const end = locSkip.substring(start).indexOf(specialSkip[1]) + start + specialSkip[1].length;
                promiseBuild.push(data.substring(0, end));
                data = data.substring(end);
                continue;
            }

            //finding the tag
            const cutStartData = data.substring(0, find); //<

            const startFrom = data.substring(find);

            //tag type 
            const tagTypeEnd = startFrom.search('\ |/|\>|(<%)');

            const tagType = startFrom.substring(1, tagTypeEnd);

            const findEndOfSmallTag = await this.FindCloseChar(startFrom.substring(1), '>') + 1;

            let inTag = startFrom.substring(tagTypeEnd + 1, findEndOfSmallTag);

            const NextTextTag = startFrom.substring(findEndOfSmallTag + 1);

            if (inTag.at(inTag.length - 1).eq == '/') {
                inTag = inTag.substring(0, inTag.length - 1);
            }

            if (startFrom.at(findEndOfSmallTag - 1).eq == '/') {//small tag
                promiseBuild.push(
                    this.CheckMinHTML(cutStartData),
                    this.insertTagData(path, pathName, smallPath, tagType, inTag, {  buildScript, sessionInfo })
                );

                data = NextTextTag;
                continue;
            }

            //big tag with reader
            let BetweenTagDataCloseIndex;

            if (this.SimpleSkip.includes(tagType.eq)) {
                BetweenTagDataCloseIndex = NextTextTag.indexOf('</' + tagType);
            } else {
                BetweenTagDataCloseIndex = await this.FindCloseCharHTML(NextTextTag, tagType.eq);
                if (BetweenTagDataCloseIndex == -1) {
                    PrintIfNew({
                        text: `\nWarning, you didn't write right this tag: "${tagType}", used in: ${tagType.at(0).lineInfo}\n(the system will auto close it)`,
                        errorName: "close-tag"
                    });
                    BetweenTagDataCloseIndex = null;
                }
            }

            const BetweenTagData = BetweenTagDataCloseIndex != null && NextTextTag.substring(0, BetweenTagDataCloseIndex);

            //finding last close 
            const NextDataClose = NextTextTag.substring(BetweenTagDataCloseIndex);
            const NextDataAfterClose = BetweenTagDataCloseIndex != null ? NextDataClose.substring(BaseReader.findEndOfDef(NextDataClose.eq, '>') + 1) : NextDataClose; // search for the close of a big tag just if the tag is valid

            promiseBuild.push(
                this.CheckMinHTML(cutStartData),
                this.insertTagData(path, pathName, smallPath, tagType, inTag, { BetweenTagData, buildScript, sessionInfo })
            );

            data = NextDataAfterClose;
        }


        let textBuild = new StringTracker(data.DefaultInfoText);

        for (const i of promiseBuild) {
            textBuild = this.CheckDoubleSpace(textBuild, await i);
        }

        return this.CheckMinHTML(this.CheckDoubleSpace(textBuild, data));

    }

    private RemoveUnnecessarySpace(code: StringTracker) {
        code = code.trim();
        code = code.replaceAll(/%>[ ]+<%(?![=:])/, '%><%');
        return code;
    }

    async Insert(data: StringTracker, pathName: string, buildScript: BuildScriptWithoutModule, sessionInfo: SessionBuild) {

        //removing html comment tags
        data = data.replace(/<!--[\w\W]+?-->/, '');

        data = await this.StartReplace(data, pathName, sessionInfo.fullPath, sessionInfo.smallPath, buildScript, sessionInfo);

        //if there is a reader, replacing him with 'codebase'
        data = data.replace(/<\:reader+( )*\/>/gi, '<%typeof page.codebase == "function" ? page.codebase(): write(page.codebase)%>') // replace for importing pages / components
        return this.RemoveUnnecessarySpace(data);
    }
}