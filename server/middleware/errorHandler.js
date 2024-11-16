import { logEvents } from "../middleware/logEvents.js";
export const errorHandler = (err, req, res, next) => {
  logEvents(
    `${err.name}: ${err.msg}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log",
  );
  console.log(err.stack);
  const status = res.statusCode ? res.statusCode : 500; // server error

  res.status(status);

  return res.json({ msg: err.msg, isError: true });
};
