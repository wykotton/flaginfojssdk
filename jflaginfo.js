/*!
 * flaginfojdk.js v1.0.1
 * (c) 2018-2019 Evan You
 * Released under the MIT License.
 */

;(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) { // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) { // AMD / RequireJS
    define(factory);
  } else {
    root.fg = factory.call(root);
  }
}(this, function() {
  'use strict';
  function flaginfo() {
    var core_name = 'kot',
      core_version = "1.0.1";
    var getProperty = function(pArr) {
      for (var i = pArr.length - 1; i >= 0; i--) {
        fg['get' + pArr[i].substring(0, 1).toUpperCase() + pArr[i].substring(1)] = function(i) {
          return function() {
            var reqProperty = fg[pArr[i]] || fg.getQueryObject()[pArr[i]]
            if (!reqProperty) fg.msg('获取' + pArr[i] + '失败,请嵌入企业门户并在fg.ready回调用使用该方法')
            return reqProperty
          }
        }(i)
      }
    }
    return {
      initFunction: function() {
        getProperty(['token', 'theme', 'color', 'businessType', 'spId'])
      },
      init: function() {
        var initOption = {
          chalk: '',
          theme: 'default',
          origColor: '#409EFF'
        }
        this.__proto__ = Object.assign(this.__proto__, initOption)
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
            token: _this.token,
            theme: _this.theme,
            spId: _this.spId,
            businessType: _this.businessType,
            color: _this.color,
            v: _this.version
          })
        } else if (t === 'ready' && !_this.token) {
          window.addEventListener('message', function(e) {
            if (!e.data.fi) return;
            else _this.__proto__ = Object.assign(_this.__proto__, e.data.fi)
            _this.setTheme(_this.theme, _this.color, _this.v)
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
        window.parent.postMessage({
          fi: data
        }, '*');
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
        if (window.top === window) this.setTheme()
        else this.listenMsg(fn, 'ready')
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
      goto: function(routerUrl) {
        console.log(routerUrl)
      },
      // getTheme: function() {
      //   var reqTheme = this.theme || this.getQueryObject().theme
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
        if (reqTheme) this.theme = reqTheme
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = '/static/theme/' + this.theme + '/index.css';
        var href = document.getElementsByTagName('head')[0];
        document.head.appendChild(link)
          // 设置颜色
        if (reqColor && reqColor !== this.origColor) {
          this.setColor(reqColor, this.origColor, pmsVersion)
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
            var originalCluster = _this.getThemeCluster(_this.origColor.replace('#', ''))
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
        if (!this.chalk) {
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
      }
    }
  }
  flaginfo = new flaginfo()
  return flaginfo;
}));
fg.initFunction()
window.onload = function(e) {
  fg.init()
}
