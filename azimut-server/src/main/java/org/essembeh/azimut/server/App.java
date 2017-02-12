package org.essembeh.azimut.server;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

public class App {

	private final List<Event> events = new CopyOnWriteArrayList<>();
	private final long eventMax;

	public App(long eventMax) {
		this.eventMax = eventMax;
	}

	synchronized public Event addEvent(Event e) {
		events.remove(e);
		events.add(e);
		while (events.size() > eventMax) {
			events.remove(0);
		}
		return e;
	}

	synchronized public Collection<Event> getEvents() {
		return Collections.unmodifiableCollection(events);
	}

	synchronized public Collection<Event> getEvents(String user) {
		return events.stream().filter(e -> e.getName().equals(user)).collect(Collectors.toSet());
	}

	synchronized public void removeOlderThat(long count, TimeUnit unit) {
		long minTimestamp = (System.currentTimeMillis() - unit.toMillis(count)) / 1000;
		events.removeIf(e -> e.getTimestamp() < minTimestamp);
	}
}
