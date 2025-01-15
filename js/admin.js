import { DB, User } from "./model.js"

let db = DB.load()


let isLoginMode = true;
let currentUser = null;
// Initialize local storage with default data if empty

$(".auth-container button").on("click", handleAuth)
$(".nav-item .logout-btn").on("click", logout)
$("#showAddUserForm").on("click", showAddUserForm)
$("#saveUser").on("click", saveUser)
$("#closeUserForm").on("click", closeUserForm)
$(".logout-btn").on("click", logout)
$("#editProfile").on("click", editProfile)

$("#saveProfileSettings").ready(() => {
    $("#saveProfileSettings").on("click", saveProfileSettings)
})


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
        // const user = users.find(u => u.username === username && u.password === password);
        let user = db.authenticateUser(username, password)

        if (user) {
            // Update login statistics
            user.lastLogin = new Date().toISOString();
            user.loginCount = (user.loginCount || 0) + 1;
            saveUsers(users);

            currentUser = user;
            saveSession(user);
            updateLoginStats();


            if (user.role == "Admin") {
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
    // stats.activeUsers = getUsers().filter(u => {
    //     const lastLogin = new Date(u.lastLogin);
    //     const diff = new Date() - lastLogin;
    //     return diff < 24 * 60 * 60 * 1000; // Active within last 24 hours
    // }).length;

    // stats.todayLogins = getUsers().filter(u =>
    //     u.lastLogin && u.lastLogin.startsWith(today)
    // ).length;

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

    if (exerciseId) {
        let db = DB.load()
        // Edit mode
        const exercise = db.exos[exerciseId];
        if (exercise) {
            title.value = `${exercise.title}`;
            content.value = exercise.text;
            document.getElementById('exerciseId').value = exerciseId;
        }
    } else {
        // Add mode
        title.value = '';
        content.value = '';
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

    let db = DB.load()
    let exercises = db.exos;

    if (exerciseId) {
        // Update existing exercise
        exercises[exerciseId].title = title
        exercises[exerciseId].text = content

    } else {
        // Add new exercise
        console.log("Exercise id", exerciseId);

        // exercises[exerciseId] = {}
        // exercises[exerciseId].title = title
        // exercises[exerciseId].text = content
        db.addExo(title, content)
        // const newExercise = {
        //     id: Date.now().toString(),
        //     title,
        //     content,
        //     difficulty,
        //     timesUsed: 0,
        //     dateCreated: new Date().toISOString(),
        //     lastModified: new Date().toISOString()
        // };
        // exercises.push(newExercise);
    }
    db.save()
    console.log(db);


    saveExercises(exercises);
    populateExercisesTable();
    closeExerciseForm();
}

function deleteExercise(exerciseId) {
    if (confirm('Are you sure you want to delete this exercise?')) {
        let db = DB.load()
        delete db.exos[exerciseId]
        db.save()
        populateExercisesTable()
    }
}

function closeExerciseForm() {
    document.getElementById('exerciseForm').style.display = 'none';
}

function populateExercisesTable() {
    let db = DB.load()
    $(`#totalExercisesCount`).text(`${Object.keys(db.exos).length}`)
    $(`#averageExerciseUsage`).text(`${(() => {
        let total = 0
        let exoIDs = Object.keys(db.exos)
        for (const exoID of exoIDs) {
            total += db.exos[exoID].timesAttempted || 0
        }
        return (total / exoIDs.length).toFixed(1)
    })()}`)
    $(`#mostUsedExercise`).text(`${(() => {
        let total = 0
        let exos = Object.values(db.exos)
        if (exos.length == 0) {
            return "-"
        }
        let mostUsed = exos[1]
        for (const exo of exos) {
            if (exo.timesAttempted > mostUsed.timesAttempted) {
                mostUsed = exo
            }
        }
        return `${mostUsed.exoID}: ${mostUsed.title}`
    })()}`)
    const tbody = document.querySelector('#exercisesTable tbody');
    tbody.innerHTML = '';
    const exercises = Object.values(db.exos);
    exercises.forEach((exercise, i) => {
        const row = tbody.insertRow();
        i = i + 1
        row.innerHTML = `
            <td>${exercise.exoID}</td>
            <td>${exercise.title}</td>
            <td>${exercise.timesAttempted}</td>
            <td>${new Date(exercise.last_modified_date).toDateString()}</td>
            <td>
                <button class="btn btn-primary" id="editExo${i}">Edit</button>
                <button class="btn btn-danger" id="delete${i}">Delete</button>
                <button class="btn btn-primary" id="previewExo${i}">Preview</button>
            </td>
        `;

        $(`#editExo${i}`).ready(function () {
            $(`#editExo${i}`).on("click", () => {
                showExerciseForm(i)
            })
        })
        $(`#delete${i}`).ready(function () {
            $(`#delete${i}`).on("click", () => {
                deleteExercise(i)
            })
        })
        $(`#previewExo${i}`).ready(function () {
            $(`#previewExo${i}`).on("click", () => {
                previewExercise(i)
            })
        })
    });
}

function previewExercise(exerciseId) {
    let db = DB.load()
    const exercise = db.exos[exerciseId];
    if (exercise) {
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <html>
                <head>
                    <title>Exercise Preview - Exo ${exerciseId}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .preview-container { max-width: 800px; margin: 0 auto; }
                        .difficulty { color: #666; margin-bottom: 20px; }
                        .content { line-height: 1.6; }
                    </style>
                </head>
                <body>
                    <div class="preview-container">
                        <h1> Exo ${exerciseId} ${exercise.title}</h1>
                        <div class="content">${exercise.text}</div>
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
    populateUsersTable()
}

function saveStatistics(stats) {
    localStorage.setItem('statistics', JSON.stringify(stats));
}

function saveExercises(exercises) {
    localStorage.setItem('exercises', JSON.stringify(exercises));
}

// User management functions
function showAddUserForm() {
    document.getElementById('userFormTitle').textContent = 'Add New User (default password 1234)';
    document.getElementById('username').value = '';
    document.getElementById('email').value = 'nobody@nothing.empty';
    document.getElementById('recommendations').value = "Welcome newbie"

    document.getElementById('userForm').style.display = 'block';
    document.getElementById('userModalBackdrop').style.display = 'block';
}

function showEditUserForm(username) {
    let db = DB.load()
    const user = db.users[username];
    if (user) {
        document.getElementById('userFormTitle').textContent = 'Edit User';
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;
        let existing_recommendations = user.recommendations || ["Focus on accuracy not on speed", "Try not to look on your keyboard even if your speed drops"]
        user.recommendations = existing_recommendations
        $(".recommendations-inputs").html("")
        for (let i = 0; i < existing_recommendations.length; i++) {
            const r = existing_recommendations[i];
            $(".recommendations-inputs").html($(".recommendations-inputs").html() +
                `
                <div class="form-group">
            <label>Recommendation${i + 1}</label>
            <input type="text" class="recommendation${i + 1}" value="${r}"/>
          </div>
            `)
        }
        document.getElementById('recommendations').value = "";
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
    let db = DB.load()
    let username = document.getElementById('username').value;
    let email = document.getElementById('email').value;
    let role = document.getElementById('role').value;
    console.log("Role", role);
    
    let lastRecom = document.getElementById('recommendations').value;

    if (!username || !email) {
        alert('Please fill in all fields');
        return;
    }

    let users = db.users;
    if (username) {
        // Editing existing user
        let user = users[username]
        user.username = username
        user.email = email
        user.role = role
        let existing = user.recommendations
        console.log("Recomendations for " + username, existing);

        user.recommendations = []
        for (let i = 0; i < existing.length; i++) {
            let r = document.getElementsByClassName(`recommendation${i + 1}`)[0].value
            r = r.trim()
            console.log("Recomendation " + i, r || "Empty");

            if (r) {
                user.recommendations.push(r)
            }
        }
        lastRecom = lastRecom.trim()
        if (lastRecom) {
            user.recommendations.push(lastRecom)
        }
        console.log(db);
        closeUserForm();
    } else {
        // Adding new user
        db.addUser(new User(username, 1234, role, email))
    }

    db.save()

    populateUsersTable();
}

function deleteUser(username) {
    if (confirm(`Are you sure you want to delete user: ${username}?`)) {
        let db = DB.load()
        delete db.users[username]
        db.save()
        populateUsersTable();
    }
}

// Update UI functions
function updateDashboardStats() {
    // const stats = getStatistics();
    // const users = getUsers();
    // stats.totalUsers = users.length;

    // document.getElementById('totalUsers').textContent = stats.totalUsers;
    // document.getElementById('totalExercises').textContent = stats.totalExercises;
    // document.getElementById('avgWPM').textContent = stats.avgWPM;
    // document.getElementById('exercisesToday').textContent = stats.exercisesToday;
    // Add new stats to dashboard
    const statsGrid = document.querySelector('.stats-grid');
    statsGrid.innerHTML = `
    <div class="stat-card">
             <h3>Total Users</h3>
             <p>${(() => {
            let users = Object.values(db.users)
            return users.length
        })()}</p>
         </div>
         <div class="stat-card">
             <h3>Active Users (24h)</h3>
             <p>${(() => {
            let users = Object.values(db.users)
            return users.filter(user => user.last_login_date > today()).length
        })()}</p>
         </div>
         <div class="stat-card">
             <h3>Active Exercises</h3>
             <p>${db.numExos}</p>
         </div>
         <div class="stat-card">
             <h3>Exercises done</h3>
             <p>${(() => {
            let total = 0
            let users = Object.values(db.users)
            for (const user of users) {
                total += user.perf.length
            }
            return total
        })()}</p>
         </div>
          <div class="stat-card">
             <h3>Exercises today</h3>
             <p>${(() => {
            let total = 0
            let users = Object.values(db.users)
            for (const user of users) {
                total += user.perf.filter(p => p.date > today()).length
            }
            return total
        })()}</p>
         </div>
         <div class="stat-card">
             <h3>Avg. WPM</h3>
             <p>${(() => {
            let total = 0
            let users = Object.values(db.users)
            for (const user of users) {
                total += user.perf.reduce(function (total, perf) {
                    return total + perf.wpm
                }, 0) / (user.perf.length || 1)
            }
            return (total / users.length).toFixed(2)
        })()}</p>
         </div>
         <div class="stat-card">
             <h3>Avg. Accuracy</h3>
             <p>${(() => {
            let total = 0
            let users = Object.values(db.users)
            for (const user of users) {
                total += user.perf.reduce(function (total, perf) {
                    return total + perf.acc
                }, 0) / (user.perf.length || 1)
            }
            return (total / users.length * 100).toFixed(2)
        })()}%</p>
         </div>
     `;
}
function today() {
    return new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
}
function populateUsersTable() {
    let db = DB.load()
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';

    const users = Object.values(db.users);
    users.forEach(user => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>${user.email}</td>
            <td>${(new Date(user.join_date)).toDateString()}</td>
            <td>
                <button class="btn btn-primary" id="showEditUserForm${user.username}">Edit</button>
                <button class="btn btn-danger" id="deleteUser${user.username}">Delete</button>
            </td>
        `;
        $(`#showEditUserForm${user.username}`).ready(() => {
            $(`#showEditUserForm${user.username}`).on("click", () => {
                showEditUserForm(user.username)
            })
        })
        $(`#deleteUser${user.username}`).on("click", () => {
            deleteUser(user.username)
        })
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
            // populateUsersTable();
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
    let user = User.load()
    const profileContent = document.getElementById('profileContent');
    const defaultTheme = 'light';
    profileContent.innerHTML = `
    <div class="profile-header">
    <div class="profile-picture-container">
        <img id="profilePicture" src="${user.avatar_path || '../landing/16.jpeg'}"
             alt="Profile Picture" class="profile-picture">
        <div class="profile-picture-overlay">
            <label for="profilePictureInput" class="upload-label">
                <i class="fas fa-camera"></i> Change Photo
            </label>
            <input type="file" id="profilePictureInput" accept="image/*" onchange="console.log('fjfgjhfjhfhjfhfhj')" style="display: none">
        </div>
    </div>
    <div class="profile-info">
        <h3>${user.username}</h3>
        <p>${user.email}</p>
        <p class="user-role">${user.role == "Admin" ? 'Administrator' : 'User'}</p>
    </div>
</div>

<div class="profile-customization">
    <h3>Profile Settings</h3>
    <div class="form-group">
        <label>Display Name:</label>
        <input type="text" id="displayName" value="${user.displayName || user.username}"
               class="form-control">
    </div>
    <div class="form-group">
        <label>Bio:</label>
        <textarea id="userBio" class="form-control" rows="3">${user.bio || ''}</textarea>
    </div>
    <div class="form-group">
        <label>Theme:</label>
        <select id="userTheme" class="form-control">
            <option value="light" ${user.theme === 'light' ? 'selected' : ''}>Light</option>
            <option value="dark" ${user.theme === 'dark' ? 'selected' : ''}>Dark</option>
            <option value="custom" ${user.theme === 'custom' ? 'selected' : ''}>Custom</option>
        </select>
    </div>
    <div class="form-group">
        <label>Notification Preferences:</label>
        <div class="checkbox-group">
            <label>
                <input type="checkbox" id="emailNotifications"
                       ${user.notifications?.email ? 'checked' : ''}>
                Email Notifications
            </label>
            <label>
                <input type="checkbox" id="systemNotifications"
                       ${user.notifications?.system ? 'checked' : ''}>
                System Notifications
            </label>
        </div>
    </div>
    <button class="btn btn-primary" id="saveProfileSettings">Save Settings</button>
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
        <p>${new Date(user.join_date).toDateString()}</p>
    </div>
    <div class="stat-card">
        <h3>Login Count</h3>
        <p>${user.loginCount || 0}</p>
    </div>
    <div class="stat-card">
        <h3>Last Active</h3>
        <p>${new Date(user.last_login_date).toDateString()}</p>
    </div>
    <div class="stat-card">
        <h3>Exercises Completed</h3>
        <p>${user.perf.length || 0}</p>
    </div>
</div>
`;

    console.log($("#profilePictureInput"));
    $("#profilePictureInput").ready(() => {
        console.log($("#profilePictureInput"));

        $("#profilePictureInput").change(function (e) {
            e.preventDefault();
            console.log(e);

            handleProfilePictureUpload(e)
        });
    })
    // Apply theme
    applyTheme(user.theme || defaultTheme);
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
    let db = DB.load()
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
            <button type="button" class="btn btn-primary">Save Changes</button>
            <button type="button" class="btn btn-danger">Cancel</button>
        </form>
    `;

    $("#profileForm button").ready(function () {
        $("#profileForm .btn-danger").on("click", displayProfile)
    })
}

function saveProfileChanges(event) {
    event.preventDefault();

    const email = document.getElementById('profileEmail').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    let user = User.load()
    let db = DB.load()
    if (currentPassword) {
        if (currentPassword !== user.password) {
            alert('Current password is incorrect');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
    }

    // const profileData = {
    //     email,
    //     password: newPassword || user.password
    // };

    // if (updateProfile(profileData)) {
    //     alert('Profile updated successfully');
    //     displayProfile();
    // } else {
    //     alert('Failed to update profile');
    // }
}

// Profile picture handling
function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if (file) {
        console.log(file);

        if (file.size > 10 * 1024 * 1024) { // 5MB limit
            alert('File size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            console.log(e);

            const base64Image = e.target.result;
            console.log(base64Image);

            // updateProfile({ profilePicture: base64Image });
            let user = User.load()
            user.avatar_path = base64Image
            document.getElementById('profilePicture').src = base64Image;
            let db = DB.load()
            db.users[user.username] = user
            db.save()
            console.log(db);
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
    sessionStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
    sessionStorage.removeItem('currentUser');
}

function getSession() {
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
}

function logout() {
    currentUser = null;
    // clearSession();
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
