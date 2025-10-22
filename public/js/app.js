// API Base URL
const API_BASE = '/api';

// الحالة العامة للتطبيق
const appState = {
    currentPage: 'dashboard',
    data: {}
};

// عناصر DOM
const content = document.getElementById('content');
const pageTitle = document.getElementById('page-title');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close');

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    loadPage('dashboard');
    initNavigation();
    initModal();
});

// التنقل
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;

            // تحديث العنصر النشط
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            loadPage(page);
        });
    });
}

// تحميل الصفحة
async function loadPage(page) {
    appState.currentPage = page;

    const pageTitles = {
        dashboard: 'لوحة التحكم',
        customers: 'إدارة العملاء',
        products: 'إدارة المنتجات',
        orders: 'إدارة الطلبات',
        invoices: 'إدارة الفواتير',
        reports: 'التقارير والإحصائيات',
        categories: 'إدارة الفئات'
    };

    pageTitle.textContent = pageTitles[page] || page;

    content.innerHTML = '<div class="loading"><div class="spinner"></div><p>جاري التحميل...</p></div>';

    try {
        switch(page) {
            case 'dashboard':
                await loadDashboard();
                break;
            case 'customers':
                await loadCustomers();
                break;
            case 'products':
                await loadProducts();
                break;
            case 'orders':
                await loadOrders();
                break;
            case 'invoices':
                await loadInvoices();
                break;
            case 'reports':
                await loadReports();
                break;
            case 'categories':
                await loadCategories();
                break;
        }
    } catch (error) {
        content.innerHTML = `<div class="alert alert-error">حدث خطأ: ${error.message}</div>`;
    }
}

// ===========================================
// لوحة التحكم
// ===========================================
async function loadDashboard() {
    const stats = await fetchAPI('/reports/dashboard');

    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>إجمالي المبيعات</h3>
                <div class="value">${formatCurrency(stats.sales.total_revenue || 0)}</div>
            </div>
            <div class="stat-card">
                <h3>عدد الطلبات</h3>
                <div class="value">${stats.sales.total_orders || 0}</div>
            </div>
            <div class="stat-card">
                <h3>عدد العملاء</h3>
                <div class="value">${stats.customers || 0}</div>
            </div>
            <div class="stat-card">
                <h3>عدد المنتجات</h3>
                <div class="value">${stats.products || 0}</div>
            </div>
            <div class="stat-card">
                <h3>منتجات منخفضة المخزون</h3>
                <div class="value" style="color: #dc3545">${stats.lowStockProducts || 0}</div>
            </div>
            <div class="stat-card">
                <h3>الفواتير المعلقة</h3>
                <div class="value" style="color: #ffc107">${stats.pendingInvoices.count || 0}</div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="table-container">
                <div class="table-header">
                    <h2>أفضل المنتجات مبيعاً</h2>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>المنتج</th>
                            <th>الكمية المباعة</th>
                            <th>الإيرادات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.topProducts.map(p => `
                            <tr>
                                <td>${p.name}</td>
                                <td>${p.total_sold}</td>
                                <td>${formatCurrency(p.revenue)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="table-container">
                <div class="table-header">
                    <h2>أفضل العملاء</h2>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>عدد الطلبات</th>
                            <th>إجمالي الإنفاق</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.topCustomers.map(c => `
                            <tr>
                                <td>${c.name}</td>
                                <td>${c.order_count}</td>
                                <td>${formatCurrency(c.total_spent)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ===========================================
// إدارة العملاء
// ===========================================
async function loadCustomers() {
    const customers = await fetchAPI('/customers');

    content.innerHTML = `
        <div class="table-container">
            <div class="table-header">
                <h2>قائمة العملاء</h2>
                <button class="btn btn-primary" onclick="showCustomerForm()">إضافة عميل جديد</button>
            </div>
            <div class="search-bar">
                <input type="text" placeholder="بحث عن عميل..." onkeyup="searchCustomers(this.value)">
            </div>
            <table id="customers-table">
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>البريد الإلكتروني</th>
                        <th>الهاتف</th>
                        <th>المدينة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${customers.map(c => `
                        <tr>
                            <td>${c.name}</td>
                            <td>${c.email || '-'}</td>
                            <td>${c.phone || '-'}</td>
                            <td>${c.city || '-'}</td>
                            <td>
                                <button class="btn btn-info btn-sm" onclick='editCustomer(${JSON.stringify(c)})'>تعديل</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${c.id})">حذف</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    appState.data.customers = customers;
}

function showCustomerForm(customer = null) {
    const title = customer ? 'تعديل العميل' : 'إضافة عميل جديد';
    const buttonText = customer ? 'تحديث' : 'إضافة';

    modalBody.innerHTML = `
        <h2>${title}</h2>
        <form id="customer-form">
            <div class="form-group">
                <label>الاسم *</label>
                <input type="text" name="name" value="${customer?.name || ''}" required>
            </div>
            <div class="form-group">
                <label>البريد الإلكتروني</label>
                <input type="email" name="email" value="${customer?.email || ''}">
            </div>
            <div class="form-group">
                <label>الهاتف</label>
                <input type="tel" name="phone" value="${customer?.phone || ''}">
            </div>
            <div class="form-group">
                <label>العنوان</label>
                <input type="text" name="address" value="${customer?.address || ''}">
            </div>
            <div class="form-group">
                <label>المدينة</label>
                <input type="text" name="city" value="${customer?.city || ''}">
            </div>
            <div class="form-group">
                <label>الدولة</label>
                <input type="text" name="country" value="${customer?.country || ''}">
            </div>
            <div class="form-group">
                <label>ملاحظات</label>
                <textarea name="notes">${customer?.notes || ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">${buttonText}</button>
        </form>
    `;

    document.getElementById('customer-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            if (customer) {
                await fetchAPI(`/customers/${customer.id}`, 'PUT', data);
                showAlert('تم تحديث العميل بنجاح', 'success');
            } else {
                await fetchAPI('/customers', 'POST', data);
                showAlert('تم إضافة العميل بنجاح', 'success');
            }
            closeModalFn();
            loadCustomers();
        } catch (error) {
            showAlert('حدث خطأ: ' + error.message, 'error');
        }
    });

    showModal();
}

async function searchCustomers(query) {
    if (!query) {
        loadCustomers();
        return;
    }

    const customers = await fetchAPI(`/customers/search?q=${query}`);
    const tbody = document.querySelector('#customers-table tbody');

    tbody.innerHTML = customers.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.email || '-'}</td>
            <td>${c.phone || '-'}</td>
            <td>${c.city || '-'}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick='editCustomer(${JSON.stringify(c)})'>تعديل</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${c.id})">حذف</button>
            </td>
        </tr>
    `).join('');
}

function editCustomer(customer) {
    showCustomerForm(customer);
}

async function deleteCustomer(id) {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
        try {
            await fetchAPI(`/customers/${id}`, 'DELETE');
            showAlert('تم حذف العميل بنجاح', 'success');
            loadCustomers();
        } catch (error) {
            showAlert('حدث خطأ: ' + error.message, 'error');
        }
    }
}

// ===========================================
// إدارة المنتجات
// ===========================================
async function loadProducts() {
    const products = await fetchAPI('/products');
    const categories = await fetchAPI('/categories');
    appState.data.categories = categories;

    content.innerHTML = `
        <div class="table-container">
            <div class="table-header">
                <h2>قائمة المنتجات</h2>
                <button class="btn btn-primary" onclick="showProductForm()">إضافة منتج جديد</button>
            </div>
            <div class="search-bar">
                <input type="text" placeholder="بحث عن منتج..." onkeyup="searchProducts(this.value)">
            </div>
            <table id="products-table">
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>الفئة</th>
                        <th>السعر</th>
                        <th>المخزون</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(p => `
                        <tr class="${p.stock_quantity <= p.min_stock_level ? 'low-stock' : ''}">
                            <td>${p.name}</td>
                            <td>${p.category_name || '-'}</td>
                            <td>${formatCurrency(p.price)}</td>
                            <td>${p.stock_quantity}</td>
                            <td>
                                ${p.stock_quantity <= 0 ? '<span class="badge badge-danger">نفذ</span>' :
                                  p.stock_quantity <= p.min_stock_level ? '<span class="badge badge-warning">منخفض</span>' :
                                  '<span class="badge badge-success">متوفر</span>'}
                            </td>
                            <td>
                                <button class="btn btn-info btn-sm" onclick='editProduct(${JSON.stringify(p)})'>تعديل</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">حذف</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    appState.data.products = products;
}

function showProductForm(product = null) {
    const title = product ? 'تعديل المنتج' : 'إضافة منتج جديد';
    const buttonText = product ? 'تحديث' : 'إضافة';

    modalBody.innerHTML = `
        <h2>${title}</h2>
        <form id="product-form">
            <div class="form-group">
                <label>اسم المنتج *</label>
                <input type="text" name="name" value="${product?.name || ''}" required>
            </div>
            <div class="form-group">
                <label>الوصف</label>
                <textarea name="description">${product?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>الفئة</label>
                <select name="category_id">
                    <option value="">-- اختر الفئة --</option>
                    ${appState.data.categories.map(c => `
                        <option value="${c.id}" ${product?.category_id === c.id ? 'selected' : ''}>${c.name}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>السعر *</label>
                <input type="number" step="0.01" name="price" value="${product?.price || ''}" required>
            </div>
            <div class="form-group">
                <label>التكلفة</label>
                <input type="number" step="0.01" name="cost" value="${product?.cost || 0}">
            </div>
            <div class="form-group">
                <label>رمز المنتج (SKU)</label>
                <input type="text" name="sku" value="${product?.sku || ''}">
            </div>
            <div class="form-group">
                <label>الباركود</label>
                <input type="text" name="barcode" value="${product?.barcode || ''}">
            </div>
            <div class="form-group">
                <label>الكمية في المخزون</label>
                <input type="number" name="stock_quantity" value="${product?.stock_quantity || 0}">
            </div>
            <div class="form-group">
                <label>الحد الأدنى للمخزون</label>
                <input type="number" name="min_stock_level" value="${product?.min_stock_level || 0}">
            </div>
            <button type="submit" class="btn btn-primary">${buttonText}</button>
        </form>
    `;

    document.getElementById('product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            if (product) {
                await fetchAPI(`/products/${product.id}`, 'PUT', data);
                showAlert('تم تحديث المنتج بنجاح', 'success');
            } else {
                await fetchAPI('/products', 'POST', data);
                showAlert('تم إضافة المنتج بنجاح', 'success');
            }
            closeModalFn();
            loadProducts();
        } catch (error) {
            showAlert('حدث خطأ: ' + error.message, 'error');
        }
    });

    showModal();
}

async function searchProducts(query) {
    if (!query) {
        loadProducts();
        return;
    }

    const products = await fetchAPI(`/products/search?q=${query}`);
    const tbody = document.querySelector('#products-table tbody');

    tbody.innerHTML = products.map(p => `
        <tr class="${p.stock_quantity <= p.min_stock_level ? 'low-stock' : ''}">
            <td>${p.name}</td>
            <td>${p.category_name || '-'}</td>
            <td>${formatCurrency(p.price)}</td>
            <td>${p.stock_quantity}</td>
            <td>
                ${p.stock_quantity <= 0 ? '<span class="badge badge-danger">نفذ</span>' :
                  p.stock_quantity <= p.min_stock_level ? '<span class="badge badge-warning">منخفض</span>' :
                  '<span class="badge badge-success">متوفر</span>'}
            </td>
            <td>
                <button class="btn btn-info btn-sm" onclick='editProduct(${JSON.stringify(p)})'>تعديل</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">حذف</button>
            </td>
        </tr>
    `).join('');
}

function editProduct(product) {
    showProductForm(product);
}

async function deleteProduct(id) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        try {
            await fetchAPI(`/products/${id}`, 'DELETE');
            showAlert('تم حذف المنتج بنجاح', 'success');
            loadProducts();
        } catch (error) {
            showAlert('حدث خطأ: ' + error.message, 'error');
        }
    }
}

// ===========================================
// إدارة الطلبات (مبسطة)
// ===========================================
async function loadOrders() {
    const orders = await fetchAPI('/orders');

    content.innerHTML = `
        <div class="table-container">
            <div class="table-header">
                <h2>قائمة الطلبات</h2>
                <button class="btn btn-primary" onclick="showOrderForm()">إنشاء طلب جديد</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>رقم الطلب</th>
                        <th>العميل</th>
                        <th>التاريخ</th>
                        <th>المبلغ</th>
                        <th>الحالة</th>
                        <th>حالة الدفع</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(o => `
                        <tr>
                            <td>#${o.id}</td>
                            <td>${o.customer_name}</td>
                            <td>${formatDate(o.order_date)}</td>
                            <td>${formatCurrency(o.final_amount)}</td>
                            <td>${getStatusBadge(o.status)}</td>
                            <td>${getPaymentStatusBadge(o.payment_status)}</td>
                            <td>
                                <button class="btn btn-info btn-sm" onclick="viewOrder(${o.id})">عرض</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteOrder(${o.id})">حذف</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function showOrderForm() {
    const customers = await fetchAPI('/customers');
    const products = await fetchAPI('/products');

    modalBody.innerHTML = `
        <h2>إنشاء طلب جديد</h2>
        <form id="order-form">
            <div class="form-group">
                <label>العميل *</label>
                <select name="customer_id" required>
                    <option value="">-- اختر العميل --</option>
                    ${customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>المنتجات</label>
                <div id="order-items">
                    <div class="order-item">
                        <select name="product_id[]" required style="width: 40%; display: inline-block;">
                            <option value="">-- اختر المنتج --</option>
                            ${products.map(p => `<option value="${p.id}" data-price="${p.price}">${p.name} - ${formatCurrency(p.price)}</option>`).join('')}
                        </select>
                        <input type="number" name="quantity[]" placeholder="الكمية" min="1" required style="width: 20%; display: inline-block;">
                        <input type="number" name="unit_price[]" placeholder="السعر" step="0.01" required style="width: 30%; display: inline-block;">
                    </div>
                </div>
                <button type="button" class="btn btn-success btn-sm" onclick="addOrderItem()">إضافة منتج</button>
            </div>
            <div class="form-group">
                <label>الخصم</label>
                <input type="number" step="0.01" name="discount" value="0">
            </div>
            <div class="form-group">
                <label>الضريبة</label>
                <input type="number" step="0.01" name="tax" value="0">
            </div>
            <div class="form-group">
                <label>طريقة الدفع</label>
                <select name="payment_method">
                    <option value="cash">نقدي</option>
                    <option value="card">بطاقة</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                </select>
            </div>
            <div class="form-group">
                <label>ملاحظات</label>
                <textarea name="notes"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">إنشاء الطلب</button>
        </form>
    `;

    // تحديث السعر تلقائياً عند اختيار المنتج
    document.getElementById('order-items').addEventListener('change', (e) => {
        if (e.target.name === 'product_id[]') {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const price = selectedOption.dataset.price;
            const priceInput = e.target.parentElement.querySelector('[name="unit_price[]"]');
            if (price) priceInput.value = price;
        }
    });

    document.getElementById('order-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // تحويل البيانات إلى الشكل المطلوب
        const productIds = formData.getAll('product_id[]');
        const quantities = formData.getAll('quantity[]');
        const unitPrices = formData.getAll('unit_price[]');

        const items = productIds.map((id, index) => ({
            product_id: parseInt(id),
            quantity: parseInt(quantities[index]),
            unit_price: parseFloat(unitPrices[index])
        }));

        const data = {
            customer_id: parseInt(formData.get('customer_id')),
            items: items,
            discount: parseFloat(formData.get('discount')) || 0,
            tax: parseFloat(formData.get('tax')) || 0,
            payment_method: formData.get('payment_method'),
            notes: formData.get('notes')
        };

        try {
            await fetchAPI('/orders', 'POST', data);
            showAlert('تم إنشاء الطلب بنجاح', 'success');
            closeModalFn();
            loadOrders();
        } catch (error) {
            showAlert('حدث خطأ: ' + error.message, 'error');
        }
    });

    showModal();
}

function addOrderItem() {
    const container = document.getElementById('order-items');
    const products = appState.data.products || [];

    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item';
    itemDiv.style.marginTop = '10px';
    itemDiv.innerHTML = `
        <select name="product_id[]" required style="width: 40%; display: inline-block;">
            <option value="">-- اختر المنتج --</option>
            ${products.map(p => `<option value="${p.id}" data-price="${p.price}">${p.name} - ${formatCurrency(p.price)}</option>`).join('')}
        </select>
        <input type="number" name="quantity[]" placeholder="الكمية" min="1" required style="width: 20%; display: inline-block;">
        <input type="number" name="unit_price[]" placeholder="السعر" step="0.01" required style="width: 30%; display: inline-block;">
    `;
    container.appendChild(itemDiv);
}

async function viewOrder(id) {
    const order = await fetchAPI(`/orders/${id}`);

    modalBody.innerHTML = `
        <h2>تفاصيل الطلب #${order.id}</h2>
        <div style="margin-bottom: 20px;">
            <p><strong>العميل:</strong> ${order.customer_name}</p>
            <p><strong>التاريخ:</strong> ${formatDate(order.order_date)}</p>
            <p><strong>الحالة:</strong> ${getStatusBadge(order.status)}</p>
            <p><strong>حالة الدفع:</strong> ${getPaymentStatusBadge(order.payment_status)}</p>
        </div>

        <h3>المنتجات</h3>
        <table>
            <thead>
                <tr>
                    <th>المنتج</th>
                    <th>الكمية</th>
                    <th>السعر</th>
                    <th>المجموع</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => `
                    <tr>
                        <td>${item.product_name}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.unit_price)}</td>
                        <td>${formatCurrency(item.subtotal)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top: 20px; text-align: left;">
            <p><strong>المجموع الفرعي:</strong> ${formatCurrency(order.total_amount)}</p>
            <p><strong>الخصم:</strong> ${formatCurrency(order.discount)}</p>
            <p><strong>الضريبة:</strong> ${formatCurrency(order.tax)}</p>
            <p style="font-size: 1.2rem; color: #667eea;"><strong>الإجمالي:</strong> ${formatCurrency(order.final_amount)}</p>
        </div>
    `;

    showModal();
}

async function deleteOrder(id) {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
        try {
            await fetchAPI(`/orders/${id}`, 'DELETE');
            showAlert('تم حذف الطلب بنجاح', 'success');
            loadOrders();
        } catch (error) {
            showAlert('حدث خطأ: ' + error.message, 'error');
        }
    }
}

// ===========================================
// إدارة الفواتير
// ===========================================
async function loadInvoices() {
    const invoices = await fetchAPI('/invoices');

    content.innerHTML = `
        <div class="table-container">
            <div class="table-header">
                <h2>قائمة الفواتير</h2>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>رقم الفاتورة</th>
                        <th>العميل</th>
                        <th>التاريخ</th>
                        <th>المبلغ الإجمالي</th>
                        <th>المبلغ المدفوع</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoices.map(inv => `
                        <tr>
                            <td>${inv.invoice_number}</td>
                            <td>${inv.customer_name}</td>
                            <td>${formatDate(inv.issue_date)}</td>
                            <td>${formatCurrency(inv.total_amount)}</td>
                            <td>${formatCurrency(inv.paid_amount || 0)}</td>
                            <td>${getPaymentStatusBadge(inv.status)}</td>
                            <td>
                                <button class="btn btn-info btn-sm" onclick="viewInvoice(${inv.id})">عرض</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function viewInvoice(id) {
    const invoice = await fetchAPI(`/invoices/${id}`);

    modalBody.innerHTML = `
        <h2>الفاتورة ${invoice.invoice_number}</h2>
        <div style="margin-bottom: 20px;">
            <p><strong>العميل:</strong> ${invoice.customer_name}</p>
            <p><strong>تاريخ الإصدار:</strong> ${formatDate(invoice.issue_date)}</p>
            <p><strong>الحالة:</strong> ${getPaymentStatusBadge(invoice.status)}</p>
        </div>

        <h3>المنتجات</h3>
        <table>
            <thead>
                <tr>
                    <th>المنتج</th>
                    <th>الكمية</th>
                    <th>السعر</th>
                    <th>المجموع</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                    <tr>
                        <td>${item.product_name}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.unit_price)}</td>
                        <td>${formatCurrency(item.subtotal)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top: 20px; text-align: left;">
            <p style="font-size: 1.2rem; color: #667eea;"><strong>الإجمالي:</strong> ${formatCurrency(invoice.total_amount)}</p>
            <p><strong>المبلغ المدفوع:</strong> ${formatCurrency(invoice.paid_amount || 0)}</p>
            <p><strong>المبلغ المتبقي:</strong> ${formatCurrency(invoice.total_amount - (invoice.paid_amount || 0))}</p>
        </div>
    `;

    showModal();
}

// ===========================================
// التقارير
// ===========================================
async function loadReports() {
    content.innerHTML = `
        <div class="stats-grid">
            <div class="table-container" style="grid-column: 1 / -1;">
                <div class="table-header">
                    <h2>التقارير</h2>
                </div>
                <div style="padding: 20px;">
                    <button class="btn btn-primary" onclick="showSalesReport()">تقرير المبيعات</button>
                    <button class="btn btn-info" onclick="showInventoryReport()">تقرير المخزون</button>
                    <button class="btn btn-success" onclick="showCustomerReport()">تقرير العملاء</button>
                    <button class="btn btn-warning" onclick="showProfitReport()">تقرير الأرباح</button>
                </div>
            </div>
        </div>
    `;
}

async function showSalesReport() {
    const report = await fetchAPI('/reports/sales');

    modalBody.innerHTML = `
        <h2>تقرير المبيعات</h2>
        <div style="margin-bottom: 20px;">
            <p><strong>عدد الطلبات:</strong> ${report.count}</p>
            <p><strong>إجمالي الإيرادات:</strong> ${formatCurrency(report.totals.totalRevenue)}</p>
            <p><strong>المبلغ المدفوع:</strong> ${formatCurrency(report.totals.paidRevenue)}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>رقم الطلب</th>
                    <th>العميل</th>
                    <th>التاريخ</th>
                    <th>المبلغ</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
                ${report.orders.slice(0, 10).map(o => `
                    <tr>
                        <td>#${o.id}</td>
                        <td>${o.customer_name}</td>
                        <td>${formatDate(o.order_date)}</td>
                        <td>${formatCurrency(o.final_amount)}</td>
                        <td>${getPaymentStatusBadge(o.payment_status)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    showModal();
}

async function showInventoryReport() {
    const report = await fetchAPI('/reports/inventory');

    modalBody.innerHTML = `
        <h2>تقرير المخزون</h2>
        <div style="margin-bottom: 20px;">
            <p><strong>عدد المنتجات:</strong> ${report.count}</p>
            <p><strong>قيمة المخزون الإجمالية:</strong> ${formatCurrency(report.totalValue)}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>المنتج</th>
                    <th>الفئة</th>
                    <th>الكمية</th>
                    <th>القيمة</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
                ${report.products.slice(0, 15).map(p => `
                    <tr>
                        <td>${p.name}</td>
                        <td>${p.category_name || '-'}</td>
                        <td>${p.stock_quantity}</td>
                        <td>${formatCurrency(p.inventory_value)}</td>
                        <td>
                            ${p.stock_status === 'out' ? '<span class="badge badge-danger">نفذ</span>' :
                              p.stock_status === 'low' ? '<span class="badge badge-warning">منخفض</span>' :
                              '<span class="badge badge-success">متوفر</span>'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    showModal();
}

async function showCustomerReport() {
    const customers = await fetchAPI('/reports/customers');

    modalBody.innerHTML = `
        <h2>تقرير العملاء</h2>
        <table>
            <thead>
                <tr>
                    <th>العميل</th>
                    <th>عدد الطلبات</th>
                    <th>إجمالي الإنفاق</th>
                    <th>آخر طلب</th>
                </tr>
            </thead>
            <tbody>
                ${customers.slice(0, 15).map(c => `
                    <tr>
                        <td>${c.name}</td>
                        <td>${c.order_count}</td>
                        <td>${formatCurrency(c.total_spent)}</td>
                        <td>${c.last_order_date ? formatDate(c.last_order_date) : 'لا يوجد'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    showModal();
}

async function showProfitReport() {
    const report = await fetchAPI('/reports/profit');

    modalBody.innerHTML = `
        <h2>تقرير الأرباح</h2>
        <div style="margin-bottom: 20px;">
            <p><strong>إجمالي الإيرادات:</strong> ${formatCurrency(report.totals.totalRevenue)}</p>
            <p><strong>إجمالي التكلفة:</strong> ${formatCurrency(report.totals.totalCost)}</p>
            <p style="font-size: 1.2rem; color: #28a745;"><strong>صافي الربح:</strong> ${formatCurrency(report.totals.totalProfit)}</p>
            <p><strong>هامش الربح:</strong> ${report.totals.profitMargin}%</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>رقم الطلب</th>
                    <th>العميل</th>
                    <th>الإيرادات</th>
                    <th>التكلفة</th>
                    <th>الربح</th>
                </tr>
            </thead>
            <tbody>
                ${report.orders.slice(0, 10).map(o => `
                    <tr>
                        <td>#${o.id}</td>
                        <td>${o.customer_name}</td>
                        <td>${formatCurrency(o.revenue)}</td>
                        <td>${formatCurrency(o.cost)}</td>
                        <td style="color: #28a745;">${formatCurrency(o.profit)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    showModal();
}

// ===========================================
// إدارة الفئات
// ===========================================
async function loadCategories() {
    const categories = await fetchAPI('/categories');

    content.innerHTML = `
        <div class="table-container">
            <div class="table-header">
                <h2>قائمة الفئات</h2>
                <button class="btn btn-primary" onclick="showCategoryForm()">إضافة فئة جديدة</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>الوصف</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${categories.map(c => `
                        <tr>
                            <td>${c.name}</td>
                            <td>${c.description || '-'}</td>
                            <td>
                                <button class="btn btn-info btn-sm" onclick='editCategory(${JSON.stringify(c)})'>تعديل</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteCategory(${c.id})">حذف</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function showCategoryForm(category = null) {
    const title = category ? 'تعديل الفئة' : 'إضافة فئة جديدة';
    const buttonText = category ? 'تحديث' : 'إضافة';

    modalBody.innerHTML = `
        <h2>${title}</h2>
        <form id="category-form">
            <div class="form-group">
                <label>اسم الفئة *</label>
                <input type="text" name="name" value="${category?.name || ''}" required>
            </div>
            <div class="form-group">
                <label>الوصف</label>
                <textarea name="description">${category?.description || ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">${buttonText}</button>
        </form>
    `;

    document.getElementById('category-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            if (category) {
                await fetchAPI(`/categories/${category.id}`, 'PUT', data);
                showAlert('تم تحديث الفئة بنجاح', 'success');
            } else {
                await fetchAPI('/categories', 'POST', data);
                showAlert('تم إضافة الفئة بنجاح', 'success');
            }
            closeModalFn();
            loadCategories();
        } catch (error) {
            showAlert('حدث خطأ: ' + error.message, 'error');
        }
    });

    showModal();
}

function editCategory(category) {
    showCategoryForm(category);
}

async function deleteCategory(id) {
    if (confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
        try {
            await fetchAPI(`/categories/${id}`, 'DELETE');
            showAlert('تم حذف الفئة بنجاح', 'success');
            loadCategories();
        } catch (error) {
            showAlert('حدث خطأ: ' + error.message, 'error');
        }
    }
}

// ===========================================
// وظائف مساعدة
// ===========================================
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'حدث خطأ');
    }

    return data.data;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ar-SA');
}

function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge badge-warning">معلق</span>',
        'processing': '<span class="badge badge-info">قيد التنفيذ</span>',
        'completed': '<span class="badge badge-success">مكتمل</span>',
        'cancelled': '<span class="badge badge-danger">ملغي</span>'
    };
    return badges[status] || status;
}

function getPaymentStatusBadge(status) {
    const badges = {
        'paid': '<span class="badge badge-success">مدفوع</span>',
        'unpaid': '<span class="badge badge-danger">غير مدفوع</span>',
        'partial': '<span class="badge badge-warning">مدفوع جزئياً</span>'
    };
    return badges[status] || status;
}

function showModal() {
    modal.style.display = 'block';
}

function closeModalFn() {
    modal.style.display = 'none';
}

function initModal() {
    closeModal.onclick = closeModalFn;
    window.onclick = (e) => {
        if (e.target === modal) {
            closeModalFn();
        }
    };
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.left = '50%';
    alertDiv.style.transform = 'translateX(-50%)';
    alertDiv.style.zIndex = '10000';
    alertDiv.style.minWidth = '300px';

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}
