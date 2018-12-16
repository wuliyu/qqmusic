const express = require("express");
const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const app = express();

const port = 3500;
const show = `服务器启动在localhost:${port}\n`;

// 通过pagenum获取歌手列表
app.get('/singerlist/:pagenum', (req, res) => {
    const { pagenum } = req.params;
    const url = `https://szc.y.qq.com/v8/fcg-bin/v8.fcg?channel=singer&page=list&key=all_all_all&pagesize=100&pagenum=${pagenum}&format=json`;
    request.get(url, (error, response, body)=>{
        res.json(JSON.parse(body)["data"]["list"]);
    });
});

// 通过singermid,begin,num获取歌曲列表
app.get('/songlist/:singermid/:begin/:num', (req, res) => {
	const { singermid, begin, num } = req.params;
    const url = `https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg?format=json&singermid=${singermid}&order=listen&begin=${begin}&num=${num}&songstatus=1`;
    request.get(url, (error, response, body)=>{
		res.json(JSON.parse(body)["data"]["list"]);
    });
});

// 通过songmid获取歌曲真实url
app.get('/trulyurl/:songmid', (req, res) => {
	const { songmid } = req.params;
	const url = `https://u.y.qq.com/cgi-bin/musicu.fcg?g_tk=5381&loginUin=0&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0&data=%7B%22req%22%3A%7B%22module%22%3A%22CDN.SrfCdnDispatchServer%22%2C%22method%22%3A%22GetCdnDispatch%22%2C%22param%22%3A%7B%22guid%22%3A%226140418396%22%2C%22calltype%22%3A0%2C%22userip%22%3A%22%22%7D%7D%2C%22req_0%22%3A%7B%22module%22%3A%22vkey.GetVkeyServer%22%2C%22method%22%3A%22CgiGetVkey%22%2C%22param%22%3A%7B%22guid%22%3A%226140418396%22%2C%22songmid%22%3A%5B%22${songmid}%22%5D%2C%22songtype%22%3A%5B0%5D%2C%22uin%22%3A%220%22%2C%22loginflag%22%3A1%2C%22platform%22%3A%2220%22%7D%7D%2C%22comm%22%3A%7B%22uin%22%3A0%2C%22format%22%3A%22json%22%2C%22ct%22%3A20%2C%22cv%22%3A0%7D%7D`;
    request.get(url, (error, response, body)=>{
		const purl = JSON.parse(body)["req_0"]['data']['midurlinfo'][0]["purl"];
		const trulyurl = `http://dl.stream.qqmusic.qq.com/${purl}`;
    	res.send(trulyurl);
    });
});

// 搜索song
app.get('/song/:p/:w', (req, res) => {
    const { p, w } = req.params;
    const url = `https://c.y.qq.com/soso/fcgi-bin/client_search_cp?&p=1&n=100&w=%E5%91%A8%E6%9D%B0%E4%BC%A6&g_tk=5381&format=json`;
    request.get(url, (error, response, body)=>{
        const list = JSON.parse(body)["data"]["song"]["list"];
        res.json(list);
    });
});

// 通过pageno获取mv列表
app.get('/mvlist/:pageno', (req, res) => {
    const { pageno } = req.params;
    const url = `https://c.y.qq.com/mv/fcgi-bin/getmv_by_tag?g_tk=5381&loginUin=0&hostUin=0&format=json&notice=0&platform=yqq&needNewCode=0&type=2&year=0&area=0&tag=0&pageno=${pageno}&pagecount=100&otype=json&taglist=1`;
    request.get(url, (error, response, body)=>{
        const mvlist = JSON.parse(body)["data"]["mvlist"];
        res.json(mvlist);
    });
});

// 通过vid获取mv
app.get('/mv/:vid', (req, res) => {
    const { vid } = req.params;
    const url = `https://u.y.qq.com/cgi-bin/musicu.fcg?data=%7B%22getMvUrl%22%3A%7B%22module%22%3A%22gosrf.Stream.MvUrlProxy%22%2C%22method%22%3A%22GetMvUrls%22%2C%22param%22%3A%7B%22vids%22%3A%5B%22${vid}%22%5D%2C%22request_typet%22%3A10001%7D%7D%7D&g_tk=5381&loginUin=0&hostUin=0&format=json&notice=0&platform=yqq&needNewCode=0`;
    request.get(url, (error, response, body)=>{
        const mvlist = JSON.parse(body)["getMvUrl"]["data"][vid]["mp4"];
        res.json(mvlist);
    });
});

// 搜索mv
app.get('/mv/:p/:w', (req, res) => {
    const { p, w } = req.params;
    const url = `https://c.y.qq.com/soso/fcgi-bin/client_search_cp?t=12&p=1&n=100&w=周杰伦&format=json`;
    request.get(url, (error, response, body)=>{
        const list = JSON.parse(body)["data"]["mv"]["list"];
        res.json(list);
    });
});

// 天气接口
app.get('/weather7d/:cityname', (req, res) => {
    const { cityname } = req.params;
    fs.readFile("./city.json", (error, data) => {
        if (error) res.text("error");
        const citycode = JSON.parse(data)[cityname];
        request.get(`http://www.weather.com.cn/weather/${citycode}.shtml`, (err, response, body)=>{
            if (error) res.text("error");
            const lis = cheerio(body).find("#7d > .t li");
            const es = lis.map((i, e)=>({
                date: cheerio(e).find("h1").text(),
                weather: cheerio(e).find(".wea").text(),
                tem: cheerio(e).find(".tem").text().replace(/\n/g,""),
                wind: cheerio(e).find("i").text()
            }));
            result = [];
            for (let i=0;i<es.length;i++) { result.push(es[i]); }
            res.json(result);
        });
    });
});

app.listen(port, ()=>{console.log(show);});
