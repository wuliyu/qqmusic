const fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");
const download = require('download');
const songmid = /https:\/\/y.qq.com\/n\/yqq\/song\/([a-zA-Z0-9]{14})\.html/.exec(process.argv[2])[1];
const url = `https://u.y.qq.com/cgi-bin/musicu.fcg?g_tk=5381&loginUin=0&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0&data=%7B%22req%22%3A%7B%22module%22%3A%22CDN.SrfCdnDispatchServer%22%2C%22method%22%3A%22GetCdnDispatch%22%2C%22param%22%3A%7B%22guid%22%3A%226140418396%22%2C%22calltype%22%3A0%2C%22userip%22%3A%22%22%7D%7D%2C%22req_0%22%3A%7B%22module%22%3A%22vkey.GetVkeyServer%22%2C%22method%22%3A%22CgiGetVkey%22%2C%22param%22%3A%7B%22guid%22%3A%226140418396%22%2C%22songmid%22%3A%5B%22${songmid}%22%5D%2C%22songtype%22%3A%5B0%5D%2C%22uin%22%3A%220%22%2C%22loginflag%22%3A1%2C%22platform%22%3A%2220%22%7D%7D%2C%22comm%22%3A%7B%22uin%22%3A0%2C%22format%22%3A%22json%22%2C%22ct%22%3A20%2C%22cv%22%3A0%7D%7D`;
request.get(url, (error, response, body)=>{
    const purl = JSON.parse(body)["req_0"]['data']['midurlinfo'][0]["purl"];
	const guid = /guid=(\d+)/.exec(purl)[1];
	const vkey = /vkey=(\w+)/.exec(purl)[1];
    const trulyurl = `http://dl.stream.qqmusic.qq.com/M800${songmid}.mp3?vkey=${vkey}&guid=${guid}&fromtag=53`;
    request.get(`https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&platform=yqq.json&needNewCode=0&data=%7B%22songinfo%22%3A%7B%22method%22%3A%22get_song_detail_yqq%22%2C%22param%22%3A%7B%22song_type%22%3A0%2C%22song_mid%22%3A%22${songmid}%22%2C%22song_id%22%3A202658270%7D%2C%22module%22%3A%22music.pf_song_detail_svr%22%7D%7D`, (err, resp, body)=>{
		const songname = JSON.parse(body)["songinfo"]["data"]["extras"]["name"];
	    download(trulyurl).pipe(fs.createWriteStream(`${songname}.mp3`)).on("close", ()=>{
			console.log(`${songname}.mp3 OK`);
	    });
	});
});