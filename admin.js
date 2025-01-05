// Sample data
let mockData = {
    users: [
        { username: 'john_doe', email: 'john@example.com', joinDate: '2024-01-01' },
        { username: 'jane_smith', email: 'jane@example.com', joinDate: '2024-01-15' }
    ],
    exercises: [
        { title: 'Basic Typing', difficulty: 'easy', timesUsed: 150 },
        { title: 'Speed Challenge', difficulty: 'hard', timesUsed: 75 }
    ],
    stats: {
        totalUsers: 245,
        totalExercises: 15,
        avgWPM: 65,
        exercisesToday: 89,
        totalCompleted: 1520,
        avgAccuracy: 94
    }
};

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        // Update active nav item
        document.querySelector('.nav-item.active').classList.remove('active');
        item.classList.add('active');

        // Show corresponding section
        document.querySelector('.content-section.active').classList.remove('active');
        document.getElementById(item.dataset.section).classList.add('active');

        // Load section data
        loadSectionData(item.dataset.section);
    });
});

// Load section data
function loadSectionData(section) {
    switch (section) {
        case 'dashboard':
            updateDashboardStats();
            break;
        case 'users':
            populateUsersTable();
            break;
        case 'exercises':
            populateExercisesTable();
            break;
        case 'statistics':
            updateStatistics();
            break;
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    document.getElementById('totalUsers').textContent = mockData.stats.totalUsers;
    document.getElementById('totalExercises').textContent = mockData.stats.totalExercises;
    document.getElementById('avgWPM').textContent = mockData.stats.avgWPM;
    document.getElementById('exercisesToday').textContent = mockData.stats.exercisesToday;
}

// Populate users table
function populateUsersTable() {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';

    mockData.users.forEach(user => {
        const row = tbody.insertRow();
        row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.joinDate}</td>
                    <td>
                        <button class="btn btn-primary" onclick="editUser('${user.username}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteUser('${user.username}')">Delete</button>
                    </td>
                `;
    });
}

// Populate exercises table
function populateExercisesTable() {
    const tbody = document.querySelector('#exercisesTable tbody');
    tbody.innerHTML = '';

    mockData.exercises.forEach(exercise => {
        const row = tbody.insertRow();
        row.innerHTML = `
                    <td>${exercise.title}</td>
                    <td>${exercise.difficulty}</td>
                    <td>${exercise.timesUsed}</td>
                    <td>
                        <button class="btn btn-primary" onclick="editExercise('${exercise.title}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteExercise('${exercise.title}')">Delete</button>
                    </td>
                `;
    });
}

// Update statistics
function updateStatistics() {
    document.getElementById('totalCompleted').textContent = mockData.stats.totalCompleted;
    document.getElementById('avgAccuracy').textContent = mockData.stats.avgAccuracy + '%';
}

// Exercise form handling
document.getElementById('addExerciseBtn').addEventListener('click', () => {
    document.getElementById('exerciseForm').style.display = 'block';
});

document.getElementById('saveExerciseBtn').addEventListener('click', () => {
    const title = document.getElementById('exerciseTitle').value;
    const difficulty = document.getElementById('exerciseDifficulty').value;

    mockData.exercises.push({
        title: title,
        difficulty: difficulty,
        timesUsed: 0
    });

    populateExercisesTable();
    document.getElementById('exerciseForm').style.display = 'none';
});

// Initial load
updateDashboardStats();

// User management functions
function editUser(username) {
    alert(`Edit user: ${username}`);
}

function deleteUser(username) {
    if (confirm(`Are you sure you want to delete user: ${username}?`)) {
        mockData.users = mockData.users.filter(user => user.username !== username);
        populateUsersTable();
    }
}

// Exercise management functions
function editExercise(title) {
    alert(`Edit exercise: ${title}`);
}

function deleteExercise(title) {
    if (confirm(`Are you sure you want to delete exercise: ${title}?`)) {
        mockData.exercises = mockData.exercises.filter(exercise => exercise.title !== title);
        populateExercisesTable();
    }
}