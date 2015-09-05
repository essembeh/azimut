#!/bin/bash
set -ex

DB="azimut.sqlite"
SCHEMA="schema.sql"
test -f "$SCHEMA"

if test -f "$DB"; then
	rm "$DB"
fi

sqlite3 "$DB" < "$SCHEMA"

chmod 666 "$DB"
