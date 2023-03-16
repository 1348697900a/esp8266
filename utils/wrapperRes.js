const wrapperRes = (config = {}) => {
  const {
    data = [],
    code = 0,
    msg = "success!",
    page_size = 10,
    page_current = 1,
    total = 0,
  } = config;
  return JSON.stringify({
    data: {
      list:data,
      page_size,
      page_current,
      total,
    },
    code,
    msg,
  });
};
export default wrapperRes;
