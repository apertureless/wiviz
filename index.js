let sniff
let chart
const formattedDatesetByNetwork = []
const formattedDatesetByClient = []
let clientButton
let networkButton

document.addEventListener("DOMContentLoaded", function(event) {
  clientButton = document.querySelector('#client')
  networkButton = document.querySelector('#network')

  clientButton.addEventListener('change', (e) => {
    createChart(formattedDatesetByClient)
  })

  networkButton.addEventListener('change', (e) => {
    createChart(formattedDatesetByNetwork)
  })
})

async function loadData () {
  let resp = await fetch('http://localhost:3000/probes.json')
  let data = await resp.json()
  return data
}

loadData().then(data => {
  const clientGroups = _.groupBy(data, 'client')
  const clientEntries = Object.entries(clientGroups)


  for ( const [client, values] of clientEntries) {
    let chunk = {
      name: client,
      value: new Set(values.map(item => item.ssid)).size * 10,
      children: values.reduce((result, item) => {
        result.push({
          name: item.ssid,
          value: 10
        })
        return result
      }, []).reduce((res, cur) => {
        const x = res.find(item => item.name === cur.name)
        return !x ? res.concat([cur]) : res
      }, [])
    }
    formattedDatesetByClient.push(chunk)
  }

  const apGroups = _.groupBy(data, 'ssid')
  const apEntries = Object.entries(apGroups)

  for ( const [network, values] of apEntries) {
    let chunk = {
      name: network,
      value: new Set(values.map(item => item.client)).size * 10,
      children: values.reduce((result, item) => {
        result.push({
          name: item.client,
          value: 10
        })
        return result
      }, []).reduce((res, cur) => {
        const x = res.find(item => item.name === cur.name)
        return !x ? res.concat([cur]) : res
      }, [])
    }
    formattedDatesetByNetwork.push(chunk)
  }

  createChart(formattedDatesetByClient)
})

function createChart(formattedData) {
  if (chart) {
    chart.dispose()
    chart = null
  }
  am4core.useTheme(am4themes_animated);
  // Themes end
  am4core.ready(() => {
    chart = am4core.create("chartdiv", am4plugins_forceDirected.ForceDirectedTree);

    var networkSeries = chart.series.push(new am4plugins_forceDirected.ForceDirectedSeries())
    networkSeries.dataFields.linkWith = "linkWith";
    networkSeries.dataFields.name = "name";
    networkSeries.dataFields.id = "name";
    networkSeries.dataFields.value = "value";
    networkSeries.dataFields.children = "children";
    networkSeries.maxLevels = 1;

    networkSeries.nodes.template.label.text = "{name}"
    networkSeries.fontSize = 14;
    networkSeries.linkWithStrength = 0;


    var nodeTemplate = networkSeries.nodes.template;
    nodeTemplate.tooltipText = "{name}";
    nodeTemplate.fillOpacity = 1;
    nodeTemplate.label.hideOversized = true;
    nodeTemplate.label.truncate = true;

    var linkTemplate = networkSeries.links.template;
    linkTemplate.strokeWidth = 1;
    var linkHoverState = linkTemplate.states.create("hover");
    linkHoverState.properties.strokeOpacity = 1;
    linkHoverState.properties.strokeWidth = 2;

    nodeTemplate.events.on("over", function (event) {
    var dataItem = event.target.dataItem;
    dataItem.childLinks.each(function (link) {
        link.isHover = true;
    })
    })

    nodeTemplate.events.on("out", function (event) {
      var dataItem = event.target.dataItem;
      dataItem.childLinks.each(function (link) {
        link.isHover = false;
      })
    })

    networkSeries.data = formattedData
  })
}
