const express = require("express");
const request = require("request");
const app = express();

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

const port = 3500;
const show = `服务器启动在localhost:${port}\n开放接口:\n歌手列表:\t/singerlist/:pagenum\n歌曲列表:\t/songlist/:singermid/:begin/:num\n真实url:\t/trulyurl/:songmid`;
app.listen(port, ()=>{console.log(show);});
