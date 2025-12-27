let allPromotions = [];
let allProviders = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProviders();
    loadPromotions();
    setupFormSubmission();
    setupModalClose();
});

// Load providers for dropdown
async function loadProviders() {
    try {
        const response = await fetch('/admin/api/providers');
        const data = await response.json();
        
        if (data.success) {
            allProviders = data.providers;
            populateProviderDropdown();
        }
    } catch (error) {
        console.error('Error loading providers:', error);
        showAlert('Failed to load providers', 'error');
    }
}

function populateProviderDropdown() {
    const select = document.getElementById('provider-select');
    select.innerHTML = '<option value="">Select Provider</option>';
    
    allProviders.forEach(provider => {
        const option = document.createElement('option');
        option.value = provider.id;
        option.textContent = `${provider.name} (${provider.service_type})`;
        select.appendChild(option);
    });
}

// Load all promotions
async function loadPromotions() {
    const container = document.getElementById('promotions-table');
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const response = await fetch('/admin/api/promotions');
        const data = await response.json();
        
        if (data.success) {
            allPromotions = data.promotions;
            renderPromotions();
            updateStatistics();
        } else {
            throw new Error(data.error || 'Failed to load promotions');
        }
    } catch (error) {
        console.error('Error loading promotions:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Promotions</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function renderPromotions() {
    const container = document.getElementById('promotions-table');
    
    if (allPromotions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bullhorn"></i>
                <h3>No Promotions Yet</h3>
                <p>Create your first promotion to get started</p>
            </div>
        `;
        return;
    }
    
    const html = `
        <table class="table-custom">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Provider</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Performance</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${allPromotions.map(promo => `
                    <tr>
                        <td><strong>#${promo.id}</strong></td>
                        <td>${promo.provider_name}</td>
                        <td><span class="badge-custom badge-${promo.promotion_type}">${promo.promotion_type}</span></td>
                        <td>${promo.title}</td>
                        <td>
                            <small>
                                ${formatDate(promo.start_date)} to<br>
                                ${formatDate(promo.end_date)}
                            </small>
                        </td>
                        <td><span class="badge-custom badge-${promo.status}">${promo.status}</span></td>
                        <td><strong>৳${promo.price.toLocaleString()}</strong></td>
                        <td>
                            <small>
                                <i class="fas fa-eye"></i> ${promo.impressions.toLocaleString()}<br>
                                <i class="fas fa-mouse-pointer"></i> ${promo.clicks.toLocaleString()}
                            </small>
                        </td>
                        <td>
                            <button class="action-btn action-btn-edit" onclick="editPromotion(${promo.id})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn action-btn-delete" onclick="deletePromotion(${promo.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function updateStatistics() {
    const totalPromos = allPromotions.length;
    const activePromos = allPromotions.filter(p => p.status === 'active').length;
    const totalImpressions = allPromotions.reduce((sum, p) => sum + p.impressions, 0);
    const totalClicks = allPromotions.reduce((sum, p) => sum + p.clicks, 0);
    
    document.getElementById('total-promotions').textContent = totalPromos;
    document.getElementById('active-promos').textContent = activePromos;
    document.getElementById('total-impressions').textContent = totalImpressions.toLocaleString();
    document.getElementById('total-clicks').textContent = totalClicks.toLocaleString();
}

// Modal functions
function openCreateModal() {
    document.getElementById('createModal').style.display = 'block';
    setMinDate();
}

function closeCreateModal() {
    document.getElementById('createModal').style.display = 'none';
    document.getElementById('promotionForm').reset();
}

function setupModalClose() {
    window.onclick = function(event) {
        const modal = document.getElementById('createModal');
        if (event.target === modal) {
            closeCreateModal();
        }
    }
}

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('start-date').min = today;
    document.getElementById('end-date').min = today;
}

// Form submission
function setupFormSubmission() {
    document.getElementById('promotionForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            provider_id: parseInt(document.getElementById('provider-select').value),
            promotion_type: document.getElementById('promo-type').value,
            title: document.getElementById('promo-title').value,
            description: document.getElementById('promo-desc').value,
            start_date: document.getElementById('start-date').value,
            end_date: document.getElementById('end-date').value,
            price: parseFloat(document.getElementById('promo-price').value)
        };
        
        // Validate dates
        if (new Date(formData.end_date) <= new Date(formData.start_date)) {
            showAlert('End date must be after start date', 'error');
            return;
        }
        
        try {
            const response = await fetch('/admin/api/promotions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showAlert('Promotion created successfully!', 'success');
                closeCreateModal();
                loadPromotions();
            } else {
                throw new Error(data.error || 'Failed to create promotion');
            }
        } catch (error) {
            console.error('Error creating promotion:', error);
            showAlert(error.message, 'error');
        }
    });
}

// Edit promotion
async function editPromotion(id) {
    const promo = allPromotions.find(p => p.id === id);
    if (!promo) return;
    
    // Populate form with existing data
    document.getElementById('provider-select').value = promo.provider_id;
    document.getElementById('promo-type').value = promo.promotion_type;
    document.getElementById('promo-title').value = promo.title;
    document.getElementById('promo-desc').value = promo.description;
    document.getElementById('start-date').value = promo.start_date;
    document.getElementById('end-date').value = promo.end_date;
    document.getElementById('promo-price').value = promo.price;
    
    openCreateModal();
    
    // Change form behavior to update instead of create
    const form = document.getElementById('promotionForm');
    form.onsubmit = async function(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('promo-title').value,
            description: document.getElementById('promo-desc').value,
            price: parseFloat(document.getElementById('promo-price').value)
        };
        
        try {
            const response = await fetch(`/admin/api/promotions/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showAlert('Promotion updated successfully!', 'success');
                closeCreateModal();
                loadPromotions();
                setupFormSubmission(); // Reset to create mode
            } else {
                throw new Error(data.error || 'Failed to update promotion');
            }
        } catch (error) {
            console.error('Error updating promotion:', error);
            showAlert(error.message, 'error');
        }
    };
}

// Delete promotion
async function deletePromotion(id) {
    if (!confirm('Are you sure you want to delete this promotion? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/admin/api/promotions/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Promotion deleted successfully!', 'success');
            loadPromotions();
        } else {
            throw new Error(data.error || 'Failed to delete promotion');
        }
    } catch (error) {
        console.error('Error deleting promotion:', error);
        showAlert(error.message, 'error');
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-message alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    const header = document.querySelector('.header');
    header.parentNode.insertBefore(alertDiv, header.nextSibling);
    
    setTimeout(() => {
        alertDiv.style.animation = 'fadeOut 0.3s';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
`;
document.head.appendChild(style);