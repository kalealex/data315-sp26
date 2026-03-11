<script>
  import * as d3 from 'd3';
	import {onMount} from 'svelte';
  import Map from './Map.svelte';
  import Histogram from './Histogram.svelte';

	let data = [];
  let fullData = [];
  let filter1 = [];
  let filter2 = [];

  let var1 = 'percentWhite';
  let var2 = 'percentVacant';

	onMount(async function() {
    // load data from csv (source: https://chicagohealthatlas.org/download)
    let table = d3.csv('chi-health-data.csv', (d) => ({
          ...d,
          'Name': d['Name'].substring(6),
          'EKW_2022': +d['EKW_2022'],
          'PCT-W_2018-2022': +d['PCT-W_2018-2022'],
          'VAC_2018-2022': +d['VAC_2018-2022']
        }));

    let geocoord = d3.json('census-tracts.geojson')
      .then((d) => d.features);
    
    await Promise.all([table, geocoord]).then((values) => {
      // console.log(values);
      let table = values[0];
      let geocoord = values[1];
      // join the variables we want to show on the map
      for (let i = 0; i < geocoord.length; i++) {
        let tract = geocoord[i].properties.name10;
        let found = false;
        let j = 0;
        while (!found && table.length > j) {
          if (table[j].Name == tract) {
            found = true;
            data.push(geocoord[i]);
            data[data.length - 1].properties['population'] = table[j]['Population']
            // data[data.length - 1].properties['popChange'] = table[j]['CIP_2010-2020']
            // data[data.length - 1].properties['rentRatio'] = table[j]['RBU_2018-2022'] / table[j]['RBS_2018-2022']
            data[data.length - 1].properties['walkability'] = table[j]['EKW_2022']
            data[data.length - 1].properties['percentWhite'] = table[j]['PCT-W_2018-2022']
            data[data.length - 1].properties['percentVacant'] = table[j]['VAC_2018-2022']
            // grab other variables as needed
          } else {
            j++;
          }
        }
      }
      // console.log(data);
      fullData = [...data];
    });
	});

  function updateData() {
    if (filter1.length > 0 && filter2.length > 0) {
      data = fullData.filter((d) => (d.properties[var1] >= filter1[0] && d.properties[var1] < filter1[1] && d.properties[var2] >= filter2[0] && d.properties[var2] < filter2[1]));
    } else if (filter1.length > 0 && filter2.length == 0) {
      data = fullData.filter((d) => (d.properties[var1] >= filter1[0] && d.properties[var1] < filter1[1]));
    } else if (filter1.length == 0 && filter2.length > 0) {
      data = fullData.filter((d) => (d.properties[var2] >= filter2[0] && d.properties[var2] < filter2[1]));
    } else {
      data = [...fullData];
    }
  }
</script>

<main>
  <h1>Chicago Census Data</h1>

  <div class="flex-container row">
    <div class="map"><Map data={data} fullData={fullData}></Map></div>
    <div class="flex-container col">
      <div class="hist"><Histogram data={data} fullData={fullData} variable={var1} bind:filter={filter1} update={updateData}></Histogram></div>
      <div class="hist"><Histogram data={data} fullData={fullData} variable={var2} bind:filter={filter2} update={updateData}></Histogram></div>
    </div>
  </div>
</main>

<style>
  .flex-container {

    display: flex;
    
    justify-content: center;  
    /* flex-flow: row; */ 
    

    height: 100%;
    padding: 15px;
    gap: 5px;

  }

  .flex-container > div{
    padding: 8px;
  }

  .flex-container .row {
    flex-direction: row;  
  }

  .flex-container .col {
    flex-direction: column;  
  }

  .map { 
    /* flex:1 1 auto; */
    flex-grow:1;
  }
			
  .hist { 
    /* flex:0 1 auto; */
    flex-grow:0;
  }
			

</style>