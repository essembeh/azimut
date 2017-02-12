package org.essembeh.azimut.server;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;

/**
 * @author seb
 *
 */
public class AppOptions {
	private static final int DEFAULT_PORT = 8080;
	private static final int DEFAULT_HISTORY = 256;

	public static final String MAPPING = "m";
	public static final String ADDRESS = "a";
	public static final String PORT = "p";
	public static final String HISTORY = "h";
	public static final String KEEP = "k";

	private static final Options OPTIONS = new Options();
	static {
		OPTIONS.addOption(ADDRESS, "address", true, "Address");
		OPTIONS.addOption(PORT, "port", true, "Port (default: " + DEFAULT_PORT + ")");
		OPTIONS.addOption(MAPPING, "mapping", true, "Mapping property file");
		OPTIONS.addOption(HISTORY, "history", true, "History size (default: " + DEFAULT_HISTORY + " events)");
		OPTIONS.addOption(KEEP, "keep", true, "Remove events older than n days");
	}

	public static AppOptions parse(String... args) throws ParseException {
		CommandLineParser parser = new DefaultParser();
		return new AppOptions(parser.parse(OPTIONS, args));
	}

	private final CommandLine commandLine;

	public AppOptions(CommandLine commandLine) {
		this.commandLine = commandLine;
	}

	protected Optional<String> getOptionValue(String option) {
		if (commandLine.hasOption(option)) {
			return Optional.of(commandLine.getOptionValue(option));
		}
		return Optional.empty();
	}

	public void displayHelp() {
		HelpFormatter formatter = new HelpFormatter();
		formatter.setWidth(100);
		formatter.printHelp("azimut-server", OPTIONS);
	}

	public Optional<Path> getMapping() {
		return getOptionValue(MAPPING).map(Paths::get);
	}

	public int getPort() {
		return getOptionValue(PORT).map(Integer::parseInt).orElse(DEFAULT_PORT);
	}

	public Optional<String> getAddress() {
		return getOptionValue(ADDRESS);
	}

	public Optional<Integer> getKeepDays() {
		return getOptionValue(KEEP).map(Integer::parseInt);
	}

	public int getHistory() {
		return getOptionValue(HISTORY).map(Integer::parseInt).orElse(DEFAULT_HISTORY);
	}
}
