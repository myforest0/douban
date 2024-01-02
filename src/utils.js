/**
 * 去除字符串前后空格和换行符
 * @param val
 * @returns {*}
 */
const clearStr = (val) => {
    return val.replace(/^\s+/, "").replace(/\s+$/, "").replace(/[\r\n]/g, "")
}

/**
 * 替换？后面的参数
 * @param my_url
 * @returns {*}
 */
function delQuery(my_url){
    let qMark = my_url;
    if(my_url.indexOf("?") !== -1){
        qMark = my_url.split("?")[0];
    }
    return qMark;
}

module.exports = {
    clearStr,
    delQuery
}