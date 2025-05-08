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
} from "@/utils/markRestroomFeatures";

const MarkRestroomModel = ({
  restroomIndex,
  setFile,
  restroomImage,
  setRestroomImage,
  polygons,
  setPolygons,
  availableSensors,
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
  const [sensorIdInput, setSensorIdInput] = useState("");
  const [selectedSensor, setSelectedSensor] = useState("No sensor");
  const [color, setColor] = useState("#A449EB");
  const [reEditModalOpen, setReEditModalOpen] = useState(false);
  const [selectedPolygonId, setSelectedPolygonId] = useState("");
  const [selectedPolygonSensor, setSelectedPolygonSensor] = useState("");

  // Get filtered sensors - removing ones already used in this restroom or other restrooms
  const getFilteredSensors = () => {
    // Create array of all sensors used in current restroom
    const usedSensors = polygons
      .map((polygon) => polygon.sensor)
      .filter((sensor) => sensor && sensor !== "No sensor");

    // Filter available sensors to exclude used ones
    return (
      availableSensors?.filter(
        (sensor) => !usedSensors.includes(sensor.value)
      ) || []
    );
  };

  const openSensorPopup = (polygon) => {
    setSelectedPolygon(polygon);
    setSensorPopup(true);
    setSensorIdInput("");
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
      setRestroomImage(croppedImage);
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
  const handlePolygonClick = (polygonId, polygonSensor) => {
    const polygonToEdit = polygons.find((polygon) => polygon.id === polygonId);
    setSelectedPolygon(polygonToEdit);
    setSelectedPolygonId(polygonId);
    setSelectedPolygonSensor(polygonSensor);
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
    if (restroomImage) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setIsDrawingEnabled(true);
      };
      img.onerror = (err) => console.log("Image failed to load", err);
      img.src = restroomImage;
    }
  }, [restroomImage]);

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
            draggingPolygon,
            canvasRef,
            polygons,
            dragOffset,
            setPolygons,
            handlePolygonCopy,
          })
        }
        onMouseUp={() => handleCanvasMouseUp({ setDraggingPolygon })}
      />

      {isDrawingEnabled && (
        <div className="mt-4 flex items-center justify-center flex-wrap gap-2">
          <button
            onClick={() =>
              handleUpdateMode({
                setIsCopyMode,
                setIsEditMode,
                setIsMoveMode,
                setIsDeleteMode,
                setIsUpdateMode,
                isUpdateMode,
              })
            }
            className={`flex items-center text-lg font-medium rounded-md px-3 py-1 ${
              isUpdateMode
                ? "bg-[#A449EB50] text-primary"
                : "bg-[#ACACAC40] text-[#11111180]"
            }`}
          >
            <RiEditBoxFill />
            <span className="ml-1 text-sm">Re-edit</span>
          </button>
          <button
            onClick={() =>
              handleMoveMode({
                setIsMoveMode,
                setIsEditMode,
                setIsCopyMode,
                setIsDeleteMode,
                isMoveMode,
                setIsUpdateMode,
                setDraggingPolygon,
              })
            }
            className={`flex items-center text-lg font-medium rounded-md px-3 py-1 ${
              isMoveMode
                ? "bg-[#A449EB50] text-primary"
                : "bg-[#ACACAC40] text-[#11111180]"
            }`}
          >
            <SlCursorMove />
            <span className="ml-1 text-sm">Move</span>
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
            className={`flex items-center text-lg font-medium rounded-md px-3 py-1 ${
              isCopyMode
                ? "bg-[#A449EB50] text-primary"
                : "bg-[#ACACAC40] text-[#11111180]"
            }`}
          >
            <VscCopy />
            <span className="ml-1 text-sm">Copy</span>
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
            className={`flex items-center text-lg font-medium rounded-md px-3 py-1 ${
              isDeleteMode
                ? "bg-[#A449EB50] text-primary"
                : "bg-[#ACACAC40] text-[#11111180]"
            }`}
          >
            <AiOutlineDelete />
            <span className="ml-1 text-sm">Delete</span>
          </button>
          <button
            className={`flex items-center text-base md:text-lg font-medium rounded-md px-3 py-1 ${
              isEditMode
                ? "bg-[#A449EB50] text-primary"
                : "bg-[#ACACAC40] text-[#11111180]"
            }`}
            onClick={() => {
              setIsEditMode(true);
              setIsDeleteMode(false);
              setIsCopyMode(false);
              setIsMoveMode(false);
              setIsUpdateMode(false);
            }}
          >
            <LiaDrawPolygonSolid />
            <span className="ml-1 text-sm">Draw</span>
          </button>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && (
        <Modal isOpen={showCropper} onClose={() => setShowCropper(false)}>
          <div className="w-full md:min-w-[600px] p-5">
            <h4 className="text-center text-lg md:text-[22px] font-semibold mb-5">
              Crop Image
            </h4>
            <div className="flex-1 h-[400px] relative">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex items-center justify-end gap-3 mt-5">
              <Button
                text="Cancel"
                onClick={() => setShowCropper(false)}
                cn="!bg-[#ACACAC40] !text-[#111111B2]"
              />
              <Button text="Crop Image" onClick={handleCropConfirm} />
            </div>
          </div>
        </Modal>
      )}

      {/* Sensor Popup Modal */}
      {sensorPopup && (
        <Modal isOpen={sensorPopup} onClose={() => setSensorPopup(false)}>
          <div className="w-full md:min-w-[500px] p-5">
            <h5 className="text-lg font-semibold mb-6">Restroom Details</h5>
            <div className="space-y-4">
              <Input
                label="Restroom ID"
                placeholder="Enter Restroom ID"
                value={sensorIdInput}
                onChange={(e) => setSensorIdInput(e.target.value)}
              />

              <Dropdown
                options={[
                  { label: "No sensor", value: "No sensor" },
                  ...getFilteredSensors(),
                ]}
                label="Attach Sensor"
                placeholder="Select Sensor"
                value={selectedSensor}
                setValue={setSelectedSensor}
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Label Position
                </label>
                <div className="flex items-center flex-wrap gap-2">
                  {["first", "second", "third", "fourth"].map((point) => (
                    <button
                      key={point}
                      onClick={() =>
                        polygonsLabelHandler(
                          point,
                          selectedPolygon,
                          polygons,
                          setPolygons
                        )
                      }
                      className={`px-3 py-1 rounded-md text-xs font-medium capitalize ${
                        selectedPolygon?.labelPoint === point
                          ? "bg-primary text-white"
                          : "bg-[#ACACAC40] text-[#111111B2]"
                      }`}
                    >
                      {point} point
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <h1 className="font-bold text-xs">Select Color of Polygon</h1>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-5">
              <Button
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
                cn="!bg-[#ACACAC40] !text-[#111111B2]"
              />
              <Button
                text="Submit"
                onClick={() =>
                  sensorInfoSubmitHandler(
                    sensorIdInput,
                    polygons,
                    selectedPolygon,
                    selectedSensor,
                    color,
                    setPolygons,
                    setSensorPopup
                  )
                }
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Re-edit Modal */}
      {reEditModalOpen && (
        <Modal
          isOpen={reEditModalOpen}
          onClose={() => setReEditModalOpen(false)}
        >
          <div className="w-full md:min-w-[500px] p-5">
            <h5 className="text-lg font-semibold mb-6">
              Update Restroom Details
            </h5>
            <div className="space-y-4">
              <Input
                label="Restroom ID"
                placeholder="Enter Restroom ID"
                value={selectedPolygonId}
                onChange={(e) => setSelectedPolygonId(e.target.value)}
              />

              <Dropdown
                options={[
                  { label: "No sensor", value: "No sensor" },
                  ...getFilteredSensors().filter(
                    (sensor) => sensor.value !== selectedPolygonSensor
                  ),
                  ...(selectedPolygonSensor &&
                  selectedPolygonSensor !== "No sensor"
                    ? [
                        {
                          label: selectedPolygonSensor,
                          value: selectedPolygonSensor,
                        },
                      ]
                    : []),
                ]}
                label="Attach Sensor"
                placeholder="Select Sensor"
                value={selectedSensor}
                setValue={setSelectedSensor}
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Label Position
                </label>
                <div className="flex items-center flex-wrap gap-2">
                  {["first", "second", "third", "fourth"].map((point) => (
                    <button
                      key={point}
                      onClick={() =>
                        polygonsLabelHandler(
                          point,
                          selectedPolygon,
                          polygons,
                          setPolygons
                        )
                      }
                      className={`px-3 py-1 rounded-md text-xs font-medium capitalize ${
                        selectedPolygon?.labelPoint === point
                          ? "bg-primary text-white"
                          : "bg-[#ACACAC40] text-[#111111B2]"
                      }`}
                    >
                      {point} point
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <h1 className="font-bold text-xs">Select Color of Polygon</h1>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-5">
              <Button
                text="Cancel"
                onClick={() => setReEditModalOpen(false)}
                cn="!bg-[#ACACAC40] !text-[#111111B2]"
              />
              <Button
                text="Update"
                onClick={() =>
                  sensorInfoUpdateHandler(
                    setPolygons,
                    selectedPolygon,
                    selectedPolygonId,
                    selectedPolygonSensor,
                    selectedSensor,
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

const BrowseFileBtn = ({ onFileChange }) => {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div>
        <label className="cursor-pointer">
          <div className="flex flex-col items-center justify-center">
            <p className="text-lg font-medium text-primary">
              Browse or Drop Restroom Photo Here
            </p>
            <p className="text-sm text-[#11111180]">
              Supported formats: JPEG, PNG
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default MarkRestroomModel;
