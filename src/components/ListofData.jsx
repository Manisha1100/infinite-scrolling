import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Loader from "./Loader";

const ListofData = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);

  const fetchUsers = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `https://dummyjson.com/users?limit=10&skip=${(page - 1) * 10}`
      );

      setUsers((prevUsers) => [...prevUsers, ...response.data.users]);
      setPage((prevPage) => prevPage + 1);

      if (response.data.users.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchUsers();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [fetchUsers, hasMore, loading]
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>Infinite Scroll - Users</h2>
      <div style={styles.userGrid}>
        {users.map((user, index) => (
          <div
            key={user.id}
            ref={index === users.length - 1 ? lastElementRef : null}
            className="userCard"
          >
            <img
              src={user.image || "https://via.placeholder.com/128"}
              alt={user.firstName}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/128";
              }}
              className="userImage"
            />
            <h3>{user.firstName} {user.lastName}</h3>
            <p>{user.email}</p>
            <p>{user.phone}</p>
          </div>
        ))}
      </div>

      {loading && users.length === 0 && <Loader />}
      {loading && <Loader />}
      {!hasMore && <p>No more users available</p>}
    </div>
  );
};

const styles = {
  userGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "10px",
    paddingTop: "20px",
  },

};



export default ListofData;
