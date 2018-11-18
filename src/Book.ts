import { FileUtils } from './FileUtils';

export class BookLink {
  link: string;
  file: string;
}

export class Book {
  public title: string = null;
  public links: BookLink[] = [];

  private constructor(bookElement: Element) {
    this.title = FileUtils.fixName(bookElement.getElementsByClassName('title')[0].innerHTML.trim());
    let fileBase = this.title.replace(' [eBook]', '');

    let downloadsDiv = bookElement.getElementsByClassName('download-container')[1];
    let aElements = downloadsDiv.getElementsByTagName('a');
    for (let i=0; i<aElements.length; i++) {
      let aElement = aElements[i];
      let href = aElement.href;
      let bits = href.substring(1).split('/');
      let extension = 'zip';
      if (bits.length === 3) {
        extension = bits[2];
      }
      if (href !== 'about:blank#') { // Kindle link
        this.links.push({
          link: 'https://www.packtpub.com' + href,
          file: this.title + '/' + fileBase + '.' + extension
        });
      }
    }
  }

  public static create(bookElement: Element): Book {
    let book = new Book(bookElement);
    return book;
  }

  public static isBook(bookElement: Element): boolean {
    if (!bookElement.getElementsByClassName('title')[0]) {
      return false;
    }
    return true;
  }

}
