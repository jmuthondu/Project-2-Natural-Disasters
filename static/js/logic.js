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
    }),
    darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: 'dark-v10',
        accessToken: API_KEY
    }),
    satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: 'satellite-streets-v11',
        accessToken: API_KEY
    });

/* dataLayers
 *  Description: a dictionary of different group layers for the different types of natural disasters
 *  - EARTHQUAKES: earthquake layer group
 *  - FLOODS: flood layer group
 *  - HURRICANES: hurricane layer group
 *  - TORNADOES: tornado layer group
 */
var dataLayers = {
    EARTHQUAKES: new L.LayerGroup(),
    FLOODS: new L.LayerGroup(),
    HURRICANES: new L.LayerGroup(),
    TORNADOES: new L.LayerGroup()
};

/* Map
 *  Description: initiate map with all layers and centered on North America
 */
var map = L.map("map", {
    center: [47.0479471, -121.2054656],
    zoom: 3,
    layers: [
        dataLayers.EARTHQUAKES,
        dataLayers.FLOODS,
        dataLayers.HURRICANES,
        dataLayers.TORNADOES
    ]
});

// Apply 'lightmap' tile layer to 'map'
// This starts the map static tile in web view
lightMap.addTo(map);

/* overlays
 *  Description: Dictionary of filters for natural disaster data layers
 */
var overlays = {
    "Earthquakes": dataLayers.EARTHQUAKES,
    "Floods": dataLayers.FLOODS,
    "Hurricanes": dataLayers.HURRICANES,
    "Tornadoes": dataLayers.TORNADOES
}

/* baseLayers
 *  Description: Dictionary of filters for map rasters
 */
var baseLayers = {
    "Light Map": lightMap,
    "Dark Map": darkMap,
    "Satellite": satelliteMap
}

/* Control Layer
 *  Description: Top right control box to filter natural disaster layers and type of map
 */
L.control.layers(baseLayers, overlays).addTo(map)

