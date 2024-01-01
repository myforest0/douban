/**
 * 去除字符串前后空格和换行符
 * @param val
 * @returns {*}
 */
const clearStr = (val) => {
    return val.replace(/^\s+/, "").replace(/\s+$/, "").replace(/[\r\n]/g, "")
}

module.exports = {
    clearStr
}