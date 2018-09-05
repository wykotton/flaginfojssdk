/*!
 * jflaginfoapp.js v1.1.3
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
      core_version = "1.1.3",
      exception = false,
      option = {
        chalk: '',
        theme: 'default',
        origColor: '#26a2ff'
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
    return {
      initFunction: function() {
        initOption()
        getProperty(['token', 'theme', 'color', 'businessType', 'spId'])
      },
      init: function() {
        this.sendMessage({
          t: 'finish',
          d: {
            h: document.body.scrollHeight
          }
        })
      },
      listenMsg: function(callback, t) {
        var _this = this
        if (t === 'ready' && _this.token && typeof(callback) === 'function') {
          callback({
            token: _this.option.token,
            theme: _this.option.theme,
            spId: _this.option.spId,
            businessType: _this.option.businessType,
            color: _this.option.color,
            v: _this.option.version
          })
        } else if (t === 'ready' && !_this.option.token) {
          window.addEventListener('message', function(e) {
            if (!e.data.fi) return;
            else _this.option = Object.assign(_this.option, e.data.fi)
            _this.setTheme(_this.option.theme, _this.option.color, _this.option.v)
            if (typeof callback === 'function') callback(e.data.fi)
          }, false);
        } else {
          window.addEventListener('message', function(e) {
            if (!e.data.fi) return;
            if (typeof(callback) === 'function') callback(e.data.fi)
          }, false);
        }
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
        if (typeof fn === 'function' && exception) fn()
      },
      hashNavigation: function(obj, fn) {
        if (!obj.name) return
        this.sendMessage({
          t: 'hashNavigation',
          d: {
            name: obj.name,
            routerUrl: obj.routerUrl || ''
          }
        })
        this.listenMsg(fn, 'hashNavigation')
      },
      loginOut: function() {
        this.sendMessage({
          t: 'loginOut'
        })
      },
      goto: function(routerUrl) {
        console.log(routerUrl)
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
          // var url = `https://unpkg.com/mint-ui/lib/style.css`
          var url = `https://unpkg.com/mint-ui@2.2.13/lib/style.css`
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
      }
    }
  }
  flaginfo = new flaginfo()

  flaginfo.initFunction()
  window.onload = function(e) {
    flaginfo.init()
  }
  return flaginfo;
}));
