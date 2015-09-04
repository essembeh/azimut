<?php
require(dirname(__FILE__)."/../lib/AzimutDatabase.class.php");

header('Content-type: application/json');

// TODO: Store Database in SESSION
$db = new AzimutDatabase();

$db->open();
$db->autoPurge();
$out = array('status' => "OK", 'result' => $db->readEvents());
echo json_encode($out);
$db->close();
?>
