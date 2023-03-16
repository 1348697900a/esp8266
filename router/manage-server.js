import express from "express";
import { db } from "../app.js";
import wrapperRes from "../utils/wrapperRes.js";
const router = express.Router();

/**
 * 查询打卡记录
 */
router.get("/getRecordList", async (req, res) => {
  const recordListCollection = db.collection("recordList");
  const {
    date_range = [],
    college_list = [],
    staff_name_list = [],
    page_current = 1,
    page_size = 10,
    is_late = undefined,
  } = req.query;
  const queryConfig = Object.keys(req.query).reduce((pre, cur) => {
    switch (cur) {
      case "date_range":
        pre.date = {
          $gte: Number(date_range[0]),
          $lte: Number(date_range[1]),
        };
        break;
      case "college_list":
        pre.college = {
          $in: college_list,
        };
        break;
      case "staff_name_list":
        pre.staff_name = {
          $in: staff_name_list,
        };
        break;
      case "is_late":
        pre.is_late = is_late === "true";
    }
    return pre;
  }, {});
  const getRecordList = () =>
    recordListCollection
      .find(queryConfig)
      .sort({ date: -1 })
      .skip((Number(page_current) - 1) * Number(page_size))
      .limit(Number(page_size))
      .toArray();
  const getCount = () => recordListCollection.countDocuments();
  const resultList = await Promise.allSettled([getRecordList(), getCount()]);
  const [recordList, total] = resultList.map((v) => v.value);
  console.log(resultList);
  res.send(wrapperRes({ data: recordList, total, page_current, page_size }));
});

/**
 * 查询打卡情况
 */
router.post("/dataShow", async (req, res) => {
  const { date=new Date().getTime(), page_current = 1, page_size = 10 } = req.body;
  const result =(await db
    .collection("dataShow")
    .find({ date })
    .sort({ date: -1 })
    .skip((Number(page_current) - 1) * Number(page_size))
    .limit(Number(page_size))
    .toArray());  
    const data = result.map(v => ({record_time:v.record_time,date:v.date,...v.data}))
    res.send(wrapperRes({data}))
});

/**
 * 查询员工集合
 */
router.get("/getUserList", async (req, res) => {
  const { staff_name_list = [] } = req.query;
  const userCollection = db.collection("user");
  const queryConfig =
    staff_name_list.length > 0 ? { staff_name: { $in: staff_name_list } } : {};
  const userList = await userCollection.find(queryConfig).toArray();
  res.send(wrapperRes({ data: userList }));
});

/**
 * 验证指纹模版ID是否可用
 */
router.get("/validateFingerprintID", async (req, res) => {
  const { fingerprintID } = req.query;
  const userCollection = db.collection("user");
  const fingerprintList = db.collection("fingerprintIDList");
  const queryConfig = {
    fingerprintID: {
      $eq: Number(fingerprintID),
    },
  };
  let [user, fingerInfo] = await Promise.allSettled([
    userCollection.find(queryConfig).toArray(),
    fingerprintList.find(queryConfig).toArray(),
  ]);
  user = (user.value || [])
    .map((v) => (v.is_exist === "在职" ? user : ""))
    .filter((v) => v);

  if (user.length > 0 || fingerInfo.value.length === 0) {
    setTimeout(() => {
      res.send(
        wrapperRes({
          code: 1,
          msg: "error,fingerprintIDTemplate has register or the id not found!",
        })
      );
    }, 1000);
  } else {
    setTimeout(() => {
      res.send(wrapperRes());
    });
  }
});
/**
 * 新增员工信息
 */
router.post("/addUserInfo", async (req, res) => {
  const { staff_name, college, fingerprintID } = req.body;
  const userCollection = db.collection("user");
  const fingerprintList = db.collection("fingerprintIDList");
  // 插入新数据得保证fingerprintID唯一且存在，在validateFingerprintID验证
  const [user] = await fingerprintList
    .find({
      fingerprintID: {
        $eq: fingerprintID,
      },
    })
    .toArray();
  await userCollection.insertOne({
    staff_name,
    college,
    fingerprintID,
    register_time: user?.register_time || new Date().getTime(),
    leave_time: "---",
    is_exist: "在职",
  });
  res.send(wrapperRes({ msg: "add user success!" }));
});

/**
 * 更改员工在职状态
 */
router.post("/updateUserInfo", async (req, res) => {
  const { is_exist = "在职", fingerprintID } = req.body;
  const currentState = is_exist === "在职";
  const userCollection = db.collection("user");
  const fingerprintList = db.collection("fingerprintIDList");
  const updateInfo = {
    is_exist: currentState ? "离职" : "在职",
    [currentState ? "leave_time" : "register_time"]: new Date().getTime(),
  };
  console.log(updateInfo);
  Promise.allSettled([
    userCollection.updateOne(
      { fingerprintID },
      {
        $set: updateInfo,
      }
    ),
    fingerprintList.deleteOne({ fingerprintID }),
  ])
    .then((res) => {
      res.send(wrapperRes());
    })
    .catch(() => {
      res.send(wrapperRes({ code: 1, msg: "未知错误/updateUserInfo" }));
    });
});
/**
 * 全局配置
 */
router.get("/getConfig", async (req, res) => {
  const [config] =
    (await db
      .collection("config")
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .toArray()) || [];
  res.send(wrapperRes({ data: config }));
});
/**
 * 更新全局配置
 */
router.post("/updateConfig", async (req, res) => {
  const { work_time_range } = req.body;
  db.collection("config").insertOne({ work_time_range });
  res.send(wrapperRes());
});
router.get("/userList", (req, res) => {
  console.log(req.query);
  const { keywords = "" } = req.query;
  let data = [];
  if (keywords) {
    // data = new Array(10).fill(0).map((v, i) => ({
    //   label: keywords + i,
    //   value: keywords + i,
    // }));
  } else {
    data = [
      { label: "开始", value: "start" },
      { label: "POST", value: "post" },
      { label: "发送", value: "send" },
    ];
  }
  setTimeout(() => {
    res.send(
      wrapperRes({
        data,
      })
    );
  }, 1000);
});

/**
 * 登陆页面，明文传输没做加密处理
 */
router.post("/login", async (req, res) => {
  const { account, password } = req.body;

  const admin = await db.collection("admin").findOne({ account, password });
  let config = admin
    ? { data: { admin_name: admin?.admin_name } }
    : { code: 1, msg: "账号或密码错误" };
  setTimeout(() => {
    res.send(wrapperRes(config));
  }, 1000);
});

export default router;
