const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const express = require("express");
const {clearStr} = require("./utils");
const router = express.Router()

router.get("/", async (req, res) => {
    //创建一个Browser浏览器实例，并设置相关参数
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--start-maximized','--no-sandbox'],
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
            id: $(".name a").attr('href').split("/").slice(3,4)[0]
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
            id: $("a.nbg").attr('href').split("/").slice(3,4)[0]
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

    await browser.close()
})

module.exports = router

