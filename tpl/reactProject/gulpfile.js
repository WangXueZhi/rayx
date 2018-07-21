let gulp = require('gulp');
let gutil = require('gulp-util');
let del = require('del');
let path = require('path');
let shell = require('shelljs');
let yargs = require('yargs');
let open = require('open');

// 环境枚举
let envEnum = {
  dev: 'dev',
  test: 'test',
  prod: 'prod'
};

// 获取环境参数
let getProcessEnv = () => {
  let env = undefined;
  let argv = yargs.argv;

  if (argv.env && envEnum[argv.env]) {
    env = envEnum[argv.env];
  }

  if (!env) {
    throw getFunError('getProcessEnv', 'Invalid environment type (e.g. --env=prod)');
  }

  funLog('getProcessEnv', env);

  return env;
};

// 输出任务日志
let taskLog = (name, ...message) => {
  gutil.log(`Log in plugin '[Task] ${name}'`, '\nMessage:\n    ', ...message);
};

// 输出函数日志
let funLog = (name, ...message) => {
  gutil.log(`Log in plugin '[Funtion] ${name}'`, '\nMessage:\n    ', ...message);
};

// 获取函数错误
let getFunError = (name, message) => {
  return new gutil.PluginError(`[Funtion] ${name}`, message, {
    // showStack: true
  });
};

// 清理构建文件
let cleanBuild = (cb) => {
  del([`./dist/**`], {
    dryRun: false
  }).then((paths) => {
    funLog('cleanBuild', paths.join('\n'));
    cb();
  }).catch((err) => {
    let gErr = getFunError('cleanBuild', err);
    cb(gErr);
  });
};

// 构建项目
let buildProject = (cb, type) => {
  let env = getProcessEnv();

  if (env == "test") {
    shell.exec('npm run build:test', {
      async: false,
      silent: false
    });
  }

  if (env == "prod") {
    shell.exec('npm run build:prod', {
      async: false,
      silent: false
    });
  }
};

// 清理目录
gulp.task('clean', (cb) => {
  cleanBuild(cb);
});

// 构建项目
gulp.task('build', ['clean'], (cb) => {
  buildProject(cb);
});

// 开发服务器
gulp.task('server', [], (cb) => {
  shell.exec('npm run server', {
    async: true,
    silent: false
  });
});

// 开发服务器
gulp.task('open', [], (cb) => {
  shell.exec('npm run server', {
    async: true,
    silent: false
  });
  let uri = `http://localhost:8000/index.html`;
  open(uri);
});

// // 构建项目（生产环境）
// gulp.task('build', ['clean'], (cb) => {
//   buildProject(cb, "prod");
// });

// 默认任务
gulp.task('default', () => {
  taskLog('default', 'Please use npm script');
});
