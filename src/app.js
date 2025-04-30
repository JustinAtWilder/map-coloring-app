let chosenColor = "#FFFFFF";
let svgElements;
let panZoomInstance;

function handleColorPickerEvent(event) {
  event.preventDefault();
  chosenColor = event.target.value;
}

["touchstart", "pointerdown", "click"].forEach((eventType) => {
  document.getElementById("colorPicker").addEventListener(eventType, handleColorPickerEvent);
});

function handleColorButtonClick(event) {
  event.preventDefault();
  const button = event.currentTarget;
  if (button.classList.contains("stripesBtn")) {
    chosenColor = "url(#stripesPattern)";
  } else {
    chosenColor = button.dataset.color;
  }

}

document.querySelectorAll(".colorBtn, .stripesBtn").forEach((button) => {
  ["touchstart", "pointerdown", "mousedown", "click", "mouseup", "pointerup"].forEach((eventType) => {
    button.addEventListener(eventType, handleColorButtonClick);
  });
});

function addColoringFunctionality() {
  const svg = document.querySelector("#mapContainer svg");
  if (svg) {
    svgElements = svg.querySelectorAll("polygon, path");
    const tribalGroups = {};
    const countyGroups = {};
    
    svgElements.forEach((element) => {
      if (
        !element.classList.contains("tribal") &&
        !element.classList.contains("counties")
      ) {
        return; // Skip elements with no class
      }
      
      if (element.classList.contains("tribal")) {
        element.style.fill = "rgba(153, 153, 153, 0.5)";
        element.style.strokeColor = "#000000";
        element.style.strokeWidth = 0.1; // Default fill color for tribal areas
        const name = element.getAttribute("data-name");
        if (!tribalGroups[name]) {
          tribalGroups[name] = [];
        }
        tribalGroups[name].push(element);
      } else if (element.classList.contains("counties")) {
        element.style.fill = "transparent";
        const name = element.getAttribute("data-name");
        if (!countyGroups[name]) {
          countyGroups[name] = [];
        }
        countyGroups[name].push(element);
      }
      element.dataset.colored = "false"; // Add a flag to track the fill state
      
      function handleElementClick(event) {
        event.preventDefault();
        const name = element.getAttribute("data-name");
        const isColored = element.dataset.colored === "true";
      
        if (element.classList.contains("tribal")) {
          if (isColored) {
            // Reset the fill to the default color
            tribalGroups[name].forEach((tribalElement) => {
              gsap.to(tribalElement, {
                duration: 0.15,
                fill: "rgba(153, 153, 153, 0.5)",
                stroke: "#000000",
                fillOpacity: 1,
              });
            });
      
            // Remove the corresponding legend item
            removeLegendItem(chosenColor);
          } else {
            // Set the fill to the chosen color
            tribalGroups[name].forEach((tribalElement) => {
              gsap.to(tribalElement, {
                duration: 0.15,
                fill: chosenColor,
                stroke: chosenColor,
                fillOpacity: 0.75,
              });
            });
      
            // Add the chosen color to the legend
            addLegendItem(chosenColor);
          }
        } else if (element.classList.contains("counties")) {
          if (isColored) {
            // Reset the fill to transparent
            countyGroups[name].forEach((countyElement) => {
              gsap.to(countyElement, {
                duration: 0.15,
                fill: "transparent",
                stroke: "#000000",
                fillOpacity: 1,
              });
            });
      
            // Remove the corresponding legend item
            removeLegendItem(chosenColor);
          } else {
            // Set the fill to the chosen color
            countyGroups[name].forEach((countyElement) => {
              gsap.to(countyElement, {
                duration: 0.15,
                fill: chosenColor,
                stroke: chosenColor,
                fillOpacity: 0.75,
              });
            });
      
            // Add the chosen color to the legend
            addLegendItem(chosenColor);
          }
        }
      
        // Toggle the colored state
        element.dataset.colored = !isColored;
      
        // Remove highlight styles on click
        gsap.to(element, {
          duration: 0.15,
          stroke: "#000000",
          strokeWidth: 0.1,
        });
      }
      
      

      // Add event listeners for element click
      ["touchstart", "pointerdown", "mousedown", "click", "mouseup", "pointerup"].forEach((eventType) => {
        element.addEventListener(eventType, handleElementClick);
      });

      if (
        element.classList.contains("tribal") ||
        element.classList.contains("counties")
      ) {
        element.addEventListener("mouseover", () => {
          if (element.dataset.colored === "false") {
            let strokeColor;
            if (element.classList.contains("counties")) {
              strokeColor = "#669966";
            } else if (element.classList.contains("tribal")) {
              strokeColor = "#FF9933";
            } else {
              strokeColor = "#000000"; // Default stroke color
            }
            gsap.to(element, {
              duration: 0.15,
              stroke: strokeColor,
              strokeWidth: 1.3,
            }); // Highlight color
          }
        });

        if (element.classList) {
          element.addEventListener("mouseout", () => {
            const name = element.getAttribute("data-name");
            if (element.classList.contains("tribal")) {
              tribalGroups[name].forEach((tribalElement) => {
                gsap.to(tribalElement, {
                  duration: 0.15,
                  stroke: "#000000",
                  strokeWidth: 0.1,
                });
              });
            } else {
              gsap.to(element, {
                duration: 0.15,
                stroke: "#000000",
                strokeWidth: 0.3,
              });
            }
          });
        }

        element.addEventListener("contextmenu", (event) => {
          event.preventDefault(); // Prevent the default context menu from appearing

          // Position the color picker at the mouse position
          const colorPicker = document.getElementById("colorPicker");
          colorPicker.style.display = "block";
          colorPicker.style.left = `${event.pageX}px`;
          colorPicker.style.top = `${event.pageY}px`;
          colorPicker.value = chosenColor; // Set the color picker's value to the current chosen color

          // Focus on the color picker to open it
          colorPicker.focus();
        });
      }
    });
  }
}

// Hide the color picker when it loses focus
document.getElementById("colorPicker").addEventListener("blur", () => {
  document.getElementById("colorPicker").style.display = "none";
});

function toggleLayerVisibility(layerClass, visible) {
  const svg = document.querySelector("#mapContainer svg");
  if (svg) {
    const layers = svg.querySelectorAll(`.${layerClass}`);
    layers.forEach((layer) => {
      layer.style.display = visible ? "block" : "none";
    });
  }
}

document.getElementById("layerSelector").addEventListener("change", (e) => {
  const layer = e.target.value;
  if (layer === "all") {
    toggleLayerVisibility("counties", true);
    toggleLayerVisibility("tribal", true);
  } else {
    toggleLayerVisibility("counties", layer === "counties");
    toggleLayerVisibility("tribal", layer === "tribal");
  }
  updateLabels(layer);
});

function clearMap() {
  location.reload(); // Refresh the browser to reset the application
}

document.getElementById("clearBtn").addEventListener("click", clearMap);


/////////////////////////////////////////////////////Download Functionality///////////////////////////////////////////////////////

document.getElementById("downloadBtn").addEventListener("click", () => {
  const svg = document.querySelector("#mapContainer svg");
  const legendContainer = document.getElementById("legendContainer");

  // Make sure we have a valid SVG
  if (!svg) {
    console.error("SVG not found");
    return;
  }

  // Clone the SVG to avoid modifying the original
  const clonedSvg = svg.cloneNode(true);

  // Get original dimensions and viewBox
  const originalWidth = svg.clientWidth || svg.width.baseVal.value;
  const originalHeight = svg.clientHeight || svg.height.baseVal.value;

  // Set scaling factor for higher resolution
  const scaleFactor = 6; // Increase this value for higher resolution

  // Ensure the cloned SVG has explicit width and height
  clonedSvg.setAttribute("width", originalWidth * scaleFactor);
  clonedSvg.setAttribute("height", originalHeight * scaleFactor);

  // Make sure the viewBox is set correctly
  if (!clonedSvg.getAttribute("viewBox")) {
    const viewBox = svg.getAttribute("viewBox") || `0 0 ${originalWidth} ${originalHeight}`;
    clonedSvg.setAttribute("viewBox", viewBox);
  }

  // Ensure we have defs section with patterns
  let defs = clonedSvg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    clonedSvg.insertBefore(defs, clonedSvg.firstChild);
  }

  // Copy the #stripesPattern from the original SVG
  const originalDefs = svg.querySelector("defs");
  const stripesPattern = originalDefs.querySelector("#stripesPattern");
  if (stripesPattern && !defs.querySelector("#stripesPattern")) {
    defs.appendChild(stripesPattern.cloneNode(true));
  }

  // Add the legend
  const legendX = Math.max(20, originalWidth - 220); // Position from right, with minimum to prevent negative values
  const legendY = 420;

  const legendGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  legendGroup.setAttribute("id", "legendGroup");
  legendGroup.setAttribute("transform", `translate(${legendX}, ${legendY})`);

  // Add legend background
  const legendItems = Array.from(legendContainer.children);
  const legendBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  legendBg.setAttribute("x", "-10");
  legendBg.setAttribute("y", "-10");
  legendBg.setAttribute("width", "180");
  legendBg.setAttribute("height", (legendItems.length * 30) + 20);
  legendBg.setAttribute("rx", "5"); // Rounded corners
  legendBg.setAttribute("ry", "5");
  legendBg.setAttribute("fill", "white");
  legendBg.setAttribute("fill-opacity", "0.9");
  legendBg.setAttribute("stroke", "#333");
  legendBg.setAttribute("stroke-width", "0");
  legendGroup.appendChild(legendBg);

  // Add legend title
  const legendTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
  legendTitle.setAttribute("x", "5");
  legendTitle.setAttribute("y", "10");
  legendTitle.setAttribute("font-family", "Arial, sans-serif");
  legendTitle.setAttribute("font-size", "14px");
  legendTitle.setAttribute("font-weight", "bold");
  legendTitle.textContent = "Legend";
  legendGroup.appendChild(legendTitle);

  // Add legend items
  legendItems.forEach((item, index) => {
    const colorBox = item.querySelector(".colorBox");
    let colorValue;

    // Try to get the actual computed color from the DOM element
    if (colorBox) {
      if (colorBox.style.backgroundImage && colorBox.style.backgroundImage.includes("repeating-linear-gradient")) {
        colorValue = "url(#stripesPattern)"; // Stripes pattern
      } else {
        colorValue = colorBox.style.backgroundColor || colorBox.dataset.actualColor || "#cccccc";
      }
    } else {
      colorValue = colorBox.dataset.actualColor || "#cccccc";
    }

    // Debug log to check the color value
    console.log(`Legend item ${index} color value: ${colorValue}`);

    const textField = item.querySelector(".legendText");

    // Add color box
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "5");
    rect.setAttribute("y", (index * 30) + 20);
    rect.setAttribute("width", "20");
    rect.setAttribute("height", "20");
    rect.setAttribute("stroke", "black");
    rect.setAttribute("stroke-width", "0.5");

    // Handle stripes pattern or solid color
    if (colorValue === "url(#stripesPattern)") {
      rect.setAttribute("style", "fill: url(#stripesPattern) !important;");
    } else if (colorValue.startsWith("rgba") || colorValue.startsWith("rgb")) {
      rect.setAttribute("style", `fill: ${colorValue} !important;`); // Keep rgba/rgb as is
    } else if (colorValue.startsWith("#") || /^[a-zA-Z]+$/.test(colorValue)) {
      rect.setAttribute("style", `fill: ${colorValue} !important;`); // Hex or named color
    } else {
      rect.setAttribute("style", "fill: gray !important;"); // Default fallback
    }

    // Add description text
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "35");
    text.setAttribute("y", (index * 30) + 35);
    text.setAttribute("font-family", "Arial, sans-serif");
    text.setAttribute("font-size", "12px");

    // Use the actual textarea value for the text content
    if (textField && textField.value) {
      text.textContent = textField.value;
    } else {
      text.textContent = colorValue === "url(#stripesPattern)" ? "Striped pattern" : colorValue || "Unknown";
    }

    legendGroup.appendChild(rect);
    legendGroup.appendChild(text);
  });

  // Add legend to SVG
  clonedSvg.appendChild(legendGroup);

  // Serialize the SVG and create a Blob
  const xmlSerializer = new XMLSerializer();
  const svgString = xmlSerializer.serializeToString(clonedSvg);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const blobUrl = URL.createObjectURL(svgBlob);

  // Create an image element to render the SVG
  const img = new Image();
  img.onload = function () {
    // Create a canvas with scaled dimensions
    const canvas = document.createElement("canvas");
    canvas.width = originalWidth * scaleFactor;
    canvas.height = originalHeight * scaleFactor;
    const ctx = canvas.getContext("2d");

    // Scale the rendering context
    ctx.scale(scaleFactor, scaleFactor);

    // Clear canvas with white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the SVG image onto the canvas
    ctx.drawImage(img, 0, 0, originalWidth, originalHeight);

    // Create download link
    try {
      const imageUrl = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.href = imageUrl;
      downloadLink.download = "map_with_legend.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error creating download:", error);
      alert("There was an error creating the download. Please try again.");
    }
  };

  // Handle potential errors
  img.onerror = function (e) {
    console.error("Error loading SVG image:", e);
    alert("There was an error processing the map. Please try again.");
    URL.revokeObjectURL(blobUrl);
  };

  // Set the source of the image to the Blob URL
  img.src = blobUrl;
});

///////////////////////////////////////////////End of Download Functionality///////////////////////////////////////////////////////


function addLegendItem(color) {
  const legendContainer = document.getElementById("legendContainer");

  // Check if the color already exists in the legend
  const existingItem = Array.from(legendContainer.children).find(
    (item) => item.dataset.color === color
  );
  if (existingItem) return;

  // Create a new legend item
  const legendItem = document.createElement("div");
  legendItem.classList.add("legendItem");
  legendItem.dataset.color = color;

  // Create the color box
  const colorBox = document.createElement("div");
  colorBox.classList.add("colorBox");

  // Handle stripes pattern
  if (color === "url(#stripesPattern)") {
    colorBox.style.backgroundImage = "repeating-linear-gradient(-45deg, #97c350, #97c350 8px, #2074b0 8px, #2074b0 25px)";
    colorBox.style.backgroundSize = "100% 100%";
  } else {
    colorBox.style.backgroundColor = color;
    // Also store the actual color value for later retrieval
    colorBox.dataset.actualColor = color;
  }

  // Create the text field
  const textField = document.createElement("textarea");
  textField.classList.add("legendText");
  textField.maxLength = 256;
  textField.placeholder = "Enter description...";
  textField.style.border = "none";
  textField.style.lineHeight = "1.2em";

  // Add event listener to ensure changes are stored
  textField.addEventListener("input", function() {
    // This ensures the text field's value is saved even if the user doesn't click away
    this.setAttribute("data-value", this.value);
  });

  // Append the color box and text field to the legend item
  legendItem.appendChild(colorBox);
  legendItem.appendChild(textField);

  // Append the legend item to the legend container
  legendContainer.appendChild(legendItem);

    // Log to confirm the legend item was created with the right color
    console.log(`Legend item added with color: ${color}`);
}

function removeLegendItem(color) {
  const legendContainer = document.getElementById("legendContainer");

  // Find the legend item with the matching color
  const legendItem = Array.from(legendContainer.children).find(
    (item) => item.dataset.color === color
  );

  // Remove the legend item if it exists
  if (legendItem) {
    legendContainer.removeChild(legendItem);
    console.log(`Legend item removed with color: ${color}`);
  }
}

window.addEventListener("resize", () => {
  const mapContainer = document.getElementById("mapContainer");
  const legendContainer = document.getElementById("legendContainer");

  // Dynamically adjust the legend's height to match the map
  const mapHeight = mapContainer.offsetHeight;
  legendContainer.style.height = `${mapHeight}px`;
});

async function fetchMapData() {
  try {
    const mapUrl = "src/assets/map_layers_exp2-cropped.svg";
    const response = await fetch(mapUrl);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.text();
    const svgContainer = document.getElementById("mapContainer");
    svgContainer.innerHTML = data; // Append the SVG to the container

    addLabels();
    addColoringFunctionality();

    const svgElement = document.querySelector("#mapContainer svg");
    if (!svgElement) throw new Error("SVG element not found");

    // Add pan and zoom functionality
    const panZoomInstance = svgPanZoom(svgElement, {
      zoomEnabled: true,
      controlIconsEnabled: false,
      fit: true,
      center: true,
    });

    // Add event listeners for zoom controls
    ["touchstart", "pointerdown", "mousedown", "click", "mouseup", "pointerup"].forEach((eventType) => {
      document.getElementById("zoomIn").addEventListener(eventType, (event) => {
        event.preventDefault();
        panZoomInstance.zoomIn();
      });
      document.getElementById("zoomOut").addEventListener(eventType, (event) => {
        event.preventDefault();
        panZoomInstance.zoomOut();
      });
      document.getElementById("resetZoom").addEventListener(eventType, (event) => {
        event.preventDefault();
        panZoomInstance.resetZoom();
        panZoomInstance.resetPan();
      });
    });

    panZoomInstance.disableMouseWheelZoom();
    // Restore the map state from local storage
    restoreMapState();
  } catch (error) {
    console.error("Error fetching the map:", error.message, error.stack);
  }
}

fetchMapData();

function addLabels() {
  const svg = document.querySelector("#mapContainer svg");
  if (svg) {
    const paths = svg.querySelectorAll("path");
    const countyLabels = {};
    const tribalLabels = {};

    paths.forEach((path) => {
      const name = path.getAttribute("data-name");
      if (name) {
        const bbox = path.getBBox();
        const area = bbox.width * bbox.height;
        const isCounty = path.classList.contains("counties");
        const labels = isCounty ? countyLabels : tribalLabels;

        if (!labels[name] || labels[name].area < area) {
          labels[name] = { path, bbox, area };
        }
      }
    });

    const placedLabels = [];

    Object.keys(countyLabels).forEach((name) => {
      const { bbox } = countyLabels[name];
      const text = createMultiLineText(name, bbox);
      text.classList.add("county-label");
      svg.appendChild(text);

      adjustLabelSize(text, bbox, svg);
      avoidLabelOverlap(text, placedLabels);
      placedLabels.push(text);
    });

    Object.keys(tribalLabels).forEach((name) => {
      const { bbox } = tribalLabels[name];
      const text = createMultiLineText(name, bbox);
      text.classList.add("tribal-label");
      svg.appendChild(text);

      adjustLabelSize(text, bbox, svg);
      avoidLabelOverlap(text, placedLabels);
      placedLabels.push(text);
    });
  }
}

function saveMapState() {
  const svg = document.querySelector("#mapContainer svg");
  if (svg) {
    const elements = svg.querySelectorAll("polygon, path");
    const mapState = Array.from(elements).map((element) => ({
      id: element.id,
      fill: element.style.fill,
    }));
    sessionStorage.setItem("mapState", JSON.stringify(mapState));
  }
}

function restoreMapState() {
  const svg = document.querySelector("#mapContainer svg");
  if (svg) {
    const mapState = JSON.parse(sessionStorage.getItem("mapState"));
    if (mapState) {
      mapState.forEach(({ id, fill }) => {
        const element = svg.querySelector("polygon, path");
        if (element) {
          element.style.fill = fill;
        }
      });
    }
  }
}

// Add event listener for orientation changes
window.addEventListener("orientationchange", () => {
  const svg = document.querySelector("#mapContainer svg");
  let panZoomInstance = svgPanZoom(document.querySelector("#mapContainer .canvas"));
  saveMapState();
  restoreMapState();
  panZoomInstance.center();
  panZoomInstance.fit();
  panZoomInstance.resetPan();
  canvas.style.width = "100%";
  canvas.style.justifyContent = "center";
  canvas.style.justifySelf = "center";
  window.location.replace(window.location.href)
});

function createMultiLineText(name, bbox, index) {
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line"); // Create a line element for leader lines
  const svg = document.querySelector("#mapContainer svg"); // Ensure svg is correctly referenced
  text.setAttribute("x", bbox.x + bbox.width / 2);
  text.setAttribute("y", bbox.y + bbox.height / 2);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("alignment-baseline", "text-after-edge");
  text.setAttribute("font-size", "5px");
  text.setAttribute("fill", "black");

  if (name === "Chippewa" || name === "Nicollet") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("y", bbox.y + bbox.height / 3 + 1);
    text.setAttribute("dx", "0.8em");
    text.setAttribute("text-anchor", "middle");
  }
  if (name === "Sibley" || name === "Brown") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("y", bbox.y + bbox.height / 1.3);
    text.setAttribute("text-anchor", "middle");
  }
  if (name === "Le Sueur") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("text-anchor", "middle");
  }
  if (
    name === "Kandiyohi" ||
    name === "Cottonwood" ||
    name === "Watonwan" ||
    name === "Houston" ||
    name === "Bois Forte"
  ) {
    text.setAttribute("font-size", "4px");
    text.setAttribute("text-anchor", "middle");
  }
  if (name === "Sherburne" || name === "Benton") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("dx", "0.8em");
  }
  if (name === "Goodhue") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("y", bbox.y + bbox.height / 1.5);
    text.setAttribute("dx", "-1.7em");
  }
  if (name === "Wadena") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("y", bbox.y + bbox.height / 1.5);
    text.setAttribute("dx", "-0.33em");
  }
  if (name === "Winona") {
    text.setAttribute("y", bbox.y + bbox.height / 1.6);
    text.setAttribute("dx", "-1em");
  }
  if (
    name === "Dakota" ||
    name === "Carlton" ||
    name === "Morrison" ||
    name === "Becker" ||
    name === "St. Louis"
  ) {
    text.setAttribute("y", bbox.y + bbox.height / 1.5);
  }
  if (name === "Big Stone" || name === "Wilkin") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("y", bbox.y + bbox.height / 3.3);
  }
  if (name === "Lac qui Parle") {
    text.setAttribute("font-size", "5px");
    text.setAttribute("y", bbox.y + bbox.height / 2);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("text-align", "middle");
  }
  if (name === "Chisago") {
    text.setAttribute("font-size", "3.75px");
    text.setAttribute("y", bbox.y + bbox.height / 1.5);
    text.setAttribute("dx", ".4em");
  }
  if (name === "Fond du Lac") {
    text.setAttribute("font-size", "3.5px");
    text.setAttribute("y", bbox.y + bbox.height / 2.85);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dx", "-1.5pt");
  }
  if (name === "Hennepin" || name === "Isanti") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("y", bbox.y + bbox.height / 1.75);
    text.setAttribute("dx", "-0.5em");
  }
  if (name === "Polk") {
    text.setAttribute("font-size", "5.5px");
    text.setAttribute("y", bbox.y + bbox.height / 1.2);
    text.setAttribute("dx", "-0.5em");
  }
  if (name === "Itasca") {
    text.setAttribute("y", bbox.y + bbox.height / 2);
    text.setAttribute("dx", "2em");
  }
  if (name === "Beltrami") {
    text.setAttribute("y", bbox.y + bbox.height / 1.2);
    text.setAttribute("dx", "1.5em");
  }
  if (name === "Wright") {
    text.setAttribute("y", bbox.y + bbox.height / 1.5);
    text.setAttribute("dx", "-0.5em");
  }
  if (name === "Lake of the Woods") {
    text.setAttribute("y", bbox.y + bbox.height / 2.75);
  }
  if (name === "Red Lake") {
    text.setAttribute("text-anchor", "start");
  }
  if (name === "Leech Lake") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("y", bbox.y + bbox.height / 5.75);
    text.setAttribute("text-anchor", "start");
  }
  if (name === "Mille Lacs ") {
    text.setAttribute("font-size", "5px");
    text.setAttribute("dx", "0.8em");
    text.setAttribute("y", bbox.y + bbox.height / 3.7);
    text.setAttribute(
      "transform",
      `rotate(90, ${bbox.x + bbox.width / 2 - 1}, ${
        bbox.y + bbox.height / 3.5 + 0.2
      })`
    );
    text.setAttribute("rotate", "-90");
    text.setAttribute("text-anchor", "start");
    text.setAttribute("letter-spacing", "0.55em"); // Add space between each glyph
  }
  if (name === "Mille Lacs") {
    text.setAttribute("font-size", "3.5px");
    text.setAttribute("y", bbox.y + bbox.height / 4 + 4);
    text.setAttribute("dx", "20em");
    text.setAttribute("text-anchor", "middle");
    line.setAttribute("x1", bbox.x + bbox.width / 2);
    line.setAttribute("y1", bbox.y + bbox.height / 2 + 4);
    line.setAttribute("x2", bbox.x + bbox.width / 2 + 62); // Adjust the x2 and y2 values as needed
    line.setAttribute("y2", bbox.y + bbox.height / 2);
    line.setAttribute("stroke", "grey");
    line.setAttribute("stroke-width", "0.3");
    svg.appendChild(line);
  }
  if (name === "Kanabec") {
    text.setAttribute("font-size", "3.5px");
    text.setAttribute("y", bbox.y + bbox.height / 4);
    text.setAttribute("dx", "0.5em");
  }
  if (name === "Pine") {
    text.setAttribute("font-size", "5px");
    text.setAttribute("y", bbox.y + bbox.height / 1.7);
  }
  if (name === "Minnesota Chippewa") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("text-anchor", "start");
    text.setAttribute("dx", "0.5em");
  }
  if (name === "White Earth") {
    text.setAttribute("font-size", "5px");
    text.setAttribute("y", bbox.y + bbox.height / 2.5);
    text.setAttribute("text-anchor", "end");
  }
  if (name === "Washington") {
    text.setAttribute("font-size", "6px");
    text.setAttribute("y", bbox.y + bbox.height / 3.7);
    text.setAttribute("dx", "3em");
    text.setAttribute(
      "transform",
      `rotate(90, ${bbox.x + bbox.width / 2}, ${bbox.y + bbox.height / 3.5})`
    );
    text.setAttribute("rotate", "-90");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("letter-spacing", "0.5em"); // Add space between each glyph
  }
  if (name === "Ramsey") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("y", bbox.y + bbox.height / 4);
    text.setAttribute("dx", "0.1em");
  }
  if (name === "Traverse") {
    text.setAttribute("font-size", "5px");
    text.setAttribute("y", bbox.y + bbox.height / 1.1);
    text.setAttribute("dx", "0.4em");
  }
  if (name === "Ho-Chunk Nation") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("y", bbox.y + bbox.height / 1);
    text.setAttribute("dx", index === 0 ? "1.8em" : "0.8em");
    text.setAttribute("text-anchor", "right");
    text.setAttribute("text-align", "top");
  }
  if (name === "Prairie Island") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("dx", "4.5em");
  }
  if (name === "Lake Traverse") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("y", bbox.y + bbox.height / 1.5);
    text.setAttribute("x", bbox.x + bbox.width / 2);
    text.setAttribute("dx", "0.7em");
    text.setAttribute("text-anchor", "right");
  }
  if (name === "Scott") {
    text.setAttribute("y", bbox.y + bbox.height / 1.5);
    text.setAttribute("dx", "0.6em");
  }
  if (name === "Shakopee Mdewakanton Sioux") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("y", bbox.y + bbox.height / 3);
    text.setAttribute("dx", "18em");
    // Add leader line
    line.setAttribute("x1", bbox.x + bbox.width / 2);
    line.setAttribute("y1", bbox.y + bbox.height / 2 + 1.3);
    line.setAttribute("x2", bbox.x + bbox.width / 2 + 32); // Adjust the x2 and y2 values as needed
    line.setAttribute("y2", bbox.y + bbox.height / 2);
    line.setAttribute("stroke", "grey");
    line.setAttribute("stroke-width", "0.3");
    svg.appendChild(line);
  }
  if (name === "Lower Sioux") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("y", bbox.y + bbox.height / 20);
    text.setAttribute("dx", "3.5em");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("text-align", "top");
    text.setAttribute("alignment-baseline", "text-before-edge");
  }
  if (name === "Upper Sioux") {
    text.setAttribute("font-size", "4px");
    text.setAttribute("dx", "3.5em");
    text.setAttribute("y", bbox.y + bbox.height / 10);
  }

  const lines = name.split(" ");
  if (
    name === "Mille Lacs" ||
    name === "Mille Lacs " ||
    name === "Prairie Island" ||
    name === "Ho-Chunk Nation" ||
    name === "Shakopee Mdewakanton Sioux" ||
    name === "Lower Sioux" ||
    name === "Upper Sioux" ||
    name === "Lake Traverse" ||
    (name === "Minnesota Chippewa" && text.classList.contains("tribal-label"))
  ) {
    const tspan = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "tspan"
    );
    tspan.setAttribute("x", bbox.x + bbox.width / 2);
    tspan.setAttribute("dy", "0");
    tspan.textContent = name;
    text.appendChild(tspan);
  } else {
    lines.forEach((line, index) => {
      const tspan = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "tspan"
      );
      tspan.setAttribute("x", bbox.x + bbox.width / 2);
      tspan.setAttribute("dy", index === 0 ? "0" : "1em");
      tspan.textContent = line;
      text.appendChild(tspan);
    });
  }

  return text;
}

function adjustLabelSize(text, bbox, _svg) {
  let fontSize = 4;
  while (fontSize > 3 && text.getBBox().width > bbox.width) {
    fontSize -= 1;
    text.setAttribute("font-size", fontSize);
    text.setAttribute("y", parseFloat(text.getAttribute("y")) + 1);
    text.setAttribute("x", parseFloat(text.getAttribute("x")));
  }
}

function avoidLabelOverlap(text, placedLabels) {
  const padding = 0; // Padding around labels
  const bbox = text.getBBox();

  placedLabels.forEach((placedLabel) => {
    const placedBbox = placedLabel.getBBox();
    if (isOverlapping(bbox, placedBbox, padding)) {
      // Adjust the position of the label to avoid overlap
      const newY =
        parseFloat(text.getAttribute("y")) + placedBbox.height + padding;
      text.setAttribute("y", newY);
      const newX = parseFloat(text.getAttribute("x"));
      text.setAttribute("x", newX);
    }
  });
}

function isOverlapping(bbox1, bbox2, padding) {
  return !(
    bbox1.x + bbox1.width + padding < bbox2.x ||
    bbox1.x - padding > bbox2.x + bbox2.width ||
    bbox1.y + bbox1.height + padding < bbox2.y ||
    bbox1.y - padding > bbox2.y + bbox2.height
  );
}

function updateLabels(layer) {
  const svg = document.querySelector("#mapContainer svg");
  if (svg) {
    const countyLabels = svg.querySelectorAll(".county-label");
    const tribalLabels = svg.querySelectorAll(".tribal-label");

    countyLabels.forEach((label) => {
      label.style.display =
        layer === "counties" || layer === "all" ? "block" : "none";
    });

    tribalLabels.forEach((label) => {
      label.style.display =
        layer === "tribal" || layer === "all" ? "block" : "none";
    });
  }
}
