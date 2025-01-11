
let isLoginMode = true;
let currentUser = null;
// Initialize local storage with default data if empty
function initializeLocalStorage() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([
            {
                username: 'john_doe', password: '1234', email: 'john@example.com', joinDate: '2024-01-01', isAdmin: false,
                lastLogin: null,
                loginCount: 0
            },
            {
                username: 'jane_smith', password: '12345', email: 'jane@example.com', joinDate: '2024-01-15', isAdmin: false,
                lastLogin: null,
                loginCount: 0
            },
            {
                username: 'amine',
                password: 'admin123',
                email: 'admin@example.com',
                joinDate: '2024-01-01',
                isAdmin: true,
                lastLogin: null,
                loginCount: 0
            }
        ]));
    }

    if (!localStorage.getItem('statistics')) {
        localStorage.setItem('statistics', JSON.stringify({
            totalUsers: 3,
            totalExercises: 15,
            avgWPM: 65,
            exercisesToday: 89,
            totalCompleted: 1520,
            avgAccuracy: 94,
            activeUsers: 0,
            todayLogins: 0
        }));
    }

    if (!localStorage.getItem('exercises')) {
        localStorage.setItem('exercises', JSON.stringify([
            {
                id: '1',
                title: 'Basic Typing',
                content: 'The quick brown fox jumps over the lazy dog.',
                difficulty: 'easy',
                timesUsed: 150,
                dateCreated: '2024-01-01T00:00:00.000Z',
                lastModified: '2024-01-01T00:00:00.000Z'
            },
            {
                id: '2',
                title: 'Speed Challenge',
                content: 'Pack my box with five dozen liquor jugs.',
                difficulty: 'hard',
                timesUsed: 75,
                dateCreated: '2024-01-01T00:00:00.000Z',
                lastModified: '2024-01-01T00:00:00.000Z'
            }
        ]));
    }
}
// Toggle between login and register modes
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('authTitle').textContent = isLoginMode ? 'Login' : 'Register';
    document.getElementById('authButton').textContent = isLoginMode ? 'Login' : 'Register';
    document.getElementById('authToggle').textContent = isLoginMode ?
        "Don't have an account? Register" : "Already have an account? Login";
    document.getElementById('registerFields').style.display = isLoginMode ? 'none' : 'block';
    document.getElementById('authError').textContent = '';
}

// Handle authentication (login/register)
function handleAuth() {
    const username = document.getElementById('authUsername').value;
    const password = document.getElementById('authPassword').value;
    const error = document.getElementById('authError');

    if (!username || !password) {
        error.textContent = 'Please fill in all fields';
        return;
    }

    if (isLoginMode) {
        // Login
        const users = getUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // Update login statistics
            user.lastLogin = new Date().toISOString();
            user.loginCount = (user.loginCount || 0) + 1;
            saveUsers(users);

            currentUser = user;
            saveSession(user);
            updateLoginStats();

            if (user.isAdmin) {
                showDashboard();
            } else {
                error.textContent = 'Access denied. Admin privileges required.';
            }
        } else {
            error.textContent = 'Invalid username or password';
        }
    } else {
        // Register
        const email = document.getElementById('authEmail').value;
        const confirmPassword = document.getElementById('authConfirmPassword').value;

        if (!email) {
            error.textContent = 'Please fill in all fields';
            return;
        }

        if (password !== confirmPassword) {
            error.textContent = 'Passwords do not match';
            return;
        }

        const users = getUsers();
        if (users.some(u => u.username === username)) {
            error.textContent = 'Username already exists';
            return;
        }
        // Add new user
        const newUser = {
            username,
            password,
            email,
            joinDate: new Date().toISOString().split('T')[0],
            isAdmin: true,
            lastLogin: new Date().toISOString(),
            loginCount: 1
        };

        users.push(newUser);
        saveUsers(users);
        updateLoginStats();

        // Switch to login mode
        isLoginMode = true;
        toggleAuthMode();
        error.textContent = 'Registration successful! Please login.';
    }
}
// Update login statistics
function updateLoginStats() {
    const stats = getStatistics();
    const today = new Date().toISOString().split('T')[0];

    // Update active users and today's logins
    stats.activeUsers = getUsers().filter(u => {
        const lastLogin = new Date(u.lastLogin);
        const diff = new Date() - lastLogin;
        return diff < 24 * 60 * 60 * 1000; // Active within last 24 hours
    }).length;

    stats.todayLogins = getUsers().filter(u =>
        u.lastLogin && u.lastLogin.startsWith(today)
    ).length;

    saveStatistics(stats);
    updateDashboardStats();
}
// Show dashboard
function showDashboard() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'grid';
    updateDashboardStats();
    populateUsersTable();
    populateExercisesTable();
    displayProfile();
}
//manage exercises
function showExerciseForm(exerciseId = null) {
    const form = document.getElementById('exerciseForm');
    const title = document.getElementById('exerciseTitle');
    const content = document.getElementById('exerciseContent');
    const difficulty = document.getElementById('exerciseDifficulty');

    if (exerciseId) {
        // Edit mode
        const exercises = getExercises();
        const exercise = exercises.find(e => e.id === exerciseId);
        if (exercise) {
            title.value = exercise.title;
            content.value = exercise.content;
            difficulty.value = exercise.difficulty;
            document.getElementById('exerciseId').value = exerciseId;
        }
    } else {
        // Add mode
        title.value = '';
        content.value = '';
        difficulty.value = 'easy';
        document.getElementById('exerciseId').value = '';
    }

    form.style.display = 'block';
}

function saveExercise() {
    const title = document.getElementById('exerciseTitle').value;
    const content = document.getElementById('exerciseContent').value;
    const difficulty = document.getElementById('exerciseDifficulty').value;
    const exerciseId = document.getElementById('exerciseId').value;

    if (!title || !content) {
        alert('Please fill in all fields');
        return;
    }

    let exercises = getExercises();

    if (exerciseId) {
        // Update existing exercise
        const index = exercises.findIndex(e => e.id === exerciseId);
        if (index !== -1) {
            exercises[index] = {
                ...exercises[index],
                title,
                content,
                difficulty,
                lastModified: new Date().toISOString()
            };
        }
    } else {
        // Add new exercise
        const newExercise = {
            id: Date.now().toString(),
            title,
            content,
            difficulty,
            timesUsed: 0,
            dateCreated: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        exercises.push(newExercise);
    }

    saveExercises(exercises);
    populateExercisesTable();
    closeExerciseForm();
}

function deleteExercise(exerciseId) {
    if (confirm('Are you sure you want to delete this exercise?')) {
        let exercises = getExercises();
        exercises = exercises.filter(exercise => exercise.id !== exerciseId);
        saveExercises(exercises);
        populateExercisesTable();
    }
}

function closeExerciseForm() {
    document.getElementById('exerciseForm').style.display = 'none';
}

function populateExercisesTable() {
    const tbody = document.querySelector('#exercisesTable tbody');
    tbody.innerHTML = '';

    const exercises = getExercises();
    exercises.forEach(exercise => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${exercise.title}</td>
            <td>${exercise.difficulty}</td>
            <td>${exercise.timesUsed}</td>
            <td>
                <button class="btn btn-primary" onclick="showExerciseForm('${exercise.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteExercise('${exercise.id}')">Delete</button>
                <button class="btn btn-primary" onclick="previewExercise('${exercise.id}')">Preview</button>
            </td>
        `;
    });
}

function previewExercise(exerciseId) {
    const exercises = getExercises();
    const exercise = exercises.find(e => e.id === exerciseId);
    if (exercise) {
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <html>
                <head>
                    <title>Exercise Preview - ${exercise.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .preview-container { max-width: 800px; margin: 0 auto; }
                        .difficulty { color: #666; margin-bottom: 20px; }
                        .content { line-height: 1.6; }
                    </style>
                </head>
                <body>
                    <div class="preview-container">
                        <h1>${exercise.title}</h1>
                        <div class="difficulty">Difficulty: ${exercise.difficulty}</div>
                        <div class="content">${exercise.content}</div>
                    </div>
                </body>
            </html>
        `);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // exercise management initialized
    document.getElementById('addExerciseBtn').addEventListener('click', () => showExerciseForm());
    document.getElementById('saveExerciseBtn').addEventListener('click', saveExercise);
    document.getElementById('cancelExerciseBtn').addEventListener('click', closeExerciseForm);

    // const originalLoadSectionData = window.loadSectionData;
    // window.loadSectionData = function(section) {
    //     originalLoadSectionData(section);
    //     if (section === 'exercises') {
    //         populateExercisesTable();
    //     }
    // };
});

// Get data from local storage
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

function getStatistics() {
    return JSON.parse(localStorage.getItem('statistics') || '{}');
}

function getExercises() {
    return JSON.parse(localStorage.getItem('exercises') || '[]');
}

// Save data to local storage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
    updateDashboardStats();
}

function saveStatistics(stats) {
    localStorage.setItem('statistics', JSON.stringify(stats));
}

function saveExercises(exercises) {
    localStorage.setItem('exercises', JSON.stringify(exercises));
}

// User management functions
function showAddUserForm() {
    document.getElementById('userFormTitle').textContent = 'Add New User';
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
    document.getElementById('userForm').style.display = 'block';
    document.getElementById('userModalBackdrop').style.display = 'block';
}

function showEditUserForm(username) {
    const users = getUsers();
    const user = users.find(u => u.username === username);
    if (user) {
        document.getElementById('userFormTitle').textContent = 'Edit User';
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        document.getElementById('username').setAttribute('data-original-username', username);
        document.getElementById('userForm').style.display = 'block';
        document.getElementById('userModalBackdrop').style.display = 'block';
    }
}

function closeUserForm() {
    document.getElementById('userForm').style.display = 'none';
    document.getElementById('userModalBackdrop').style.display = 'none';
    document.getElementById('username').removeAttribute('data-original-username');
}

function saveUser() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const originalUsername = document.getElementById('username').getAttribute('data-original-username');

    if (!username || !email) {
        alert('Please fill in all fields');
        return;
    }

    let users = getUsers();

    if (originalUsername) {
        // Editing existing user
        const index = users.findIndex(u => u.username === originalUsername);
        if (index !== -1) {
            users[index] = { ...users[index], username, email };
        }
    } else {
        // Adding new user
        if (users.some(u => u.username === username)) {
            alert('Username already exists');
            return;
        }
        users.push({
            username,
            email,
            joinDate: new Date().toISOString().split('T')[0]
        });
    }

    saveUsers(users);
    populateUsersTable();
    closeUserForm();
}

function deleteUser(username) {
    if (confirm(`Are you sure you want to delete user: ${username}?`)) {
        let users = getUsers();
        users = users.filter(user => user.username !== username);
        saveUsers(users);
        populateUsersTable();
    }
}

// Update UI functions
function updateDashboardStats() {
    const stats = getStatistics();
    const users = getUsers();
    stats.totalUsers = users.length;

    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('totalExercises').textContent = stats.totalExercises;
    document.getElementById('avgWPM').textContent = stats.avgWPM;
    document.getElementById('exercisesToday').textContent = stats.exercisesToday;
    // Add new stats to dashboard
    const statsGrid = document.querySelector('.stats-grid');
    statsGrid.innerHTML += `
         <div class="stat-card">
             <h3>Active Users (24h)</h3>
             <p>${stats.activeUsers}</p>
         </div>
         <div class="stat-card">
             <h3>Today's Logins</h3>
             <p>${stats.todayLogins}</p>
         </div>
     `;

    saveStatistics(stats);
}

function populateUsersTable() {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';

    const users = getUsers();
    users.forEach(user => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.joinDate}</td>
            <td>
                <button class="btn btn-primary" onclick="showEditUserForm('${user.username}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteUser('${user.username}')">Delete</button>
            </td>
        `;
    });
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelector('.nav-item.active').classList.remove('active');
        item.classList.add('active');

        document.querySelector('.content-section.active').classList.remove('active');
        document.getElementById(item.dataset.section).classList.add('active');

        if (item.dataset.section === 'profile') {
            displayProfile();
        } else {
            loadSectionData(item.dataset.section);
        }
    });
});

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
            break;

    }
}
// Profile Management
function updateProfile(profileData) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === currentUser.username);

    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...profileData };
        currentUser = users[userIndex];
        saveUsers(users);
        displayProfile();
        return true;
    }
    return false;
}

function displayProfile() {
    const profileContent = document.getElementById('profileContent');
    const defaultTheme = 'light';
    profileContent.innerHTML = `
    <div class="profile-header">
    <div class="profile-picture-container">
        <img id="profilePicture" src="${currentUser.profilePicture || '/default-avatar.png'}"
             alt="Profile Picture" class="profile-picture">
        <div class="profile-picture-overlay">
            <label for="profilePictureInput" class="upload-label">
                <i class="fas fa-camera"></i> Change Photo
            </label>
            <input type="file" id="profilePictureInput" accept="image/*"
                   style="display: none" onchange="handleProfilePictureUpload(event)">
        </div>
    </div>
    <div class="profile-info">
        <h3>${currentUser.username}</h3>
        <p>${currentUser.email}</p>
        <p class="user-role">${currentUser.isAdmin ? 'Administrator' : 'User'}</p>
    </div>
</div>

<div class="profile-customization">
    <h3>Profile Settings</h3>
    <div class="form-group">
        <label>Display Name:</label>
        <input type="text" id="displayName" value="${currentUser.displayName || currentUser.username}"
               class="form-control">
    </div>
    <div class="form-group">
        <label>Bio:</label>
        <textarea id="userBio" class="form-control" rows="3">${currentUser.bio || ''}</textarea>
    </div>
    <div class="form-group">
        <label>Theme:</label>
        <select id="userTheme" class="form-control">
            <option value="light" ${currentUser.theme === 'light' ? 'selected' : ''}>Light</option>
            <option value="dark" ${currentUser.theme === 'dark' ? 'selected' : ''}>Dark</option>
            <option value="custom" ${currentUser.theme === 'custom' ? 'selected' : ''}>Custom</option>
        </select>
    </div>
    <div class="form-group">
        <label>Notification Preferences:</label>
        <div class="checkbox-group">
            <label>
                <input type="checkbox" id="emailNotifications"
                       ${currentUser.notifications?.email ? 'checked' : ''}>
                Email Notifications
            </label>
            <label>
                <input type="checkbox" id="systemNotifications"
                       ${currentUser.notifications?.system ? 'checked' : ''}>
                System Notifications
            </label>
        </div>
    </div>
    <button class="btn btn-primary" onclick="saveProfileSettings()">Save Settings</button>
</div>

<div class="recent-activity">
    <h3>Recent Activity</h3>
    <div class="activity-timeline" id="activityTimeline">
        ${generateActivityTimeline()}
    </div>
</div>

<div class="profile-stats">
    <div class="stat-card">
        <h3>Join Date</h3>
        <p>${new Date(currentUser.joinDate).toLocaleDateString()}</p>
    </div>
    <div class="stat-card">
        <h3>Login Count</h3>
        <p>${currentUser.loginCount || 0}</p>
    </div>
    <div class="stat-card">
        <h3>Last Active</h3>
        <p>${new Date(currentUser.lastLogin).toLocaleString()}</p>
    </div>
    <div class="stat-card">
        <h3>Exercises Completed</h3>
        <p>${currentUser.exercisesCompleted || 0}</p>
    </div>
</div>
`;
    // Apply theme
    applyTheme(currentUser.theme || defaultTheme);
}

function generateActivityTimeline() {
    const activities = getUserActivities(currentUser.username);
    if (activities.length === 0) {
        return '<p class="no-activity">No recent activity</p>';
    }

    return activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}-icon"></div>
            <div class="activity-content">
                <p class="activity-text">${activity.details}</p>
                <p class="activity-time">${formatTimeAgo(activity.timestamp)}</p>
            </div>
        </div>
    `).join('');
}

function formatTimeAgo(timestamp) {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }
    return 'Just now';
}

function saveProfileSettings() {
    const profileData = {
        displayName: document.getElementById('displayName').value,
        bio: document.getElementById('userBio').value,
        theme: document.getElementById('userTheme').value,
        notifications: {
            email: document.getElementById('emailNotifications').checked,
            system: document.getElementById('systemNotifications').checked
        }
    };

    if (updateProfile(profileData)) {
        logUserActivity('profile_update', 'Updated profile settings');
        alert('Profile settings saved successfully');
        displayProfile();
    } else {
        alert('Failed to save profile settings');
    }
}

function applyTheme(theme) {
    const root = document.documentElement;
    switch (theme) {
        case 'dark':
            root.style.setProperty('--bg-color', '#1a1a1a');
            root.style.setProperty('--text-color', '#ffffff');
            root.style.setProperty('--card-bg', '#2d2d2d');
            break;
        case 'custom':
            // Apply custom theme if saved
            if (currentUser.customTheme) {
                Object.entries(currentUser.customTheme).forEach(([key, value]) => {
                    root.style.setProperty(key, value);
                });
            }
            break;
        default: // light theme
            root.style.setProperty('--bg-color', '#f5f5f5');
            root.style.setProperty('--text-color', '#333333');
            root.style.setProperty('--card-bg', '#ffffff');
    }
}

function editProfile() {
    const profileContent = document.getElementById('profileContent');
    profileContent.innerHTML = `
        <form id="profileForm" onsubmit="saveProfileChanges(event)">
            <div class="form-group">
                <label>Email:</label>
                <input type="email" id="profileEmail" value="${currentUser.email}" required>
            </div>
            <div class="form-group">
                <label>Current Password:</label>
                <input type="password" id="currentPassword">
            </div>
            <div class="form-group">
                <label>New Password:</label>
                <input type="password" id="newPassword">
            </div>
            <div class="form-group">
                <label>Confirm New Password:</label>
                <input type="password" id="confirmPassword">
            </div>
            <button type="submit" class="btn btn-primary">Save Changes</button>
            <button type="button" class="btn btn-danger" onclick="displayProfile()">Cancel</button>
        </form>
    `;
}

function saveProfileChanges(event) {
    event.preventDefault();

    const email = document.getElementById('profileEmail').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (currentPassword) {
        if (currentPassword !== currentUser.password) {
            alert('Current password is incorrect');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
    }

    const profileData = {
        email,
        password: newPassword || currentUser.password
    };

    if (updateProfile(profileData)) {
        alert('Profile updated successfully');
        displayProfile();
    } else {
        alert('Failed to update profile');
    }
}

// Profile picture handling
function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('File size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const base64Image = e.target.result;
            updateProfile({ profilePicture: base64Image });
            document.getElementById('profilePicture').src = base64Image;
        };
        reader.readAsDataURL(file);
    }
}

// Activity tracking
function logUserActivity(activityType, details) {
    const activity = {
        id: Date.now(),
        userId: currentUser.username,
        type: activityType,
        details: details,
        timestamp: new Date().toISOString()
    };

    let activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
    activities.push(activity);
    localStorage.setItem('userActivities', JSON.stringify(activities));
}

function getUserActivities(username, limit = 10) {
    const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
    return activities
        .filter(activity => activity.userId === username)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
}


//session management functions
function saveSession(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

function clearSession() {
    sessionStorage.removeItem('currentUser');
}

function getSession() {
    const savedUser = sessionStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
}

function logout() {
    currentUser = null;
    clearSession();
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('authContainer').style.display = 'block';
}

// this is to check session on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeLocalStorage();

    // Check for existing session
    const savedUser = getSession();
    if (savedUser) {
        currentUser = savedUser;
        if (savedUser.isAdmin) {
            showDashboard();
        }
    }
});
// Initialize the application
initializeLocalStorage();
