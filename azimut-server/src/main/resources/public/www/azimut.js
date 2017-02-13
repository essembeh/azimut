var L = window.L;

// Config
var ENABLE_LOCATION_RESOLVING = true;
var ENABLE_SHARE_FORM = true;
var MAPBOX_TOKEN = "pk.eyJ1IjoiYXppbXV0IiwiYSI6ImU5MmY0OTQzODQ2ZmU5MmQ2YThjNDM4OTIxMDdkZDA2In0.cIGIE_njjGcHDSfpB2U-8Q"
var REST_API_EVENTS = "../api/events";
var REST_API_SHARE = "../api/share";
var POSITION_DEFAULT = [ 43.604342, 1.443344 ];
var ZOOM_REVEAL = 12;
var ZOOM_DEFAULT = 4;
var DEFAULT_SHARE_ID = "";
var DEFAULT_SHARE_MESSAGE = "";

// Globals
var EVENTS = new Map();
var NOMINATIM_CACHE = new Map();
var MAP;

function getUrlParameter(key) {
	var pageUrl = decodeURIComponent(window.location.search.substring(1)), urlVariables = pageUrl.split('&'), pair, i;
	for (i = 0; i < urlVariables.length; i++) {
		var pair = urlVariables[i].split('=');
		if (pair[0] === key) {
			return pair[1] === undefined ? true : pair[1];
		}
	}
};

function revealElement(element) {
	if (element && typeof element === 'string') {
		if (EVENTS.has(element)) {
			revealElement(EVENTS.get(element));
		}
	} else if (element && element.hasOwnProperty("lat")&& element.hasOwnProperty("lon")) {
		if (element.hasOwnProperty("marker")) {
			element.marker.openPopup();
		}
		if (MAP.getZoom() == ZOOM_DEFAULT) {
			MAP.setZoom(ZOOM_REVEAL);
		}
		MAP.setView([element.lat, element.lon]);
	}
}

function updatePlaceName(tableRowId, nominatimResult) {
	if (nominatimResult && nominatimResult.hasOwnProperty("display_name")) {
		$("#" + tableRowId + " .az-event-place .az-event-place-name").html("<small>" + nominatimResult.display_name + "</small>");
		$("#" + tableRowId + " .az-event-place .az-event-place-latlon").hide({duration: 0, complete : function() {$("#" + tableRowId + " .az-event-place .az-event-place-name").show({duration: 500});}});
	}
}

function processEvent(event) {
	var date = new Date(event.timestamp * 1000);
	event.longDate = moment(date).format('LLL');
	event.shortDate = moment(date).fromNow();
	var latlon = [ event.lat, event.lon ];
	var tableRowId = "event-" + event.uid;
	var cleanMessage = "";
	if (event.message) {
		cleanMessage = event.message.replace(/<.*?>/, '');
	}

	// Create marker
	event.marker = L.marker(latlon).addTo(MAP).bindPopup("<i>" + event.shortDate + "</i><br/><b>" + event.name + "</b>: " + cleanMessage);

	// Update table
	var html = '<tr id="' + tableRowId + '" onclick="revealElement(\'' + event.uid + '\')">'
			+ '<td class="az-event-date col-md-1"><abbr title="' + event.longDate + '"><small>' + event.shortDate + '</small></abbr></td>'
			+ '<td class="az-event-name col-md-1"><small>' + event.name + '</small></td>' + '<td class="az-event-place col-md-4">'
			+ ' <span class="az-event-place-latlon"><small>' + latlon + '</small></span>'
			+ ' <span class="az-event-place-name" hidden="true"></span>'
			+ '</td>' 
			+ '<td class="az-event-message col-md-2"><small>' + cleanMessage + '</small></td>' 
			+ '</tr>';
	$("#events > tbody").prepend(html)

	// resolve lat lon
	if (ENABLE_LOCATION_RESOLVING && getUrlParameter("resolve") != "false") {
		var nominatimUrl = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + event.lat + "&lon=" + event.lon;
		if (NOMINATIM_CACHE.has(nominatimUrl)) {
			updatePlaceName(tableRowId, NOMINATIM_CACHE.get(nominatimUrl));
		} else {
			console.log("Nominatim request: " + nominatimUrl);
			$.getJSON(nominatimUrl, function(result) {
				NOMINATIM_CACHE.set(nominatimUrl, result);
				updatePlaceName(tableRowId, result);
			}).fail(function(result) {
				console.log("Error requesting place: " + nominatimUrl);
			});
		}
	}
}

function clearMap() {
	// Remove markers
	EVENTS.forEach(function(value, key, map) {
		MAP.removeLayer(value.marker);
	});
	// Remove events from table
	$("#events > tbody").empty();
	// Clear map
	EVENTS.clear();
}

function refreshMap() {
	clearMap();
	$.getJSON(REST_API_EVENTS)
		.done(function(data) {
			// Sort, oldest first
			data.sort(function(a, b) {
				return a.timestamp > b.timestamp;
			})
			var elementToReveal = null;
			$.each(data, function(key, event) {
				if (event.name.length > 0 && event.timestamp > 0 && event.uid.length > 0) {
					// Keep event
					EVENTS.set(event.uid, event);
					processEvent(event);
					elementToReveal = event;
				}
			});
			revealElement(elementToReveal);
		}).fail(function(data) {
			console.log("Error getting events: " + data.responseText)
		});
}

// Check share form disabled
if (!ENABLE_SHARE_FORM) {
	$("#share-button").remove();
}
// Init map
MAP = L.map('map', {
	center : POSITION_DEFAULT,
	zoom : ZOOM_DEFAULT
});
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + MAPBOX_TOKEN, { 
	maxZoom: 18, 
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
	id: 'mapbox.streets'}).addTo(MAP);

refreshMap();
