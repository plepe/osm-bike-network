require('leaflet')
require('leaflet-polylinedecorator')
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
      14: '(way[highway~"^(cycleway|living_street)$"];way[cycleway];way["cycleway:left"];way["cycleway:right"];way["cycleway:both"];)'
    },
    minZoom: 10,
    feature: {
      markerSymbol: null,
      "style": {
          "width": "{% if tags.highway == 'cycleway' %}{% if tags.oneway %}0{% else %}2{% endif %}{% elseif tags.highway == 'living_street' %}5{% else %}0{% endif %}",
          "color": "{% if tags.highway == 'cycleway' %}blue{% elseif tags.highway == 'living_street' %}green{% else %}black{% endif %}",
          "fill": "false",
          "pattern": "{% if tags.highway == 'cycleway' and tags.oneway in ['yes', '1'] %}arrowHead{% endif %}",
          "pattern-repeat": "25",
          "pattern-path-width": "0",
          "pattern-path-color": "blue",
          "pattern-path-pixelSize": "3",
          "pattern-path-fillOpacity": "1",
          "pattern-polygon": "true",
          "pattern-offset": "17",
      },
      "style:left": {
          "fill": "false",
          "width": "0",
          "pattern": "{% if attribute(tags, 'cycleway:left') in ['lane', 'opposite_lane', 'track', 'opposite_track'] or tags.cycleway in ['opposite_lane', 'opposite', 'opposite_track'] or attribute(tags, 'cycleway:both') in ['lane', 'track'] %}arrowHead{% endif %}",
          "pattern-repeat": "25",
          "pattern-path-width": "0",
          "pattern-path-color": "{% if attribute(tags, 'cycleway:left') in ['track', 'opposite_track'] or tags.cycleway in ['opposite_track'] or attribute(tags, 'cycleway:both') in ['track'] %}blue{% else %}red{% endif %}",
          "pattern-path-pixelSize": "3",
          "pattern-path-fillOpacity": "1",
          "pattern-polygon": "true",
          "pattern-lineOffset": "-3",
          "pattern-offset": "17",
          "pattern-angleCorrection": "{% if attribute(tags, 'cycleway:left') in ['opposite_lane', 'opposite_track'] or tags.cycleway in ['opposite_lane', 'opposite', 'opposite_track'] or attribute(tags, 'cycleway:both') in ['lane', 'track'] %}180{% else %}0{% endif %}"
      },
      "style:right": {
          "fill": "false",
          "width": "0",
          "pattern": "{% if attribute(tags, 'cycleway:right') in ['lane', 'opposite_lane', 'track', 'opposite_track'] or tags.cycleway in ['lane', 'track'] or attribute(tags, 'cycleway:both') in ['lane', 'track'] %}arrowHead{% endif %}",
          "pattern-repeat": "25",
          "pattern-path-width": "0",
          "pattern-path-color": "{% if attribute(tags, 'cycleway:right') in ['track', 'opposite_track'] or tags.cycleway in ['track'] or attribute(tags, 'cycleway:both') in ['track'] %}blue{% else %}red{% endif %}",
          "pattern-path-pixelSize": "3",
          "pattern-path-fillOpacity": "1",
          "pattern-polygon": "true",
          "pattern-lineOffset": "3",
          "pattern-offset": "17",
          "pattern-angleCorrection": "{% if attribute(tags, 'cycleway:right') in ['opposite_lane', 'opposite_track'] %}180{% else %}0{% endif %}"
      }
    }
  })

  overpassLayer.setQueryOptions({ date: dateSelector.value() })
  overpassLayer.addTo(map)

  dateSelector.on('change', (value) => {
    overpassLayer.setQueryOptions({ date: value })
  })
}
