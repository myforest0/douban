const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const express = require("express");
const axios = require("axios")

const router = express.Router()

router.get("/list", async (req, res) => {
    let data = await axios("https://m.douban.com/rexxar/api/v2/movie/recommend", {
        method: 'get',
        headers: {
            Referer: "https://movie.douban.com/explore"
        },
        params: {
            refresh: 0,
            start: 0,
            count: 20,
            selected_categories: {},
            uncollect: false,
            playable: true,
            tags: undefined,
            ...req.query
        }
    });

    res.send({
        code: 0,
        msg: null,
        data: data.data
    })

})

module.exports = router

