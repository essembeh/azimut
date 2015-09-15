#!/bin/bash
set -ex

ROOT=`dirname "$0"`
DB="$ROOT/azimut.sqlite"
SCHEMA="$ROOT/schema.sql"

test -f "$SCHEMA"
if test -f "$DB"; then
	rm "$DB"
fi

sqlite3 "$DB" < "$SCHEMA"
chmod 666 "$DB"
