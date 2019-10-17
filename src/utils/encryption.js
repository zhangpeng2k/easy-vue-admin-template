
// const sha256 = require("js-sha256").sha256;
import {sha256} from 'js-sha256'
import md5 from 'js-md5'



export function stringToSha256(str) {
    return sha256(str).toString();
}
export function stringToMD5(str) {
    return md5(str).toString();
}




