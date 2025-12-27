// Analytics Dashboard JavaScript

let servicesChart = null;
let revenueChart = null;

// Load analytics data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAnalyticsData();
});

async function loadAnalyticsData() {
    try {
        const response = await fetch('/admin/analytics/data');
        const data = await response.json();
        
        // Update statistics
        updateStatistics(data.statistics);
        
        // Load charts
        renderServicesChart(data.most_booked_services);
        renderRevenueChart(data.revenue_trends);
        
        // Load top providers
        loadTopProviders(data.top_providers);
        
    } catch (error) {
        console.error('Error loading analytics data:', error);
        document.getElementById('providers-content').innerHTML = 
            '<div class="alert alert-danger">Error loading analytics data. Please try again.</div>';
    }
}

function updateStatistics(stats) {
    document.getElementById('total-bookings').textContent = stats.total_bookings.toLocaleString();
    document.getElementById('total-revenue').textContent = '৳' + stats.total_revenue.toLocaleString();
    document.getElementById('total-providers').textContent = stats.total_providers;
    document.getElementById('active-promotions').textContent = stats.active_promotions;
}

function renderServicesChart(servicesData) {
    const ctx = document.getElementById('servicesChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (servicesChart) {
        servicesChart.destroy();
    }
    
    const labels = servicesData.map(item => item.service || 'Unknown');
    const counts = servicesData.map(item => item.count);
    
    servicesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Bookings',
                data: counts,
                backgroundColor: 'rgba(67, 97, 238, 0.6)',
                borderColor: 'rgba(67, 97, 238, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function renderRevenueChart(revenueData) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (revenueChart) {
        revenueChart.destroy();
    }
    
    // Sort by date
    revenueData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = revenueData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const revenues = revenueData.map(item => item.revenue);
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue (৳)',
                data: revenues,
                borderColor: 'rgba(6, 214, 160, 1)',
                backgroundColor: 'rgba(6, 214, 160, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '৳' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function loadTopProviders(providers) {
    const content = document.getElementById('providers-content');
    
    if (providers.length === 0) {
        content.innerHTML = '<p class="text-muted">No provider data available.</p>';
        return;
    }
    
    content.innerHTML = `
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
                        <td><strong>#${index + 1}</strong></td>
                        <td><strong>${provider.name || 'Unknown'}</strong></td>
                        <td>${provider.service_type || 'N/A'}</td>
                        <td>
                            <span style="color: #ffd60a;">
                                ${'★'.repeat(Math.floor(provider.rating || 0))}${'☆'.repeat(5 - Math.floor(provider.rating || 0))}
                            </span>
                            ${(provider.rating || 0).toFixed(1)}
                        </td>
                        <td>${provider.bookings || 0}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function exportReport() {
    try {
        const response = await fetch('/admin/analytics/export');
        const data = await response.json();
        
        // Create a blob and download
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert('Report exported successfully!');
    } catch (error) {
        console.error('Error exporting report:', error);
        alert('Error exporting report. Please try again.');
    }
}

