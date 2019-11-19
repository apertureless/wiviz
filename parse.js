const fs = require('fs')
const readline = require('readline')
const stream = require('stream')

const streamIn = fs.createReadStream('./client-probes.log')
const streamOut = new stream()
const rl = readline.createInterface(streamIn, streamOut)

const probeData = []
rl.on('line', (line) => {
  const reMac = /[a-fA-F0-9:]{17}|[a-fA-F0-9]{12}$/g;
  const re = /\s*(\([^)]+\))\s*/g;

  const s1 = line.split('station')
  const s2 = s1[1].split('is probing for SSID')
  const s22 = s2[0].split(' ').filter(Boolean)
  const clientName = s22[0]
  const s3 = s2[1].split(re).filter(Boolean)
  const networkName = s3[0];

  console.info(`Client: ${clientName} - SSID: ${networkName}`)

  probeData.push({
    client: clientName,
    ssid: networkName
  })
})

rl.on('close', () => {
  const f = JSON.stringify(probeData)
  fs.writeFileSync('probes.json', f)
})
