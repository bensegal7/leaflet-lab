var mymap = L.map('mapid').setView([51.505, -0.09], 13);

//loads and displays tiles on map
L.tileLayer('https://api.mapbox.com/styles/v1/bensegal/ciyvu7j3f00522rpluhnjt9xu/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYmVuc2VnYWwiLCJhIjoiY2l5dnUxa3ZsMDA2djMzdXowbXo2ZmVlZyJ9.BQsnQ5YYhzzNHTH8a8wfUQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
    
}).addTo(mymap);

//displays clickable features on map
var marker = L.marker([51.5, -0.09]).addTo(mymap);

//creates circle with radius 500
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);


//creates polygon
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);

//attaches popup to vars
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//attaches popup to specific lat long
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(mymap);

var popup = L.popup();

//displays latlong wherever user clicks
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

mymap.on('click', onMapClick);
