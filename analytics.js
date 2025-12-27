// Global variables
let analyticsData = null;
let servicesChart = null;
let revenueChart = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAnalyticsData();
});

// Load analytics data from API
async function loadAnalyticsData() {
    try {
        const response = await fetch('/admin/api/analytics');
        const result = await response.json();
        
        if (result.success) {
            analyticsData = result.data;
            renderAllAnalytics();
        } else {
            throw new Error(result.error || 'Failed to load analytics');
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        showError('Failed to load analytics data');
    }
}

// Render all analytics components
function renderAllAnalytics() {
    updateStatistics();
    renderTopProviders();
    renderServicesChart();
    renderRevenueChart();
}

// Update statistics cards
function updateStatistics() {
    const stats = analyticsData.statistics;
    
    document.getElementById('total-bookings').textContent = stats.total_bookings.toLocaleString();
    document.getElementById('total-revenue').textContent = '৳' + stats.total_revenue.toLocaleString();
    document.getElementById('total-providers').textContent = stats.total_providers;
    document.getElementById('active-promotions').textContent = stats.active_promotions;
}

// Render top providers table
function renderTopProviders() {
    const container = document.getElementById('providers-table');
    const providers = analyticsData.top_providers;
    
    if (providers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No Provider Data</h3>
                <p>Provider data will appear here once bookings are made</p>
            </div>
        `;
        return;
    }
    
    const html = `
        <table class="table-custom">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Provider Name</th>
                    <th>Service Type</th>
                    <th>Rating</th>
                    <th>Total Bookings</th>
                </tr>
            </thead>
            <tbody>
                ${providers.map((provider, index) => `
                    <tr>
                        <td>
                            <strong style="font-size: 18px; color: ${getRankColor(index)};">
                                #${index + 1}
                            </strong>
                        </td>
                        <td>
                            <strong>${provider.name}</strong>
                            ${index < 3 ? `<i class="fas fa-trophy" style="color: ${getRankColor(index)};"></i>` : ''}
                        </td>
                        <td>
                            <span class="badge-custom badge-active">${provider.service_type}</span>
                        </td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 5px;">
                                <span style="color: #ffd60a; font-size: 16px;">
                                    ${generateStars(provider.rating)}
                                </span>
                                <strong>${provider.rating.toFixed(1)}</strong>
                            </div>
                        </td>
                        <td>
                            <strong style="color: var(--primary);">${provider.bookings}</strong> bookings
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// Render most booked services chart
function renderServicesChart() {
    const ctx = document.getElementById('servicesCanvas');
    const services = analyticsData.most_booked_services;
    
    if (servicesChart) {
        servicesChart.destroy();
    }
    
    servicesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: services.map(s => s.service),
            datasets: [{
                label: 'Number of Bookings',
                data: services.map(s => s.count),
                backgroundColor: [
                    'rgba(67, 97, 238, 0.8)',
                    'rgba(6, 214, 160, 0.8)',
                    'rgba(239, 71, 111, 0.8)',
                    'rgba(255, 214, 10, 0.8)',
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(244, 67, 54, 0.8)',
                    'rgba(33, 150, 243, 0.8)',
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(156, 39, 176, 0.8)'
                ],
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return `Bookings: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Render revenue trends chart
function renderRevenueChart() {
    const ctx = document.getElementById('revenueCanvas');
    const revenue = analyticsData.revenue_trends;
    
    if (revenueChart) {
        revenueChart.destroy();
    }
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: revenue.map(r => formatDate(r.date)),
            datasets: [{
                label: 'Revenue (৳)',
                data: revenue.map(r => r.revenue),
                borderColor: 'rgba(67, 97, 238, 1)',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: 'rgba(67, 97, 238, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 13,
                            weight: '600'
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return `Revenue: ৳${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return '৳' + value.toLocaleString();
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Export report function
async function exportReport() {
    try {
        const response = await fetch('/admin/api/analytics/export');
        const data = await response.json();
        
        if (data.success) {
            // Create downloadable JSON file
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showAlert('Report exported successfully!', 'success');
        } else {
            throw new Error(data.error || 'Failed to export report');
        }
    } catch (error) {
        console.error('Error exporting report:', error);
        showAlert(error.message, 'error');
    }
}

// Utility functions
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '⯨' : '') + 
           '☆'.repeat(emptyStars);
}

function getRankColor(index) {
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
    return colors[index] || '#6c757d';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
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

function showError(message) {
    showAlert(message, 'error');
}

// Refresh analytics on demand
function refreshAnalytics() {
    loadAnalyticsData();
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