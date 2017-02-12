package org.essembeh.azimut.server;

import java.util.UUID;

public class Event implements Comparable<Event> {

	private final long timestamp;
	private final String name;
	private final double lat;
	private final double lon;
	private final String message;
	private final String uid;

	public Event(String name, double lat, double lon, String message) {
		this(System.currentTimeMillis() / 1000, name, lat, lon, message);
	}

	public Event(long timestamp, String name, double lat, double lon, String message) {
		this.timestamp = timestamp;
		this.name = name;
		this.message = message;
		this.lat = lat;
		this.lon = lon;
		this.uid = UUID.randomUUID().toString();
	}

	public long getTimestamp() {
		return timestamp;
	}

	public String getName() {
		return name;
	}

	public String getMessage() {
		return message;
	}

	public double getLat() {
		return lat;
	}

	public double getLon() {
		return lon;
	}

	public String getUid() {
		return uid;
	}

	@Override
	public int compareTo(Event o) {
		return Long.compare(timestamp, o.timestamp);
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		long temp;
		temp = Double.doubleToLongBits(lat);
		result = prime * result + (int) (temp ^ (temp >>> 32));
		temp = Double.doubleToLongBits(lon);
		result = prime * result + (int) (temp ^ (temp >>> 32));
		result = prime * result + ((name == null) ? 0 : name.hashCode());
		result = prime * result + (int) (timestamp ^ (timestamp >>> 32));
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Event other = (Event) obj;
		if (Double.doubleToLongBits(lat) != Double.doubleToLongBits(other.lat))
			return false;
		if (Double.doubleToLongBits(lon) != Double.doubleToLongBits(other.lon))
			return false;
		if (name == null) {
			if (other.name != null)
				return false;
		} else if (!name.equals(other.name))
			return false;
		if (timestamp != other.timestamp)
			return false;
		return true;
	}

}
