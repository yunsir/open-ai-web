/**
 * 钉钉扫码登录
 * @version 2021-11-09 zzc
 */

class Dingtalk {

  constructor() {
  }

  /**
   * 初始化钉钉二维码
   */
  public init() {
    const scriptEle = document.createElement('script')
    scriptEle.src = 'https://g.alicdn.com/dingding/h5-dingtalk-login/0.21.0/ddlogin.js'
    document.head.appendChild(scriptEle)
  }

  /**
   * 显示钉钉二维码
   * @description 等待script标签创建完毕再调用这个方法
   * @param { String } codeId 显示二维码的id
   */
  public showCode(codeId: string) {
    let base_url = import.meta.env.VITE_APP_API_BASE
    setTimeout(() => {

      // @ts-ignore
      DTFrameLogin(
        {
          id: codeId,
          width: 300,
          height: 300,
        },
        {
          redirect_uri: encodeURIComponent(`${base_url}/login.php`),
          client_id: 'dingixdqg8hjunrj4slm',
          scope: 'openid',
          response_type: 'code',
          prompt: 'consent',
        },
        (loginResult: any) => {
          const { redirectUrl, authCode } = loginResult;
          // 这里可以直接进行重定向
          window.location.href = redirectUrl;
          // 也可以在不跳转页面的情况下，使用code进行授权
          console.log(authCode);
        },
        (errorMsg: any) => {
          // 这里一般需要展示登录失败的具体原因
          alert(`Login Error: ${errorMsg}`);
        },
      )
    }, 500)
  }

  /**
   * 钉钉扫码登陆
   * @param { Object } params 参数对象
   * @param { String } params.code code
   * @param { Object } params.state state
   * @version 2021-11-09 zzc
   */
  public async login(params: any) {
    const { code, state } = params
    if (!code || !state) {
      return
    }
    // UserApi.dingtalkLogin 是请求后端接口，这里改成你自己的
  }
}

export default new Dingtalk();