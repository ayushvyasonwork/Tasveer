import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import PostWidget from "./PostWidget";
import api from "./../../axiosInstance"; // Adjust the import path as necessary

const PostsWidget = ({ userId, isProfile = false }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  console.log('user in posts widget is ', user);
  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);

  const getPosts = async () => {
  try {
    const response = await api.get("/posts");
    const data = response.data; // ✅ axios stores data here
    console.log("data in posts is", data);
    dispatch(setPosts({ posts: data }));
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
    if (isProfile) {
      getUserPosts();
    } else {
      getPosts();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  console.log('posts in posts widget is ', posts);
  return (
    <>
      {posts.map(
        ({
          _id,
          userId:postuserId,
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
          />
        )
      )}
    </>
  );
};

export default PostsWidget;
