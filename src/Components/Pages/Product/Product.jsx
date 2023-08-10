import React, { useState, useEffect } from "react";
import "./product.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faL } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { pink } from "@mui/material/colors";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(15);
  const location = useLocation();
  const [loginChek, setLoginChek] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/user", {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      setLoginChek(true);
    } catch (error) {
      setLoginChek(false);
      console.error(error);
    }
  };

  useEffect(() => {
    axios
      .all([
        axios.get("http://localhost:5000/api/categories"),
        axios.get("http://localhost:5000/api/products"),
      ])
      .then(
        axios.spread((categoriesResponse, productsResponse) => {
          setCategories(categoriesResponse.data);
          setProducts(productsResponse.data);
          setLoading(false);
        })
      )
      .catch((error) => {
        console.error("Error fetching categories and products:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get("category");
    setSelectedCategory(category || "");
  }, [location.search]);

  const handleCategoryChange = (event) => {
    setLoading(true);

    setTimeout(() => {
      setSelectedCategory(event.target.value);
      setCurrentPage(1);
      setLoading(false);
    },150);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };
  const handleCloseModal2 = () => {
    setShowLoginModal(false);
    window.location.href = "/login";
  };

  const addToCart = (productId) => {
    if (loginChek === false) {
      setShowLoginModal(true);
    } else {
      axios
        .post(
          "http://localhost:5000/api/cart/add",
          {
            productId: productId,
            quantity: 1,
          },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          console.log(response.data);
          toast.success("Item Added to cart", {
            autoClose: 2000,
            position: "bottom-right",
          });
        })
        .catch((error) => console.log(error));
    }
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const paginate = (pageNumber) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentPage(pageNumber);
      setLoading(false);
    }, 150);
  };

  return (
    <>
      <Dialog
        open={showLoginModal}
        onClose={handleCloseModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"To add a product to the shopping cart, you must log in."}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Proceed to login?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Not yet
          </Button>
          <Button
            onClick={() => {
              handleCloseModal2();
            }}
            color="primary"
            autoFocus
          >
            Yes, proceed
          </Button>
        </DialogActions>
      </Dialog>
      {loading ? (
        <div className="page-loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="categories">
            <div
              className={`category ${selectedCategory === "" ? "active" : ""}`}
              onClick={() => handleCategoryChange({ target: { value: "" } })}
            >
              All Categories
            </div>
            {categories.map((category) => (
              <div
                key={category._id}
                className={`category ${
                  selectedCategory === category._id ? "active" : ""
                }`}
                onClick={() =>
                  handleCategoryChange({ target: { value: category._id } })
                }
              >
                {category.title}
              </div>
            ))}
          </div>

          <div className="grid">
            {currentProducts.map((product, index) => (
              <div className="grid-item" key={index}>
                <Link to={`/product/${product._id}`} className="product-link">
                  <div style={{ padding: "1rem" }}>
                    <img
                      src={product.imagePath}
                      alt={product.title}
                      className="item-image"
                    />
                    <h3 className="item-title">{product.title}</h3>
                    <p className="item-prices">
                      {product.discountprice !== 0
                        ? `₹ ${product.price}`
                        : `₹ ${product.price}`}
                    </p>
                    <p className="item-dcprices">
                      {product.discountprice !== 0
                        ? `₹ ${product.discountprice}`
                        : ""}
                    </p>
                    <h4
                      style={{ color: product.quantity > 0 ? "green" : "red" }}
                    >
                      {product.quantity > 0 ? "In Stock" : "Out of Stock"}
                    </h4>
                  </div>
                </Link>
                <div style={{ paddingBottom: "1rem" }}>
                  <button
                    className={
                      product.quantity > 0
                        ? "item-add-to-cart"
                        : "item-out-of-stock"
                    }
                    disabled={!product.quantity}
                    onClick={() => addToCart(product._id)}
                    style={{
                      backgroundColor: product.quantity ? "" : "#a6a6a6",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCartPlus}
                      style={{ fontSize: "23px", paddingLeft: "0rem" }}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="pagination">
            {Array.from(
              Array(Math.ceil(filteredProducts.length / productsPerPage)),
              (item, index) => (
                <Button
                  color="secondary"
                  variant="outlined"
                  key={index}
                  sx={{ fontWeight: "bold", marginRight: "1rem" }}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </Button>
              )
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Product;
