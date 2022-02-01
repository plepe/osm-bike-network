require('leaflet')
const OverpassFrontend = require('overpass-frontend')
const OverpassLayer = require('overpass-layer')
const yaml = require('yaml')

const dateSelector = require('./dateSelector')

let map
let overpassFrontend

window.onload = function () {
  fetch('conf.yaml')
    .then(res => res.text())
    .then(body => {
      conf = yaml.parse(body)
      init()
    })

  dateSelector.init()

  const closeButton = document.createElement('a')
  closeButton.innerHTML = '✖'
  closeButton.className = 'closeButton'
  const disclaimer = document.getElementById('disclaimer')
  disclaimer.appendChild(closeButton)
  closeButton.onclick = () => disclaimer.parentNode.removeChild(disclaimer)
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
    query: {
      10: 'way[highway=cycleway];',
      14: '(way[highway=cycleway];way[cycleway];)'
    },
    minZoom: 10,
    feature: {
      markerSymbol: null,
      "style": {
          "width": "{% if tags.highway == 'cycleway' %}2{% elseif tags.highway == 'living_street' %}5{% else %}0{% endif %}",
          "color": "{% if tags.highway == 'cycleway' %}blue{% elseif tags.highway == 'living_street' %}lightgreen{% else %}black{% endif %}",
      }
    }
  })

  overpassLayer.setQueryOptions({ date: dateSelector.value() })
  overpassLayer.addTo(map)

  dateSelector.on('change', (value) => {
    overpassLayer.setQueryOptions({ date: value })
  })
}
