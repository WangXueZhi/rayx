(function (win) {
  // 保留原始方法
  var doc = win.document;
  var _alert = win.alert;
  var _log = win.console.log;
  var _info = win.console.info;
  var _warn = win.console.warn;
  var _error = win.console.error;
  var logPannel = doc.createElement('div');
  var logBox = doc.createElement('div');
  var logTitle = doc.createElement('h3');
  var logList = doc.createElement('ul');

  // 面板样式
  logPannel.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.6);display:none;-webkit-box-pack:center;-webkit-box-align:center;';
  logBox.style.cssText = 'box-sizing:border-box;width:90%;height:50%;padding:15px;background-color:#FFF;box-shadow:0px 1px 1px rgba(0,0,0,0.3);border-radius:4px;';
  logTitle.style.cssText = 'width:100%;margin:0;margin-bottom:10px;padding:0;height:20px;line-height:20px;font-size:14px;';
  logTitle.innerHTML = '<span style="color:#666;">调试面板</span><a id="log-pannel-close" style="color:#666;display:block;float:right;height:20px;line-height:20px;">关闭</a>';
  logList.style.cssText = 'margin:0;padding:0;width:100%;height:95%;overflow:auto;list-style:none;line-height:1.5em;';

  // 组装面板
  logBox.appendChild(logTitle);
  logBox.appendChild(logList);
  logPannel.appendChild(logBox);

  // 关闭面板
  logTitle.querySelector('#log-pannel-close').addEventListener('touchend', function () {
    logPannel.style.display = 'none';
    logList.innerHTML = '';
  }, false);

  // 触摸面板
  var tapTime = 0;
  logList.addEventListener('touchstart', function (event) {
    if (event.target.tagName.toUpperCase() === 'A') {
      tapTime = Date.now();
    } else {
      tapTime = 0;
    }
  }, false);

  // 离开面板
  logList.addEventListener('touchend', function (event) {
    if (tapTime && Date.now() - tapTime < 300) {
      if (event.target.tagName.toUpperCase() === 'A') {
        var msg = event.target.innerHTML;
        _alert(msg);
      }
    }
    tapTime = 0;
  }, false);

  // 消息类型颜色
  var getColor = function (type) {
    if (type == 'ONERROR') {
      return '#F4333C';
    }
    else if (type == 'ERROR') {
      return '#F4333C';
    }
    else if (type == 'WARN') {
      return '#FFC600';
    }
    else if (type == 'INFO') {
      return '#108EE9';
    }
    else if (type == 'LOG') {
      return '#333333';
    }
    else if (type == 'ALERT') {
      return '#2CD7AA';
    }
    else {
      return '#CCCCCC';
    }
  };

  // 序列化消息对象
  var arrayStringify = function (array) {
    var arr = [];
    for (var i = 0; i < array.length; i++) {
      arr.push(JSON.stringify(array[i]));
    }
    return arr;
  };

  // 添加消息
  win.printlog = function (msg, type) {
    // 第一次时插入面板
    if (!logPannel.parentNode) {
      if (doc.body) {
        doc.body.appendChild(logPannel);
      }
      else {
        setTimeout(function () {
          doc.body.appendChild(logPannel);
        }, 0);
      }
    }
    
    logPannel.style.display = '-webkit-box';
    var logItem = doc.createElement('li');
    logItem.style.cssText = 'width:100%;height:1.5em;overflow:hidden;word-wrap:break-word;word-break:break-all;border-bottom:1px solid #CCC;';
    logItem.style.color = getColor(type);
    logItem.innerHTML = '<a style="display:block;width:100%;height:100%;text-decoration:none;">['
      + (new Date).toString().split(' ')[4] + '][' + type + '] ' + msg + '</a>';
    if (logList.childNodes.length) {
      logList.insertBefore(logItem, logList.childNodes[0]);
    }
    else {
      logList.appendChild(logItem);
    }
  };

  // 清空消息
  win.clearlog = function () {
    logList.innerHTML = '';
  };

  //覆盖 alert
  win.alert = function (msg) {
    win.printlog(msg, 'ALERT');
    _alert(msg);
  };

  //覆盖 console.log
  win.console.log = function () {
    win.printlog(arrayStringify(arguments).join(' '), 'LOG');
    _log.apply(win.console, arguments);
  };

  //覆盖 console.info
  win.console.info = function () {
    win.printlog(arrayStringify(arguments).join(' '), 'INFO');
    _info.apply(win.console, arguments);
  };

  //覆盖 console.warn
  win.console.warn = function () {
    win.printlog(arrayStringify(arguments).join(' '), 'WARN');
    _warn.apply(win.console, arguments);
  };

  //覆盖 console.error
  win.console.error = function () {
    win.printlog(arrayStringify(arguments).join(' '), 'ERROR');
    _error.apply(win.console, arguments);
  };

  // 监听 onerror
  win.onerror = function (msg, url, line, col, error) {
    //不一定所有浏览器都支持col参数
    col = col || (window.event && window.event.errorCharacter) || 0;

    var data = {};
    data.msg = msg;
    data.url = url;
    data.line = line;
    data.col = col;
    if (!!error && !!error.stack) {
      //如果浏览器有堆栈信息直接使用
      data.stack = error.stack.toString();
    } else if (!!arguments.callee) {
      //尝试通过callee拿堆栈信息
      var ext = [];
      var f = arguments.callee.caller, c = 3;
      //这里只拿三层堆栈信息
      while (f && (--c > 0)) {
        ext.push(f.toString());
        if (f === f.caller) {
          break;//如果有环
        }
        f = f.caller;
      }
      ext = ext.join(',');
      data.stack = ext;
    }

    win.printlog(JSON.stringify(data), 'ONERROR');
    return false;
  };
})(window);