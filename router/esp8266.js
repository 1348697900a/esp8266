import express from "express";
import { db } from "../app.js";
import wrapperRes from "../utils/wrapperRes.js";
import validateIsLate from "../utils/validateIsLate.js";
import checkTimeRange from "../utils/checkTimeRange.js";
import dayjs from "dayjs";
const router = express.Router();

router.use((req, res, next) => {
  // 处理
  next();
});
/**
 *  获得可用指纹模版ID
 */
router.get("/getFingerprintID", async (req, res) => {
  // 空间换时间
  const arr = new Array(127).fill(false);
  (await db.collection("fingerprintIDList").find().toArray()).forEach((v) => {
    arr[v.fingerprintID] = true;
  });
  const ID = arr.findIndex((v) => v === false);
  res.send(
    wrapperRes({
      data: {
        id: ID,
      },
    })
  );
});

/**
 * 根据ID查询员工姓名
 */
router.post("/getStaffName", async (req, res) => {
  const { id } = req.body;
  const [user = {}] = (
    await db
      .collection("user")
      .find({
        fingerprintID: {
          $eq: Number(id),
        },
      })
      .toArray()
  )
    .map((v) => (v.is_exist === "在职" ? v : ""))
    .filter((v) => v);
  const [config] =
    (await db
      .collection("config")
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .toArray()) || [];
  await db.collection("recordList").insertOne({
    fingerprintID: Number(id),
    date: new Date().getTime(),
    college: user.college || "",
    is_exist: user.is_exist || "",
    staff_name: user.staff_name || "",
    is_late: validateIsLate(config.work_time_range),
  });

  // 更新数据汇总
  //
  const date = dayjs(new Date().getTime()).format("YYYY-MM-DD");
  const [todayRecord] = await db
    .collection("dataShow")
    .find({ date })
    .toArray();
  if (todayRecord) {
    const { is_late, classes } = checkTimeRange({
      range: config.work_time_range,
    });
    const index = todayRecord.data[classes].findIndex(
      (v) => v.fingerprintID === user.fingerprintID
    );
    // 当天记录存在
    // 迟到
    if (is_late) {
      const key = `data.${classes}.${index}.lateInfo`;
      db.collection("dataShow").updateOne(
        { date },
        {
          $set: { [key]: { is_late: true, time: date } },
        }
      );
    } else {
      // 正常签到,删除对应记录
      const key = `data.${classes}`;
      db.collection("dataShow")
        .updateOne(
          { date },
          {
            $pull: {
               [key]: { fingerprintID: user.fingerprintID },
            },
          }
        )
    }
  } else {
    // 查询用户集合
    const userList = (await db.collection("user").find().toArray()).map((v) => {
      const { staff_name, fingerprintID, college } = v;
      return { staff_name, fingerprintID, college };
    });
    // 不存在
    db.collection("dataShow").insertOne({
      date,
      data: {
        total_nums: userList.length,
        lack_ones_nums: userList.length,
        lack_two_nums: userList.length,
        morning: userList,
        afternoon: userList,
      },
      record_time: new Date().getTime(),
    });
  }
  res.send(wrapperRes(user));
});
router.post("/addFingerprintID", async (req, res) => {
  const { id } = req.body;
  const idList = (
    await db
      .collection("fingerprintIDList")
      .find({
        fingerprintID: {
          $eq: Number(id),
        },
      })
      .toArray()
  ).map((v) => v.fingerprintID === id);
  console.log(id);
  if (idList.length === 0) {
    await db.collection("fingerprintIDList").insertOne({
      fingerprintID: Number(id),
      register_time: new Date().getTime(),
    });
    res.send(wrapperRes());
  } else {
    res.send(wrapperRes({ code: 1, msg: "error!ID has exist" }));
  }
});
export default router;
