import * as FS from 'fs';
import * as SanitizeFileName from 'sanitize-filename';

const downloadDir = './downloads';

export class FileUtils {

  public static fixName(name: string): string {
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

  public static createBookFolder(bookTitle: string) {
    let bookDir = downloadDir + '/' + bookTitle;
    if (!FS.existsSync(downloadDir)) {
      FS.mkdirSync(downloadDir);
    }
    if (!FS.existsSync(bookDir)) {
      FS.mkdirSync(bookDir);
    }
  }

}
