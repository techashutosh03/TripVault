import User from "../models/User.js";
import Trip from "../models/Trip.js";

// ============================================
// Get Public User Profile
// ============================================
export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username parameter is required",
      });
    }

    // Find the user by username (case-insensitive search)
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find all trips created by this user
    const trips = await Trip.find({ user: user._id }).sort({ startDate: -1 });

    // Format response to strictly expose required fields only
    const publicProfile = {
      name: user.fullName,
      username: user.username,
      bio: user.bio || "",
      profileImage: user.profileImage || "", // Provided for profile widget/avatar
      trips: trips.map((trip) => ({
        title: trip.title,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        rating: trip.rating,
        coverImage: trip.coverImage,
      })),
    };

    res.status(200).json({
      success: true,
      profile: publicProfile,
    });
  } catch (error) {
    console.error("Error in getPublicProfile:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================
// Update User Profile
// ============================================
export const updateProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    // Validate username format (only alphanumeric and underscore allowed, 3-20 chars)
    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    const processedUsername = username.trim().toLowerCase();
    
    if (!usernameRegex.test(processedUsername)) {
      return res.status(400).json({
        success: false,
        message: "Username must be 3-20 characters long and contain only lowercase letters, numbers, and underscores (_).",
      });
    }

    // Check if username is already taken by another user
    const usernameExists = await User.findOne({ username: processedUsername });
    if (usernameExists && usernameExists._id.toString() !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken by another user",
      });
    }

    // Update the user details
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        username: processedUsername,
        bio: bio !== undefined ? bio.trim() : "",
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        username: updatedUser.username,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
