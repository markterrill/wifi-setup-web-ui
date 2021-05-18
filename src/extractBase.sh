#!/bin/zsh


SFID=$1;

PUB=`base64 -i /Users/markterrill/git-repo/sfmosv1/scripts/gcp-keys/gcp-$SFID.pub.pem`;
KEY=`base64 -i /Users/markterrill/git-repo/sfmosv1/scripts/gcp-keys/gcp-$SFID.key.pem`;


echo 'let deviceID = "'$SFID'";'
echo 'let pub64 = "'$PUB'";'
echo 'let key64 = "'$KEY'";'

sed -i '' "s/let deviceID = \"SF_CTL5_[0-9A-Z]*\"/let deviceID = \"$SFID\"/g" websock.js;
sed -i '' "s/let pub64 = \"[0-9a-zA-Z\=]*\"/let pub64 = \"$PUB\"/g" websock.js;
sed -i '' "s/let key64 = \"[0-9a-zA-Z\=]*\"/let key64 = \"$KEY\"/g" websock.js;






