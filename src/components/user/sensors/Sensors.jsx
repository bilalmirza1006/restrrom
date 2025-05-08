"use client";
import Modal from "@/components/global/Modal";
import Button from "@/components/global/small/Button";
import ToggleButton from "@/components/global/small/ToggleButton";
import { tableStyles } from "@/data/data";
import {
  useDeleteSensorMutation,
  useGetAllSensorsQuery,
  useUpdateSensorMutation,
} from "@/features/sensor/sensorApi";
import Link from "next/link";
import { useState } from "react";
import DataTable from "react-data-table-component";
import toast from "react-hot-toast";
import { AiOutlineDelete } from "react-icons/ai";
import { CiEdit } from "react-icons/ci";
import { HiOutlineEye } from "react-icons/hi2";
import { IoIosAddCircle } from "react-icons/io";
import AddSensor from "./AddSensor";
import EditSensor from "./EditSensor";
import Spinner from "@/components/global/small/Spinner";

const Sensors = () => {
  const [modalType, setModalType] = useState("");
  const [selectedSensor, setSelectedSensor] = useState(null);
  const { data, isLoading } = useGetAllSensorsQuery();
  const [updateSensor] = useUpdateSensorMutation();
  const [deleteSensor, { isLoading: deleteLoading }] =
    useDeleteSensorMutation();
  const modalOpenHandler = (type, sensor = null) => {
    setModalType(type);
    setSelectedSensor(sensor);
  };
  const modalCloseHandler = (type) => setModalType("");

  const deleteSensorHandler = async (sensorId) => {
    try {
      const res = await deleteSensor(sensorId).unwrap();
      toast.success(res.message || "Sensor deleted successfully");

      modalCloseHandler();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error("Error deleting sensor:", error);
      modalCloseHandler();
    }
  };
  const handleStatusHandler = async (sensor) => {
    const updatedStatus = !sensor.status;
    try {
      const res = await updateSensor({
        sensorId: sensor._id,
        data: { status: updatedStatus },
      }).unwrap();
      toast.success(res.message || "Sensor status updated successfully");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error("Error updating sensor status:", error);
    }
  };

  return (
    <section className="bg-white p-4 md:p-5 rounded-[10px]">
      <div className="flex justify-between items-center">
        <h4 className="text-base md:text-xl font-semibold text-[#05004E]">
          All Sensors
        </h4>
        <button onClick={() => modalOpenHandler("add")}>
          <IoIosAddCircle className="text-primary text-2xl" />
        </button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <Spinner />
        ) : (
          <DataTable
            data={data?.sensors || []}
            columns={tableColumns(handleStatusHandler, modalOpenHandler)}
            customStyles={tableStyles}
            pagination
            fixedHeader
            fixedHeaderScrollHeight="60vh"
            selectableRows
          />
        )}
      </div>
      {modalType === "add" && (
        <Modal onClose={modalCloseHandler} title={"Add Sensor"}>
          <AddSensor onClose={modalCloseHandler} />
        </Modal>
      )}
      {modalType === "edit" && (
        <Modal onClose={modalCloseHandler} title={"Edit Sensor"}>
          <EditSensor
            onClose={modalCloseHandler}
            selectedSensor={selectedSensor}
          />
        </Modal>
      )}
      {modalType === "delete" && (
        <Modal
          onClose={modalCloseHandler}
          title={"Confirmation"}
          width="w-[300px] md:w-[600px]"
        >
          <div>
            <p className="text-[16px] text-[#00000090]">
              Are you sure you want to delete this sensor?
            </p>
            <div className="flex items-center justify-end gap-4 mt-5">
              <Button
                onClick={modalCloseHandler}
                text="Cancel"
                cn="border-primary bg-transparent !text-primary"
              />
              <Button
                onClick={() => deleteSensorHandler(selectedSensor?._id)}
                text={deleteLoading ? "Deleting..." : "Delete Sensor"}
                disabled={deleteLoading}
              />
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default Sensors;

const tableColumns = (handleStatusHandler, modalOpenHandler) => [
  {
    name: "Sensor Name",
    selector: (row) => row?.name,
  },
  {
    name: "Type",
    selector: (row) => row?.type,
  },
  {
    name: "Unique Id",
    selector: (row) => row?.uniqueId,
  },
  {
    name: "Is Connected",
    selector: (row) =>
      row?.isConnected === true ? (
        <span>Connected</span>
      ) : (
        <span>Disconnected</span>
      ),
  },
  {
    name: "Status",
    cell: (row) => (
      <ToggleButton
        isChecked={row.status}
        onToggle={() => handleStatusHandler(row)}
      />
    ),
  },
  {
    name: "Action",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Link href={`/sensors/${row._id}`}>
          <div className="cursor-pointer">
            <HiOutlineEye fontSize={20} />
          </div>
        </Link>

        <div
          className="cursor-pointer"
          onClick={() => modalOpenHandler("edit", row)}
        >
          <CiEdit fontSize={23} />
        </div>
        <div
          className="cursor-pointer"
          onClick={() => modalOpenHandler("delete", row)}
        >
          <AiOutlineDelete fontSize={23} style={{ color: "red" }} />
        </div>
      </div>
    ),
  },
];
