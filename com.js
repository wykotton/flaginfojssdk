(function( window, undefined ) {
  var location = window.location,
  document = window.document,
  docElem = document.documentElement,
  core_name = 'kot',
  core_version = "2.0.0";
  pfg = {
    init: function() {
      // console.log(this)
    },
    listenMsg: function(dom, callback) {
      window.addEventListener('message', function(e) {
        if (dom && e.source != dom.contentWindow) return;
        if (typeof callback === 'function' && e.data.fi) callback(e.data.fi)
      }, false);
    },
    sendMessage: function(frame, data) {
      frame.postMessage({fi: data}, '*');
      // window.parent.postMessage(data,'*');
    },
    cookie: {
      set: function (name, value, days) {
        let d = new Date();
        let hostname = window.location.hostname
        let hostArr = hostname.split('.')
        let domain = hostArr.length < 3 ? hostname : (hostArr.splice(0, 1), hostArr.join('.'))
        d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
        window.document.cookie = name + '=' + value + ';path=/;domain=' + domain + ';expires=' + d.toGMTString();
      },
      get: function (name) {
        let v = window.document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return v ? v[2] : null;
      },
      delete: function (name) {
        this.set(name, '', -1);
      }
    }
  }
  if ( typeof module === "object" && typeof module.exports === "object" ) {
    module.exports = pfg;
  } else {
    if ( typeof define === "function" && define.amd ) {
      define( "pfg", [], function () { return pfg; } );
    }
  }
if ( typeof window === "object" && typeof window.document === "object" ) {
  window.pfg = pfg;
}
  pfg.init()
})( window );
