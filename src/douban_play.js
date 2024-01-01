const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const express = require("express");
const router = express.Router()

router.get("/video_play_url", async (req, res) => {
    //"https://movie.douban.com/subject/34825964/"
    const {url} = req.query
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
    await page.goto(url);
    //等待元素加载成功
    await page.waitForSelector('.bs li', {timeout: 10000});
    //获取元素innerText属性
    const list = await page.$$eval('.bs li', eles => eles.map(ele => ele.innerHTML));

    const episodeMapList = []

    for (let i = 0; i < list.length; i++) {
        const $ = cheerio.load(list[i])

        page.click(`.bs li:nth-child(${i + 1}) a`)

        await page.waitForSelector('#tv-play-source .episode-list a');

        let episodeList = await page.$$eval("#tv-play-source .episode-list a", eles => eles.map(ele => ele.outerHTML))

        episodeList = episodeList.map(el => {

            const $ = cheerio.load(el)

            return {
                href: decodeURIComponent($("a").attr("href").replace("https://www.douban.com/link2/?url=", "")),
                text: $("a").text(),
            }
        })


        episodeMapList.push({
            episodeList,
            dataCn: $("a.playBtn").attr("data-cn"),
        })
    }
    // console.log('episodeMapList', JSON.stringify(episodeMapList))
    res.send({
        code: 0,
        msg: null,
        data: episodeMapList
    })

    await browser.close()
})

module.exports = router

