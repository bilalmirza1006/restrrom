const tableStyles = {
  headCells: {
    style: {
      fontSize: "16px",
      fontWeight: 600,
      color: "rgba(17, 17, 17, 1)",
    },
  },
  rows: {
    style: {
      background: "#ECE8FF",
      borderRadius: "6px",
      padding: "14px 0",
      margin: "10px 0",
      borderBottomWidth: "0 !important",
    },
  },
  cells: {
    style: {
      color: "rgba(17, 17, 17, 1)",
      fontSize: "14px",
    },
  },
};

const dashboardCardsData = [
  {
    title: "Total Buildings",
    value: "125",
    icon: "/images/dashboard/total-buildings.png",
    percentageChange:
      "<span class='text-[#00B69B]'>8.5%</span> Up from yesterday",
  },
  {
    title: "Total Restrooms",
    value: "212",
    icon: "/images/dashboard/total-restroom.png",
    percentageChange:
      "<span class='text-[#00B69B]'>8.5%</span> Up from yesterday",
  },
  {
    title: "Total Sensors",
    value: "223",
    icon: "/images/dashboard/total-sensors.png",
    percentageChange:
      "<span class='text-[#00B69B]'>8.5%</span> Up from yesterday",
  },
  {
    title: "Total Subscriptions",
    value: "12",
    icon: "/images/dashboard/total-subscription.png",
    percentageChange:
      "<span class='text-[#00B69B]'>8.5%</span> Up from yesterday",
  },
];

const pieChartData = [
  { name: "Building 1", value: 490 },
  { name: "Building 2", value: 102 },
  { name: "Building 3", value: 209 },
];

const buildingData = [
  {
    id: "1",
    title: "Arfa Tower",
    location: "Ryad, Saudi Arabia",
    image: "/images/dashboard/building-one.png",
    numberOfFloors: 4,
    numberOfRestrooms: 14,
    buildingType: "Public",
  },
  {
    id: "12",
    title: "Bahrain Plaza",
    location: "Downtown, Manama, Bahrain",
    image: "/images/dashboard/building-two.png",
    numberOfFloors: 8,
    numberOfRestrooms: 20,
    buildingType: "Commercial",
  },
  {
    id: "23",
    title: "Dubai Heights",
    location: "Business Bay, Dubai, UAE",
    image: "/images/dashboard/building-three.png",
    numberOfFloors: 12,
    numberOfRestrooms: 30,
    buildingType: "Private",
  },
  {
    id: "34",
    title: "Kuwait Residency",
    location: "Salmiya, Kuwait",
    image: "/images/dashboard/building-one.png",
    numberOfFloors: 6,
    numberOfRestrooms: 18,
    buildingType: "Private",
  },
  {
    id: "54",
    title: "Qatar Hub",
    location: "West Bay, Doha, Qatar",
    image: "/images/dashboard/building-two.png",
    numberOfFloors: 10,
    numberOfRestrooms: 24,
    buildingType: "Commercial",
  },
  {
    id: "56",
    title: "Oman Oasis",
    location: "Muscat, Oman",
    image: "/images/dashboard/building-three.png",
    numberOfFloors: 5,
    numberOfRestrooms: 16,
    buildingType: "Commercial",
  },
];

const initialSensorsData = [
  {
    _id: "1",
    name: "Pressure Sensor",
    ip: "255.255.255.255",
    port: "2093",
    type: "Pressure",
    uniqueId: "123456789",
    status: "connected",
  },
  {
    _id: "2",
    name: "Temperature Sensor",
    ip: "192.168.1.10",
    port: "3001",
    type: "Temperature",
    uniqueId: "987654321",
    status: "disconnected",
  },
  {
    _id: "3",
    name: "Humidity Sensor",
    ip: "10.0.0.5",
    port: "8080",
    type: "Humidity",
    uniqueId: "1122334455",
    status: "connected",
  },
];

const planCardsData = [
  {
    title: "Starter",
    subtitle: "Basic Builder",
    price: "29",
    type: "monthly",
    featuresList: [
      "Manage up to 3 buildings",
      "Connect up to 10 sensors",
      "Basic real-time monitoring",
      "Standard reporting tools",
      "Email support",
    ],
    description:
      "Start with the essentials. Ideal for small teams or single buildings, this plan provides the foundational tools to get your smart building up and running efficiently",
    bg: "#B2FFB0",
    btnBg: "#008B26",
  },
  {
    title: "Standard",
    subtitle: "Pro Manager",

    price: "39",
    type: "yearly",
    featuresList: [
      "Manage up to 3 buildings",
      "Connect up to 10 sensors",
      "Basic real-time monitoring",
      "Standard reporting tools",
      "Email support",
    ],
    description:
      "Start with the essentials. Ideal for small teams or single buildings, this plan provides the foundational tools to get your smart building up and running efficiently",
    bg: "#81CEFF",
    btnBg: "#0067A9",
  },
  {
    title: "Premium",
    subtitle: "Basic Plan",

    price: "49",
    type: "lifetime",
    featuresList: [
      "Manage up to 3 buildings",
      "Connect up to 10 sensors",
      "Basic real-time monitoring",
      "Standard reporting tools",
      "Email support",
    ],
    description:
      "Start with the essentials. Ideal for small teams or single buildings, this plan provides the foundational tools to get your smart building up and running efficiently",
    bg: "#FFCF87",
    btnBg: "#F2AC44",
  },
];

const subscriptionHistoryData = [
  {
    _id: "123123sd",
    date: "24 June 2024",
    plan: "Standard",
    amount: "19.99",
    status: "expired",
    invoice: "",
  },
  {
    _id: "456456gh",
    date: "15 July 2024",
    plan: "Premium",
    amount: "29.99",
    status: "active",
    invoice: "INV-2024-001",
  },
  {
    _id: "789789jk",
    date: "01 Aug 2024",
    plan: "Standard",
    amount: "19.99",
    status: "cancelled",
    invoice: "INV-2024-002",
  },
  {
    _id: "101010ab",
    date: "12 Sept 2024",
    plan: "Basic",
    amount: "9.99",
    status: "active",
    invoice: "INV-2024-003",
  },
  {
    _id: "121212cd",
    date: "30 October 2024",
    plan: "Premium",
    amount: "29.99",
    status: "expired",
    invoice: "",
  },
  {
    _id: "131313ef",
    date: "05 November 2024",
    plan: "Standard",
    amount: "19.99",
    status: "active",
    invoice: "INV-2024-004",
  },
];

const queueingStatusData = [
  {
    title: "Total Restrooms",
    value: "12",
  },
  {
    title: "Occupied Restrooms",
    value: "08",
  },
  {
    title: "Vacant Restrooms",
    value: "03",
  },
  {
    title: "Peoples In Queue",
    value: "12",
  },
  {
    title: "Flow Count",
    value: "2 IN  &  1 OUT",
  },
];

const infoCardsData = [
  {
    title: "Total Floors",
    count: 2,
    icon: "/svgs/user/green-step.svg",
    borderColor: "border-[#078E9B]",
    hoverColor: "hover:bg-[#078E9B15]",
  },
  {
    title: "Total Restrooms",
    count: 5,
    icon: "/svgs/user/purple-restroom.svg",
    borderColor: "border-[#A449EB]",
    hoverColor: "hover:bg-[#A449EB15]",
  },
  {
    title: "Restrooms In Use",
    count: 135,
    icon: "/svgs/user/yellow-toilet.svg",
    borderColor: "border-[#FF9500]",
    hoverColor: "hover:bg-[#FF950015]",
  },
  {
    title: "Total Sensors",
    count: 9,
    icon: "/svgs/user/pink-buzzer.svg",
    borderColor: "border-[#FF4D85]",
    hoverColor: "hover:bg-[#FF4D8515]",
  },
];

const activityChartData = [
  { name: "", floor1: 100, floor2: 2400, floor3: 2400 },
  { name: "5 May", floor1: 200, floor2: 1398, floor3: 4010 },
  { name: "6 May", floor1: 1800, floor2: 1800, floor3: 2290 },
  { name: "7 May", floor1: 680, floor2: 3908, floor3: 2500 },
  { name: "8 May", floor1: 1890, floor2: 4500, floor3: 2181 },
  { name: "9 May", floor1: 1890, floor2: 2400, floor3: 2181 },
  { name: "10 May", floor1: 1890, floor2: 4000, floor3: 2181 },
  { name: "11 May", floor1: 1890, floor2: 1400, floor3: 2981 },
  { name: "12 May", floor1: 1890, floor2: 5500, floor3: 1181 },
  { name: "13 May", floor1: 490, floor2: 3800, floor3: 500 },
  { name: "14 May", floor1: 1500, floor2: 2900, floor3: 2700 },
  { name: "15 May", floor1: 1200, floor2: 3100, floor3: 2300 },
  { name: "16 May", floor1: 2000, floor2: 2000, floor3: 4000 },
  { name: "17 May", floor1: 950, floor2: 1500, floor3: 1800 },
  { name: "18 May", floor1: 2100, floor2: 4500, floor3: 3500 },
  { name: "19 May", floor1: 1700, floor2: 3800, floor3: 2900 },
  { name: "20 May", floor1: 2500, floor2: 3100, floor3: 2200 },
];

const lineChartData = [
  { day: 1, value: 15 },
  { day: 2, value: 28 },
  { day: 3, value: 40 },
  { day: 4, value: 32 },
  { day: 5, value: 45 },
  { day: 6, value: 35 },
  { day: 7, value: 25 },
  { day: 8, value: 39 },
  { day: 9, value: 41 },
  { day: 10, value: 30 },
  { day: 11, value: 22 },
  { day: 12, value: 38 },
  { day: 13, value: 42 },
  { day: 14, value: 43 },
  { day: 15, value: 44 },
  { day: 16, value: 29 },
  { day: 17, value: 28 },
  { day: 18, value: 20 },
  { day: 19, value: 15 },
  { day: 20, value: 18 },
  { day: 21, value: 21 },
  { day: 22, value: 27 },
  { day: 23, value: 35 },
  { day: 24, value: 30 },
  { day: 25, value: 25 },
  { day: 26, value: 17 },
  { day: 27, value: 12 },
  { day: 28, value: 15 },
  { day: 29, value: 20 },
  { day: 30, value: 18 },
];

const mostUsedRoomsList = [
  {
    room: "Restroom 5",
    floor: "Floor 7",
    used: "70%",
  },
  {
    room: "Restroom 3",
    floor: "Floor 2",
    used: "30%",
  },
  {
    room: "Restroom 1",
    floor: "Floor 9",
    used: "60%",
  },
  {
    room: "Conference Room A",
    floor: "Floor 1",
    used: "85%",
  },
  {
    room: "Lobby Lounge",
    floor: "Ground Floor",
    used: "90%",
  },
  {
    room: "Pantry Area",
    floor: "Floor 3",
    used: "45%",
  },
  {
    room: "Meeting Room 2",
    floor: "Floor 5",
    used: "55%",
  },
  {
    room: "Restroom 7",
    floor: "Floor 4",
    used: "65%",
  },
  {
    room: "Executive Lounge",
    floor: "Floor 10",
    used: "75%",
  },
];

const floorListData = [
  {
    id: 1,
    floorName: "Floor | 1",
    image: "/images/dashboard/building-one.png",
    totalRestrooms: "10",
    occupiedRestrooms: "5",
    freeRestrooms: "5",
    activeSensors: "8",
  },
  {
    id: 2,
    floorName: "Floor | 2",
    image: "/images/dashboard/building-two.png",
    totalRestrooms: "12",
    occupiedRestrooms: "6",
    freeRestrooms: "6",
    activeSensors: "10",
  },
  {
    id: 3,
    floorName: "Floor | 3",
    image: "/images/dashboard/building-three.png",
    totalRestrooms: "8",
    occupiedRestrooms: "3",
    freeRestrooms: "5",
    activeSensors: "6",
  },
];

const alertHistoryData = [
  {
    date: "2023-10-01",
    alertName: "Sensor Disconnected",
    message: "Sensor 123456789 has been disconnected.",
  },
  {
    date: "2023-10-02",
    alertName: "High Humidity Level",
    message: "Humidity level in Restroom 5 is above normal.",
  },
  {
    date: "2023-10-03",
    alertName: "Low Battery",
    message: "Battery level of Sensor 987654321 is low.",
  },
];

export {
  dashboardCardsData,
  pieChartData,
  buildingData,
  tableStyles,
  initialSensorsData,
  planCardsData,
  subscriptionHistoryData,
  queueingStatusData,
  infoCardsData,
  activityChartData,
  lineChartData,
  mostUsedRoomsList,
  floorListData,
  alertHistoryData,
};
