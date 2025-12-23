'use client';
import React, { useEffect, useRef, useState } from 'react';

const RestroomShowCanvasData = ({ image, polygons }) => {
  const canvasRef = useRef(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  console.log('polygonspolygonspolygonspolygons', polygons);
  console.log('selectedPolygon', selectedPolygon);
  const handlePolygonClick = (e, polygon) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
    polygon.points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();

    if (ctx.isPointInPath(mouseX, mouseY)) {
      setSelectedPolygon(polygon);
      setPopupPosition({
        top: polygon.points[0].y + 10,
        left: polygon.points[0].x + 10,
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      polygons.forEach(polygon => {
        if (!polygon?.points?.length) return;

        ctx.beginPath();
        ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
        polygon.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        ctx.fillStyle = polygon.fillColor || 'rgba(0,150,255,0.3)';
        ctx.fill();

        ctx.strokeStyle = polygon.fillColor || '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '12px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText(polygon.id, polygon.points[0].x, polygon.points[0].y - 5);

        canvas.addEventListener('click', e => handlePolygonClick(e, polygon));
      });
    };
    img.src = image;

    return () => {
      canvas.removeEventListener('click', handlePolygonClick);
    };
  }, [image, polygons]);

  // ✅ Close popup if clicked outside canvas
  useEffect(() => {
    const handleClickOutside = e => {
      if (canvasRef.current && !canvasRef.current.contains(e.target)) {
        setSelectedPolygon(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        width={800}
        height={500}
        ref={canvasRef}
        className="rounded-lg border border-dashed"
      />

      {selectedPolygon && (
        <div
          className="absolute rounded-md bg-white p-3 shadow-xl"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
            minWidth: '200px',
          }}
        >
          <h6 className="mb-2 font-bold">{selectedPolygon.id}</h6>
          <p className="mb-2 text-sm text-gray-600">Label: {selectedPolygon.labelPoint}</p>
          <p className="mb-2 text-sm text-gray-600">queueCount: {selectedPolygon.queueCount}</p>

          <div className="space-y-1">
            {Array.isArray(selectedPolygon.fillColor)
              ? selectedPolygon.fillColor.map((fc, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-semibold capitalize">{fc.level}</span>
                    <span>
                      ({fc.min} - {fc.max})
                    </span>
                    <span
                      className="inline-block h-4 w-4 rounded"
                      style={{ backgroundColor: fc.color }}
                    />
                  </div>
                ))
              : selectedPolygon.fillColor && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold capitalize">Level</span>
                    <span>-</span>
                    <span
                      className="inline-block h-4 w-4 rounded"
                      style={{ backgroundColor: selectedPolygon.fillColor }}
                    />
                  </div>
                )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestroomShowCanvasData;
