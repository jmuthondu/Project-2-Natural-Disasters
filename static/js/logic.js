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
    return magnitude * 5000;
}

// Create and populate earthquakes layer group with leaflet circle layers
d3.json("/earthquakes").then(data => {
    console.log("called earthquake");
    data.forEach((point) => {
        dataLayers.EARTHQUAKES.addLayer(
            L.circle([point.latitude, point.longitude], {
                stroke: false,
                fillOpacity: 0.5,
                color: "red",
                fillColor: "red",
                radius: markerSize(point.magnitude)
            })
        )
    })
    console.log("Added earthquake layers");

    // render EARTHQUAKES circles to map
    dataLayers.EARTHQUAKES.addTo(map);
    console.log("Added earthquakes layers to map");
});

// Create and populate floods layer group with leaflet circle layers
d3.json("/floods").then(data => {
    console.log("Called floods");
    data.forEach(point => {
        dataLayers.FLOODS.addLayer(
            L.circle([point.latitude, point.longitude], {
                stroke: false,
                fillOpacity: 0.5,
                color: "blue",
                fillColor: "blue",
                radius: 100
            })
        )
    })
    console.log("Added flood layers");

    // render FLOODS to map
    dataLayers.FLOODS.addTo(map);
    console.log("Added floods layers to map");
})

// Create and populate tornado layer group with leaflet circle layers
d3.json("/tornado").then(data => {
    console.log("called tornado");
    data.forEach(point => {
        dataLayers.TORNADOES.addLayer(
            L.circle([point.slat, point.slon], {
                stroke: false,
                fillOpacity: 0.5,
                color: "yellow",
                fillColor: "yellow",
                radius: 100
            })
        )
    })
    console.log("added tornado layers");

    // render TORNADOES to map
    dataLayers.TORNADOES.addTo(map);
    console.log("added tornado layers to map");
})

// Create and populate hurricanes layer group with leaflet circle layers
d3.json("/hurricane").then(data => {
    console.log("called hurricanes")
    data.forEach(point => {
        dataLayers.HURRICANES.addLayer(
            L.circle([point.latitude, point.longitude], {
                stroke: false,
                fillOpacity: 0.5,
                color: "green",
                fillColor: "green",
                radius: 100
            })
        )
    })
    console.log("added hurricanes layers");

    // render HURRICANES to map
    dataLayers.HURRICANES.addTo(map);
    console.log("added hurricanes layers to map");
})


// mapRender
function mapRender(year) {

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
        changeMap: console.log("slider test")
    })
    .addTo(map);