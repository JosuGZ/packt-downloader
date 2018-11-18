"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
const SanitizeFileName = require("sanitize-filename");
const downloadDir = './downloads';
class FileUtils {
    static fixName(name) {
        let fixedName = name;
        if (fixedName.endsWith(':')) {
            fixedName = fixedName.substring(0, fixedName.length - 1);
        }
        if (fixedName.startsWith(':')) {
            fixedName = fixedName.substring(1, fixedName.length);
        }
        fixedName = fixedName.replace(' : ', ' - ');
        fixedName = fixedName.replace(': ', ' - ');
        fixedName = fixedName.replace(' :', ' - ');
        fixedName = fixedName.replace(':', ' - ');
        return SanitizeFileName(fixedName);
    }
    static createBookFolder(bookTitle) {
        let bookDir = downloadDir + '/' + bookTitle;
        if (!FS.existsSync(downloadDir)) {
            FS.mkdirSync(downloadDir);
        }
        if (!FS.existsSync(bookDir)) {
            FS.mkdirSync(bookDir);
        }
    }
}
exports.FileUtils = FileUtils;
//# sourceMappingURL=FileUtils.js.map