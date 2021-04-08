const client = require('./client');
const { getUserById } = require('./users');

async function getOrderById(id){
    try {
        const {rows: [order]} = await client.query(`
            SELECT * 
            FROM orders
            WHERE id=$1;
        `, [id])
 
        return order;
    } catch (error) {
        throw error
    }
}

// GET ALL ORDERS
const reduceOrders = (orderProductPairs) => {
    const completeOrders = orderProductPairs.reduce((orderAccumulator, order) => {
        const {
            id,
            status,
            userId,
            datePlaced,
            productId,
            price,
            quantity,
            productName,
            description,
            imageURL,
            buyerName,
        } = routine;

        const product = {
            id: productId,
            name: productName,
            description,
            imageURL,
            price,
            quantity,
        };
        if (!orderAccumulator[id]) {
            orderAccumulator[id] = {
                id,
                status,
                buyerId: userId,
                buyerName: buyerName,
                datePlaced,
                products: productId ? [product] : [],
            };
        } else {
            if (productId) {
                orderAccumulator[id].products.push(product);
            }
        };
        return orderAccumulator;
    }, {});
    return Object.values(completeRoutines);
};

const getAllOrders = async () => {
    try {
        const {rows: orders} = await client.query(`
            SELECT orders.id, orders.status, orders."userId", orders."datePlaced",
            order_products."productId", order_products."orderId", order_products.price, order_products.quantity, 
            products.name AS "productName", products.description, products."imageURL",
            users.username AS "buyerName"
            FROM orders
            LEFT JOIN order_products ON order_products."orderId" = orders.id
            LEFT JOIN products ON products.id = order_products."productId"
            LEFT JOIN users ON users.id = orders."userId";
        `);

        const completeOrders = reduceOrders(orders);
        return completeOrders;

    } catch (error) {
        throw Error(`Error while getting all orders: ${error}`);
    };
};

async function getOrdersByUser({id}){
    try {
        const {rows: orders} = await client.query(`
            SELECT orders.*
            FROM orders
            JOIN users ON orders."userId" = users.id
            WHERE "userId"=$1
        `, [id]);
        return orders;

    } catch (error) {
        throw error;
    }
}

async function getOrdersByProduct({id}) {
    try {
        const {rows: orders} = await client.query(`
            SELECT *
            FROM orders
            JOIN order_products ON order_products."orderId" = orders.id
            WHERE order_products."productId" = $1;
        `, [id])
    } catch (error) {
        throw error
    }
}

async function getCartByUser({id}){
    try {
        const {rows: orders} = await client.query(`
            SELECT orders.*, users.id AS "creatorName"
            FROM orders
            JOIN users ON orders."userId" = users.id
            WHERE "creatorId" = $1
            AND 'created' = true;
        `, [id])
        return orders
    } catch (error) {
        throw error
    };
};

async function createOrder({status, userId}){
    try {
        const {rows: [order]} = await client.query(`
            INSERT INTO orders (status, "userId")
            VALUES($1, $2)
            RETURNING *;
        `, [status, userId]);

        return order
    } catch (error) {
        throw error
    };
};

// UPDATE ORDER
const updateOrder = async ({ id, status, userId }) => {
    const updateFields = {};

    if (status) {
        updateFields.status = status;
    };

    if (userId) {
        updateFields.userId = userId;
    };

    const setString = Object.keys(updateFields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    };

    try {
        const { rows: [updatedOrder] } = await client.query(`
            UPDATE orders
            SET ${setString}
            WHERE id=${id}
            RETURNING *;
        `, Object.values(updateFields));

        return updatedOrder;
    } catch(error) {
        throw error;
    };
};

// COMPLETE ORDER
const completeOrder = async ({ id }) => {
    try {
        const { rows: [order] } = await client.query(`
            UPDATE orders
            SET "status"="completed"
            WHERE id=$1
            RETURNING *;
        `, [id]);

        return order;
    } catch(error) {
        throw error;
    };
};
// CANCEL ORDER
const cancelOrder = async (id) => {
    try {
        const { rows: [order] } = await client.query(`
            UPDATE orders
            SET "status"="cancelled"
            WHERE id=$1
            RETURNING *;
        `, [id]);

        return order;
    } catch(error) {
        throw error;
    };
};

module.exports = {
    getOrderById,
    getAllOrders,
    getOrdersByUser,
    getOrdersByProduct,
    getCartByUser,
    createOrder,
    updateOrder,
    completeOrder,
    cancelOrder,
}