const express = require("express");
const { getAllorders, getOrdersById, addProductToOrder } = require("../db");

const ordersRouter = express.Router();
const { requireUser, requireAdmin } = require("./utils");
const {
  client,
  getAllOrders,
  updateOrder,
  getOrderById,
  getCartByUser,
} = require("../db");

ordersRouter.use((req, res, next) => {
  console.log("A request is being made to /orders...");
  next();
});

ordersRouter.get("/", requireAdmin, async (req, res, next) => {
  try {
    const orders = await getAllOrders();
    res.send(orders);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

ordersRouter.post('/:orderId/products', async (req, res, next) => {
    const {productId, price, quantity} = req.body;
    const {orderId} = req.params;

    if (!productId || !price || !quantity) {
      throw Error('Please fill out all required fields.');
    };

    try {        

        const _order = await getOrderById(orderId);
        if (!_order) {
          throw Error('That order does not exist.');
        };

        const productAdd = await addProductToOrder({
          orderId: Number(orderId),
          productId: productId,
          price: price,
          quantity: quantity
        });

        const order = await getOrderById(orderId);
        res.send(order);
        
        // orderId, productId, price, quantity
        // const thisOrderProduct = await getOrdersByProduct({id: orderId})
        // const currentCart = thisOrderProduct && thisOrderProduct.filter(order_products => order_products.productId === productId)

        // if (currentCart && currentCart.length) {
        //     res.send(currentCart+1)
        // } else {
        //     const addToCart = await addProductToOrder({productId, orderId});
        //     if (addToCart) {
        //         res.send(addToCart)
        //     } else {
        //         next({
        //             name: 'FailedToAddToCart',
        //             message: `There was an error adding ${productId} to ${orderId}`
        //         })
        //     }
        // }

        // if(!orderId){
        //     throw Error('Order does not exist')
        // };

    } catch ({name, message}) {
        next({name, message});
    }; 
});


ordersRouter.get("/cart", requireUser, async (req, res, next) => {
  const user = req.user;
  try {
    const cart = await getCartByUser(user);

    res.send(cart);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

ordersRouter.post("/", async (req, res, next) => {
  
  // This block handles guest orders vs user carts
  const fields = {};
  if (req.user) {
    fields.userId = req.user.id;
    fields.status = "created";
  } else if (!req.user) {
    fields.userId = 1;
    fields.status = "completed"
  };
  // 

  try {
    const order = await createOrder(fields);
    res.send(order);
  } catch ({ name, message }) {
    next({ name, message });
  }
});


// ordersRouter.patch('/:orderId', 
//     requireUser, 
//     requiredNotSent({requiredParams: ['id', 'userId']}), 
//     async (req, res, next)=>{
//         try {
//             const {orderId} = req.params;
//             const iExist = await getOrderById(orderId);
//             if(!iExist) {
//                 next({   
//                     name: 'iDontExist',
//                     message: `Order ${orderId} does not exist`
//                 })
//             } else {
//                 const {id, userId} = req.body;
//                 const updatedOrder = await updateOrder({id: orderId, id, userId})
//                 if(updatedOrder){
//                     res.send(updatedOrder)
//                 } else {
//                     next({
//                         name: 'FailedToUpdate',
//                         message: 'Your order could not be updated'
//                     })
//                 }
//             }
//         } catch (error) {
//             next(error)
//         }
// })

// ordersRouter.delete("/:orderId", requireUser, async(req, res, next)=>{
//     try {
//         const thisOrder = await getOrderById(req.params.orderId);

//         if (thisOrder && thisOrder.author.id === req.params.orderId) {
//             const 
//         } else {
//             thisOrder
//                 ? {
//                     name: "UnauthorizedUserError",
//                     message: "You cannot cancel an order that is not yours"
//                     }
//                 : {
//                     name: "NotFoundError",
//                     message: "You dun goofed, how did you even get here?"
//                 }
//         }

//     } catch ({name, message}) {
//         next({name, message});
//     }
// });


module.exports = ordersRouter;