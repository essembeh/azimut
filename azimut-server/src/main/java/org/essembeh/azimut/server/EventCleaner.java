package org.essembeh.azimut.server;

import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.TimeUnit;

public class EventCleaner {

	public static final int DELAY = 60 * 60 * 1000; // 1 hour

	private final App app;
	private final int keepDays;

	public EventCleaner(App app, int keepDays) {
		this.app = app;
		this.keepDays = keepDays;
	}

	public void schedule() {
		Timer timer = new Timer("Event cleaner", true);
		timer.schedule(new TimerTask() {
			@Override
			public void run() {
				app.removeOlderThat(keepDays, TimeUnit.DAYS);
			}
		}, DELAY, DELAY);

	}

}
