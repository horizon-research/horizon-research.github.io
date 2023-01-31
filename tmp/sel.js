var redColor = '#FF0000';
var greenColor = '#00FF00';
var blueColor = '#0000FF';
var magentaColor = '#FF00FF';
var cyanColor = '#00FFFF';
var yellowColor = '#FFFF00';

var greyColor = '#888888';
var purpleColor = '#5c32a8';
var brightYellowColor = '#fcd303'; 
var orangeColor = '#DC7B2E';
var blueGreenColor = '#63BFAB'; 
var oRedColor = 'rgba(218, 37, 0, 0.3)';
var oGreenColor = 'rgba(0, 143, 0, 0.3)';
var oBlueColor = 'rgba(1, 25, 147, 0.5)';

// vectors for confusion lines
var p_line = [0.9795006397, -0.2013704401, 0.005333160206];
var d_line = [-0.8959739281, 0.4425391762, -0.03727999099];
var t_line = [0.1428342021, -0.1413451732, 0.9796019256];
var line = p_line;

var color1, color2, color3;
var sim = false;
var type = 0; // 0 for P, 1 for D, 2 for T

// normals of the projection planes
var p_norm1 = [-1.9082658681515485, 2.117751626087778, -0.20939929937650947];
var p_norm2 = [-1.8983441434416113, 2.04613441386516, -0.14772500661017962];
var d_norm1 = p_norm1;
var d_norm2 = d_norm2;
var t_norm1 = [-0.8559262314423839, 1.1229313663856852, -0.26690712337317146];
var t_norm2 = [-0.07331466590406314, 0.22723495600946306, -0.15386703720552092];
var norm = p_norm1;

var hpe_xyz2lms = [[0.3897,0.689,-0.0787], [-0.2298,1.1834,0.0464], [0,0,1]];
var hpe_xyz2lms_d65 = [[0.40,0.71,-0.08], [-0.23,1.17,0.05], [0.00,0.00,0.92]]; // D65 adapted
var RGB2xyz = math.transpose([[0.4123151515,0.21,0.01932727273], [0.3576,0.72,0.1192], [0.1805,0.07,0.9506333333]]);
var RGB2lms = math.multiply(hpe_xyz2lms, RGB2xyz);
var lms2RGB = math.inv(RGB2lms);


// https://docs.mathjax.org/en/v2.1-latest/typeset.html
var QUEUE = MathJax.Hub.queue; // shorthand for the queue
var transMatText;
QUEUE.Push(function () {
  transMatText = MathJax.Hub.getAllJax('mat');
});

// https://stackoverflow.com/questions/1740700/how-to-get-hex-color-value-rather-than-rgb-value
// It converts 'rgb(255, 255, 255)' to '#FFFFFF'
const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

// It converts an array [255, 255, 255] to '#FFFFFF'
function rgbToHex(c) {
  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  return "#" + componentToHex(c[0]) + componentToHex(c[1]) + componentToHex(c[2]);
}

// From linear RGB to sRGB in Hex
function RGB2sRGB(color) {
  var out = [];
  for(var i = 0; i < 3; i++) {
    if (color[i] <= 0.0031308) out[i] = parseInt((12.92 * color[i] * 255).toFixed());
    else out[i] = parseInt(((1.055 * Math.pow(color[i], 1/2.4) - 0.055) * 255).toFixed());
  }

  if (out[0] > 255 || out[1] > 255 || out[2] > 255 || out[0] < 0 || out[1] < 0 || out[2] < 0)
    return '#000000';

  return rgbToHex(out);
}

// From sRGB hex to linear RGB
function sRGB2RGB(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var color = [
    parseInt(result[1], 16)/255,
    parseInt(result[2], 16)/255,
    parseInt(result[3], 16)/255
  ];

  var out = [];
  for(var i = 0; i < 3; i++) {
    if (color[i] <= 0.04045) out[i] = color[i]/12.92;
    else out[i] = Math.pow((color[i]+0.055)/1.055, 2.4);
  }

  return out;
}

// https://chir.ag/projects/ntc/
function sRGB2Name(color) {
  var n_match  = ntc.name(color);
  //var n_rgb        = n_match[0]; // This is the RGB value of the closest matching color
  var n_name       = n_match[1]; // This is the text string for the name of the match
  //var n_exactmatch = n_match[2]; // True if exact color match, False if close-match
  return n_name;
}

function prot_project(normal, m, s) {
  return - (normal[1] * m + normal[2] * s) / normal[0];
};

function deut_project(normal, l, s) {
  return - (normal[1] * l + normal[2] * s) / normal[0];
};

function trit_project(normal, l, m) {
  return - (normal[1] * l + normal[2] * m) / normal[0];
};

function project(colors_LMS) {
  if (type == 0) {
    return [[prot_project(norm, colors_LMS[1][0], colors_LMS[2][0]), colors_LMS[1][0], colors_LMS[2][0]],
            [prot_project(norm, colors_LMS[1][1], colors_LMS[2][1]), colors_LMS[1][1], colors_LMS[2][1]],
            [prot_project(norm, colors_LMS[1][2], colors_LMS[2][2]), colors_LMS[1][2], colors_LMS[2][2]]
    ];
  } else if (type == 1) {
    return [[colors_LMS[0][0], deut_project(norm, colors_LMS[0][0], colors_LMS[2][0]), colors_LMS[2][0]],
            [colors_LMS[0][1], deut_project(norm, colors_LMS[0][1], colors_LMS[2][1]), colors_LMS[2][1]],
            [colors_LMS[0][2], deut_project(norm, colors_LMS[0][2], colors_LMS[2][2]), colors_LMS[2][2]]
    ];
  } else {
    return [[colors_LMS[0][0], colors_LMS[1][0], deut_project(norm, colors_LMS[0][0], colors_LMS[1][0])],
            [colors_LMS[0][1], colors_LMS[1][1], deut_project(norm, colors_LMS[0][1], colors_LMS[1][1])],
            [colors_LMS[0][2], colors_LMS[1][2], deut_project(norm, colors_LMS[0][2], colors_LMS[1][2])]
    ];
  }
}

function plotRGB(plotId) {
  var allPoints = math.transpose([[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]]);

  var traces = [];

  // O: 0; R: 1; G: 2: B: 3
  // RG: 4; RB: 5; GB: 6; RGB: 7
  var indices = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 4], [2, 6], [3, 5], [3, 6], [4, 7], [5, 7], [6, 7]];
  var names = ['O', 'R', 'G', 'B', 'R+G', 'R+B', 'G+B', 'R+G+B (W)'];
  var hoverInfo = [true, true, true, 'skip', 'skip', 'skip', 'skip', 'skip', 'skip', true, true, true];
  var colors = ['#000000', redColor, greenColor, blueColor, yellowColor, magentaColor, cyanColor, '#000000'];
  var modes = Array(3).fill('lines+markers+text').concat(Array(6).fill('lines')).concat(Array(3).fill('lines+markers+text'));

  // plot the RGB cube
  for (var i = 0; i < indices.length; i++) {
    var start = indices[i][0];
    var end = indices[i][1];
    var line = {
      x: [allPoints[0][start], allPoints[0][end]],
      y: [allPoints[1][start], allPoints[1][end]],
      z: [allPoints[2][start], allPoints[2][end]],
      text: [names[start], names[end]],
      mode: modes[i],
      type: 'scatter3d',
      showlegend: false,
      line: {
        width: 2,
        color: '#000000',
      },
      marker: {
        size: 3,
        opacity: 1,
        color: [colors[start], colors[end]],
      },
      hoverinfo: hoverInfo[i],
    };
    // hovertemplate overwrites hoverinfo, so add it later
    if (hoverInfo[i] == true) {
      line.hovertemplate = '%{text}<br>R: %{x}' +
        '<br>G: %{y}' +
        '<br>B: %{z}<extra></extra>';
    }
    traces.push(line);
  }

  var line = {
    x: [0],
    y: [0],
    z: [0],
    text: [0, 0, 0],
    type: 'scatter3d',
    marker: {
      size: 8,
      opacity: 1,
      color: [0,0,0],
    },
    line: {
      width: 1,
      color: '#000000',
    },
    //mode: 'markers',
    showlegend: true,
    name: 'actual colors',
    opacity:0.8,
    hovertemplate: 'Actual: %{text}<br>' +
      '<br>R: %{x}' +
      '<br>G: %{y}' +
      '<br>B: %{z}<extra></extra>',
  };
  traces.push(line);

  var sim_line = {
    x: [0],
    y: [0],
    z: [0],
    text: [0, 0, 0],
    type: 'scatter3d',
    marker: {
      size: 5,
      opacity: 1,
      color: [0,0,0],
    },
    line: {
      width: 1,
      color: '#000000',
    },
    //mode: 'markers',
    showlegend: true,
    name: 'simulation',
    opacity:0.8,
    hovertemplate: 'Simulation: %{text}<br>' +
      '<br>R: %{x}' +
      '<br>G: %{y}' +
      '<br>B: %{z}<extra></extra>',
  };
  traces.push(sim_line);

  var data = traces;

  var layout = {
    height: 600,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0
    },
    showlegend: true,
    legend: {
      x: 0.1,
      xanchor: 'left',
      y: 1,
    },
    //title: 'Spectral locus in RGB color space',
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    scene: {
      camera: {
        projection: {
          type: 'orthographic'
        }
      },
      // https://plotly.com/javascript/3d-axes/
      aspectmode: 'cube',
      xaxis: {
        //autorange: true,
        range: [-0.3, 1.3],
        zeroline: true,
        zerolinecolor: '#000000',
        zerolinewidth: 5,
        //constrain: 'domain',
        //dtick: 0.02,
        showspikes: false,
        title: {
          text: 'R'
        }
      },
      yaxis: {
        //autorange: true,
        range: [-0.3, 1.3],
        zeroline: true,
        zerolinecolor: '#000000',
        zerolinewidth: 5,
        scaleanchor: 'x',
        //scaleratio: 1,
        //dtick: 0.02,
        showspikes: false,
        title: {
          text: 'G'
        }
      },
      zaxis: {
        //autorange: true,
        range: [-0.3, 1.3],
        zeroline: true,
        zerolinecolor: '#000000',
        zerolinewidth: 5,
        scaleanchor: 'x',
        //dtick: 0.02,
        showspikes: false,
        title: {
          text: 'B'
        }
      },
    }
  };
 
  var plot = document.getElementById(plotId);
  Plotly.newPlot(plot, data, layout);

  return plot;
}

function updatePlot(theta, plotId) {
  var u = 1/Math.sqrt(3)
  var cos = Math.cos(theta)
  var sin = Math.sin(theta)

  var rotMat = [
    [cos + u*u*(1-cos), u*u*(1-cos)-u*sin, u*u*(1-cos)+u*sin],
    [u*u*(1-cos)+u*sin, cos+u*u*(1-cos), u*u*(1-cos)-u*sin],
    [u*u*(1-cos)-u*sin, u*u*(1-cos)+u*sin, cos+u*u*(1-cos)]
  ];

  // Convention: in |Points| each color is a column and in |Colors| each color is a row
  var rotPoints_RGB = math.multiply(rotMat, math.transpose([color1, color2, color3]));
  rotColors_sRGB = [RGB2sRGB([rotPoints_RGB[0][0], rotPoints_RGB[1][0], rotPoints_RGB[2][0]]),
                    RGB2sRGB([rotPoints_RGB[0][1], rotPoints_RGB[1][1], rotPoints_RGB[2][1]]),
                    RGB2sRGB([rotPoints_RGB[0][2], rotPoints_RGB[1][2], rotPoints_RGB[2][2]])
                   ];

  // update actual colors in the 3D plot
  var data_update = {'x': [rotPoints_RGB[0]], 'y': [rotPoints_RGB[1]], 'z': [rotPoints_RGB[2]],
                     'marker.color': [rotColors_sRGB], 'text': [rotColors_sRGB]};

  var plot = document.getElementById(plotId);
  Plotly.update(plot, data_update, {}, [12]);

  // update simulated colors in the 3D plot
  var rotPoints_LMS = math.multiply(RGB2lms, rotPoints_RGB);
  var simColors_LMS = project(rotPoints_LMS);
  var simPoints_RGB = math.multiply(lms2RGB, math.transpose(simColors_LMS));
  var simColors_RGB = math.transpose(simPoints_RGB);
  var simColors_sRGB = [RGB2sRGB(simColors_RGB[0]),
                        RGB2sRGB(simColors_RGB[1]),
                        RGB2sRGB(simColors_RGB[2])
                       ];

  var data_update = {'x': [simPoints_RGB[0]], 'y': [simPoints_RGB[1]], 'z': [simPoints_RGB[2]],
                     'marker.color': [simColors_sRGB], 'text': [simColors_sRGB]};
  Plotly.update(plot, data_update, {}, [13]);

  // update square colors
  if (sim) {
    $('#h11').text('');
    $('#h12').text('');
    $('#h13').text('');
    $('#n11').text('');
    $('#n12').text('');
    $('#n13').text('');
    $('#s11').css('background-color', simColors_sRGB[0]);
    $('#s12').css('background-color', simColors_sRGB[1]);
    $('#s13').css('background-color', simColors_sRGB[2]);
  } else {
    $('#h11').text(rotColors_sRGB[0]);
    $('#h12').text(rotColors_sRGB[1]);
    $('#h13').text(rotColors_sRGB[2]);
    $('#n11').text(sRGB2Name(rotColors_sRGB[0]));
    $('#n12').text(sRGB2Name(rotColors_sRGB[1]));
    $('#n13').text(sRGB2Name(rotColors_sRGB[2]));
    $('#s11').css('background-color', rotColors_sRGB[0]);
    $('#s12').css('background-color', rotColors_sRGB[1]);
    $('#s13').css('background-color', rotColors_sRGB[2]);
  }
}

plotRGB('rgbDiv');

function registerSlider(id) {
  //$('input[type=range]').on('input', function() {
  $(id).on('input', function() {
    $('.form-label').html(this.value)
    updatePlot(this.value, 'rgbDiv')
  });
}

registerSlider('#customRange');

function registerSimMode() {
  $('input[type=radio][name=sim]').change(function() {
    if (this.id == 'yes') {
      sim = true;
      $('#b11').prop('disabled', true);
      $('#b12').prop('disabled', true);
      $('#b13').prop('disabled', true);
      $('#submit').prop('disabled', true);
    } else {
      sim = false;
      $('#b11').prop('disabled', false);
      $('#b12').prop('disabled', false);
      $('#b13').prop('disabled', false);
      $('#submit').prop('disabled', false);
    }
    updatePlot($('#customRange').val(), 'rgbDiv');
  });
}

registerSimMode();

function registerPickType() {
  $('input[type=radio][name=pick]').change(function() {
    if (this.id == 'pickp') {
      type = 0;
      line = p_line;
      norm = p_norm1;
    } else if (this.id == 'pickd') {
      type = 1;
      line = d_line;
      norm = d_norm1;
    } else if (this.id == 'pickt') {
      type = 2;
      line = t_line;
      norm = t_norm1;
    }
  });
}

registerPickType();

$(document).ready(function() {
  $('#colorpicker').farbtastic('#color');
});

function registerSetMain(buttonId, squareId, colorId, nameId) {
  $(buttonId).on('click', function(evt) {
    var val = $('#color').val();
    $(squareId).css('background-color', val);
    $(colorId).text(val);
    $(nameId).text(sRGB2Name(val));
  });
}

registerSetMain('#b11', '#s11', '#h11', '#n11');

function registerSetSecondary(buttonId, baseId, textId, squareId, colorId, nameId) {
  $(buttonId).on('click', function(evt) {
    var baseColor = sRGB2RGB(rgb2hex($(baseId).css('background-color')));
    var scale = $(textId).val();

    var val = RGB2sRGB([baseColor[0] + line[0] * scale, baseColor[1] + line[1] * scale, baseColor[2] + line[2] * scale]);
    $(squareId).css('background-color', val);
    $(colorId).text(val);
    $(nameId).text(sRGB2Name(val));
  });
}

registerSetSecondary('#b12', '#s11', '#t12', '#s12', '#h12', '#n12');
registerSetSecondary('#b13', '#s11', '#t13', '#s13', '#h13', '#n13');

$('#t12').val('-0.4');
$('#t13').val('0.4');
$('#b12').trigger('click');
$('#b13').trigger('click');

function registerSubmit(buttonId, rangeId) {
  $(buttonId).on('click', function(evt) {
    color1 = sRGB2RGB(rgb2hex($('#s11').css('background-color')));
    color2 = sRGB2RGB(rgb2hex($('#s12').css('background-color')));
    color3 = sRGB2RGB(rgb2hex($('#s13').css('background-color')));

    $(rangeId).val(0);
    $('.form-label').html('0');
    updatePlot(0, 'rgbDiv');
  });
}

registerSubmit('#submit', '#customRange');
$('#submit').trigger('click');












