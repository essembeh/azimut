var L = window.L;

var DISABLE_LOCATION_RESOLVING = false;
var ZOOM_REVEAL = 12;
var ZOOM_DEFAULT = 5;
var POSITION_DEFAULT = [46, 2];
var SHARE_DEFAULT_DEVICE = "Suryavarman";
var SHARE_DEFAULT_MESSAGE = "I'm here ;)";
var SHARE_DEFAULT_LOCATION = [13.4124693, 103.8669857];
var REST_API_EVENTS = "api/events";
var REST_API_SHARE = "api/share";
var MAPBOX_TOKEN = "pk.eyJ1IjoiYXppbXV0IiwiYSI6ImU5MmY0OTQzODQ2ZmU5MmQ2YThjNDM4OTIxMDdkZDA2In0.cIGIE_njjGcHDSfpB2U-8Q"
var EVENTS = {};
var MARKERS = {};
var LOCATIONS = {};
var MAP = L.map('map', {
  center: POSITION_DEFAULT,
  zoom: ZOOM_DEFAULT
});

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + MAPBOX_TOKEN, {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
  id: 'mapbox.streets'
}).addTo(MAP);


function getUrlParameter(key) {
  var pageUrl = decodeURIComponent(window.location.search.substring(1)),
    urlVariables = pageUrl.split('&'),
    pair,
    i;
  for (i = 0; i < urlVariables.length; i++) {
    var pair = urlVariables[i].split('=');
    if (pair[0] === key) {
      return pair[1] === undefined ? true : pair[1];
    }
  }
};

function getUid(event) {
  if (typeof event === 'object' && event.hasOwnProperty("device") && event.hasOwnProperty("timestamp")) {
    return event.device.replace(/[^a-zA-Z0-9]/, "") + "-" + event.timestamp;
  }
  return null;
}

function revealElement(element) {
  if (element && typeof element === 'string') {
    var uid = element;
    var marker = MARKERS[uid];
    if (marker) {
      marker.openPopup();
    }
    var event = EVENTS[uid];
    if (event) {
      MAP.setView([event.latitude, event.longitude]);
      if (MAP.getZoom() == ZOOM_DEFAULT) {
        MAP.setZoom(ZOOM_REVEAL);
      }
    }
  } else {
    revealElement(getUid(element));
  }
}

function logEvent(uid, event) {
  var date = new Date(event.timestamp * 1000);
  var latlon = [event.latitude, event.longitude];
  var tableRowId = "event-" + uid;
  var message = event.message.replace(/<.*?>/, '');

  // Keep event
  EVENTS[uid] = event;

  // Add marker
  MARKERS[uid] = L.marker(latlon).addTo(MAP).bindPopup("<i>" + moment(date).fromNow() + "</i><br/><b>" + event.device + "</b>: " + message);

  // Update table
  var html = "<tr id='" + tableRowId + "' onclick='revealElement(\"" + uid + "\")'>" +
    "<td class='event-date'> " + moment(date).format('LLL') + " </td>" +
    "<td class='event-device'>" + event.device + "</td>" +
    "<td class='event-place'>" + latlon + "</td>" +
    "<td class='event-message'>" + message + "</td>" +
    "</tr>";
  $("#events > tbody").prepend(html)

  // resolve lat lon
  if (!DISABLE_LOCATION_RESOLVING && getUrlParameter("resolve") != "false") {
    if (LOCATIONS[latlon]) {
      $("#" + tableRowId + " .event-place").html(LOCATIONS[latlon]);
    } else {
      var placeUrl = "http://nominatim.openstreetmap.org/reverse?format=json&lat=" + event.latitude + "&lon=" + event.longitude;
      $.getJSON(placeUrl, function(result) {
        var place = result.display_name;
        if (place.length > 0) {
          LOCATIONS[latlon] = place;
          $("#" + tableRowId + " .event-place").html(place);
        }
      }).fail(function() {
        console.log("Error requesting place");
      });
    }
  }

}

function refeshMap() {
  $.getJSON(REST_API_EVENTS, function(data) {
    if (data.status === "OK") {
      console.log("Received " + data.result.length + " events");
      data.result.sort(function(a, b) {
        return a.timestamp > b.timestamp;
      })
      $.each(data.result, function(key, event) {
        if (event.device.length > 0 && event.timestamp > 0) {
          var uid = getUid(event);
          if (!EVENTS[uid]) {
            logEvent(uid, event);
          }
        }
      });
      revealElement(data.result[data.result.length - 1]);
    } else {
      console.log(data.status)
    }
  });
}

function updateLatLon() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log("Received position: " + JSON.stringify(position));
      $("#share-latitude").attr("value", position.coords.latitude);
      $("#share-longitude").attr("value", position.coords.longitude);
    }, function(error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.log("User denied the request for Geolocation.");
          break;
        case error.POSITION_UNAVAILABLE:
          console.log("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          console.log("The request to get user location timed out.");
          break;
        case error.UNKNOWN_ERROR:
          console.log("An unknown error occurred.");
          break;
      }
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function validateShareForm(device, message, latitude, longitude) {
  // Check device
  var out = true;
  if (device == null || device.length == 0) {
    console.log("validation failed for device");
    out = false;
  }
  if (!$.isNumeric(latitude)) {
    console.log("validation failed for latitude: " + latitude);
    out = false;
  }
  if (!$.isNumeric(longitude)) {
    console.log("validation failed for longitude: " + longitude);
    out = false;
  }
  return out;
}

function shareLocation() {
  var values = $("#share-form").serializeArray();
  values.searchItem = function(key) {
    for (i = 0; i < this.length; i++) {
      if (this[i].name === key) {
        return this[i].value
      }
    }
    return null;
  }
  var device = $.trim(values.searchItem('share-device'));
  var message = $.trim(values.searchItem('share-message'));
  var latitude = values.searchItem('share-latitude');
  var longitude = values.searchItem('share-longitude');
  if (validateShareForm(device, message, latitude, longitude)) {
    console.log("Share location => " + device + ": " + message + " (" + latitude + "/" + longitude + ")");
    $.get(REST_API_SHARE, {
      device: device,
      message: message,
      latitude: latitude,
      longitude: longitude
    }).done(function(data) {
      if (data.status === "OK") {
        console.log("Position shared ");
        // Close modal
        $("#share-modal").modal("hide");
        refeshMap();
      } else {
        alert("Error sharing position (" + data.status + ")");
        console.log(JSON.stringify(data));
      }
    });
  }
}

// Init Share form
$("#share-device").attr("value", SHARE_DEFAULT_DEVICE);
$("#share-message").attr("value", SHARE_DEFAULT_MESSAGE);
$("#share-latitude").attr("value", SHARE_DEFAULT_LOCATION[0]);
$("#share-longitude").attr("value", SHARE_DEFAULT_LOCATION[1]);

// Get browser location on share model open
$('#share-modal').on('shown.bs.modal', function() {
  updateLatLon();
});

setInterval(function() {
  refeshMap();
}, 60000);
refeshMap();
