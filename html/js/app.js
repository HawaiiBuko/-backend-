// API地址（需与后端端口一致）
const API_URL = '/api/contacts';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    loadContacts();
    // 绑定搜索框回车事件
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchContacts();
    });
    // 绑定按钮点击事件
    document.getElementById('searchBtn').addEventListener('click', searchContacts);
    document.getElementById('addBtn').addEventListener('click', showAddModal);
    
    // 绑定导入导出事件
    if (document.getElementById('export-btn')) {
        document.getElementById('export-btn').addEventListener('click', exportContacts);
    }
    // 当用户选择文件后自动导入
    if (document.getElementById('import-file')) {
        document.getElementById('import-file').addEventListener('change', function(e) {
            const fileNameSpan = document.getElementById('file-name');
            if (e.target.files.length > 0) {
                fileNameSpan.textContent = e.target.files[0].name;
                fileNameSpan.style.color = 'var(--primary)';
                importContacts(e.target.files[0]);
            } else {
                fileNameSpan.textContent = '未选择文件';
                fileNameSpan.style.color = 'var(--neutral)';
            }
        });
    }
    // 为导入文件输入框添加文件选择事件监听，显示文件名
    if (document.getElementById('import-file')) {
        document.getElementById('import-file').addEventListener('change', function(e) {
            const fileNameSpan = document.getElementById('file-name');
            if (e.target.files.length > 0) {
                fileNameSpan.textContent = e.target.files[0].name;
                fileNameSpan.style.color = 'var(--primary)';
            } else {
                fileNameSpan.textContent = '未选择文件';
                fileNameSpan.style.color = 'var(--neutral)';
            }
        });
    }
});

/**
 * 从后端加载所有联系人并显示
 */
function loadContacts() {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error('无法连接到后端服务，请检查后端是否启动');
            return response.json();
        })
        .then(contacts => {
            // 获取每个联系人的联系方式
            const promises = contacts.map(contact => {
                return fetch(`${API_URL}/${contact.id}/methods`)
                    .then(res => res.ok ? res.json() : [])
                    .then(methods => {
                        contact.methods = methods;
                        return contact;
                    });
            });
            return Promise.all(promises);
        })
        .then(contacts => {
            const container = document.getElementById('contactContainer');
            container.innerHTML = '';

            if (contacts.length === 0) {
                container.innerHTML = '<p class="no-contacts">暂无联系人，请添加第一个联系人吧！</p>';
                return;
            }

            // 生成联系人卡片
            contacts.forEach(contact => {
                container.appendChild(createContactCard(contact));
            });
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

/**
 * 创建联系人卡片元素
 * @param {Object} contact - 联系人数据
 * @returns {HTMLElement} 卡片元素
 */
function createContactCard(contact) {
    const card = document.createElement('div');
    card.className = 'contact-card';
    
    // 收藏状态
    const favoriteIcon = contact.is_favorite ? '★' : '☆';
    const favoriteClass = contact.is_favorite ? 'favorite-active' : '';
    
    let methodsHtml = '';
    if (contact.methods && contact.methods.length > 0) {
        methodsHtml = '<div class="extra-methods"><h4>其他联系方式</h4>';
        contact.methods.forEach(method => {
            const primaryText = method.is_primary ? '(主要)' : '';
            methodsHtml += `<p><i class="fa fa-${method.method_type === '手机' || method.method_type === '座机' ? 'phone' :
            method.method_type === '邮箱' ? 'envelope' :
            method.method_type === '微信' ? 'weixin' :
            method.method_type === 'QQ' ? 'qq' :
            method.method_type === '钉钉' ? 'comments' :
            method.method_type === '企业微信' ? 'weixin' :
            method.method_type === '微博' ? 'weibo' :
            method.method_type === 'LinkedIn' ? 'linkedin' :
            method.method_type === 'Skype' ? 'skype' :
            method.method_type === 'WhatsApp' ? 'whatsapp' :
            method.method_type === 'Telegram' ? 'telegram' :
            method.method_type === '网站' ? 'globe' : 'bookmark'}"></i> ${method.method_type}${primaryText}: ${method.method_value}</p>`;
        });
        methodsHtml += '</div>';
    }
    
    card.innerHTML = `
        <div class="card-header">
            <h3>${contact.name} <span class="favorite-icon ${favoriteClass}" onclick="toggleFavorite(${contact.id})" title="${contact.is_favorite ? '取消收藏' : '收藏'}">${favoriteIcon}</span></h3>
        </div>
        <div class="contact-info">
            <p><i class="fa fa-phone"></i> ${contact.phone}</p>
            <p><i class="fa fa-envelope"></i> ${contact.email || '未填写'}</p>
            <p><i class="fa fa-home"></i> ${contact.address || '未填写'}</p>
            ${methodsHtml}
        </div>
        <div class="contact-actions">
            <button class="edit-btn" onclick="showEditModal(${contact.id})">
                <i class="fa fa-pencil"></i> 编辑
            </button>
            <button class="delete-btn" onclick="deleteContact(${contact.id})">
                <i class="fa fa-trash"></i> 删除
            </button>
        </div>
    `;
    return card;
}

/**
 * 搜索联系人（按姓名或电话）
 */
function searchContacts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        loadContacts();
        return;
    }

    fetch(API_URL)
        .then(response => response.json())
        .then(contacts => {
            const filteredContacts = contacts.filter(contact => 
                contact.name.toLowerCase().includes(searchTerm) || 
                contact.phone.toLowerCase().includes(searchTerm)
            );
            
            // 获取过滤后联系人的联系方式
            const promises = filteredContacts.map(contact => {
                return fetch(`${API_URL}/${contact.id}/methods`)
                    .then(res => res.ok ? res.json() : [])
                    .then(methods => {
                        contact.methods = methods;
                        return contact;
                    });
            });
            return Promise.all(promises);
        })
        .then(contacts => {
            const container = document.getElementById('contactContainer');
            container.innerHTML = '';

            if (contacts.length === 0) {
                container.innerHTML = '<p class="no-contacts">没有找到匹配的联系人</p>';
                return;
            }

            contacts.forEach(contact => {
                container.appendChild(createContactCard(contact));
            });
        })
        .catch(error => {
            showNotification('搜索失败: ' + error.message, 'error');
        });
}

/**
 * 显示添加联系人弹窗
 */
function showAddModal() {
    // 重置表单
    document.getElementById('addForm').reset();
    
    // 重置联系方式
    const contactMethods = document.getElementById('add-contact-methods');
    contactMethods.innerHTML = `
        <h4>其他联系方式</h4>
        <div class="contact-method">
            <select name="add-method_type">
                <option value="手机">手机</option>
                <option value="座机">座机</option>
                <option value="邮箱">邮箱</option>
                <option value="微信">微信</option>
                <option value="QQ">QQ</option>
                <option value="钉钉">钉钉</option>
                <option value="企业微信">企业微信</option>
                <option value="微博">微博</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Skype">Skype</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telegram">Telegram</option>
                <option value="网站">网站</option>
                <option value="其他">其他</option>
            </select>
            <input type="text" name="add-method_value" placeholder="联系方式">
            <input type="checkbox" name="add-is_primary" value="1">主要
            <button type="button" class="remove-method">删除</button>
        </div>
    `;
    
    // 绑定添加联系方式按钮事件
    document.getElementById('add-method').onclick = addContactMethod;
    
    // 显示弹窗
    document.getElementById('addModal').style.display = 'flex';
}

/**
 * 添加新的联系方式输入项
 */
function addContactMethod() {
    const contactMethods = document.getElementById('add-contact-methods');
    const newMethod = document.createElement('div');
    newMethod.className = 'contact-method';
    newMethod.innerHTML = `
        <select name="add-method_type">
            <option value="手机">手机</option>
            <option value="座机">座机</option>
            <option value="邮箱">邮箱</option>
            <option value="微信">微信</option>
            <option value="QQ">QQ</option>
            <option value="钉钉">钉钉</option>
            <option value="企业微信">企业微信</option>
            <option value="微博">微博</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Skype">Skype</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Telegram">Telegram</option>
            <option value="网站">网站</option>
            <option value="其他">其他</option>
        </select>
        <input type="text" name="add-method_value" placeholder="联系方式">
        <input type="checkbox" name="add-is_primary" value="1">主要
        <button type="button" class="remove-method">删除</button>
    `;
    contactMethods.appendChild(newMethod);
    
    // 绑定删除按钮事件
    newMethod.querySelector('.remove-method').onclick = function() {
        this.closest('.contact-method').remove();
    };
}

/**
 * 隐藏添加联系人弹窗
 */
function hideAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

/**
 * 添加新联系人
 */
function addContact() {
    const newContact = {
        name: document.getElementById('addName').value.trim(),
        phone: document.getElementById('addPhone').value.trim(),
        email: document.getElementById('addEmail').value.trim(),
        address: document.getElementById('addAddress').value.trim(),
        is_favorite: document.getElementById('addFavorite').checked ? 1 : 0
    };

    // 验证必填字段
    if (!newContact.name || !newContact.phone) {
        showNotification('姓名和电话为必填项！', 'error');
        return;
    }

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newContact)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || '添加联系人失败');
            });
        }
        return response.json();
    })
    .then(contact => {
        // 添加其他联系方式
        const contactMethods = document.querySelectorAll('#add-contact-methods .contact-method');
        const methodPromises = [];
        
        contactMethods.forEach(method => {
            const methodType = method.querySelector('select[name="add-method_type"]').value;
            const methodValue = method.querySelector('input[name="add-method_value"]').value.trim();
            const isPrimary = method.querySelector('input[name="add-is_primary"]').checked ? 1 : 0;
            
            if (methodValue) {
                methodPromises.push(
                    fetch(`${API_URL}/${contact.id}/methods`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            method_type: methodType,
                            method_value: methodValue,
                            is_primary: isPrimary
                        })
                    })
                );
            }
        });
        
        return Promise.all(methodPromises).then(() => contact);
    })
    .then(() => {
        hideAddModal();
        loadContacts(); // 重新加载联系人列表
        showNotification('联系人添加成功！', 'success');
    })
    .catch(error => {
        showNotification(error.message, 'error');
    });
}

/**
 * 显示编辑联系人弹窗
 * @param {number} id - 联系人ID
 */
function showEditModal(id) {
    Promise.all([
        fetch(`${API_URL}/${id}`).then(response => {
            if (!response.ok) throw new Error('未找到该联系人');
            return response.json();
        }),
        fetch(`${API_URL}/${id}/methods`).then(response => response.ok ? response.json() : [])
    ])
    .then(([contact, methods]) => {
        // 填充表单
        document.getElementById('editId').value = contact.id;
        document.getElementById('editName').value = contact.name;
        document.getElementById('editPhone').value = contact.phone;
        document.getElementById('editEmail').value = contact.email || '';
        document.getElementById('editAddress').value = contact.address || '';
        document.getElementById('editFavorite').checked = contact.is_favorite;
        
        // 填充联系方式
        const contactMethodsDiv = document.getElementById('edit-contact-methods');
        contactMethodsDiv.innerHTML = '<h4>其他联系方式</h4>';
        
        if (methods.length > 0) {
            methods.forEach(method => {
                const methodDiv = document.createElement('div');
                methodDiv.className = 'contact-method';
                methodDiv.innerHTML = `
                    <select name="edit-method_type">
                        <option value="手机" ${method.method_type === '手机' ? 'selected' : ''}>手机</option>
                        <option value="座机" ${method.method_type === '座机' ? 'selected' : ''}>座机</option>
                        <option value="邮箱" ${method.method_type === '邮箱' ? 'selected' : ''}>邮箱</option>
                        <option value="微信" ${method.method_type === '微信' ? 'selected' : ''}>微信</option>
                        <option value="QQ" ${method.method_type === 'QQ' ? 'selected' : ''}>QQ</option>
                        <option value="钉钉" ${method.method_type === '钉钉' ? 'selected' : ''}>钉钉</option>
                        <option value="企业微信" ${method.method_type === '企业微信' ? 'selected' : ''}>企业微信</option>
                        <option value="微博" ${method.method_type === '微博' ? 'selected' : ''}>微博</option>
                        <option value="LinkedIn" ${method.method_type === 'LinkedIn' ? 'selected' : ''}>LinkedIn</option>
                        <option value="Skype" ${method.method_type === 'Skype' ? 'selected' : ''}>Skype</option>
                        <option value="WhatsApp" ${method.method_type === 'WhatsApp' ? 'selected' : ''}>WhatsApp</option>
                        <option value="Telegram" ${method.method_type === 'Telegram' ? 'selected' : ''}>Telegram</option>
                        <option value="网站" ${method.method_type === '网站' ? 'selected' : ''}>网站</option>
                        <option value="其他" ${method.method_type === '其他' ? 'selected' : ''}>其他</option>
                    </select>
                    <input type="text" name="edit-method_value" value="${method.method_value}" placeholder="联系方式">
                    <input type="checkbox" name="edit-is_primary" value="1" ${method.is_primary ? 'checked' : ''}>主要
                    <button type="button" class="remove-method">删除</button>
                `;
                contactMethodsDiv.appendChild(methodDiv);
            });
        } else {
            // 添加一个默认的联系方式
            const methodDiv = document.createElement('div');
            methodDiv.className = 'contact-method';
            methodDiv.innerHTML = `
                <select name="edit-method_type">
                    <option value="手机">手机</option>
                    <option value="座机">座机</option>
                    <option value="邮箱">邮箱</option>
                    <option value="微信">微信</option>
                    <option value="QQ">QQ</option>
                    <option value="其他">其他</option>
                </select>
                <input type="text" name="edit-method_value" placeholder="联系方式">
                <input type="checkbox" name="edit-is_primary" value="1">主要
                <button type="button" class="remove-method">删除</button>
            `;
            contactMethodsDiv.appendChild(methodDiv);
        }
        
        // 绑定添加联系方式按钮事件
        document.getElementById('edit-method').onclick = addEditContactMethod;
        
        // 绑定删除按钮事件
        document.querySelectorAll('.remove-method').forEach(btn => {
            btn.onclick = function() {
                this.closest('.contact-method').remove();
            };
        });
        
        // 显示弹窗
        document.getElementById('editModal').style.display = 'flex';
    })
    .catch(error => {
        showNotification(error.message, 'error');
    });
}

/**
 * 添加新的编辑联系方式输入项
 */
function addEditContactMethod() {
    const contactMethods = document.getElementById('edit-contact-methods');
    const newMethod = document.createElement('div');
    newMethod.className = 'contact-method';
    newMethod.innerHTML = `
        <select name="edit-method_type">
            <option value="手机">手机</option>
            <option value="座机">座机</option>
            <option value="邮箱">邮箱</option>
            <option value="微信">微信</option>
            <option value="QQ">QQ</option>
            <option value="钉钉">钉钉</option>
            <option value="企业微信">企业微信</option>
            <option value="微博">微博</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Skype">Skype</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Telegram">Telegram</option>
            <option value="网站">网站</option>
            <option value="其他">其他</option>
        </select>
        <input type="text" name="edit-method_value" placeholder="联系方式">
        <input type="checkbox" name="edit-is_primary" value="1">主要
        <button type="button" class="remove-method">删除</button>
    `;
    contactMethods.appendChild(newMethod);
    
    // 绑定删除按钮事件
    newMethod.querySelector('.remove-method').onclick = function() {
        this.closest('.contact-method').remove();
    };
}

/**
 * 隐藏编辑联系人弹窗
 */
function hideEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

/**
 * 更新联系人信息
 */
function updateContact() {
    const id = document.getElementById('editId').value;
    const updatedContact = {
        name: document.getElementById('editName').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        address: document.getElementById('editAddress').value.trim(),
        is_favorite: document.getElementById('editFavorite').checked ? 1 : 0
    };

    // 验证必填字段
    if (!updatedContact.name || !updatedContact.phone) {
        showNotification('姓名和电话为必填项！', 'error');
        return;
    }

    // 先更新联系人基本信息
    fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedContact)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || '更新联系人失败');
            });
        }
        return Promise.resolve();
    })
    .then(() => {
        // 删除所有旧的联系方式
        return fetch(`${API_URL}/${id}/methods`)
            .then(res => res.ok ? res.json() : [])
            .then(methods => {
                const deletePromises = methods.map(method => 
                    fetch(`${API_URL}/methods/${method.id}`, {
                        method: 'DELETE'
                    })
                );
                return Promise.all(deletePromises);
            });
    })
    .then(() => {
        // 添加新的联系方式
        const contactMethods = document.querySelectorAll('#edit-contact-methods .contact-method');
        const methodPromises = [];
        
        contactMethods.forEach(method => {
            const methodType = method.querySelector('select[name="edit-method_type"]').value;
            const methodValue = method.querySelector('input[name="edit-method_value"]').value.trim();
            const isPrimary = method.querySelector('input[name="edit-is_primary"]').checked ? 1 : 0;
            
            if (methodValue) {
                methodPromises.push(
                    fetch(`${API_URL}/${id}/methods`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            method_type: methodType,
                            method_value: methodValue,
                            is_primary: isPrimary
                        })
                    })
                );
            }
        });
        
        return Promise.all(methodPromises);
    })
    .then(() => {
        hideEditModal();
        loadContacts(); // 重新加载联系人列表
        showNotification('联系人更新成功！', 'success');
    })
    .catch(error => {
        showNotification(error.message, 'error');
    });
}

/**
 * 删除联系人
 * @param {number} id - 联系人ID
 */
function deleteContact(id) {
    if (confirm('确定要删除这个联系人吗？')) {
        fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                loadContacts(); // 重新加载联系人列表
                showNotification('联系人删除成功！', 'success');
            } else {
                throw new Error('删除联系人失败');
            }
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
    }
}

/**
 * 切换联系人收藏状态
 * @param {number} id - 联系人ID
 */
function toggleFavorite(id) {
    fetch(`${API_URL}/${id}/favorite`, {
        method: 'PUT'
    })
    .then(response => {
        if (response.ok) {
            loadContacts(); // 重新加载联系人列表
        } else {
            throw new Error('更新收藏状态失败');
        }
    })
    .catch(error => {
        showNotification(error.message, 'error');
    });
}

/**
 * 导出联系人
 */
function exportContacts() {
    window.location.href = `${API_URL}/export`;
    showNotification('正在导出联系人...', 'success');
}

/**
 * 导入联系人
 */
function importContacts() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('请选择要导入的Excel文件', 'error');
        return;
    }
    
    if (!file.name.endsWith('.xlsx')) {
        showNotification('只支持.xlsx格式的Excel文件', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    fetch(`${API_URL}/import`, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            showNotification('联系人导入成功！', 'success');
            loadContacts(); // 重新加载联系人列表
            fileInput.value = ''; // 清空文件输入
        } else {
            return response.json().then(data => {
                throw new Error(data.error || '导入联系人失败');
            });
        }
    })
    .catch(error => {
        showNotification(error.message, 'error');
    });
}

/**
 * 显示通知提示
 * @param {string} message - 提示内容
 * @param {string} type - 类型：'success' 或 'error'
 */
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.innerHTML = `
        <i class="fa fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    notification.className = 'notification ' + type;
    notification.style.display = 'flex';

    // 3秒后隐藏
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}