import nattyFetch from './db.global';
import config from 'commons/config';

let context = nattyFetch.context({
  withCredentials: true,
  ignoreSelfConcurrent: true, // 默认开启请求锁
  urlPrefix: "",// 接口前缀
  willFetch: (vars, config) => { },
  plugins: [
    nattyFetch.plugin.soon
  ],
  fit: (response) => {
    let obj = response ? response : {};
    return {
      success: obj.code == '0',
      error: response,
      content: response
    };
  }
});

// 创建接口
context.create('demo', {
  'test': {
    method: 'GET',
    url: 'demo/test'
  }
});

// 输出上下文的所有接口
export default context.api;
