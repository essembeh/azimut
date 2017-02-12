package org.essembeh.azimut.server;

import java.nio.file.Path;
import java.text.MessageFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Optional;

import com.google.gson.Gson;

import spark.Request;
import spark.Spark;

public class Launcher {

	private static final Gson GSON = new Gson();

	interface Routes {
		String ROOT = "/";
		String API = ROOT + "api/";
		String EVENTS = API + "events";
		String EVENTS_name = EVENTS + "/:name";
		String SHARE = API + "share";
		String WWW = ROOT + "www/";
	}

	public static void main(String[] args) throws Exception {
		AppOptions options = AppOptions.parse(args);

		Optional<Path> mapping = options.getMapping();
		DeviceMapper deviceMapper = new DeviceMapper(!mapping.isPresent());
		if (mapping.isPresent()) {
			deviceMapper.loadMapping(mapping.get());
		}

		App app = new App(options.getHistory());
		app.addEvent(new Event("Azimut", 48.8584, 2.2945, "Hello World ;)"));

		// Config
		Spark.port(options.getPort());
		options.getAddress().ifPresent(Spark::ipAddress);
		Spark.staticFiles.location("/public");

		Spark.before((i, o) -> log(i));

		// API /api/events
		Spark.get(Routes.EVENTS, (i, o) -> GSON.toJson(app.getEvents()));
		Spark.get(Routes.EVENTS_name, (i, o) -> GSON.toJson(app.getEvents(i.params(":name"))));

		// API /api/share
		Spark.before(Routes.SHARE, (i, o) -> {
			RequestHelper helper = RequestHelper.fromRequest(i);
			if (!helper.isValid()) {
				Spark.halt(403, "Invalid request");
			} else if (!deviceMapper.isAuthorized(helper.getId())) {
				Spark.halt(403, "Unauthorized id");
			}
		});
		Spark.get(Routes.SHARE, (i, o) -> {
			RequestHelper helper = RequestHelper.fromRequest(i);
			Event event = new Event(deviceMapper.getName(helper.getId()), helper.getLatitude(), helper.getLongitude(), helper.getMessage());
			return GSON.toJson(app.addEvent(event));

		});
		// www root or API traccar
		Spark.get(Routes.ROOT, (i, o) -> {
			o.redirect(traccarRedirect(i).orElseGet(() -> wwwRedirect(i)));
			return null;
		});

		// Exceptions
		Spark.exception(Exception.class, (e, i, o) -> {
			o.body(e.getMessage());
			o.status(500);
		});
		Spark.awaitInitialization();
		System.out.println("Webserver listening on port: " + Spark.port());

		if (options.getKeepDays().isPresent()) {
			EventCleaner cleaner = new EventCleaner(app, options.getKeepDays().get());
			cleaner.schedule();
		}
	}

	private static Optional<String> traccarRedirect(Request req) {
		if (req.queryMap().hasKey("id") && req.queryMap().hasKey("lat") && req.queryMap().hasKey("lon")) {
			String out = Routes.SHARE + "?" + req.queryString();
			return Optional.of(out);
		}
		return Optional.empty();
	}

	private static String wwwRedirect(Request req) {
		String out = Routes.WWW;
		if (req.queryString() != null) {
			out += "?" + req.queryString();
		}
		return out;
	}

	private static void log(Request req) {
		String message = MessageFormat.format("{0}: {1} {2}", SimpleDateFormat.getDateTimeInstance().format(new Date()), req.pathInfo(), req.queryString());
		System.out.println(message);
	}
}
