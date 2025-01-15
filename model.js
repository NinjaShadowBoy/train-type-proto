export class User {
    constructor(username, password, role = "User", e_mail = "") {
        let now = (new Date()).getTime()
        this.username = username
        this.password = password
        this.email = e_mail
        this.perf = []
        this.challenges = []
        this.customExos = []
        this.join_date = now
        this.last_login_date = now
        this.theme = "light"
        this.avatar_path = "/landing/16.jpeg"
        this.bio = "Nothing about me yet"
        this.role = role
        this.recommendations = ["Focus on accuracy not on speed", "Try not to look on your keyboard even if your speed drops"]
    }

    // This is used for the current user
    static load() {
        let jsonUserString = sessionStorage.getItem("user")
        let jsonUser = JSON.parse(jsonUserString)
        let user = User.loadUser(jsonUser)
        user.last_login_date = new Date()
        return user
    }

    addToPerformance(exoDone) {
        this.perf.push(exoDone)
        for (let i = 0; i < this.perf.length; i++) {
            const elt = this.perf[i];
        }
    }

    addCustomExo(customText) {
        this.customExos.push(new CustomExo(customText))
    }

    // Used to construct all users in db
    static loadUser(obj) {
        let user = new User()
        user.username = obj.username
        user.password = obj.password
        user.perf = obj.perf || []
        user.challenges = obj.challenges || []
        user.customExos = obj.customExos || []

        let now = (new Date()).getTime()
        user.email = obj.e_mail || "nobody@nothing.empty"
        user.join_date = obj.join_date || user.perf[0]?.date || now
        user.last_login_date = obj.last_login_date || now
        user.theme = obj.theme || "light"
        user.avatar_path = obj.avatar_path || "./landing/16.jpeg"
        user.bio = obj.bio || "Nothing about me yet"
        user.role = obj.role || "User"
        user.recommendations = obj.recommendations

        return user
    }

    avg_acc() {
        let avg = 0
        for (let i = 0; i < this.perf.length; i++) {
            const p = this.perf[i];
            avg += p.acc
        }
        avg /= (this.perf.length || 1)        
        return avg
    }
    avg_speed() {
        let avg = 0
        for (let i = 0; i < this.perf.length; i++) {
            const p = this.perf[i];
            avg += p.wpm
        }
        avg /=  (this.perf.length || 1)
        return avg
    }
    avg_aspeed() {
        let avg = 0
        for (let i = 0; i < this.perf.length; i++) {
            const p = this.perf[i];
            avg += p.wpm*p.acc
        }
        avg /= (this.perf.length || 1)
        return avg
    }
}

export class DefaultExo {
    constructor(exoID, title, text, timesAttempted = 0) {
        let now = new Date()
        this.title = title || "No tile"
        this.exoID = exoID
        this.text = text ? text : "The quick fox jumps over the lazy dog"
        this.timesAttempted = timesAttempted
        this.last_modified_date = now
    }

    static loadExo(obj) {
        let now = (new Date()).getTime()
        let exo = new DefaultExo()
        exo.title = obj.title || "No tile"
        exo.exoID = obj.exoID
        exo.text = obj.text || "The quick fox jumps over the lazy dog"
        exo.timesAttempted = obj.timesAttempted
        exo.last_modified_date = obj.last_modified_date || now
        return exo
    }
}

export class CustomExo {
    constructor(title, text) {
        this.date_created = new Date()
        this.title = title
        this.text = text
    }
}

export class ExerciseDone {
    constructor(date, exoID, wpm, acc, errors, duration, number_of_words, number_of_wrong_words) {
        this.date = date;
        this.wpm = wpm;
        this.exoID = exoID;
        this.acc = acc;
        this.errors = errors;
        this.duration = duration;
        this.number_of_words = number_of_words;
        this.number_of_wrong_words = this.number_of_wrong_words;
    }
}

export class Challenge {
    constructor(date, exoID, opponent, opponent_awpm, own_awpm) {
        this.date = date
        this.exoID = exoID
        this.opponent = opponent
        this.opponent_awpm = opponent_awpm
        this.own_awpm = own_awpm
    }
}

export class DB {
    constructor(obj) {
        this.users = obj.users ? obj.users : {} // Dict K: username V: User
        this.exos = obj.exos ? obj.exos : {} // Dict K: exoID V: ExerciseDone
        this.numExos = Object.keys(this.exos).length;
        this.numUser = Object.keys(this.users).length;
        this.exercises_today = obj.exercises_today || 0
        this.avg_speed = obj.avg_speed || 0
        this.avg_speed = obj.avg_speed || 0
        this.today_logins = obj.today_logins || 0
    }
    setUser(user) {
        this.users[user.username] = user
    }
    getUser(username) {
        return this.users[username]
    }
    getExo(exoID) {
        return this.exos[exoID]
    }
    addUser(user) {
        if (this.users[user.username] != undefined) {
            alert(`Username "${user.username}" already existing. Choose another username please.`)
            return false
        } else {
            this.users[user.username] = user
            this.numUser++
            this.save()
            alert(`You were succesfully registerd as ${user.username}`)
            return true
        }
    }
    addExo(title, text, duration = 60000) {
        this.exos[++this.numExos] = new DefaultExo(this.numExos,title, text)
    }
    authenticateUser(username, password) {
        let user = this.users[username]
        if (user) {
            console.log(user);
            console.log("Correct", user.password);

            if (password === user.password) {
                return user
            }
            alert("Incorrect password");
            return false
        }
        alert("Inexisting user");

        return undefined
    }

    save() {
        localStorage.setItem("DB", JSON.stringify(this))
    }
    static load() {
        let jsonDB = localStorage.getItem("DB")
        if (!jsonDB) {
            jsonDB = oldDB
        } else {
            jsonDB = JSON.parse(jsonDB)
        }
        let db = new DB(jsonDB)
        for (let user of Object.values(db.users)) {
            db.users[user.username] = User.loadUser(user)
        }
        for (let exoID of Object.keys(db.exos)) {
            db.exos[exoID] = DefaultExo.loadExo(db.exos[exoID])
        }
        return db
    }
}


let oldDB = {
    "users": {
        "Alex": {
            "username": "Alex",
            "password": "alex",
            "email": "nobody@nothing.empty",
            "perf": [
                {
                    "date": 1735376300664,
                    "wpm": 22,
                    "exoID": 1,
                    "acc": 0.95,
                    "errors": {
                        "a": 11
                    },
                    "duration": 60000
                },
                {
                    "date": 1735490125131,
                    "wpm": 15.523932729624839,
                    "exoID": 2,
                    "acc": 0.8333333333333334,
                    "errors": {
                        "M": 1,
                        "s": 2,
                        "w": 2,
                        "a": 1,
                        " ": 3,
                        "I": 1,
                        "In": 1,
                        "ns": 1,
                        "b": 1,
                        "o": 1
                    },
                    "duration": 60000,
                    "number_of_words": 22
                },
                {
                    "date": 1735569990392,
                    "wpm": 18.566889047864645,
                    "exoID": 4,
                    "acc": 0.8817204301075269,
                    "errors": {
                        " ": 3,
                        "H": 1,
                        "Ha": 1,
                        "ew": 1,
                        "?": 1,
                        "Sa": 1
                    },
                    "duration": 60000,
                    "number_of_words": 29
                },
                {
                    "date": 1735572535274,
                    "wpm": 0.8839616213329404,
                    "exoID": 4,
                    "acc": 1,
                    "errors": {
                        "h": 1,
                        "s": 3,
                        "w": 1,
                        "b": 1,
                        ".": 1,
                        "m": 1,
                        "S": 1,
                        "d": 1,
                        "p": 1,
                        "e": 1,
                        "I": 1
                    },
                    "duration": 60000,
                    "number_of_words": 20
                },
                {
                    "date": 1735572634996,
                    "wpm": 19.303802716462958,
                    "exoID": 4,
                    "acc": 0.9896907216494846,
                    "errors": {
                        "h": 1,
                        "s": 3,
                        "w": 1,
                        "b": 1,
                        ".": 1,
                        "m": 1,
                        "S": 1,
                        "d": 1,
                        "p": 1,
                        "e": 1,
                        "I": 1
                    },
                    "duration": 60000,
                    "number_of_words": 50
                },
                {
                    "date": 1735577851413,
                    "wpm": 21.63121550791758,
                    "exoID": 3,
                    "acc": 1,
                    "errors": {
                        "S": 1,
                        "d": 2,
                        " ": 1,
                        "l": 1,
                        "h": 1,
                        "e": 1,
                        "w": 1,
                        "q": 1,
                        "u": 1,
                        "O": 1,
                        "g": 1,
                        "s": 1
                    },
                    "duration": 180000,
                    "number_of_words": 97
                },
                {
                    "date": 1735578676451,
                    "wpm": 20.952736384719962,
                    "exoID": 4,
                    "acc": 0.9809160305343512,
                    "errors": {
                        "1": 1,
                        "T": 2,
                        "o": 1,
                        ".": 3,
                        "H": 1,
                        "s": 4,
                        "k": 1,
                        "D": 1,
                        "e": 1,
                        "f": 1,
                        "a": 6,
                        "w": 3,
                        " ": 2,
                        "S": 3,
                        "n": 1,
                        "t": 1,
                        ",": 1,
                        "u": 1,
                        "m": 1,
                        "?": 1
                    },
                    "duration": 300000,
                    "number_of_words": 141
                },
                {
                    "date": 1735580947528,
                    "wpm": 16.973408326954438,
                    "exoID": 2,
                    "acc": 0.9764705882352941,
                    "errors": {
                        "M": 5,
                        "x": 2,
                        " ": 1,
                        "I": 2,
                        "k": 3,
                        ",": 2,
                        "t": 2,
                        "d": 1,
                        ".": 2,
                        "l": 2,
                        "v": 1,
                        "m": 1,
                        "r": 2,
                        "“": 8,
                        "T": 1
                    },
                    "duration": 180000,
                    "number_of_words": 68
                },
                {
                    "date": 1735581066949,
                    "wpm": 20.763663588719744,
                    "exoID": 4,
                    "acc": 0.9903846153846154,
                    "errors": {
                        "e": 1,
                        "h": 1,
                        " ": 1,
                        ".": 1,
                        "s": 1,
                        "a": 1,
                        "w": 1,
                        "I": 1
                    },
                    "duration": 60000,
                    "number_of_words": 31
                },
                {
                    "date": 1735727562417,
                    "wpm": 24.483702413535706,
                    "exoID": 3,
                    "acc": 0.975609756097561,
                    "errors": {
                        "s": 1,
                        ".": 2,
                        "H": 1,
                        "e": 1
                    },
                    "duration": 60000,
                    "number_of_words": 40
                },
                {
                    "date": 1735727672330,
                    "wpm": 20.762972698687342,
                    "exoID": 2,
                    "acc": 0.9711538461538461,
                    "errors": {
                        "b": 2,
                        ".": 2,
                        "I": 1,
                        "f": 1,
                        " ": 1,
                        "'": 1
                    },
                    "duration": 60000,
                    "number_of_words": 29
                },
                {
                    "date": 1735728079621,
                    "wpm": 23.59190011429409,
                    "exoID": 3,
                    "acc": 0.976271186440678,
                    "errors": {
                        "u": 2,
                        "t": 3,
                        ".": 3,
                        " ": 5,
                        "p": 1,
                        "h": 1,
                        "s": 4,
                        "w": 6,
                        "a": 4,
                        "e": 2,
                        "o": 3,
                        "I": 2,
                        "d": 1,
                        "k": 1,
                        "b": 2,
                        "i": 1,
                        "y": 1
                    },
                    "duration": 300000,
                    "number_of_words": 160
                },
                {
                    "date": 1735728292152,
                    "wpm": 24.953420282140005,
                    "exoID": 3,
                    "acc": 0.912,
                    "errors": {
                        "T": 2,
                        "a": 3,
                        "s": 2,
                        "h": 1,
                        "O": 1,
                        " ": 1,
                        "?": 2,
                        "o": 1,
                        ".": 2,
                        "H": 1,
                        "e": 1,
                        "w": 1,
                        "b": 1
                    },
                    "duration": 60000,
                    "number_of_words": 40
                },
                {
                    "date": 1735728663840,
                    "wpm": 25.75232892747403,
                    "exoID": 1,
                    "acc": 0.9772727272727273,
                    "errors": {
                        "3": 1,
                        "I": 1,
                        "N": 1
                    },
                    "duration": 60000,
                    "number_of_words": 13
                },
                {
                    "date": 1736764538102,
                    "wpm": 75.52258934592044,
                    "exoID": 1,
                    "acc": 0.23214285714285715,
                    "errors": {
                        "3": 1,
                        "N": 2,
                        "E": 1,
                        "a": 2,
                        "I": 1,
                        "H": 1,
                        "l": 1,
                        "p": 1,
                        "m": 1,
                        "o": 1,
                        "s": 1
                    },
                    "duration": 60000,
                    "number_of_words": 17
                },
                {
                    "date": 1736765077733,
                    "wpm": 204.13122721749698,
                    "exoID": 1,
                    "acc": 0.017857142857142856,
                    "errors": {
                        "3": 1,
                        "A": 1,
                        "e": 1,
                        "i": 2,
                        "a": 3,
                        "b": 1,
                        "I": 2,
                        "E": 1,
                        "H": 1,
                        "l": 1,
                        "p": 1,
                        "m": 1,
                        "o": 1,
                        "s": 1
                    },
                    "duration": 60000,
                    "number_of_words": 17
                },
                {
                    "date": 1736765124515,
                    "wpm": 172.2635221738016,
                    "exoID": 1,
                    "acc": 0.03571428571428571,
                    "errors": {
                        "3": 1,
                        "l": 2,
                        "x": 1,
                        "i": 2,
                        "a": 3,
                        "b": 1,
                        "I": 2,
                        "E": 1,
                        "H": 1,
                        "p": 1,
                        "m": 1,
                        "o": 1,
                        "s": 1
                    },
                    "duration": 60000,
                    "number_of_words": 17
                },
                {
                    "date": 1736778090289,
                    "wpm": 17.388412475948403,
                    "exoID": 1,
                    "acc": 1,
                    "errors": {
                        "A": 4,
                        "H": 1
                    },
                    "duration": 60000,
                    "number_of_words": 17
                }
            ],
            "challenges": [],
            "customExos": [],
            "join_date": 1735376300664,
            "last_login_date": "2025-01-13T14:20:44.475Z",
            "theme": "light",
            "avatar_path": "./landing/16.jpeg",
            "bio": "Nothing about me yet",
            "role": "Admin",
            "recommendations": [
                "Focus on accuracy not on speed",
                "Try not to look on your keyboard even if your speed drops",
                "Good progress but practice every day"
            ]
        },
        "Paule": {
            "username": "Paule",
            "password": "paule",
            "email": "nobody@nothing.empty",
            "perf": [
                {
                    "date": 1735491222052,
                    "wpm": 9.383578737209884,
                    "exoID": 1,
                    "acc": 0.9148936170212766,
                    "errors": {
                        "3": 1,
                        " ": 4,
                        "H": 2
                    },
                    "duration": 60000,
                    "number_of_words": 12
                },
                {
                    "date": 1735491350597,
                    "wpm": 11.939110536265046,
                    "exoID": 2,
                    "acc": 0.95,
                    "errors": {
                        "h": 1,
                        "t": 1,
                        ".": 1,
                        "I": 1
                    },
                    "duration": 60000,
                    "number_of_words": 18
                },
                {
                    "date": 1735491733869,
                    "wpm": 12.875622288421937,
                    "exoID": 2,
                    "acc": 0.8850931677018633,
                    "errors": {
                        "a": 1,
                        "o": 3,
                        " ": 8,
                        "In": 1,
                        "It": 1,
                        ".": 1,
                        ",": 2,
                        "F": 1,
                        "h": 1,
                        "e": 1,
                        "Th": 1,
                        "Te": 1,
                        "t": 1,
                        "tt": 1,
                        "hr": 1,
                        "ea": 1,
                        "c": 1,
                        "u": 1,
                        "n": 1,
                        "“": 1
                    },
                    "duration": 300000,
                    "number_of_words": 81
                },
                {
                    "date": 1735523551326,
                    "wpm": 14.527363184079604,
                    "exoID": 3,
                    "acc": 0.958904109589041,
                    "errors": {
                        "d": 2,
                        "p": 1,
                        " ": 13,
                        "C": 1,
                        "Sa": 1
                    },
                    "duration": 60000,
                    "number_of_words": 24
                }
            ],
            "challenges": [],
            "customExos": [],
            "join_date": 1735491222052,
            "last_login_date": 1736745930787,
            "theme": "light",
            "avatar_path": "./landing/16.jpeg",
            "bio": "Nothing about me yet",
            "role": "Admin",
            "recommendations": [
                "Focus on accuracy not on speed",
                "Try not to look on your keyboard even if your speed drops"
            ]
        },
        "Nelson": {
            "username": "Nelson",
            "password": "nelson",
            "email": "nobody@nothing.empty",
            "perf": [],
            "challenges": [],
            "customExos": [],
            "join_date": 1736745930787,
            "last_login_date": 1736745930787,
            "theme": "light",
            "avatar_path": "./landing/16.jpeg",
            "bio": "Nothing about me yet",
            "role": "Admin",
            "recommendations": [
                "Focus on accuracy not on speed",
                "Try not to look on your keyboard even if your speed drops"
            ]
        },
        "alera joe": {
            "username": "alera joe",
            "password": "alera",
            "email": "nobody@nothing.empty",
            "perf": [
                {
                    "date": 1735578163920,
                    "wpm": 8.384628181666944,
                    "exoID": 1,
                    "acc": 0.5714285714285714,
                    "errors": {
                        "A": 1,
                        "I": 2,
                        "N": 2,
                        "G": 1,
                        " ": 2,
                        "E": 1,
                        "a": 1,
                        "U": 1,
                        "S": 1,
                        "J": 1,
                        "C": 1,
                        ".": 1,
                        "H": 1,
                        "e": 1,
                        "l": 1,
                        "s": 1,
                        "p": 1,
                        "m": 1,
                        "i": 1
                    },
                    "duration": 60000,
                    "number_of_words": 12
                },
                {
                    "date": 1735578285108,
                    "wpm": 6.568471337579619,
                    "exoID": 1,
                    "acc": 0.8787878787878788,
                    "errors": {
                        "3": 1,
                        " ": 1,
                        ".": 2
                    },
                    "duration": 60000,
                    "number_of_words": 11
                },
                {
                    "date": 1736765308560,
                    "wpm": 191.39846197664482,
                    "exoID": 1,
                    "acc": 0.03571428571428571,
                    "errors": {
                        "3": 1,
                        "A": 6,
                        "x": 1,
                        "i": 2,
                        "a": 3,
                        "b": 1,
                        "I": 2,
                        "E": 1,
                        "H": 1,
                        "l": 1,
                        "p": 1,
                        "m": 1,
                        "o": 1,
                        "s": 1
                    },
                    "duration": 60000,
                    "number_of_words": 17
                },
                {
                    "date": 1736765392154,
                    "wpm": 211.3259668508287,
                    "exoID": 1,
                    "acc": 0,
                    "errors": {
                        "3": 1,
                        "A": 5,
                        "l": 2,
                        "i": 2,
                        "a": 3,
                        "b": 1,
                        "I": 2,
                        "E": 1,
                        "H": 1,
                        "p": 1,
                        "m": 1,
                        "o": 1,
                        "s": 1
                    },
                    "duration": 60000,
                    "number_of_words": 17
                }
            ],
            "challenges": [],
            "customExos": [],
            "join_date": 1735578163920,
            "last_login_date": "2025-01-13T10:49:45.977Z",
            "theme": "light",
            "avatar_path": "./landing/16.jpeg",
            "bio": "Nothing about me yet",
            "role": "Admin",
            "recommendations": [
                "Focus on accuracy not on speed",
                "Try not to look on your keyboard even if your speed drops"
            ]
        },
        "Bilo": {
            "username": "Bilo",
            "password": 1234,
            "email": "nobody@nothing.empty",
            "perf": [],
            "challenges": [],
            "customExos": [],
            "join_date": 1736773749551,
            "last_login_date": 1736773749551,
            "theme": "light",
            "avatar_path": "/landing/16.jpeg",
            "bio": "Nothing about me yet",
            "role": "User"
        },
        "Naha": {
            "username": "Naha",
            "password": "naha",
            "email": "nobody@nothing.empty",
            "perf": [
                {
                    "date": 1736781727653,
                    "wpm": 30.408947920307586,
                    "exoID": 1,
                    "acc": 0.6206896551724138,
                    "errors": {
                        "A": 2,
                        " ": 1,
                        ".": 1,
                        "a": 2,
                        "m": 1,
                        "o": 1,
                        "s": 1
                    },
                    "duration": 60000,
                    "number_of_words": 17
                }
            ],
            "challenges": [],
            "customExos": [],
            "join_date": 1736781556865,
            "last_login_date": "2025-01-13T15:21:26.132Z",
            "theme": "light",
            "avatar_path": "/landing/16.jpeg",
            "bio": "Nothing about me yet",
            "role": "User",
            "recommendations": [
                "Focus on accuracy not on speed",
                "Try not to look on your keyboard even if your speed drops"
            ]
        },
        "dave": {
            "username": "dave",
            "password": "dave",
            "email": "nobody@nothing.empty",
            "perf": [
                {
                    "date": 1736784989114,
                    "wpm": 56.815350112135555,
                    "exoID": 1,
                    "acc": 0,
                    "errors": {
                        "3": 1,
                        "A": 1,
                        "l": 2,
                        "e": 2,
                        "x": 1,
                        " ": 48,
                        "i": 2,
                        "s": 2,
                        "a": 3,
                        "b": 1,
                        "o": 2,
                        "y": 1,
                        "n": 1,
                        "I": 2,
                        "E": 1,
                        "N": 1,
                        "t": 1,
                        "U": 1,
                        "S": 1,
                        "H": 1,
                        "p": 1,
                        "m": 1
                    },
                    "duration": 60000,
                    "number_of_words": 17
                }
            ],
            "challenges": [],
            "customExos": [],
            "join_date": 1736784899453,
            "last_login_date": "2025-01-13T16:15:49.867Z",
            "theme": "light",
            "avatar_path": "/landing/16.jpeg",
            "bio": "Nothing about me yet",
            "role": "User",
            "recommendations": [
                "Focus on accuracy not on speed",
                "Try not to look on your keyboard even if your speed drops"
            ]
        }
    },
    "exos": {
        "1": {
            "title": "Alex the boy",
            "exoID": 1,
            "text": "Alex is a boy in ING 3 EN at IUSJC. He likes programming and many other stuff",
            "timesAttempted": 12,
            "last_modified_date": 1736745930787
        },
        "2": {
            "title": "Max and a box",
            "exoID": 2,
            "text": "Max saw a box. It was red. He had a key. Does it fit? He tried. It worked!  Inside the box, Max found a note. It said, 'Find the cave.' The map showed a path. Max felt brave. He grabbed his bag and left.  The trail was rocky, but Max kept going. He climbed a tall hill and looked around. In the distance, he saw a dark cave. “That must be the place,” he thought. Max walked for hours until he reached the entrance.  The cave was cold, damp, and silent—except for the sound of dripping water. Max used a flashlight (battery-powered) to explore. Suddenly, he saw a shiny object: a golden compass! The compass had strange symbols: @, #, &, and %. It pointed east, so Max followed.  “Who enters my cave?” a voice boomed. Startled, Max replied, “I’m just an explorer!”  “Then solve this riddle,” the voice said. “What is greater than gold, cannot be bought, but is free to give?”  Max thought hard. “Is it... friendship?”  “Correct!” the voice said. A hidden door opened, revealing a treasure chest. Inside were priceless gems and a scroll that read: Adventure is the true treasure. Share it with the world!  ",
            "timesAttempted": 5,
            "last_modified_date": 1736745930787
        },
        "3": {
            "title": "Sam adventure",
            "exoID": 3,
            "text": "Sam had a map. The map was old. It led to a hill. On the hill was a hut. Can Sam find it?  Sam set off on the path. The day was hot. He felt the wind blow. As he walked, he saw the hut. It was small but looked safe.  Sam went inside the hut. The room was dark and quiet. On the table was a locked box. He found a note next to it. The note said to find a key.  Sam searched the hut for the key. He moved the rug and saw a trapdoor. Inside was a chest with strange symbols. It had letters and numbers like a1b2 and c3d4. Sam tried many codes until one worked.  Inside the chest was another map. It showed a cave deep in the forest. Sam packed his bag and set out. The trail was marked with symbols @, #, and &. He kept walking until he saw a glowing light.",
            "timesAttempted": 5,
            "last_modified_date": 1736745930787
        },
        "4": {
            "title": "Sam again",
            "exoID": 4,
            "text": "Sam had a box. The box was red. It had a lid.  He saw a key. The key was small. Does it fit?  Sam tried the key. The lid opened. Inside was a map.  The map was old. It showed a trail. The trail led to a hut.  Sam walked fast. The path was flat. He saw the hut.  The hut had a door. Sam pushed the door. It was dark inside.  He lit a lamp. The room had a table. On the table was a note.  The note said, 'Find the code.' The code opens the chest.  Sam looked for the chest. He moved the rug. Under the rug was a trapdoor.  Sam opened the trapdoor. A chest was there. The chest had symbols on it.  The symbols were letters and numbers: a1, b2, c3. What could they mean?  Sam thought hard. He tried the code b2c3a1. The chest clicked open.  Inside the chest was another note. This note had strange shapes.  The shapes were like @, &, and %. Sam needed a clue.  He checked the map again. The map pointed to a cave in the woods.  Sam packed his bag. He walked through the woods. The path was narrow and rough.  The trees were tall, and the air was cool. Sam kept going.  Finally, he saw the cave. It was dark and quiet.  Sam used a flashlight. The cave walls had drawings.  One drawing showed a sun. Another showed a key.  Sam found a stone door in the cave. On the door were buttons.  The buttons had symbols: @, #, $, %, and &.  Sam pressed the buttons in the order on the note: @, %, &, and #.  The door opened slowly. Behind it was a glowing crystal.  The crystal was bright and warm. It filled the cave with light.  Sam smiled. He had solved the mystery. The journey was the real prize.",
            "timesAttempted": 5,
            "last_modified_date": 1736745930787
        }
    },
    "numExos": 4,
    "numUser": 7,
    "exercises_today": 0,
    "avg_speed": 0,
    "today_logins": 0
}
// The line below is to initialise the data Base. Uncomment it if it is the first time you use this
// localStorage.setItem("DB", `{"users":{"Alex":{"username":"Alex","password":"alex","perf":[{"date":1735376300664,"wpm":22,"exoID":1,"acc":0.95,"errors":{"a":11},"duration":60000},{"date":1735490125131,"wpm":15.523932729624839,"exoID":2,"acc":0.8333333333333334,"errors":{"M":1,"s":2,"w":2,"a":1," ":3,"I":1,"In":1,"ns":1,"b":1,"o":1},"duration":60000,"number_of_words":22},{"date":1735569990392,"wpm":18.566889047864645,"exoID":4,"acc":0.8817204301075269,"errors":{" ":3,"H":1,"Ha":1,"ew":1,"?":1,"Sa":1},"duration":60000,"number_of_words":29},{"date":1735572535274,"wpm":0.8839616213329404,"exoID":4,"acc":1,"errors":{"h":1,"s":3,"w":1,"b":1,".":1,"m":1,"S":1,"d":1,"p":1,"e":1,"I":1},"duration":60000,"number_of_words":20},{"date":1735572634996,"wpm":19.303802716462958,"exoID":4,"acc":0.9896907216494846,"errors":{"h":1,"s":3,"w":1,"b":1,".":1,"m":1,"S":1,"d":1,"p":1,"e":1,"I":1},"duration":60000,"number_of_words":50},{"date":1735577851413,"wpm":21.63121550791758,"exoID":3,"acc":1,"errors":{"S":1,"d":2," ":1,"l":1,"h":1,"e":1,"w":1,"q":1,"u":1,"O":1,"g":1,"s":1},"duration":180000,"number_of_words":97},{"date":1735578676451,"wpm":20.952736384719962,"exoID":4,"acc":0.9809160305343512,"errors":{"1":1,"T":2,"o":1,".":3,"H":1,"s":4,"k":1,"D":1,"e":1,"f":1,"a":6,"w":3," ":2,"S":3,"n":1,"t":1,",":1,"u":1,"m":1,"?":1},"duration":300000,"number_of_words":141},{"date":1735580947528,"wpm":16.973408326954438,"exoID":2,"acc":0.9764705882352941,"errors":{"M":5,"x":2," ":1,"I":2,"k":3,",":2,"t":2,"d":1,".":2,"l":2,"v":1,"m":1,"r":2,"“":8,"T":1},"duration":180000,"number_of_words":68},{"date":1735581066949,"wpm":20.763663588719744,"exoID":4,"acc":0.9903846153846154,"errors":{"e":1,"h":1," ":1,".":1,"s":1,"a":1,"w":1,"I":1},"duration":60000,"number_of_words":31},{"date":1735727562417,"wpm":24.483702413535706,"exoID":3,"acc":0.975609756097561,"errors":{"s":1,".":2,"H":1,"e":1},"duration":60000,"number_of_words":40},{"date":1735727672330,"wpm":20.762972698687342,"exoID":2,"acc":0.9711538461538461,"errors":{"b":2,".":2,"I":1,"f":1," ":1,"'":1},"duration":60000,"number_of_words":29},{"date":1735728079621,"wpm":23.59190011429409,"exoID":3,"acc":0.976271186440678,"errors":{"u":2,"t":3,".":3," ":5,"p":1,"h":1,"s":4,"w":6,"a":4,"e":2,"o":3,"I":2,"d":1,"k":1,"b":2,"i":1,"y":1},"duration":300000,"number_of_words":160},{"date":1735728292152,"wpm":24.953420282140005,"exoID":3,"acc":0.912,"errors":{"T":2,"a":3,"s":2,"h":1,"O":1," ":1,"?":2,"o":1,".":2,"H":1,"e":1,"w":1,"b":1},"duration":60000,"number_of_words":40},{"date":1735728663840,"wpm":25.75232892747403,"exoID":1,"acc":0.9772727272727273,"errors":{"3":1,"I":1,"N":1},"duration":60000,"number_of_words":13}],"challenges":[],"customExos":[]},"Paule":{"username":"Paule","password":"paule","perf":[{"date":1735491222052,"wpm":9.383578737209884,"exoID":1,"acc":0.9148936170212766,"errors":{"3":1," ":4,"H":2},"duration":60000,"number_of_words":12},{"date":1735491350597,"wpm":11.939110536265046,"exoID":2,"acc":0.95,"errors":{"h":1,"t":1,".":1,"I":1},"duration":60000,"number_of_words":18},{"date":1735491733869,"wpm":12.875622288421937,"exoID":2,"acc":0.8850931677018633,"errors":{"a":1,"o":3," ":8,"In":1,"It":1,".":1,",":2,"F":1,"h":1,"e":1,"Th":1,"Te":1,"t":1,"tt":1,"hr":1,"ea":1,"c":1,"u":1,"n":1,"“":1},"duration":300000,"number_of_words":81},{"date":1735523551326,"wpm":14.527363184079604,"exoID":3,"acc":0.958904109589041,"errors":{"d":2,"p":1," ":13,"C":1,"Sa":1},"duration":60000,"number_of_words":24}],"challenges":[],"customExos":[],"avg_speed":0,"avg_acc":0},"Nelson":{"username":"Nelson","password":"nelson","perf":[],"challenges":[],"customExos":[],"avg_speed":0,"avg_acc":0},"alera joe":{"username":"alera joe","password":"alera","perf":[{"date":1735578163920,"wpm":8.384628181666944,"exoID":1,"acc":0.5714285714285714,"errors":{"A":1,"I":2,"N":2,"G":1," ":2,"E":1,"a":1,"U":1,"S":1,"J":1,"C":1,".":1,"H":1,"e":1,"l":1,"s":1,"p":1,"m":1,"i":1},"duration":60000,"number_of_words":12},{"date":1735578285108,"wpm":6.568471337579619,"exoID":1,"acc":0.8787878787878788,"errors":{"3":1," ":1,".":2},"duration":60000,"number_of_words":11}],"challenges":[],"customExos":[]}},"exos":{"1":{"exoID":1,"text":"Alex is a boy in ING 3 EN at IUSJC. He likes programming","duration":60000,"timesAttempted":4},"2":{"exoID":2,"text":"Max saw a box. It was red. He had a key. Does it fit? He tried. It worked!  Inside the box, Max found a note. It said, 'Find the cave.' The map showed a path. Max felt brave. He grabbed his bag and left.  The trail was rocky, but Max kept going. He climbed a tall hill and looked around. In the distance, he saw a dark cave. “That must be the place,” he thought. Max walked for hours until he reached the entrance.  The cave was cold, damp, and silent—except for the sound of dripping water. Max used a flashlight (battery-powered) to explore. Suddenly, he saw a shiny object: a golden compass! The compass had strange symbols: @, #, &, and %. It pointed east, so Max followed.  “Who enters my cave?” a voice boomed. Startled, Max replied, “I’m just an explorer!”  “Then solve this riddle,” the voice said. “What is greater than gold, cannot be bought, but is free to give?”  Max thought hard. “Is it... friendship?”  “Correct!” the voice said. A hidden door opened, revealing a treasure chest. Inside were priceless gems and a scroll that read: Adventure is the true treasure. Share it with the world!  ","duration":300000,"timesAttempted":5},"3":{"exoID":3,"text":"Sam had a map. The map was old. It led to a hill. On the hill was a hut. Can Sam find it?  Sam set off on the path. The day was hot. He felt the wind blow. As he walked, he saw the hut. It was small but looked safe.  Sam went inside the hut. The room was dark and quiet. On the table was a locked box. He found a note next to it. The note said to find a key.  Sam searched the hut for the key. He moved the rug and saw a trapdoor. Inside was a chest with strange symbols. It had letters and numbers like a1b2 and c3d4. Sam tried many codes until one worked.  Inside the chest was another map. It showed a cave deep in the forest. Sam packed his bag and set out. The trail was marked with symbols @, #, and &. He kept walking until he saw a glowing light.","duration":300000,"timesAttempted":5},"4":{"exoID":4,"text":"Sam had a box. The box was red. It had a lid.  He saw a key. The key was small. Does it fit?  Sam tried the key. The lid opened. Inside was a map.  The map was old. It showed a trail. The trail led to a hut.  Sam walked fast. The path was flat. He saw the hut.  The hut had a door. Sam pushed the door. It was dark inside.  He lit a lamp. The room had a table. On the table was a note.  The note said, 'Find the code.' The code opens the chest.  Sam looked for the chest. He moved the rug. Under the rug was a trapdoor.  Sam opened the trapdoor. A chest was there. The chest had symbols on it.  The symbols were letters and numbers: a1, b2, c3. What could they mean?  Sam thought hard. He tried the code b2c3a1. The chest clicked open.  Inside the chest was another note. This note had strange shapes.  The shapes were like @, &, and %. Sam needed a clue.  He checked the map again. The map pointed to a cave in the woods.  Sam packed his bag. He walked through the woods. The path was narrow and rough.  The trees were tall, and the air was cool. Sam kept going.  Finally, he saw the cave. It was dark and quiet.  Sam used a flashlight. The cave walls had drawings.  One drawing showed a sun. Another showed a key.  Sam found a stone door in the cave. On the door were buttons.  The buttons had symbols: @, #, $, %, and &.  Sam pressed the buttons in the order on the note: @, %, &, and #.  The door opened slowly. Behind it was a glowing crystal.  The crystal was bright and warm. It filled the cave with light.  Sam smiled. He had solved the mystery. The journey was the real prize.","duration":300000,"timesAttempted":5}},"numExos":4,"numUser":4}`.replaceAll("\n", " "))
let jsonDB = DB.load()
// jsonDB = JSON.parse(jsonDB)
console.log(jsonDB);
