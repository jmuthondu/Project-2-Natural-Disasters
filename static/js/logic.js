/* maps
 *  Description: define parameters of our map static tile
 *  - attribution: credits to OpenStreetMap and Mapbox
 *  - maxZoom: higher = city level detail / lower = continent level detail
 *  - id: id of map's static image
 *  - accessToken: our access token
 */
var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
        maxZoom: 18,
        id: 'light-v10',
        accessToken: API_KEY
    });

var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: 'dark-v10',
        accessToken: API_KEY
    });

var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: 'satellite-streets-v11',
        accessToken: API_KEY
    });

/* baseLayers
 *  Description: Dictionary of filters for map static tile
 */
var baseMaps = {
    "Light Map": lightMap,
    "Dark Map": darkMap,
    "Satellite": satelliteMap
}

/* dataLayers
 *  Description: a dictionary of different group layers for the different types of natural disasters
 *  - EARTHQUAKES: earthquake layer group
 *  - FLOODS: flood layer group
 *  - HURRICANES: hurricane layer group
 *  - TORNADOES: tornado layer group
 */
var dataLayers = {
    EARTHQUAKES: new L.layerGroup(),
    FLOODS: new L.layerGroup(),
    HURRICANES: new L.layerGroup(),
    TORNADOES: new L.layerGroup()
};

/* overlays
 *  Description: Overlays that can be toggled on/off
 */
var overlayMaps = {
    "Earthquakes": dataLayers.EARTHQUAKES,
    "Floods": dataLayers.FLOODS,
    "Hurricanes": dataLayers.HURRICANES,
    "Tornadoes": dataLayers.TORNADOES
}

/* Map
 *  Description: initiate map centered on North America
 */
var map = L.map("map", {
    center: [47.0479471, -121.2054656],
    zoom: 3,
    layers: [lightMap]
});

/* Control Layer
 *  Description: Top right control box to filter natural disaster layers and type of map
 */
L.control.layers(baseMaps, overlayMaps).addTo(map);

// Function to return marker size for earthquakes
function markerSize(magnitude) {
    return magnitude * 10000;
}

// Get year from epoch
var format = d3.timeFormat("%Y")

// Store all data - in the future we will create mongo queries for this for faster runtime
var earthquake_data = d3.json("/earthquakes");
var floods_data = d3.json("/floods");
var hurricanes_data = d3.json("/hurricane");
var tornado_data = d3.json("/tornado");

// mapRender
mapRender = function( {label, value, map, exclamation}) {
    // clear all layers
    dataLayers.EARTHQUAKES.clearLayers();
    dataLayers.FLOODS.clearLayers();
    dataLayers.HURRICANES.clearLayers();
    dataLayers.TORNADOES.clearLayers(); 

    // Create Earthquake layers
    earthquake_data.then(data => {
        data.forEach(point => {
            if(point.year == label){
                dataLayers.EARTHQUAKES.addLayer(
                    L.circle([point.latitude, point.longitude], {
                        stroke: false,
                        fillOpacity: 0.5,
                        color: "red",
                        fillColor: "red",
                        radius: markerSize(point.magnitude)
                    })
                )
            }
        })
    })

    // Create Floods layers
    floods_data.then(data => {
        data.forEach(point => {
            if(format(point.event_begin_time) == label){
                dataLayers.FLOODS.addLayer(
                    L.circle([point.latitude, point.longitude], {
                        stroke: false,
                        fillOpacity: 0.5,
                        color: "blue",
                        fillColor: "blue",
                        radius: 5000
                    })
                )
            }
        })
    })

    // Create and populate tornado layer group with leaflet circle layers
    tornado_data.then(data => {
        data.forEach(point => {
            if(format(point.date) == label){
                dataLayers.TORNADOES.addLayer(
                    L.circle([point.slat, point.slon], {
                        stroke: false,
                        fillOpacity: 0.5,
                        color: "yellow",
                        fillColor: "yellow",
                        radius: 7000
                    })
                )
            }
        })
    })

    // Create and populate hurricanes layer group with leaflet circle layers
    d3.json("/hurricane").then(data => {
        data.forEach(point => {
            if(point.season == label){
                dataLayers.HURRICANES.addLayer(
                    L.circle([point.latitude, point.longitude], {
                        stroke: false,
                        fillOpacity: 0.5,
                        color: "green",
                        fillColor: "green",
                        radius: 100
                    })
                )
            }
        })
    })
    
    // render all layers
    dataLayers.EARTHQUAKES.addTo(map);
    dataLayers.FLOODS.addTo(map);
    dataLayers.HURRICANES.addTo(map);
    dataLayers.TORNADOES.addTo(map);
}

// range of our timeline
var timelineItems = [];
for(var i = 1990; i <= 2019; i++){
    timelineItems.push(i);
}

//timelineSlider
L.control.timelineSlider({
        timelineItems: timelineItems,
        extraChangeMapParams: { },
        changeMap: mapRender
    })
    .addTo(map);