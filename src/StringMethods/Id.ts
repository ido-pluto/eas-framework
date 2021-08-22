export default function createId(text: string, max = 10){
    return Buffer.from(text).toString('base64').substring(0, max).replace(/\+/, '_').replace(/\//, '_');
}