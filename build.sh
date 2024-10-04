cd build/npm
mkdir -p dist
npm install
node webpack.js $1
cp dist/bundle.js ../../scripts/lib/api/sgg-helper.js