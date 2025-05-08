"use client";
import Modal from "@/components/global/Modal";
import Button from "@/components/global/small/Button";
import Dropdown from "@/components/global/small/Dropdown";
import Input from "@/components/global/small/Input";
import { useState } from "react";

const intervalTimesInSeconds = [
  { option: "3 minutes", value: "180000" },
  { option: "2 minutes", value: "120000" },
  { option: "1 minutes", value: "60000" },
  { option: "10 seconds", value: "10000" },
  { option: "30 seconds", value: "30000" },
  { option: "5 seconds", value: "5000" },
];

const Configuration = () => {
  const [modal, setModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Local Database");
  const [pendingOption, setPendingOption] = useState("");
  const [formValues, setFormValues] = useState({
    timeInterval: "",
    dbName: "",
    portNumber: "",
    userName: "",
    password: "",
    hostName: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleRadioChange = (event) => {
    setPendingOption(event.target.value);
    setModal(true);
  };
  const handleConfirmChange = () => {
    setSelectedOption(pendingOption);
    setModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <section>
      <h3 className="text-lg md:text-xl font-[500] mb-4">
        Pull Request Intervals
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="pl-0 md:pl-8 mt-4 md:mt-6">
          <Dropdown
            label="Select Time Intervals"
            defaultText={"Select Time Intervals"}
            options={intervalTimesInSeconds}
            onSelect={(option) =>
              setFormValues((prevValues) => ({
                ...prevValues,
                timeInterval: option,
              }))
            }
          />

          <h3 className="text-sm md:text-base font-medium mb-2 mt-4 md:mt-6">
            Database Type
          </h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="database"
                value="Local Database"
                onChange={handleRadioChange}
                checked={selectedOption === "Local Database"}
              />
              Local Database
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="database"
                value="Remote Database"
                onChange={handleRadioChange}
                checked={selectedOption === "Remote Database"}
              />
              Remote Database
            </label>
          </div>
          <div className="mt-4">
            {selectedOption === "Remote Database" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6">
                  <Input
                    type="number"
                    placeholder="Port Number"
                    value={formValues.portNumber}
                    name="portNumber"
                    onChange={handleChange}
                  />
                </div>
                <div className="lg:col-span-6">
                  <Input
                    type="text"
                    placeholder="Host Name"
                    value={formValues.hostName}
                    name="hostName"
                    onChange={handleChange}
                  />
                </div>
                <div className="lg:col-span-6">
                  <Input
                    type="text"
                    placeholder="Database Name"
                    name="dbName"
                    onChange={handleChange}
                    value={formValues.dbName}
                  />
                </div>
                <div className="lg:col-span-6">
                  <Input
                    type="text"
                    placeholder="Username"
                    value={formValues.userName}
                    name="userName"
                    onChange={handleChange}
                  />
                </div>
                <div className="lg:col-span-12">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={formValues.password}
                    name="password"
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Button text="Save" width="!w-[150px]" type="submit" />
          </div>
        </div>
      </form>
      {modal && (
        <Modal
          onClose={() => setModal(false)}
          title="Database Storage Confirmation"
          width="w-[320px] md:w-[450px]"
        >
          <ConfirmationModal
            onClose={() => setModal(false)}
            onConfirm={handleConfirmChange}
          />
        </Modal>
      )}
    </section>
  );
};

export default Configuration;

const ConfirmationModal = ({ onClose, onConfirm }) => {
  return (
    <div>
      <h6 className="text-sm md:text-base text-gray-400 font-medium">
        Do you want to store your data in a local database?
      </h6>
      <div className="mt-12 flex justify-end">
        <div className="flex items-center gap-4">
          <Button
            bg="text-[#A449EB] border-[#A449EB] border-[1px] bg-transparent hover:bg-[#A449EB] hover:text-white"
            text="Cancel"
            width="w-[120px]"
            onClick={onClose}
          />
          <Button text="Change" width="w-[120px]" onClick={onConfirm} />
        </div>
      </div>
    </div>
  );
};
