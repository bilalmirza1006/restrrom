// 'use client';
// import React, { useEffect, useRef, useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import Button from '../shared/small/Button';
// import { FaXmark } from 'react-icons/fa6';
// import { IoCloseCircle } from 'react-icons/io5';
// // import RingMeter from './utils/RingMeter';
// import { useRouter } from 'next/navigation';
// import Button from '@/components/global/small/Button';

// // Helper function to convert hex to rgba with opacity
// const convertHexToRgba = (hex, opacity) => {
//   const cleanHex = hex.replace('#', '');
//   const bigint = parseInt(cleanHex, 16);
//   const r = (bigint >> 16) & 255;
//   const g = (bigint >> 8) & 255;
//   const b = bigint & 255;
//   return `rgba(${r}, ${g}, ${b}, ${opacity})`;
// };

// // For gradient we always use the backend-provided color and fade it to 5% opacity
// const createGradientFill = (ctx, centerX, centerY, radius, level, baseColor) => {
//   const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

//   // If a backend color is provided, use it (100% → 5% opacity)
//   if (baseColor) {
//     gradient.addColorStop(0, convertHexToRgba(baseColor, 1.0)); // center: full
//     gradient.addColorStop(1, convertHexToRgba(baseColor, 0.05)); // edge: 5%
//     return gradient;
//   }

//   // Fallback palette (should rarely hit if backend color exists)
//   const levels = {
//     Low: ['rgba(59, 130, 246, 1)', 'rgba(59, 130, 246, 0.05)'],
//     Medium: ['rgba(34, 197, 94, 1)', 'rgba(34, 197, 94, 0.05)'],
//     High: ['rgba(239, 68, 68, 1)', 'rgba(239, 68, 68, 0.05)'],
//   };
//   const [c0, c1] = levels[level] || levels.Medium;

//   gradient.addColorStop(0, c0);
//   gradient.addColorStop(1, c1);
//   return gradient;
// };

// // Helper function to generate random destructured/irregular shapes
// const generateRandomShape = (basePolygon) => {
//   const centerX =
//     basePolygon.points.reduce((sum, point) => sum + point.x, 0) / basePolygon.points.length;
//   const centerY =
//     basePolygon.points.reduce((sum, point) => sum + point.y, 0) / basePolygon.points.length;

//   const fixedDiameter = 200; // px
//   const randomSize = fixedDiameter;

//   const numPoints = Math.floor(Math.random() * 9) + 16; // 16-24 points for smoother outline
//   const points = [];

//   for (let i = 0; i < numPoints; i++) {
//     const angle = i * (360 / numPoints) * (Math.PI / 180);
//     const radiusVariation = 0.6 + Math.random() * 0.5; // 60% to 100%
//     const radius = (randomSize / 2) * radiusVariation;
//     const angleVariation = (Math.random() - 0.5) * 0.3; // ±15%
//     const finalAngle = angle + angleVariation;
//     const noiseX = (Math.random() - 0.5) * 4;
//     const noiseY = (Math.random() - 0.5) * 4;

//     points.push({
//       x: centerX + radius * Math.cos(finalAngle) + noiseX,
//       y: centerY + radius * Math.sin(finalAngle) + noiseY,
//     });
//   }

//   return {
//     type: 'irregular',
//     centerX,
//     centerY,
//     radius: randomSize / 2,
//     points,
//   };
// };

// // Helper function to draw irregular shapes with gradient
// const drawIrregularShape = (ctx, shape, level, strokeColor) => {
//   if (shape.points.length < 3) return;
//   console.log('level,strokeColor', level, strokeColor);

//   ctx.beginPath();
//   ctx.moveTo(shape.points[0].x, shape.points[0].y);

//   for (let i = 1; i < shape.points.length; i++) {
//     const currentPoint = shape.points[i];
//     const nextPoint = shape.points[(i + 1) % shape.points.length];

//     const controlX = (currentPoint.x + nextPoint.x) / 2 + (Math.random() - 0.5) * 10;
//     const controlY = (currentPoint.y + nextPoint.y) / 2 + (Math.random() - 0.5) * 10;

//     ctx.quadraticCurveTo(controlX, controlY, currentPoint.x, currentPoint.y);
//   }

//   ctx.closePath();

//   // Use backend color for gradient (1.0 → 0.05 opacity)
//   const gradient = createGradientFill(
//     ctx,
//     shape.centerX,
//     shape.centerY,
//     shape.radius,
//     level,
//     strokeColor
//   );

//   ctx.save();
//   ctx.lineJoin = 'round';
//   ctx.lineCap = 'round';
//   ctx.filter = 'blur(8px)';
//   ctx.fillStyle = gradient;
//   ctx.fill();
//   ctx.restore();

//   // Inner pass without blur to add saturation back
//   ctx.save();
//   ctx.filter = 'none';
//   ctx.globalAlpha = 0.9;
//   ctx.fillStyle = gradient;
//   ctx.fill();
//   ctx.globalAlpha = 1;
//   ctx.restore();

//   // Optional: small white hot core for High to mimic heat concentration
//   if (level === 'High') {
//     ctx.save();
//     ctx.filter = 'blur(6px)';
//     const core = ctx.createRadialGradient(
//       shape.centerX,
//       shape.centerY,
//       0,
//       shape.centerX,
//       shape.centerY,
//       Math.max(8, shape.radius * 0.35)
//     );
//     core.addColorStop(0, 'rgba(255,255,255,0.55)');
//     core.addColorStop(1, 'rgba(255,255,255,0)');
//     ctx.fillStyle = core;
//     ctx.fill();
//     ctx.restore();
//   }

//   // Add a warm outer halo using screen blend for a heatmap glow
//   ctx.save();
//   ctx.globalCompositeOperation = 'screen';
//   ctx.filter = 'blur(20px)';
//   const halo = ctx.createRadialGradient(
//     shape.centerX,
//     shape.centerY,
//     Math.max(0, shape.radius * 0.55),
//     shape.centerX,
//     shape.centerY,
//     shape.radius * 1.15
//   );
//   halo.addColorStop(0, 'rgba(0,0,0,0)');
//   halo.addColorStop(0.7, 'rgba(250, 204, 21, 0.18)');
//   halo.addColorStop(1, 'rgba(250, 204, 21, 0)');
//   ctx.fillStyle = halo;
//   ctx.fill();
//   ctx.restore();
// };

// const ShowCanvasData = ({ image, polygons, view, heatmap = false, data = [] }) => {
//   const navigate = useRouter();
//   const canvasRef = useRef(null);
//   const [selectedPolygon, setSelectedPolygon] = useState(null);
//   const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
//   console.log('polygons', polygons);

//   const handlePolygonClick = (e, polygon) => {
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const mouseX = e.clientX - rect.left;
//     const mouseY = e.clientY - rect.top;

//     const ctx = canvas.getContext('2d');
//     ctx.beginPath();
//     ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
//     polygon.points.forEach((point) => ctx.lineTo(point.x, point.y));
//     ctx.closePath();

//     const isInside = ctx.isPointInPath(mouseX, mouseY);
//     if (isInside) {
//       setSelectedPolygon(polygon);
//       const { x, y } = polygon.points[0];
//       const padding = 10;
//       setPopupPosition({
//         top: y + padding,
//         left: x + padding,
//       });
//     }
//   };

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');

//     // Clear and reset canvas
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     const img = new Image();
//     img.onload = () => {
//       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

//       if (heatmap) {
//         const previousComposite = ctx.globalCompositeOperation;
//         ctx.globalCompositeOperation = 'source-over';

//         const priority = ['temperature', 'co2', 'humidity', 'tvoc', 'co', 'ch'];
//         const labels = [];

//         // Dynamic classify using backend parameterValues
//         const classifyLevel = (param, value, parameterValues) => {
//           if (value == null) {
//             console.log('❌ No value provided');
//             return { severity: 'N/A', color: '#999' };
//           }

//           const roundedValue = Math.round(value);
//           console.log('👉 classifyLevel param:', param, 'value:', value, 'rounded:', roundedValue);

//           // normalize ranges
//           const ranges = parameterValues
//             ?.filter((r) => r.name?.toLowerCase() === param?.toLowerCase())
//             .map((r) => ({
//               name: r.name,
//               min: parseFloat(r.min),
//               max: parseFloat(r.max),
//               severity: r.severity,
//               color: r.color,
//             }));

//           console.log('📦 filtered ranges for', param, ':', ranges);

//           if (!ranges?.length) {
//             console.log('❌ No ranges found for param', param);
//             return { severity: 'N/A', color: '#999' };
//           }

//           // try exact match
//           const match = ranges.find((r) => roundedValue >= r.min && roundedValue <= r.max);
//           console.log('🔎 exact match:', match);

//           const toTitle = (s) =>
//             typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

//           if (match) {
//             console.log('✅ Found match:', match.severity, match.color);
//             return { severity: toTitle(match.severity), color: match.color };
//           }

//           // sort for gap/overflow logic
//           const sorted = [...ranges].sort((a, b) => a.min - b.min);
//           console.log('📊 sorted ranges:', sorted);

//           const minRange = sorted[0];
//           const maxRange = sorted[sorted.length - 1];

//           if (roundedValue < minRange.min) {
//             console.log('⬇️ below all ranges → force LOW severity');
//             const low = sorted.find((r) => r.severity?.toLowerCase() === 'low') || minRange;
//             return { severity: toTitle(low.severity), color: low.color };
//           }

//           if (roundedValue > maxRange.max) {
//             console.log('⬆️ above all ranges → force HIGH severity');
//             const high = sorted.find((r) => r.severity?.toLowerCase() === 'high') || maxRange;
//             return { severity: toTitle(high.severity), color: high.color };
//           }

//           // gap handling
//           for (let i = 0; i < sorted.length - 1; i++) {
//             if (roundedValue > sorted[i].max && roundedValue < sorted[i + 1].min) {
//               console.log(`🌀 value in gap between`, sorted[i], 'and', sorted[i + 1]);
//               const distToPrev = roundedValue - sorted[i].max;
//               const distToNext = sorted[i + 1].min - roundedValue;
//               const nearest = distToPrev < distToNext ? sorted[i] : sorted[i + 1];
//               console.log('📌 snapping to nearest:', nearest);
//               return { severity: toTitle(nearest.severity), color: nearest.color };
//             }
//           }

//           console.log('❓ fell through all conditions, return N/A');
//           return { severity: 'N/A', color: '#999' };
//         };

//         // --- PASS 1: draw all shapes ---
//         polygons.forEach((polygon) => {
//           if (!polygon || !polygon.points) return;

//           let selectedParam = null;
//           let selectedValue = null;

//           if (polygon.sensorAttached?.latestValues?.length) {
//             for (const param of priority) {
//               const found = polygon.sensorAttached.latestValues.find(
//                 (val) => val.parameter?.toLowerCase() === param
//               );
//               if (found) {
//                 selectedParam = param;
//                 selectedValue = found.value;
//                 break;
//               }
//             }
//           }

//           if (!selectedParam) return;

//           const randomShape = generateRandomShape(polygon);

//           const { severity, color } = classifyLevel(
//             selectedParam,
//             selectedValue,
//             polygon?.sensorAttached?.parameterValues || parameterValues // fallback to global
//           );

//           console.log('selectedValue', selectedValue, '→', severity, color);

//           // Use backend color to build gradient (100% → 5% opacity)
//           drawIrregularShape(ctx, randomShape, severity, color);

//           // save label info for pass 2
//           labels.push({
//             x: randomShape.centerX,
//             y: randomShape.centerY - 20,
//             text: `${polygon.id} (${selectedParam}: ${selectedValue ?? 'N/A'}) - ${severity}`,
//           });

//           // click detection
//           canvas.addEventListener('click', (e) => {
//             const rect = canvas.getBoundingClientRect();
//             const mouseX = e.clientX - rect.left;
//             const mouseY = e.clientY - rect.top;

//             ctx.beginPath();
//             ctx.moveTo(randomShape.points[0].x, randomShape.points[0].y);
//             randomShape.points.forEach((p) => ctx.lineTo(p.x, p.y));
//             ctx.closePath();
//             if (ctx.isPointInPath(mouseX, mouseY)) {
//               setSelectedPolygon(polygon);
//               setPopupPosition({
//                 top: randomShape.centerY + 10,
//                 left: randomShape.centerX + 10,
//               });
//             }
//           });
//         });

//         // --- PASS 2: draw labels on top ---
//         labels.forEach(({ x, y, text }) => {
//           const padding = 4;
//           ctx.font = 'bold 11px Arial';
//           const textWidth = ctx.measureText(text).width;
//           const textHeight = 12;
//           const boxWidth = textWidth + padding * 2;
//           const boxHeight = textHeight + padding * 2;
//           const boxX = x - boxWidth / 2;
//           const boxY = y - textHeight - padding;

//           ctx.fillStyle = 'rgba(255,255,255,0.85)';
//           ctx.beginPath();
//           ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 3);
//           ctx.fill();

//           ctx.strokeStyle = 'rgba(0,0,0,0.25)';
//           ctx.lineWidth = 1;
//           ctx.stroke();

//           ctx.fillStyle = '#0f172a';
//           ctx.fillText(text, boxX + padding, boxY + padding + textHeight - 2);
//         });

//         ctx.globalCompositeOperation = previousComposite;
//       } else {
//         // --- normal polygon drawing (unchanged) ---
//         const priority = ['temperature', 'co2', 'humidity', 'tvoc', 'co', 'ch'];
//         const labels = [];
//         const classifyLevel = (param, value, parameterValues) => {
//           if (value == null) {
//             console.log('❌ No value provided');
//             return { severity: 'N/A', color: '#999' };
//           }

//           const roundedValue = Math.round(value);
//           console.log('👉 classifyLevel param:', param, 'value:', value, 'rounded:', roundedValue);

//           // normalize ranges
//           const ranges = parameterValues
//             ?.filter((r) => r.name?.toLowerCase() === param?.toLowerCase())
//             .map((r) => ({
//               name: r.name,
//               min: parseFloat(r.min),
//               max: parseFloat(r.max),
//               severity: r.severity,
//               color: r.color,
//             }));

//           console.log('📦 filtered ranges for', param, ':', ranges);

//           if (!ranges?.length) {
//             console.log('❌ No ranges found for param', param);
//             return { severity: 'N/A', color: '#999' };
//           }

//           // try exact match
//           const match = ranges.find((r) => roundedValue >= r.min && roundedValue <= r.max);
//           console.log('🔎 exact match:', match);

//           const toTitle = (s) =>
//             typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

//           if (match) {
//             console.log('✅ Found match:', match.severity, match.color);
//             return { severity: toTitle(match.severity), color: match.color };
//           }

//           // sort for gap/overflow logic
//           const sorted = [...ranges].sort((a, b) => a.min - b.min);
//           console.log('📊 sorted ranges:', sorted);

//           const minRange = sorted[0];
//           const maxRange = sorted[sorted.length - 1];

//           if (roundedValue < minRange.min) {
//             console.log('⬇️ below all ranges → force LOW severity');
//             const low = sorted.find((r) => r.severity?.toLowerCase() === 'low') || minRange;
//             return { severity: toTitle(low.severity), color: low.color };
//           }

//           if (roundedValue > maxRange.max) {
//             console.log('⬆️ above all ranges → force HIGH severity');
//             const high = sorted.find((r) => r.severity?.toLowerCase() === 'high') || maxRange;
//             return { severity: toTitle(high.severity), color: high.color };
//           }

//           // gap handling
//           for (let i = 0; i < sorted.length - 1; i++) {
//             if (roundedValue > sorted[i].max && roundedValue < sorted[i + 1].min) {
//               console.log(`🌀 value in gap between`, sorted[i], 'and', sorted[i + 1]);
//               const distToPrev = roundedValue - sorted[i].max;
//               const distToNext = sorted[i + 1].min - roundedValue;
//               const nearest = distToPrev < distToNext ? sorted[i] : sorted[i + 1];
//               console.log('📌 snapping to nearest:', nearest);
//               return { severity: toTitle(nearest.severity), color: nearest.color };
//             }
//           }

//           console.log('❓ fell through all conditions, return N/A');
//           return { severity: 'N/A', color: '#999' };
//         };

//         polygons.forEach((polygon) => {
//           if (!polygon || !polygon.points) return;

//           let selectedParam = null;
//           let selectedValue = null;

//           if (polygon.sensorAttached?.latestValues?.length) {
//             for (const param of priority) {
//               const found = polygon.sensorAttached.latestValues.find(
//                 (val) => val.parameter?.toLowerCase() === param
//               );
//               if (found) {
//                 selectedParam = param;
//                 selectedValue = found.value;
//                 break;
//               }
//             }
//           }

//           if (!selectedParam) return;
//           const { severity, color } = classifyLevel(
//             selectedParam,
//             selectedValue,
//             polygon?.sensorAttached?.parameterValues || parameterValues // fallback to global
//           );

//           console.log('selectedValuesdfghjklkjhgfd', selectedValue, '→', severity, color);

//           ctx.beginPath();
//           ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
//           polygon.points.forEach((point) => ctx.lineTo(point.x, point.y));
//           ctx.closePath();

//           ctx.fillStyle = color;
//           ctx.fill();

//           ctx.strokeStyle = color;
//           ctx.lineWidth = 2;
//           ctx.stroke();

//           canvas.addEventListener('click', (e) => handlePolygonClick(e, polygon));

//           const labelX = polygon.points[0]?.x;
//           const labelY = polygon.points[0]?.y - 10;
//           if (labelX && labelY) {
//             const padding = 5;
//             const text = polygon.id;
//             ctx.font = '12px Arial';
//             const textWidth = ctx.measureText(text).width;
//             const textHeight = 14;
//             const boxWidth = textWidth + padding * 2;
//             const boxHeight = textHeight + padding * 2;
//             const boxX = labelX - padding;
//             const boxY = labelY - textHeight - padding;

//             ctx.fillStyle = '#FFFFFF';
//             ctx.beginPath();
//             ctx.moveTo(boxX + 4, boxY);
//             ctx.arcTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + boxHeight, 4);
//             ctx.arcTo(boxX + boxWidth, boxY + boxHeight, boxX, boxY + boxHeight, 4);
//             ctx.arcTo(boxX, boxY + boxHeight, boxX, boxY, 4);
//             ctx.arcTo(boxX, boxY, boxX + boxWidth, boxY, 4);
//             ctx.closePath();
//             ctx.fill();

//             ctx.fillStyle = '#000000';
//             ctx.fillText(text, boxX + padding, boxY + padding + textHeight - 4);
//           }
//         });
//       }
//     };

//     img.src = image;

//     return () => {
//       canvas.removeEventListener('click', handlePolygonClick);
//     };
//   }, [image, polygons, heatmap]);

//   return (
//     <div style={{ position: 'relative' }}>
//       <canvas
//         width={800}
//         height={500}
//         ref={canvasRef}
//         className="border border-primary-lightBlue border-dashed bg-[#03a5e010] rounded-lg"
//       />

//       {selectedPolygon && (
//         <div
//           className={`absolute  ${
//             view === 'building-view' ? 'bg-[#929292] text-white' : 'bg-[#03A5E0] text-white'
//           } pt-3 shadow-xl rounded-xl w-[300px]`}
//           style={{
//             top: `${popupPosition.top}px`,
//             left: `${popupPosition.left}px`,
//             transform: 'translate(-50%, -50%)',
//           }}
//         >
//           <div className="bg-white rounded-br-xl p-5 rounded-bl-xl">
//             {view === 'building-view' ? (
//               <div>
//                 <div className="flex justify-between items-center">
//                   <h6 className="text-2xl font-bold text-center  grow">Floor Details</h6>
//                   <FaXmark
//                     fontSize={25}
//                     className="cursor-pointer"
//                     onClick={() => setSelectedPolygon(null)}
//                   />
//                 </div>
//                 <div className="my-4 space-y-2">
//                   <h6 className="text-lg font-bold">Sensors List:</h6>
//                   <ul className="text-sm my-1 space-y-2">
//                     <li className="list-disc ml-4">
//                       <span className="font-bold text-base">Floor Temperature:</span> 20° C
//                     </li>
//                     <li className="list-disc ml-4">
//                       {' '}
//                       <span className="font-bold text-base">CO2:</span> 12 ppm
//                     </li>
//                     <li className="list-disc ml-4">
//                       <span className="font-bold text-base">Occupancy:</span> 20° C
//                     </li>
//                     <li className="list-disc ml-4">
//                       <span className="font-bold text-base">Energy:</span> 21 kWh
//                     </li>
//                   </ul>
//                   <p className="text-lg mt-3 font-bold">Total sensors: 12</p>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <Button
//                     text="Go to Floor"
//                     // onClick={() => navigate(`/dashboard/floor-view/`)}
//                   />
//                 </div>
//               </div>
//             ) : (
//               <div className="">
//                 <div className="flex  h-12 w-full  items-center justify-between">
//                   <div>
//                     <h6 className="text-xl text-black font-bold text-center">Sensor Details</h6>
//                   </div>
//                   <div
//                     className=" rounded-full cursor-pointer"
//                     onClick={() => setSelectedPolygon(null)}
//                   >
//                     <IoCloseCircle className="font-bold text-black text-2xl" />
//                   </div>
//                 </div>
//                 <div className="my-4 p-3 gap-3 bg-[#03A5E01A]/10 rounded-md space-y-2">
//                   <h6 className="text-lg text-black font-bold text-center">
//                     {selectedPolygon?.sensorAttached?.name}
//                   </h6>
//                   {selectedPolygon?.sensorAttached?.latestValues?.map((item) => {
//                     const unitMap = {
//                       temperature: '°C',
//                       humidity: '%',
//                       co2: 'ppm',
//                       co: 'ppm',
//                       ch: 'ppm',
//                       tvoc: 'μg/m³',
//                     };

//                     return (
//                       <div className="flex items-center justify-between" key={item.parameter}>
//                         <div>
//                           <h6 className="text-sm font-medium capitalize text-black">
//                             {item?.parameter}
//                           </h6>
//                         </div>
//                         <div>
//                           <h6 className="text-black">
//                             {item.value} {unitMap[item.parameter] || ''}
//                           </h6>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//                 <div className="flex pb-3 items-center justify-center">
//                   <button
//                     className="bg-white  border-2 border-[#03A5E0] hover:bg-[#a5a5a5] hover:text-white px-4 py-1 rounded-md text-primary-lightBlue font-semibold transition-all "
//                     onClick={() =>
//                       navigate(
//                         `/dashboard/sensors/sensor-detail/${selectedPolygon?.sensorAttached?._id}`
//                       )
//                     }
//                   >
//                     View Details
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ShowCanvasData;

'use client';
import React, { useEffect, useRef, useState } from 'react';

const ShowCanvasData = ({ image, polygons }) => {
  const canvasRef = useRef(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

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

        ctx.fillStyle = polygon.fillColor?.[0]?.color || 'rgba(0,150,255,0.3)';
        ctx.fill();

        ctx.strokeStyle = polygon.color?.[0]?.color || '#000';
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

          <div className="space-y-1">
            {selectedPolygon.fillColor?.map((fc, idx) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowCanvasData;
