# Azimut

[![Build Status](https://drone.io/github.com/essembeh/azimut/status.png)](https://drone.io/github.com/essembeh/azimut/files/azimut-master.tgz)

Azimut is a **self-hostable location sharing application**.

Sharing your location with your friends (or whoever your want) is a great feature that many social networks have, but geolocation is a very sensitive information.

The main goal of *Azimut* if to provide a geolocation service while **keeping control of your data**.

It is *free* (as free beer) and open-source so you can modify it as you want.

# Try it!

## Demo
The latest version is available for  [here](http://azimut.byethost11.com/)

*Warning, this is a free PHP hosting service, everything is public, there is no SSL nor authentication.*

## Docker
A docker image is (will be) automatically created, so you can test the latest version of Azimut with:
```
docker run -p 80:80 essembeh/azimut
```
Then go to http://localhost/

## Install on your server
See the [installation guide](INSTALL.md)


# Features
First version of Azimut aims to have these features:

* List *events*, position of someone at a given time with an optional message
* Show this *events* on a map using [OpenStreetMap](http://openstreetmap.org) thanks to the wonderful [Leaflet](http://leafletjs.com/) project
* Resolve latitude longitude in place name using [Nominatim](https://nominatim.openstreetmap.org/)
* Responsive website
* Share current position using HTML5 geolocation API
* REST API to easily connect your Azimut with other applications
* Auto clean database, **you decide how long you keep events**

## Security
For now there is no authentication, anybody can post positions, anybody can view them.

You can setup basic authentication on your webserver to limit access.

**You should** also consider setting up SSL on you webserver if you want to keep your data private.

## Planned Features

* Authentication mecanism with tokens for devices and different tokens for viewers
* Filtering for listing events in API
* Filtering per device in the UI
