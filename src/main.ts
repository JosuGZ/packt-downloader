import * as Axios from 'axios';
import { JSDOM } from 'jsdom';
import * as FS from 'fs';

import { FileUtils } from './FileUtils';
import { DownloadManager } from './DownloadManager';
import { Book } from './Book';

const packtHost = 'https://www.packtpub.com';
const downloadURL = 'https://www.packtpub.com/account/my-ebooks';
const headers = JSON.parse(FS.readFileSync('./headers.json').toString());
const downloadOptions: Axios.AxiosRequestConfig = {
  headers: headers
};
const downloadDir = './downloads';

Axios.default.get(downloadURL, downloadOptions).then(onMainPage).catch(console.error);

function onMainPage(response: Axios.AxiosResponse) {
  let page = new JSDOM(response.data).window.document;
  let pages: Document[] = [page];
  let pagesDivSearch = page.getElementsByClassName('solr-pager-page-selector');

  if (pagesDivSearch.length > 1) {
    throw 'error';
  } else if (pagesDivSearch.length === 1) {
    let pagesDiv = pagesDivSearch[0];
    let aElements = pagesDiv.getElementsByTagName('a');
    let promises = [];
    for (let i=0; i<aElements.length; i++) {
      promises.push(Axios.default.get(packtHost + aElements[i].href, downloadOptions));
    }
    Promise.all(promises).then(responses => {
      responses.forEach((response: Axios.AxiosResponse) => {
        let nextPage = new JSDOM(response.data).window.document;
        pages.push(nextPage);
      });
      onPages(pages);
    }).catch(console.error);
  } else {
    onPages(pages);
  }
}

function getBooks(page: Document): Book[] {
  let bookDivs = page.getElementsByClassName('product-line');

  let books: Book[] = [];
  for (let i=0; i<bookDivs.length; i++) {
    let bookDiv = bookDivs[i];
    if (Book.isBook(bookDiv)) {
      books.push(Book.create(bookDiv));
    }
  }

  return books;
}

function onPages(pages: Document[]) {
  let books: Book[] = [];
  for (let i=0; i<pages.length; i++) {
    books = books.concat(getBooks(pages[i]));
  }
  console.log('Found ', books.length, 'books');
  books.forEach(addToQueue);
}


function addToQueue(book: Book) {
  let dm = DownloadManager.getInstance();
  let bookDir = FileUtils.createBookFolder(book.title);
  book.links.forEach(link => {
    let options: Axios.AxiosRequestConfig = {
      responseType: 'stream',
      ...downloadOptions
    };
    dm.addDownload(link.link, downloadDir + '/' + link.file, options);
  })
}
