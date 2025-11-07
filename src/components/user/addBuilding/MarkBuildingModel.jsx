'use client';
import { useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { AiOutlineDelete } from 'react-icons/ai';
import { LiaDrawPolygonSolid } from 'react-icons/lia';
import { RiEditBoxFill } from 'react-icons/ri';
import { SlCursorMove } from 'react-icons/sl';
import { VscCopy } from 'react-icons/vsc';
import Modal from '@/components/global/Modal';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Input from '@/components/global/small/Input';
import Dropdown from '@/components/global/small/Dropdown';
import Button from '@/components/global/small/Button';
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
} from '@/utils/markBuildingFeatures';

const MarkBuildingModel = ({
  setFile,
  buildingModelImage,
  setBuildingModelImage,
  polygons,
  setPolygons,
  onPolygonsChange,
  onRestroomCountChange,
  totalRestrooms,
  // isEditMode = false,
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
  const [floorIdInput, setFloorIdInput] = useState('');
  const [color, setColor] = useState('#A449EB');
  const [reEditModalOpen, setReEditModalOpen] = useState(false);
  const [selectedPolygonId, setSelectedPolygonId] = useState('');
  const [severityColors, setSeverityColors] = useState([
    { level: 'empty Queue', min: '0', max: '0', color: '#000000' },
    { level: 'average Queue', min: '', max: '', color: '#000000' },
    { level: 'small Queue', min: '', max: '', color: '#000000' },
    { level: 'large Queue', min: '', max: '', color: '#000000' },
  ]);
  console.log('severityColors', severityColors);

  const totalRestroomsFromState = useSelector(state =>
    parseInt(state.building?.totalRestrooms || '0')
  );
  const currentTotalRestrooms = totalRestrooms || totalRestroomsFromState;

  const openSensorPopup = polygon => {
    setSelectedPolygon(polygon);
    setSensorPopup(true);
    setFloorIdInput('');
  };
  const handleSeverityChange = (level, field, value) => {
    setSeverityColors(prev =>
      prev.map(item => (item.level === level ? { ...item, [field]: value } : item))
    );
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
      console.error('Crop failed:', error);
    }
  };

  // Enable Polygon Copying
  const handlePolygonCopy = event => {
    if (!isCopyMode) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const selectedPolygon = polygons.find(polygon => {
      const path = new Path2D();
      path.moveTo(polygon.points[0].x, polygon.points[0].y);
      polygon.points.forEach(point => path.lineTo(point.x, point.y));
      path.closePath();

      return canvas.getContext('2d').isPointInPath(path, x, y);
    });

    if (selectedPolygon) {
      setDraggedPolygon(selectedPolygon);
    }
  };

  // Function to open modal with polygon ID
  const handlePolygonClick = polygonId => {
    const polygonToEdit = polygons.find(polygon => polygon.id === polygonId);
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
        severityColors,
      });
    }
  }, [image, polygons, currentPolygon, canvasRef, severityColors, isDrawingEnabled]);

  // Call onPolygonsChange when polygons change
  useEffect(() => {
    if (onPolygonsChange) {
      onPolygonsChange(polygons);
    }
  }, [polygons, onPolygonsChange]);

  useEffect(() => {
    if (buildingModelImage) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setIsDrawingEnabled(true);
      };
      img.onerror = err => console.log('Image failed to load', err);
      img.src = buildingModelImage;
    }
  }, [buildingModelImage]);

  return (
    <div className="relative inline-block">
      {!isDrawingEnabled && (
        <BrowseFileBtn
          onFileChange={event =>
            handleImageUpload(event, setImageSrc, setShowCropper, setIsDrawingEnabled)
          }
        />
      )}

      <canvas
        width={800}
        height={500}
        ref={canvasRef}
        className="border-primary rounded-xl border border-dashed bg-[#03a5e010]"
        onClick={event =>
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
            isEditMode: true,
            isUpdateMode,
            currentPolygon,
            setCurrentPolygon,
            openSensorPopup,
            handleReEditPolygon,
            handlePolygonClick,
            selectedColor: severityColors,
            maxPolygons:
              Number.isFinite(currentTotalRestrooms) && currentTotalRestrooms > 0
                ? currentTotalRestrooms
                : Infinity,
            onLimitReached: () => toast.error('You cannot add more polygons than Total Restrooms'),
          })
        }
        onMouseDown={event =>
          handleCanvasMouseDown({
            event,
            isMoveMode,
            canvasRef,
            polygons,
            setDraggingPolygon,
            setDragOffset,
          })
        }
        onMouseMove={event =>
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
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
          <div className="w-3/4 max-w-lg rounded-lg bg-white p-4">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={8 / 5}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
            <div className="absolute right-6 bottom-6 z-[999] mt-4 flex items-center gap-2">
              <button
                onClick={() => setShowCropper(false)}
                className="rounded bg-gray-500 px-4 py-2 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                className="bg-primary rounded px-4 py-2 text-white"
              >
                Crop
              </button>
            </div>
          </div>
        </div>
      )}
      {isDrawingEnabled && (
        <>
          <div className="absolute top-0 right-[-6%] flex flex-col items-center gap-4">
            <button
              onClick={() => {
                setIsEditMode(!isEditMode);
                setIsCopyMode(false);
                setIsMoveMode(false);
                setIsDeleteMode(false);
                setIsUpdateMode(false);
              }}
              className={`rounded-md border p-2 text-white ${
                isEditMode ? 'border-primary' : 'border-[#565656]'
              }`}
            >
              <LiaDrawPolygonSolid fontSize={20} color={isEditMode ? '#A449EB' : '#565656'} />
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
              className={`rounded-md border p-2 text-white ${
                isCopyMode ? 'border-primary' : 'border-[#565656]'
              }`}
            >
              <VscCopy fontSize={20} color={isCopyMode ? '#A449EB' : '#565656'} />
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
              className={`rounded-md border p-2 text-white ${
                isUpdateMode ? 'border-primary' : 'border-[#565656]'
              }`}
            >
              <RiEditBoxFill fontSize={20} color={isUpdateMode ? '#A449EB' : '#565656'} />
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
              className={`rounded-md border p-2 text-white ${
                isMoveMode ? 'border-primary' : 'border-[#565656]'
              }`}
            >
              <SlCursorMove fontSize={20} color={isMoveMode ? '#A449EB' : '#565656'} />
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
              className={`rounded-md border p-2 text-white ${
                isDeleteMode ? 'border-primary' : 'border-[#565656]'
              }`}
            >
              <AiOutlineDelete fontSize={20} color={isDeleteMode ? '#A449EB' : '#565656'} />
            </button>
          </div>
        </>
      )}
      {sensorPopup && selectedPolygon && (
        <Modal title="Add Restroom" isCrossShow={false} onClose={() => setSensorPopup(false)}>
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder="Restroom ID"
              label="Restroom ID"
              value={floorIdInput}
              onChange={e => setFloorIdInput(e.target.value)}
            />

            <Dropdown
              defaultText={'first'}
              options={[
                { option: 'First-Point', value: 'first' },
                { option: 'Second-Point', value: 'second' },
                { option: 'Third-Point', value: 'third' },
                { option: 'Fourth-Point', value: 'fourth' },
              ]}
              label="Label Positioning of polygon"
              onSelect={selectedOption =>
                polygonsLabelHandler(selectedOption, selectedPolygon, polygons, setPolygons)
              }
            />

            <div className="flex flex-col rounded-xl border border-[#66666659] p-2">
              {severityColors.map((sev, index) => (
                <div key={sev.level} className="flex w-full flex-col items-center gap-4">
                  <div className="flex w-full flex-row items-center justify-center gap-4 px-2">
                    <div className="w-full">
                      <span className="w-16 text-xs font-bold capitalize">{sev.level}</span>
                    </div>
                    <div className="w-full">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={sev.min}
                        readOnly={sev.level === 'empty'} // ✅ only "empty" is read-only
                        onChange={e => handleSeverityChange(sev.level, 'min', e.target.value)}
                      />
                    </div>

                    <div className="w-full">
                      <Input
                        type="number"
                        placeholder="Max"
                        value={sev.max}
                        readOnly={sev.level === 'empty'} // ✅ only "empty" is read-only
                        onChange={e => handleSeverityChange(sev.level, 'max', e.target.value)}
                      />
                    </div>

                    <div className="w-full">
                      <Input
                        className="w-full"
                        type="color"
                        value={sev.color}
                        onChange={e => handleSeverityChange(sev.level, 'color', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* ✅ Show divider except for last index */}
                  {index < severityColors.length - 1 && (
                    <div className="w-full border-t-2 border-[#66666659] p-1"></div>
                  )}
                </div>
              ))}
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
                    severityColors,
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
              onChange={e => setSelectedPolygonId(e.target.value)}
            />

            <Dropdown
              defaultText={'first'}
              options={[
                { option: 'First-Point', value: 'first' },
                { option: 'Second-Point', value: 'second' },
                { option: 'Third-Point', value: 'third' },
                { option: 'Fourth-Point', value: 'fourth' },
              ]}
              label="Label Positioning of polygon"
              onSelect={selectedOption =>
                polygonsLabelHandler(selectedOption, selectedPolygon, polygons, setPolygons)
              }
            />

            <div className="flex flex-col rounded-xl border border-[#66666659] p-2">
              {severityColors.map((sev, index) => (
                <div key={sev.level} className="flex w-full flex-col items-center gap-4">
                  <div className="flex w-full flex-row items-center justify-center gap-4 px-2">
                    <div className="w-full">
                      <span className="w-16 text-xs font-bold capitalize">{sev.level}</span>
                    </div>
                    <div className="w-full">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={sev.min}
                        onChange={e => handleSeverityChange(sev.level, 'min', e.target.value)}
                      />
                    </div>

                    <div className="w-full">
                      <Input
                        type="number"
                        placeholder="Max"
                        value={sev.max}
                        onChange={e => handleSeverityChange(sev.level, 'max', e.target.value)}
                      />
                    </div>

                    <div className="w-full">
                      <Input
                        className="w-full"
                        type="color"
                        value={sev.color}
                        onChange={e => handleSeverityChange(sev.level, 'color', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* ✅ Show divider except for last index */}
                  {index < severityColors.length - 1 && (
                    <div className="w-full border-t-2 border-[#66666659] p-1"></div>
                  )}
                </div>
              ))}
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
                    severityColors,
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
    <button className="bg-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-lg px-4 py-2 font-semibold text-white">
      Browse File
      <input
        type="file"
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={onFileChange}
      />
    </button>
  );
};
