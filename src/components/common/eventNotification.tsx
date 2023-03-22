import { IRootState } from "@/redux";
import { updateEventNotificationQueue } from "@/redux/globalSlice";
import style from "@/styles/common/eventNotification.module.sass";
import { cloneDeep } from "lodash";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const EventNotification = () => {
  const { eventNotificationQueue } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (eventNotificationQueue.length === 0) {
      return;
    }

    const id = setTimeout(() => {
      let updated = cloneDeep(eventNotificationQueue);
      updated.pop();
      dispatch(updateEventNotificationQueue(updated));
    }, 8000);

    return () => {
      clearTimeout(id);
    };
  }, [eventNotificationQueue]);

  return (
    <div className={style.eventNotification}>
      <div className={style.innerScroll}>
        <div className={style.innerFlex}>
          {eventNotificationQueue.map((item, index) => {
            return (
              <div key={index} className={style.eventItem}>
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default EventNotification;
