var path = require('path')
var express = require('express')
var fs = require('fs')
var allTrailData = require('./TrailData.json')
var FavoritesData = require('./FavoriteData.json')
var exphbs = require('express-handlebars')

var app = express()

app.engine("handlebars", exphbs.engine({defaultlayout: "main"}))
app.set("view engine", "handlebars")

var port = process.env.PORT || 3000

app.use(express.json())
app.use(express.static('public'))


app.get('/', function(req, res, next){
    res.status(200).render("HomePage")
})

app.get('/AboutUs', function(req, res, next){
    res.status(200).render("AboutUs")
})

app.get('/Favorites', function(req, res, next){
    if(FavoritesData){
        res.status(200).render("FavoritesPage", {
            trails: FavoritesData.MyTrails
         })
    }
    else{
        next()
    }
})

app.get('/AllTrails', function(req, res, next){
    if(allTrailData){
        res.status(200).render("AllTrailsPage",{
            trails: allTrailData.Trails
        })
    }
    else{
        next()
    }
})

app.post('/:index/addFavorites', function (req, res, next) {
    var index = req.params.index.toLowerCase()
    var traildata = allTrailData.Trails[index]
    if (traildata) {
      if (traildata.url && traildata.trailName && traildata.address) {
        FavoritesData.MyTrails.push({
          trailName: traildata.trailName,
          url: traildata.url,
          address: traildata.address
        })
        
        fs.writeFile(
          "FavoriteData.json",
          JSON.stringify(FavoritesData, null, 2),
          function (err) {
            if (err) {
              console.log(err)
              res.status(500).send("Server Error")
            } else {
              res.status(200).send("Data Saved Successfully.")
            }
          }
        )
      } else {
        res.status(400).send("Invalid JSON URL and trail name")
      }
    } else {
      next()
    }
  })

app.delete('/:index/removeFavorite', function(req, res, next){
  var trailIndex = req.params.index
  if(FavoritesData){
    if(trailIndex >= 0 && trailIndex < FavoritesData.MyTrails.length){
      FavoritesData.MyTrails.splice(trailIndex,1)
      fs.writeFile(
        "./FavoriteData.json",
        JSON.stringify(FavoritesData, null, 2),
        function (err) {
          if (err) {
            res.status(500).send("Server Error")
          } else {
            res.status(200).send("Data Deleted Successfully.")
          }
      })
    }
    else{
      res.status(400).send("Invalid Index")
    }
  }
  else
    next()
})

app.get('*', function (req, res) {
    res.status(404).render("404Page", {url: req.originalUrl})
})

app.listen(port, function () {
    console.log("== Server is listening on port", port)
})