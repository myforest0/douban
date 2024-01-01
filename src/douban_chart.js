const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const express = require("express");
const router = express.Router()


/**
 * 去除字符串前后空格和换行符
 * @param val
 * @returns {*}
 */
const clearStr = (val) => {
    return val.replace(/^\s+/,"").replace(/\s+$/,"").replace(/[\r\n]/g,"")
}

router.get("/", async (req, res) => {
    //创建一个Browser浏览器实例，并设置相关参数
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--start-maximized'],
        ignoreDefaultArgs: ['--enable-automation']
    });
    //创建一个Page实例
    const page = await browser.newPage();
    //跳转JD首页
    await page.goto("https://movie.douban.com/chart");
    //等待元素加载成功
    await page.waitForSelector('#listCont2 li', {timeout: 10000});
    //获取元素innerText属性
    const list = await page.$$eval('#listCont2 li', eles => eles.map(ele => ele.outerHTML));

    const mvWeek = []
    const rankList = []

    for (let i = 0; i < list.length; i++) {
        const $ = cheerio.load(list[i])

        mvWeek.push({
            no: $('.no').text(),
            name: clearStr($(".name a").text()),
            href: $(".name a").attr('href'),
        })


    }

    await page.waitForSelector('.article .indent>div table', {timeout: 10000});
    //获取元素innerText属性
    const list2 = await page.$$eval('.article .indent>div table', eles => eles.map(ele => ele.outerHTML));

    for (let i = 0; i < list2.length; i++) {
        const $ = cheerio.load(list2[i])
        rankList.push({
            img: $('a.nbg img').attr("src"),
            title: $("a.nbg").attr('title'),
            href: $("a.nbg").attr('href'),
            title2: clearStr($(".pl2 a span").text()),
            info: $(".pl2 p.pl").text(),
            rating_nums: $(".star .rating_nums").text(),
            rating_count: $(".star .pl").text(),
        })


    }
    res.send({
        code: 0,
        msg: null,
        data: {
            mvWeek,
            rankList
        }
    })

    browser.close()
})

module.exports = router

