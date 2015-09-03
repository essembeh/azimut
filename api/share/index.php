<?php
header('Content-type: application/json');

// Config
$CACHE_FOLDER="../../cache";
$DATABASE_FILE=$CACHE_FOLDER."/azimut.sqlite";

$out = array('status' => '');
// TODO: Store Database in SESSION
if (!file_exists($DATABASE_FILE)) {
    $out['status'] = "Configuration error";
} else {
    // TODO: Garbage collect with config settings
    // TODO Check mandatory attributes
    $device = $_GET["device"];
    $token = $_GET["token"];
    // TODO Check token
    $timestamp = time();
    $latitude = floatval($_GET["latitude"]);
    $longitude = floatval($_GET["longitude"]);
    $message = SQLite3::escapeString($_GET["message"]);
    if (!preg_match('/[A-Za-z0-9]{1,32}/', $device)) {
        $out['status'] = "Invalide device";
    } elseif (!is_float($latitude)) {
        $out['status'] = "Invalide latitude";
    } elseif (!is_float($longitude)) {
        $out['status'] = "Invalide longitude";
    } else {
        $databaseHandle = new SQLite3($DATABASE_FILE);
        $query = "INSERT INTO events('timestamp', 'device', 'latitude', 'longitude', 'message') ".
            "VALUES(".$timestamp.", '".$device."', ".$latitude.", ".$longitude.", '".$message."')";
        if (!$databaseHandle->exec($query)) {
            $out['status'] = "Database error";
            $out['query'] = $query;
            $out['database'] = $DATABASE_FILE;
        } else {
            $out['status'] = 'OK';
        }
    }
    $databaseHandle->close();
}
echo json_encode($out);
?>
