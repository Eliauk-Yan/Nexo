export default {
  /**
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  dev: {
    // 管理后台接口 -> admin 服务
    '/admin/': {
      target: 'http://localhost:8099',
      changeOrigin: true,
      pathRewrite: { '^/admin/': '/admin/' },
    },
    // 认证接口（登录/登出/验证码）-> auth 服务
    '/auth/': {
      target: 'http://localhost:8082',
      changeOrigin: true,
      pathRewrite: { '^/auth': '' },
    },
  },
  test: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/admin/': {
      target: 'https://proapi.azurewebsites.net',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/admin/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
