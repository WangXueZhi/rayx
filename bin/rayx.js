#!/usr/bin/env node
const pkg = require("../package.json");
const cwdPath = process.cwd();
const path = require('path');
const fs = require("fs");
const gulp = require("gulp");
const replace = require('gulp-replace');
const rename = require("gulp-rename");

// 定义所有命令行参数。
const options = {
    // #region 全局指令
    "-c": "--create",
    "-C": "--create",
    "--create": {
        description: "创建一个新的 reactProject",
        execute(value) {
            if (!value || typeof value !== "string" || !value.split("/")[1]) {
                console.log("格式错误，正确格式：rayx -c 项目名/项目描述");
                return;
            }
            // 复制整体目录
            const reactProjectPath = path.resolve(__dirname, "../tpl/reactProject/");
            const valueArr = value.split("/");
            const projectName = valueArr[0];
            const projectDisc = valueArr[1];
            gulp.src(`${reactProjectPath}/**`)
                .pipe(replace('__name__', projectName))
                .pipe(replace('__description__', projectDisc))
                .pipe(replace('__pageTitle__', projectDisc))
                .pipe(gulp.dest(`${cwdPath}`));

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
    },
    "-v": "--version",
    "-V": "--version",
    "--version": {
        description: "当前版本号",
        execute() {
            console.log(`version is ${pkg.version}`);
        }
    },
    "-?": "--help",
    "-h": "--help",
    "--help": {
        description: "帮助",
        execute() {
            if (!taskName) {
                digo.info("\nUsage: digo <task> [options]");
                digo.info("\nOptions:\n\n{default:list}", { list: generateList(options) });
                return false;
            }
        }
    },
    "--cwd": {
        description: "命令行执行路径",
        execute() { console.log(cwdPath) }
    },
    "--entry": {
        description: "创建入口",
        execute(value) {
            if (!value || typeof value !== "string" || !value.split("/")[1]) {
                console.log("格式错误，正确格式：rayx --entry 入口名/页面标题");
                return;
            }
            const reactProjectPath = path.resolve(__dirname, "../tpl/reactProject/");
            const valueArr = value.split("/");
            const entryName = valueArr[0];
            const pageTitle = valueArr[1];
            gulp.src(`${reactProjectPath}/src/entrys/index/**`)
                .pipe(replace('__description__', pageTitle))
                .pipe(gulp.dest(`${cwdPath}/src/entrys/${entryName}`));
            gulp.src(`${reactProjectPath}/src/pages/index.html`)
                .pipe(replace('__pageTitle__', pageTitle))
                .pipe(rename(`${entryName}.html`))
                .pipe(gulp.dest(`${cwdPath}/src/pages`));
        }
    },
    "--components": {
        description: "创建组件",
        execute(value) {
            if (!value || typeof value !== "string" || !value.split("/")[1]) {
                console.log("格式错误，正确格式：rayx --components 组件名/组件描述");
                return;
            }

            const reactProjectComponentsPath = path.resolve(__dirname, "../tpl/reactProjectComponent/");
            const valueArr = value.split("/");
            const componentName = valueArr[0];
            const componentDesc = valueArr[1];

            gulp.src(`${reactProjectComponentsPath}/App/**`)
                .pipe(replace('__description__', componentDesc))
                .pipe(gulp.dest(`${cwdPath}/src/components/${componentName}`));
        }
    }
};

function run(argv) {
    for (let i = 0; i < argv.length; i++) {
        // 处理选项名。
        const arg = argv[i];
        if (arg.charCodeAt(0) === 45 /*-*/) {
            // -- 后的参数都只在配置文件本身使用。
            if (arg === "--") {
                break;
            }
            let option = options[arg];
            if (typeof option === "string") {
                option = options[option];
            }
            if (option && option.execute) {
                // 处理选项值。
                const value = i + 1 < argv.length && argv[i + 1].charCodeAt(0) !== 45 /*-*/ ? argv[++i] : true;
                // 解析参数。
                if (option.execute.length && value === true) {
                    // return digo.fatal("Option '{option}' expects an argument.", { option: arg });
                }
                // 执行命令。
                if (option.execute(value) === false) {
                    return;
                }
            }
        }
        else if (!taskName) {
            taskName = arg;
        }
    }
}

run(process.argv.slice(2));