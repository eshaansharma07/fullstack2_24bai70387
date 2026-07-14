import mongoose from 'mongoose';

// Define the schema representing our posts in MongoDB
const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled Post'
  },
  content: {
    type: String,
    required: true
  },
  mediaCount: {
    type: Number,
    default: 0
  },
  mediaUrls: {
    type: [String],
    default: []
  },
  platforms: {
    type: [String],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compile schema into model. Reuse it across serverless hot reloads.
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

let connectionPromise = null;

// Connection helper
export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });
  }

  try {
    await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }

  console.log('Successfully connected to MongoDB Atlas Cloud database.');
  return mongoose.connection;
}

// Read records
export async function getPosts() {
  try {
    await connectDb();
    return await Post.find().sort({ createdAt: -1 });
  } catch (error) {
    console.error('MongoDB read error:', error);
    throw error;
  }
}

// Write record
export async function savePost(postData) {
  try {
    await connectDb();
    const newPost = new Post(postData);
    return await newPost.save();
  } catch (error) {
    console.error('MongoDB write error:', error);
    throw error;
  }
}
