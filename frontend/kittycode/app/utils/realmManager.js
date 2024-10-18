import Realm from 'realm';

// Define schema for friends and messages
const FriendSchema = {
  name: 'Friend',
  properties: {
    _id: 'string',
    name: 'string',
    userId: 'string',  // Add this line
    status: 'string',
    roomId: 'string?', // Add roomId as an optional string
  },
  primaryKey: '_id',
};

const MessageSchema = {
  name: 'Message',
  properties: {
    _id: 'string',
    userId: 'string',  // Add this line
    roomId: 'string',
    senderId: 'string',
    text: 'string?',
    file: 'string?',
    fileName: 'string?',
    fileType: 'string?',
    timestamp: 'date',
    isSender: 'bool',
    type: 'string?',
  },
  primaryKey: '_id',
};

// Initialize Realm instance as null
let realmInstance = null;

const openRealm = async () => {
  if (realmInstance) {
    return realmInstance;  // Return existing instance if already open
  }
  realmInstance = await Realm.open({
    schema: [FriendSchema, MessageSchema],
  });
  return realmInstance;
};

const closeRealm = () => {
  if (realmInstance && !realmInstance.isClosed) {
    realmInstance.close();
    realmInstance = null;
  }
};

export { openRealm, closeRealm };
