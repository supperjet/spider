// 模块引入
var http = require('http')
var https = require('https')
var path = require('path')
var fs = require('fs')
var cheerio = require('cheerio')

// 如果是http站点，使用如下方式定义要爬取得url信息
// var opt = {
//   hostname: 'movie.douban.com',
//   path: '/top250'
// }

// 创建https get请求
spiderMovie(2)
function spiderMovie(index){
  https.get('https://movie.douban.com/top250?start='+index, function(res){
    var pageSize = 25
    var html = ''
    var movies = []
    res.setEncoding('utf-8')
    res.on('data', function(chunk){
      html += chunk
    })
    res.on('end', function(){
      var $ = cheerio.load(html)
      $('.item').each(function(){
        var picUrl = $('.pic img', this).attr('src')
        var movie = {
          title: $('.title', this).text(),
          star: $('.info .star .rating_num', this).text(),
          link: $('a', this).attr('href'),
          picUrl: picUrl
        }
        if(movie){
          movies.push(movie)
          downloadImg('./imgs/', movie.picUrl)
        }
      })
      console.log(movies)
      saveData('./data/data'+ (index / pageSize) + '.json', movies)
    }).on('error', function(err){
      console.log(err)
    })
  })
}

//保存数据到本地
function saveData(path, movies){
  //data: 保存数据的文件夹
  //movies: 电影信息数组
  //调用fs.writeFile(filename, data, [option], callback)
  //filename: 文件名称（包含路径）
  //data： 文件数据
  //[option]: encoding 或 flag 或 mode
  //callback
  fs.writeFile(path, JSON.stringify(movies, null, 4), function(err){
    if(err){
      return console.log(err)
    }
    console.log('Data saved')
  })
}

//下载图片
//imgDir： 存放图片的文件夹
//url: 图片的url地址
function downloadImg(imgDir, url){
  https.get(url, function(res){
    var data = '';
    res.setEncoding('binary')
    res.on('data', function(chunk){
      data += chunk
    })
    res.on('end', function(){
      fs.writeFile(imgDir + path.basename(url), data, 'binary', function(err){
        if(err){
          console.log(err)
        }
        console.log('Image downloaded:', path.basename(url))
      })
    })
  }).on('error', function(err){
    console.log(err)
  })
}

//创建爬取生成器
function* doSpider(x){
  var start = 0;
  console.log(start + '------------');
  while (start<x) {
    yield start
    spiderMovie(start);
    start += 25
  }
}

//执行爬取方法
for(var x of doSpider(250)){
  console.log(x)
}
