# rayx
webpack+react项目工程化CLI工具，为了提高开发效率和开发体验，避免繁琐的操作，规范项目结构和文档。

# 安装
```
npm install rayx -g
```

## v2.2.0+ 重写命令

#### 创建项目
```node
rayx c 项目名/项目描述
```
```node
rayx create 项目名/项目描述
```

#### entry操作

新增
```node
rayx entry --add 入口名/页面标题
```
```node
rayx entry -A 入口名/页面标题
```
移除
```node
rayx entry --delete 入口名
```
```node
rayx entry -D 入口名
```


#### component操作

新增
```node
rayx component --add 组件名/组件描述
```
```node
rayx component -A 组件名/组件描述
```
移除
```node
rayx component --delete 组件名
```
```node
rayx component -D 组件名
```

#### md 文档操作 （v2.1.0+）

```node
rayx md --update
```
```node
rayx md -U
```

1. 之前没有md文档的可以用这个生成文档
2. 文档根据目录内容生成
3. v2.1.0之后点的版本，对入口和组件的操作会同步更新文档

#### api生成器 （v2.3.0+）

生成api

```node
rayx api
```

例子

```javascript
import { query_info } from "api/query/info";
import { query_info_rest } from "api/query/restinfo";

// 正常请求
query_info({
    id: 123
}).then((res)=>{

})

// REST-FULL 风格接口
// api/query/{id}/info
// api/query/123/info
query_info_rest({
    "{id}": 123
}).then((res)=>{

})
```

1. 项目目录下必须有api.json文件
2. api.json文件由后端生成提供
3. 请求使用axios

## 生成目录结构说明
```node
project
│   README.md
│   .babelrc     // babel配置文件
│   .gitignore   // 忽略提交配置
│   package.json  
│   postcss.config.js  // postcss配置文件
│   webpack.config.js  // webpack配置文件
└─src
│   │   commons     // 公共模块
│   │   components // 项目共用组件
│   │   entrys         // 项目入口
│   │   images        // 项目共用图片
│   │   libraries      // 第三方库
│   │   pages          // html页面模板
│   │   reducers      // redux reducers
│   │   sources        // 接口配置文件
│   │   styles           // 项目共用样式
```
