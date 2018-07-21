import device from 'commons/device';
import util from "commons/util";

/* eslint-disable */
// 定义环境类型
let defineEnv = __wpdf_define_env__;
// 定义调试模式
let defineDebug = __wpdf_define_debug__;
// 项目页面路径
let publicPagePath = __wpdf_public_page_path__;
// 项目页面名称
let publicPageFullname = __wpdf_public_page_fullname__;
// 项目资源路径
let publicAssetPath = __wpdf_public_asset_path__;
// 后端接口路径
let publicRpcPath = __wpdf_public_rpc_path__;
/* eslint-enable */

// 默认配置
export default {
  public: { // 部署相关
    defineEnv: defineEnv,
    defineDebug: defineDebug,
    pagePath: publicPagePath,
    pageFullname: publicPageFullname,
    assetPath: publicAssetPath,
    rpcPath: publicRpcPath
  }
};