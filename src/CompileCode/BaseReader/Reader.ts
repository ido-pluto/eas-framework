import StringTracker from '../../EasyDebug/StringTracker';
import { find_end_of_def, find_end_of_q, find_end_block } from './RustBind/index.js';
import * as Settings from './Settings';
import { getDirname } from '../../RunTimeBuild/SearchFileSystem';
import Multithreading from '../Multithreading';
import {cpus} from 'os';

const __dirname = getDirname(import.meta.url);

export class BaseReader {
    /**
     * Find the end of quotation marks, skipping things like escaping: "\\""
     * @return the index of end
     */
    static findEntOfQ(text: string, qType: string) {
        return find_end_of_q(text, qType);
    }

    /**
     * Find char skipping data inside quotation marks
     * @return the index of end
     */
    static findEndOfDef(text: string, EndType: string[] | string) {
        if (!Array.isArray(EndType)) {
            EndType = [EndType];
        }

        return find_end_of_def(text, JSON.stringify(EndType));
    }

    /**
     * Same as 'findEndOfDef' only with option to custom 'open' and 'close'
     * ```js
     * FindEndOfBlock(`cool "}" { data } } next`, '{', '}')
     * ```
     * it will return the 18 -> "} next"
     *  @return the index of end
     */
    static FindEndOfBlock(text: string, open: string, end: string) {
        return find_end_block(text, open + end);
    }
}

const cpuLength = cpus().length;
export class InsertComponentBase {
    private asyncMethod: Multithreading;

    SimpleSkip: string[] = Settings.SimpleSkip;
    SkipSpecialTag: string[][] = Settings.SkipSpecialTag;

    constructor(private printNew?: any) {

        this.asyncMethod = new Multithreading(cpuLength, __dirname + '/RustBind/workerInsertComponent.js');
    }

    private printErrors(text: StringTracker, errors: any[]) {
        if (this.printNew) {
            for (const i of errors) {
                this.printNew({
                    text: `\nWarning, you didn't write right this tag: "${i.type_name}", used in: ${text.at(Number(i.index)).lineInfo}\n(the system will auto close it)\n`,
                    errorName: "close-tag"
                });
            }
        }
    }

    public async FindCloseChar(text: StringTracker, Search: string) {
        const [point, errors] = await this.asyncMethod.getMethod({
            FindCloseChar: [text.eq, Search],
            GetErrors: []
        });

        this.printErrors(text, JSON.parse(errors));

        return point;
    }

    public async FindCloseCharHTML(text: StringTracker, Search: string) {
        const [point, errors] = await this.asyncMethod.getMethod({
            FindCloseCharHTML: [text.eq, Search],
            GetErrors: []
        });

        this.printErrors(text, JSON.parse(errors));

        return point;
    }
}