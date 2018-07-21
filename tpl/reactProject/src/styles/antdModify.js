/**
 * 覆盖 Ant Design Mobile 的默认 Less 变量，并本地化 iconfont 资源。
 * https://github.com/ant-design/antd-init/tree/master/examples/customize-antd-theme
 * https://github.com/ant-design/antd-init/tree/master/examples/local-iconfont
 */

let path = require('path');

let antdPath = path.join('antd-mobile', 'lib'); // 认为该路径下的 less 属于 Ant Design Mobile 组件。

// 当前路径是否是 antd-mobile 路径
let isAntdPath = (absPath) => {
  return absPath.includes(antdPath);
};

let lessQuery = {
  modifyVars: {
    "hd": "2px"
  }
};

module.exports = {
  isAntdPath: isAntdPath,
  lessQuery: lessQuery
};
