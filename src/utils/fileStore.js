let fileCache = {};

export const setFileCache = (key, file) => {
  fileCache[key] = file;
  console.log("file cache", fileCache);
};

export const getFileCache = (key) => {
  return fileCache[key] || null;
  console.log("file cache", fileCache);
};

export const clearFileCache = () => (fileCache = {});
