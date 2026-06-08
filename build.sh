SITE_PATH="${1:-"./site"}"
echo "Building into" $SITE_PATH

npm install
echo "---- Webpack ----"
cd build
mkdir -p dist
node webpack.js $2
cp dist/api/* ../$SITE_PATH/scripts/lib/api/
cd ../
echo "---- EJS Rendering ----"
./build/render.sh $SITE_PATH