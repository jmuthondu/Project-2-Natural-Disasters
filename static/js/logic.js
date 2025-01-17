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
    TORNADOES: new L.layerGroup(),
    PLATES: new L.layerGroup()
};

/* overlays
 *  Description: Overlays that can be toggled on/off
 */
var overlayMaps = {
    "Earthquakes": dataLayers.EARTHQUAKES,
    "Floods": dataLayers.FLOODS,
    "Hurricanes": dataLayers.HURRICANES,
    "Tornadoes": dataLayers.TORNADOES,
    "Tectonic Plates": dataLayers.PLATES
};

/* Map
 *  Description: initiate map centered on North America
 */
var map = L.map("map", {
    center: [47.0479471, -121.2054656],
    zoom: 3,
    layers: [darkMap]
});

/* Control Layers
 *  Description: Top right control box to filter natural disaster layers and type of map and bottom left legend
 */
L.control.layers(baseMaps, overlayMaps).addTo(map);

/* Legend
 *  Description: Creating the legend for the map
 */
var legend = L.control({
    position: "bottomleft"
});

legend.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
    return div
}

legend.addTo(map);

d3.select(".legend").html(
    `
    <center>
    <b>Legend</b><br>
    <hr>
    <p class="earthquake">Earthquake</p>
    <p class="flood">Flood</p>
    <p class="tornado">Tornado</p>
    <p class="hurricane">Hurricane</p>
    </center>
    `
);

/* Earth Tectonic Plates
 *  Description: Add a layer for tectonic plates
 *
 *  Credit:
 *      - utilizes @fraxen's conversion of tectonic plates data into GeoJSON
 *          -(https: //github.com/fraxen/tectonicplates)
 */
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(platesUrl).then(data => {
    dataLayers.PLATES.addLayer(
        L.geoJSON(data, {
            style: {
                weight: 1,
                color: "orange"
            }
        })
    )
    dataLayers.PLATES.addTo(map)
});

/* markerSize
 *  Description: function to return a magnified size of an earthquake's magnitude for use of leaflet marker size
 */
function markerSize(magnitude) {
    return magnitude * 10000;
};

// d3 converters for epoch time
var dateFormat = d3.timeFormat("%x")
var fullDate = d3.timeFormat("%x %X")

/* updateLayers
 *  Description: function to update each disaster's layer by calling endpoint for year the slider is selecting.
 *                  - Now also updates charts that only show data
 */
function updateLayers(year){
    // clear all layers
    dataLayers.EARTHQUAKES.clearLayers();
    dataLayers.FLOODS.clearLayers();
    dataLayers.HURRICANES.clearLayers();
    dataLayers.TORNADOES.clearLayers();

    // Create Earthquake layers
    d3.json(`/earthquake/${year}`).then(data => {
        let damageReport = {
            damage_house: 0,
            destroyed_house: 0
        }

        data.forEach(point => {
            // Add earthquake layers
            dataLayers.EARTHQUAKES.addLayer(
                L.circle([point.latitude, point.longitude], {
                    stroke: false,
                    fillOpacity: 0.5,
                    color: "red",
                    fillColor: "red",
                    radius: markerSize(point.magnitude)
                }).bindPopup(
                    `<center>
                    <b>EARTHQUAKE</b><br>
                    Magnitude: ${point.magnitude}<br>
                    Date/Time: ${point.month}/${point.day}/${year} ${point.hour}:${point.minute}<br>
                    Coordinates: (${point.latitude}, ${point.longitude})<br>
                    Location: ${point.location}<br>
                    </center>`
                )
            )

            // Calculate damage report
            damageReport.damage_house += point["number of houses damaged"]
            damageReport.destroyed_house += point["number of houses destroyed"]
        })

        let earthquakeDmgChart = new Chart(document.getElementById("earthquake-dmg"), {
            type: 'horizontalBar',
            data: {
                datasets: [{
                    data: [damageReport.damage_house, damageReport.destroyed_house],
                    backgroundColor: ["#ff0000", "#008cff"]
                }],

                // These labels appear in the legend and in the tooltips when hovering different arcs
                labels: [
                    'Damaged Houses',
                    'Destroyed Houses',
                ]
            },
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: `Earthquake Damage Report in ${year}`
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Count"
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Damage Type"
                        }
                    }]
                }
            }
        })
    })

    // Create Floods layers
    d3.json(`/flood/${year}`).then(data => {
        let damageReport = {
            damage_property: 0,
            damage_crops: 0
        }

        data.forEach(point => {
            // Add marker to map
            dataLayers.FLOODS.addLayer(
                L.circle([point.latitude, point.longitude], {
                    stroke: false,
                    fillOpacity: 0.5,
                    color: "blue",
                    fillColor: "blue",
                    radius: 5000
                }).bindPopup(
                    `<center>
                    <b>FLOOD</b><br>
                    Date: ${dateFormat(point.date)}<br>
                    Start: ${fullDate(point.event_begin_time)}<br>
                    End: ${fullDate(point.event_end_time)}<br>
                    Coordinates: (${point.latitude}, ${point.longitude})<br>
                    <br>
                    <b><i>Damage Report</i></b><br>
                    Damaged Property: ${point.damage_property}<br>
                    Damaged Crops: ${point.damage_crops}
                    </center>`
                )
            )

            // Calculate damage
            damageReport.damage_property += point.damage_property;
            damageReport.damage_crops += point.damage_crops;
        })

        // Update damage report chart
        let floodDmgChart = new Chart(document.getElementById("flood-dmg"), {
            type: 'horizontalBar',
            data: {
                datasets: [{
                    data: [damageReport.damage_property, damageReport.damage_crops],
                    backgroundColor: ["#ff0000", "#008cff"]
                }],

                // These labels appear in the legend and in the tooltips when hovering different arcs
                labels: [
                    'Damaged Property ($)',
                    'Damaged Crops',
                ]
            },
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: `Flood Damage Report in ${year}`
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Count"
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Damage Type"
                        }
                    }]
                }
            }
        })
    })

    // Create and populate tornado layer group with leaflet circle layers
    d3.json(`/tornado/${year}`).then(data => {
        let damageReport = {
            injured: 0,
            fatalities: 0,
            property_loss: 0
        }

        data.forEach(point => {
            // Add marker to map
            dataLayers.TORNADOES.addLayer(
                L.circle([point.slat, point.slon], {
                    stroke: false,
                    fillOpacity: 0.5,
                    color: "yellow",
                    fillColor: "yellow",
                    radius: 6000
                }).bindPopup(
                    `<center>
                    <b>TORNADO</b><br>
                    F-scale: ${point.fscale}<br>
                    Date: ${dateFormat(point.date)}<br>
                    Start: (${point.slat}, ${point.slon})<br>
                    End: (${point.elat}, ${point.elon})<br>
                    Width: ${point.width}<br>
                    <br>
                    <b><i>Damage Report</i></b><br>
                    Injuries: ${point.injured}<br>
                    Fatalities: ${point.fatalities}<br>
                    Property Loss: ${point.property_loss}<br>
                    </center>`
                )
            );

            // Draws line from starting point to end point
            if (point.elat != 0) {
                dataLayers.TORNADOES.addLayer(
                    L.polyline([
                        [point.slat, point.slon],
                        [point.elat, point.elon]
                    ], {
                        color: "yellow"
                    })
                )
            }

            // Calculate damage
            damageReport.injured += point.injured;
            damageReport.fatalities += point.fatalities;
            damageReport.property_loss += point.property_loss;
        })

        // Update damage report chart
        let tornadoDmgChart = new Chart(document.getElementById("tornado-dmg"), {
            type: 'horizontalBar',
            data: {
                datasets: [{
                    data: [damageReport.injured, damageReport.fatalities, damageReport.property_loss],
                    backgroundColor: ["#ff0000", "#008cff", "#fbff00"]
                }],

                // These labels appear in the legend and in the tooltips when hovering different arcs
                labels: [
                    'Injuries',
                    'Fatalities',
                    'Property Loss ($)'
                ]
            },
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: `Tornado Damage Report in ${year}`
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Count"
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Damage Type"
                        }
                    }]
                }
            }
        })
    })

    // Create and populate hurricanes layer group with leaflet circle layers
    d3.json(`/hurricane/${year}`).then(data => {
        data.forEach(point => {
            dataLayers.HURRICANES.addLayer(
                L.circle([point.latitude, point.longitude], {
                    stroke: false,
                    fillOpacity: 0.5,
                    color: "green",
                    fillColor: "green",
                    radius: 10000
                }).bindPopup(
                    `<center>
                    <b>HURRICANE</b><br>
                    Name: ${point.name}<br>
                    Date: ${d3.isoParse(point.iso_time)}<br>
                    Time: ${point.time} ${point.time_zone}<br>
                    Coordinates: (${point.latitude}, ${point.longitude})<br>
                    Wind Speed: ${point.usa_wind} kts<br>
                    Pressure: ${point.usa_pressure}<br>
                    </center>`
                )
            )
        })
    })

    // render all layers
    dataLayers.EARTHQUAKES.addTo(map);
    dataLayers.FLOODS.addTo(map);
    dataLayers.HURRICANES.addTo(map);
    dataLayers.TORNADOES.addTo(map);
}

// mapRender
mapRender = function( {label, value, map, exclamation}) {
    updateLayers(label);
    updateCharts(label);
}

// Range of our timeline to use for the slider
var timelineItems = [];
for(var i = 1990; i <= 2019; i++){
    timelineItems.push(i);
}

// Add time slider to map
L.control.timelineSlider({
        timelineItems: timelineItems,
        extraChangeMapParams: { },
        changeMap: mapRender
    }).addTo(map);

// Updates charts data when slider on the map is changed
function updateCharts(year){
    // Update doughnut chart
    d3.json(`/${year}/counts`).then(function(data){
        //Donut of all the Disasters
        let ctx = document.getElementById('doughnut').getContext('2d');
        let myDoughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [data.eCount, data.fCount, data.tCount, data.hCount],
                    backgroundColor: ["#ff0000", "#008cff", "#fbff00", "#00c479"]
                }],

                // These labels appear in the legend and in the tooltips when hovering different arcs
                labels: [
                    'Earthquakes',
                    'Floods',
                    'Tornadoes',
                    'Hurricanes'
                ]
            },
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Doughnut Chart of # of Disasters Reported in North America in ${year}`
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });

    })

    // Update monthly line chart
    d3.json(`/${year}/counts/month`).then(function(data){
        //Line chart of all disasters
        let myLineChart = new Chart(document.getElementById("line-chart"), {
            type: 'line',
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{
                    data: data.flood,
                    label: "Floods",
                    borderColor: "#008cff",
                    fill: false
                }, {
                    data: data.tornado,
                    label: "Tornadoes",
                    borderColor: "#fbff00",
                    fill: false
                }, {
                    data: data.hurricane,
                    label: "Hurricanes",
                    borderColor: "#00c479",
                    fill: false
                }, {
                    data: data.earthquake,
                    label: "Earthquakes",
                    borderColor: "#ff0000",
                    fill: false
                }, ]
            },
            options: {
                title: {
                    display: true,
                    text: `# of Disasters Reported in North America in ${year} by Month`
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Month"
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "# of Natural Disasters Reported"
                        }
                    }]
                }
            }
        })
    });
}