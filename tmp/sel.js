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

function get_proj_mat() {
  // https://daltonlens.org/understanding-cvd-simulation/
  if (simMethod == 1) {
    // Viénot 1999 (one plane); an approximation of Brettel 1997 (two planes).
    // for protanopia and deuteranopia they use the black-blue-yellow-white plane;
    // for tritanopia the paper didn't say what to do here we simply use black-red-cyan-white plane.
    var sRGBWhite = math.multiply(get_RGB2lms(), [1, 1, 1]);
    var sRGBBlue = math.multiply(get_RGB2lms(), [0, 0, 1]);
    var sRGBRed = math.multiply(get_RGB2lms(), [1, 0, 0]);
    var sRGBYellow = math.multiply(get_RGB2lms(), [1, 1, 0]);
    var sRGBCyan = math.multiply(get_RGB2lms(), [0, 1, 1]);

    var p_norm1 = math.cross(sRGBBlue, sRGBYellow);
    var d_norm1 = p_norm1;
    var t_norm1 = math.cross(sRGBRed, sRGBCyan);

    var p_proj_mat = [[0, -p_norm1[1]/p_norm1[0], -p_norm1[2]/p_norm1[0]], [0, 1, 0], [0, 0, 1]];
    var d_proj_mat = [[1, 0, 0], [-d_norm1[0]/d_norm1[1], 0, -d_norm1[2]/d_norm1[1]], [0, 0, 1]];
    var t_proj_mat = [[1, 0, 0], [0, 1, 0], [-t_norm1[0]/t_norm1[2], -t_norm1[1]/t_norm1[2], 0]];

    return [p_proj_mat, d_proj_mat, t_proj_mat];
  } else {
    // Brettel 1997 (two planes).
    // in LMS space (transformed from JV-modified XYZ)
    var a475 = [0.0509384206, 0.0618970658, 0.015150576];
    var a485 = [0.0818313433, 0.0880318619, 0.009429312];
    var a575 = [0.6281339073, 0.2874094695, 0.000031687248];
    var a660 = [0.05820210417, 0.002795455831, 0.00000019144848];
    var aEEW = [14.30506543, 7.190126944, 0.3379046085];
    var sRGBWhite = math.multiply(get_RGB2lms(), [1, 1, 1]);
    var aWhite = aEEW; // (Brettel 97 uses EEW and Vienot 99 uses sRGBWhite)

    var p_norm1 = math.cross(aWhite, a475);
    var p_norm2 = math.cross(aWhite, a575);
    var d_norm1 = p_norm1;
    var d_norm2 = p_norm2;
    var t_norm1 = math.cross(aWhite, a485);
    var t_norm2 = math.cross(aWhite, a660);

    // the results are close to values calculated by https://daltonlens.org/understanding-cvd-simulation/
    var p_proj_mat1 = [[0, -p_norm1[1]/p_norm1[0], -p_norm1[2]/p_norm1[0]], [0, 1, 0], [0, 0, 1]]; // 475
    var d_proj_mat1 = [[1, 0, 0], [-d_norm1[0]/d_norm1[1], 0, -d_norm1[2]/d_norm1[1]], [0, 0, 1]]; // 475
    var t_proj_mat1 = [[1, 0, 0], [0, 1, 0], [-t_norm1[0]/t_norm1[2], -t_norm1[1]/t_norm1[2], 0]]; // 485

    var p_proj_mat2 = [[0, -p_norm2[1]/p_norm2[0], -p_norm2[2]/p_norm2[0]], [0, 1, 0], [0, 0, 1]]; // 575
    var d_proj_mat2 = [[1, 0, 0], [-d_norm2[0]/d_norm2[1], 0, -d_norm2[2]/d_norm2[1]], [0, 0, 1]]; // 575
    var t_proj_mat2 = [[1, 0, 0], [0, 1, 0], [-t_norm2[0]/t_norm2[2], -t_norm2[1]/t_norm2[2], 0]]; // 660

    return [p_proj_mat1, d_proj_mat1, t_proj_mat1, p_proj_mat2, d_proj_mat2, t_proj_mat2];
  }
}

function get_RGB2lms() {
  var xyz2lms, RGB2xyz;

  // XYZ <--> LMS mats based on Smith & Pokorny using Judd corrected XYZ (used by Brettel 1997 & Viénot 1999)
  // http://cvrl.ioo.ucl.ac.uk/database/text/cones/sp.htm
  xyz2lms = [[0.15514, 0.54312, -0.03286], [-0.15514, 0.45684, 0.03286], [0, 0, 0.01608]];
  RGB2xyz = [[40.9568, 35.5041, 17.9167], [21.3389, 70.6743, 7.9868], [1.86297, 11.462, 91.2367]];

  // XYZ <--> LMS mats using HPE
  // (used by https://ixora.io/projects/colorblindness/color-blindness-simulation-research/)
  //var hpe_xyz2lms_eew = [[0.3897,0.689,-0.0787], [-0.2298,1.1834,0.0464], [0,0,1]]; // EEW normalized
  //var hpe_xyz2lms_d65 = [[0.4002,0.7076,-0.0808], [-0.2263,1.1653,0.0457], [0,0,0.9182]]; // D65 adapted
  //xyz2lms = hpe_xyz2lms_d65;
  // this is D65 adapted
  //RGB2xyz = [[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750], [0.0193339, 0.1191920, 0.9503041]];

  var RGB2lms = math.multiply(xyz2lms, RGB2xyz);
  return RGB2lms;
}

var RGB2lms = get_RGB2lms();
var lms2RGB = math.inv(RGB2lms);

function get_confusion_lines() {
  // vectors for confusion lines (derived from Sharma LUTs)
  //var p_line = [0.9795006397, -0.2013704401, 0.005333160206];
  //var d_line = [-0.8959739281, 0.4425391762, -0.03727999099];
  //var t_line = [0.1428342021, -0.1413451732, 0.9796019256];
  
  // vectors for confusion lines (derived using lms2RGB matrix)
  var p_line = normalize(math.multiply(lms2RGB, [1, 0, 0]));
  var d_line = normalize(math.multiply(lms2RGB, [0, 1, 0]));
  var t_line = normalize(math.multiply(lms2RGB, [0, 0, 1]));

  return [p_line, d_line, t_line];
}

var confusion_lines = get_confusion_lines();

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
// if |clip| true, use the absolute rendering intent to clip
function RGB2sRGB(color, clip) {
  var out = [];
  for(var i = 0; i < 3; i++) {
    if (color[i] <= 0.0031308) out[i] = parseInt((12.92 * color[i] * 255).toFixed());
    else out[i] = parseInt(((1.055 * Math.pow(color[i], 1/2.4) - 0.055) * 255).toFixed());

    if (clip) {
      if (out[i] < 0) out[i] = 0;
      else if (out[i] > 255) out[i] = 255; 
    } else {
      if (out[i] < 0 || out[i] > 255)
        return '#000000';
    }
  }

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

function normalize(vec) {
  return math.divide(vec, math.norm(vec));
}

function project(colors_LMS) {
  // in input each column is a color

  if (simMethod == 1) {
    // one plane
    return math.multiply(proj_mat[type], colors_LMS);
  } else {
    // two planes
    var outColors1 = math.multiply(proj_mat[type], colors_LMS);
    var outColors2 = math.multiply(proj_mat[type + 3], colors_LMS);
    var outColors = [];

    var whiteLMS = math.multiply(RGB2lms, [1, 1, 1]);
    var wL = whiteLMS[0], wM = whiteLMS[1], wS = whiteLMS[2];

    for (var i = 0; i < colors_LMS[0].length; i++) {
      var L = colors_LMS[0][i];
      var M = colors_LMS[1][i];
      var S = colors_LMS[2][i];

      if (type == 0) {
        if (S/M < wS/wM) mask = 0;
        else mask = 1;
      } else if (type == 1) {
        if (S/L < wS/wL) mask = 0;
        else mask = 1;
      } else {
        if (M/L < wM/wL) mask = 0;
        else mask = 1;
      }

      if (mask == 0) outColors.push(math.transpose(outColors2)[i]);
      else outColors.push(math.transpose(outColors1)[i]);
    }

    return math.transpose(outColors);
  }
}

function plotRGB(plotId) {
  var allPoints = math.transpose([[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]]);

  var traces = [];

  // O: 0; R: 1; G: 2: B: 3
  // RG: 4; RB: 5; GB: 6; RGB: 7
  var indices = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 4], [2, 6], [3, 5], [3, 6], [4, 7], [5, 7], [6, 7], [0, 7]];
  var names = ['O', 'R', 'G', 'B', 'R+G', 'R+B', 'G+B', 'W'];
  var hoverInfo = [true, true, true, 'skip', 'skip', 'skip', 'skip', 'skip', 'skip', true, true, true, 'skip'];
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
    name: 'Actual colors',
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
    name: 'Simulation',
    opacity:0.8,
    hovertemplate: 'Simulation: %{text}<br>' +
      '<br>R: %{x}' +
      '<br>G: %{y}' +
      '<br>B: %{z}<extra></extra>',
  };
  traces.push(sim_line);

  // Brettel projection planes
  var a475_lms = [0.0509384206, 0.0618970658, 0.015150576];
  var a485_lms = [0.0818313433, 0.0880318619, 0.009429312];
  var a575_lms = [0.6281339073, 0.2874094695, 0.000031687248];
  var a660_lms = [0.05820210417, 0.002795455831, 0.00000019144848];
  var aEEW_lms = [14.30506543, 7.190126944, 0.3379046085];
  var a475_RGB = math.multiply(lms2RGB, a475_lms);
  var a575_RGB = math.multiply(lms2RGB, a575_lms);
  var a485_RGB = math.multiply(lms2RGB, a485_lms);
  var a660_RGB = math.multiply(lms2RGB, a660_lms);
  var aEEW_RGB = math.multiply(lms2RGB, aEEW_lms);

  // planes for protanopia and deutanopia
  var prot_plane1 = {
    x: [-aEEW_RGB[0]*500, a475_RGB[0]*500, aEEW_RGB[0]*500],
    y: [-aEEW_RGB[1]*500, a475_RGB[1]*500, aEEW_RGB[1]*500],
    z: [-aEEW_RGB[2]*500, a475_RGB[2]*500, aEEW_RGB[2]*500],
    i: [0],
    j: [1],
    k: [2],
    type: 'mesh3d',
    opacity: 0.3,
    color: purpleColor,
    showlegend: true,
    name: 'Protanopia/Deutanopia Plane 1',
    hoverinfo: 'skip',
    visible: 'legendonly',
  };

  var prot_plane2 = {
    x: [-aEEW_RGB[0]*500, a575_RGB[0]*500, aEEW_RGB[0]*500],
    y: [-aEEW_RGB[1]*500, a575_RGB[1]*500, aEEW_RGB[1]*500],
    z: [-aEEW_RGB[2]*500, a575_RGB[2]*500, aEEW_RGB[2]*500],
    i: [0],
    j: [1],
    k: [2],
    type: 'mesh3d',
    opacity: 0.3,
    color: orangeColor,
    showlegend: true,
    name: 'Protanopia/Deutanopia Plane 2',
    hoverinfo: 'skip',
    visible: 'legendonly',
  };

  // planes for tritanopia
  var tri_plane1 = {
    x: [-aEEW_RGB[0]*500, a485_RGB[0]*500, aEEW_RGB[0]*500],
    y: [-aEEW_RGB[1]*500, a485_RGB[1]*500, aEEW_RGB[1]*500],
    z: [-aEEW_RGB[2]*500, a485_RGB[2]*500, aEEW_RGB[2]*500],
    i: [0],
    j: [1],
    k: [2],
    type: 'mesh3d',
    color: oGreenColor,
    hoverinfo: 'skip',
    showlegend: true,
    name: 'Tritanopia Plane 1',
    visible: 'legendonly',
  };

  var tri_plane2 = {
    x: [-aEEW_RGB[0]*500, a660_RGB[0]*500, aEEW_RGB[0]*500],
    y: [-aEEW_RGB[1]*500, a660_RGB[1]*500, aEEW_RGB[1]*500],
    z: [-aEEW_RGB[2]*500, a660_RGB[2]*500, aEEW_RGB[2]*500],
    i: [0],
    j: [1],
    k: [2],
    type: 'mesh3d',
    color: oRedColor,
    hoverinfo: 'skip',
    showlegend: true,
    name: 'Tritanopia Plane 2',
    visible: 'legendonly',
  };

  traces.push(prot_plane1, prot_plane2, tri_plane1, tri_plane2);

  var data = traces;

  var layout = {
    height: 600,
    width: 600,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0
    },
    showlegend: true,
    legend: {
      x: 0,
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

function reorderColors(simColors_RGB) {
  if (setter != 1) return simColors_RGB;

  var v1 = parseFloat($('#t12').val());
  var v2 = parseFloat($('#t13').val());

  if (isNaN(v1) || isNaN(v2)) return simColors_RGB;

  var tempColors = [];
  if ((v1 > 0 && 0 > v2) || (v2 > 0 && 0 > v1)) {
    tempColors[0] = simColors_RGB[1];
    tempColors[1] = simColors_RGB[0];
    tempColors[2] = simColors_RGB[2];
  } else if ((v1 > v2 && v2 > 0) || (0 > v2 && v2 > v1)) {
    tempColors[0] = simColors_RGB[1];
    tempColors[1] = simColors_RGB[2];
    tempColors[2] = simColors_RGB[0];
  } else if ((v2 > v1 && v1 > 0) || (0 > v1 && v1 > v2)) {
    tempColors = simColors_RGB;
  }
  return tempColors;
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
  rotColors_sRGB = [RGB2sRGB([rotPoints_RGB[0][0], rotPoints_RGB[1][0], rotPoints_RGB[2][0]], true),
                    RGB2sRGB([rotPoints_RGB[0][1], rotPoints_RGB[1][1], rotPoints_RGB[2][1]], true),
                    RGB2sRGB([rotPoints_RGB[0][2], rotPoints_RGB[1][2], rotPoints_RGB[2][2]], true)
                   ];

  // update actual colors in the 3D plot
  var data_update = {'x': [rotPoints_RGB[0]], 'y': [rotPoints_RGB[1]], 'z': [rotPoints_RGB[2]],
                     'marker.color': [rotColors_sRGB], 'text': [rotColors_sRGB]};

  var plot = document.getElementById(plotId);
  Plotly.update(plot, data_update, {}, [13]);

  // update simulated colors in the 3D plot
  var rotPoints_LMS = math.multiply(RGB2lms, rotPoints_RGB);
  var simPoints_LMS = project(rotPoints_LMS);
  var simPoints_RGB = math.multiply(lms2RGB, simPoints_LMS);
  var simColors_RGB = math.transpose(simPoints_RGB);
  var simColors_sRGB = [RGB2sRGB(simColors_RGB[0], true),
                        RGB2sRGB(simColors_RGB[1], true),
                        RGB2sRGB(simColors_RGB[2], true)
                       ];

  // reorder columns in simPoints_RGB geometrically for nicer 3D plotting
  // but we should keep the original simPoints_RGB so that we don't switch order in squares
  var ro_simColors_RGB = reorderColors(simColors_RGB);
  var ro_simPoints_RGB = math.transpose(ro_simColors_RGB);

  var ro_simColors_sRGB = [RGB2sRGB(ro_simColors_RGB[0], true),
                           RGB2sRGB(ro_simColors_RGB[1], true),
                           RGB2sRGB(ro_simColors_RGB[2], true)
                          ];

  var data_update = {'x': [ro_simPoints_RGB[0]], 'y': [ro_simPoints_RGB[1]], 'z': [ro_simPoints_RGB[2]],
                     'marker.color': [ro_simColors_sRGB], 'text': [ro_simColors_sRGB]};
  Plotly.update(plot, data_update, {}, [14]);

  // update square colors
  if (sim) {
  //  $('#h11').text('');
  //  $('#h12').text('');
  //  $('#h13').text('');
  //  $('#n11').text('');
  //  $('#n12').text('');
  //  $('#n13').text('');
    $('#s11').css('background-color', simColors_sRGB[0]);
    $('#s12').css('background-color', simColors_sRGB[1]);
    $('#s13').css('background-color', simColors_sRGB[2]);
  } else {
  //  $('#h11').text(rotColors_sRGB[0]);
  //  $('#h12').text(rotColors_sRGB[1]);
  //  $('#h13').text(rotColors_sRGB[2]);
  //  $('#n11').text(sRGB2Name(rotColors_sRGB[0]));
  //  $('#n12').text(sRGB2Name(rotColors_sRGB[1]));
  //  $('#n13').text(sRGB2Name(rotColors_sRGB[2]));
    $('#s11').css('background-color', rotColors_sRGB[0]);
    $('#s12').css('background-color', rotColors_sRGB[1]);
    $('#s13').css('background-color', rotColors_sRGB[2]);
  }
  // show names for the original colors (not dynamically updated with slider)
  $('#h11').text('');
  $('#h12').text('');
  $('#h13').text('');
  $('#n11').text(name1);
  $('#n12').text(name2);
  $('#n13').text(name3);
}

function registerSlider(id) {
  //$('input[type=range]').on('input', function() {
  $(id).on('input', function() {
    $('.form-label').html('Rotation Angle (Degree): ' + (this.value/Math.PI*180).toFixed(2) + '&#176;')
    updatePlot(this.value, 'rgbDiv')
  });
}

function registerSimMode() {
  $('input[type=radio][name=sim]').change(function() {
    if (this.id == 'yes') {
      sim = true;
    } else {
      sim = false;
    }

    if (init) updatePlot($('#customRange').val(), 'rgbDiv');
  });
}

function registerPickType() {
  $('input[type=radio][name=pick]').change(function() {
    if (this.id == 'pickp') {
      type = 0;
    } else if (this.id == 'pickd') {
      type = 1;
    } else if (this.id == 'pickt') {
      type = 2;
    }

    // automatically update colors and re-plot
    //$('#b12').trigger('click');
    //$('#b13').trigger('click');
    //$('#play').trigger('click');
  });
}

function registerPickSimMethod() {
  $('input[type=radio][name=method]').change(function() {
    if (this.id == 'm1') {
      // one plane
      simMethod = 1;
    } else {
      // two planes
      simMethod = 0;
    }
    proj_mat = get_proj_mat();

    // automatically update colors and re-plot
    if (init) updatePlot($('#customRange').val(), 'rgbDiv');
  });
}

function registerPickColorSetter() {
  $('input[type=radio][name=setcolor]').change(function() {
    if (this.id == 'picker') {
      $('#c11').prop('disabled', false);
      $('#c12').prop('disabled', false);
      $('#c13').prop('disabled', false);

      $('#t12').prop('disabled', true);
      $('#t13').prop('disabled', true);
      $('#b12').prop('disabled', true);
      $('#b13').prop('disabled', true);

      $('#presets').prop('disabled', true);

      setter = 0;
    } else if (this.id == 'scale') {
      $('#c11').prop('disabled', false);
      $('#c12').prop('disabled', true);
      $('#c13').prop('disabled', true);

      $('#t12').prop('disabled', false);
      $('#t13').prop('disabled', false);
      $('#b12').prop('disabled', false);
      $('#b13').prop('disabled', false);

      $('#presets').prop('disabled', true);

      setter = 1;
    }  else { // 'usepre'
      $('#c11').prop('disabled', true);
      $('#c12').prop('disabled', true);
      $('#c13').prop('disabled', true);

      $('#t12').prop('disabled', true);
      $('#t13').prop('disabled', true);
      $('#b12').prop('disabled', true);
      $('#b13').prop('disabled', true);

      $('#presets').prop('disabled', false);

      setter = 2;
    }

  });
}

function registerColorPicker(baseId, squareId, colorId, nameId) {
  $(baseId).on('change', function(evt) {
    var colorVal = $(baseId).val();
    $(squareId).css('background-color', colorVal);
    //$(colorId).text(val);
    $(nameId).text(sRGB2Name(colorVal));
  });
}

function registerSetScale(buttonId, baseId, textId, squareId, colorId, nameId) {
  $(buttonId).on('click', function(evt) {
    var baseColor = sRGB2RGB(rgb2hex($(baseId).css('background-color')));
    var scale = $(textId).val();
    var colorVal;

    var line = confusion_lines[type];
    colorVal = RGB2sRGB([baseColor[0] + line[0] * scale,
                         baseColor[1] + line[1] * scale,
                         baseColor[2] + line[2] * scale], false);

    $(squareId).css('background-color', colorVal);
    //$(colorId).text(val);
    $(nameId).text(sRGB2Name(colorVal));
  });
}

function registerReset(resetId) {
  $(resetId).on('click', function(evt) {
    $('#customRange').val(0);
    // need to explicitly trigger input event
    $('#customRange').trigger('input');
  });
}

function registerSelectPresets() {
  $('#presets').on('change', function(evt) {
    var val = this.value;
    if (val == "preset1") {
      $('#c11').val(rgb2hex('rgb(237, 238, 51)'));
      $('#c12').val(rgb2hex('rgb(127, 255, 0)'));
      $('#c13').val(rgb2hex('rgb(255, 140, 0)'));
    } else if (val == "preset2") {
      $('#c11').val(rgb2hex('rgb(41, 37, 229)'));
      $('#c12').val(rgb2hex('rgb(148, 0, 211)'));
      $('#c13').val(rgb2hex('rgb(224, 2, 224)'));
    } else if (val == "preset3") {
      $('#c11').val(rgb2hex('rgb(224, 2, 1)'));
      $('#c12').val(rgb2hex('rgb(9, 90, 0)'));
      $('#c13').val(rgb2hex('rgb(151, 91, 57)'));
    } else if (val == "preset4") {
      // these are picked to be on Deutanopia confusion line
      $('#c11').val(rgb2hex('rgb(171, 188, 180)'));
      $('#c12').val(rgb2hex('rgb(228, 160, 182)'));
      $('#c13').val(rgb2hex('rgb(55, 212, 178)'));
    }

    $('#c11').trigger('change');
    $('#c12').trigger('change');
    $('#c13').trigger('change');
  });
}

function submit(rangeId) {
  color1 = sRGB2RGB(rgb2hex($('#s11').css('background-color')));
  color2 = sRGB2RGB(rgb2hex($('#s12').css('background-color')));
  color3 = sRGB2RGB(rgb2hex($('#s13').css('background-color')));
  name1 = sRGB2Name(rgb2hex($('#s11').css('background-color')));
  name2 = sRGB2Name(rgb2hex($('#s12').css('background-color')));
  name3 = sRGB2Name(rgb2hex($('#s13').css('background-color')));

  $(rangeId).val(0);
  $('.form-label').html('Rotation Angle (Degree): 0&#176;');
  updatePlot(0, 'rgbDiv');
}

function registerSetState() {
  $('input[type=radio][name=state]').change(function() {
    if (this.id == 'edit') {
      $('input[type=radio][name=setcolor]:checked').prop("checked", true).trigger('change');

      $('input[type=radio][name=pick]').prop('disabled', false);
      $('input[type=radio][name=setcolor]').prop('disabled', false);
      $('input[type=radio][name=sim]').prop('disabled', true);
      $('input[type=radio][name=method]').prop('disabled', true);
      $('#customRange').prop('disabled', true);
      $('#reset').prop('disabled', true);

      // reset to two-plane approach and show actual colors
      $('#no').prop("checked", true).trigger('change');
      $('#m2').prop("checked", true).trigger('change');
    } else { // 'play'
      $('#c11').prop('disabled', true);
      $('#c12').prop('disabled', true);
      $('#c13').prop('disabled', true);
      $('#b12').prop('disabled', true);
      $('#b13').prop('disabled', true);
      $('#t12').prop('disabled', true);
      $('#t13').prop('disabled', true);
      $('#presets').prop('disabled', true);

      $('input[type=radio][name=pick]').prop('disabled', true);
      $('input[type=radio][name=setcolor]').prop('disabled', true);
      $('input[type=radio][name=sim]').prop('disabled', false);
      $('input[type=radio][name=method]').prop('disabled', false);
      $('#customRange').prop('disabled', false);
      $('#reset').prop('disabled', false);

      submit('#customRange');
    }
  });
}

var init = false;
var simMethod; // 0 for Brettel 1997 (two planes) and 1 for Viénot 1999 (one plane)
var type; // 0 for P, 1 for D, 2 for T
var sim;
var setter; // 0 for using color picker, 1 for using scale, 3 for using presets
var color1, color2, color3;
var name1, name2, name3;

// initial plot with no meaningful data
plotRGB('rgbDiv');

registerSlider('#customRange');
registerSimMode();
registerPickType();
registerPickSimMethod();
registerColorPicker('#c11', '#s11', '#h11', '#n11');
registerColorPicker('#c12', '#s12', '#h12', '#n12');
registerColorPicker('#c13', '#s13', '#h13', '#n13');
registerSetScale('#b12', '#s11', '#t12', '#s12', '#h12', '#n12');
registerSetScale('#b13', '#s11', '#t13', '#s13', '#h13', '#n13');
registerReset('#reset');
registerSelectPresets();
registerPickColorSetter();
registerSetState();

// init color blindness type
$('#pickd').prop("checked", true).trigger('change');

// init simulation method
$('#m2').prop("checked", true).trigger('change');

// choose to show actual colors
$('#no').prop("checked", true).trigger('change');

// by default use preset2 in color setter
$('#usepre').prop("checked", true).trigger('change');
$('#presets').val('preset2');
$('#presets').trigger('change');

// set the mode to play and update the plot with the initial setting
$('#play').attr("checked", true).trigger('change');
init = true;











