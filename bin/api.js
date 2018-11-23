
const util = require("./util.js");
const fs = require("fs");
const path = require('path');
const gulp = require("gulp");
const replace = require('gulp-replace');
const rename = require("gulp-rename");
const log = require("./log.js");

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

let api = {};

/**
 * 生成api接口
 * @param {String} dir 创建目录
 * @param {Object} data api数据
 */
api.build = (dir, data, override) => {
    let { ...newData } = data;
    apiDatas = data; // 缓存到全局
    isOverride = override;
    buildPath = dir;

    // 如果覆盖，先清除源目录
    if(override){
        api.clean(dir);
    }

    // 如果fetch基础文件不存在，创建一个
    if (!fs.existsSync(`${buildPath}fetch.js`)) {
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
    let urlArr = util.cleanEmptyInArray(data.url.split("/"));
    let apiPath = buildPath;

    for (let i = 0; i < urlArr.length - 2; i++) {
        apiPath += `${urlArr[i]}/`;
    }

    const API_NAME = urlArr[urlArr.length - 1];
    const API_dESCRIBE = data.summary;
    const API_URL = `"${urlArr.join("/")}"`;
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
    let paramsArr = [];
    for (let param in data.parameters) {
        if (API_METHOD == `"GET"`) {
            paramsArr.push({
                name: param,
                info: data.parameters[param]
            });
        } else if (API_METHOD == `"POST"`) {
            if (apiDatas.types[data.parameters[param].type]) {
                let properties = apiDatas.types[data.parameters[param].type].properties;
                for (prop in properties) {
                    paramsArr.push({
                        name: prop,
                        info: properties[prop]
                    });
                }
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
    const API_ANNOTATION = api_annotation_head + api_annotation_body + api_annotation_foot;

    // 命名接口文件名称
    let apiFileName = `${urlArr[urlArr.length - 2]}.js`;
    if (apiFileName.indexOf("{") >= 0) {
        apiFileName = `${urlArr[urlArr.length - 1]}.js`;
    }

    // 目标文件路径
    let targetApiFilePath = `${apiPath}${apiFileName}`;
    // 模板文件路径
    let tplApiFilePath = `${TPL_API_PATH}/demo.js`;
    // 如果目标文件已存在 并且不要覆盖
    if (fs.existsSync(targetApiFilePath)) {
        // 读取目标文件内容
        let targetFileContent = fs.readFileSync(targetApiFilePath, 'utf-8');

        // 检查目标文件内是否已有该接口
        if (targetFileContent.indexOf(`export function ${API_NAME}(`) >= 0) {
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
                fs.writeFileSync(targetApiFilePath, `import _fetch from "api/fetch";\n${targetFileContent}`, 'utf8');
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