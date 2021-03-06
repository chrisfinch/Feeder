#!/bin/bash

NODE=/home/pi/node-v0.10.2-linux-arm-pi/bin/node
SERVER_JS_FILE=/home/pi/Feeder/app.js
USER=pi
OUT=/home/pi/nodejs.log

case "$1" in

start)
	echo "starting node: $NODE $SERVER_JS_FILE"
	sudo -u $USER $NODE $SERVER_JS_FILE > $OUT 2>$OUT &
	;;

stop)
	killall $NODE
	;;

restart)
	killall $NODE
	echo "starting node: $NODE $SERVER_JS_FILE"
	sudo -u $USER $NODE $SERVER_JS_FILE > $OUT 2>$OUT &
	;;

*)
	echo "usage: $0 (start|stop)"
esac

exit 0
