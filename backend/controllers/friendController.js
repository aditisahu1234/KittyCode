const User = require('../models/userModel');
const FriendRequest = require('../models/friendRequestModel');

// Send Friend Request
exports.sendFriendRequest = async (req, res) => {
  try {
    const { toUsername } = req.body;
    const fromUser = req.user; // Assumes the user is authenticated
    const toUser = await User.findOne({ name: toUsername });

    if (!toUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    if (fromUser.friends.includes(toUser._id)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if a request has already been sent
    const existingRequest = await FriendRequest.findOne({
      from: fromUser._id,
      to: toUser._id,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Create a new friend request
    const friendRequest = new FriendRequest({
      from: fromUser._id,
      to: toUser._id,
    });
    await friendRequest.save();

    res.status(200).json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Accept Friend Request
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest || friendRequest.status !== 'pending') {
      return res.status(404).json({ message: 'Request not found or already processed' });
    }

    // Update status and add friends
    friendRequest.status = 'accepted';
    await friendRequest.save();

    const fromUser = await User.findById(friendRequest.from);
    const toUser = await User.findById(friendRequest.to);

    fromUser.friends.push(toUser._id);
    toUser.friends.push(fromUser._id);

    await fromUser.save();
    await toUser.save();

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Reject Friend Request
exports.rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest || friendRequest.status !== 'pending') {
      return res.status(404).json({ message: 'Request not found or already processed' });
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.status(200).json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get Notifications (Pending Friend Requests)
exports.getFriendRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({ to: req.user._id, status: 'pending' })
      .populate('from', 'name');

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get Friends List
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name');
    res.status(200).json({ friends: user.friends });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
