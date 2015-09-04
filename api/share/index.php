<?php
require(dirname(__FILE__)."/../lib/AzimutDatabase.class.php");

header('Content-type: application/json');

// TODO: Store Database in SESSION
$db = new AzimutDatabase();

// Get data
$timestamp = time();
$device = $_GET["device"];
$latitude = floatval($_GET["latitude"]);
$longitude = floatval($_GET["longitude"]);
$message = $_GET["message"];

$db->open();
$db->autoPurge();
$out = array();
if ($db->writeEvent($timestamp, $device, $latitude, $longitude, $message)) {
  $out['status'] = "OK";
} else {
  $out['status'] = "ERROR";
}
echo json_encode($out);
$db->close();
?>
