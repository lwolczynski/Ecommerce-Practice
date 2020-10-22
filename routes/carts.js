const express = require('express');
const cartsRepo = require('../repositories/carts');

const router = express.Router();

router.post('/cart/products', async (req, res) => {
    let cart;
    // Create cart if user doesn't have one
    if (!req.session.cartId) {
        // No cart, create and add product
        cart = await cartsRepo.create({ items: [] });
        req.session.cartId = cart.id;
    } else {
        cart = await cartsRepo.getOne(req.session.cartId);
    }

    // Add product to the cart or increase qty
    const existingItem = cart.items.find(item => item.id === req.body.productId)
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.items.push({ id: req.body.productId, quantity: 1 })
    }
    await cartsRepo.update(cart.id, {
        items: cart.items
    });

    res.send("!");
})

module.exports = router;