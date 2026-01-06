// import React, { useEffect, useRef, useState, useMemo } from 'react';
// import DataTable from 'react-data-table-component';

// const CHUNK_SIZE = 200;
// const LOAD_DELAY = 300;

// const LazyDataTable = ({ columns, data }) => {
//   const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);
//   const containerRef = useRef(null);
//   const lastTriggeredCountRef = useRef(visibleCount);

//   // 🧠 Memoized
//   const memoizedColumns = useMemo(() => columns, [columns]);

//   const visibleData = useMemo(() => data.slice(0, visibleCount), [data, visibleCount]);

//   const tableStyles = useMemo(
//     () => ({
//       headCells: {
//         style: {
//           fontSize: '14px',
//           fontWeight: 700,
//           color: '#ffffff',
//           background: '#a449eb',
//         },
//       },
//     }),
//     []
//   );

//   useEffect(() => {
//     const el = containerRef.current;
//     if (!el) return;

//     let lastCall = 0;
//     const onScroll = () => {
//       const now = Date.now();
//       if (now - lastCall < 200) return;
//       lastCall = now;

//       if (isLoadingMore) return;

//       if (
//         el.scrollTop + el.clientHeight >= el.scrollHeight - 50 &&
//         visibleCount < data.length &&
//         lastTriggeredCountRef.current === visibleCount
//       ) {
//         setIsLoadingMore(true);

//         setTimeout(() => {
//           setVisibleCount(prev => {
//             const next = Math.min(prev + CHUNK_SIZE, data.length);
//             lastTriggeredCountRef.current = next;
//             return next;
//           });
//           setIsLoadingMore(false);
//         }, LOAD_DELAY);
//       }
//     };

//     el.addEventListener('scroll', onScroll);
//     return () => el.removeEventListener('scroll', onScroll);
//   }, [visibleCount, data.length, isLoadingMore]);

//   return (
//     <div ref={containerRef} className="max-h-[400px] overflow-y-auto rounded-lg border">
//       <DataTable
//         columns={memoizedColumns}
//         data={visibleData}
//         dense
//         persistTableHead
//         customStyles={tableStyles}
//       />

//       {isLoadingMore && (
//         <div className="flex justify-center py-3 text-sm text-gray-500">Loading more...</div>
//       )}

//       {!isLoadingMore && visibleCount < data.length && (
//         <p className="py-2 text-center text-xs text-gray-500">
//           Scroll to load more ({visibleCount}/{data.length})
//         </p>
//       )}
//     </div>
//   );
// };

// export default React.memo(
//   LazyDataTable,
//   (prev, next) => prev.data === next.data && prev.columns === next.columns
// );

import React, { useEffect, useRef, useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';

const CHUNK_SIZE = 200;
const LOAD_DELAY = 300;

const LazyDataTable = ({ columns, data }) => {
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const containerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Memoized
  const memoizedColumns = useMemo(() => columns, [columns]);

  const visibleData = useMemo(() => data.slice(0, visibleCount), [data, visibleCount]);

  const tableStyles = useMemo(
    () => ({
      headCells: {
        style: {
          fontSize: '14px',
          fontWeight: 700,
          color: '#ffffff',
          background: '#a449eb',
        },
      },
    }),
    []
  );

  useEffect(() => {
    if (!sentinelRef.current || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore && visibleCount < data.length) {
          setIsLoadingMore(true);

          setTimeout(() => {
            setVisibleCount(prev => Math.min(prev + CHUNK_SIZE, data.length));
            setIsLoadingMore(false);
          }, LOAD_DELAY);
        }
      },
      {
        root: containerRef.current,
        threshold: 1,
      }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visibleCount, data.length, isLoadingMore]);

  return (
    <div ref={containerRef} className="max-h-[400px] overflow-y-auto rounded-lg">
      <DataTable
        columns={memoizedColumns}
        data={visibleData}
        dense
        persistTableHead
        customStyles={tableStyles}
      />

      {isLoadingMore && (
        // <div className="flex justify-center py-3 text-sm text-gray-500">Loading more...</div>
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* 👇 THIS is the magic */}
      <div ref={sentinelRef} className="h-1" />

      {!isLoadingMore && visibleCount < data.length && (
        <p className="py-2 text-center text-xs text-gray-500">
          Scroll to load more ({visibleCount}/{data.length})
        </p>
      )}
    </div>
  );
};

export default React.memo(
  LazyDataTable,
  (prev, next) => prev.data === next.data && prev.columns === next.columns
);
