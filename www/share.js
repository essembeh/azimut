
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
				console.log("Position shared");
				// Close modal
				$("#share-modal").modal("hide");
				refreshMap();
				DEFAULT_SHARE_USER = device;
				DEFAULT_SHARE_MESSAGE = message;
			} else {
				alert("Error sharing position (" + data.status + ")");
				console.log(JSON.stringify(data));
			}
		});
	}
}

function openShareDialog() {
	var shareDialog = bootbox.dialog({
		title: "Share your location",
		message: '<div class="row">  ' +
			'<div class="col-md-12"> ' +
			' <form class="form-horizontal" id="share-form"> ' +
			' <div class="form-group"> ' +
			'  <label class="col-md-4 control-label" for="share-device">Name</label> ' +
			'  <div class="col-md-8"> ' +
			'   <input id="share-device" name="share-device" type="text" placeholder="Your name (12 characters max, no space)" class="form-control input-md" required pattern="[a-zA-Z0-9-_]{1,12}" value="' + DEFAULT_SHARE_USER + '"/> ' +
			'  </div> ' +
			' </div> ' +
			' <div class="form-group"> ' +
			'  <label class="col-md-4 control-label" for="share-message">Message</label> ' +
			'  <div class="col-md-8"> ' +
			'   <input id="share-message" name="share-message" type="text" placeholder="You can leave a message (32 characters max)" class="form-control input-md" pattern=".{0,32}"  value="' + DEFAULT_SHARE_MESSAGE + '"/> ' +
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
				label: '<span class="glyphicon glyphicon-pushpin" aria-hidden="true"></span> Share',
				className: "btn-success",
				callback: function() {
					$('#share-form').find(':submit').click();
					return false;
				}
			},
			gps: {
				label: '<span class="glyphicon glyphicon-screenshot" aria-hidden="true"></span> Position',
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
	});
	shareDialog.init(function() {
		// Do not submit form, use shareFormSubmit instead
		$('#share-form').submit(function(event) {
			event.preventDefault();
			shareFormSubmit();
		});
		shareFormUpdatePosition();
	});
	shareDialog.on("shown.bs.modal", function() {
		shareDialog.attr("id", "share-modal");
	});
}
