/* Map of GeoJSON data from MegaCities.geojson */

//function to instantiate the Leaflet map
function createMap(){
    //create the map and zooms it in to the US
    // var map = L.map('mapid').setView([39.82, -98.58], 3);
    var map = L.map('mapid', {
    center: [39.82, -98.58],
    zoom: 3,
    minZoom: 3

    });



L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '...',
}).addTo(map);

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};

function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};




function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 30;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};



//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    console.log(attribute);

    //create marker options
    var options = {
        fillColor: "#2ca25f",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>City:</b> " + feature.properties.City;

    var year = attribute.split("_")[1];
    popupContent += "<p><b>Air Quality Index " + "20" + year + ":</b> " + feature.properties[attribute];
    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};


//Step 1: Create new sequence controls
function createSequenceControls(map, attributes){
    //create range input element (slider)
    $('#sequenceControls').append('<input class="range-slider" type="range">');

     //set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });

    //appends button to div
    $('#sequenceControls').append('<button class="skip" id="reverse" </button>');
    $('#sequenceControls').append('<button class="skip" id="forward" </button>');

    //appends icons to buttons
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');

    //Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);
        updatePropSymbols(map, attributes[index]);
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();  
        updatePropSymbols(map, attributes[index]);

    });
};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.City + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Air Quality Index " + "20" + year + ":</b> " + layer.feature.properties[attribute];

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });

            //updates legend every time prop symbols are updated
            updateLegend(map, attribute); 
        };
    });
};

function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("AQI") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

function overlayData(map){
    //var stores the icon for the pollution sources
    var icon = L.icon({
        iconUrl: 'img/smokestack.png',
        iconSize:     [50, 50], // size of the icon
        popupAnchor: [-10,-10]
    });

    //var stores the pollution sources
    var scherer = L.marker([33.06259, -83.80388], {icon: icon}).bindPopup('<b>Pollution Source:</b> Scherer Power Plant'+ "<br>" + '<b>Metric Tons Released:</b> 20.5 Million'),
        alabama = L.marker([33.631013, -87.057016], {icon: icon}).bindPopup('<b>Pollution Source:</b> Alabama Power Company'+ "<br>" + '<b>Metric Tons Released:</b> 19.9 Million'),
        navajo = L.marker([36.903548, -111.390782], {icon: icon}).bindPopup('<b>Pollution Source:</b> Navajo Power Plant'  + "<br>" + '<b>Metric Tons Released:</b> 17.2 Million'),
        gibson = L.marker([38.372031, -87.767415], {icon: icon}).bindPopup('<b>Pollution Source:</b> Gibson Power Plant'+ "<br>" + '<b>Metric Tons Released:</b> 16.3 Million'),
        washington = L.marker([29.484399, -95.62942], {icon: icon}).bindPopup('<b>Pollution Source:</b> W.A. Parish Power Plant'+ "<br>" + '<b>Metric Tons Released:</b> 16.1 Million'),
        rockport = L.marker([37.92739, -87.038363], {icon: icon}).bindPopup('<b>Pollution Source:</b> Rockport Power Plant'+ "<br>" + '<b>Metric Tons Released:</b> 15.8 Million'),
        bowen = L.marker([34.113739, -84.925529], {icon: icon}).bindPopup('<b>Pollution Source:</b> Bowen Power Plant'+ "<br>" + '<b>Metric Tons Released:</b> 15.6 Million'),
        bruce= L.marker([40.630728, -80.42155], {icon: icon}).bindPopup('<b>Pollution Source:</b> Bruce Mansfield Power Plant'+ "<br>" + '<b>Metric Tons Released:</b> 15.6 Million'),
        gavin = L.marker([38.94229, -82.112083], {icon: icon}).bindPopup('<b>Pollution Source:</b> Gavin Power Plant'+ "<br>" + '<b>Metric Tons Released:</b> 15.6 Million'),
        calaveras = L.marker([29.289989, -98.353913], {icon: icon}).bindPopup('<b>Pollution Source:</b> Calaveras Power Station'+ "<br>" + '<b>Metric Tons Released:</b> 15.4 Million');

    //converts sources into layer
    var powerPlants = L.featureGroup([scherer, alabama, navajo, gibson, washington, rockport, bowen, bruce,
        gavin, calaveras]);


    //provides styling name for layer
    var overlayMaps = {
        "Pollution Sources" : powerPlants
    };

    //adds control to map
    var layerControls = L.control.layers(null, overlayMaps).addTo(map);

    //creates popup on panel when overlay is activated
    map.on('overlayadd', function(e){
        console.log(e);
        $("#textPanel").empty();
        $("#textPanel").append('Click on the smokestacks to see what the largest sources of green house gas emmisions in the US are!');
    });
    
    //deletes popup when overlay is removed
    map.on('overlayremove', function(){
        $('#textPanel').empty();
    });
    

}


function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'

        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="80px">';

             //array of circle names to base loop on
            //object to base loop on...replaces Example 3.10 line 1
        var circles = {
            max: 20,
            mean: 40,
            min: 60
        };

        //loop to add each circle and text to svg string
        for (var circle in circles){
            //circle string
            svg += '<circle class="legend-circle" id="' + circle + '" fill="#2ca25f" fill-opacity="0.8" stroke="#000000" cx="38"/>';

            //text string
            svg += '<text id="' + circle + '-text" x="75" y= "' + (circles[circle] + 11) + '"></text>';
        };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());
    //updates legend when legend is created
    updateLegend(map, attributes[0]);
};

//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

//Example 3.7 line 1...Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend
    var year = attribute.split("_")[1];
    var content = "<b>Air Quality Index in " + "20" + year;

    //replace legend content
    $('#temporal-legend').html(content);

    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);

    for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        //Step 3: assign the cy and r attributes
        $('#'+key).attr({
            cy: 74 - radius,
            r: radius
        });
         //Step 4: add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100);
    };
    };


//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/map.geojson", {
        dataType: "json",
        success: function(response){

             //create an attributes array
            var attributes = processData(response);

            //call function to create proportional symbols
            createPropSymbols(response, map, attributes);
            //call sequence function
            createSequenceControls(map, attributes);
            //call overlay function
            overlayData(map);
            //create legend
            createLegend(map, attributes);
        }
    });


};





$(document).ready(createMap);