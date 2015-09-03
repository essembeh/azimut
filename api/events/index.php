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
    $databaseHandle = new SQLite3($DATABASE_FILE);
    // TODO: Garbage collect with config settings
    $results = $databaseHandle->query("SELECT * FROM events");
    $i = 0;
    while ($row = $results->fetchArray()) {
        $out['result'][$i]['timestamp'] = $row['timestamp'];
        $out['result'][$i]['latitude'] = $row['latitude'];
        $out['result'][$i]['longitude'] = $row['longitude'];
        $out['result'][$i]['message'] = $row['message'];
        $out['result'][$i]['device'] = $row['device'];
        $i++;
    }
    $out['status'] = 'OK';
    $databaseHandle->close();
}
echo json_encode($out);
?>
