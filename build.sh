SITE_PATH="${1:-"./site"}"
echo "Building into" $SITE_PATH

npm install
echo "---- Webpack ----"
cd build/npm
mkdir -p dist
node webpack.js $2
cp dist/bundle.js ../../$SITE_PATH/scripts/lib/api/sgg-helper.js
cd ../..
echo "---- EJS Rendering ----"
./build/render.sh $SITE_PATH