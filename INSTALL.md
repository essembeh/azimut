# Installation

## Dependencies
The *UI* (user interface) is static HTML/CSS with Javasscript. It only needs a webserver like *nginx* or *apacha*.

The *backend* is a collection of webservices to access the database. This REST API is developped in *PHP* using an *sqlite* database.

```
apt-get install nginx-full php5-fpm php5-sqlite sqlite3
```

## Install last build

Execute as root
```
cd /var/www/html/
wget -q https://drone.io/github.com/essembeh/azimut/files/azimut-master.tgz -O - | tar xvz
chown -R www-data:www-data .
```

Go to http://localhost/ or http://<YOUR-SERVER>/

## Install from sources

### Close repository
Keep in mind the location where you cloned the repository.
```
git clone https://github.com/essembeh/azimut.git
```
The cloned repository path will be named **AZIMUT_ROOT** in the documentation.

### Database creation
The database is stored in the *AZIMUT_ROOT/www/cache/* folder and the schema to initialize it is in this folder.

There is a script to initialize it but you can do it manually.
```
cd AZIMUT_ROOT/
sqlite3 www/cache/azimut.sqlite < www/cache/azimut/schema.sql
```
You may need to change access rights
```
cd AZIMUT_ROOT
chown -R www-data:www-data www/cache/
```

### Webserver configuration

TODO
