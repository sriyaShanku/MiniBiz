document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Navigation Toggle ---
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
        document.addEventListener('click', (event) => {
            const isClickInsideNav = navLinks.contains(event.target);
            const isClickOnToggle = navToggle.contains(event.target);
            if (!isClickInsideNav && !isClickOnToggle && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // --- Dark Mode Toggle ---
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    const body = document.body;
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Function to apply the theme
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            if (darkModeToggle) {
                darkModeToggle.textContent = '☀️'; // Sun icon for light mode
                darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
            }
        } else {
            body.classList.remove('dark-mode');
            if (darkModeToggle) {
                darkModeToggle.textContent = '🌙'; // Moon icon for dark mode
                darkModeToggle.setAttribute('aria-label', 'Switch to dark mode');
            }
        }
    };

    // Function to get the current theme preference
    const getCurrentTheme = () => {
        let theme = window.localStorage.getItem('minibiz_theme');
        if (theme) return theme;
        // If no stored preference, use system preference
        return prefersDarkScheme.matches ? 'dark' : 'light';
    };

    // Set initial theme
    let currentTheme = getCurrentTheme();
    applyTheme(currentTheme);

    // Add event listener to the toggle button
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            let newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
            applyTheme(newTheme);
            try {
                window.localStorage.setItem('minibiz_theme', newTheme); // Save preference
            } catch (err) {
                console.error("Failed to save theme preference:", err);
            }
        });
    }

    // Optional: Listen for changes in system preference
    try {
        prefersDarkScheme.addEventListener('change', (e) => {
            // Only change if no theme is explicitly saved by the user
            if (!window.localStorage.getItem('minibiz_theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    } catch (err) { // For older browsers that might not support addEventListener on matchMedia
        try {
            prefersDarkScheme.addListener((e) => { // Deprecated but fallback
                if (!window.localStorage.getItem('minibiz_theme')) {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        } catch (err2) {
            console.error("Theme preference change listening not supported:", err2);
        }
    }


    // --- Active Navigation Link Highlighting ---
    try {
        // Normalize path, default to index.html
        let currentPage = window.location.pathname.split("/").pop() || "index.html";
        // Handle case where path ends with '/' - also treat as index.html
        if (currentPage === "" || window.location.pathname.endsWith('/'))  currentPage = "index.html";
        const isCartPage = currentPage === "cart.html";
        const mainNavAnchors = document.querySelectorAll('.main-header .nav-links a'); // More specific selector

        mainNavAnchors.forEach(link => {
            let linkPage = link.getAttribute('href').split("/").pop() || "index.html";
             if (linkPage === "" || link.getAttribute('href') === './' || link.getAttribute('href') === '/') {
                 linkPage = "index.html";
             }

            if (linkPage === currentPage) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    } catch (e) {
        console.error("Error highlighting active navigation link:", e);
    }


    // --- Specific Page Logic ---

    // Dashboard Section Navigation (Smooth Scroll + Active State)
    if (document.querySelector('.dashboard-layout')) {
        const dashNavLinks = document.querySelectorAll('.dashboard-nav a');

        dashNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                // Check if it's an internal anchor link
                if (targetId && targetId.startsWith('#')) {
                    e.preventDefault(); // Prevent default jump
                    const targetSection = document.querySelector(targetId);

                    if (targetSection) {
                        // Update active class immediately for responsiveness
                        dashNavLinks.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');

                        // Calculate offset needed (height of sticky header)
                        const header = document.querySelector('.main-header');
                        const headerHeight = header ? header.offsetHeight + 20 : 80; // Add some padding

                        // Scroll smoothly to the section, accounting for the sticky header
                         const elementPosition = targetSection.getBoundingClientRect().top;
                         const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                          window.scrollTo({
                             top: offsetPosition,
                             behavior: "smooth"
                         });

                        // Optional: Update URL hash without jump (for bookmarking/sharing)
                        // history.pushState(null, null, targetId);
                    }
                }
                 // Allow normal navigation for external links or different pages
            });
        });

        // Optional: Highlight nav link based on scroll position (more advanced)
        // Could use Intersection Observer API here
    }

    // Login/Register Form Toggle
    if (document.querySelector('.login-register-container')) {
        const loginContainer = document.getElementById('login-form-container');
        const registerContainer = document.getElementById('register-form-container');
        const showRegisterLink = document.getElementById('show-register');
        const showLoginLink = document.getElementById('show-login');

        if (showRegisterLink && showLoginLink && loginContainer && registerContainer) {
            showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                loginContainer.style.display = 'none';
                registerContainer.style.display = 'block';
                // Focus on the first field in the register form (optional)
                registerContainer.querySelector('input')?.focus();
            });

            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                registerContainer.style.display = 'none';
                loginContainer.style.display = 'block';
                 // Focus on the first field in the login form (optional)
                 loginContainer.querySelector('input')?.focus();
            });
        }
    }

    /* // Inside your contact seller modal form submission in script.js
    // Assuming modalForm is the form element
    modalForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(modalForm);
        const data = Object.fromEntries(formData.entries());
        // Add seller_id (you'll need to get this dynamically, e.g., from a data-attribute)
        data.seller_id = document.getElementById('modal-seller-id').value; // Ensure this exists
        data.product_id = currentProductId; // If applicable, set this when opening modal for a product

        try {
            const response = await fetch('/api/contact-seller', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                 modalFormStatus.textContent = result.message;
                 modalFormStatus.style.color = 'green';
                 modalForm.reset();
                 setTimeout(closeContactModal, 2000);
            } else {
                modalFormStatus.textContent = result.message || 'Failed to send message.';
                modalFormStatus.style.color = 'red';
            }
            modalFormStatus.style.display = 'block';
        } catch (error) {
            console.error('Error sending message:', error);
            modalFormStatus.textContent = 'An error occurred. Please try again.';
            modalFormStatus.style.color = 'red';
            modalFormStatus.style.display = 'block';
        }
    */
    /*});*/
    
    
    

    // Simple FAQ Toggle (Example - requires structure changes in HTML if wanted)
    /*
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer'); // Assuming answer div exists
        if (question && answer) {
            question.addEventListener('click', () => {
                item.classList.toggle('open');
                // Toggle answer visibility using display or height transition
                if (item.classList.contains('open')) {
                    answer.style.display = 'block'; // Or use max-height for animation
                } else {
                    answer.style.display = 'none';
                }
            });
            // Initially hide answers
            answer.style.display = 'none';
        }
    });
    */


    // ==============================================
    // === CART & BOOKING FUNCTIONALITY           ===
    // ==============================================

    const cartLocalStorageKey = 'miniBizCart';

    function getCart() {
        try {
            const cart = localStorage.getItem(cartLocalStorageKey);
            return cart ? JSON.parse(cart) : [];
        } catch (e) { console.error("Error reading cart", e); return []; }
    }

    function saveCart(cart) {
         try {
            localStorage.setItem(cartLocalStorageKey, JSON.stringify(cart));
            updateCartBadge();
            if (document.getElementById('cart-items-container')) displayCartItems();
        } catch (e) { console.error("Error saving cart", e); }
    }

    function addToCart(productId, productName, productPrice, productImage) {
        let cart = getCart();
        const existingItemIndex = cart.findIndex(item => item.id === productId);
        // ** INR Change: Remove ₹ and commas, then parse **
        const price = parseFloat(String(productPrice).replace(/₹|,/g, '')) || 0;

        if (price <= 0) {
             console.warn(`Item ${productId} price (${productPrice}) invalid.`);
             showTemporaryFeedback(productId, 'Inquire');
             return;
        }

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ id: productId, name: productName, price: price, image: productImage, quantity: 1 });
        }
        saveCart(cart);
        showTemporaryFeedback(productId, '✓ Added!');
    }

    function updateQuantity(productId, change) {
        let cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) cart.splice(itemIndex, 1);
            saveCart(cart);
        }
    }

    function removeFromCart(productId) {
        let cart = getCart();
        cart = cart.filter(item => item.id !== productId);
        saveCart(cart);
    }

    function updateCartBadge() {
        const cart = getCart();
        const badge = document.getElementById('cart-item-count');
        if (badge) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    function showTemporaryFeedback(productId, message) {
        // Select button based on product ID for cart or generic selector if not specific
        const button = document.querySelector(`.btn-cart[data-product-id="${productId}"]`);
        if (button) {
            const originalHtml = button.innerHTML;
            button.innerHTML = message;
            button.disabled = true;
            setTimeout(() => {
                if(button) { button.innerHTML = originalHtml; button.disabled = false; }
            }, 1800);
        }
    }

     // *** Event delegation for ADD TO CART (more robust) ***
     document.body.addEventListener('click', event => {
        const cartButton = event.target.closest('.btn-cart'); // Target cart button
        if (cartButton && !cartButton.disabled) {
            event.preventDefault(); // Prevent default if it's an anchor

            // Get data directly from the button's data attributes
            const productId = cartButton.dataset.productId;
            const productName = cartButton.dataset.productName;
            const productPrice = cartButton.dataset.productPrice; // Already cleaned in addToCart
            const productImage = cartButton.dataset.productImage;

            if (productId && productName && productPrice && productImage) {
                 addToCart(productId, productName, productPrice, productImage);
             } else {
                 console.error("Missing data attributes on cart button:", cartButton);
                 alert("Could not add item to cart. Product data is missing."); // User feedback
             }
         }
     });


    // === CART PAGE DISPLAY ===
    function displayCartItems() {
        const cart = getCart();
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartSummaryContainer = document.getElementById('cart-summary-container');
        const emptyMessage = document.getElementById('cart-empty-message');

        if (!cartItemsContainer || !cartSummaryContainer || !emptyMessage) return;

        cartItemsContainer.innerHTML = '';
        emptyMessage.style.display = cart.length === 0 ? 'block' : 'none';
        cartSummaryContainer.style.display = cart.length === 0 ? 'none' : 'block';

        if (cart.length === 0) {
            cartSummaryContainer.innerHTML = ''; // Ensure summary is cleared
            return;
        }

        let subtotal = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
             // ** INR Change: Format price display **
             const formattedPrice = item.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
             const formattedTotal = itemTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 });

            itemElement.innerHTML = `
                <div class="cart-item-image">
                    <a href="product-detail.html#${item.id}"><img src="${item.image}" alt="${item.name}"></a>
                </div>
                <div class="cart-item-details">
                    <h4><a href="product-detail.html#${item.id}">${item.name}</a></h4>
                    <p>Price: ${formattedPrice}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-decrease" data-id="${item.id}" aria-label="Decrease quantity by 1 for ${item.name}">-</button>
                    <input type="number" value="${item.quantity}" min="1" aria-label="Quantity for ${item.name}" data-id="${item.id}" class="quantity-input" readonly>
                    <button class="quantity-increase" data-id="${item.id}" aria-label="Increase quantity by 1 for ${item.name}">+</button>
                </div>
                <div class="cart-item-price">${formattedTotal}</div>
                <div class="cart-item-remove">
                    <button class="remove-item" data-id="${item.id}" aria-label="Remove ${item.name} from cart">🗑️</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        // Re-add event listeners AFTER elements are created
        cartItemsContainer.querySelectorAll('.quantity-decrease').forEach(button => button.addEventListener('click', () => updateQuantity(button.dataset.id, -1)));
        cartItemsContainer.querySelectorAll('.quantity-increase').forEach(button => button.addEventListener('click', () => updateQuantity(button.dataset.id, 1)));
        cartItemsContainer.querySelectorAll('.remove-item').forEach(button => button.addEventListener('click', () => removeFromCart(button.dataset.id)));

        // Display Summary
        const shipping = 0; // Placeholder
        const total = subtotal + shipping;
         // ** INR Change: Format summary prices **
         const formattedSubtotal = subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
         const formattedTotalSummary = total.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 });

        cartSummaryContainer.innerHTML = `
             <div class="card">
                <h3>Order Summary</h3>
                <div class="summary-line">
                    <span>Subtotal (${cart.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                    <span>${formattedSubtotal}</span>
                </div>
                <div class="summary-line">
                    <span>Est. Shipping:</span>
                    <span>${shipping === 0 ? 'FREE' : ('₹' + shipping.toLocaleString('en-IN'))}</span>
                </div>
                <div class="summary-line summary-total">
                    <span>Total:</span>
                    <span>${formattedTotalSummary}</span>
                </div>
                <button class="btn btn-primary" id="checkout-button">Proceed to Checkout</button>
                <p class="text-muted text-center" style="font-size: 0.8rem; margin-top: 15px;">(Checkout unavailable)</p>
             </div>
        `;
        document.getElementById('checkout-button').addEventListener('click', () => alert('Checkout is disabled.'));
    }

    // === BOOKING MODAL FUNCTIONALITY ===
    const bookingModal = document.getElementById('booking-modal');
    const bookingForm = document.getElementById('booking-form');
    const closeModalButtons = document.querySelectorAll('.modal-close');
    const modalServiceNameField = document.getElementById('booking-service-name'); // Target specific field
    const modalTitleField = document.getElementById('modal-service-title-placeholder'); // Target title placeholder
    const bookingStatus = document.getElementById('booking-form-status');

    function openBookingModal(serviceName = 'Service') {
        if (!bookingModal) return;
        if (modalServiceNameField) modalServiceNameField.value = serviceName;
        if (modalTitleField) modalTitleField.textContent = serviceName; // Update title too
        if (bookingStatus) bookingStatus.style.display = 'none';
        bookingModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        bookingModal.querySelector('input[type="date"], input[type="text"], textarea')?.focus();
    }

    function closeBookingModal() {
        if (!bookingModal) return;
        bookingModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

     // *** Event listener for BOOK / INQUIRE buttons (more robust) ***
     document.body.addEventListener('click', event => {
        const bookButton = event.target.closest('.btn-book');
        if (bookButton) {
            event.preventDefault();
            // Try getting name from data-attribute FIRST, then from heading
            const serviceName = bookButton.dataset.serviceName ||
                                bookButton.closest('.product-card, .product-info')?.querySelector('h1, h3 a')?.textContent ||
                                'Selected Service';
            openBookingModal(serviceName);
        }
    });

    closeModalButtons.forEach(button => button.addEventListener('click', closeBookingModal));
    if (bookingModal) bookingModal.addEventListener('click', event => { if (event.target === bookingModal) closeBookingModal(); });

    // Fake booking form submission
    if (bookingForm && bookingStatus) {
        bookingForm.addEventListener('submit', event => {
            event.preventDefault();
            bookingStatus.textContent = 'Thank you! Your inquiry has been sent.';
            bookingStatus.style.color = 'green';
            bookingStatus.style.display = 'block';
            bookingForm.reset();
            setTimeout(closeBookingModal, 3000);
        });
    }

    // ==============================================
    // === PAGINATION & FILTERING (Explore Page) ===
    // ==============================================

    const productGrid = document.querySelector('.product-grid');
    const categoryFilter = document.getElementById('category-filter');
    const paginationContainer = document.querySelector('.pagination');
    const resultsCountSpan = document.getElementById('results-count');

    let allProductCards = []; // Store all cards initially
    let filteredProductCards = []; // Store currently visible cards
    const itemsPerPage = 6;
    let currentPage = 1;
    let totalPages = 1;

    // Function to display items for the current page
    function displayPage(page) {
        if (!productGrid || !paginationContainer) return; // Exit if not on explore page

        // Hide all cards managed by pagination/filtering
        allProductCards.forEach(card => card.classList.add('hidden'));

        // Ensure page is within bounds
        page = Math.max(1, Math.min(page, totalPages));
        currentPage = page; // Update current page

        const startIndex = (page - 1) * itemsPerPage;
        // Get end index, ensuring it doesn't exceed filtered items length
        const endIndex = Math.min(startIndex + itemsPerPage, filteredProductCards.length);


        // Show only the cards for the current page FROM THE FILTERED LIST
        filteredProductCards.slice(startIndex, endIndex).forEach(card => {
            card.classList.remove('hidden');
        });

        updatePaginationControls(); // Update buttons and page info
    }

     // Function to update pagination buttons and text
     function updatePaginationControls() {
        if (!paginationContainer) return;

        // Recalculate total pages based on FILTERED items
        totalPages = Math.max(1, Math.ceil(filteredProductCards.length / itemsPerPage));

         // Update results count display
         if (resultsCountSpan) {
             resultsCountSpan.textContent = filteredProductCards.length;
         }


        let paginationHTML = '';
         paginationHTML += `
             <button class="btn btn-secondary prev-page" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">
                 « Prev
             </button>
         `;
         paginationHTML += `<span aria-current="page">Page ${currentPage} of ${totalPages}</span>`;
         paginationHTML += `
             <button class="btn btn-secondary next-page" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next page">
                 Next »
             </button>
         `;
        paginationContainer.innerHTML = paginationHTML;

        // Add event listeners to the newly created buttons
        const prevButton = paginationContainer.querySelector('.prev-page');
        const nextButton = paginationContainer.querySelector('.next-page');
        if(prevButton) prevButton.addEventListener('click', () => displayPage(currentPage - 1));
        if(nextButton) nextButton.addEventListener('click', () => displayPage(currentPage + 1));
    }


     // Function to apply filters
     function applyFilters() {
         if (!productGrid || !categoryFilter) return;

         const selectedCategory = categoryFilter.value;

         // Filter the original list of all cards
         filteredProductCards = allProductCards.filter(card => {
            const cardCategory = card.dataset.category || 'all'; // Default if no category
            return selectedCategory === 'all' || cardCategory === selectedCategory;
         });

          // Reset to page 1 and display filtered results
         displayPage(1);
     }

    // Initial Setup for Explore Page
    if (productGrid) {
        // Store all cards on initial load
        allProductCards = Array.from(productGrid.querySelectorAll('.product-card'));
        // Initially, all cards are filtered
        filteredProductCards = [...allProductCards];

        // Add Filter Event Listener
        if (categoryFilter) {
             categoryFilter.addEventListener('change', applyFilters);
        } else {
             console.warn("Category filter element not found.");
        }

         // Initial Page Display
         applyFilters(); // Apply 'all' filter initially and display page 1

    } // End if(productGrid)


    // --- Other functionality (Dashboard, Login Toggle) ---
    // ... (Keep existing code for Dashboard Scroll, Login Toggle etc.) ...
    if (document.querySelector('.dashboard-layout')) { /* ... dashboard scroll code ... */ }
    if (document.querySelector('.login-register-container')) { /* ... login toggle code ... */ }


    // === INITIALIZATION ===
    updateCartBadge();
    if (document.getElementById('cart-items-container')) displayCartItems();
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // console.log("MiniBiz Script Enhanced and Loaded");

    // In your script.js, when checkout button is clicked
    document.getElementById('checkout-button').addEventListener('click', async () => {
        const cart = getCart(); // Your existing function to get cart from localStorage
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Dummy shipping address for now, you'd get this from a form
        const shippingAddress = {
            street: "123 Main St",
            city: "Anytown",
            zip: "12345"
        };

        try {
            const response = await fetch('/api/orders/create-from-cart', { //your backend route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Authorization header if login is required:
                    // 'Authorization': `Bearer ${your_auth_token}`
                },
                body: JSON.stringify({ cartItems: cart, shippingAddress })
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message || "Order placed successfully! Seller will contact you.");
                localStorage.removeItem(cartLocalStorageKey); // Clear the cart
                updateCartBadge();
                if (document.getElementById('cart-items-container')) displayCartItems(); // Refresh cart display
                // Optionally redirect to an order confirmation page
                // window.location.href = `/order-confirmation/${result.orderId}`;
            } else {
                 alert(result.message || "Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert("An error occurred during checkout. Please try again.");
        }
    });
    

}); // End DOMContentLoaded