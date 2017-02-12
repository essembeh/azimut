package org.essembeh.azimut.server;

import java.util.regex.Pattern;

import org.apache.commons.lang3.StringUtils;

import spark.QueryParamsMap;
import spark.Request;

public class RequestHelper {

	private static final int MESSAGE_MAXLEN = 32;
	private static final Pattern NAME_PATTERN = Pattern.compile("\\p{Alnum}{1,16}");
	private static final Pattern MESSAGE_PATTERN = Pattern.compile("\\p{Print}*");

	private static final String KEY_ID = "id";
	private static final String KEY_LAT = "lat";
	private static final String KEY_LON = "lon";
	private static final String KEY_MESSAGE = "message";

	public static RequestHelper fromRequest(Request r) {
		return new RequestHelper(r.queryMap());
	}

	private final QueryParamsMap map;

	public RequestHelper(QueryParamsMap map) {
		super();
		this.map = map;
	}

	public boolean isValid() {
		try {
			getId();
			getLatitude();
			getLongitude();
		} catch (IllegalStateException ignored) {
			return false;
		}
		return true;
	}

	public String getId() {
		String out = map.value(KEY_ID);
		if (out == null || !NAME_PATTERN.matcher(out).matches()) {
			throw new IllegalArgumentException("Invalid id");
		}
		return out;
	}

	public double getLatitude() {
		Double out = map.get(KEY_LAT).doubleValue();
		if (out == null || out < -90 || out > 90) {
			throw new IllegalArgumentException("Invalid latitude");
		}
		return out;
	}

	public double getLongitude() {
		Double out = map.get(KEY_LON).doubleValue();
		if (out == null || out < -360 || out > 360) {
			throw new IllegalArgumentException("Invalid longitude");
		}
		return out;
	}

	public String getMessage() {
		String out = map.value(KEY_MESSAGE);
		if (out != null && !MESSAGE_PATTERN.matcher(out).matches()) {
			throw new IllegalArgumentException("Invalid message");
		}
		return StringUtils.abbreviate(out, MESSAGE_MAXLEN);
	}
}
