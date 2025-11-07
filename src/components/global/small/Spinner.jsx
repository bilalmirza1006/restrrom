const Spinner = () => {
  return (
    <div className="flex h-auto items-center justify-center py-5">
      <div className="relative flex items-center justify-center">
        <div className="border-l-primary border-r-primary absolute inline-block size-10 animate-spin rounded-full border-4 border-t-transparent border-b-transparent" />
      </div>
    </div>
  );
};

export default Spinner;
