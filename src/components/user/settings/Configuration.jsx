'use client';
import Modal from '@/components/global/Modal';
import Button from '@/components/global/small/Button';
import Dropdown from '@/components/global/small/Dropdown';
import Input from '@/components/global/small/Input';
import { useUpdateProfileMutation } from '@/features/auth/authApi';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const intervalTimesInSeconds = [
  { option: '3 minutes', value: '180000' },
  { option: '2 minutes', value: '120000' },
  { option: '1 minutes', value: '60000' },
  { option: '10 seconds', value: '10000' },
  { option: '30 seconds', value: '30000' },
  { option: '5 seconds', value: '5000' },
];

const Configuration = () => {
  const [modal, setModal] = useState(false);
  const { user } = useSelector(state => state.auth);

  const [selectedOption, setSelectedOption] = useState();
  const [pendingOption, setPendingOption] = useState('');
  const hasSubscription = Boolean(user?.user?.subscriptionId);
  const [defaultTextForInterval, setDefaultTextForInterval] = useState('3 minutes');
  const [timeInterval, setTimeInterval] = useState('180000'); // 3 min (ms)
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [formValues, setFormValues] = useState({
    timeInterval: '',
    dbName: '',
    portNumber: '',
    userName: '',
    password: '',
    hostName: '',
  });
  // console.log("user", user?.user);

  const handleChange = event => {
    const { name, value } = event.target;
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleRadioChange = event => {
    setPendingOption(event.target.value);
    setModal(true);
  };
  // console.log("ssssssssssssssssssss", pendingOption);

  const handleConfirmChange = () => {
    setSelectedOption(pendingOption);
    console.log('pendingOption', pendingOption);
    if (pendingOption === 'Local Database') {
      setFormValues(prevValues => ({
        ...prevValues, // keep timeInterval and any other existing values
        dbName: '',
        portNumber: '',
        userName: '',
        password: '',
        hostName: '',
      }));
    }

    setModal(false);
  };

  console.log('formvalue', formValues);

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const formData = new FormData();

      const { dbName, hostName, portNumber, userName, password, timeInterval } = formValues;

      if (selectedOption === 'Remote Database') {
        // Validate remote DB fields
        if (!dbName || !hostName || !portNumber || !userName || !password) {
          toast.error('Please fill all the fields for the remote database.');
          return;
        }

        formData.append('isCustomDb', 'true');
        formData.append('customDbHost', hostName);
        formData.append('customDbPort', portNumber);
        formData.append('customDbUsername', userName);
        formData.append('customDbPassword', password);
        formData.append('customDbName', dbName);
      }

      if (selectedOption === 'Local Database') {
        // No validation required, but still send null or empty values to reset
        formData.append('isCustomDb', 'false');
        formData.append('customDbHost', hostName || '');
        formData.append('customDbPort', portNumber || '');
        formData.append('customDbUsername', userName || '');
        formData.append('customDbPassword', password || '');
        formData.append('customDbName', dbName || '');
      }

      // Add time interval if exists
      if (timeInterval) {
        formData.append('interval', timeInterval);
      }

      const response = await updateProfile(formData).unwrap();

      if (response?.success) {
        toast.success(response?.message);
        // Optionally re-fetch user data
        // await refetch(); // Uncomment if needed
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Error while updating profile');
      console.error('Error while updating profile:', error);
    }
  };

  // useEffect(() => {

  //   if (user?.user) {
  //     setFormValues({
  //       hostName: user?.user?.customDbHost || '',
  //       portNumber: user?.user?.customDbPort || '',
  //       userName: user?.user?.customDbUsername || '',
  //       password: user?.user?.customDbPassword || '',
  //       dbName: user?.user?.customDbName || '',
  //       timeInterval: '', // preserve or set explicitly if needed
  //     });
  //     setSelectedOption(user?.user?.isCustomDb ? 'Remote Database' : 'Local Database');
  //   }
  //   if (user?.user?.interval) {
  //     const interval = intervalTimesInSeconds.find((item) => item.value == String(user?.user?.interval));
  //     console.log(interval, interval?.option, user?.user?.interval);
  //     setDefaultTextForInterval(interval?.option || 'Select Time Interval');
  //   }

  //   /* ───────────────────────────────────────────────────────── */
  //   /* 1.  Un‑subscribed user ‑‑ force 3‑minute default         */
  //   /* ───────────────────────────────────────────────────────── */
  //   if (!hasSubscription) {
  //     setDefaultTextForInterval('3 minutes');
  //     setTimeInterval('180000');
  //     return; // nothing else to check
  //   }

  //   /* ───────────────────────────────────────────────────────── */
  //   /* 2.  Subscribed user with a saved custom interval         */
  //   /* ───────────────────────────────────────────────────────── */
  //   if (user?.user?.interval) {
  //     const match = intervalTimesInSeconds.find((i) => i.value === String(user.interval));
  //     setDefaultTextForInterval(match?.option ?? 'Select Time Interval');
  //     setTimeInterval(match?.value ?? '180000');
  //   }
  // }, [user?.user]);

  useEffect(() => {
    if (user?.user) {
      const {
        customDbHost,
        customDbPort,
        customDbUsername,
        customDbPassword,
        customDbName,
        interval,
        isCustomDb,
      } = user.user;

      setFormValues({
        hostName: customDbHost || '',
        portNumber: customDbPort || '',
        userName: customDbUsername || '',
        password: customDbPassword || '',
        dbName: customDbName || '',
        timeInterval: interval ? String(interval) : '180000',
      });

      setSelectedOption(isCustomDb ? 'Remote Database' : 'Local Database');

      const match = intervalTimesInSeconds.find(item => item.value === String(interval));
      setDefaultTextForInterval(match?.option || '3 minutes');
      setTimeInterval(String(interval) || '180000');
    }

    // Force 3-minute interval for unsubscribed users
    if (!hasSubscription) {
      setDefaultTextForInterval('3 minutes');
      setTimeInterval('180000');
      setFormValues(prev => ({ ...prev, timeInterval: '180000' }));
    }
  }, [user?.user]);

  console.log('setSelectedOption', selectedOption);

  return (
    <section>
      <h3 className="mb-4 text-lg font-[500] md:text-xl">Pull Request Intervals</h3>
      <form onSubmit={handleSubmit}>
        <div className="mt-4 pl-0 md:mt-6 md:pl-8">
          {hasSubscription ? (
            <Dropdown
              label="Select Time Intervals"
              defaultText={defaultTextForInterval}
              options={intervalTimesInSeconds}
              onSelect={option =>
                setFormValues(prevValues => ({
                  ...prevValues,
                  timeInterval: option,
                }))
              }
            />
          ) : (
            <p className="text-sm text-gray-500">
              Interval fixed at <strong>3&nbsp;minutes</strong>
              &nbsp;(subscription required to change)
            </p>
          )}

          <h3 className="mt-4 mb-2 text-sm font-medium md:mt-6 md:text-base">Database Type</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="database"
                value="Local Database"
                onChange={handleRadioChange}
                checked={selectedOption === 'Local Database'}
              />
              Local Database
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="database"
                value="Remote Database"
                onChange={handleRadioChange}
                checked={selectedOption === 'Remote Database'}
              />
              Remote Database
            </label>
          </div>

          <div className="mt-4">
            {selectedOption === 'Remote Database' && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
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
          <div className="mt-4 flex justify-end">
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
          <ConfirmationModal onClose={() => setModal(false)} onConfirm={handleConfirmChange} />
        </Modal>
      )}
    </section>
  );
};

export default Configuration;

const ConfirmationModal = ({ onClose, onConfirm }) => {
  return (
    <div>
      <h6 className="text-sm font-medium text-gray-400 md:text-base">
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
