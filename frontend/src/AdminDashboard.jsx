import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { toast, ToastContainer } from 'react-toastify';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ users: 0, orders: 0, products: 0 });
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({ src: "", name: "", price: "", category: "", stock: "" });
  const [searchProduct, setSearchProduct] = useState("");
  const [productCount, setProductCount] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [orderctCount, setOrderCount] = useState(null);
  const [arrivalDate, setArrivalDate] = useState("");  
  const serverPort = import.meta.env.VITE_SERVER_PORT;

  // Fetch sample data
  useEffect(() => {
    const UserData = JSON.parse(localStorage.getItem('userData'));
    if (!UserData || UserData?.isAdmin === undefined) navigate('/');

    const fetchData = async () => {
      try {
        const res = await axios.get(serverPort + "api/product/display-product-data");
        setProducts(res.data.data);
        setProductCount(res.data.data.length);
      } catch (err) {
        toast.error("Unable to load products!");
      }
    }
    fetchData();

    const fetchUserData = async () => {
      try {
        const res = await axios.get(serverPort + "api/user/list-users");
        setUsers(res.data);
        setUserCount(res.data.length);
      } catch (error) {
        toast.error("Unable to load users!");
      }
    }

    fetchUserData();

    const fetchOrderData = async () => {
      try {
        const res = await axios.get(serverPort + "api/order/display-order-data");
        setOrders(res.data.data);
        setOrderCount(res.data.data.length);
      } catch (error) {
        console.log(error);
      }
    }
    fetchOrderData();
  }, []);

  const InsertProduct = async (data) => {
    try {
      const res = await axios.post("http://localhost:8080/api/product/insert-product-data", data);
      toast.success("Product inserted successfully!");
    } catch (error) {
      toast.error("Unable to insert product!");
    }
  }

  // Add a new product
  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price) {
      const newProductEntry = {
        _id: `p${products.length + 1}`,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        previousPrice: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),       };
      InsertProduct(newProduct);
      setProducts((prev) => [...prev, newProductEntry]);
      setCounts((prev) => ({ ...prev, products: prev.products + 1 }));
      setNewProduct({ name: "", price: "", src: "", category: "", stock: "" });
    }
  };

  // Delete a product
  const handleDeleteProduct = async (id) => {
    setProducts((prev) => prev.filter((product) => product._id !== id));
    try {
      await axios.delete(serverPort + `api/product/delete-product/${id}`);
      toast.success("Product deleted successfully!");
    } catch (error) {
      toast.error("Unable to delete product!");
    }
    setCounts((prev) => ({ ...prev, products: prev.products - 1 }));
  };

  // Edit a product
  const handleEditProduct = (id) => {
    const productToEdit = products.find((product) => product._id === id);
    setNewProduct({
      name: productToEdit.name,
      price: productToEdit.price,
      category: productToEdit.category,
      src: productToEdit.src,
      stock: productToEdit.stock,
    });
    console.log(id);
    setProductToEditId(id);
  };

  const handleSaveProduct = async () => {
    const updatedProducts = products.map((product) => {
      if (product._id === productToEditId) {
        const updatedProduct = {
          ...product,
          name: newProduct.name,
          price: newProduct.price,
          previousPrice: product.price,           
          category: newProduct.category,
          src: newProduct.src,
          stock: newProduct.stock,
        };
        return updatedProduct;
      }
      return product;
    });
    setProducts(updatedProducts);

    try {
      await axios.put(serverPort + `api/product/update-product/${productToEditId}`, {
        name: newProduct.name,
        price: newProduct.price,
        previousPrice: newProduct.previousPrice,
        category: newProduct.category,
        src: newProduct.src,
        stock: newProduct.stock,
      });
      toast.success("Product updated successfully!");
    } catch (error) {
      toast.error("Unable to update product!");
    }

   
    setNewProduct({ name: "", price: "", src: "", category: "" });
    setProductToEditId(null);
  };

 
  const [productToEditId, setProductToEditId] = useState(null);

  
  const handleArrivalDateChange = async (orderId) => {
    try {
      await axios.put(serverPort + `api/order/update-arrival-date/${orderId}`, {
        arrivalDate: arrivalDate,
      });
      toast.success("Arrival Date updated successfully!");
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, arrivalDate: arrivalDate } : order
        )
      );
      setArrivalDate(""); // Clear the input field
    } catch (error) {
      toast.error("Unable to update arrival date!");
    }
  };

  
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="dashboard-container">
    <div className="admin-navigation">
      <button onClick={()=>navigate("/main/home")}>Go to Home</button>
      <button onClick={()=>{
        localStorage.clear();
        navigate("/");
      }}>Log Out</button>
    </div>
      <h1>Admin Dashboard</h1>

      {/* Stats Section */}
      <div className="stats-container">
        <div className="stat-card">
          <h2>Total Users</h2>
          <p>{userCount}</p>
        </div>
        <div className="stat-card">
          <h2>Total Orders</h2>
          <p>{orderctCount}</p>
        </div>
        <div className="stat-card">
          <h2>Total Products</h2>
          <p>{productCount}</p>
        </div>
      </div>

      {/* Add Product Section */}
      <div className="section">
        <h2>{productToEditId ? "Edit Product" : "Add New Product"}</h2>
        <div className="form-container">
          <input
            type="text"
            placeholder="Product Src"
            value={newProduct.src}
            onChange={(e) => setNewProduct({ ...newProduct, src: e.target.value })}
          />
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Product Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <input
            type="number"
            placeholder="Product Stock"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
          />
          <input
            type="text"
            placeholder="Product Category"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          />
          <button onClick={productToEditId ? handleSaveProduct : handleAddProduct}>
            {productToEditId ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>

      {/* Product Management Section */}
      <div className="section">
        <h2>Manage Products</h2>
        <input
          type="text"
          placeholder="Search Products"
          className="search-bar"
          value={searchProduct}
          onChange={(e) => setSearchProduct(e.target.value)}
        />
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Previous Price</th>
                <th>Current Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>${product.previousPrice}</td>
                  <td>${product.price}</td>
                  <td>{product.stock}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditProduct(product._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="no-data">
                    No Products Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Section */}
      <div className="section">
        <h2>Manage Users</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      
      {/* Order Management Section */}
<div className="section">
  <h2>Manage Orders</h2>
  <div className="table-container">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>User</th>
          <th>Address</th>
          <th>Product Names</th> 
          <th>Total</th>
          <th>Arrival Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order._id}>
            <td>{order._id}</td>
            <td>{order.username}</td>
            <td>{order.address}</td>
            <td>{order.products || "No Products"}</td> 
            <td>₹{order.amount}</td>
            <td>
              {order.arrivalDate === "Processing..." ? (
                <input
                  type="date"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                />
              ) : (
                
                <span>{
                  <input
                  type="date"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                />
                
                }{<p>{order.arrivalDate}</p>}
                </span>
                
              )}
            </td>
            <td>
            <button
                  className="edit-btn"
                  onClick={() => handleArrivalDateChange(order._id)}
                >
              {order.arrivalDate === "Processing..." ? (

                  "Save Date"
                
              ):("Edit Date")}</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


      <ToastContainer />
    </div>
  );
}
