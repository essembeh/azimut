<?php
require(dirname(__FILE__)."/config.php");

class AzimutDatabase {

  const REGEX_DEVICE = "/^[[:alnum:]-_]{1,12}$/";
  const REGEX_MESSAGE = "/^[^<>]{0,32}$/";
  const TABLE_EVENTS = "events";
  const FIELD_TIMESTAMP = "timestamp";
  const FIELD_DEVICE = "device";
  const FIELD_LATITUDE = "latitude";
  const FIELD_LONGITUDE = "longitude";
  const FIELD_MESSAGE = "message";

  var $database;

  function open() {
    if (!defined("DATABASE_PATH")) {
      throw new Exception("No databse defined");
    }
    if (!file_exists(DATABASE_PATH)) {
      throw new Exception("Cannot find database");
    }
    if (!isset($this->database)) {
      $this->database = new SQLite3(DATABASE_PATH);
      if (!isset($this->database)) {
        throw new Exception("Error opening database");
      }
    }
    return $this->database;
  }

  function close () {
    if (isset($this->database)) {
      $this->database->close();
      $this->database = null;
    }
  }

  function readEvents () {
    $this->open();
    $results = $this->database->query("SELECT * FROM ".AzimutDatabase::TABLE_EVENTS." ORDER BY timestamp DESC");
    $i = 0;
    $out = array();
    $row;
    while ($row = $results->fetchArray()) {
        $out[$i][AzimutDatabase::FIELD_TIMESTAMP] = $row[AzimutDatabase::FIELD_TIMESTAMP];
        $out[$i][AzimutDatabase::FIELD_DEVICE]    = $row[AzimutDatabase::FIELD_DEVICE];
        $out[$i][AzimutDatabase::FIELD_LATITUDE]  = $row[AzimutDatabase::FIELD_LATITUDE];
        $out[$i][AzimutDatabase::FIELD_LONGITUDE] = $row[AzimutDatabase::FIELD_LONGITUDE];
        $out[$i][AzimutDatabase::FIELD_MESSAGE]   = $row[AzimutDatabase::FIELD_MESSAGE];
        $i++;
    }
    return $out;
  }

  function checkValues($timestamp, $device, $latitude, $longitude, $message) {
    if (!is_integer($timestamp) || $timestamp <= 0) {
      throw new Exception("Timestamp must be a a positive integer");
    } elseif (!is_string($device) ||!preg_match(AzimutDatabase::REGEX_DEVICE, $device)) {
      throw new Exception("The field '".AzimutDatabase::FIELD_DEVICE."' must match ".AzimutDatabase::REGEX_DEVICE);
    } elseif (!is_string($message) ||!preg_match(AzimutDatabase::REGEX_MESSAGE, $message)) {
      throw new Exception("The field '".AzimutDatabase::FIELD_MESSAGE."' must match ".AzimutDatabase::REGEX_MESSAGE);
    } elseif (!is_real($latitude) || $latitude < -90 || $latitude > 90) {
      throw new Exception("The field '".AzimutDatabase::FIELD_LATITUDE."' must be a float between -90 and 90");
    } elseif (!is_real($longitude) || $longitude < -360 || $longitude > 360) {
      throw new Exception("The field '".AzimutDatabase::FIELD_LONGITUDE."' must be a float between -360 and 360");
    }
  }

  function writeEvent ($timestamp, $device, $latitude, $longitude, $message) {
    $this->checkValues($timestamp, $device, $latitude, $longitude, $message);
    $this->open();
    $query = "INSERT INTO ".AzimutDatabase::TABLE_EVENTS."('".AzimutDatabase::FIELD_TIMESTAMP."', '".AzimutDatabase::FIELD_DEVICE."', '".AzimutDatabase::FIELD_LATITUDE."', '".AzimutDatabase::FIELD_LONGITUDE."', '".AzimutDatabase::FIELD_MESSAGE."') ".
        "VALUES(".$timestamp.", '".SQLite3::escapeString($device)."', ".$latitude.", ".$longitude.", '".SQLite3::escapeString($message)."')";
    return $this->database->exec($query);
  }

  function purge ($oldestTimestamp) {
    if (!is_integer($oldestTimestamp)) {
      throw new Exception("Illegal argument when purging database");
    }
    $this->open();
      $query = "DELETE FROM ".AzimutDatabase::TABLE_EVENTS.
        " WHERE timestamp < ".$oldestTimestamp;
      return $this->database->exec($query);
  }

  function autoPurge () {
    if (defined("EVENTS_KEEP_DAYS")) {
      $oldestTimestamp = time() - (EVENTS_KEEP_DAYS * 24 * 60 * 60);
      return $this->purge($oldestTimestamp);
    }
    return false;
  }
}
?>
