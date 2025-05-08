// Handle image upload and display on the canvas
export const handleImageUpload = (
  event,
  setRestroomImage,
  setShowCropper,
  setIsDrawingEnabled
) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      setRestroomImage(reader.result);
      setShowCropper(true);
      setIsDrawingEnabled(true);
    };
    reader.readAsDataURL(file);
  }
};

//  Draw Canvas Content
export const drawCanvas = ({
  canvasRef,
  isDrawingEnabled,
  image,
  polygons,
  currentPolygon,
}) => {
  const canvas = canvasRef.current;
  if (!canvas || !isDrawingEnabled) return;

  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (image) {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  }

  polygons.forEach((polygon) => {
    if (!polygon || !polygon.points) return;

    // Start drawing polygon
    context.beginPath();
    context.moveTo(polygon.points[0].x, polygon.points[0].y);
    polygon.points.forEach((point) => context.lineTo(point.x, point.y));
    context.closePath();

    // Fill the polygon with the color
    context.fillStyle = `${polygon.color}${90}` || "#A449EB60";
    context.strokeStyle = polygon.fillColor || "#A449EB";
    context.fill();

    // Draw the border with the specified color
    context.strokeStyle = polygon.fillColor || polygon.color || "#A449EB60";
    context.lineWidth = 2;
    context.stroke();

    // Determine the label position based on `labelPoint`
    let idX, idY;
    if (polygon?.labelPoint === "first" && polygon.points[0]) {
      idX = polygon.points[0].x;
      idY = polygon.points[0].y - 5;
    } else if (polygon?.labelPoint === "second" && polygon.points[1]) {
      idX = polygon.points[1].x;
      idY = polygon.points[1].y - 5;
    } else if (polygon?.labelPoint === "third" && polygon.points[2]) {
      idX = polygon.points[2].x;
      idY = polygon.points[2].y - 5;
    } else if (polygon?.labelPoint === "fourth" && polygon.points[3]) {
      idX = polygon.points[3].x;
      idY = polygon.points[3].y - 5;
    }

    const padding = 4;
    const text = polygon.id;

    context.font = "12px Arial";
    const textWidth = context.measureText(text).width;
    const textHeight = 14;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = textHeight + padding * 2;
    const boxX = idX - padding;
    const boxY = idY - textHeight - padding;

    // Draw the box background
    context.fillStyle = "#FFFFFF";
    context.beginPath();
    context.moveTo(boxX + 4, boxY);
    context.arcTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + boxHeight, 4);
    context.arcTo(boxX + boxWidth, boxY + boxHeight, boxX, boxY + boxHeight, 4);
    context.arcTo(boxX, boxY + boxHeight, boxX, boxY, 4);
    context.arcTo(boxX, boxY, boxX + boxWidth, boxY, 4);
    context.closePath();
    context.fill();

    // Draw the text inside the box
    context.fillStyle = "#000000";
    context.fillText(text, boxX + padding, boxY + padding + textHeight - 4);
  });

  if (currentPolygon.length > 0) {
    context.beginPath();
    context.moveTo(currentPolygon[0].x, currentPolygon[0].y);
    currentPolygon.forEach((point) => context.lineTo(point.x, point.y));
    context.strokeStyle = "#A449EB";
    context.lineWidth = 2;
    context.stroke();
  }
};

// Add point to current polygon
export const handleCanvasClick = ({
  event,
  canvasRef,
  isDeleteMode,
  handleDeletePolygon,
  isCopyMode,
  draggedPolygon,
  polygonCount,
  polygons,
  setPolygons,
  setPolygonCount,
  setDraggedPolygon,
  isEditMode,
  currentPolygon,
  setCurrentPolygon,
  openSensorPopup,
  isUpdateMode,
  handleReEditPolygon,
  handlePolygonClick,
  selectedColor,
}) => {
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (isUpdateMode) {
    handleReEditPolygon({ x, y, canvasRef, polygons, handlePolygonClick });
  }

  if (isDeleteMode) {
    handleDeletePolygon(x, y, polygons, setPolygons, canvasRef);
  } else if (isCopyMode && draggedPolygon) {
    // Handle copy-pasting of polygons
    const newPolygon = {
      ...draggedPolygon,
      id: `R-${polygonCount}`,
      points: draggedPolygon.points.map((point) => ({
        x: point.x + (x - draggedPolygon.points[0].x),
        y: point.y + (y - draggedPolygon.points[0].y),
      })),
      fillColor: draggedPolygon.fillColor,
    };
    setPolygons([...polygons, newPolygon]);
    setPolygonCount(polygonCount + 1);
    setDraggedPolygon(null);
  } else if (isEditMode) {
    // Handle creating a new polygon
    const newPolygon = [...currentPolygon, { x, y }];
    setCurrentPolygon(newPolygon);

    if (newPolygon.length === 4) {
      const polygonWithId = {
        points: newPolygon,
        id: `R-${polygonCount}`,
        color: selectedColor || "#A449EB",
        fillColor: selectedColor || "#A449EB",
      };
      setPolygons([...polygons, polygonWithId]);
      setPolygonCount(polygonCount + 1);
      setCurrentPolygon([]);
      openSensorPopup(polygonWithId);
    }
  }
};

// Toggle Copy Mode
export const handleCopyMode = ({
  setIsCopyMode,
  setIsEditMode,
  setIsMoveMode,
  setIsDeleteMode,
  setDraggedPolygon,
  setIsUpdateMode,
  isCopyMode,
}) => {
  setIsCopyMode(!isCopyMode);
  setIsEditMode(false);
  setIsMoveMode(false);
  setIsDeleteMode(false);
  setIsUpdateMode(false);
  setDraggedPolygon(null);
};

// Toggle Update Mode
export const handleUpdateMode = ({
  setIsCopyMode,
  setIsEditMode,
  setIsMoveMode,
  setIsDeleteMode,
  setIsUpdateMode,
  isUpdateMode,
}) => {
  setIsUpdateMode(!isUpdateMode);
  setIsEditMode(false);
  setIsMoveMode(false);
  setIsCopyMode(false);
  setIsDeleteMode(false);
};

// Toggle Move Mode
export const handleMoveMode = ({
  setIsMoveMode,
  setIsEditMode,
  setIsCopyMode,
  setIsDeleteMode,
  isMoveMode,
  setIsUpdateMode,
  setDraggingPolygon,
}) => {
  setIsMoveMode(!isMoveMode);
  setIsEditMode(false);
  setIsCopyMode(false);
  setIsDeleteMode(false);
  setIsUpdateMode(false);
  setDraggingPolygon(null);
};

// Toggle Delete Mode
export const handleDeleteMode = ({
  setIsDeleteMode,
  isDeleteMode,
  setIsEditMode,
  setIsCopyMode,
  setIsMoveMode,
  setIsUpdateMode,
}) => {
  setIsDeleteMode(!isDeleteMode);
  setIsEditMode(false);
  setIsCopyMode(false);
  setIsMoveMode(false);
  setIsUpdateMode(false);
};

// Update sensor attached
export const updateSensorAttached = ({
  polygonId,
  sensor,
  polygons,
  setPolygons,
  sensorAttached,
}) => {
  if (polygons && polygons.length > 0) {
    const updatedPolygons = polygons.map((polygon) => {
      if (polygon.id === polygonId) {
        return {
          ...polygon,
          sensor: sensor,
        };
      }
      return polygon;
    });
    setPolygons(updatedPolygons);
  }
};

// Handle Move Mode
export const handleCanvasMouseMove = ({
  event,
  isCopyMode,
  draggingPolygon,
  canvasRef,
  polygons,
  dragOffset,
  setPolygons,
  handlePolygonCopy,
}) => {
  if (isCopyMode) {
    handlePolygonCopy(event);
  }

  if (draggingPolygon !== null) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const dx = x - dragOffset.x;
    const dy = y - dragOffset.y;

    const updatedPolygons = [...polygons];
    const polygon = updatedPolygons[draggingPolygon];
    const updatedPoints = polygon.points.map((point) => ({
      x: point.x + dx,
      y: point.y + dy,
    }));

    updatedPolygons[draggingPolygon] = {
      ...polygon,
      points: updatedPoints,
    };

    setPolygons(updatedPolygons);
    dragOffset.x = x;
    dragOffset.y = y;
  }
};

export const handleCanvasMouseUp = ({ setDraggingPolygon }) => {
  setDraggingPolygon(null);
};

export const handleCanvasMouseDown = ({
  event,
  isMoveMode,
  canvasRef,
  polygons,
  setDraggingPolygon,
  setDragOffset,
}) => {
  if (!isMoveMode) return;

  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  for (let i = 0; i < polygons.length; i++) {
    const polygon = polygons[i];
    const path = new Path2D();
    path.moveTo(polygon.points[0].x, polygon.points[0].y);
    polygon.points.forEach((point) => path.lineTo(point.x, point.y));
    path.closePath();

    if (canvas.getContext("2d").isPointInPath(path, x, y)) {
      setDraggingPolygon(i);
      setDragOffset({ x, y });
      break;
    }
  }
};

export const handleDeletePolygon = (x, y, polygons, setPolygons, canvasRef) => {
  const canvas = canvasRef.current;
  const context = canvas.getContext("2d");

  const filteredPolygons = polygons.filter((polygon) => {
    const path = new Path2D();
    path.moveTo(polygon.points[0].x, polygon.points[0].y);
    polygon.points.forEach((point) => path.lineTo(point.x, point.y));
    path.closePath();
    return !context.isPointInPath(path, x, y);
  });

  setPolygons(filteredPolygons);
};

export const polygonsLabelHandler = (
  selectedOption,
  selectedPolygon,
  polygons,
  setPolygons
) => {
  const updatedPolygons = polygons.map((polygon) => {
    if (polygon.id === selectedPolygon.id) {
      return {
        ...polygon,
        labelPoint: selectedOption,
      };
    }
    return polygon;
  });
  setPolygons(updatedPolygons);
};

export const sensorInfoSubmitHandler = (
  sensorIdInput,
  polygons,
  selectedPolygon,
  selectedSensor,
  color,
  setPolygons,
  setSensorPopup
) => {
  const updatedPolygons = polygons.map((polygon) => {
    if (polygon.id === selectedPolygon.id) {
      return {
        ...polygon,
        id: sensorIdInput || polygon.id,
        sensor: selectedSensor,
        color: color,
        fillColor: color,
      };
    }
    return polygon;
  });

  setPolygons(updatedPolygons);
  setSensorPopup(false);
};

export const handleReEditPolygon = ({
  x,
  y,
  canvasRef,
  polygons,
  handlePolygonClick,
}) => {
  const canvas = canvasRef.current;
  const context = canvas.getContext("2d");

  polygons.forEach((polygon) => {
    const path = new Path2D();
    path.moveTo(polygon.points[0].x, polygon.points[0].y);
    polygon.points.forEach((point) => path.lineTo(point.x, point.y));
    path.closePath();

    if (context.isPointInPath(path, x, y)) {
      handlePolygonClick(polygon.id, polygon.sensor);
    }
  });
};

export const sensorInfoUpdateHandler = (
  setPolygons,
  selectedPolygon,
  selectedPolygonId,
  selectedPolygonSensor,
  selectedSensor,
  selectedPolygonColor,
  setReEditModalOpen
) => {
  const updatedPolygons = polygons.map((polygon) => {
    if (polygon.id === selectedPolygon.id) {
      return {
        ...polygon,
        id: selectedPolygonId || polygon.id,
        sensor: selectedSensor || selectedPolygonSensor,
        color: selectedPolygonColor,
        fillColor: selectedPolygonColor,
      };
    }
    return polygon;
  });

  setPolygons(updatedPolygons);
  setReEditModalOpen(false);
};

export const handleCancelPolygon = (
  setSensorPopup,
  setPolygons,
  selectedPolygon,
  setCurrentPolygon,
  setSelectedPolygon
) => {
  setSensorPopup(false);
  setPolygons((prev) => prev.filter((p) => p.id !== selectedPolygon.id));
  setCurrentPolygon([]);
  setSelectedPolygon(null);
};

export const convertImageSrcToFile = async (
  imageSrc,
  fileName = "image.png"
) => {
  const response = await fetch(imageSrc);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type });
};

export const getCroppedImg = (imageSrc, crop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = (error) => reject(error);
  });
};
