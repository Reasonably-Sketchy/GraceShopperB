const express = require("express");
const productsRouter = express.Router();
const { requireUser } = require("./utils");
const { client, updatePost, getPostById } = require("../db");
client.connect();

// const {} = require('../db');

productsRouter.use((req, res, next) => {
  console.log("A request is being made to /products");
  next();
});

const { getAllProducts } = require("../db");

productsRouter.delete("/:postId", requireUser, async (req, res, next) => {
  try {
    const post = await getProductById(req.params.postId);

    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });

      res.send({ post: updatedPost });
    } else {
      // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
      next(
        post
          ? {
              name: "UnauthorizedUserError",
              message: "You cannot delete a post which is not yours",
            }
          : {
              name: "ProductNotFoundError",
              message: "That product does not exist",
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

productsRouter.get("/", async (req, res) => {
  try {
    const allProducts = await getAllProducts();

    const products = allProducts.filter((product) => {
      return product.active;
      //   || (req.user && post.author.id === req.user.id)
    });

    res.send({
      products,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = productsRouter;
