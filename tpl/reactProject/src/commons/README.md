# 公共资源目录

config.js 项目配置文件，接收 webpack 传入的参数。  
base.js 基础资源，初始化页面环境，必须在每一个入口脚本中引入。  
device.js 基于 userAgent 检测环境，修改自[device.js](https://github.com/matthewhudson/device.js)。  
util.js 辅助函数定义。  

# 注意事项

使用 babel-runtime 和 babel-plugin-transform-runtime 为新内置函数和静态方法提供垫片，使用 core-js 为实例方法提供垫片。  
[core-js](https://github.com/zloirock/core-js)  
[babel-polyfill](https://babeljs.io/docs/usage/polyfill/)  
[babel-runtime 和 babel-plugin-transform-runtime](https://babeljs.io/docs/plugins/transform-runtime/)  
[ES6 + Webpack + React + Babel 如何在低版本浏览器上愉快的玩耍(上)](https://yq.aliyun.com/articles/59107)  
[ES6 + Webpack + React + Babel 如何在低版本浏览器上愉快的玩耍(下)](https://yq.aliyun.com/articles/60724)  