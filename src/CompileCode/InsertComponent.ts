import EasyFs from '../OutputInput/EasyFs';
import { BasicSettings } from '../RunTimeBuild/SearchFileSystem';
import { NoTrackStringCode, CreateFilePath, PathTypes, AddDebugInfo } from './XMLHelpers/CodeInfoAndDebug';
import { IsInclude, StartCompiling } from '../BuildInComponents/index';
import StringTracker, { StringTrackerDataInfo, ArrayMatch } from '../EasyDebug/StringTracker';
import AddPlugin from '../Plugins/Index';
import { tagDataObject, StringNumberMap, tagDataObjectAsText, CompileInFileFunc, BuildScriptWithoutModule, StringArrayOrObject, StringAnyMap } from './XMLHelpers/CompileTypes';
import { PrintIfNew } from '../OutputInput/PrintNew';
import {InsertComponentBase} from './BaseReader/Reader';

interface DefaultValues {
    value: StringTracker,
    elements: string[]
}

export default class InsertComponent extends InsertComponentBase {
    public dirFolder: string;
    public PluginBuild: AddPlugin;
    public CompileInFile: CompileInFileFunc;
    public RemoveEndType = (text: string) => text;
    public MicroPlugins: StringArrayOrObject;
    public GetPlugin: (name: string) => any;
    public SomePlugins: (...names: string[]) => boolean;

    constructor(PluginBuild: AddPlugin) {
        super(PrintIfNew);
        this.dirFolder = 'Components/';
        this.PluginBuild = PluginBuild;
    }

    FindSpecialTagByStart(string: string) {
        for (const i of this.SkipSpecialTag) {
            if (string.substring(0, i[0].length) == i[0]) {
                return i;
            }
        }
    }

    tagData(text: StringTracker, a: tagDataObject[] = []): tagDataObject[] {
        this.FindSpecialTagByStart

        const SkipTypes = ['"', "'", '`'];
        text = text.trim();

        while (text.length) {
            const skip = this.FindSpecialTagByStart(text.eq);

            if(skip){
                const endLength = text.substring(skip[0].length).indexOf(skip[1]) + skip[0].length + skip[1].length;
                
                a.push({ 
                    n: text.substring(0, endLength),
                    v: new StringTracker(text.DefaultInfoText)
                });

                text = text.substring(endLength).trim();
                continue;
            }
            
            let i = 0;
            for (; i < text.length; i++) {
                const char = text.at(i).eq;
                if (SkipTypes.includes(char) && text.at(i - 1).eq != '\\') {
                    i += this.findEntOfQ(text.substring(i + 1).eq, char) + 1;
                    break;
                } else if (text.substring(i - 1, i).eq == ' ') {
                    i--;
                    break;
                }
            }

            const Attributes = text.substring(0, i).split('=');
            let char = null;

            if (Attributes[1]) {
                char = Attributes[1].at(0).eq;
                if (SkipTypes.includes(char)) {
                    const endIndex = this.findEntOfQ(Attributes[1].substring(1).eq, char);
                    Attributes[1] = Attributes[1].substring(1, endIndex);
                }
            } else {
                Attributes[1] = new StringTracker(Attributes[0].DefaultInfoText);
            }

            a.push({
                n: Attributes[0],
                v: Attributes[1] ?? new StringTracker(Attributes[0].DefaultInfoText),
                char
            });
            text = text.substring(i).trim();
        }

        return a;
    }

    tagDataAsText(data: tagDataObject): tagDataObjectAsText {
        if (!data) {
            return;
        }
        return {
            n: data.n.eq,
            v: data.v.eq
        }
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

    ReBuildTagData(stringInfo: StringTrackerDataInfo, dataTagSplitter: tagDataObject[]) {
        let newAttributes = new StringTracker(stringInfo);

        for (const i of dataTagSplitter) {
            if (i.char) {
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

    async ReBuildTag(type: StringTracker, dataTag: StringTracker, dataTagSpliced: tagDataObject[], BetweenTagData: StringTracker, SendDataFunc: (text: StringTracker) => Promise<StringTracker>) {
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

    exportDefaultValues(fileData: StringTracker, foundSetters: DefaultValues[] = []){
        const indexBasic: ArrayMatch = fileData.match(/@basic[ ]*\(([A-Za-z0-9{}()\[\]_\-$"'`%*&|\/\@ \n]*)\)[ ]*\[([A-Za-z0-9_\-,$ \n]+)\]/);

        if(indexBasic == null)
            return {fileData, foundSetters};

        const WithoutBasic = fileData.substring(0, indexBasic.index).Plus(fileData.substring(indexBasic.index + indexBasic[0].length));

        const arrayValues = indexBasic[2].eq.split(',').map(x => x.trim());

        foundSetters.push({
            value: indexBasic[1],
            elements: arrayValues
        });

        return this.exportDefaultValues(WithoutBasic, foundSetters);
    }

    addDefaultValues(arrayValues: DefaultValues[], fileData: StringTracker){
        for(const i of arrayValues){
            for(const be of i.elements){
                fileData = fileData.replaceAll('#' + be, i.value);
            }
        }

        return fileData;
    }

    parseComponentProps(tagData: tagDataObject[], component: StringTracker){

        // eslint-disable-next-line
        let {fileData, foundSetters} = this.exportDefaultValues(component);

        for (const i of tagData) {
            if (i.n.startsWith('&')) {
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
                    new StringTracker(fileData.DefaultInfoText).Plus$` ${re}="${i.v}"`,
                    (startData.endsWith(' ') ? '' : ' '),
                    fileData.substring(FoundIndex)
                );

                fileData = fileDataNext;
            } else {
                const re = new RegExp("\\#" + i.n.eq, "gi");
                fileData = fileData.replace(re, i.v);
            }
        }

        return this.addDefaultValues(foundSetters, fileData);
    }

    async buildTagBasic(fileData: StringTracker, tagData: tagDataObject[], path:string, pathName:string, FullPath:string, SmallPath:string, isDebug:boolean, dependenceObject:StringNumberMap, buildScript: BuildScriptWithoutModule, sessionInfo: StringAnyMap, BetweenTagData?: StringTracker){
        fileData = await this.PluginBuild.BuildComponent(fileData, path, pathName, sessionInfo);

        fileData = this.parseComponentProps(tagData, fileData);

        fileData = fileData.replace(/<\?reader( )*\/>/gi, BetweenTagData ?? '');

        pathName = pathName + ' -> ' + SmallPath;

        fileData = await this.StartReplace(fileData, pathName, FullPath, SmallPath, isDebug, dependenceObject, buildScript, sessionInfo);

        fileData = await NoTrackStringCode(fileData, `${pathName} ->\b${FullPath}`, isDebug, buildScript);

        return fileData;
    }

    getFromDataTag(dataTag: tagDataObject[], name: string){
        return dataTag.find(tag => tag.n.eq == name)?.v?.eq;
    }

    async insertTagData(path: string, pathName: string, LastSmallPath: string, type: StringTracker, dataTag: StringTracker, { BetweenTagData, dependenceObject, isDebug, buildScript, sessionInfo}: { sessionInfo: StringAnyMap, BetweenTagData?: StringTracker, buildScript: BuildScriptWithoutModule, dependenceObject: StringNumberMap, isDebug: boolean }) {
        const data = this.tagData(dataTag), BuildIn = IsInclude(type.eq);

        let fileData: StringTracker, SearchInComment = true, AllPathTypes: PathTypes = {}, addStringInfo: string;

        if (BuildIn) {//check if it build in component
            const { compiledString, checkComponents } = await StartCompiling(path, pathName, LastSmallPath, type, data, BetweenTagData ?? new StringTracker(), dependenceObject, isDebug, this, buildScript, sessionInfo);
            fileData = compiledString;
            SearchInComment = checkComponents;
        } else {
            const folder = this.tagDataAsText(data.find(x => x.n.eq == 'folder'));

            if (folder?.v == '') {
                folder.v = '.';
            }

            const tagPath = (folder ? folder.v + '/' : '') + type.replace(/:/gi, "/").eq;

            AllPathTypes = CreateFilePath(path, LastSmallPath, tagPath, this.dirFolder, BasicSettings.pageTypes.component);

            if (!await EasyFs.exists(AllPathTypes.FullPath)) {

                if (folder) {
                    PrintIfNew({
                        text: `Component ${type.eq} not found! -> ${pathName}\n-> ${type.lineInfo}`,
                        errorName: "component-not-found",
                        type: 'error'
                    });
                }

                return this.ReBuildTag(type, dataTag, data, BetweenTagData, BetweenTagData => this.StartReplace(BetweenTagData, pathName, path, LastSmallPath, isDebug, dependenceObject, buildScript, sessionInfo));
            }

            dependenceObject[AllPathTypes.SmallPath] = await EasyFs.stat(AllPathTypes.FullPath, 'mtimeMs'); // add to dependenceObject

            const {allData, stringInfo} = await AddDebugInfo(pathName, AllPathTypes.FullPath);
            fileData = allData;
            addStringInfo = stringInfo;
        }

        if (SearchInComment) {
            const { SmallPath, FullPath } = AllPathTypes;

            fileData = await this.buildTagBasic(fileData, data, path,pathName, BuildIn ? type.eq : FullPath, BuildIn ? type.eq : SmallPath, isDebug, dependenceObject, buildScript, sessionInfo, BetweenTagData);
        
            if(addStringInfo)
                fileData.AddTextBefore(addStringInfo);
        }

        return fileData;
    }

    private CheckDoubleSpace(...data: StringTracker[]){
        const mini = this.SomePlugins("MinHTML", "MinAll");
        let startData = data.shift();

        if(mini){
            startData = startData.SpaceOne(' ');
        }

        for(let i of data){
            if(mini && startData.endsWith(' ') && i.startsWith(' ')){
                i = i.trimStart();
            }

            if(typeof startData == 'string'){
                1 == 1;
            }
            startData.Plus(i);
        }

        if(mini){
            startData = startData.SpaceOne(' ');
        }
        
        return startData;
    }

    async StartReplace(data: StringTracker, pathName: string, path: string, smallPath: string, isDebug: boolean, dependenceObject: StringNumberMap, buildScript: BuildScriptWithoutModule, sessionInfo: StringAnyMap): Promise<StringTracker> {
        let find: number;

        const promiseBuild: (StringTracker | Promise<StringTracker>)[] = [];

        
        while((find = data.search(/<[\p{L}_\-:0-9]/u)) != -1){

            //heck if there is special tag - need to skip it
            const locSkip = data.eq;
            const specialSkip = this.FindSpecialTagByStart(locSkip.trim());

            if(specialSkip){
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
            const tagTypeEnd = startFrom.search("\ |/|\>");
    
            const tagType = startFrom.substring(1, tagTypeEnd);
    
            const findEndOfSmallTag = await this.FindCloseChar(startFrom.substring(1), '>')+1;
    
            let inTag = startFrom.substring(tagTypeEnd + 1, findEndOfSmallTag);
    
            const NextTextTag = startFrom.substring(findEndOfSmallTag + 1);
    
            if (['/', '>'].includes(inTag.at(inTag.length - 1).eq)) {
                inTag = inTag.substring(0, inTag.length - 1);
            }
    
            if (startFrom.at(findEndOfSmallTag - 1).eq == '/') {//small tag
                promiseBuild.push(
                    this.CheckMinHTML(cutStartData),
                    this.insertTagData(path, pathName, smallPath, tagType, inTag, { dependenceObject, buildScript, isDebug, sessionInfo})
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
                        text: `\nWarning, you didn't write right this tag: "${tagType}", used in: ${tagType.lineInfo}\n(the system will auto close it)\n`,
                        errorName: "close-tag"
                    });
                    BetweenTagDataCloseIndex = null;
                }
            }
    
            const BetweenTagData = NextTextTag.substring(0, BetweenTagDataCloseIndex);
    
            //finding last close 
            const NextDataClose = NextTextTag.substring(BetweenTagDataCloseIndex);
            const NextDataAfterClose = BetweenTagDataCloseIndex != null ? NextDataClose.substring(this.findEndOfDef(NextDataClose.eq, '>') + 1) : NextDataClose; // search for the close of a big tag just if the tag is valid
    
            promiseBuild.push(
                this.CheckMinHTML(cutStartData),
                this.insertTagData(path, pathName, smallPath, tagType, inTag, { BetweenTagData, dependenceObject, buildScript, isDebug, sessionInfo })
            );

            data = NextDataAfterClose;
        }


        let textBuild = new StringTracker(data.DefaultInfoText);
        
        for(const i of promiseBuild){
            textBuild = this.CheckDoubleSpace(textBuild, await i);
        }

        return this.CheckMinHTML(this.CheckDoubleSpace(textBuild, data));

    }

    private RemoveUnnecessarySpace(code: StringTracker){
        code = code.trim();
        code = code.replaceAll(/%>[ ]+<%/, '%><%');
        return code;
    }

    async Insert(data: StringTracker, path: string, pathName: string, smallPath: string, isDebug: boolean, dependenceObject: StringNumberMap, buildScript: BuildScriptWithoutModule, sessionInfo: StringAnyMap) {

        //removing html comment tags
        data = data.replace(/<!--[^-->]*-->/, '');

        data = await this.StartReplace(data, pathName, path, smallPath, isDebug, dependenceObject, buildScript, sessionInfo);

        //if there is a reader, replacing him with 'codebase'
        data = data.replace(/<\?reader+( )*\/>/gi, '<%typeof page.codebase == "function" ? page.codebase(): write(page.codebase)%>') // replace for importing pages / components
        return this.RemoveUnnecessarySpace(data);
    }
}