"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Axios = require("axios");
const jsdom_1 = require("jsdom");
const FS = require("fs");
const FileUtils_1 = require("./FileUtils");
const DownloadManager_1 = require("./DownloadManager");
const Book_1 = require("./Book");
const packtHost = 'https://www.packtpub.com';
const downloadURL = 'https://www.packtpub.com/account/my-ebooks';
const headers = JSON.parse(FS.readFileSync('./headers.json').toString());
const downloadOptions = {
    headers: headers
};
const downloadDir = './downloads';
Axios.default.get(downloadURL, downloadOptions).then(onMainPage).catch(console.error);
function onMainPage(response) {
    let page = new jsdom_1.JSDOM(response.data).window.document;
    let pages = [page];
    let pagesDivSearch = page.getElementsByClassName('solr-pager-page-selector');
    if (pagesDivSearch.length > 1) {
        throw 'error';
    }
    else if (pagesDivSearch.length === 1) {
        let pagesDiv = pagesDivSearch[0];
        let aElements = pagesDiv.getElementsByTagName('a');
        let promises = [];
        for (let i = 0; i < aElements.length; i++) {
            promises.push(Axios.default.get(packtHost + aElements[i].href, downloadOptions));
        }
        Promise.all(promises).then(responses => {
            responses.forEach((response) => {
                let nextPage = new jsdom_1.JSDOM(response.data).window.document;
                pages.push(nextPage);
            });
            onPages(pages);
        }).catch(console.error);
    }
    else {
        onPages(pages);
    }
}
function getBooks(page) {
    let bookDivs = page.getElementsByClassName('product-line');
    let books = [];
    for (let i = 0; i < bookDivs.length; i++) {
        let bookDiv = bookDivs[i];
        if (Book_1.Book.isBook(bookDiv)) {
            books.push(Book_1.Book.create(bookDiv));
        }
    }
    return books;
}
function onPages(pages) {
    let books = [];
    for (let i = 0; i < pages.length; i++) {
        books = books.concat(getBooks(pages[i]));
    }
    console.log('Found ', books.length, 'books');
    books.forEach(addToQueue);
}
function addToQueue(book) {
    let dm = DownloadManager_1.DownloadManager.getInstance();
    let bookDir = FileUtils_1.FileUtils.createBookFolder(book.title);
    book.links.forEach(link => {
        let options = Object.assign({ responseType: 'stream' }, downloadOptions);
        dm.addDownload(link.link, downloadDir + '/' + link.file, options);
    });
}
//# sourceMappingURL=main.js.map