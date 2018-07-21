# 数据源目录

后端数据，按照系统划分不同数据源，按照接口路径在数据源中划分层级。  
前端数据，使用 Web Storage 存储，必须做好数据丢失后的容错处理。  

db.global.js 后端系统的全局接口配置。  
db.inner.js 内部后端系统的上下文配置。  
webStorage.js 前端数据的存储配置。  

# 注意事项

已知在 Safari 的隐身模式（无痕模式）下，无法使用 Web Storage 技术。  
会出现 QuotaExceededError: DOM Exception 22: An attempt was made to add something to storage that exceeded the quota. 异常。  

由于 Promise 的 then 方法中 onFulfilled 回调函数内出现的异常，也会被 catch 方法捕获，传递给 onRejected 回调函数。  
造成该异常与 natty-fetch 的 reject 回调函数参数混淆，为了 hack 这个这种情况，约定 reject 回调函数参数使用 message 属性作为错误提示。  