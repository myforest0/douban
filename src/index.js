const express = require("express");
require("express-async-errors")

const app = express()
const play = require("./douban_play")
const movie = require("./douban_movie")
const tv = require("./douban_tv")
const chart = require("./douban_chart")
const search = require("./douban_search")

app.use("/api/play/v1", play)
app.use("/api/movie/v1", movie)
app.use("/api/tv/v1", tv)
app.use("/api/chart/v1", chart)
app.use("/api/search/v1", search)

app.use(function(err, req, res, next) {
    res.send({
        code: -1,
        msg: err.toString(),
        data: null
    })
});

app.listen(8000, () => {
    console.log('服务启动成功：http://127.0.0.1:8000')
})
