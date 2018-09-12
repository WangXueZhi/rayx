const gulp = require("gulp");
const replace = require('gulp-replace');
const path = require('path');
const fs = require("fs");
const cwdPath = process.cwd();
const codeAnnotation = require("./codeAnnotation.js");
const util = require("./util.js");
const log = require("./log.js");

let markdown = {};

/**
 * 更新文档
 */
markdown.update = function () {
    log.info("开始更新文档...");
    markdown.creatConfigAllType();
    markdown.creatMarkdownAllType(() => {
        log.success("文档更新完毕");
    })
}

/**
 * 创建所有文档配置
 */
markdown.creatConfigAllType = function () {
    markdown.creatConfigByType("entrys");
    markdown.creatConfigByType("components");
}

/**
 * 生成所有类型的文档
 * @param {Function} callback 生成完毕回调
 */
markdown.creatMarkdownAllType = function (callback) {
    let entrysMdText = markdown.creatTextByType("entrys");
    let componentsMdText = markdown.creatTextByType("components");

    let pkg = require(`${cwdPath}/package.json`);

    gulp.src(path.resolve(__dirname, "../tpl/reactProject/README.md"))
        .pipe(replace('__description__', pkg.description))
        .pipe(replace('__entrys__', entrysMdText))
        .pipe(replace('__components__', componentsMdText))
        .pipe(gulp.dest(`${cwdPath}/`))
        .on("end", () => {
            callback && callback();
        });
}

/**
 * 添加文档
 * @param {String} type 添加的文档类型
 * @param {Object} options 添加的文档配置
 */
markdown.add = function (type, options) {
    // 如果md配置文件不存在，先创建
    if (!fs.existsSync(`${cwdPath}/markdown.json`)) {
        log.info("文档配置文件不存在");
        markdown.init();
        return;
    }

    log.info(`为${type}添加文档...`);

    let markdownJson = require(`${cwdPath}/markdown.json`);
    for (let i = 0; i < options.length; i++) {
        let name = options[i].name;
        let description = options[i].description;
        markdownJson[type][name] = description;
    }

    // 写入md配置文件
    fs.writeFileSync(`${cwdPath}/markdown.json`, JSON.stringify(markdownJson));

    // 生成文档
    markdown.creatMarkdownAllType(() => {
        log.success("添加文档完毕");
    })
}

/**
 * 删除
 * @param {String} type 删除的文档类型
 * @param {Object} options 删除的文档配置
 */
markdown.delete = function (type, options) {
    // 如果md配置文件不存在，先创建
    if (!fs.existsSync(`${cwdPath}/markdown.json`)) {
        log.error("文档配置文件不存在, 先初始化文档后再尝试删除命令");
        return;
    }

    log.info(`为${type}删除文档...`);

    let markdownJson = require(`${cwdPath}/markdown.json`);
    for (let i = 0; i < options.length; i++) {
        let name = options[i].name;
        delete markdownJson[type][name];
    }

    // 写入md配置文件
    fs.writeFileSync(`${cwdPath}/markdown.json`, JSON.stringify(markdownJson));

    // 生成文档
    markdown.creatMarkdownAllType(() => {
        log.success("删除文档完毕");
    })
}

/**
 * 创建指定类型的md配置
 * @param {*} type 指定配置的类型
 */
markdown.creatConfigByType = function (type) {
    let typesPath = `${cwdPath}/src/${type}/`;
    let dirList = util.dirListInDir(typesPath);

    // 如果md配置文件不存在，先创建
    if (!fs.existsSync(`${cwdPath}/markdown.json`)) {
        fs.writeFileSync(`${cwdPath}/markdown.json`, "{}");
    }

    // 获取原md配置文件
    let markdownJson = require(`${cwdPath}/markdown.json`);
    markdownJson[type] = {};

    for (let i = 0; i < dirList.length; i++) {
        // 读取内容并且获得注释对象
        let itemPath = `${cwdPath}/src/${type}/${dirList[i]}/App.jsx`;
        const text = fs.readFileSync(itemPath, 'utf-8');
        let reg = /(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/g;
        let mat = text.match(reg);
        if (mat && mat[0]) {
            let noteObj = codeAnnotation.translateToObject(mat[0]);
            markdownJson[type][dirList[i]] = noteObj.description;
        } else {
            markdownJson[type][dirList[i]] = "";
        }
    }

    // 写入md配置文件
    fs.writeFileSync(`${cwdPath}/markdown.json`, JSON.stringify(markdownJson));
}

/**
 * 生成并返回md文档内容
 * @param {*} type 指定配置的类型
 */
markdown.creatTextByType = function (type) {
    let markdownJson = require(`${cwdPath}/markdown.json`);

    // 生成入口md字符串
    let mdText = "";
    for (let key in markdownJson[type]) {
        mdText += `\n\n${key} \`${markdownJson[type][key]}\` `;
    }

    return mdText;
}

module.exports = markdown;