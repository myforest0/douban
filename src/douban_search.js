const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const express = require("express");
const {clearStr} = require("./utils");
const router = express.Router()

router.get("/pc", async (req, res) => {
    const {search_text} = req.query
    //创建一个Browser浏览器实例，并设置相关参数
    const browser = await puppeteer.launch({
        headless: true, // false 才可以
        defaultViewport: null,
        args: ['--start-maximized','--no-sandbox'],
        ignoreDefaultArgs: ['--enable-automation']
    });
    //创建一个Page实例
    const page = await browser.newPage();
    //跳转JD首页
    await page.goto("https://search.douban.com/movie/subject_search?cat=1002&search_text=" + search_text);

    //等待元素加载成功
    await page.waitForSelector('#root .sc-bZQynM', {timeout: 10000})
    //获取元素innerText属性
    const list = await page.$$eval('#root .sc-bZQynM', eles => eles.map(ele => ele.innerHTML));

    const resMapList = []

    for (let i = 0; i < list.length; i++) {
        const $ = cheerio.load(list[i])

        resMapList.push({
            href: $('a.cover-link').attr('href'),
            img: $('a.cover-link img').attr('src'),
            title: $('.detail .title-text').text(),
            label: $('.detail .label').text(),
            rating_nums: $(".detail .rating .rating_nums").text(),
            rating_count: $(".detail .rating .pl").text(),
            abstract: $(".detail .abstract").text(),
            abstract_2: $(".detail .abstract_2").text(),
        })
    }
    res.send({
        code: 0,
        msg: null,
        data: resMapList
    })

    await browser.close()
})

router.get("/m", async (req, res) => {
    const {search_text} = req.query
    //创建一个Browser浏览器实例，并设置相关参数
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--start-maximized','--no-sandbox'],
        ignoreDefaultArgs: ['--enable-automation']
    });
    //创建一个Page实例
    const page = await browser.newPage();
    await page.goto("https://m.douban.com/search/?type=1002&query=" + search_text);
    //等待元素加载成功
    await page.waitForSelector('.search_results_subjects li', {timeout: 10000});
    await page.click('#more-search')
    await new Promise(r => setTimeout(r, 500))
    //等待元素加载成功
    await page.waitForSelector('.search_results_subjects li', {timeout: 10000});

    //获取元素innerText属性
    const list = await page.$$eval('.search_results_subjects li', eles => eles.map(ele => ele.innerHTML));

    const resMapList = []

    for (let i = 0; i < list.length; i++) {
        const $ = cheerio.load(list[i])

        resMapList.push({
            href: $('a').attr('href'),
            img: $('a img').attr('src'),
            title: $('.subject-info .subject-title').text(),
            rating: clearStr($(".subject-info .rating").text()),
        })
    }
    res.send({
        code: 0,
        msg: null,
        data: resMapList
    })

    await browser.close()
})

module.exports = router

