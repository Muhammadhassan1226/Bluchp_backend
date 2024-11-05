import { Notification } from "./notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user;
    const notifications = await Notification.find({ to: userId })
      .populate({
        path: "from",
        select: "username profileImg",
      })
      .exec();

    await Notification.updateMany({ to: userId }, { $set: { read: true } });
    res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id: notificationId } = req.params;
    const userId = req.user;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    if (notification.to._id.toString() !== userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized to delete Notification" });
    }
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
