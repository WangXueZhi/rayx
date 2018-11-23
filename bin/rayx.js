#!/usr/bin/env node
const pkg = require("../package.json");
const cwdPath = process.cwd();
const path = require('path');
const fs = require("fs");
const gulp = require("gulp");
const replace = require('gulp-replace');
const rename = require("gulp-rename");
const markdown = require("./markdown.js");
var program = require('commander');
const log = require("./log.js");
const util = require("./util.js");
const api = require("./api.js");

/**
 * 创建项目
 * @param {String} value 项目名/项目描述
 */
var createProject = function (value) {
    if (!value || typeof value !== "string" || !value.split("/")[1]) {
        log.error("使用方式：rayx c 项目名/项目描述");
        return;
    }
    log.info("开始创建项目...");
    // 复制整体目录
    const reactProjectPath = path.resolve(__dirname, "../tpl/reactProject/");
    const valueArr = value.split("/");
    const projectName = valueArr[0];
    const projectDisc = valueArr[1];
    gulp.src(`${reactProjectPath}/**`)
        .pipe(replace('__name__', projectName))
        .pipe(replace('__description__', projectDisc))
        .pipe(replace('__pageTitle__', projectDisc))
        .pipe(gulp.dest(`${cwdPath}`))
        .on("end", () => {
            log.success(`项目：${projectDisc} --创建完毕`);
            markdown.update();
        });

    // 复制隐藏文件
    gulp.src(`${reactProjectPath}/.babelrc`)
        .pipe(gulp.dest(`${cwdPath}`));

    // 创建.gitignore
    const gitignoreText = fs.readFileSync(`${reactProjectPath}/gitignore.txt`);
    fs.writeFileSync('.gitignore', gitignoreText, 'utf8');
    setTimeout(() => {
        fs.unlinkSync(`${cwdPath}/gitignore.txt`);
    }, 1000);
}

/**
 * 新增入口
 * @param {String} value 入口名/页面标题
 */
var addEntry = function (value) {
    if (!value || typeof value !== "string" || !value.split("/")[1]) {
        log.error("使用方式：rayx entry --add|-A 入口名/页面标题");
        return;
    }

    log.info("开始创建entry...");

    const tplPath = path.resolve(__dirname, "../tpl/");
    const valueArr = value.split("/");
    const entryName = valueArr[0];
    const pageTitle = valueArr[1];
    gulp.src(`${tplPath}/reactProjectEntry/App/**`)
        .pipe(replace('__description__', pageTitle))
        .pipe(gulp.dest(`${cwdPath}/src/entrys/${entryName}`))
        .on('end', () => {
            log.success(`entry: ${entryName} --创建成功`)
            markdown.add("entrys", [{ name: entryName, description: pageTitle }])
        });
    gulp.src(`${tplPath}/reactProjectPage/index.html`)
        .pipe(replace('__pageTitle__', pageTitle))
        .pipe(rename(`${entryName}.html`))
        .pipe(gulp.dest(`${cwdPath}/src/pages`));
}

/**
 * 删除入口
 * @param {String} value 入口名
 */
var deleteEntry = function (value) {
    if (!value || typeof value !== "string") {
        log.error("使用方式：rayx entry --delete|-D 入口名");
        return;
    }

    log.info("开始删除entry...");

    const entryDirPath = `${cwdPath}/src/entrys/${value}/`;

    if (fs.statSync(entryDirPath).isDirectory()) { // recurse
        util.rmdirSync(entryDirPath);

        // 移除html文件
        const htmlPath = `${cwdPath}/src/pages/${value}.html`;
        if (fs.existsSync(htmlPath)) {
            fs.unlinkSync(htmlPath);
        }

        // 修改文档
        markdown.delete("entrys", [{ name: value }]);
        log.success(`entrys：${value} --删除完毕`);
    } else {
        log.error("该入口不存在");
    }
}

/**
 * 添加组件
 * @param {String} value 组件名/组件描述
 */
var addComponent = function (value) {
    if (!value || typeof value !== "string" || !value.split("/")[1]) {
        log.error("使用方式：rayx component --add|-A 组件名/组件描述");
        return;
    }

    log.info("开始创建component...");

    const reactProjectComponentsPath = path.resolve(__dirname, "../tpl/reactProjectComponent/");
    const valueArr = value.split("/");
    const componentName = valueArr[0];
    const componentDesc = valueArr[1];

    gulp.src(`${reactProjectComponentsPath}/App/**`)
        .pipe(replace('__description__', componentDesc))
        .pipe(gulp.dest(`${cwdPath}/src/components/${componentName}`))
        .on('end', () => {
            log.success(`component: ${componentName} --创建成功`);
            markdown.add("components", [{ name: componentName, description: componentDesc }])
        });
}

/**
 * 删除组件
 * @param {String} value 组件名
 */
var deleteComponent = function (value) {
    if (!value || typeof value !== "string") {
        log.error("使用方式：rayx component --delete|-D 组件名");
        return;
    }

    log.info("开始删除component...");

    const dirPath = `${cwdPath}/src/components/${value}/`;

    if (fs.statSync(dirPath).isDirectory()) {
        util.rmdirSync(dirPath);
        log.success(`components：${value} --删除完毕`);
        markdown.delete("components", [{ name: value }]);
    } else {
        log.error("该组件不存在");
    }
}

program
    // 版本号
    .version(pkg.version)
    .option('-v', '版本号', function () {
        console.log(pkg.version)
    });

program
    .command('create')
    .alias('c')
    .description('创建项目')
    .action(function (value) {
        createProject(value);
    });

program
    .command('entry')
    .description('入口操作')
    .option("--add, -A", "新增入口")
    .option("--delete, -D", "删除入口")
    .action(function (cmd, options) {
        if (!options) {
            log.error("缺少子命令，请使用--add|--delete");
            return;
        }
        if (options.D) {
            deleteEntry(cmd);
        }
        if (options.A) {
            addEntry(cmd);
        }
    });

program
    .command('component')
    .description('组件操作')
    .option("--add, -A", "新增组件")
    .option("--delete, -D", "删除组件")
    .action(function (cmd, options) {
        if (!options) {
            log.error("缺少子命令，请使用--add|--delete");
            return;
        }
        if (options.D) {
            deleteComponent(cmd);
        }
        if (options.A) {
            addComponent(cmd);
        }
    });

program
    .command('md')
    .description('文档操作')
    .option("--update, -U", "更新文档")
    .action(function (options) {
        if (!options) {
            log.error("缺少子命令，请使用--update|-U");
            return;
        }
        if (options.U) {
            markdown.update();
        }
    });

program
    .command('api')
    .description('生成api接口文件')
    .option("--override, -O", "覆盖")
    .action(function (options) {
        // api.json文件路径
        const apiJsonFilePath = `${cwdPath}/api.json`;
        // src/api/ 路径
        const apiDirPath = `${cwdPath}/src/api/`;
        if (fs.existsSync(apiJsonFilePath)){
            const apiJson = require(apiJsonFilePath);
            if (options.O) {
                api.build(apiDirPath, apiJson, true);
            }else{
                api.build(apiDirPath, apiJson, false);
            }
        } else {
            log.error("api.json文件不存在");
        }
    });

program.parse(process.argv)