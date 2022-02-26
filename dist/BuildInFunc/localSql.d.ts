import { Database } from 'sql.js';
export default class LocalSql {
    db: Database;
    savePath: string;
    hadChange: boolean;
    private loaded;
    constructor(savePath?: string, checkIntervalMinutes?: number);
    private notLoaded;
    load(): Promise<void>;
    private updateLocalFile;
    private buildQueryTemplate;
    insert(queryArray: string[], ...valuesArray: any[]): import("sql.js").SqlValue;
    affected(queryArray: string[], ...valuesArray: any[]): number;
    select(queryArray: string[], ...valuesArray: any[]): import("sql.js").QueryExecResult[];
    selectOne(queryArray: string[], ...valuesArray: any[]): import("sql.js").ParamsObject;
}
