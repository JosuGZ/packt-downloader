import * as Axios from 'axios';
import * as FS from 'fs';

const MAX_DOWNLOADS = 6;

class Download {
  link: string;
  tempFile: string;
  file: string;
  options: Axios.AxiosRequestConfig;

  constructor(link, file, options) {
    this.link = link;
    this.tempFile = file + '.temp';
    this.file = file;
    this.options = options;
  }
}

export class DownloadManager {
  private static instance: DownloadManager = null;
  private downloads: Download[];
  private downloadSlots: number = MAX_DOWNLOADS;

  private constructor() {
    this.downloads = [];
  }

  public static getInstance() {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }

  public addDownload(link: string, file: string, options: Axios.AxiosRequestConfig) {
    let download = new Download(link, file, options)
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

  private next() {
    if (this.downloadSlots <= 0) throw 'ERROR';

    while (this.downloadSlots) {
      let download = this.downloads.shift();
      this.downloadSlots--;

      if (!download) {
        this.downloadSlots++;
        break;
      } else {
        this.download(download);
      }
    }
  }

  private download(download: Download) {
    console.log('[STARTING]', download.file);

    Axios.default.get(download.link, download.options).then(response => {
      let stream = FS.createWriteStream(download.tempFile);
      response.data.pipe(stream);
      response.data.on('end', () => {
        console.log('[FINISHED]', download.file);
        FS.renameSync(download.tempFile, download.file);
        this.downloadSlots++
        this.next();
      });
      response.data.on('finish', () => {
        console.log('[FINISHED]', download.file);
        FS.renameSync(download.tempFile, download.file);
        this.downloadSlots++
        this.next();
      });
      response.data.on('error', () => { // TODO: ¿Pueden llamarse varios?
        console.log('[ERROR]', download.file);
        FS.unlinkSync(download.tempFile);
        this.downloadSlots++
        this.next();
      });
    }).catch(err => {
      console.error(err);
      this.downloadSlots++
      this.next();
    });
  }

}
