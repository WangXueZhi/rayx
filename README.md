# 快速生成webpack+react项目

## 安装
```
npm install rayx -g
```

## 创建项目
```
rayx -c 项目名/项目描述
```

## 创建入口
```
rayx --entry 入口名/页面标题
```

## 创建组件
```
rayx --components 组件名/组件描述
```

## 生成目录结构说明
```
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