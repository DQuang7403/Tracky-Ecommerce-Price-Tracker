import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    msg:
      "Too many login attempts from this IP, please try again after 15 minutes",
    handler: (req, res, next, options) => {
      res.status(options.satusCode).json(options.message);
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
export default loginLimiter;
