#!/bin/zsh


if [ ! -z "$1" ]
  then
  SFID=$1
fi

echo "Running for $SFID";

./extractBase.sh $SFID; ./compile.sh $SFID;
