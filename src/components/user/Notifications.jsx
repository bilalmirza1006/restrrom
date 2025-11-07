import { AiFillNotification } from 'react-icons/ai';

const notificationLists = [
  {
    title: 'Exceeded Time Limit',
    message: 'Sensor Fixed.',
    time: '2m',
  },
  {
    title: 'Exceeded Time Limit',
    message: 'Sensor Disturbed.',
    time: 'Just Now',
  },
];

const Notifications = () => {
  return (
    <div>
      <h3 className="md:text-md text-primary sticky top-0 left-0 border-b border-gray-300 bg-white px-3 pt-3 pb-2 text-base font-semibold">
        Notifications
      </h3>
      <div className="mt-1">
        {notificationLists.length > 0 ? (
          notificationLists.map((notification, i) => (
            <div
              key={i}
              className="flex cursor-pointer items-center justify-between gap-1 border-b border-gray-300 px-2 py-1"
            >
              <div className="flex items-center gap-2">
                <AiFillNotification fontSize={23} className="text-[#A449EB]" />
                <div>
                  <h3 className="text-xs font-medium">{notification.title}</h3>
                  <p className="text-left text-[12px] text-[#A449EB]">{notification.message}</p>
                </div>
              </div>
              <p className="text-[10px] text-[#00000099]">{notification.time}</p>
            </div>
          ))
        ) : (
          <p className="p-3 text-center text-sm">No notifications yet!</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
