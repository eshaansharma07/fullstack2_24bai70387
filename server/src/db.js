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

// Compile schema into model
const Post = mongoose.model('Post', PostSchema);

// Connection helper
export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI is not defined in env variables.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('Successfully connected to MongoDB Atlas Cloud database.');
  } catch (error) {
    console.error('MongoDB Atlas Connection Error:', error);
  }
}

// Read records
export async function getPosts() {
  try {
    return await Post.find().sort({ createdAt: -1 });
  } catch (error) {
    console.error('MongoDB read error:', error);
    return [];
  }
}

// Write record
export async function savePost(postData) {
  try {
    const newPost = new Post(postData);
    return await newPost.save();
  } catch (error) {
    console.error('MongoDB write error:', error);
    throw error;
  }
}
