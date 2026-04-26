const CART_KEY = 'pinkpetals_cart';

export const cartService = {
    getCart: () => {
        const cart = localStorage.getItem(CART_KEY);
        return cart ? JSON.parse(cart) : [];
    },

    saveCart: (cart) => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
    },

    addToCart: (product, quantity = 1) => {
        const cart = cartService.getCart();
        const existingItem = cart.find(item => item.productId === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                imageUrl: product.imageUrl,
                stockQuantity: product.stockQuantity,
                quantity: quantity
            });
        }

        cartService.saveCart(cart);
        return cart;
    },

    updateQuantity: (productId, quantity) => {
        const cart = cartService.getCart();
        const item = cart.find(item => item.productId === productId);

        if (item) {
            if (quantity <= 0) {
                return cartService.removeFromCart(productId);
            }
            item.quantity = quantity;
            cartService.saveCart(cart);
        }

        return cart;
    },

    removeFromCart: (productId) => {
        let cart = cartService.getCart();
        cart = cart.filter(item => item.productId !== productId);
        cartService.saveCart(cart);
        return cart;
    },

    clearCart: () => {
        localStorage.removeItem(CART_KEY);
        window.dispatchEvent(new Event('cartUpdated'));
    },

    getCartTotal: () => {
        const cart = cartService.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getCartItemCount: () => {
        const cart = cartService.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
    }
};

export default cartService;
