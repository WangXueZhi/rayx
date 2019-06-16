# CHANGELOG

## [v3.0.5] 2019.6.16
- react项目模板里的autoprefixer依赖版本改为^9.5.1, 修改模板工程部分内容

## [v3.0.4] 2019.5.29
- api命令支持生成适用于微信小程序的接口api方法，并且新增支持生成到指定路径, --wxa 指明征程微信小程序的api， ./src/api/ 指定生成路径。
```node
rayx api --wxa ./src/api/
```
- 需要注意：因为本工具给微信生成的api会从app.globalData里引用network对象去发送请求，而network对象是对微信自带wx.request的一种封装，所以：1. 需要开发者自行封装出一个network，并放在app.globalData里；2. 直接将getApp().globalData.network改成wx，使用微信自带的wx.request。
```javascript
//app.js 中装载network，network需要开发者自己封装
const network = require("./utils/network");
App(
{
  onLaunch: function () {},
  globalData: {
    network: network
  }
})

// 生成的api代码
const network = getApp().globalData.network;// 此处可以改成 const network = wx，就不需要封装network了
exports.authorize = function () {
  const {data, header, ...rest} = options; 
  return network.request({
    method: "POST",
    url: "xxx/authorize",
    data: data || {},
    header: header || {},
    ...rest
  })
}
```

## [v3.0.2] 2019.3.13
- 生成项目中文档里增加rayx操作文档的链接

## [v3.0.1] 2019.2.20
- 修复 api命令 接口直接在根目录下的情况下，会直接生成undefined.js，不友好，改成了other.js

## [v3.0.0] 2019.2.20
- 创建项目的react依赖升级到16.8.2，并升级对应react-dom，react-redux

## [v2.3.12] 2019.2.13
- 如果api.json中未指定Content-Type的post请求，则通过url传参

## [v2.3.10] 2018.12.11
- 修复创建项目src中缺少components目录导致创建文档失败的bug

## [v2.3.9] 2018.12.3
- 修复fetch.js中，请求锁的问题

## [v2.3.8] 2018.11.23
- 去掉natty系列http库，去掉sources目录

## [v2.3.7] 2018.11.23
- 修复fetch.js中，post请求的bug

## [v2.3.6] 2018.11.23
- 优化api生成接口参数说明，api命令增加子命令-O，表示api接口全部重新生成，但不会改动fetch.js，

## [v2.3.5] 2018.11.16
- 修生成文档的时候，由于目录还未生成，而出现找不到目录的报错

## [v2.3.4] 2018.11.5
- 修复get请求缓存，fetch.js中增加时间戳