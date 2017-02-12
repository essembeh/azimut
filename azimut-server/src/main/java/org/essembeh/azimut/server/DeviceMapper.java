package org.essembeh.azimut.server;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class DeviceMapper {

	private final Map<String, String> mapping = new HashMap<>();
	private final boolean allowUnknown;

	public DeviceMapper(boolean allowUnknown) {
		this.allowUnknown = allowUnknown;
	}

	public void register(String id, String name) {
		mapping.put(id, name);
	}

	public boolean isAuthorized(String id) {
		return allowUnknown || mapping.containsKey(id);
	}

	public String getName(String id) {
		String out = mapping.get(id);
		if (out == null) {
			if (allowUnknown) {
				out = id;
			} else {
				throw new IllegalStateException("Unknwon id");
			}
		}
		return out;
	}

	public void loadMapping(Path path) throws IOException {
		Properties properties = new Properties();
		try (InputStream is = Files.newInputStream(path)) {
			properties.load(is);
		}
		properties.stringPropertyNames().forEach(id -> register(id, properties.getProperty(id)));
	}
}
