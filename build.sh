cd build/npm
mkdir -p dist
npm install
node webpack.js
cp dist/bundle.js ../../scripts/lib/api/sgg-helper.js