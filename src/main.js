var main_canvas = null
var main_ctx = null
var colorCanvas = document.getElementById('colorCanvas')
var color_ctx = colorCanvas.getContext('2d')
var tempCanvas = document.getElementById('tempCanvas')
var temp_ctx = tempCanvas.getContext('2d')

var dataCanvas = document.getElementById('dataCanvas')
var data_ctx = dataCanvas.getContext('2d')

var x_div = $('#x_pos')
var y_div = $('#y_pos')
var layerName = $('#layerName').find('span')
var stepDiv = $('#stepNum').find('span')
var speedDiv = $('#speed_div').find('span')
var layerProg = $('#layerProg')
var buildProg = $('buildProg')
var temp1_div = $('#temp1_div')
var temp2_div = $('#temp2_div')

var firstStep = $('#firstStep')
var timeStep = $('#timeStep')
var offsetX = $('#offsetX')
var offsetY = $('#offsetY')
var zoom = $('#zoom')

var tempArray = []
var tempAvgInterval = 10

var pyroData = null

var step_size = timeStep.val()
var step = 19400

var layer = ""

var colorScale = ""

var animate = undefined

var temp = {
    max: 1250,
    min: 800,
    cut_min: 920,
    cut_max: 1250
}




var settings = {}



function settingsInit(){



}





timeStep.on('input', function(){
    stopPlot()
    step_size = $(this).val()
    step = step - step_size
    resumePlot()
})



var fileNum = 0
var files = ""

/*
$('input[type="file"]').on('change', function(){
    console.log('Plotting static layer image')
    plotStatic($(this)[0].files[0])
})
*/

function plotStatic(file){
    var reader = new FileReader();
    layerName.html(file.name)
    reader.onloadend = function(event){
        var lines = this.result.split('\n');
        plotLayer(lines)
    };
    reader.readAsText(file);

}

function plotLayer(data){


    var tempScale = []

    for(var i=temp.min; i <= temp.max; i+= Math.floor((temp.max-temp.min)/10)){
        tempScale.push(i)
    }

    colorScale = d3.scaleSequential(d3.interpolateSpectral).domain([temp.max,temp.min])
    init_colorBar(tempScale)


    for(var i=0; i <= data.length; i+10){
        //console.log(i)
        var point = data[i].split(" ")
        var x = Math.floor((parseInt(point[0]) + parseInt(offsetX.val()) )) * zoom.val()
        var y = Math.floor((parseInt(point[1]) + parseInt(offsetY.val()) )) * zoom.val()
        var temp = parseInt(point[2])
        main_ctx.fillStyle = colorScale(temp)
        main_ctx.fillRect(x, y, 1,1);

    }
}



function avgTemp(){
    var avg = tempArray.reduce( function(sum, val){
        return sum + val
    })
    avg = avg/tempArray.length
    return avg
}

function startPlot(){

    fileNum = 0
    files = ""

    appendCanvas('background', 0)
    console.log(main_ctx, main_canvas.width, main_canvas.height)

    main_ctx.fillStyle = '#000'
    main_ctx.fillRect(0, 0, main_canvas[0].width, main_canvas[0].height)
    //main_ctx.clearRect(0, 0, main_canvas.width, main_canvas.height)

    files = $('#pyro_file')[0].files
    buildProg.val(0)
    buildProg.attr('max', files.length)
    console.log(files)


    if( files.length > 0 ){
        //color = d3.schemeSpectral[files.length]
        var tempScale = []

        for(var i=temp.min; i <= temp.max; i+=20){
            tempScale.push(i)
        }

        colorScale = d3.scaleSequential(d3.interpolateSpectral).domain([temp.max,temp.min])
        init_colorBar(tempScale)



        //console.log(colorScale)

        colorScale.clamp(true)

        setupFile()
    }
}


function stopPlot(){
    window.cancelAnimationFrame(animate)
}

function resumePlot(){
    animate = requestAnimationFrame(animateData)
}


function setupFile(){



    step_size = parseInt(timeStep.val())
    step = parseInt(firstStep.val())


    buildProg.val(fileNum)

    //step= step_size

    console.log("Parsing data file: " + fileNum )
    //console.log(files[fileNum])
    if(fileNum < files.length){





    var reader = new FileReader();

    layerName.html(files[fileNum].name)

    reader.onloadend = function(event){
        var lines = this.result.split('\n');
        console.log(this, event)
        appendCanvas(files[fileNum].name, fileNum)

        pyroData = lines
        layerProg.val(0)
        layerProg.attr('max', pyroData.length )



        plotData(this.name,function(data){
            pyroData = data
            //console.log(pyroData)
            console.log("Using data to setup plot area")
            xScale = d3.scaleLinear().domain(d3.extent(pyroData, function(d){return d.x})).range([0,main_canvas[0].width])
            yScale = d3.scaleLinear().domain(d3.extent(pyroData, function(d){return d.y})).range([main_canvas[0].height, 0])
          //  xScale = d3.scaleLinear().domain([-22000,-12000]).range([0,main_canvas.width])
            //yScale = d3.scaleLinear().domain([-22000,-12000]).range([main_canvas.height, 0])

            console.log(main_ctx)
            animate = window.requestAnimationFrame(animateData)
        })








    };
    //console.log(files[fileNum])
    reader.readAsText(files[fileNum]);
    }
    else{
        return;

    }
}




function plotData(layer, callback){
      pyroArray = []
      pyroData.forEach(function(d,i){
          var point = d.split(" ")
          var data = {}
          //console.log(point)
          data.x = parseInt(point[0])
          data.y = parseInt(point[1])
          data.temp1 = parseInt(point[2])
          data.temp2 = parseInt(point[3])
          pyroArray.push(data)
          if(i == pyroData.length - 1){
            console.log("Data parsed OK")
            callback(pyroArray)
          }

      })

}

function animateData(timestep){
  //  console.log(pyroData[0])


    if(step < pyroData.length - step_size ){

        for( var i=0; i < step_size; i++){
            //stepDiv.html(step + "/" + pyroData.length )
            //layerProg.val(step-step_size + i)
            var p1 = pyroData[step - step_size + i]


            var x0 = Math.round(xScale(p1.x))
            var y0 = Math.round(yScale(p1.y))

  //          var x1 = xScale(p2.x)
    //        var y1 = yScale(p2.y)


            //var dist = Math.sqrt( (x1-x0)**2 + (y1-y0)**2 )
            //var speed = dist * 1000
            //speedDiv.html(speed.toFixed(2))




            var temp1 = p1.temp1
            var temp2 = p1.temp2

    /*      if( tempArray.length > tempAvgInterval){
                tempArray.push(temp1)
                var avgTemp = avgTemp(tempArray)
            }
            else{
                tempArray.push(temp1)
                tempArray.shift()
                var avgTemp = avgTemp()

            }
*/



            if(temp1 >= temp.cut_min && temp1 <= temp.cut_max){
                main_ctx.fillStyle = colorScale(temp1)
                main_ctx.fillRect(x0, y0, 1,1);
            }
/*
            else if(temp1 < temp.cut_min){
                main_ctx.fillStyle = "#00f"
            }
            else if( temp1 > temp.cut_max){
              main_ctx.fillStyle = "#f00"
            }

*/

          //  main_ctx.fillStyle = colorScale(temp1)


            // Plot data graph






        }


        var pyroStep = pyroData[step]
        x_div.html(Math.round(xScale(pyroStep.x)))
        y_div.html(Math.round(yScale(pyroStep.y)))
        temp1_div.html(pyroStep.temp1 + "ºC")
        temp2_div.html(pyroStep.temp2 + "ºC")
        drawTempVal(pyroStep.temp1)

        step += step_size
        animate = window.requestAnimationFrame(animateData)



    }
    else{
        fileNum += 1
        //ctx.filter = "opacity(50%)"
        //var copy = canvas

        //ctx.clearRect(0, 0, canvas.width, canvas.height)
        //ctx.drawImage(copy, 0, 0)

        setupFile()


    }


}


function appendCanvas(layerName, layer_num){
    var layerName = layerName.split('.pcd')[0].replace('.','_')
    main_canvas = $('<canvas></canvas>').addClass('main')
                        .attr('id',layerName)
                        //.css('z-index', layer_num)
    main_canvas[0].width = 800
    main_canvas[0].height = 800
    $('div#canvasContainer').append(main_canvas)


    main_ctx = main_canvas[0].getContext('2d')
    //main_ctx.fillStyle = 'rgba(255,255,255,0)'
    //main_ctx.fillRect(0, 0, main_canvas[0].width, main_canvas[0].height)
    var option = $('<option value="'+ layerName +'">'+ layerName +'</option>')
    $('select#layers').append(option)

    return main_ctx
}


$('select#layers').on('change', function(){
    var layer = $(this).val()
    console.log("Showing layer: " + layer)
    $('.main').not('#background').hide()
    $('#'+layer).show()

})





function init_colorBar(scale){

    var grd = color_ctx.createLinearGradient(0,colorCanvas.height, colorCanvas.width,0);

    for(var i=0; i<scale.length;i++){
        //console.log(i/(scale.length-1))
        grd.addColorStop(i/(scale.length-1), colorScale( scale[i] ))
        var label = $('<div class="color-label">' + scale[i] + '</div>')
        label.css('top', Math.floor(colorCanvas.height - (i/(scale.length-1) * colorCanvas.height) + 1 ))
        label.css('left', '-24px' )
        $('#colorBar').append(label)

    }

    color_ctx.fillStyle = grd
    color_ctx.fillRect(0,0,colorCanvas.width,colorCanvas.height)





}

function drawTempVal(val){
    temp_ctx.clearRect(0,0,tempCanvas.width,tempCanvas.height)
    var height = Math.floor( (( val - temp.min )/( temp.max - temp.min )) * tempCanvas.height )
    //console.log(height)
    temp_ctx.fillStyle = '#333'
    temp_ctx.fillRect(0,height,tempCanvas.width, 2)


    temp_ctx.fillStyle = '#333'
    temp_ctx.fillRect(0,height,tempCanvas.width, 2)

}


/*
$('#main_canvas').on('zoom', function(evt){
    zoom(evt)

})

$('#main_canvas').on('mousedown', function(evt){
    translate(evt)

})

*/
function translate(evt){

    console.log("Moving view")
    main_ctx.save()
    var savedCanvas = new Image(main_ctx)
    main_ctx.clearRect(0, 0, main_canvas[0].width, main_canvas[0].height);

    main_ctx.translate(evt.ClientX, evt.ClientY)
    main_ctx.restore()

}


function zoom(evt){
    console.log("Zooming")
    main_ctx.save()
    //main_ctx.scale(transform.k, transform.k);
}

/*
function getPixel(position){

    var imageData = main_ctx.getImageData( 0, 0, )


}
*/
