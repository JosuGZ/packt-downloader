"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileUtils_1 = require("./FileUtils");
class BookLink {
}
exports.BookLink = BookLink;
class Book {
    constructor(bookElement) {
        this.title = null;
        this.links = [];
        this.title = FileUtils_1.FileUtils.fixName(bookElement.getElementsByClassName('title')[0].innerHTML.trim());
        let fileBase = this.title.replace(' [eBook]', '');
        let downloadsDiv = bookElement.getElementsByClassName('download-container')[1];
        let aElements = downloadsDiv.getElementsByTagName('a');
        for (let i = 0; i < aElements.length; i++) {
            let aElement = aElements[i];
            let href = aElement.href;
            let bits = href.substring(1).split('/');
            let extension = 'zip';
            if (bits.length === 3) {
                extension = bits[2];
            }
            if (href !== 'about:blank#') {
                this.links.push({
                    link: 'https://www.packtpub.com' + href,
                    file: this.title + '/' + fileBase + '.' + extension
                });
            }
        }
    }
    static create(bookElement) {
        let book = new Book(bookElement);
        return book;
    }
    static isBook(bookElement) {
        if (!bookElement.getElementsByClassName('title')[0]) {
            return false;
        }
        return true;
    }
}
exports.Book = Book;
//# sourceMappingURL=Book.js.map