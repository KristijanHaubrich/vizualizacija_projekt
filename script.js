let educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
let countyURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"

let countyData
let educationData

let counter = 0
let average = 0

let canvas = d3.select('#canvas')
let tooltip = d3.select('#tooltip')
let graph = d3.select('#graph')

//proba graf

 let   drawGraph = (county, percentage) => {

    var data = [ { "name": "AVERAGE(20.1%)", "number": 20.1 },{"name": county, "number": percentage }]

    var margin = { top: 20, bottom: 70, left: 60, right: 20 };
    var width = 500 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var barPadding = 4;
    var barWidth = width / data.length - barPadding;

    var x = d3.scaleBand()
      .domain(d3.range(data.length))
      .range([0, 500]);

    var y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    graph = d3.select("#graph")
      .append("svg")
      .attr("width", 600 )
      .attr("height", 600)
      .style("background-color", "lightblue")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top +
        ")");

    var xAxis = d3.axisBottom(x)
      .tickFormat(function (d, i) { return data[i].name; });

    var yAxis = d3.axisLeft(y)
      .ticks(10);

    graph.append("g")
      .attr("class", "x_axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "middle");

    graph.append("g")
      .attr("class", "y_axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Vrijednost");

    var barchart = graph.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", function (d, i) { return x(i); })
      .attr("y", function (d) { return y(d.number); })
      .attr("height", 0)
      .attr("width", barWidth)
      .attr("fill", function (d){
        if (d.number < 15) {
            return 'lightgreen'
        } else if (d.number < 30) {
            return 'limegreen'
        } else if (d.number < 45) {
            return 'green'
        }
        else {
            return 'darkgreen'
        }
    })
    .transition() // <---- transition
    .duration(2000)
    .attr("height", function (d) { return height - y(d.number); });


    graph.append("text")
        .attr("class", "text")
        .attr("x", (width / 2))
        .attr("y", (height + (margin.bottom / 2)))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(function(d){
            if(data[1].number < 20.1){
                return 'BELOW AVERAGE'
            }else if(data[1].number == 20.1){
                return 'AVERAGE'
            }else{
                return 'ABOVE AVERAGE'
            }
        });

    graph.append("g")
        .attr("class", "y_axis")
        .call(yAxis);
        
    graph.append("text")
        .attr("class", "text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height/2))
        .attr("y", 0 - margin.left)
        .attr("dy", "0.8em")
        .style("text-anchor", "middle")
        .text("PERCENTAGE(%)");

    graph.transition()
        .style('visibility', 'visible')    

 }
    

let drawMap = () => {

    canvas.selectAll('path')
        .data(countyData)
        .enter()
        .append('path')
        .attr('d', d3.geoPath())
        .attr('class', 'county')
        .attr('fill', (countyDataitem) => {
            let id = countyDataitem['id']
            let county = educationData.find((item) => {
                return item['fips'] === id
            })
            let percentage = county['bachelorsOrHigher']
            
            average += percentage
            counter++

            if (percentage < 15) {
                return 'lightgreen'
            } else if (percentage < 30) {
                return 'limegreen'
            } else if (percentage < 45) {
                return 'green'
            }
            else if (percentage == 20.1) {
                return 'limegreen'
            } else {
                return 'darkgreen'
            }
        })
        .attr('data-fips', (countyDataitem) => {
            return countyDataitem['id']
        })
        .attr('data-education', (countyDataitem) => {
            let id = countyDataitem['id']
            let county = educationData.find(
                (item) => {
                    return item['fips'] === id
                }
            )
            let percentage = county['bachelorsOrHigher']
            return percentage
        })
        .on('mouseover', (countyDataitem) => {
            let id = countyDataitem['id']
            let county = educationData.find(
                (item) => {
                    return item['fips'] === id
                }
            )
            
            drawGraph(county['area_name'] + " (" + county['bachelorsOrHigher'] + "%)", county['bachelorsOrHigher'])
        })
        .on('mouseout', (countyDataitem) => {
            graph.transition()
                .style('visibility', 'hidden')    
        })

        average /= counter
        console.log("AVERAGE IS " + average + "%")

}

d3.json(countyURL).then(
    (data, error) => {
        if (error) {
            console.log(error)
        } else {
            countyData = topojson.feature(data, data.objects.counties).features
            console.log('County Data')
            console.log(countyData)

            d3.json(educationURL).then(
                (data, error) => {
                    if (error) {
                        console.log(error)
                    }
                    else {
                        educationData = data
                        console.log('Education Data')
                        console.log(educationData)
                        drawMap()
                    }
                }
            )

        }
    }
)

