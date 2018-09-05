/*!
 * jflaginfopc.js v1.1.4
 * (c) 2018-2019 Evan You
 * Released under the MIT License.
 */

;
(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) { // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) { // AMD / RequireJS
    define(factory);
  } else {
    root.fg = factory.call(root);
  }
}(window, function() {
  'use strict';

  function flaginfo() {
    var core_name = 'kot',
      core_version = "1.1.4",
      exception = false,
      option = {
        chalk: '',
        theme: 'default',
        origColor: '#409EFF',
        broHis: [],
        routertState: false,
        broHisFrom: '',
        broHisTo: '',
        broState: false,
        broDirection: ''
      };
    var initOption = function() {
      flaginfo.option = option
      return flaginfo
    }
    var getProperty = function(pArr) {
      for (var i = pArr.length - 1; i >= 0; i--) {
        flaginfo['get' + pArr[i].substring(0, 1).toUpperCase() + pArr[i].substring(1)] = function(i) {
          return function() {
            var reqProperty = flaginfo[pArr[i]] || flaginfo.getQueryObject()[pArr[i]]
            if (!reqProperty) flaginfo.msg('获取' + pArr[i] + '失败,请嵌入企业门户并在fg.ready回调用使用该方法')
            return reqProperty
          }
        }(i)
      }
    }
    var isfun = function(fun) {
      return typeof fun === 'function'
    }
    return {
      initFunction: function() {
        initOption()
        getProperty(['token','userInfo','appId', 'moduleId', 'theme', 'color', 'businessType', 'spId'])
      },
      init: function() {
        this.sendMessage({
          t: 'finish',
          d: {
            href: window.location.origin + window.location.pathname,
            h: document.body.scrollHeight
          }
        })
      },
      listenMsg: function(callback, t) {
        var _this = this
        window.addEventListener('message', function(e) {
          var fi = e.data.fi
          if (!fi) return;
          if (t === 'ready' && _this.option.token && isfun(callback)) {
            callback({
              token: _this.option.token,
              appId: _this.option.appId,
              userInfo: _this.option.userInfo,
              theme: _this.option.theme,
              spId: _this.option.spId,
              moduleId: _this.option.moduleId,
              businessType: _this.option.businessType,
              color: _this.option.color,
              v: _this.option.version
            })
          } else if (t === 'ready' && !_this.option.token) {
            _this.option = Object.assign(_this.option, e.data.fi)
            _this.setTheme(_this.option.theme, _this.option.color, _this.option.v)
            if (isfun(callback)) return callback(fi)
          } else {
            if (isfun(callback)) return callback(fi)
            if (typeof callback !== 'undefined') {
              if (fi.success && isfun(callback.onSuccess)) callback.onSuccess(fi.obj)
              if (!fi.success && isfun(callback.onFail)) callback.onFail(fi.obj)
            }
          }
        }, false);
      },
      sendMessage: function(data) {
        // window.frames[0].postMessage('getcolor','http://fg.my.com');
        if (window.top === window) {
          console.log('请嵌入企业门户中使用改方法：' + data.t)
        } else {
          window.parent.postMessage({
            fi: data
          }, '*');
        }
      },
      cookie: {
        set: function(name, value, days) {
          let d = new Date();
          let hostname = window.location.hostname
          let hostArr = hostname.split('.')
          let domain = hostArr.length < 3 ? hostname : (hostArr.splice(0, 1), hostArr.join('.'))
          d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
          window.document.cookie = name + '=' + value + ';path=/;domain=' + domain + ';expires=' + d.toGMTString();
        },
        get: function(name) {
          let v = window.document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
          return v ? v[2] : null;
        },
        delete: function(name) {
          this.set(name, '', -1);
        }
      },
      ready: function(fn) {
        try {
          if (window.top === window) initOption().setTheme()
          else this.listenMsg(fn, 'ready')
        } catch(e) {
          exception = true
          return this
        }
        return this
      },
      catch: function(fn) {
        if (typeof fn === 'function' && exception) {
          exception = true
          fn()
        }
      },
      MF: function(fName, obj, fn) {
        try {
          this.sendMessage({
            t: fName,
            d: obj
          })
          this.listenMsg(fn, fName)
        } catch(e) {
          console.log(e)
          exception = true
          return this
        }
        return this
      },
      hashNavigation: function(obj, fn) {
        this.MF('hashNavigation', obj, fn)
        // if (!obj.name) return
        // this.sendMessage({
        //   t: 'hashNavigation',
        //   d: obj
        //   // d: {
        //   //   name: obj.name,
        //   //   routerUrl: obj.routerUrl || ''
        //   // }
        //   // d: {
        //   //   nav: [{}]
        //   // }
        // })
        // this.listenMsg(fn, 'hashNavigation')
      },
      loginOut: function() {
        this.sendMessage({
          t: 'loginOut'
        })
      },
      goto: function(title) {
        this.sendMessage({
          t: 'goto',
          d: title
        })
        // console.log(routerUrl)
      },
      // getTheme: function() {
      //   var reqTheme = this.option.theme || this.getQueryObject().theme
      //   if (!reqTheme) this.msg('请嵌入企业门户并在fg.ready回调用使用该方法')
      //   return reqTheme
      // },
      // getColor: function() {
      //   var reqColor = this.color || this.getQueryObject().color
      //   if (!reqColor) this.msg('请嵌入企业门户并在fg.ready回调用使用该方法')
      //   return reqColor
      // },
      setTheme: function(pmsTheme, pmsColor, pmsVersion) {
        var reqTheme = pmsTheme || this.getQueryObject().theme
        var reqColor = pmsColor || this.getQueryObject().color
          // 设置主题
        if (reqTheme) this.option.theme = reqTheme
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        // link.type = 'text/css';
        link.href = '/static/theme/' + this.option.theme + '/index.css';
        var href = document.getElementsByTagName('head')[0];
        document.head.appendChild(link)
          // 设置颜色
        if (reqColor && reqColor !== this.option.origColor) {
          this.setColor(reqColor, this.option.origColor, pmsVersion)
        } else {
          document.body.style.display = 'block'
        }
      },
      setColor: function(val, oldVal, pmsVersion) {
        if (typeof val !== 'string') return
        var themeCluster = this.getThemeCluster(val.replace('#', ''))
        var originalCluster = this.getThemeCluster(oldVal.replace('#', ''))
        var _this = this
        var getHandler = function(variable, id) {
          return function() {
            var originalCluster = _this.getThemeCluster(_this.option.origColor.replace('#', ''))
            var newStyle = _this.updateStyle(_this[variable], originalCluster, themeCluster)

            let styleTag = document.getElementById(id)
            if (!styleTag) {
              styleTag = document.createElement('style')
              styleTag.setAttribute('id', id)
              document.head.appendChild(styleTag)
            }
            styleTag.innerText = newStyle
          }
        }

        var chalkHandler = getHandler('chalk', 'chalk-style')
        var version = pmsVersion || this.getQueryObject().v
        if (!this.option.chalk) {
          var url = `https://unpkg.com/element-ui@${version}/lib/theme-chalk/index.css`
          this.getCSSString(url, chalkHandler, 'chalk')
        } else {
          chalkHandler()
        }

        var styles = [].slice.call(document.querySelectorAll('style'))
          .filter(function(style) {
            var text = style.innerText
            return new RegExp(oldVal, 'i').test(text) && !/Chalk Variables/.test(text)
          })
        styles.forEach(function(style) {
          var {
            innerText
          } = style
          if (typeof innerText !== 'string') return
          style.innerText = _this.updateStyle(innerText, originalCluster, themeCluster)
        })
      },
      updateStyle: function(style, oldCluster, newCluster) {
        let newStyle = style
        oldCluster.forEach(function(color, index) {
          newStyle = newStyle.replace(new RegExp(color, 'ig'), newCluster[index])
        })
        return newStyle
      },

      getCSSString: function(url, callback, variable) {
        var xhr = new XMLHttpRequest()
        var _this = this
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
            _this[variable] = xhr.responseText.replace(/@font-face{[^}]+}/, '')
            callback()
            document.body.style.display = 'block'
          }
        }
        xhr.open('GET', url)
        xhr.send()
      },

      getThemeCluster: function(theme) {
        var tintColor = function(color, tint) {
          let red = parseInt(color.slice(0, 2), 16)
          let green = parseInt(color.slice(2, 4), 16)
          let blue = parseInt(color.slice(4, 6), 16)

          if (tint === 0) { // when primary color is in its rgb space
            return [red, green, blue].join(',')
          } else {
            red += Math.round(tint * (255 - red))
            green += Math.round(tint * (255 - green))
            blue += Math.round(tint * (255 - blue))

            red = red.toString(16)
            green = green.toString(16)
            blue = blue.toString(16)

            return `#${red}${green}${blue}`
          }
        }

        var shadeColor = function(color, shade) {
          let red = parseInt(color.slice(0, 2), 16)
          let green = parseInt(color.slice(2, 4), 16)
          let blue = parseInt(color.slice(4, 6), 16)

          red = Math.round((1 - shade) * red)
          green = Math.round((1 - shade) * green)
          blue = Math.round((1 - shade) * blue)

          red = red.toString(16)
          green = green.toString(16)
          blue = blue.toString(16)

          return `#${red}${green}${blue}`
        }

        var clusters = [theme]
        for (let i = 0; i <= 9; i++) {
          clusters.push(tintColor(theme, Number((i / 10).toFixed(2))))
        }
        clusters.push(shadeColor(theme, 0.1))
        return clusters
      },
      getQueryObject: function(url) {
        url = url == null ? window.location.href : url
        var search = url.substring(url.lastIndexOf('?') + 1)
        var obj = {}
        var reg = /([^?&=]+)=([^?&=]*)/g
        search.replace(reg, function(rs, $1, $2) {
          var name = decodeURIComponent($1)
          let val = decodeURIComponent($2)
          val = String(val)
          obj[name] = val
          return rs
        })
        return obj
      },
      msg: function(type, text) {
        if (!arguments.length) return
        if (arguments.length === 1) text = type, type = 'danger'
        switch (type) {
          case 'success':
            console.log("%cfrom fg：" + text, "color: #67C23A")
            break;
          case 'warning':
            console.log("%cWarning from fg：" + text, "color: #E6A23C")
            break;
          case 'danger':
            console.log("%cError fg：" + text, "color: #F56C6C")
            break;
          case 'info':
            console.log("%cfrom fg：" + text, "color: #909399")
            break;
          default:
            console.log("%cError from fg：" + text, "color: #F56C6C")
            break;
        }
      },
      // 监听子场景路由变化
      routerState: function(to, from) {
        var _this = this
        this.option.broHisFrom = from.fullPath
        this.option.broHisTo = to.fullPath
        var formatToData = {
          meta: {
            title: to.meta.title
          },
          path: to.fullPath
        }
        var formatFromData = {
          meta: {
            title: from.meta.title
          },
          path: from.fullPath
        }
        this.routertState = true
        this.option.broHis.push(this.option.broHisTo)
        setTimeout(function() {
          _this.MF('routerState', {
            direction: _this.option.broDirection,
            to: formatToData,
            from: formatFromData
          })
          _this.option.broDirection = ''
        }, 60)
      },
      // 监听返回
      historyListening: function(type, text) {
        var _this = this
        if (window.history && window.history.pushState) {
          //popstate事件在浏览器操作时触发, 比如点击后退按钮(或者在JavaScript中调用history.back()方法).
          window.onpopstate = function(e) {
            // window.history.pushState('forward', null, '#');
            // window.history.forward(1);
            // if (_this.option.broHis === ) {}
            // console.log(_this.option.broHis)
            // routertState
            var waitRS = setInterval(function() {
              if (_this.routertState) {
                if (!_this.option.broState) {
                  _this.option.broHis = [_this.option.broHisFrom, _this.option.broHisTo]
                  _this.option.broState = true
                  _this.hashNavigation('back')
                  _this.option.broDirection = 'back'
                } else {
                  if (window.location.hash.split('#')[1] === _this.option.broHis[_this.option.broHis.length - 2]) {
                     // 前进
                    _this.option.broHis.pop()
                    _this.hashNavigation('forward')
                    _this.option.broDirection = 'forward'
                  } else {
                     // 后退
                    // _this.option.broHis.push(_this.option.broHisTo)
                    _this.hashNavigation('back')
                    _this.option.broDirection = 'back'
                  }
                }
                _this.routertState = false
                window.clearInterval(waitRS)
              }
            }, 500)
            // _this.hashNavigation('back')
              // alert("不可回退");  //如果需在弹框就有它
              // self.location = "xx.html"; //如查需要跳转页面就用它
          };
        }
        // window.history.pushState('forward', null, '#'); //在IE中必须得有这两行
        // window.history.forward(1);
      }
    }
  }
  flaginfo = new flaginfo()
  flaginfo.initFunction()
  window.onload = function(e) {
    flaginfo.init()
    flaginfo.historyListening()
  }
  return flaginfo;
}));
