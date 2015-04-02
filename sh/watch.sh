#!/usr/bin/env bash
# ./node_modules/.bin/watchify -v -t reactify -o dist/popup.bundle.js src/popup.js &
# ./node_modules/.bin/watchify -v -t reactify -o dist/background.bundle.js src/background.js &
./node_modules/.bin/watchify -v -t reactify -o dist/inject.bundle.js src/inject.js &

for job in `jobs -p`
do
  wait $job
done