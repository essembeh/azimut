var L = window.L;

// Config
var DISABLE_LOCATION_RESOLVING = false;
var MAPBOX_TOKEN = "pk.eyJ1IjoiYXppbXV0IiwiYSI6ImU5MmY0OTQzODQ2ZmU5MmQ2YThjNDM4OTIxMDdkZDA2In0.cIGIE_njjGcHDSfpB2U-8Q"
var REST_API_EVENTS = "api/events";
var REST_API_SHARE = "api/share";
var POSITION_DEFAULT = [43.604342, 1.443344];
var ZOOM_REVEAL = 12;
var ZOOM_DEFAULT = 4;

// Globals
var EVENTS = {};
var MARKERS = {};
var LOCATIONS = {};
var MAP = L.map('map', {
    center: POSITION_DEFAULT,
    zoom: ZOOM_DEFAULT
});

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

function updatePlaceName(tableRowId, latlon) {
    if (LOCATIONS[latlon]) {
        $("#" + tableRowId + " .az-event-place .az-event-place-name").html(LOCATIONS[latlon]);
        $("#" + tableRowId + " .az-event-place .az-event-place-latlon").hide({
            duration: 500,
            complete: function() {
                $("#" + tableRowId + " .az-event-place .az-event-place-name").show({
                    duration: 500
                });
            }
        });
        return true;
    }
    return false;
}

function logEvent(uid, event) {
    var date = new Date(event.timestamp * 1000);
    var longDate = moment(date).format('YYYY/MM/DD HH:mm:ss');
    var shortDate = moment(date).fromNow();
    var latlon = [event.latitude, event.longitude];
    var tableRowId = "event-" + uid;
    var message = event.message.replace(/<.*?>/, '');

    // Keep event
    EVENTS[uid] = event;

    // Add marker
    MARKERS[uid] = L.marker(latlon).addTo(MAP).bindPopup("<i>" + shortDate + "</i><br/><b>" + event.device + "</b>: " + message);

    // Update table

    var html = '<tr id="' + tableRowId + '" onclick="revealElement(\'' + uid + '\')">' +
        '<td class="az-event-date col-md-1"><abbr title="' + longDate + '">' + shortDate + '</abbr></td>' +
        '<td class="az-event-device col-md-1">' + event.device + '</td>' +
        '<td class="az-event-place col-md-4">' +
        ' <span class="az-event-place-latlon">' + latlon + '</span>' +
        ' <span class="az-event-place-name" hidden="true"></span>' +
        '</td>' +
        '<td class="az-event-message col-md-2">' + message + '</td>' +
        '</tr>';
    $("#events > tbody").prepend(html)

    // resolve lat lon
    if (!DISABLE_LOCATION_RESOLVING && getUrlParameter("resolve") != "false") {
        if (!updatePlaceName(tableRowId, latlon)) {
            var placeUrl = "http://nominatim.openstreetmap.org/reverse?format=json&lat=" + event.latitude + "&lon=" + event.longitude;
            console.log("Request location: " + placeUrl);
            $.getJSON(placeUrl, function(result) {
                event.place = result;
                if (result.display_name) {
                    LOCATIONS[latlon] = result.display_name;
                    updatePlaceName(tableRowId, latlon);
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
            var elementToReveal = null;
            $.each(data.result, function(key, event) {
                if (event.device.length > 0 && event.timestamp > 0) {
                    var uid = getUid(event);
                    if (!EVENTS[uid]) {
                        elementToReveal = event;
                        logEvent(uid, event);
                    }
                }
            });
            if (elementToReveal) {
                revealElement(elementToReveal);
            }
        } else {
            console.log(data.status)
        }
    });
}

function shareFormUpdatePosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            console.log("Received position: " + JSON.stringify(position));
            $("#share-latitude").val(position.coords.latitude);
            $("#share-longitude").val(position.coords.longitude);
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
            $("#share-latitude").val(POSITION_DEFAULT[0]);
            $("#share-longitude").val(POSITION_DEFAULT[1]);
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function shareFormValidate(device, message, latitude, longitude) {
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

function shareFormSubmit() {
    var dialog = this;
    console.log(typeof dialog);
    var device = $.trim($("#share-device").val());
    var message = $.trim($("#share-message").val());
    var latitude = $("#share-latitude").val();
    var longitude = $("#share-longitude").val();
    if (shareFormValidate(device, message, latitude, longitude)) {
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
                dialog.modal("hide");
            } else {
                alert("Error sharing position (" + data.status + ")");
                console.log(JSON.stringify(data));
            }
        });
    }
}

function openShareDialog() {
    bootbox.dialog({
        title: "Share your location",
        message: '<div class="row">  ' +
            '<div class="col-md-12"> ' +
            ' <form class="form-horizontal" id="share-form"> ' +
            ' <div class="form-group"> ' +
            '  <label class="col-md-4 control-label" for="share-device">Name</label> ' +
            '  <div class="col-md-8"> ' +
            '   <input id="share-device" name="share-device" type="text" placeholder="Your name" class="form-control input-md" required /> ' +
            '  </div> ' +
            ' </div> ' +
            ' <div class="form-group"> ' +
            '  <label class="col-md-4 control-label" for="share-message">Message</label> ' +
            '  <div class="col-md-8"> ' +
            '   <input id="share-message" name="share-message" type="text" placeholder="Your message" class="form-control input-md" required /> ' +
            '  </div> ' +
            ' </div> ' +
            ' <div class="form-group"> ' +
            '  <label class="col-md-4 control-label" for="share-device">Latitude</label> ' +
            '  <div class="col-md-8"> ' +
            '   <input id="share-latitude" name="share-latitude" type="text" placeholder="Your latitude" class="form-control input-md" required pattern="-?[0-9]+(\.[0-9]+)?" /> ' +
            '  </div> ' +
            ' </div> ' +
            ' <div class="form-group"> ' +
            '  <label class="col-md-4 control-label" for="share-longitude">Longitude</label> ' +
            '  <div class="col-md-8"> ' +
            '   <input id="share-longitude" name="share-longitude" type="text" placeholder="Your longitude" class="form-control input-md" required required pattern="-?[0-9]+(\.[0-9]+)?" /> ' +
            '  </div> ' +
            ' </div> ' +
            ' <input type="submit" hidden="true" />' +
            '</form> </div>  </div>',
        buttons: {
            share: {
                label: '<span class="glyphicon glyphicon-pushpin" aria-hidden="true"></span> Share location',
                className: "btn-success",
                callback: function() {
                    $('#share-form').find(':submit').click();
                    return false;
                }
            },
            gps: {
                label: '<span class="glyphicon glyphicon-screenshot" aria-hidden="true"></span> Get coordinates',
                className: "btn-primary",
                callback: function() {
                    shareFormUpdatePosition();
                    return false;
                }
            },
            close: {
                label: '<span class="glyphicon glyphicon-remove-circle" aria-hidden="true"></span> Close',
                className: "btn-danger"
            }
        }
    }).init(function() {
        // Do not submit form, use shareFormSubmit instead
        $('#share-form').submit(function(event) {
            event.preventDefault();
            shareFormSubmit();
        });
        shareFormUpdatePosition();
    });
}

// Init map
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + MAPBOX_TOKEN, {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets'
}).addTo(MAP);

// Refresh map every minute
setInterval(function() {
    refeshMap();
}, 60000);

refeshMap();
