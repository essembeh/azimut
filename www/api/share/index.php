<?php
require(dirname(__FILE__)."/../lib/AzimutDatabase.class.php");

header('Content-type: application/json');

// Get data
$timestamp = time();
$device = $_GET["device"];
$latitude = floatval($_GET["latitude"]);
$longitude = floatval($_GET["longitude"]);
$message = $_GET["message"];

$out = array();
try {
  // TODO: Store Database in SESSION
  $db = new AzimutDatabase();
  $db->open();
  $db->autoPurge();
  $db->checkValues($timestamp, $device, $latitude, $longitude, $message);
  $db->writeEvent($timestamp, $device, $latitude, $longitude, $message);
  $out['status'] = "OK";
} catch (Exception $e) {
  $out['status'] = "ERROR";
  $out['message'] = $e->getMessage();
} finally {
  $db->close();
}
echo json_encode($out);
?>
