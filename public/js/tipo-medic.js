// TipoMedic related functions
document.addEventListener('DOMContentLoaded', () => {
    // Get authentication info
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        window.location.href = '/views/login.html';
        return;
    }
    
    // Setup navigation
    setupNavigation(token, user);
    
    // Get references to DOM elements
    const tipoMedicTable = document.getElementById('tipo-medic-table');
    const btnAddTipoMedic = document.getElementById('btn-add-tipo-medic');
    const tipoMedicForm = document.getElementById('tipo-medic-form');
    const tipoMedicModal = new bootstrap.Modal(document.getElementById('tipoMedicModal'));
    const adminActions = document.getElementById('admin-actions');
    
    // Show/hide admin actions based on user role
    if (user.role === 'usuario') {
        adminActions.style.display = 'none';
    } else {
        adminActions.style.display = 'block';
    }
    
    // Load TipoMedic data
    loadTipoMedics(token, tipoMedicTable, user);
    
    // Add event listener to "Add TipoMedic" button
    if (btnAddTipoMedic) {
        btnAddTipoMedic.addEventListener('click', () => {
            document.getElementById('tipoMedicModalLabel').textContent = 'Agregar Tipo de Medicamento';
            document.getElementById('isEditMode').value = 'false';
            document.getElementById('CodTipoMed').disabled = false;
            tipoMedicForm.reset();
            tipoMedicModal.show();
        });
    }
    
    // Add event listener to form submission
    if (tipoMedicForm) {
        tipoMedicForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const isEditMode = document.getElementById('isEditMode').value === 'true';
            
            if (isEditMode) {
                updateTipoMedic(token, tipoMedicForm, tipoMedicModal, tipoMedicTable, user);
            } else {
                saveTipoMedic(token, tipoMedicForm, tipoMedicModal, tipoMedicTable, user);
            }
        });
    }
});

// Load all TipoMedic records from the API
async function loadTipoMedics(token, tableElement, user) {
    try {
        const response = await fetch('/api/tipo-medic', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar los tipos de medicamentos');
        }
        
        const tipoMedics = await response.json();
        renderTipoMedicsTable(tipoMedics, tableElement, user);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos: ' + error.message);
    }
}

// Render TipoMedic data in the table
function renderTipoMedicsTable(tipoMedics, tableElement, user) {
    tableElement.innerHTML = '';
    
    tipoMedics.forEach(tipoMedic => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${tipoMedic.CodTipoMed}</td>
            <td>${tipoMedic.descripcion}</td>
            <td class="action-buttons">
                ${getActionButtons(tipoMedic, user)}
            </td>
        `;
        
        tableElement.appendChild(row);
    });
    
    // Add event listeners to action buttons after rendering
    addActionButtonListeners();
}

// Generate action buttons based on user role
function getActionButtons(tipoMedic, user) {
    if (user.role === 'administrador') {
        return `
            <button class="btn btn-sm btn-info btn-view" data-id="${tipoMedic.CodTipoMed}">Ver</button>
            <button class="btn btn-sm btn-warning btn-edit" data-id="${tipoMedic.CodTipoMed}">Editar</button>
            <button class="btn btn-sm btn-danger btn-delete" data-id="${tipoMedic.CodTipoMed}">Eliminar</button>
        `;
    } else if (user.role === 'moderador') {
        return `<button class="btn btn-sm btn-info btn-view" data-id="${tipoMedic.CodTipoMed}">Ver</button>`;
    } else {
        return `<button class="btn btn-sm btn-info btn-view" data-id="${tipoMedic.CodTipoMed}">Ver</button>`;
    }
}

// Add event listeners to action buttons
function addActionButtonListeners() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tipoMedicTable = document.getElementById('tipo-medic-table');
    const tipoMedicModal = new bootstrap.Modal(document.getElementById('tipoMedicModal'));
    
    // View button listeners
    document.querySelectorAll('.btn-view').forEach(button => {
        button.addEventListener('click', () => viewTipoMedic(button.dataset.id, token));
    });
    
    // Edit button listeners
    if (user.role === 'administrador') {
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', () => editTipoMedic(button.dataset.id, token, tipoMedicModal));
        });
        
        // Delete button listeners
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', () => {
                if (confirm('¿Está seguro de que desea eliminar este tipo de medicamento?')) {
                    deleteTipoMedic(button.dataset.id, token, tipoMedicTable, user);
                }
            });
        });
    }
}

// View TipoMedic details
async function viewTipoMedic(id, token) {
    try {
        const response = await fetch(`/api/tipo-medic/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar los detalles del tipo de medicamento');
        }
        
        const tipoMedic = await response.json();
        
        // Display details in a modal or alert
        alert(`Código: ${tipoMedic.CodTipoMed}\nDescripción: ${tipoMedic.descripcion}`);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles: ' + error.message);
    }
}

// Load TipoMedic data for editing
async function editTipoMedic(id, token, modal) {
    try {
        const response = await fetch(`/api/tipo-medic/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar los datos del tipo de medicamento');
        }
        
        const tipoMedic = await response.json();
        
        // Fill form with TipoMedic data
        document.getElementById('tipoMedicModalLabel').textContent = 'Editar Tipo de Medicamento';
        document.getElementById('CodTipoMed').value = tipoMedic.CodTipoMed;
        document.getElementById('CodTipoMed').disabled = true; // Disable primary key editing
        document.getElementById('descripcion').value = tipoMedic.descripcion;
        document.getElementById('isEditMode').value = 'true';
        
        // Show modal
        modal.show();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos: ' + error.message);
    }
}

// Save new TipoMedic
async function saveTipoMedic(token, form, modal, tableElement, user) {
    const formData = {
        CodTipoMed: document.getElementById('CodTipoMed').value,
        descripcion: document.getElementById('descripcion').value
    };
    
    try {
        const response = await fetch('/api/tipo-medic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar el tipo de medicamento');
        }
        
        // Hide modal and reload data
        modal.hide();
        loadTipoMedics(token, tableElement, user);
        
        // Show success message
        alert('Tipo de medicamento guardado exitosamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar: ' + error.message);
    }
}

// Update existing TipoMedic
async function updateTipoMedic(token, form, modal, tableElement, user) {
    const id = document.getElementById('CodTipoMed').value;
    
    const formData = {
        descripcion: document.getElementById('descripcion').value
    };
    
    try {
        const response = await fetch(`/api/tipo-medic/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar el tipo de medicamento');
        }
        
        // Hide modal and reload data
        modal.hide();
        loadTipoMedics(token, tableElement, user);
        
        // Show success message
        alert('Tipo de medicamento actualizado exitosamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar: ' + error.message);
    }
}

// Delete TipoMedic
async function deleteTipoMedic(id, token, tableElement, user) {
    try {
        const response = await fetch(`/api/tipo-medic/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al eliminar el tipo de medicamento');
        }
        
        // Reload data
        loadTipoMedics(token, tableElement, user);
        
        // Show success message
        alert('Tipo de medicamento eliminado exitosamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar: ' + error.message);
    }
}
