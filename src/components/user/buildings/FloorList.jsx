import Image from "next/image";
import Link from "next/link";

const FloorList = ({ data }) => {
  return (
    <div className="p-4 rounded-xl shadow-md grid grid-cols-1 lg:grid-cols-6 gap-5 xl:gap-10">
      <Image
        src={data?.image}
        width={248}
        height={150}
        alt="building image"
        className="border border-[#414141] rounded-xl size-full sm:w-[250px] h-[150px] object-cover"
      />
      <div>
        <h5 className="text-base md:text-xl font-bold text-black">
          {data?.floorName}
        </h5>
        <div className="flex items-center gap-1">
          <Image
            src="/svgs/user/basement.svg"
            width={18}
            height={18}
            alt="image"
          />
          <p className="text-sm font-semibold text-[#414141]">Basement Floor</p>
        </div>
        <List
          icon={"/svgs/user/total-restrooms.svg"}
          title="Total Restrooms"
          value={data?.totalRestrooms}
        />
      </div>
      <List
        icon={"/svgs/user/occupied.svg"}
        title="Occupied Restrooms"
        value={data?.occupiedRestrooms}
      />
      <List
        icon={"/svgs/user/toilet.svg"}
        title="Free Restrooms"
        value={data?.freeRestrooms}
      />
      <List
        icon={"/svgs/user/sensors.svg"}
        title="Active Sensors"
        value={data?.activeSensors}
      />
      <div className="mt-4 md:mt-6 flex items-center justify-center">
        <Link
          href={`/buildings/1/3`}
          className="bg-[#EED8FF] py-2 px-5 rounded-lg underline text-primary text-sm font-bold"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default FloorList;

const List = ({ icon, title, value }) => {
  return (
    <div className="mt-4 md:mt-6 flex items-center gap-2">
      <Image src={icon} width={26} height={26} alt="image" />
      <div>
        <h6 className="text-base font-bold text-[#292D32]">{title}</h6>
        <p className="text-base font-medium text-[#000000CC]">{value}</p>
      </div>
    </div>
  );
};
