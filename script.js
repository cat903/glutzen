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
      if (element.type === 'line' || element.customType === 'lineLoop') {
        element.set("stroke", colorChooser.value);
      } else {
        element.set("fill", colorChooser.value);
      }
    }
  }

  canvas.renderAll();
  canvas.requestRenderAll();
}

function updateColor_two() {
  var element = canvas.getActiveObject();
  if (element == undefined) {
    return;
  }
  clOne = document.getElementById('color').value;
  clTwo = document.getElementById('color_x').value;
  for (idx in objX) {
    if (objX[idx].id == element.id) {
      if (element.type === 'line' || element.customType === 'lineLoop') {
        // Gradient for lines/lineloops is not straightforward with current glColor3f approach.
        // For now, set stroke to the first color for simplicity.
        element.set("stroke", clOne);
      } else {
        element.set("fill",new fabric.Gradient({
        type:'linear',
        gradientUnits: 'percentage',
        coords: {x1:0,y1:0,x2:1,y2:0},
        colorStops:[
          {offset:0,color:clOne},
          {offset:1,color:clTwo}
        ]
      }));
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

  var isMousedown = false;
  rect.on("mousedown", () => {
    isMousedown = true;
  });
  rect.on("mouseup", () => {
    isMousedown = false;
  });
  rect.on("mousemove", () => {
    if (isMousedown) {
      document.querySelector(
        ".axis"
      ).innerText = `trXY:(${rect.lineCoords.tr.x.toFixed(
        2
      )},${rect.lineCoords.tr.y.toFixed(
        2
      )})\ntlXY:(${rect.lineCoords.tl.x.toFixed(
        2
      )},${rect.lineCoords.tl.y.toFixed(
        2
      )})\nblXY:(${rect.lineCoords.bl.x.toFixed(
        2
      )},${rect.lineCoords.bl.y.toFixed(
        2
      )})\nbrXY:(${rect.lineCoords.br.x.toFixed(
        2
      )},${rect.lineCoords.br.y.toFixed(2)})\n\n`;
    }
  });
}

function addPolygon() {
  // Predefined points for a pentagon
  var points = [
    { x: 50, y: 0 },
    { x: 100, y: 40 },
    { x: 80, y: 90 },
    { x: 20, y: 90 },
    { x: 0, y: 40 },
  ];
  var polygon = new fabric.Polygon(points, {
    id: oid++,
    left: 150,
    top: 50,
    fill: colorChooser.value,
    strokeWidth: 0, // Polygons are typically filled, not stroked by default
    stroke: 'transparent', // Explicitly set stroke to transparent or a color
    // per object for polygons often means edge color
  });
  objX.push(polygon);
  canvas.add(polygon);

  var isMousedown = false;
  polygon.on("mousedown", () => {
    isMousedown = true;
  });
  polygon.on("mouseup", () => {
    isMousedown = false;
  });
  polygon.on("mousemove", () => {
    if (isMousedown) {
      let coordsStr = "Polygon Vertices:\n";
      // fabric.Polygon points are relative to the object's center.
      // To get canvas coordinates, we need to transform them.
      // polygon.oCoords provides bounding box coordinates.
      // For actual vertices: iterate polygon.points and apply object's transformation matrix.
      const matrix = polygon.calcTransformMatrix();
      polygon.points.forEach((p, i) => {
        const transformedP = fabric.util.transformPoint(p, matrix);
        coordsStr += `P${i + 1}: (${transformedP.x.toFixed(
          2
        )}, ${transformedP.y.toFixed(2)})\n`;
      });
      document.querySelector(".axis").innerText = coordsStr;
    }
  });
}

function addLine() {
  var line = new fabric.Line([50, 100, 200, 200], {
    id: oid++,
    left: 50,
    top: 100,
    stroke: colorChooser.value, // Correctly use chooser value
    strokeWidth: 2,
    fill: null, // Lines don't have a fill
  });
  objX.push(line);
  canvas.add(line);

  var isMousedown = false;
  line.on("mousedown", () => {
    isMousedown = true;
  });
  line.on("mouseup", () => {
    isMousedown = false;
  });
  line.on("mousemove", () => {
    if (isMousedown) {
      // For a line, points are (x1, y1) and (x2, y2)
      // fabric.Line has properties x1, y1, x2, y2 relative to its left/top position
      // To get absolute canvas coordinates, we need to add its left/top
      // However, line.lineCoords provides tl, tr, bl, br which might be simpler for consistency
      // For a simple line, tl is (x1,y1) and br is (x2,y2) if not rotated.
      // If rotated or scaled, these might represent the bounding box.
      // Let's use the direct properties and adjust by line's left/top for now.
      // More robust: use oCoords after object modification.
      // For simplicity and consistency with other shapes, let's try to use lineCoords.
      // For a non-scaled, non-rotated line, tl and br should give the endpoints.
      // line.get('x1'), line.get('y1'), line.get('x2'), line.get('y2') are relative to center of object
      // Let's use its own coordinates, and add its current position (left, top)
      // No, fabric lines are defined by an array [x1, y1, x2, y2] and a left/top position.
      // The points in the array are relative to the left/top of the line object itself.
      // So, absolute x1 is line.left + line.x1, absolute y1 is line.top + line.y1
      // and absolute x2 is line.left + line.x2, absolute y2 is line.top + line.y2.
      // Let's test with lineCoords first as it's used by other shapes.
      // lineCoords.tl, .tr, .bl, .br define the bounding box of the line.
      // For a straight unrotated line, tl=(x1,y1) and br=(x2,y2) might work if x1<x2, y1<y2.
      // Let's use the point array and transform them.
      const p = line.calcLinePoints(); // This gives {x1, y1, x2, y2} in canvas coords
      document.querySelector(
        ".axis"
      ).innerText = `P1:(${p.x1.toFixed(2)}, ${p.y1.toFixed(
        2
      )})\nP2:(${p.x2.toFixed(2)}, ${p.y2.toFixed(2)})\n\n`;
    }
  });
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

  var isMousedown = false;
  circle.on("mousedown", () => {
    isMousedown = true;
  });
  circle.on("mouseup", () => {
    isMousedown = false;
  });
  circle.on("mousemove", () => {
    if (isMousedown) {
      var xr = parseFloat(circle.radius);
      var yr = parseFloat(circle.radius);

      if (circle.scaleX != undefined) {
        xr *= parseFloat(circle.scaleX);
      }
      if (circle.scaleY != undefined) {
        yr *= parseFloat(circle.scaleY);
      }
      var cx =
        (parseFloat(circle.lineCoords.tr.x) +
          parseFloat(circle.lineCoords.bl.x)) /
        2;
      var cy =
        (parseFloat(circle.lineCoords.tr.y) +
          parseFloat(circle.lineCoords.bl.y)) /
        2;
        document.querySelector(
          ".axis"
        ).innerText = `CX:${cx.toFixed(2)}\nCY:${cy.toFixed(2)}\nXR:${xr.toFixed(
          2
        )}\nYR:${yr.toFixed(2)}`     
    }
  });
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
  objX.push(Triangle);
  canvas.add(Triangle);

  var isMousedown = false;
  Triangle.on("mousedown", () => {
    isMousedown = true;
  });
  Triangle.on("mouseup", () => {
    isMousedown = false;
  });
  Triangle.on("mousemove", () => {
    if (isMousedown) {
      var fx = Triangle.lineCoords.bl.x.toFixed(2);
      var fy = Triangle.lineCoords.bl.y.toFixed(2);

      var sx = Triangle.lineCoords.br.x.toFixed(2);
      var sy = Triangle.lineCoords.br.y.toFixed(2);

      var tx =
        (parseFloat(Triangle.lineCoords.tr.x.toFixed(2)) +
          parseFloat(Triangle.lineCoords.tl.x.toFixed(2))) /
        2;
      var ty =
        (parseFloat(Triangle.lineCoords.tr.y.toFixed(2)) +
          parseFloat(Triangle.lineCoords.tl.y.toFixed(2))) /
        2;

        document.querySelector(
          ".axis"
        ).innerText = `(fx,fy):(${fx},${fy})\n(sx,sy):(${sx},${sy})\n(tx,ty):(${tx.toFixed(2)},${ty})\n`
    }
  });
}

function addLineLoop() {
  // Predefined points for a square line loop
  var points = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  // For LineLoop, we use fabric.Polygon but style it as a loop
  var lineLoop = new fabric.Polygon(points, {
    id: oid++,
    left: 200,
    top: 150,
    fill: 'transparent', // No fill for a line loop
    stroke: colorChooser.value, // Stroke color from chooser
    strokeWidth: 2,
    objectCaching: false, // May help with rendering updates for non-filled objects
    // A custom type property to distinguish from filled polygons if needed later
    // For now, we rely on fill === 'transparent' and having a stroke.
    // Or, more robustly, add a custom type:
    customType: 'lineLoop'
  });
  objX.push(lineLoop);
  canvas.add(lineLoop);

  var isMousedown = false;
  lineLoop.on("mousedown", () => {
    isMousedown = true;
  });
  lineLoop.on("mouseup", () => {
    isMousedown = false;
  });
  lineLoop.on("mousemove", () => {
    if (isMousedown) {
      let coordsStr = "LineLoop Vertices:\n";
      const matrix = lineLoop.calcTransformMatrix();
      lineLoop.points.forEach((p, i) => {
        const transformedP = fabric.util.transformPoint(p, matrix);
        coordsStr += `P${i + 1}: (${transformedP.x.toFixed(
          2
        )}, ${transformedP.y.toFixed(2)})\n`;
      });
      document.querySelector(".axis").innerText = coordsStr;
    }
  });
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
  document.querySelector(
    ".axis"
  ).innerText = ''
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
    } else if (obj.type == "line") {
      genLine(obj);
    } else if (obj.type == "polygon" && obj.customType !== 'lineLoop') { // Standard polygon
      genPolygon(obj);
    } else if (obj.customType === 'lineLoop') { // Line loop
      genLineLoop(obj);
    }
  }
  elEx
    ? (document.getElementById("gcode").value = a + b + c + code + d)
    : (document.getElementById("gcode").value = a + c + code + d);
}

function genRect(rect) {
  var color = document.getElementById('color').value;
  color_two = document.getElementById('color_x').value;
  if(color!==color_two){
    code += `\t${genGlcolor(color_two)}`
  }
  else if (color != colorState) {
    colorState = color;
    code += genGlcolor(color);
  }
  code += "\tglBegin(GL_QUADS);\n";
  code += `\t\tglVertex2f(${rect.lineCoords.tr.x.toFixed(2)}f,${rect.lineCoords.tr.y.toFixed(2)}f);\n`;
  if(color!==color_two){
    code += `\t\t${genGlcolor(color)}`
  }
  code += `\t\tglVertex2f(${rect.lineCoords.tl.x.toFixed(2)}f,${rect.lineCoords.tl.y.toFixed(2)}f);\n`;
  code += `\t\tglVertex2f(${rect.lineCoords.bl.x.toFixed(2)}f,${rect.lineCoords.bl.y.toFixed(2)}f);\n`;
  if(color!==color_two){
    code += `\t\t${genGlcolor(color_two)}`
  }
  code += `\t\tglVertex2f(${rect.lineCoords.br.x.toFixed(2)}f,${rect.lineCoords.br.y.toFixed(2)}f);\n`;
  code += "\tglEnd();\n";
}

function genLineLoop(lineLoop) {
  // Line loops use stroke for color
  var color = lineLoop.stroke;
  if (color != colorState) {
    colorState = color;
    code += genGlcolor(color);
  }

  code += "\tglBegin(GL_LINE_LOOP);\n";
  const matrix = lineLoop.calcTransformMatrix();
  lineLoop.points.forEach((p) => {
    const transformedP = fabric.util.transformPoint(p, matrix);
    code += `\t\tglVertex2f(${transformedP.x.toFixed(2)}f,${transformedP.y.toFixed(2)}f);\n`;
  });
  code += "\tglEnd();\n";
}

function genLine(line) {
  // Lines in fabric.js use 'stroke' for color, not 'fill'
  // The genGlcolor function expects a hex color code like '#RRGGBB'
  // The colorChooser.value provides this.
  // For lines, we should use line.stroke
  var color = line.stroke; // Use stroke color
  if (color != colorState) {
    colorState = color;
    code += genGlcolor(color);
  }

  const p = line.calcLinePoints(); // Gets actual line endpoint coordinates

  code += "\tglBegin(GL_LINES);\n";
  code += `\t\tglVertex2f(${p.x1.toFixed(2)}f,${p.y1.toFixed(2)}f);\n`;
  code += `\t\tglVertex2f(${p.x2.toFixed(2)}f,${p.y2.toFixed(2)}f);\n`;
  code += "\tglEnd();\n";
}

function genPolygon(polygon) {
  var color = polygon.fill;

  // If the fill is a Fabric gradient object, use its first color stop.
  if (typeof color === 'object' && color.type === 'gradient' && color.colorStops.length > 0) {
    processedColor = color.colorStops[0].color;
  } else {
    processedColor = color; // It's a simple color string or not a recognized gradient
  }

  // Set color if it has changed from the last set color state
  if (processedColor != colorState) {
    colorState = processedColor;
    code += genGlcolor(processedColor);
  }

  code += "\tglBegin(GL_POLYGON);\n";
  const matrix = polygon.calcTransformMatrix();
  polygon.points.forEach((p) => {
    const transformedP = fabric.util.transformPoint(p, matrix);
    code += `\t\tglVertex2f(${transformedP.x.toFixed(2)}f,${transformedP.y.toFixed(2)}f);\n`;
  });
  code += "\tglEnd();\n";
}

function genLine(line) {
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
  var color = document.getElementById('color').value;
  color_two = document.getElementById('color_x').value;
  if(color!==color_two){
    code += `\t${genGlcolor(color_two)}`
  }
  else if (color != colorState) {
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
  if(color!==color_two){
    code += `\t\t${genGlcolor(color)}`
  }
  code += `\t\tglVertex2f(${tx.toFixed(2)}f,${ty.toFixed(2)}f);\n`;
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
