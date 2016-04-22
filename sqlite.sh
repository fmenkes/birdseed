#
# pull-db
# Inspect the database from your device
# Modified from original by Cedric Beust
#

PKG=com.ionicframework.client504540
DB=local.db

rm -f /tmp/${DB}
adb pull /data/data/$PKG/databases/${DB} /tmp/${DB}

open /Applications/sqlitebrowser.app /tmp/${DB}
