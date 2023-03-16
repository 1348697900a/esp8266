const validateIsLate = (target = { morning: [], afternoon: [] }) => {
  const curTime = new Date();
  const totalSeconds =
    (curTime.getHours() * 60 + curTime.getMinutes()) * 60 +
    curTime.getSeconds();
  let { morning, afternoon } = target;
  morning = morning.map((v = "") =>
    v.split(":").reduce((pre, cur, i) => {
      if (i === 0) {
        return pre + cur * 60 * 60;
      } else {
        return pre + cur * 60;
      }
    }, 0)
  );
  afternoon = afternoon.map((v) =>
    v.split(":").reduce((pre, cur, i) => {
      if (i === 0) {
        return pre + Number(cur) * 60 * 60;
      } else {
        return pre + Number(cur) * 60;
      }
    }, 0)
  );
  if (totalSeconds >= morning[0] + 60 * 5 && totalSeconds <= morning[1]) {
    return true;
  }
  if (totalSeconds > afternoon[0] + 60 * 5 && totalSeconds <= afternoon[1]) {
    return true;
  }
  return false;
};
export default validateIsLate
