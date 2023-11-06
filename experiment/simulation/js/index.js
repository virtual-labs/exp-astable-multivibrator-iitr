var connections = [];

function reload(event) {
    window.location.reload()
}

function BoardController() {
    var jsPlumbInstance = null;
    var endPoints = [];

    this.setJsPlumbInstance = function(instance) {
        jsPlumbInstance = instance;
    };

    this.setCircuitContainer = function(drawingContainer) {
        jsPlumbInstance.Defaults.Container = drawingContainer;
    };

    this.initDefault = function() {

        jsPlumbInstance.importDefaults({
            Connector: ["Bezier", { curviness: 30 }],
            PaintStyle: { strokeStyle: '#87321b', lineWidth: 4 },
            EndpointStyle: { radius: 3, fillStyle: 'blue' },
            HoverPaintStyle: { strokeStyle: "#26c947" }
        });

        jsPlumbInstance.bind("beforeDrop", function(params) {
            var sourceEndPoint = params.connection.endpoints[0];
            var targetEndPoint = params.dropEndpoint;
            if (!targetEndPoint || !sourceEndPoint) {
                return false;
            }
            var sourceEndPointgroup = sourceEndPoint.getParameter('groupName');
            var targetEndPointgroup = targetEndPoint.getParameter('groupName');

            if (sourceEndPointgroup == targetEndPointgroup) {
                alert("Already connected internally");
                return false;
            } else {
                return true;
            }
        });

        jsPlumbInstance.bind("dblclick", function(conn) {
            jsPlumb.detach(conn);
            return false;
        });

        jsPlumbInstance.bind("jsPlumbConnection", function(conn) {
            var source = conn.connection.endpoints[0].getParameter('endPointName')
            connections[source] = conn.connection;

        });
    };

    this.addEndPoint = function(radius, divID, groupName, endPointName, anchorArray, color, stroke) {
        var Stroke;
        if(typeof(stroke)=='undefined'){
            Stroke = '#87321b';
        }
        else{
            Stroke = stroke;
        }
        var endpointOptions = {
            isSource: true,
            isTarget: true,
            anchor: anchorArray,
            maxConnections: 1,
            parameters: {
                "divID": divID,
                "endPointName": endPointName,
                "groupName": groupName,
                "type": 'output',
                "acceptType": 'input'
            },
            paintStyle: { radius: radius, fillStyle: color },
            connectorStyle:{ strokeStyle:Stroke, lineWidth: 4}
        };

        jsPlumbInstance.addEndpoint(divID, endpointOptions);

        setEndpoint(endPointName, endpointOptions);
    };

    var setEndpoint = function(endPointName, endpointOptions) {
        endPoints[endPointName] = {
            "endPointName": endpointOptions.parameters.endPointName,
            "groupName": endpointOptions.parameters.groupName,
            "divID": endpointOptions.parameters.divID
        };

    };

}


var con ;

function checkCircuit() {


    con = false;
    var g = new Graph(29);


    var groups = ['row1', 'row2', 'row3', 'row4', 'row5', 'row6', 'row7', 'row8', 'VCC', 'GND', 'c1_A', 'c1_B', 'c2_A', 'c2_B', 'r1_A', 'r1_B', 'cro_A', 'cro_B', 'ptm_A', 'ptm_B', 'ptm_C', 'ic_VCC', 'ic_D', 'ic_TH', 'ic_CV', 'ic_GND', 'ic_TR', 'ic_O', 'ic_R']

    console.log(groups.length)

   

    for (var i = 0; i < groups.length; i++) { //inserting groups vertexes
        g.addVertex(groups[i]);
    }

   
    for (key in connections) { // adding edges
        g.addEdge(connections[key].endpoints[0].getParameter('groupName'), connections[key].endpoints[1].getParameter('groupName'));
    }

    var edges= (g.numberofedges);
    console.log('edges:'+edges)
    if(edges == 0)
    {
        alert("No connections present.");   
        return;
    }
    
    if (
               g.isConnected("ic_VCC","VCC") 
               && g.isConnected("ic_GND","GND") 
               && g.isConnected("ic_R","VCC") 
               && ( (g.isConnected("ic_CV","c1_A") && g.isConnected("c1_B","GND")) || (g.isConnected("ic_CV","c1_B") && g.isConnected("c1_A","GND")) )
               
               && ( (g.isConnected("ic_D","r1_A") && g.isConnected("r1_B","c2_A") && g.isConnected("ic_TH","c2_A") && g.isConnected("ic_TR",'c2_A') && g.isConnected("c2_B","GND")) ||
                    (g.isConnected("ic_D","r1_B") && g.isConnected("r1_A","c2_A") && g.isConnected("ic_TH","c2_A") && g.isConnected("ic_TR",'c2_A') && g.isConnected("c2_B","GND")) ||
                    (g.isConnected("ic_D","r1_A") && g.isConnected("r1_B","c2_B") && g.isConnected("ic_TH","c2_B") && g.isConnected("ic_TR",'c2_B') && g.isConnected("c2_A","GND")) ||
                    (g.isConnected("ic_D","r1_B") && g.isConnected("r1_A","c2_B") && g.isConnected("ic_TH","c2_B") && g.isConnected("ic_TR",'c2_B') && g.isConnected("c2_A","GND"))
                    )

               && (g.isConnected("ic_O","cro_A")||g.isConnected("ic_O","cro_B"))
               && g.isConnected("ic_D","ptm_B")
               && ((g.isConnected("VCC","ptm_A") && g.isConnected("ptm_C","GND")) || (g.isConnected("VCC","ptm_C") && g.isConnected("ptm_A","GND")))
    )

    {

        alert("Right Connections")
        con = true;
        var x = document.getElementById('mydiv');
        x.style.visibility = 'visible';
        x.style.display = "block";
        var y = document.getElementById('mydiv2');
        y.style.visibility = 'visible';
        y.style.display = "block";
        var z = document.getElementById('ptm-text');
        z.style.visibility = 'visible';

        rightTab = document.getElementById('right_tab');
        rightTab.style.display = 'none';

        tab = document.getElementById('obsTable');
        tab.style.display = 'block';

        if ( g.isConnected('ic_O','cro_A') ) {
            document.getElementById('channel').value = "a";
            init("a");
        }else if (g.isConnected('ic_O', 'cro_B')) {
            document.getElementById('channel').value = "b";
            init("b");
        }

    } else {
        alert("Wrong Connections")
    }

   
    console.log("executed")
}


function calfreq1() {
    var a = parseInt(document.getElementById('a1').value);
    var b = parseInt(document.getElementById('b1').value);
    var d = parseInt(document.getElementById('d1').value);
    if (a && b && d != null) {
        var freq1 = 1450000 / ((a + 2 * b) * d);
        var dc1 = ((a + b) / (a + 2 * b))*100;

        document.getElementById('freq1').innerHTML = freq1.toFixed(2);
        document.getElementById('dc1').innerHTML = dc1.toFixed(2);
    }

}

function calfreq2() {
    var a = parseInt(document.getElementById('a2').value);
    var b = parseInt(document.getElementById('b2').value);
    var d = parseInt(document.getElementById('d2').value);
    if (a && b && d != null) {
        var freq2 =1450000/ ((a + 2 * b) * d);
        var dc2 = ((a + b) / (a + 2 * b))*100;

        document.getElementById('freq2').innerHTML = freq2.toFixed(2);
        document.getElementById('dc2').innerHTML = dc2.toFixed(2);
    }
}

function calfreq3() {
    var a = parseInt(document.getElementById('a3').value);
    var b = parseInt(document.getElementById('b3').value);
    var d = parseInt(document.getElementById('d3').value);
 if (a && b && d != null) {
    var freq3 = 1450000/ ((a + 2 * b) * d);
    var dc3 = ((a + b) / (a + 2 * b))*100;

    document.getElementById('freq3').innerHTML = freq3.toFixed(2);
    document.getElementById('dc3').innerHTML = dc3.toFixed(2);
 }
}
function calfreq4() {
    var a = parseInt(document.getElementById('a4').value);
    var b = parseInt(document.getElementById('b4').value);
    var d = parseInt(document.getElementById('d4').value);
 if (a && b && d != null) {
    var freq4 = 1450000 / ((a + 2 * b) * d);
    var dc4 = ((a + b) / (a + 2 * b))*100;

    document.getElementById('freq4').innerHTML = freq4.toFixed(2);
    document.getElementById('dc4').innerHTML = dc4.toFixed(2);
 }
}

