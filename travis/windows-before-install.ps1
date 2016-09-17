choco install jq curl

$url = curl.exe -s -S -k https://api.github.com/repos/dripcap/libv8/releases | jq -r '(.[0].assets[] | select(.name == \"v8-windows-amd64.zip\")).browser_download_url'
curl.exe -s -S -k -L -O $url
$url = curl.exe -s -S -k https://api.github.com/repos/dripcap/librocksdb/releases | jq -r '(.[0].assets[] | select(.name == \"rocksdb-windows-amd64.zip\")).browser_download_url'
curl.exe -s -S -k -L -O $url

Expand-Archive -Path .\v8-windows-amd64.zip -DestinationPath $env:HOMEPATH -Force
Expand-Archive -Path .\rocksdb-windows-amd64.zip -DestinationPath $env:HOMEPATH -Force

curl.exe -s -S -k -L -O http://www.win10pcap.org/download/Win10Pcap-v10.2-5002.msi
Start-Process .\Win10Pcap-v10.2-5002.msi /qn -Wait

Install-Product node ''
npm config set loglevel error
npm install -g gulp electron babel-cli
npm install babel-plugin-add-module-exports babel-plugin-transform-async-to-generator babel-plugin-transform-es2015-modules-commonjs
npm install
