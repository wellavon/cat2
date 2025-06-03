document.addEventListener('DOMContentLoaded', () => {
    // DOM элементы
    const authScreen = document.getElementById('auth-screen');
    const app = document.getElementById('app');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = authForms[0];
    const registerForm = authForms[1];
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const usernameDisplay = document.getElementById('username-display');
    
    // Инициализация данных
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(null));
    }
    
    // Проверка авторизации
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        // Fix default avatar for existing users if missing or empty
        if (!currentUser.avatar || currentUser.avatar.trim() === '') {
            currentUser.avatar = 'https://via.placeholder.com/80';
            const users = JSON.parse(localStorage.getItem('users'));
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].avatar = currentUser.avatar;
                localStorage.setItem('users', JSON.stringify(users));
            }
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        showApp(currentUser);
    } else {
        authScreen.style.display = 'flex';
    }
    
    // Обработчики авторизации
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });
    
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });
    
    registerBtn.addEventListener('click', () => {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        
        if (!username || !password) {
            alert('Заполните все поля');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users'));
        
        if (users.some(user => user.username === username)) {
            alert('Пользователь уже существует');
            return;
        }
        
        const newUser = {
            id: Date.now().toString(),
            username,
            password,
            avatar: 'https://via.placeholder.com/80',
            friends: [],
            products: []
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        showApp(newUser);
    });
    
    loginBtn.addEventListener('click', () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            showApp(user);
        } else {
            alert('Неверное имя пользователя или пароль');
        }
    });
    
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        authScreen.style.display = 'flex';
        app.style.display = 'none';
    });
    
    function showApp(user) {
        authScreen.style.display = 'none';
        app.style.display = 'block';
        usernameDisplay.textContent = user.username;
        
        // Инициализация функционала приложения
        initApp(user);
    }
    
    function initApp(user) {
        // Получаем элементы
        const productsContainer = document.getElementById('products-container');
        const friendsContainer = document.getElementById('friends-container');
        const searchInput = document.getElementById('search-input');
        const descriptionButton = document.getElementById('description-button');
        const addProductButton = document.getElementById('add-product-button');
        const addFriendButton = document.getElementById('add-friend-button');
        const friendsList = document.getElementById('friends-container');
        const closeButton = document.querySelector('.close');
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        const friendsCount = document.getElementById('friends-count');
        const productsCount = document.getElementById('products-count');
        const productsList = document.getElementById('products');
        
        // Показываем продукты по умолчанию
        productsContainer.style.display = 'block';
        friendsContainer.style.display = 'none';
        
        // Обработчик кнопки "Друзья"
        const closeFriendsButton = document.getElementById('close-friends-button');

        document.getElementById('add-friend-button').addEventListener('click', () => {
            if (friendsContainer.style.display === 'none') {
                productsContainer.style.display = 'none';
                friendsContainer.style.display = 'block';
                document.getElementById('friend-search-container').style.display = 'block';
                closeFriendsButton.style.display = 'inline-block';
            }
            // Do nothing if friendsContainer is already visible
        });

        closeFriendsButton.addEventListener('click', () => {
            friendsContainer.style.display = 'none';
            productsContainer.style.display = 'block';
            closeFriendsButton.style.display = 'none';
        });
        
        // Обновление счетчиков
        function updateCounters() {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const users = JSON.parse(localStorage.getItem('users'));
            const updatedUser = users.find(u => u.id === currentUser.id);
            
            friendsCount.textContent = updatedUser.friends.length;
            productsCount.textContent = updatedUser.products.length;
        }
        
        // Отображение продуктов
        function renderProducts(products) {
            productsList.innerHTML = '';
            
            products.forEach(product => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span>${product.name}</span>
                    <span class="label ${product.label}">${product.label}</span>
                    <button class="edit-product" data-id="${product.id}" title="Редактировать продукт">✎</button>
                    <button class="delete-product" data-id="${product.id}" title="Удалить продукт">×</button>
                `;
                productsList.appendChild(listItem);
            });
            
            // Добавляем обработчики удаления
            document.querySelectorAll('.delete-product').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = e.target.dataset.id;
                    deleteProduct(productId);
                });
            });

            // Добавляем обработчики редактирования
            document.querySelectorAll('.edit-product').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = e.target.dataset.id;
                    openEditProductModal(productId);
                });
            });
        }
        
        // Удаление продукта
        function deleteProduct(productId) {
            const users = JSON.parse(localStorage.getItem('users'));
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            users[userIndex].products = users[userIndex].products.filter(p => p.id !== productId);
            
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
            
            renderProducts(users[userIndex].products);
            updateCounters();
        }
        
        // Отображение друзей
        function renderFriends() {
            const friendsContainer = document.getElementById('friends');
            friendsContainer.innerHTML = '';
            
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const users = JSON.parse(localStorage.getItem('users'));
            
            currentUser.friends.forEach(friendId => {
                const friend = users.find(u => u.id === friendId);
                if (friend) {
                    const friendItem = document.createElement('li');
                    friendItem.innerHTML = `
                        <img src="${friend.avatar}" alt="${friend.username}">
                        <span>${friend.username}</span>
                        <span class="friend-stats">Продуктов: ${friend.products.length}</span>
                    `;
                    friendsContainer.appendChild(friendItem);
                }
            });
            
            updateCounters();
        }
        
        // Поиск пользователей
        function searchUsers(query) {
            console.log('searchUsers called with query:', query);
            const resultsContainer = document.getElementById('search-results');
            resultsContainer.innerHTML = '';
            
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const users = JSON.parse(localStorage.getItem('users'));
            console.log('currentUser:', currentUser);
            console.log('users:', users);
            
            if (!users || !currentUser) {
                console.warn('Users or currentUser data missing in localStorage');
                return;
            }
            
            const filteredUsers = users.filter(user => 
                user.id !== currentUser.id && 
                !currentUser.friends.includes(user.id) &&
                (user.username.toLowerCase().includes(query.toLowerCase()) || user.id.includes(query))
            );
            console.log('filteredUsers:', filteredUsers);
            
            filteredUsers.forEach(user => {
                const userItem = document.createElement('li');
                userItem.innerHTML = `
                    <img src="${user.avatar}" alt="${user.username}">
                    <span>${user.username} (ID: ${user.id})</span>
                `;
                userItem.style.cursor = 'pointer';
                userItem.addEventListener('click', () => {
                    openUserProfile(user);
                });
                resultsContainer.appendChild(userItem);
            });
        }

        // Инициализация событий
        const friendSearchInput = document.getElementById('friend-search');
        friendSearchInput.addEventListener('input', () => {
            console.log('friend-search input event triggered with value:', friendSearchInput.value);
            searchUsers(friendSearchInput.value);
        });
        
        function openDescriptionModal() {
            const modal = document.getElementById('modal');
            const modalBody = document.getElementById('modal-body');
            modalBody.innerHTML = `
                <h3>Описание пометок</h3>
                <p><b>"люблю"</b> - Такое мы любим, такое мы едим тоннами. За эту вещь кошка вам все грехи простит, честно.</p>
                <p><b>"хорошо"</b> - Обычная вкусная еда, не что-то выдающееся, но кошка happy.</p>
                <p><b>"сойдет"</b> - Корчиться не будет (наверное) и на том спасибо, но не советую конечно.</p>
                <p><b>"ужасно"</b> - И этим ты собрался травить кошку??? Сейчас бы тебя.. да за жестокое обращение с животными... позорник.</p>
            `;
            modal.style.display = 'block';
        }
        function openAddProductModal() {
            modalBody.innerHTML = `
                <h3>Добавить продукт</h3>
                <form id="product-form">
                    <input type="text" id="product-name" placeholder="Название продукта" required>
                    <select id="product-label" required>
                        <option value="люблю">Люблю</option>
                        <option value="хорошо">Хорошо</option>
                        <option value="сойдет">Сойдет</option>
                        <option value="ужасно">Ужасно</option>
                    </select>
                    <button type="submit">Добавить</button>
                </form>
            `;
            modal.style.display = 'block';
            
            const productForm = document.getElementById('product-form');
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('product-name').value;
                const label = document.getElementById('product-label').value;
                
                const newProduct = {
                    id: Date.now().toString(),
                    name,
                    label
                };
                
                const users = JSON.parse(localStorage.getItem('users'));
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                users[userIndex].products.push(newProduct);
                
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
                
                renderProducts(users[userIndex].products);
                updateCounters();
                modal.style.display = 'none';
            });
        }
        descriptionButton.addEventListener('click', openDescriptionModal);
        addProductButton.addEventListener('click', openAddProductModal);
        
        addFriendButton.addEventListener('click', () => {
            friendsList.style.display = 'block';
            document.getElementById('friend-search-container').style.display = 'block';
            document.getElementById('friend-search').focus();
        });
        
        // Обновление обработчиков кнопок закрытия модального окна
        function closeModal() {
            const modal = document.getElementById('modal');
            modal.style.display = 'none';
        }
        function updateCloseButtons() {
            const closeButtons = document.querySelectorAll('.close');
            closeButtons.forEach(btn => {
                btn.removeEventListener('click', closeModal);
                btn.addEventListener('click', closeModal);
            });
        }
        updateCloseButtons();

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Первоначальная загрузка данных
        renderProducts(user.products);
        renderFriends();
        updateCounters();

        // Clear friend search input and results after adding friend
        function clearFriendSearch() {
            friendSearchInput.value = '';
            const searchResults = document.getElementById('search-results');
            searchResults.innerHTML = '';
        }

        // Set user avatar from stored data
        const userAvatar = document.getElementById('user-avatar');
        userAvatar.src = user.avatar ? user.avatar : 'cat-avatar.webp';

        // Avatar upload elements
        const avatarUploadInput = document.getElementById('avatar-upload');

        // Click on avatar triggers file input click
        userAvatar.addEventListener('click', () => {
            avatarUploadInput.click();
        });

        // Handle file input change event
        avatarUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // Validate file type (image)
            if (!file.type.startsWith('image/')) {
                alert('Пожалуйста, выберите изображение.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const imageDataUrl = e.target.result;

                // Update avatar image src
                userAvatar.src = imageDataUrl;

                // Update user avatar in localStorage
                const users = JSON.parse(localStorage.getItem('users'));
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                const userIndex = users.findIndex(u => u.id === currentUser.id);

                if (userIndex !== -1) {
                    users[userIndex].avatar = imageDataUrl;
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
                }
            };
            reader.readAsDataURL(file);
        });

        // Добавление друга
        function addFriend(friendId) {
            const users = JSON.parse(localStorage.getItem('users'));
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (!users[userIndex].friends.includes(friendId)) {
                users[userIndex].friends.push(friendId);
            }
            
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
            
            renderFriends();
            document.getElementById('friend-search-container').style.display = 'none';
        }
        
        // Override addFriend to clear search after adding friend
        const originalAddFriend = addFriend;
        addFriend = function(friendId) {
            originalAddFriend(friendId);
            clearFriendSearch();
        };
    }
});

