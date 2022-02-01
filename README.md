# osm-bike-network
Visualizes the bike network based on OpenStreetMap data. Optionally, it can show the development of the bike network too.

## INSTALLATION
```sh
git clone https://github.com/plepe/osm-bike-network
npm install
npm start
```

## HISTORIC DATA
To use osm-bike-network with historic data, you have to have a local extract of the OpenStreetMap data with full history.

First you have to download a .osh.pbf from the interal Geofabrik server: https://osm-internal.download.geofabrik.de/index.html. Also, you need [osmium](https://osmcode.org/osmium-tool/) installed.

Reduce to the extract to the region and include only interesting objects (The coordinates use minlon,minlat,maxlon,maxlat):
```sh
osmium extract --overwrite --with-history -b 16.1842,48.0960,16.5688,48.3047 country-internal.osh.pbf -o tmp1.osh.pbf
osmium tags-filter tmp1.osh.pbf w/highway=cycleway w/cycleway r/route=bicycle -o tmp2.osm
osmium getid --add-referenced --id-osm-file tmp2.osm --with-history tmp1.osm -o bike-data.osm.bz2
```

