import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";
dayjs.extend(isBetween);
const checkTimeRange = ({
  time = dayjs(new Date().getTime()).format("YYYY-MM-DD HH:mm "),
  range = {},
}) => {
  const YYMMDD = dayjs(new Date().getTime()).format("YYYY-MM-DD");
  // 是否迟到
  const [res] = Object.keys(range).reduce((pre, cur) => {
    const [range1, range2] = range[cur].map((v) => `${YYMMDD} ${v}`);
    const isLate = dayjs(time).isBetween(range1, range2);
    isLate &&
      pre.push({
        is_late: true,
        classes: cur,
        date: time,
      });
    return pre;
  }, []);
  let classes = "";
  if (!res) {
    // 计算属于哪个班次
    classes = dayjs(time).isBetween(
      YYMMDD + " " + "00:01",
      YYMMDD + " " + range.morning[0]
    )
      ? "morning"
      : "afternoon";
  }

  return res ? res : { is_late: false, classes };
};
export default checkTimeRange;
