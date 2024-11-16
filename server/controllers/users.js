import User from "../models/User.js";
import { createError } from "../middleware/createError.js";
import { addOrUpdateCronJob } from "../feature/cronJob.js";
import bcrypt from "bcrypt";
//@desc Get user by id
//@route GET /api/users/:id
//@access Public
export const getUserById = async (req, res, next) => {
  try {
    const user = User.findById(req.params.id);
    if (!user) {
      return next(createError(404, "User not found"));
    }
    const { password, hashedPassword, ...others } = user._doc;
    res.status(200).json(others);
  } catch (error) {
    next(error);
  }
};

//@desc Get user by id
//@route PUT /api/user/update
//@access Private
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      signWithGoogle: false,
    });
    if (!user) {
      return res.status(404).json("User not found");
    }
    let updateFields = {
      name: req.body.name,
      email: req.body.email,
      receiveGmail: req.body.receiveGmail,
    };
    if (req.body.oldPassword !== "" || req.body.newPassword !== "") {
      const salt = bcrypt.genSaltSync(10);
      if (req.body.oldPassword !== user.password) {
        return res.status(400).json("Wrong password");
      }
      updateFields = {
        ...updateFields,
        password: req.body.newPassword,
        hashedPassword: bcrypt.hashSync(req.body.newPassword, salt),
      };
    }
    if ((req.body.frequency, req.body.hour, req.body.minute, req.body.day)) {
      updateFields = {
        ...updateFields,
        autoUpdateConfig: {
          frequency: req.body.frequency,
          hour: req.body.hour,
          minute: req.body.minute,
          day: req.body.day,
          cronJobCode: CronJobCodeGenerator(
            req.body.frequency,
            req.body.hour,
            req.body.minute,
            req.body.day,
          ),
        },
      };
    }

    const updateUser = await User.findOneAndUpdate(
      { email: req.body.email },
      updateFields,
      { new: true },
    );
    await addOrUpdateCronJob(updateUser);

    const { password, hashedPassword, ...others } = updateUser._doc;
    return res.status(200).json({ msg: "Update successfully", user_info: others });
  } catch (error) {
    next(error);
  }
};

const CronJobCodeGenerator = (frequency, hour, minute, day) => {
  if (frequency === "Hourly") {
    return `${minute} * * * *`;
  } else if (frequency === "Daily") {
    return `${minute} ${hour} * * *`;
  } else if (frequency === "Weekly") {
    return `${minute} ${hour} * * ${day}`;
  }
};
