"use strict";
import countyGeoJsonFeature from "./USA_Counties_Generalized.json" assert {type: "json"};

var map = L.map('map').setView({lat: 39.50, lng: -98.35}, 5);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// var countyLayerStyle = {
//   // "color": "#ff7800",
//   "weight": 1.5,
//   "opacity": 0.30
// };

function getCountyPopulationColor(d) {
	return d > 10000000 ? '#800026' :
		d > 1000000  ? '#BD0026' :
		d > 500000  ? '#E31A1C' :
		d > 100000  ? '#FC4E2A' :
		d > 50000   ? '#FD8D3C' :
		d > 10000   ? '#FEB24C' :
		d > 1000   ? '#FED976' :
		'#FFEDA0';
}

function countyLayerStyle(feature) {
	return {
		fillColor: getCountyPopulationColor(feature.properties.POPULATION),
		weight: 1.5,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.5
	};
}

let geojson;
let selectedCountyLayer;
let highlightedCounty;

const highlightSelectedStyle = {
	weight: 3,
	color: '#666',
	dashArray: '',
	fillOpacity: 0.7
}

const secondaryHighlightSelectedStyle = {
	weight: 2,
	color: '#999',
	dashArray: '',
	fillOpacity: 0.4
}

let secondaryHighlightedCounties = [];
function highlightFeature(e) {
	const layer = e.target;
	layer.setStyle(highlightSelectedStyle);
	layer.bringToFront();
	selectedCountyLayer && selectedCountyLayer.bringToFront();

	if (selectedCountyLayer && layer != highlightedCounty) {
		secondaryHighlightedCounties.forEach(function(layer) {
			geojson.resetStyle(layer);
		});
		secondaryHighlightedCounties = [];
		highlightedCounty = layer;

		const highlightedLayerCenter = highlightedCounty.getCenter();
		let layersWithDistance = [];
		map.eachLayer(function(mapLayer) {
			if (mapLayer.getCenter && mapLayer != highlightedCounty) {
				const mapLayerCenter = mapLayer.getCenter();
				layersWithDistance.push({layer: mapLayer, distance: highlightedLayerCenter.distanceTo(mapLayerCenter)});
			}
		});
		layersWithDistance.sort(function(a, b) {
			return a.distance - b.distance;
		});

		let populationSum = 0;
		for (let i = 0; i < layersWithDistance.length; i++) {
			const layer = layersWithDistance[i].layer;
			populationSum += Number.parseInt(layer.feature.properties.POPULATION);

			if (populationSum < Number.parseInt(selectedCountyLayer.feature.properties.POPULATION)) {
				layer.setStyle(secondaryHighlightSelectedStyle);
				layer.bringToFront();
				secondaryHighlightedCounties.push(layer);
			} else {
				break;
			}
		}
	}
}

function resetHighlight(e) {
	const layer = e.target;
	if (layer != selectedCountyLayer) {
		geojson.resetStyle(layer);
	}
}

function onFeatureClicked(e) {
	if (selectedCountyLayer) {
		geojson.resetStyle(selectedCountyLayer);
	}

	selectedCountyLayer = e.target;
	selectedCountyLayer.setStyle(highlightSelectedStyle);
	selectedCountyLayer.bringToFront();
}

function onEachFeature(feature, layer) {
	const county = {layer: layer, feature: feature};
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: onFeatureClicked,
	});
	layer.bindPopup(feature.properties.STATE_NAME + " - " + feature.properties.NAME + " - " + Number.parseInt(feature.properties.POPULATION).toLocaleString());
}

geojson = L.geoJSON(countyGeoJsonFeature, {
	style: countyLayerStyle,
	onEachFeature: onEachFeature
}).addTo(map);