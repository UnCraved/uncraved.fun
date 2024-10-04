       // Check if 'uName' and 'uPhone' are present in localStorage
if (!localStorage.getItem('uName') || !localStorage.getItem('uPhone')) {
    // Redirect to signup.html if either value is missing
    window.location.href = 'signup.html';
}


// Initialize Firebase
        const firebaseConfig = {
            apiKey: "API_KEY",
            authDomain: "uncraved-db.firebaseapp.com",
            databaseURL: "https://uncraved-db-default-rtdb.firebaseio.com",
            projectId: "uncraved-db",
            storageBucket: "uncraved-db.appspot.com",
            messagingSenderId: "174605544518",
            appId: "1:174605544518:web:7077ea6ae13a66b6d0ae47",
            measurementId: "G-L5VRHNSYY0"
        };

        firebase.initializeApp(firebaseConfig);

        // Reference the food items in Firebase
        const foodListRef = firebase.database().ref('food-items');

        // Function to get today's date in DDMMYYYY format
        function getTodayDate() {
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const yyyy = today.getFullYear();
            return dd + mm + yyyy;
        }

        // Function to sanitize the strings
        function sanitizeString(str) {
            return str.replace(/["\\]/g, ''); // Removes " and \
        }

        // Function to delete food items if date is not today's date
        function deleteOldItems() {
            const today = getTodayDate();

            // Loop through the food items and delete if date is not today
            foodListRef.once('value', (snapshot) => {
                const foodItems = snapshot.val();
                
                for (let key in foodItems) {
                    const foodItemDate = foodItems[key].date;

                    // Check if the food item is old
                    if (foodItemDate !== today) {
                        // Delete the old item
                        foodListRef.child(key).remove();
                    }
                }

                // Refresh the food list after deletion
                const activeButton = document.querySelector('.menu-btn.active');
                if (activeButton) {
                    const type = activeButton.getAttribute('data-type');
                    fetchFoodItemsByType(type);
                }
            });
        }

        // Function to fetch data based on selected type (B, L, D)
        function fetchFoodItemsByType(type) {
        foodListRef.orderByChild('type').equalTo(type).once('value', (snapshot) => {
        const foodListElement = document.getElementById('food-list');
        const foodItems = snapshot.val(); // Get the food items data
        
        foodListElement.innerHTML = ''; // Clear previous content
        
        if (!foodItems) {
        foodListElement.innerHTML = '<p class="nop">No food items available for this meal.</p>';
        return;
        }
        
        // Loop through the food items and create HTML for each one
        for (let key in foodItems) {
        const foodItem = foodItems[key];
        
        // Sanitize fields
        const sanitizedFoodName = sanitizeString(foodItem.name);
        const sanitizedKitchenName = sanitizeString(foodItem.kitchen);
        const sanitizedImageUrl = sanitizeString(foodItem.imageUrl);
        
        // Generate the HTML for each food item
        const foodItemHTML = `
        <div class="food-item" id="${sanitizedKitchenName}" data-key="${key}">
        <div class="food-image">
        <img src="${sanitizedImageUrl}" alt="food-image">
        </div>
        <div class="food-details">
        <h2 class="food-name">${sanitizedFoodName}</h2>
        <p class="kitchen-name"><span class="by-prefix">by</span>${sanitizedKitchenName}</p>
        <p class="food-price">₹${foodItem.price}</p>
        </div>
        </div>                        
        `;
        
        // Append the new food item to the food list
        foodListElement.innerHTML += foodItemHTML;
        }
        
        // Re-apply scroll event listener after rendering the food items
        applyScrollBlurEffect();
        
        // Add click event listeners to all food items
        const foodItemElements = document.querySelectorAll('.food-item');
        foodItemElements.forEach(item => {
        item.addEventListener('click', (event) => {
        const key = item.getAttribute('data-key');
        const selectedFoodItem = foodItems[key];
        
        // Store individual food item data in localStorage
        localStorage.setItem('food_name', selectedFoodItem.name);
        localStorage.setItem('kitchen', selectedFoodItem.kitchen);
        localStorage.setItem('imageUrl', selectedFoodItem.imageUrl);
        localStorage.setItem('price', selectedFoodItem.price);
        localStorage.setItem('status', selectedFoodItem.status || '');
        localStorage.setItem('description', selectedFoodItem.description || '');
        localStorage.setItem('location', selectedFoodItem.location || '');
        localStorage.setItem('whatsapp', selectedFoodItem.WhatsApp || '');
        localStorage.setItem('type', selectedFoodItem.type || '');

                            // Log to check if the data is being stored in localStorage
                            console.log("Stored in localStorage individually:", {
                            name: localStorage.getItem('food_name'),
                            kitchen: localStorage.getItem('kitchen'),
                            imageUrl: localStorage.getItem('imageUrl'),
                            price: localStorage.getItem('price'),
                            description: localStorage.getItem('description'),
                            location: localStorage.getItem('location'),
                            whatsapp: localStorage.getItem('whatsapp'),
                            type: localStorage.getItem('type'),
                            status: localStorage.getItem('status')
                        });
        
        
        // Redirect to confirm.html
        window.location.href = 'confirm.html';
        });
        });
        });
        }
        
        // Function to apply the scroll event listener
        function applyScrollBlurEffect() {
        const headerHeight = document.querySelector('.fixed-header').offsetHeight;
        const foodItems = document.querySelectorAll('.food-item');
        
        window.addEventListener('scroll', function () {
        foodItems.forEach(item => {
        const rect = item.getBoundingClientRect();
        if (rect.top < headerHeight) {
        item.style.filter = 'blur(3px)'; // Apply blur when scrolled behind header
        } else {
        item.style.filter = 'none'; // Remove blur when it's below the header
        }
        });
        });
        }
        

        // Add click event listeners to menu buttons
        const menuButtons = document.querySelectorAll('.menu-btn');
        menuButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                // Remove "active" class from all buttons
                menuButtons.forEach(btn => btn.classList.remove('active'));

                // Add "active" class to the clicked button
                button.classList.add('active');

                // Get the type associated with the clicked button
                const type = button.getAttribute('data-type');

                // Fetch and display food items based on the selected type
                fetchFoodItemsByType(type);
            });
        });

        // Time-based pre-selection logic
        function preselectMealBasedOnTime() {
            const currentHour = new Date().getHours(); // Get the current hour (0-23)
            let selectedType = 'B'; // Default to Breakfast

            if (currentHour >= 10 && currentHour < 15) {
                selectedType = 'L'; // Lunch time
            } else if (currentHour >= 15 && currentHour < 22) {
                selectedType = 'D'; // Dinner time
            }

            // Pre-select the corresponding button and fetch the food items
            const selectedButton = document.querySelector(`.menu-btn[data-type="${selectedType}"]`);
            selectedButton.classList.add('active');
            fetchFoodItemsByType(selectedType);
        }

        // Preselect the meal based on the current time on page load
        preselectMealBasedOnTime();

        // Call the function to delete old items on page load
        deleteOldItems();


// Initialize variables to track the previous scroll position
let lastScrollTop = 0;
const buttonContainer = document.querySelector('.button-container');

// Function to handle the scroll event
window.addEventListener('scroll', function () {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Check if the user is scrolling down
    if (currentScrollTop > lastScrollTop) {
        // Scrolling down
        buttonContainer.style.opacity = '0'; // Hide the button container
        buttonContainer.style.visibility = 'hidden'; // Ensure it's not clickable
    } else {
        // Scrolling up
        buttonContainer.style.opacity = '0'; // Show the button container
        buttonContainer.style.visibility = 'hidden'; // Make it clickable
    }

    // Update the last scroll position
    lastScrollTop = currentScrollTop;

    // Check if the user is at the top of the page
    if (currentScrollTop === 0) {
        buttonContainer.style.opacity = '1'; // Ensure it is visible at the top
        buttonContainer.style.visibility = 'visible'; // Make it clickable
    }
});

// Call the function to apply the scroll blur effect
applyScrollBlurEffect();

        // Fetch user's name from local storage
        const userName = localStorage.getItem('uName') || 'User'; // Default to 'User' if name is not found

        // Update the intro paragraph with the user's name
        const introText = document.getElementById('intro-text');
        introText.textContent = `Hello, ${userName.slice(0, userName.indexOf(" "))}! I'm Pratik Patwe, a first-year MIT ADT student from SOC 18. Passionate about technology, development, and artificial intelligence. Let's connect and explore the exciting world of tech together!`;
