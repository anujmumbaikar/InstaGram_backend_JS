### Instagram Backend Clone

Welcome to the **Instagram Backend Clone**, a project that replicates the core backend functionalities of Instagram. It includes features such as user authentication, content posting, social interactions (likes, comments, followers), and optimized data handling using MongoDB aggregation pipelines.

---

### 🚀 Features

#### 🔒 **Authentication**
1. **JWT-based Login**: Secure user authentication with access and refresh tokens.
2. **Password Encryption**: Passwords are hashed using **bcrypt** for enhanced security.

#### 📤 **Content Posting**
1. Users can upload posts and reels.
2. **Cloudinary Integration**: Efficient image and video storage for avatars and posts.

#### 👥 **Social Features**
1. Follow/unfollow users.
2. View followers and following lists.

#### ❤️ **Interactions**
1. Like posts.
2. Comment on posts.

#### 🛠️ **Optimizations**
1. **Mongoose Aggregation Pipelines**: Efficient data handling for complex queries.
2. Scalable architecture to handle large datasets.

#### 🛡️ **Security Measures**
1. Password hashing with bcrypt.
2. JWT-based authentication with short-lived access tokens and long-lived refresh tokens.
3. Secure cookies for storing tokens (`httpOnly`, `secure`).

---

### Why Separate Models for Followers/Likes?

Storing millions of followers or likes in a single model is inefficient due to:

#### **Scalability Issues**
- MongoDB has a **16MB document size limit**, which can be exceeded when storing large arrays of followers or likes in a single document.
- Large documents are harder to manage and query efficiently.

#### **Performance Bottlenecks**
- Operations like adding, removing, or querying individual followers/likes require scanning and modifying the entire array.
- As the array grows, these operations become slower, impacting performance.

#### **Memory and Indexing Constraints**
- Large arrays consume significant memory during queries or updates.
- Indexing arrays is inefficient since MongoDB creates an index entry for each array element, bloating index size and slowing down queries.

#### **Concurrency Problems**
- Simultaneous interactions (e.g., users liking a post) create contention for updates on the same document, leading to potential write conflicts.

#### **Data Redundancy**
- Storing all followers or likes in one place can lead to duplication and inefficiency when fetching related data (e.g., mutual followers).

---

### Solution: Separate Models

Using separate collections for followers/likes ensures better scalability, performance, and maintainability:

#### Example Schema Design:
1. **Users Collection**:
   ```json
   {
       "_id": "userId",
       "username": "exampleUser",
       "avatar": "avatarUrl"
   }
   ```

2. **Followers Collection**:
   ```json
   {
       "_id": "followerId",
       "userFollowing": "userId",  // The user being followed
       "userFollower": "followerId"  // The follower
   }
   ```

3. **Likes Collection**:
   ```json
   {
       "_id": "likeId",
       "post": "postId",  // The post being liked
       "user": "userId"   // The user who liked the post
   }
   ```

---

### Benefits of Separate Models

1. **Improved Performance**:
   - Queries fetch relevant documents without processing massive arrays.
   
2. **Scalability**:
   - Collections grow independently without hitting MongoDB's document size limits.

3. **Efficient Indexing**:
   - Indexes on fields like `userFollowing` or `post` speed up lookups.

4. **Concurrency Handling**:
   - Each interaction affects only small documents in separate collections, reducing contention.

5. **Flexibility**:
   - Aggregation pipelines dynamically join collections to fetch combined data (e.g., follower details).

---

### MongoDB Aggregation Pipeline Explained

MongoDB's aggregation pipeline processes data in stages:

1. **$match**: Filters documents based on criteria (e.g., `postId`, `username`).
2. **$lookup**: Performs joins between collections (e.g., linking posts to likes or comments).
3. **$addFields**: Adds computed fields (e.g., `likesCount`, `commentsCount`, liked/commented users).
4. **$project**: Selects specific fields to return in the final result.

#### Example Query: Fetching Post Details
```javascript
Post.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(postId) } },
    { $lookup: { from: "likes", localField: "_id", foreignField: "post", as: "likes" } },
    { $lookup: { from: "comments", localField: "_id", foreignField: "post", as: "comments" } },
    { $addFields: { likesCount: { $size: "$likes" }, commentsCount: { $size: "$comments" } } },
    { $project: { content: 1, caption: 1, likesCount: 1, commentsCount: 1 } }
]);
```

This query efficiently retrieves post details along with associated likes and comments without storing them directly in the post document.

---

### Installation & Setup

1. Clone the repository:
   ```bash
   git clone 
   cd instagram-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with keys like:
   ```
   MONGO_URI=
   JWT_SECRET=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   CLOUDINARY_CLOUD_NAME=
   ```

4. Start the server:
   ```bash
   npm start
   ```

---

### API Routes

#### User Routes
| Method | Endpoint                     | Description                     |
|--------|-------------------------------|---------------------------------|
| POST   | `/register`                  | Register a new user            |
| POST   | `/login`                     | Login an existing user         |
| POST   | `/logout`                    | Logout a logged-in user        |
| PUT    | `/edit-user-profile`         | Update user profile            |
| GET    | `/user-profile-information/:username` | Fetch user profile info |

#### Post Routes
| Method | Endpoint                     | Description                     |
|--------|-------------------------------|---------------------------------|
| POST   | `/upload-post`               | Upload a new post              |
| POST   | `/delete-post/:postId`       | Delete a post                  |
| GET    | `/get-post/:postId`          | Get post details by ID         |
| GET    | `/get-user-posts/:username`  | Get posts by a specific user   |
| GET    | `/explore`                   | Fetch all posts                |

#### Social Routes
| Method | Endpoint                     | Description                     |
|--------|-------------------------------|---------------------------------|
| POST   | `/follow-user/:username`     | Follow a user                  |
| POST   | `/unfollow-user/:username`   | Unfollow a user                |
| POST   | `/get-post/:postId/like`     | Like a post                    |
| POST   | `/get-post/:postId/unlike`   | Unlike a post                  |

---

This backend is designed for scalability, security, and efficient handling of large datasets while providing Instagram-like functionality!