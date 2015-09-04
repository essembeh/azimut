<?php
require(dirname(__FILE__)."/config.php");

class AzimutDatabase {

  const TABLE_EVENTS = "events";
  const KEY_TIMESTAMP = "timestamp";
  const KEY_DEVICE = "device";
  const KEY_LATITUDE = "latitude";
  const KEY_LONGITUDE = "longitude";
  const KEY_MESSAGE = "message";

  var $database;

  function open() {
    defined("DATABASE_PATH") or die ("No databse defined");
    file_exists(DATABASE_PATH) or die ("Cannot find database");
    if (!isset($this->database)) {
      $this->database = new SQLite3(DATABASE_PATH);
      isset($this->database) or die ("Error opening database");
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
        $out[$i][AzimutDatabase::KEY_TIMESTAMP] = $row[AzimutDatabase::KEY_TIMESTAMP];
        $out[$i][AzimutDatabase::KEY_DEVICE]    = $row[AzimutDatabase::KEY_DEVICE];
        $out[$i][AzimutDatabase::KEY_LATITUDE]  = $row[AzimutDatabase::KEY_LATITUDE];
        $out[$i][AzimutDatabase::KEY_LONGITUDE] = $row[AzimutDatabase::KEY_LONGITUDE];
        $out[$i][AzimutDatabase::KEY_MESSAGE]   = $row[AzimutDatabase::KEY_MESSAGE];
        $i++;
    }
    return $out;
  }

  function checkValues($timestamp, $device, $latitude, $longitude, $message) {
    return is_integer($timestamp) && $timestamp >= 0 &&
            is_string($device) && preg_match("/^[[:alnum:]-_]{1,12}$/", $device) &&
            is_string($message) && preg_match("/^[[:print:]]{0,32}$/", $message) &&
            is_real($latitude) && $latitude >= -90 && $latitude <= 90 &&
            is_real($longitude) && $longitude >= -360 && $longitude <= 360;
  }

  function writeEvent ($timestamp, $device, $latitude, $longitude, $message) {
    $this->checkValues($timestamp, $device, $latitude, $longitude, $message) or die ("Invalid arguments");
    $this->open();
    $query = "INSERT INTO ".AzimutDatabase::TABLE_EVENTS."('".AzimutDatabase::KEY_TIMESTAMP."', '".AzimutDatabase::KEY_DEVICE."', '".AzimutDatabase::KEY_LATITUDE."', '".AzimutDatabase::KEY_LONGITUDE."', '".AzimutDatabase::KEY_MESSAGE."') ".
        "VALUES(".$timestamp.", '".SQLite3::escapeString($device)."', ".$latitude.", ".$longitude.", '".SQLite3::escapeString($message)."')";
    return $this->database->exec($query);
  }

  function purge ($oldestTimestamp) {
    is_integer($oldestTimestamp) or die ("Illegal argument");
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
