import {chdir} from 'process';
import path from 'path';
import sourceMapSupport from 'source-map-support'; 
sourceMapSupport.install({hookRequire: true});

chdir(path.dirname(new URL(import.meta.url).pathname).substring(1));

const {Server} = await import('../../dist/index.js');

Server();