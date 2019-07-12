
const util = require("./util.js");
const fs = require("fs");
const path = require('path');
const gulp = require("gulp");
const replace = require('gulp-replace');
const rename = require("gulp-rename");
const log = require("./log.js");

// java返回类型枚举
const RESPONSE_TYPE = {
    "java.lang.Void": null,
    "java.lang.Integer": "整数",
    "java.lang.String": "字符串",
    "java.lang.Boolean": "布尔值"
}

// api模板路径
const TPL_API_PATH = path.resolve(__dirname, "../tpl/api");
// api列表索引
let apisIndex = 0;
// api列表
let apisArr = [];
// 创建api文件的目标目录
let buildPath = "";
// api数据
let apiDatas = {};
// 是否覆盖
let isOverride = false;
// api 类型
let apiType = "web";
// api包名称
let apiPackageName = "api";
// js关键字
let keywords = ["abstract", "arguments", "boolean", "break", "byte", "case", "catch", "char",
    "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum",
    "eval", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto",
    "if", "implements", "import", "in", "instanceof", "int", "interface", "let", "long", "native",
    "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super",
    "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var",
    "void", "volatile", "while", "with", "yield"]

let api = {};

/**
 * 生成适用于微信的api接口
 * @param {String} dir 创建目录
 * @param {String} apiName api文件名
 * @param {Object} data api数据
 * @param {Boolean} override 是否重新生成，会先清空原来生成的文件
 */
api.buildWXA = (dir, apiName, data, override) => {
    apiType = "wxa";
    api.build(dir, apiName, data, override);
}

/**
 * 生成api接口
 * @param {String} dir 创建目录
 * @param {String} apiName api文件名
 * @param {Object} data api数据
 * @param {Boolean} override 是否重新生成，会先清空原来生成的文件
 */
api.build = (dir, apiName, data, override) => {
    let { ...newData } = data;
    apiDatas = data; // 缓存到全局
    isOverride = override;
    buildPath = dir;
    apiPackageName = apiName;

    // 如果覆盖，先清除源目录
    if (override) {
        api.clean(dir);
    }

    // 如果fetch基础文件不存在，创建一个
    if (apiType == "web" && !fs.existsSync(`${buildPath}fetch.js`)) {
        gulp.src(`${TPL_API_PATH}/fetch.js`)
            .pipe(gulp.dest(buildPath));
    }

    for (let key in newData.apis) {
        newData.apis[key].url = key;
        apisArr.push(newData.apis[key]);
    }

    api.buildOne(apisArr[apisIndex]);
}

/**
 * 生成指定的一个api接口
 * @param {Object} data 指定的一个api数据
 */
api.buildOne = function (data) {
    // 如果没有responses字段，就不创建当前api
    if (!data.responses) {
        api.buildNext();
        return;
    }

    // 处理url数据
    let urlArr = util.cleanEmptyInArray(data.url.split("/"));
    let apiPath = buildPath;

    // 清理出rest参数位置，因为参数对拼接路径没用
    for (let i = 0; i < urlArr.length; i++) {
        if (urlArr[i].indexOf("{") >= 0) {
            urlArr.splice(i, 1);
        }
    }

    // 拼接出文件路径
    for (let i = 0; i < urlArr.length - 2; i++) {
        apiPath += `${urlArr[i]}/`;
    }

    // 创建api方法名
    let apiFunName = urlArr[urlArr.length - 1];
    if (urlArr[urlArr.length - 1].indexOf(".") >= 0) {
        let nameArr = urlArr[urlArr.length - 1].split(".");
        nameArr.splice(-1, 1);
        apiFunName = nameArr.join(".");
    }

    const API_NAME = keywords.includes(apiFunName) ? `_${apiFunName}` : apiFunName;
    const API_dESCRIBE = data.summary;
    const API_URL = `"${util.cleanEmptyInArray(data.url.split("/")).join("/")}"`;
    const API_METHOD = `"${data.method || "POST"}"`;

    // headers 处理
    let api_headers_head = "{";
    let api_headers_body = "";
    if (data.contentType) {
        api_headers_body += `\n      "Content-Type": "${data.contentType}"`;
    }
    let api_headers_foot = api_headers_body ? "\n    }" : "}";
    const API_HEADERS = api_headers_head + api_headers_body + api_headers_foot;

    // 接口注释处理
    // 接口参数
    let paramsArr = [];
    for (let param in data.parameters) {
        // 处理基本数据类型的参数
        if (data.parameters[param].type.indexOf("java.lang.") == 0) {
            paramsArr.push({
                name: param,
                info: data.parameters[param]
            });
        } else {
            // 处理复杂数据类型的参数
            let properties = apiDatas.types[data.parameters[param].type].properties;
            for (let prop in properties) {
                paramsArr.push({
                    name: prop,
                    info: properties[prop]
                });
            }
        }
    }
    // 接口返回
    let responsesArr = [];
    if (data.responses[0].type.indexOf("<") >= 0) {
        const responseType = data.responses[0].type.split("<")[1].split("[]")[0];
        if (apiDatas.types[responseType]) {
            console.log(data)
            const responsesProperties = apiDatas.types[responseType].properties;
            console.log(responsesProperties)
            for (let responsesPropertiesItem in responsesProperties) {
                console.log(responsesPropertiesItem)
                responsesArr.push({
                    name: responsesPropertiesItem,
                    info: responsesProperties[responsesPropertiesItem]
                });
            }
        }
    }

    let api_annotation_head = "/**";
    let api_annotation_body = `\n * ${API_dESCRIBE}`;
    let api_annotation_foot = "\n */";
    // 如果有请求参数
    if (paramsArr.length > 0) {
        api_annotation_body += `\n * @param { Object } data 请求参数`;
        api_annotation_body += `\n * {`;
        for (let i = 0; i < paramsArr.length; i++) {
            api_annotation_body += `\n *   ${paramsArr[i].name} ${paramsArr[i].info.summary}`;
        }
        api_annotation_body += `\n * }`;
    }

    // 如果有请求参数
    if (responsesArr.length > 0) {
        api_annotation_body += `\n * @responses { Object } 返回参数`;
        api_annotation_body += `\n * {`;
        for (let i = 0; i < responsesArr.length; i++) {
            api_annotation_body += `\n *   ${responsesArr[i].name} ${responsesArr[i].info.summary}`;
        }
        api_annotation_body += `\n * }`;
    }
    const API_ANNOTATION = api_annotation_head + api_annotation_body + api_annotation_foot;

    // 命名接口文件名称
    let apiFileName = `${urlArr[urlArr.length - 2] || "other"}.js`;

    // 目标文件路径
    let targetApiFilePath = `${apiPath}${apiFileName}`;
    // 模板文件路径
    let tplApiFilePath = `${TPL_API_PATH}/${apiType == "wxa" ? "wxa" : "demo"}.js`;
    // 如果目标文件已存在 并且不要覆盖
    if (fs.existsSync(targetApiFilePath)) {
        // 读取目标文件内容
        let targetFileContent = fs.readFileSync(targetApiFilePath, 'utf-8');


        // 检查目标文件内是否已有该接口
        let matchText = "";
        if (apiType == "web") {
            matchText = `export function ${API_NAME}(`;
        }
        if (apiType == "wxa") {
            matchText = `exports.${API_NAME} = function (options) {`;
        }
        if (targetFileContent.indexOf(matchText) >= 0) {
            // log.error("这个api已存在...下一个")
            api.buildNext();
            return;
        }

        // 读取模板文件内容
        let tplFileContent = fs.readFileSync(tplApiFilePath, 'utf-8');
        let newTplFileContent = tplFileContent
            .replace(/__api_annotation__/g, API_ANNOTATION)
            .replace(/__api_name__/g, API_NAME)
            .replace(/__url__/g, API_URL)
            .replace(/__method__/g, API_METHOD)
            .replace(/__headers__/g, API_HEADERS);

        log.info("api名称: " + API_NAME)
        log.info("api描述: " + API_dESCRIBE)
        log.info("api地址: " + API_URL)

        // 写入新内容
        try {
            fs.writeFileSync(targetApiFilePath, `${targetFileContent}\n${newTplFileContent}`, 'utf8');
            log.success(`api ${API_NAME} 创建成功`);
        } catch (error) {
            log.error(`api ${API_NAME} 创建失败，原因：${error}`);
        }

        api.buildNext();
    } else {
        // 如果目标文件不存在， 创建目标文件
        gulp.src(tplApiFilePath)
            .pipe(rename(apiFileName))
            .pipe(replace('__api_annotation__', API_ANNOTATION))
            .pipe(replace('__api_name__', API_NAME))
            .pipe(replace('__url__', API_URL))
            .pipe(replace('__method__', API_METHOD))
            .pipe(replace('__headers__', API_HEADERS))
            .pipe(gulp.dest(apiPath))
            .on("end", () => {
                // 读取目标文件内容
                let targetFileContent = fs.readFileSync(targetApiFilePath, 'utf-8');

                if (apiType == "web") {
                    fs.writeFileSync(targetApiFilePath, `import _fetch from "${apiPackageName}/fetch";\n${targetFileContent}`, 'utf8');
                }
                if (apiType == "wxa") {
                    fs.writeFileSync(targetApiFilePath, `const network = getApp().globalData.network;\n${targetFileContent}`, 'utf8');
                }

                log.success(`api ${API_NAME} 创建成功`);
                api.buildNext();
            });
    }
}

/**
 * 生成下一个api接口
 */
api.buildNext = function () {
    apisIndex++;
    if (apisArr[apisIndex]) {
        api.buildOne(apisArr[apisIndex]);
    } else {
        log.success("api创建结束");
    }
}

/**
 * 清除空api，fetch.js除外
 */
api.clean = function (dir) {
    let fetchContent = "";
    if (fs.existsSync(`${dir}fetch.js`)) {
        fetchContent = fs.readFileSync(`${dir}fetch.js`, 'utf-8');
    }
    util.rmdirSync(dir);
    fs.mkdirSync(dir);

    if (fetchContent) {
        fs.writeFileSync(`${dir}fetch.js`, fetchContent, 'utf8');
    }
}

module.exports = api;