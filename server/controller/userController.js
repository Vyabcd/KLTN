import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import { formatImage } from "../middleware/uploadImages.js";
import {
  cloudinaryDeleteImage,
  cloudinaryUploadImage,
} from "../utils/cloudinary.js";
import uniqid from "uniqid";
import fs from "fs";
import Coupon from "../models/Coupon.js";
import { NotFoundError } from "../errors/customErrors.js";
import Order from "../models/Order.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } });
    if (!users) {
      return res.json({ msg: "Users does not exist" });
    }
    res.status(StatusCodes.OK).json(users);
  } catch (error) {
    res.status(StatusCodes.CONFLICT).json({ msg: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    res.status(StatusCodes.CONFLICT).json({ msg: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const userWithoutPassword = user.toJSON();
    res.status(StatusCodes.OK).json({ user: userWithoutPassword });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.CONFLICT).json({ msg: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const data = { ...req.body };

    delete data.password;
    if (data.city && data.district && data.ward && data.home) {
      const address = {
        city: data.city,
        district: data.district,
        ward: data.ward,
        home: data.home,
      };
      delete data.city;
      delete data.district;
      delete data.ward;
      delete data.home;
      data.address = address;
    }

    // if (req.file) {
    //   const response = await cloudinaryUploadImage(req.file.path);
    //   fs.unlinkSync(req.file.path);
    //   data.avatar = response.secure_url;
    //   data.avatarPublicId = response.public_id;
    // }

    if (req.file) {
      const file = formatImage(req.file);
      const response = await cloudinaryUploadImage(file);
      data.avatar = response.secure_url;
      data.avatarPublicId = response.public_id;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, data);

    if (req.file && updatedUser.avatarPublicId) {
      await cloudinaryDeleteImage(updatedUser.avatarPublicId);
    }

    res.status(StatusCodes.OK).json({ msg: "User's updated" });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.CONFLICT).json({ msg: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) throw new NotFoundError(`User does not exist`);
    res.status(StatusCodes.OK).json({ msg: "User's deleted" });
  } catch (error) {
    res.status(StatusCodes.CONFLICT).json({ msg: error.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const blockedUser = await User.findByIdAndUpdate(
      id,
      { isBlocked: req.body.isBlocked || false },
      { new: true }
    );
    if (!blockedUser) throw new NotFoundError(`User does not exist`);
    res.status(StatusCodes.OK).json({ msg: "User's blocked" });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.CONFLICT).json({ msg: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId } = req.body;

    const user = await User.findById(userId);
    const isAlreadyAdd = user.wishlist.includes(productId);
    if (isAlreadyAdd)
      return res
        .status(StatusCodes.OK)
        .json({ msg: "Đã thêm vào danh sách yêu thích" });

    await User.findByIdAndUpdate(userId, {
      $push: { wishlist: productId },
    });
    res.status(StatusCodes.OK).json({ msg: "Đã thêm vào danh sách yêu thích" });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.CONFLICT).json({ msg: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId } = req.body;

    await User.findByIdAndUpdate(userId, {
      $pull: { wishlist: productId },
    });
    res.status(StatusCodes.OK).json({ msg: "Đã xóa khỏi danh sách yêu thích" });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.CONFLICT).json({ msg: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    const { wishlist } = await User.findById(userId).populate({
      path: "wishlist",
      select: [
        "name",
        "slug",
        "price",
        "salePrice",
        "description",
        "category",
        "images",
        "status",
      ],
    });
    res.status(StatusCodes.OK).json(wishlist);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.CONFLICT).json({ msg: error.message });
  }
};

export const addCoupon = async (req, res) => {
  try {
    const { userId } = req.user;
    let { code } = req.body;

    let user = await User.findById(userId);
    if (code) code = code.toString().toUpperCase();
    const validCoupon = await Coupon.findOne({ code: code });

    // check expired
    const now = new Date();
    if (validCoupon.endDate < now || validCoupon.startDate > now)
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "Mã giảm giá không hợp lệ" });

    // check rank
    const requiredRanks = ["member"];
    // Thêm các hạng khác nếu coupon yêu cầu
    if (user.rank.includes("silver")) {
      requiredRanks.push("silver");
    } else if (user.rank.includes("gold")) {
      requiredRanks.push("silver");
      requiredRanks.push("gold");
    } else if (user.rank.includes("diamond")) {
      requiredRanks.push("silver");
      requiredRanks.push("gold");
      requiredRanks.push("diamond");
    }
    if (!requiredRanks.includes(validCoupon.targetCustomers)) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "Bạn không đủ điều kiện" });
    }

    // check is used
    const isUse = await Order.findOne({
      user: userId,
      couponCode: validCoupon.code,
    });
    if (isUse)
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "Mã giảm giá đã được sử dụng" });

    // check is already have
    const alreadyHave = user.coupon?.find(
      (item) => item.toString() === validCoupon._id.toString()
    );
    if (alreadyHave) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "Bạn đã lưu mã giảm giá này rồi" });
    }

    // check number of use
    if (validCoupon.numberOfUses <= 0)
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "Mã giảm giá đã hết lượt sử dụng" });

    user = await User.findByIdAndUpdate(
      userId,
      {
        $push: { coupon: validCoupon._id },
      },
      { new: true }
    );

    res.status(StatusCodes.OK).json({ msg: "Add successfully" });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.CONFLICT).json({ msg: error.message });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const { userId } = req.user;

    let user = await User.findById(userId).populate({
      path: "coupon",
      select: ["-numberOfUses", "-promotionId"],
    });

    // check expired
    const expiredCoupons = user.coupon.filter(
      (item) => item.endDate < Date.now() && item._id
    );

    // check is used
    if (user.coupon.length > 0) {
      const couponCodes = user.coupon.map((i) => i.code);
      const orders = await Order.find({
        user: userId,
        couponCode: { $in: couponCodes },
      });

      const filteredCoupons = user.coupon.filter((coupon) =>
        orders.some((order) => order.couponCode === coupon.code)
      );
      filteredCoupons.forEach((i) => expiredCoupons.push(i._id));
    }

    // remove
    if (expiredCoupons.length > 0) {
      user = await User.findByIdAndUpdate(
        userId,
        {
          $pull: { coupon: { $in: expiredCoupons } },
        },
        { new: true }
      ).populate({
        path: "coupon",
        select: ["-numberOfUses", "-promotionId"],
      });
    }

    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.CONFLICT).json({ msg: error.message });
  }
};
