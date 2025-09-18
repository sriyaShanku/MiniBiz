// backend/controllers/orderController.js

// ... other requires ...
const pool = require('../config/db');

exports.createOrderFromCart = async (req, res) => {
    const customerId = req.user.id;
    const { cartItems, shippingAddress } = req.body; // Assume cartItems are sent from client

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let totalAmount = 0;
        let primarySellerId = null; // You might need to determine this if cart can have items from multiple sellers

        // Temporary: For simplicity, assume all items from one seller or handle this logic
        if (cartItems.length > 0) {
             const [productInfo] = await connection.query('SELECT seller_id FROM products WHERE id = ?', [cartItems[0].id]);
             if (productInfo.length > 0) {
                primarySellerId = productInfo[0].seller_id;
             } else {
                throw new Error('Could not determine seller for the order.');
             }
        }


        // Create the order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (customer_id, seller_id, total_amount, status, shipping_address) VALUES (?, ?, ?, ?, ?)',
            [customerId, primarySellerId, 0, 'pending_seller_confirmation', JSON.stringify(shippingAddress)] // Total amount will be calculated next
        );
        const orderId = orderResult.insertId;

        // Add order items and calculate total amount
        for (const item of cartItems) {
            // IMPORTANT: Fetch current price from DB, do not trust client-side price
            const [productRows] = await connection.query('SELECT price, seller_id FROM products WHERE id = ?', [item.id]);
            if (productRows.length === 0) {
                throw new Error(`Product with ID ${item.id} not found.`);
            }
            const productPrice = productRows[0].price;
            const itemSellerId = productRows[0].seller_id;

            // If supporting multi-seller carts, this gets more complex.
            // For now, we've assumed primarySellerId above or need to adjust.


            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, item.id, item.quantity, productPrice]
            );
            totalAmount += productPrice * item.quantity;
        }

        // Update order with correct total_amount
        await connection.query('UPDATE orders SET total_amount = ? WHERE id = ?', [totalAmount, orderId]);

        await connection.commit();

        // Clear client-side cart (client should do this on success)
        // Notify seller (e.g., via dashboard notification or email - implement later)

        res.status(201).json({
            success: true,
            message: 'Order placed successfully! The seller will contact you for payment and delivery.',
            orderId: orderId
        });

    } catch (err) {
        await connection.rollback();
        console.error("Error creating order:", err);
        res.status(500).json({ success: false, message: 'Failed to place order.' });
    } finally {
        connection.release();
    }
};

// ... getSellerOrders, getOrderDetails etc.

// Add to backend/controllers/orderController.js

// Seller views their orders
exports.getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const [orders] = await pool.query(
            `SELECT o.id, o.order_date, o.total_amount, o.status,
                    u.full_name as customer_name
             FROM orders o
             JOIN users u ON o.customer_id = u.id
             WHERE o.seller_id = ? ORDER BY o.order_date DESC`,
            [sellerId]
        );
        res.render('dashboard/orders-management', { // Create this EJS view
            title: 'Manage Orders - Dashboard',
            orders: orders
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Could not load orders.');
        res.redirect('/dashboard');
    }
};

// Get details for a specific order (can be used by both customer and seller if permissions are checked)
exports.getOrderDetailsPage = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const [orderRows] = await pool.query(
            `SELECT o.*, cust.full_name as customer_name, cust.email as customer_email,
                    sell_prof.business_name as seller_business_name, sell.full_name as seller_contact_name
             FROM orders o
             JOIN users cust ON o.customer_id = cust.id
             JOIN users sell ON o.seller_id = sell.id
             LEFT JOIN seller_profiles sell_prof ON o.seller_id = sell_prof.user_id
             WHERE o.id = ?`,
            [orderId]
        );

        if (orderRows.length === 0) {
            req.flash('error_msg', 'Order not found.');
            return res.redirect(userRole === 'seller' ? '/dashboard/orders' : '/my-orders'); // Redirect appropriately
        }

        const order = orderRows[0];

        // Security check: Ensure the logged-in user is either the customer or the seller for this order
        if (userRole !== 'admin' && order.customer_id !== userId && order.seller_id !== userId) {
            req.flash('error_msg', 'You do not have permission to view this order.');
            return res.redirect(userRole === 'seller' ? '/dashboard/orders' : '/');
        }

        const [orderItems] = await pool.query(
            `SELECT oi.*, p.name as product_name, p.image_url as product_image_url
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [orderId]
        );

        res.render('order-detail', { // Create this EJS view (can be reused or specific for dashboard)
            title: `Order Details - #${order.id}`,
            order: order,
            items: orderItems
        });

    } catch (err) {
        console.error("Error fetching order details:", err);
        req.flash('error_msg', 'Could not load order details.');
        res.redirect(req.user.role === 'seller' ? '/dashboard/orders' : '/');
    }
};
// You'll need a route for this in indexRoutes.js or a dashboard sub-route
// e.g., in indexRoutes.js: router.get('/order-detail/:id', ensureAuthenticated, orderController.getOrderDetailsPage);
// or in dashboardRoutes.js: router.get('/orders/:id', ensureAuthenticated, ensureSeller, orderController.getOrderDetailsPage);