const ReportsIcon = ({ isLinkActive }) => {
  return (
    <svg
      width="16"
      height="20"
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 7H14.5L9 1.5V7ZM2 0H10L16 6V18C16 18.5304 15.7893 19.0391 15.4142 19.4142C15.0391 19.7893 14.5304 20 14 20H2C1.46957 20 0.960859 19.7893 0.585786 19.4142C0.210714 19.0391 0 18.5304 0 18V2C0 0.89 0.89 0 2 0ZM3 18H5V12H3V18ZM7 18H9V10H7V18ZM11 18H13V14H11V18Z"
        fill={isLinkActive ? "#a449eb" : "white"}
      ></path>
    </svg>
  );
};

export default ReportsIcon;
