(function(){var a,b,c,d,e,f,g,h,i,j,k,l,m;h=require("fs"),m=require("winston"),k=require("request"),d=require("cheerio"),j=require("inquirer"),b=null,a="http://www.my-free-mp3.com/mp3/",i=function(a,b){return m.info("Processing response..."),a&&m.error("Error: "+a),a&&process.exit(),m.info("Status Code: "+b.statusCode),200!==b.statusCode?(m.error("Invalid Status Code: "+b.statusCode),process.exit()):void 0},e=function(a,b,c){return console.log("Download started."),k.head(a,function(d,e,f){var g;return i(d,e),m.info("Write Data to File"),g=h.createWriteStream(b),k(a).pipe(g).on("close",function(){return c()})})},g=function(a,c){var d,f;return m.info("Start Track Download"),d={url:c,headers:{Accept:"*/*","User-agent":"Mozilla/5.0 (Macintosh)"}},m.info("Created download headers."),f=b,null==b&&(f=process.cwd()+"/"+a+".mp3"),m.info("Set path to "+f),e(d,f,function(){return console.log("Done.")})},c=function(a,b){return m.info("Ask User Input"),j.prompt([{type:"confirm",name:"ready",message:"Multiple files found. You want to choose?"},{when:function(a){return a.ready},type:"list",name:"song",message:"Choose a song to download:",choices:a}],function(c){var d,e;return c.ready&&(m.info("Received Choice: "+c.song),d=c.song,e=b[a.indexOf(d)],k(e,function(a,b,c){var e;return i(a,b),e=c.match(/window.open\("(.)*"\);/g)[0].slice(13,-4),m.info("Should Download: "+e),g(d,e)})),c.ready?void 0:console.log("Done.")})},l=function(a){return m.info("Fetch Source: "+a),k(a,function(a,b,e){var f,g,h,j,k;return i(a,b),f=d.load(e),m.info("Converted Source to Cheerio"),h=f(".playlist").find(".track"),j=[[],[]],k=j[0],g=j[1],m.info("Fetched Elements"),h.each(function(a,b){var c,d;return d=f(b).find(".name").text().trim(),c=f(b).find(".artist").text().trim(),k.push(d+" - "+c),g.push(f(b).find(".dw").attr("onclick").trim().slice(13,-12))}),k.length>0?c(k,g):console.log("No results found.")})},f=function(c,d){return null!=d&&(b=d),m.info("Download query: "+c),m.info("Path set: "+b),l(a+encodeURIComponent(c))},module.exports.download=f}).call(this);