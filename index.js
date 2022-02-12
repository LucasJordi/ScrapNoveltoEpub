const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const Epub = require("epub-gen");

function sleep(ms){
    return new Promise(r => setTimeout(r, ms));
}



novels=["https://readnovelfull.com/the-king-of-the-battlefield-v1.html#tab-chapters-title",
"https://readnovelfull.com/only-i-level-up-novel.html#tab-chapters-title","https://readnovelfull.com/lord-of-the-mysteries-v1.html#tab-chapters-title","https://readnovelfull.com/release-that-witch-v1.html#tab-chapters-title",
"https://readnovelfull.com/the-legendary-moonlight-sculptor.html#tab-chapters-title"]


async function scrap (novel) {
    const globalLink="https://readnovelfull.com"
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true)
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64; rv:96.0) Gecko/20100101 Firefox/96.0')
  await page.goto(novel);
  await page.deleteCookie()
  
  await sleep(2000)
    const sourceCode=await page.content()
    
    const $ = cheerio.load(sourceCode);
    const title=$("div.col-xs-12.col-sm-8.col-md-8.desc h3.title").text()
    
    const cover=$(".book > img:nth-child(1)").attr('src')
    const description=$('.desc-text').text()
    const author=$(".info > li:nth-child(2)").text()
    const chaps=$("a",".panel-body")
    console.log(title,cover,author)
    var dados=[]
    const bringChap=async (link)=>{   
        await browser.deleteCookie
        const page = await browser.newPage();
        await page.setJavaScriptEnabled(true)
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64; rv:96.0) Gecko/20100101 Firefox/96.0')
        
        await page.goto(link)  
        
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');
        
        const sourceCode=await page.content()
        const $ =cheerio.load(sourceCode);
        var chap        
        const title= "<h1>"+$("div.col-xs-12 > h2:nth-child(2)").text()+"</h1>"
        console.log(title)
        chap=title
        const content=$("p","#chr-content")
        content.each(function(){
            chap+="<p>"+$(this).html()+"</p>"
        })
        //console.log(chap)
        await page.deleteCookie()
        dados.push({title:$("div.col-xs-12 > h2:nth-child(2)").text(),data:chap})

        page.close()
        return chap

    }
    var links=[]
    chaps.each(async function(){
        const h=$(this).attr("href")
        links.push(globalLink+h)       

    })

    for (const link of links) {
        await bringChap(link)

    }

    const option = {
        title: title,
        author: author, 
        cover: cover, 
        content:dados
        
    };
    new Epub(option, "./"+title+".epub");

    
    browser.close()
}

(async ()=>{
    
    for (const novel of novels) {
    await scrap(novel)

}
})()