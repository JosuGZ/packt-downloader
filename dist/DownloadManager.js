"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Axios = require("axios");
const FS = require("fs");
const MAX_DOWNLOADS = 6;
class Download {
    constructor(link, file, options) {
        this.link = link;
        this.tempFile = file + '.temp';
        this.file = file;
        this.options = options;
    }
}
class DownloadManager {
    constructor() {
        this.downloadSlots = MAX_DOWNLOADS;
        this.downloads = [];
    }
    static getInstance() {
        if (!DownloadManager.instance) {
            DownloadManager.instance = new DownloadManager();
        }
        return DownloadManager.instance;
    }
    addDownload(link, file, options) {
        let download = new Download(link, file, options);
        if (FS.existsSync(download.tempFile)) {
            FS.unlinkSync(download.tempFile);
        }
        if (!FS.existsSync(download.file)) {
            this.downloads.push(download);
            if (this.downloadSlots > 0) {
                this.next();
            }
        }
    }
    next() {
        if (this.downloadSlots <= 0)
            throw 'ERROR';
        while (this.downloadSlots) {
            let download = this.downloads.shift();
            this.downloadSlots--;
            if (!download) {
                this.downloadSlots++;
                break;
            }
            else {
                this.download(download);
            }
        }
    }
    download(download) {
        console.log('[STARTING]', download.file);
        Axios.default.get(download.link, download.options).then(response => {
            let stream = FS.createWriteStream(download.tempFile);
            response.data.pipe(stream);
            response.data.on('end', () => {
                console.log('[FINISHED]', download.file);
                FS.renameSync(download.tempFile, download.file);
                this.downloadSlots++;
                this.next();
            });
            response.data.on('finish', () => {
                console.log('[FINISHED]', download.file);
                FS.renameSync(download.tempFile, download.file);
                this.downloadSlots++;
                this.next();
            });
            response.data.on('error', () => {
                console.log('[ERROR]', download.file);
                FS.unlinkSync(download.tempFile);
                this.downloadSlots++;
                this.next();
            });
        }).catch(err => {
            console.error(err);
            this.downloadSlots++;
            this.next();
        });
    }
}
DownloadManager.instance = null;
exports.DownloadManager = DownloadManager;
//# sourceMappingURL=DownloadManager.js.map