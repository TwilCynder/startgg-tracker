cd build/npm
echo "---- Installing dependencies ----"
npm install
echo "---- Webpack ----"
mkdir -p dist
node webpack.js $2
cp dist/bundle.js ../../$1/scripts/lib/api/sgg-helper.js
cd ../..
echo "---- EJS Rendering ----"
./build/render.sh $1