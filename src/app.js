require('leaflet')
const OverpassFrontend = require('overpass-frontend')
const OverpassLayer = require('overpass-layer')
const yaml = require('yaml')

let map
let overpassFrontend

window.onload = function () {
  fetch('conf.yaml')
    .then(res => res.text())
    .then(body => {
      conf = yaml.parse(body)
      init()
    })
}

function init () {
  map = L.map('map').setView(conf.defaultView, conf.defaultView.zoom)

  overpassFrontend = new OverpassFrontend(conf.overpass.url, conf.overpass.options)

  const osm_mapnik = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
  )
  osm_mapnik.addTo(map)

  const overpassLayer = new OverpassLayer({
    overpassFrontend,
    query: 'way[highway=cycleway];',
    minZoom: 10,
    feature: {
      style: {
        color: 'blue',
        width: 3,
        opacity: 1
      },
      markerSymbol: null,
      title: '{{ tags.name }}',
      body: function (ob) {
        return '<pre>' + JSON.stringify(ob.tags, null, '  ') + '</pre>'
      }
    }
  })
  overpassLayer.addTo(map)
}
