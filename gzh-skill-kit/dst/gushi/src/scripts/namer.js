import $ from 'jquery';
import { log } from './debugTools';
import rand from './rand';
import { debugMode } from './config'
  ;

class Namer {
  constructor() {
    this.loading = false;
    this.book = null;
  }

  splitByDelimiters(content, delimiters) {
    let str = content;
    delimiters.forEach((delimiter) => {
      const reg = new RegExp(delimiter, 'g');
      str = str.replace(reg, match => `${match}|`);
    });
    str = str.replace(/\|+/g, '|').replace(/^\||\|$/g, '');
    return str.split('|').map(item => item.trim()).filter(Boolean);
  }

  // TODO
  formatStr(str) {
    // const res = str.replace(/[\s　 ]/g, '');
    let res = str.replace(/(\s|　|”|“){1,}|<br>|<p>|<\/p>/g, '');
    res = res.replace(/\(.+\)/g, '');
    return res;
  }

  splitSentence(content) {
    if (!content) {
      return [];
    }
    const str = this.formatStr(content);
    const primary = this.splitByDelimiters(str, ['，', '。', '！', '？', '；', '：']);
    let arr = [];

    primary.forEach((item) => {
      if (item.length > 18 && item.indexOf('兮') > -1) {
        arr = arr.concat(this.splitByDelimiters(item, ['兮', '、']));
        return;
      }
      if (item.length > 22 && item.indexOf('、') > -1) {
        arr = arr.concat(this.splitByDelimiters(item, ['、']));
        return;
      }
      arr.push(item);
    });

    const normalized = arr
      .map(item => item.replace(/^[，。！？；：、]+|[，。！？；：、]+$/g, ''))
      .filter((item) => {
        const clean = this.cleanBadChar(this.cleanPunctuation(item));
        return clean.length >= 3 && clean.length <= 14;
      });

    if (normalized.length > 0) {
      return normalized;
    }

    return primary.filter((item) => {
      const clean = this.cleanBadChar(this.cleanPunctuation(item));
      return clean.length >= 3 && clean.length <= 18;
    });
  }

  // 清除标点符号
  cleanPunctuation(str) {
    const puncReg = /[<>《》！*\(\^\)\$%~!@#…&%￥—\+=、。，？；‘’“”：·`]/g;
    return str.replace(puncReg, '');
  }

  cleanBadChar(str) {
    const badChars = '胸鬼懒禽鸟鸡我邪罪凶丑仇鼠蟋蟀淫秽妹狐鸡鸭蝇悔鱼肉苦犬吠窥血丧饥女搔父母昏狗蟊疾病痛死潦哀痒害蛇牲妇狸鹅穴畜烂兽靡爪氓劫鬣螽毛婚姻匪婆羞辱'.split('');
    return str.split('').filter(char => badChars.indexOf(char) === -1).join('');
  }

  genName() {
    if (!this.book) {
      return null;
    }
    // const len = this.book.length;
    try {
      const passage = rand.choose(this.book);
      const { content, title, author, book, dynasty } = passage;
      if (!content) {
        return null;
      }

      const sentenceArr = this.splitSentence(content);

      if (!(Array.isArray(sentenceArr) && sentenceArr.length > 0)) {
        return null;
      }

      // if (Array.isArray(sentenceArr) && sentenceArr.length <= 0) {
      //   log({ passage, sentenceArr });
      // }

      const sentence = rand.choose(sentenceArr);


      const cleanSentence = this.cleanBadChar(this.cleanPunctuation(sentence));
      if (cleanSentence.length <= 2) {
        return null;
      }

      // log({ content, sentence });
      // const charList = this.cleanBadChar(cleanSentence);
      const name = this.getTwoChar(cleanSentence.split(''));
      const res = {
        name,
        sentence,
        content,
        title,
        author,
        book,
        dynasty,
      };
      return res;
    } catch (err) {
      log(err);
    }
    // log(res);
    // log('passage', passage);
  }

  getTwoChar(arr) {
    const len = arr.length;
    const first = rand.between(0, len);
    let second = rand.between(0, len);
    let cnt = 0;
    while (second === first) {
      second = rand.between(0, len);
      cnt++;
      if (cnt > 100) {
        break;
      }
    }
    return first <= second ? `${arr[first]}${arr[second]}` : `${arr[second]}${arr[first]}`;
  }

  loadBook(book, cb, errorCb) {
    const url = `./json/${book}.json`;
    this.loading = true;
    $.ajax({
      url,
      success: (data) => {
        log(`${book} loaded`);
        this.loading = false;
        this.book = data;
        if (typeof cb === 'function') {
          cb(data);
        }
      },
      error: (err) => {
        this.loading = false;
        log(err);
        if (typeof errorCb === 'function') {
          errorCb(err);
        }
      },
    });
  }
}
export default Namer;
