<?php
require(dirname(__FILE__)."/../lib/AzimutDatabase.class.php");

header('Content-type: application/json');

$out = array();
try {
  // TODO: Store Database in SESSION
  $db = new AzimutDatabase();
  $db->open();
  $db->autoPurge();
	$events = $db->readEvents();
  $out['status'] = "OK";
	$out['result'] = $events;
} catch (Exception $e) {
  $out['status'] = "ERROR";
  $out['message'] = $e->getMessage();
}
$db->close();
echo json_encode($out);
?>
