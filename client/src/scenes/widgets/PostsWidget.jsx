import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import PostWidget from "./PostWidget";
import api from "./../../axiosInstance"; // Adjust the import path as necessary

const PostsWidget = ({ userId, isProfile = false }) => {
  console.log("isBrowser?", typeof window !== "undefined");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  console.log('user in posts widget is ', user);
  console.log('value of isProfile in posts widget is ', isProfile);
  const posts = useSelector((state) => state.posts);
  console.log('posts from state in posts widget is ', posts);
  const getPosts = async () => {
  try {
    const response = await api.get("/posts");
    if(!response || response.status !== 200) {
      console.error("Failed to fetch posts, status code:", response ? response.status : "No response");
      return;
    }
    const data = response.data; // ✅ axios stores data here
    if(!data || !data.posts) {
      console.log("No posts data received");
      return;
    }
    console.log("data in posts is", data);
    dispatch(setPosts({ posts: data.posts }));
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

const getUserPosts = async () => {
  try {
    const response = await api.get(`/posts/${userId}/posts`);
    const data = response.data; // ✅ axios stores data here
    dispatch(setPosts({ posts: data }));
  } catch (error) {
    console.error("Error fetching user posts:", error);
  }
};
useEffect(() => {
  console.log("useEffect fired 🚀");
}, []);

useEffect(() => {
  console.log("isProfile is", isProfile);
  if (isProfile) {
    console.log("calling getUserPosts()");
    getUserPosts();
  } else {
    console.log("calling getPosts()");
    getPosts();
  }
}, []);
  console.log('posts in posts widget is ', posts);
return (
  <>
    {(Array.isArray(posts) ? posts : []).map(({
      _id,
      userId: postuserId,
      firstName,
      lastName,
      description,
      location,
      picturePath,
      userPicturePath,
      likes,
      comments,
    }) => (
      <PostWidget
        key={_id}
        postId={_id}
        postUserId={postuserId}
        name={`${firstName} ${lastName}`}
        description={description}
        location={location}
        picturePath={picturePath}
        userPicturePath={userPicturePath}
        likes={likes}
        comments={comments}
        getPosts={getPosts}
        getUserPosts={getUserPosts}
      />
    ))}
  </>
);

};
export default PostsWidget;