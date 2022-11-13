var canvas = (this.__canvas = new fabric.Canvas("c"));
oid = 0;
var objX = [];
var colorChooser = document.getElementById("color");
var code = "";
var colorState = null;

function updateColor() {

  var element = canvas.getActiveObject();
  if (element == undefined) {
    return;
  }

  for (idx in objX) {
    if (objX[idx].id == element.id) {
      element.set('fill', colorChooser.value)
    }
  }

  canvas.renderAll();
  canvas.requestRenderAll();

}

function addRect() {
  var rect = new fabric.Rect({
    id: oid++,
    left: 100,
    top: 100,
    fill: colorChooser.value,
    width: 100,
    height: 100,
  });
  objX.push(rect);
  canvas.add(rect);
}

function addCircle() {
  var circle = new fabric.Circle({
    id: oid++,
    left: 100,
    top: 100,
    fill: colorChooser.value,
    radius: 50,
  });

  objX.push(circle);
  canvas.add(circle);
}

function addTriangle() {
  var Triangle = new fabric.Triangle({
    id: oid++,
    left: 0,
    top: 100,
    fill: colorChooser.value,
    width: 100,
    height: 100,
  });
  console.log(Triangle);
  objX.push(Triangle);
  canvas.add(Triangle);
}

function removeObj() {
  var element = canvas.getActiveObject();
  for (idx in objX) {
    if (objX[idx].id == element.id) {
      objX.splice(idx, 1);
    }
  }
  canvas.remove(element);
  canvas.renderAll();
  canvas.requestRenderAll();
}

function printPos() {
  code = "";
  colorState = null;
  var elEx = undefined; 
  document.getElementById("gcode").innerText = "";
  console.log(objX);
  for (obj of objX) {
    if (obj.type == "circle") {
      genCircle(obj);
      elEx = true;
    } else if (obj.type == "rect") {
      genRect(obj);
    } else if (obj.type == "triangle") {
      genTriangle(obj);
    }
  }
  elEx ? document.getElementById("gcode").value = a + b + c + code + d : document.getElementById("gcode").value = a + c + code + d; 
}

function genRect(rect) {
  var color = rect.fill;
  if (color != colorState) {
    colorState = color;
    code += genGlcolor(color);
  }

  code += "\tglBegin(GL_QUADS);\n";
  code += `\t\tglVertex2f(${rect.lineCoords.tr.x}f,${rect.lineCoords.tr.y}f);\n`;
  code += `\t\tglVertex2f(${rect.lineCoords.tl.x}f,${rect.lineCoords.tl.y}f);\n`;
  code += `\t\tglVertex2f(${rect.lineCoords.bl.x}f,${rect.lineCoords.bl.y}f);\n`;
  code += `\t\tglVertex2f(${rect.lineCoords.br.x}f,${rect.lineCoords.br.y}f);\n`;
  code += "\tglEnd();\n";
}

function genCircle(circle) {
  var color = circle.fill;
  if (color != colorState) {
    colorState = color;
    code += genGlcolor(color);
  }
  var xr = parseFloat(circle.radius);
  var yr = parseFloat(circle.radius);

  if (circle.scaleX != undefined) {
    xr *= parseFloat(circle.scaleX);
  }
  if (circle.scaleY != undefined) {
    yr *= parseFloat(circle.scaleY);
  }
  var cx =
    (parseFloat(circle.lineCoords.tr.x) + parseFloat(circle.lineCoords.bl.x)) /
    2;
  var cy =
    (parseFloat(circle.lineCoords.tr.y) + parseFloat(circle.lineCoords.bl.y)) /
    2;

  if (circle.angle != undefined) {
    code += `
    \tglPushMatrix();
    \tglTranslatef(${cx}f,${cy}f,0.0f);
    \tglRotatef(${circle.angle},0,0,1);
    `;

    code += `\tdispFilledelipse(0,0,${xr},${yr});\n`;
    code += `\tglPopMatrix();\n`;
  } else {
    code += `\tdispFilledelipse(${cx},${cy},${xr},${yr});\n`;
  }
}

function genTriangle(triangle) {
  var color = triangle.fill;
  if (color != colorState) {
    colorState = color;
    code += genGlcolor(color);
  }
  var fx = triangle.lineCoords.bl.x.toFixed(2);
  var fy = triangle.lineCoords.bl.y.toFixed(2);

  var sx = triangle.lineCoords.br.x.toFixed(2);
  var sy = triangle.lineCoords.br.y.toFixed(2);

  var tx =
    (parseFloat(triangle.lineCoords.tr.x.toFixed(2)) +
      parseFloat(triangle.lineCoords.tl.x.toFixed(2))) /
    2;
  var ty =
    (parseFloat(triangle.lineCoords.tr.y.toFixed(2)) +
      parseFloat(triangle.lineCoords.tl.y.toFixed(2))) /
    2;

  code += "\tglBegin(GL_TRIANGLES);\n";
  code += `\t\tglVertex2f(${fx}f,${fy}f);\n`;
  code += `\t\tglVertex2f(${sx}f,${sy}f);\n`;
  code += `\t\tglVertex2f(${tx}f,${ty}f);\n`;
  code += "\tglEnd();\n";
}

function genGlcolor(colorCode) {
  var vals = [];
  for (i = 1; i < colorCode.length; i += 2) {
    vals.push(
      (parseInt("0x" + colorCode[i] + colorCode[i + 1]) / 255).toFixed(2)
    );
  }
  return `glColor3f(${vals[0]}f,${vals[1]}f,${vals[2]}f);\n`;
}
