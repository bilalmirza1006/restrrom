"use client";
import { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { AiOutlineDelete } from "react-icons/ai";
import { LiaDrawPolygonSolid } from "react-icons/lia";
import { RiEditBoxFill } from "react-icons/ri";
import { SlCursorMove } from "react-icons/sl";
import { VscCopy } from "react-icons/vsc";
import Modal from "@/components/global/Modal";
import Input from "@/components/global/small/Input";
import Dropdown from "@/components/global/small/Dropdown";
import Button from "@/components/global/small/Button";
import {
  convertImageSrcToFile,
  drawCanvas,
  getCroppedImg,
  handleCancelPolygon,
  handleCanvasClick,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleCopyMode,
  handleDeleteMode,
  handleDeletePolygon,
  handleImageUpload,
  handleMoveMode,
  handleReEditPolygon,
  handleUpdateMode,
  polygonsLabelHandler,
  sensorInfoSubmitHandler,
  sensorInfoUpdateHandler,
} from "@/utils/markBuildingFeatures";

const MarkBuildingModel = ({
  setFile,
  buildingModelImage,
  setBuildingModelImage,
  polygons,
  setPolygons,
}) => {
  const canvasRef = useRef(null);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [image, setImage] = useState(null);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [polygonCount, setPolygonCount] = useState(1);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isCopyMode, setIsCopyMode] = useState(false);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [draggedPolygon, setDraggedPolygon] = useState(null);
  const [draggingPolygon, setDraggingPolygon] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sensorPopup, setSensorPopup] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [floorIdInput, setFloorIdInput] = useState("");
  const [color, setColor] = useState("#A449EB");
  const [reEditModalOpen, setReEditModalOpen] = useState(false);
  const [selectedPolygonId, setSelectedPolygonId] = useState("");

  const openSensorPopup = (polygon) => {
    setSelectedPolygon(polygon);
    setSensorPopup(true);
    setFloorIdInput("");
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      const img = new Image();
      img.src = croppedImage;
      img.onload = () => {
        setImage(img);
      };
      setBuildingModelImage(croppedImage);
      setShowCropper(false);
      const file = await convertImageSrcToFile(croppedImage);
      setFile(file);
    } catch (error) {
      console.error("Crop failed:", error);
    }
  };

  // Enable Polygon Copying
  const handlePolygonCopy = (event) => {
    if (!isCopyMode) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const selectedPolygon = polygons.find((polygon) => {
      const path = new Path2D();
      path.moveTo(polygon.points[0].x, polygon.points[0].y);
      polygon.points.forEach((point) => path.lineTo(point.x, point.y));
      path.closePath();

      return canvas.getContext("2d").isPointInPath(path, x, y);
    });

    if (selectedPolygon) {
      setDraggedPolygon(selectedPolygon);
    }
  };

  // Function to open modal with polygon ID
  const handlePolygonClick = (polygonId) => {
    const polygonToEdit = polygons.find((polygon) => polygon.id === polygonId);
    setSelectedPolygon(polygonToEdit);
    setSelectedPolygonId(polygonId);
    setReEditModalOpen(true);
  };

  useEffect(() => {
    if (isDrawingEnabled && canvasRef.current) {
      drawCanvas({
        canvasRef,
        isDrawingEnabled,
        image,
        polygons,
        currentPolygon,
        color,
      });
    }
  }, [image, polygons, currentPolygon, canvasRef, color, isDrawingEnabled]);

  useEffect(() => {
    if (buildingModelImage) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setIsDrawingEnabled(true);
      };
      img.onerror = (err) => console.log("Image failed to load", err);
      img.src = buildingModelImage;
    }
  }, [buildingModelImage]);

  return (
    <div className="relative inline-block">
      {!isDrawingEnabled && (
        <BrowseFileBtn
          onFileChange={(event) =>
            handleImageUpload(
              event,
              setImageSrc,
              setShowCropper,
              setIsDrawingEnabled
            )
          }
        />
      )}

      <canvas
        width={800}
        height={500}
        ref={canvasRef}
        className="border border-primary border-dashed bg-[#03a5e010] rounded-xl"
        onClick={(event) =>
          handleCanvasClick({
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
            isUpdateMode,
            currentPolygon,
            setCurrentPolygon,
            openSensorPopup,
            handleReEditPolygon,
            handlePolygonClick,
            selectedColor: color,
          })
        }
        onMouseDown={(event) =>
          handleCanvasMouseDown({
            event,
            isMoveMode,
            canvasRef,
            polygons,
            setDraggingPolygon,
            setDragOffset,
          })
        }
        onMouseMove={(event) =>
          handleCanvasMouseMove({
            event,
            isCopyMode,
            handlePolygonCopy,
            draggingPolygon,
            canvasRef,
            polygons,
            dragOffset,
            setPolygons,
          })
        }
        onMouseUp={() => handleCanvasMouseUp({ setDraggingPolygon })}
      />

      {showCropper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-4 rounded-lg w-3/4 max-w-lg">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={8 / 5}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
            <div className="flex items-center gap-2 mt-4 z-[999] absolute bottom-6 right-6">
              <button
                onClick={() => setShowCropper(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                className="bg-primary text-white px-4 py-2 rounded"
              >
                Crop
              </button>
            </div>
          </div>
        </div>
      )}
      {isDrawingEnabled && (
        <>
          <div className="flex flex-col items-center gap-4 absolute top-0 right-[-6%]">
            <button
              onClick={() => {
                setIsEditMode(!isEditMode);
                setIsCopyMode(false);
                setIsMoveMode(false);
                setIsDeleteMode(false);
                setIsUpdateMode(false);
              }}
              className={`p-2 border rounded-md text-white ${
                isEditMode ? "border-primary" : "border-[#565656]"
              }`}
            >
              <LiaDrawPolygonSolid
                fontSize={20}
                color={isEditMode ? "#A449EB" : "#565656"}
              />
            </button>
            <button
              onClick={() =>
                handleCopyMode({
                  setIsCopyMode,
                  setIsEditMode,
                  setIsMoveMode,
                  setIsDeleteMode,
                  setDraggedPolygon,
                  setIsUpdateMode,
                  isCopyMode,
                })
              }
              className={`p-2 border rounded-md text-white ${
                isCopyMode ? "border-primary" : "border-[#565656]"
              }`}
            >
              <VscCopy
                fontSize={20}
                color={isCopyMode ? "#A449EB" : "#565656"}
              />
            </button>
            <button
              onClick={() =>
                handleUpdateMode({
                  setIsCopyMode,
                  setIsEditMode,
                  setIsMoveMode,
                  setIsDeleteMode,
                  setIsUpdateMode,
                  setDraggedPolygon,
                  isCopyMode,
                })
              }
              className={`p-2 border rounded-md text-white ${
                isUpdateMode ? "border-primary" : "border-[#565656]"
              }`}
            >
              <RiEditBoxFill
                fontSize={20}
                color={isUpdateMode ? "#A449EB" : "#565656"}
              />
            </button>
            <button
              onClick={() =>
                handleMoveMode({
                  setIsMoveMode,
                  setIsEditMode,
                  setIsCopyMode,
                  setIsDeleteMode,
                  isMoveMode,
                  setDraggingPolygon,
                  setIsUpdateMode,
                })
              }
              className={`p-2 border rounded-md text-white ${
                isMoveMode ? "border-primary" : "border-[#565656]"
              }`}
            >
              <SlCursorMove
                fontSize={20}
                color={isMoveMode ? "#A449EB" : "#565656"}
              />
            </button>
            <button
              onClick={() =>
                handleDeleteMode({
                  setIsDeleteMode,
                  isDeleteMode,
                  setIsEditMode,
                  setIsCopyMode,
                  setIsMoveMode,
                  setIsUpdateMode,
                })
              }
              className={`p-2 border rounded-md text-white ${
                isDeleteMode ? "border-primary" : "border-[#565656]"
              }`}
            >
              <AiOutlineDelete
                fontSize={20}
                color={isDeleteMode ? "#A449EB" : "#565656"}
              />
            </button>
          </div>
        </>
      )}
      {sensorPopup && selectedPolygon && (
        <Modal
          title="Add Floor"
          isCrossShow={false}
          onClose={() => setSensorPopup(false)}
        >
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder="Floor ID"
              label="Floor ID"
              value={floorIdInput}
              onChange={(e) => setFloorIdInput(e.target.value)}
            />

            <Dropdown
              defaultText={"first"}
              options={[
                { option: "First-Point", value: "first" },
                { option: "Second-Point", value: "second" },
                { option: "Third-Point", value: "third" },
                { option: "Fourth-Point", value: "fourth" },
              ]}
              label="Label Positioning of polygon"
              onSelect={(selectedOption) =>
                polygonsLabelHandler(
                  selectedOption,
                  selectedPolygon,
                  polygons,
                  setPolygons
                )
              }
            />

            <div className="flex items-center gap-4">
              <h1 className="font-bold text-xs">Select Color of Polygon</h1>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>

            <div className="flex justify-center gap-3">
              <Button
                disabled={!floorIdInput}
                text="Add"
                width="w-fit"
                onClick={() => {
                  sensorInfoSubmitHandler(
                    floorIdInput,
                    polygons,
                    selectedPolygon,
                    null, // No sensor for building model
                    color,
                    setPolygons,
                    setSensorPopup
                  );
                  setSensorPopup(false);
                }}
              />
              <Button
                width="w-fit"
                text="Cancel"
                onClick={() =>
                  handleCancelPolygon(
                    setSensorPopup,
                    setPolygons,
                    selectedPolygon,
                    setCurrentPolygon,
                    setSelectedPolygon
                  )
                }
              />
            </div>
          </div>
        </Modal>
      )}
      {reEditModalOpen && (
        <Modal title="Edit Floor" onClose={() => setReEditModalOpen(false)}>
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder="Floor ID"
              label="Floor ID"
              value={selectedPolygonId}
              onChange={(e) => setSelectedPolygonId(e.target.value)}
            />

            <Dropdown
              defaultText={"first"}
              options={[
                { option: "First-Point", value: "first" },
                { option: "Second-Point", value: "second" },
                { option: "Third-Point", value: "third" },
                { option: "Fourth-Point", value: "fourth" },
              ]}
              label="Label Positioning of polygon"
              onSelect={(selectedOption) =>
                polygonsLabelHandler(
                  selectedOption,
                  selectedPolygon,
                  polygons,
                  setPolygons
                )
              }
            />

            <div className="flex items-center gap-4">
              <h1 className="font-bold text-xs">Select Color of Polygon</h1>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <div className="flex justify-center">
              <Button
                text="Update"
                width="w-fit"
                onClick={() =>
                  sensorInfoUpdateHandler(
                    setPolygons,
                    selectedPolygon,
                    selectedPolygonId,
                    null, // No sensor for building model
                    null, // No new sensor
                    color,
                    setReEditModalOpen
                  )
                }
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MarkBuildingModel;

const BrowseFileBtn = ({ onFileChange }) => {
  return (
    <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 cursor-pointer rounded-lg bg-primary text-white font-semibold">
      Browse File
      <input
        type="file"
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={onFileChange}
      />
    </button>
  );
};
