#!/bin/zsh


if [ ! -z "$1" ]
  then
  SFID=$1
fi

rm -rf sdb-$SFID;
mkdir sdb-$SFID;

echo "Browserify on websock.js"
browserify websock.js -o sdb-$SFID/bundle.js;

cp rpcfix.html sdb-$SFID/.;
export buildNumber=$(date -u "+%Y%m%d%H%M%S");
#bundle.js?buster=2311

sed -i '' "s/BUILDNUMBER/$buildNumber/g" sdb-$SFID/rpcfix.html;

sed -i '' "s/SF\_CTL5\_[a-zA-Z0-9]*/$SFID/g" sdb-$SFID/rpcfix.html;


echo "Uploading and setting permissions public"
gsutil cp -r sdb-$SFID gs://sdbrpc/;

gsutil acl -r ch -u AllUsers:R  gs://sdbrpc/sdb-$SFID;

echo "Url:\n http://storage.googleapis.com/sdbrpc/sdb-"$SFID"/rpcfix.html?anticache="$buildNumber