function shareFormUpdatePosition() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			console.log("Received position: " + JSON.stringify(position));
			$("#share-lat").val(position.coords.latitude);
			$("#share-lon").val(position.coords.longitude);
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

function shareFormSubmit() {
	var id = $.trim($("#share-id").val());
	var message = $.trim($("#share-message").val());
	var lat = $("#share-lat").val();
	var lon = $("#share-lon").val();
	$.get(REST_API_SHARE, {id: id, message: message, lat: lat, lon: lon})
		.done(function(data) {
			console.log("Position shared");
			console.log("Position shared => " + id + ": " + message + " (" + lat + "/" + lon + ")");
			// Close modal
			$("#share-modal").modal("hide");
			refreshMap();
			DEFAULT_SHARE_ID = id;
			DEFAULT_SHARE_MESSAGE = message;
		}).fail(function(data) {
			alert("Error: " + data.responseText);
			console.log(data.responseText);
		});
}

function openShareDialog() {
	var shareDialog = bootbox.dialog({
				title : "Share your location",
				message : '<div class="row">  '
						+ '<div class="col-md-12"> '
						+ ' <form class="form-horizontal" id="share-form"> '
						+ ' <div class="form-group"> '
						+ '  <label class="col-md-4 control-label" for="share-id">Name</label> '
						+ '  <div class="col-md-8"> '
						+ '   <input id="share-id" name="share-id" type="text" placeholder="Your name (16 max alphanum characters only)" class="form-control input-md" required maxlength="16" pattern="[a-zA-Z0-9]+" value="' + DEFAULT_SHARE_ID + '"/> '
						+ '  </div> '
						+ ' </div> '
						+ ' <div class="form-group"> '
						+ '  <label class="col-md-4 control-label" for="share-message">Message</label> '
						+ '  <div class="col-md-8"> '
						+ '   <input id="share-message" name="share-message" type="text" placeholder="You can leave a message (32 characters max)" class="form-control input-md" maxlength="32" value="' + DEFAULT_SHARE_MESSAGE + '"/> '
						+ '  </div> '
						+ ' </div> '
						+ ' <div class="form-group"> '
						+ '  <label class="col-md-4 control-label" for="share-lat">Latitude</label> '
						+ '  <div class="col-md-8"> '
						+ '   <input id="share-lat" name="share-lat" type="text" placeholder="Your latitude" class="form-control input-md" required pattern="-?[0-9]+(\.[0-9]+)?" /> '
						+ '  </div> '
						+ ' </div> '
						+ ' <div class="form-group"> '
						+ '  <label class="col-md-4 control-label" for="share-lon">Longitude</label> '
						+ '  <div class="col-md-8"> '
						+ '   <input id="share-lon" name="share-lon" type="text" placeholder="Your longitude" class="form-control input-md" required required pattern="-?[0-9]+(\.[0-9]+)?" /> '
						+ '  </div> '
						+ ' </div> '
						+ ' <input type="submit" hidden="true" />'
						+ '</form> </div>  </div>',
				buttons : {
					share : {
						label : '<span class="glyphicon glyphicon-pushpin" aria-hidden="true"></span> Share',
						className : "btn-success",
						callback : function() {
							$('#share-form').find(':submit').click();
							return false;
						}
					},
					gps : {
						label : '<span class="glyphicon glyphicon-screenshot" aria-hidden="true"></span> Position',
						className : "btn-primary",
						callback : function() {
							shareFormUpdatePosition();
							return false;
						}
					},
					close : {
						label : '<span class="glyphicon glyphicon-remove-circle" aria-hidden="true"></span> Close',
						className : "btn-danger"
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
