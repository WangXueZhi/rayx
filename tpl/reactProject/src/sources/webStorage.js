import nattyStorage from 'natty-storage';

let def = {
  async: false, // 是否以异步方式使用。如果开启，则set/get/has/remove四个方法的返回值都是Promise实例，可以调用then方法。
  key: 'wd', // 缓存对象存储数据所使用的唯一标识。
  tag: 'v1.0' // 缓存的标记，用于判断是否有效。
};

//是否支持 Web Storage
let isSupported = (() => {
  if (window.sessionStorage) {
    try {
      let item = 'wd-sessionStorage-test';
      window.sessionStorage.setItem(item, item);
      window.sessionStorage.removeItem(item);
      return true;
    } catch (e) {
      return false;
    }
  }
  else {
    return false;
  }
})();

let local = nattyStorage(Object.assign({}, def, {
  type: 'localStorage',
  duration: 1000 * 60 * 60 * 24 // 缓存的有效期长，以毫秒数指定
}));

let session = nattyStorage(Object.assign({}, def, {
  type: 'sessionStorage'
}));

let variable = nattyStorage(Object.assign({}, def, {
  type: 'variable'
}));

export {
  isSupported,
  local,
  session,
  variable
};