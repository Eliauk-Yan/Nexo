export default {
  /**
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  dev: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/admin/': {
      // 要代理的地址
      target: 'http://localhost:8099',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
      pathRewrite: { '^/admin/': '/admin/' },
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
