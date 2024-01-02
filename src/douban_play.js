const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const express = require("express");
const {clearStr, getQMark} = require("./utils");
const router = express.Router()

router.get("/video_play_url", async (req, res) => {
    //"https://movie.douban.com/subject/34825964/"
    const {id} = req.query
    //创建一个Browser浏览器实例，并设置相关参数
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--start-maximized', '--no-sandbox'],
        ignoreDefaultArgs: ['--enable-automation']
    });
    //创建一个Page实例
    const page = await browser.newPage();
    //跳转JD首页
    await page.goto('https://movie.douban.com/subject/'+id);
    // 获取播放源
    const episodeMapList = []
    try {
        //等待元素加载成功
        await page.waitForSelector('.bs li', {timeout: 10000});
        //获取元素innerText属性
        const list = await page.$$eval('.bs li', eles => eles.map(ele => ele.innerHTML));
        for (let i = 0; i < list.length; i++) {
            const $ = cheerio.load(list[i])

            await page.click(`.bs li:nth-child(${i + 1}) a`)

            await page.waitForSelector('#tv-play-source .episode-list a');

            let episodeList = await page.$$eval("#tv-play-source .episode-list a", eles => eles.map(ele => ele.outerHTML))

            episodeList = episodeList.map(el => {

                const $ = cheerio.load(el)

                return {
                    href: getQMark(decodeURIComponent($("a").attr("href").replace("https://www.douban.com/link2/?url=", ""))),
                    text: $("a").text(),
                }
            })


            episodeMapList.push({
                episodeList,
                dataCn: $("a.playBtn").attr("data-cn"),
            })
        }
        // console.log('episodeMapList', JSON.stringify(episodeMapList))
    }catch (e) {
        console.log('播放源为空', e)
    }

    await page.waitForSelector('.more-actor', {timeout: 10000});
    await page.click(".more-actor")
    await page.waitForSelector('#content', {timeout: 10000});
    const data = await page.$eval('#content', el => el.innerHTML);

    const $ = cheerio.load(data);

    res.send({
        code: 0,
        msg: null,
        data: {
            title: clearStr($("h1 span[property=v\\:itemreviewed]").text()),
            year: clearStr($("h1 .year").text().replace(/[()]/g, "")),
            href: $("#mainpic a.nbgnbg").attr("href"),
            img: $("#mainpic a img").attr("src"),
            info: $("#info").text().split("\n").map((item)=> clearStr(item).replace("更多...", "")).filter(item => !!item),
            rating_num: $(".rating_num").text(),
            desc: clearStr($("#link-report-intra span[property=v\\:summary]").text().split("\n").filter(item => !!clearStr(item))[0]),
            episodeMapList
        }
    })

    await browser.close()
})

module.exports = router

