$(document).ready(function() {
  $.ajax({
    url: 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json',
    dataType: 'json',
    error: (xhr,errorType) => {
           alert(errorType)
    },
    success: (data) => {
      const features = data['features'];
      const padding_top = 20;
      const padding_bottom = 40;
      const w = 1100;
      const h = 550;
      const tooltip_width = 130;
      const tooltip_height = 45;
      var masses = [];
      for (var i=0; i< features.length; i++) {
              var mass = features[i]['properties']['mass'];
              masses.push(parseInt(mass));
      }

      //translates mass of asteroid into circle radius
      function resize(mass) {
        if (mass === null || mass < 1) {mass = 1}
        if (mass < 1000) {
          return (Math.log(mass))/3

        }
        else if (mass < 1000000) {
          return Math.log(mass)/2
        }
        else {
          return (Math.log(mass))*3
        }
      }
                   
      //returns coordinates for tooltips, adjused to effects of zooming
      function tooltip(coord,coord_scaled) {
        var transform = $('image').attr('transform');
        var scale = transform.substr(transform.indexOf(')')+8,transform.length).slice(0,-1)
        var x = transform.substr(10,transform.indexOf(','))
        var y = transform.substr(transform.indexOf(',')+1,transform.indexOf(')'))
        var tooltip_x = coord_scaled * scale + parseInt(x) + 10;
        var tooltip_y = coord_scaled * scale + parseInt(y);

        if (coord === "x") {
          if (tooltip_x > w-tooltip_width) {return w-tooltip_width}
          else {return tooltip_x}
        }
        else if (coord === 'y') {
          if (tooltip_y > h-(tooltip_height+10)) {return h-tooltip_height}
          else {return tooltip_y}
        }
      }

      const lat_min = -90;
      const lat_max = 90;
      const long_min = -180;
      const long_max = 180;
      const graph = document.getElementById('graph');

      //zoom
      function zoomed() {
        circles.attr("transform", d3.event.transform);
        map.attr("transform", d3.event.transform);
      }

      var zoom = d3.zoom().scaleExtent([1, 10]).on("zoom", zoomed)
      const svg = d3.select(graph)
      
      const container = svg.append('svg')
                            .attr('width',w)
                            .attr('height',h)
      const map = container.append('image')
                            .attr('width',w)
                            .attr('height',h)
                            .attr('x',0)
                            .attr('y',0)
                            .attr('transform','translate(0,0) scale(1)')
                            .attr('xlink:href',"world_map.png")
                            .call(zoom)
      
      //disable dragging map                          
      map.call(d3.drag().on("drag", null))
                                                   
      const xScale = d3.scaleLinear()
                        .domain([long_min,long_max])
                        .range([0,w])
      
      const yScale = d3.scaleTime()
                        .domain([lat_min,lat_max])
                        .range([h,0])
                                          
      // circles
      const circles = container.append('g')     
      circles.selectAll('circle')
            .data(features)
            .enter()
            .append('circle')
            .attr('cx',(d) => xScale(d['properties']['reclong']))
            .attr('cy',(d) => yScale(d['properties']['reclat']))
            .attr('r',(d) => resize(d['properties']['mass']))
            .attr('stroke','black')
            .attr('stroke-width','1')
            .attr('fill','red')
            .attr('class','circle')
            .merge(map)

            //tooltip
            .on('mouseover',(d,i) => {

              container.append('foreignObject')
              //position of tooltips is corrected for zoom effects
              .attr("x", tooltip('x',xScale(d['properties']['reclong'])))
              .attr("y", tooltip('y',yScale(d['properties']['reclat'])))
              .attr('width', tooltip_width)
              .attr('height',tooltip_height)
              .append('xhtml:div')
              .html('<b>Name: '+d['properties']['name']+'</b></br>'+
                    'Mass: '+d['properties']['mass']+'</br>'+
                    'Year: '+d['properties']['year'].substr(0,4))
              .attr('class','tip')
            })
            
            .on('mouseout',() =>
              container.selectAll('foreignObject').remove()
              )
    } //success                                  
  }); //ajax call
}) //document ready