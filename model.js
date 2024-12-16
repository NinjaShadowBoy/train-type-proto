class User {
    constructor(username, password) {
        let now = (new Date()).getTime()
        this.username = username
        this.password = password
        this.perf = []
        this.challenges = []
        this.customExos = []
    }
}

class DefaultExo {
    constructor(exoID, text, duration, timesAttempted = 0) {
        this.exoID = exoID
        this.text = text ? text : "The quick fox jumps over the lazy dog"
        this.duration = duration
        this.timesAttempted = timesAttempted
    }
}

class CustomExo {
    constructor(text, duration) {
        this.text = text
        this.duration = duration
    }
}

class ExerciseDone {
    constructor(date, exoID, wpm, acc, errors, duration) {
        this.date = date;
        this.wpm = wpm;
        this.exoID = exoID;
        this.acc = acc;
        this.errors = errors;
        this.duration = duration;
    }
}

class Challenge {
    constructor(date, exoID, opponent, opponent_awpm, own_awpm) {
        this.date = date
        this.exoID = exoID
        this.opponent = opponent
        this.opponent_awpm = opponent_awpm
        this.own_awpm = own_awpm
    }
}

class DB {
    constructor(users, exos) {
        this.users = users ? users : {} // Dict K: username V: User
        this.exos = exos ? exos : {} // Dict K: exoID V: ExerciseDone
        this.numExos = Object.keys(this.exos).length;
        this.numUser = Object.keys(this.users).length;
    }
    getUser(username) {
        return this.users[username]
    }
    getExo(exoID) {
        return this.exos[exoID]
    }
    addUser(user) {
        if (this.users[user.username] != undefined) {
            console.log(user, ` username "${user.username}" already existing`)
            return false
        } else {
            this.users[user.username] = user
            this.numUser++
            return true
        }
    }
    addExo(text, duration) {
        this.exos[++this.numExos] = new DefaultExo(this.numExos, text, duration)
    }
}

// let me = new User("Alex", "alex")
// let her = new User("Paule", "paule")
// let db = new DB()

// db.addUser(me)
// db.addUser(her)
// me.perf.push(new ExerciseDone(new Date(), 1, 22, 0.95, { 'a': 11 }, 60000))
// db.addExo("Alex is a boy in ING 3 EN at IUSJC. He likes programming")
// console.log(db);

// const jsonDB = JSON.stringify(db)
// localStorage.setItem("DB", jsonDB)
// console.log("JSON String: ", jsonDB)

let jsonDB = localStorage.getItem("DB")
jsonDB = JSON.parse(jsonDB)
let db = new DB(jsonDB.users, jsonDB.exos)

console.log(db);

db.addUser(new User("Alex", 'leboss'))


