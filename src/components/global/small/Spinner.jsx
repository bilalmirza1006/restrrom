const Spinner = () => {
  return (
    <div className="flex h-auto py-5 items-center justify-center">
      <div className="relative flex items-center justify-center">
        <div className="absolute inline-block size-10 rounded-full border-4 border-t-transparent border-b-transparent border-l-primary border-r-primary animate-spin" />
      </div>
    </div>
  );
};

export default Spinner;
