'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'vue Admin Template' // page title

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following methods:
// port = 9528 npm run dev OR npm run dev --port = 9528
const port = process.env.port || process.env.npm_config_port || 9528 // dev port （你的开发环境项目运行端口）

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * 如果计划在子路径下部署站点，则需要设置publicpath，
   * 例如github页面。如果您计划将站点部署到https://foo.github.io/bar/，
   * 那么publicpath应该设置为“/bar/”。
   * 在大多数情况下，请使用“/”！！！
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    // 支持所有webpack-dev-server的选项 https://webpack.docschina.org/configuration/dev-server/#devserver
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    // 开发环境mock数据，根据实际情况使用，相关说明：https://panjiachen.github.io/vue-element-admin-site/zh/guide/essentials/mock-api.html#swagger
    proxy: {
      // change xxx-api/login => mock/login （将接口xxx-api/login转发到mock/login）
      // detail: https://cli.vuejs.org/config/#devserver-proxy

      // 配置项例子：
      // target: 'http://www.example.org', // target host
      // changeOrigin: true, // needed for virtual hosted sites
      // ws: true, // proxy websockets
      // pathRewrite: {
      //   '^/api/old-path': '/api/new-path', // rewrite path
      //   '^/api/remove/path': '/path' // remove base path
      // },
      // router: {
      //   // when request.headers.host == 'dev.localhost:3000',
      //   // override target 'http://www.example.org' to 'http://localhost:8000'
      //   'dev.localhost:3000': 'http://localhost:8000'
      // }
      // 中间件文档配置选项： https://github.com/chimurai/http-proxy-middleware#options

      [process.env.VUE_APP_BASE_API]: {
        target: `http://127.0.0.1:${port}/mock`,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API]: ''
        }
      }
    },
    // 在服务内部的所有其他中间件之后， 提供执行自定义中间件的功能
    after: require('./mock/mock-server.js')
  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    // 大概意思是: 请用webpack的name属性配置 index.html的title （在这个项目中，推荐你到/src/setting.js 中设置）
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  chainWebpack(config) {
    config.plugins.delete('preload') // TODO: need test
    config.plugins.delete('prefetch') // TODO: need test

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    // set preserveWhitespace
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()

    config
    // https://webpack.js.org/configuration/devtool/#development
      .when(process.env.NODE_ENV === 'development',
        config => config.devtool('cheap-source-map')
      )

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
