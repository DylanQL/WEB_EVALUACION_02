// Medicamentos related functions
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
    const medicamentosTable = document.getElementById('medicamentos-table');
    const btnAddMedicamento = document.getElementById('btn-add-medicamento');
    const medicamentoForm = document.getElementById('medicamento-form');
    const medicamentoModal = new bootstrap.Modal(document.getElementById('medicamentoModal'));
    const adminActions = document.getElementById('admin-actions');
    
    // Show/hide admin actions based on user role
    if (user.role === 'usuario') {
        adminActions.style.display = 'none';
    } else {
        adminActions.style.display = 'block';
    }
    
    // Load Medicamentos data
    loadMedicamentos(token, medicamentosTable, user);
    
    // Load TipoMedic options for dropdown
    loadTipoMedicOptions(token);
    
    // Add event listener to "Add Medicamento" button
    if (btnAddMedicamento) {
        btnAddMedicamento.addEventListener('click', () => {
            document.getElementById('medicamentoModalLabel').textContent = 'Agregar Medicamento';
            document.getElementById('isEditMode').value = 'false';
            document.getElementById('CodMedicamento').disabled = false;
            medicamentoForm.reset();
            medicamentoModal.show();
        });
    }
    
    // Add event listener to form submission
    if (medicamentoForm) {
        medicamentoForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const isEditMode = document.getElementById('isEditMode').value === 'true';
            
            if (isEditMode) {
                updateMedicamento(token, medicamentoForm, medicamentoModal, medicamentosTable, user);
            } else {
                saveMedicamento(token, medicamentoForm, medicamentoModal, medicamentosTable, user);
            }
        });
    }
});

// Load all Medicamentos from the API
async function loadMedicamentos(token, tableElement, user) {
    try {
        const response = await fetch('/api/medicamentos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar los medicamentos');
        }
        
        const medicamentos = await response.json();
        renderMedicamentosTable(medicamentos, tableElement, user);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos: ' + error.message);
    }
}

// Render Medicamentos data in the table
function renderMedicamentosTable(medicamentos, tableElement, user) {
    tableElement.innerHTML = '';
    
    medicamentos.forEach(medicamento => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${medicamento.CodMedicamento}</td>
            <td>${medicamento.descripcionMed}</td>
            <td>${formatDate(medicamento.fechaFabricacion)}</td>
            <td>${formatDate(medicamento.fechaVencimiento)}</td>
            <td>${medicamento.presentacion}</td>
            <td>${medicamento.stock}</td>
            <td>${medicamento.precioVentaUni}</td>
            <td>${medicamento.precioVentaPres}</td>
            <td>${medicamento.marca}</td>
            <td>${medicamento.TipoMedic ? medicamento.TipoMedic.descripcion : medicamento.CodTipoMed}</td>
            <td class="action-buttons">
                ${getActionButtons(medicamento, user)}
            </td>
        `;
        
        tableElement.appendChild(row);
    });
    
    // Add event listeners to action buttons after rendering
    addActionButtonListeners();
}

// Generate action buttons based on user role
function getActionButtons(medicamento, user) {
    if (user.role === 'administrador') {
        return `
            <button class="btn btn-sm btn-info btn-view" data-id="${medicamento.CodMedicamento}">Ver</button>
            <button class="btn btn-sm btn-warning btn-edit" data-id="${medicamento.CodMedicamento}">Editar</button>
            <button class="btn btn-sm btn-danger btn-delete" data-id="${medicamento.CodMedicamento}">Eliminar</button>
        `;
    } else if (user.role === 'moderador') {
        return `<button class="btn btn-sm btn-info btn-view" data-id="${medicamento.CodMedicamento}">Ver</button>`;
    } else {
        return `<button class="btn btn-sm btn-info btn-view" data-id="${medicamento.CodMedicamento}">Ver</button>`;
    }
}

// Load TipoMedic options for dropdown
async function loadTipoMedicOptions(token) {
    const selectElement = document.getElementById('CodTipoMed');
    if (!selectElement) return;
    
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
        
        // Clear existing options
        selectElement.innerHTML = '<option value="" disabled selected>Seleccione un tipo</option>';
        
        // Add options to dropdown
        tipoMedics.forEach(tipoMedic => {
            const option = document.createElement('option');
            option.value = tipoMedic.CodTipoMed;
            option.textContent = `${tipoMedic.CodTipoMed} - ${tipoMedic.descripcion}`;
            selectElement.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los tipos de medicamentos: ' + error.message);
    }
}

// Add event listeners to action buttons
function addActionButtonListeners() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const medicamentosTable = document.getElementById('medicamentos-table');
    const medicamentoModal = new bootstrap.Modal(document.getElementById('medicamentoModal'));
    
    // View button listeners
    document.querySelectorAll('.btn-view').forEach(button => {
        button.addEventListener('click', () => viewMedicamento(button.dataset.id, token));
    });
    
    // Edit button listeners
    if (user.role === 'administrador') {
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', () => editMedicamento(button.dataset.id, token, medicamentoModal));
        });
        
        // Delete button listeners
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', () => {
                if (confirm('¿Está seguro de que desea eliminar este medicamento?')) {
                    deleteMedicamento(button.dataset.id, token, medicamentosTable, user);
                }
            });
        });
    }
}

// View Medicamento details
async function viewMedicamento(id, token) {
    try {
        const response = await fetch(`/api/medicamentos/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar los detalles del medicamento');
        }
        
        const medicamento = await response.json();
        
        // Display details in a modal or alert
        const details = `
            Código: ${medicamento.CodMedicamento}
            Descripción: ${medicamento.descripcionMed}
            Fabricación: ${formatDate(medicamento.fechaFabricacion)}
            Vencimiento: ${formatDate(medicamento.fechaVencimiento)}
            Presentación: ${medicamento.presentacion}
            Stock: ${medicamento.stock}
            Precio Unitario: ${medicamento.precioVentaUni}
            Precio Presentación: ${medicamento.precioVentaPres}
            Marca: ${medicamento.marca}
            Tipo: ${medicamento.TipoMedic ? medicamento.TipoMedic.descripcion : medicamento.CodTipoMed}
        `;
        
        alert(details);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles: ' + error.message);
    }
}

// Load Medicamento data for editing
async function editMedicamento(id, token, modal) {
    try {
        const response = await fetch(`/api/medicamentos/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar los datos del medicamento');
        }
        
        const medicamento = await response.json();
        
        // Format dates for input fields
        const formatInputDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };
        
        // Fill form with Medicamento data
        document.getElementById('medicamentoModalLabel').textContent = 'Editar Medicamento';
        document.getElementById('CodMedicamento').value = medicamento.CodMedicamento;
        document.getElementById('CodMedicamento').disabled = true; // Disable primary key editing
        document.getElementById('descripcionMed').value = medicamento.descripcionMed;
        document.getElementById('fechaFabricacion').value = formatInputDate(medicamento.fechaFabricacion);
        document.getElementById('fechaVencimiento').value = formatInputDate(medicamento.fechaVencimiento);
        document.getElementById('presentacion').value = medicamento.presentacion;
        document.getElementById('stock').value = medicamento.stock;
        document.getElementById('precioVentaUni').value = medicamento.precioVentaUni;
        document.getElementById('precioVentaPres').value = medicamento.precioVentaPres;
        document.getElementById('marca').value = medicamento.marca;
        document.getElementById('CodTipoMed').value = medicamento.CodTipoMed;
        document.getElementById('isEditMode').value = 'true';
        
        // Show modal
        modal.show();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos: ' + error.message);
    }
}

// Save new Medicamento
async function saveMedicamento(token, form, modal, tableElement, user) {
    const formData = {
        CodMedicamento: document.getElementById('CodMedicamento').value,
        descripcionMed: document.getElementById('descripcionMed').value,
        fechaFabricacion: document.getElementById('fechaFabricacion').value,
        fechaVencimiento: document.getElementById('fechaVencimiento').value,
        presentacion: document.getElementById('presentacion').value,
        stock: document.getElementById('stock').value,
        precioVentaUni: document.getElementById('precioVentaUni').value,
        precioVentaPres: document.getElementById('precioVentaPres').value,
        marca: document.getElementById('marca').value,
        CodTipoMed: document.getElementById('CodTipoMed').value
    };
    
    // Basic form validation
    if (!validateMedicamentoForm(formData)) {
        return;
    }
    
    try {
        const response = await fetch('/api/medicamentos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar el medicamento');
        }
        
        // Hide modal and reload data
        modal.hide();
        loadMedicamentos(token, tableElement, user);
        
        // Show success message
        alert('Medicamento guardado exitosamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar: ' + error.message);
    }
}

// Update existing Medicamento
async function updateMedicamento(token, form, modal, tableElement, user) {
    const id = document.getElementById('CodMedicamento').value;
    
    const formData = {
        descripcionMed: document.getElementById('descripcionMed').value,
        fechaFabricacion: document.getElementById('fechaFabricacion').value,
        fechaVencimiento: document.getElementById('fechaVencimiento').value,
        presentacion: document.getElementById('presentacion').value,
        stock: document.getElementById('stock').value,
        precioVentaUni: document.getElementById('precioVentaUni').value,
        precioVentaPres: document.getElementById('precioVentaPres').value,
        marca: document.getElementById('marca').value,
        CodTipoMed: document.getElementById('CodTipoMed').value
    };
    
    // Basic form validation
    if (!validateMedicamentoForm(formData)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/medicamentos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar el medicamento');
        }
        
        // Hide modal and reload data
        modal.hide();
        loadMedicamentos(token, tableElement, user);
        
        // Show success message
        alert('Medicamento actualizado exitosamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar: ' + error.message);
    }
}

// Delete Medicamento
async function deleteMedicamento(id, token, tableElement, user) {
    try {
        const response = await fetch(`/api/medicamentos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al eliminar el medicamento');
        }
        
        // Reload data
        loadMedicamentos(token, tableElement, user);
        
        // Show success message
        alert('Medicamento eliminado exitosamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar: ' + error.message);
    }
}

// Form validation
function validateMedicamentoForm(formData) {
    // Check required fields
    for (const key in formData) {
        if (formData[key] === '') {
            alert('Todos los campos son requeridos');
            return false;
        }
    }
    
    // Validate dates
    const fabricacion = new Date(formData.fechaFabricacion);
    const vencimiento = new Date(formData.fechaVencimiento);
    
    if (vencimiento <= fabricacion) {
        alert('La fecha de vencimiento debe ser posterior a la fecha de fabricación');
        return false;
    }
    
    // Validate numeric fields
    if (isNaN(formData.stock) || parseInt(formData.stock) < 0) {
        alert('El stock debe ser un número no negativo');
        return false;
    }
    
    if (isNaN(formData.precioVentaUni) || parseFloat(formData.precioVentaUni) <= 0) {
        alert('El precio de venta unitario debe ser un número positivo');
        return false;
    }
    
    if (isNaN(formData.precioVentaPres) || parseFloat(formData.precioVentaPres) <= 0) {
        alert('El precio de venta por presentación debe ser un número positivo');
        return false;
    }
    
    return true;
}
