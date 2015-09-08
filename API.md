# API documentation

## /api/events

### Parameters

|Name|Type|Format|Required|Description|
|---|---|---|---|---|
|device|string|[a-zA-Z0-9-_]{1,8}|*optional*|Filter events of given device (not yet implemented)|

### Output
```
{
  "status": "OK",
  "result": [{
    "timestamp": 1441715696,
    "device": "seb",
    "latitude": 42.1,
    "longitude": 2.4,
    "message": "Foo"
  }, {
    "timestamp": 1441706629,
    "device": "seb",
    "latitude": 42.2,
    "longitude": 1.4,
    "message": "Bar"
  }]
}
```

## /api/share

### Parameters

|Name|Type|Format|Required|Description|
|---|---|---|---|
|device|string| [a-zA-Z0-9-_]{1,8}|*required*|Identifier of the device|
|latitude|float|[-90; 90]|*required*|Latitude of the device|
|longitude|float|[-360; 360]|*required*|Longitude of the device|
|message|string|[[:print:]]{0,32}|*optional*|Identifier of the device|

### Output
```
{"status":"OK"}
```
