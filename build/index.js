import {exec} from 'child_process';
import path from 'path';
import fsExtra from 'fs-extra';
const {copy, remove, mkdir} = fsExtra;

const __dirname = path.resolve(), dist =  __dirname + '/dist/';

console.log('building...');

// deleting the content in dist directory
await remove(dist);
await mkdir(dist);

const actionType = process.argv[2];

//building the project
const stream = exec('npm run build:ts' + (actionType ? ':' + actionType: ''));

stream.stdout.pipe(process.stdout);

stream.stderr.pipe(process.stdout);

await new Promise(r => stream.on('exit',r));

await import('./copyWasm.js');
await import('./copyFiles.js');
await import('./addExt.js');
await import('./minifyClient.js');

//coping the 'SystemData' directory
await copy(__dirname + '/src/SystemData', dist + 'SystemData');

console.log('Done!');
