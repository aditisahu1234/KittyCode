const mongoose = require('mongoose');
const argon2 = require('argon2');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  publicKey: {
    type: String,  // Store as base64 string
  }
});

// Hash password before saving using Argon2
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const hashingOptions = {
      memoryCost: 2 ** 15,
      timeCost: 3,
      parallelism: 1,
      hashLength: 32,
      type: argon2.argon2id
    };

    const hashedPassword = await argon2.hash(this.password, hashingOptions);
    
    // Log the hashed password
    console.log('------- Argon2 Hash Details -------');
    console.log('User Email:', this.email);
    console.log('Hashed Password:', hashedPassword);
    console.log('Hash Length:', hashedPassword.length);
    console.log('Hash Format Breakdown:');
    console.log('- Algorithm & Version:', hashedPassword.split('$')[1]);
    console.log('- Parameters:', hashedPassword.split('$')[2]);
    console.log('- Salt + Hash:', hashedPassword.split('$')[3]);
    console.log('--------------------------------');

    this.password = hashedPassword;
    next();
  } catch (error) {
    console.error('Error during password hashing:', error);
    next(error);
  }
});

// Method to verify password using Argon2
UserSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    const isMatch = await argon2.verify(this.password, enteredPassword);
    console.log('------- Password Verification -------');
    console.log('User Email:', this.email);
    console.log('Verification Result:', isMatch);
    console.log('----------------------------------');
    return isMatch;
  } catch (error) {
    console.error('Password verification failed:', error);
    throw new Error('Password verification failed');
  }
};

const User = mongoose.model('User', UserSchema);

module.exports = User;