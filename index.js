const device = (/iphone|nokia|sony|ericsson|mot|samsung|sgh|lg|philips|panasonic|alcatel|lenovo|cldc|midp|wap|mobile/i.test(navigator.userAgent.toLowerCase())) ? 'app' : 'pc'
const flaginfo = require(`./dist/jflaginfo${device}.min.js`)
export default flaginfo
