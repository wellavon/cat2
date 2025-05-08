document.addEventListener('DOMContentLoaded', () => {
    const productsList = document.getElementById('products');
    const searchInput = document.getElementById('search-input');
    const descriptionButton = document.getElementById('description-button');
    const addProductButton = document.getElementById('add-product-button');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeButton = document.querySelector('.close');

    let products = []; // Пустой массив для хранения продуктов

    // Функция для получения продуктов с сервера
    async function fetchProducts() {
        try {
            console.log("Выполняется fetchProducts"); // Добавлено для отладки
            const response = await fetch('/.netlify/functions/products'); // Замените URL, если необходимо
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            products = await response.json();
            console.log('Fetched products:', products); // Debug log
            renderProducts(products); // Передаем полученные продукты
        } catch (error) {
            console.error('Error fetching products:', error);
            // Обработка ошибки (например, отображение сообщения об ошибке)
            alert('Failed to load products. Please try again later.');
        }
    }

    // Функция для отображения продуктов в списке
    function renderProducts(productList) {
        console.log('Rendering products count:', productList ? productList.length : 0); // Debug log
        productsList.innerHTML = ''; // Очищаем список

        if (productList) {
          productList.forEach(product => {
              const listItem = document.createElement('li');
              listItem.innerHTML = `
                  <span>${product.name}</span>
                  <span class="label ${product.label}">${product.label}</span>
              `;
              listItem.addEventListener('click', () => openProductModal(product));
              productsList.appendChild(listItem);
          });
        }
    }

    // Функция для фильтрации продуктов при поиске
    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts); // Передаем отфильтрованные продукты
    }

    // Функция для открытия модального окна с информацией о пометках
    function openDescriptionModal() {
        modalBody.innerHTML = `
            <h3>Описание пометок</h3>
            <p><b>"люблю"</b> - Такое мы любим, такое мы едим тоннами. За эту вещь кошка вам все грехи простит, честно.</p>
            <p><b>"хорошо"</b> - Обычная вкусная еда, не что-то выдающееся, но кошка happy.</p>
            <p><b>"сойдет"</b> - Корчиться не будет (наверное) и на том спасибо, но не советую конечно.</p>
            <p><b>"ужасно"</b> - И этим ты собрался травить кошку??? Сейчас бы тебя.. да за жестокое обращение с животными... позорник.</p>
        `;
        modal.style.display = 'block';
    }

    // Функция для открытия модального окна добавления продукта
    function openAddProductModal() {
  modalBody.innerHTML = `
            <h3>Добавить продукт</h3>
            <form id="add-product-form">
                <label for="product-name">Название продукта:</label>
                <input type="text" id="product-name" name="product-name" required>

                <label for="product-label">Описание:</label>
                <select id="product-label" name="product-label" required>
                    <option value="люблю">Люблю</option>
                    <option value="хорошо">Хорошо</option>
                    <option value="сойдет">Сойдет</option>
                    <option value="ужасно">Ужасно</option>
                </select>

                <button type="submit">Сохранить продукт</button>
            </form>
        `;
  modal.style.display = 'block';

  const addProductForm = document.getElementById('add-product-form');
  addProductForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Предотвращаем перезагрузку страницы

    const productName = document.getElementById('product-name').value;
    const productLabel = document.getElementById('product-label').value;

    const newProduct = {
      name: productName,
      label: productLabel
    };

    try {
      console.log("Выполняется POST запрос для добавления продукта"); // Добавлено для отладки
      const response = await fetch('/.netlify/functions/add-product', { // Вызываем add-product
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      await response.json();
      fetchProducts(); // Просто перезагружаем список продуктов

      closeModal();

    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again later.');
    }
  });
}

    // Функция для открытия модального окна редактирования продукта
    function openProductModal(product) {
        modalBody.innerHTML = `
            <h3>${product.name}</h3>
            <button id="edit-product">Изменить</button>
            <button id="delete-product">Удалить</button>
        `;
        modal.style.display = 'block';

        const editButton = document.getElementById('edit-product');
        const deleteButton = document.getElementById('delete-product');

        editButton.addEventListener('click', () => openEditProductModal(product));
        deleteButton.addEventListener('click', () => deleteProduct(product));
    }

    function openEditProductModal(product) {
        modalBody.innerHTML = `
            <h3>Редактировать продукт</h3>
            <form id="edit-product-form">
                <label for="edit-product-name">Название продукта:</label>
                <input type="text" id="edit-product-name" name="edit-product-name" value="${product.name}" required>

                <label for="edit-product-label">Описание:</label>
                <select id="edit-product-label" name="edit-product-label" required>
                    <option value="люблю" ${product.label === 'люблю' ? 'selected' : ''}>Люблю</option>
                    <option value="хорошо" ${product.label === 'хорошо' ? 'selected' : ''}>Хорошо</option>
                    <option value="сойдет" ${product.label === 'сойдет' ? 'selected' : ''}>Сойдет</option>
                    <option value="ужасно" ${product.label === 'ужасно' ? 'selected' : ''}>Ужасно</option>
                </select>

                <button type="submit">Сохранить изменения</button>
            </form>
        `;
        modal.style.display = 'block';

        const editProductForm = document.getElementById('edit-product-form');
        editProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const newName = document.getElementById('edit-product-name').value;
            const newLabel = document.getElementById('edit-product-label').value;

            const updatedProduct = {
                name: newName,
                label: newLabel
            };

            try {
                //  Получаем ID продукта
                const productId = product._id;

                const response = await fetch(`/.netlify/functions/update-product?id=${productId}`, {  // Измененный URL
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedProduct)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const updatedProductFromServer = await response.json();

                // Обновляем продукт в локальном массиве
                const index = products.findIndex(p => p._id === product._id);
                if (index !== -1) {
                    products[index] = updatedProductFromServer;
                }
                renderProducts(products);
                closeModal();
            } catch (error) {
                console.error('Error updating product:', error);
                alert('Failed to update product. Please try again later.');
            }
        });
    }

    // Функция для удаления продукта
    async function deleteProduct(product) {
        try {
          const productId = product._id;
          const response = await fetch(`/.netlify/functions/delete-product?id=${productId}`, {
            method: 'DELETE'
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          // Удаляем продукт из локального массива
          products = products.filter(p => p._id !== product._id);
          renderProducts(products);
          closeModal();
        } catch (error) {
          console.error('Error deleting product:', error);
          alert('Failed to delete product. Please try again later.');
        }
    }

    // Функция для закрытия модального окна
    function closeModal() {
        modal.style.display = 'none';
    }

    // Обработчики событий
    searchInput.addEventListener('input', filterProducts);
    descriptionButton.addEventListener('click', openDescriptionModal);
    addProductButton.addEventListener('click', openAddProductModal);
    closeButton.addEventListener('click', closeModal);

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Инициализация: отображаем начальный список продуктов
    fetchProducts();
});
