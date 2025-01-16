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
        this.avatar_path = "../landing/16.jpeg"
        this.bio = "Nothing about me yet"
        this.role = role
        this.recommendations = ["Focus on accuracy not on speed", "Try not to look on your keyboard even if your speed drops"]
    }

    // This is used for the current user
    static load() {
        let jsonUserString = sessionStorage.getItem("user")
        let jsonUser = JSON.parse(jsonUserString)
        let user = User.loadUser(jsonUser)
        user.last_login_date = (new Date()).getTime()
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
        user.email = obj.email || "nobody@nothing.empty"
        user.join_date = obj.join_date || user.perf[0]?.date || now
        // user.last_login_date = obj.last_login_date || now
        user.theme = obj.theme || "dark"
        user.avatar_path = obj.avatar_path || "../landing/16.jpeg"
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
            if (/\s/.test(user.username)) {
                alert("Please no white spaces in username")
                return false
            }
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
            "email": "alex@nothing.empty",
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
                },
                {
                    "date": 1736942711496,
                    "wpm": 21.20817036071273,
                    "exoID": 1,
                    "acc": 1,
                    "errors": {
                        "A": 1,
                        " ": 1,
                        "i": 1
                    },
                    "duration": 60000,
                    "number_of_words": 17
                },
                {
                    "date": 1736942760057,
                    "wpm": 155.9526572290555,
                    "exoID": 1,
                    "acc": 0.017857142857142856,
                    "errors": {
                        "3": 1,
                        "A": 1,
                        "e": 1,
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
                    "date": 1736942820807,
                    "wpm": 27.626811594202895,
                    "exoID": 1,
                    "acc": 1,
                    "errors": {
                        "J": 1
                    },
                    "duration": 60000,
                    "number_of_words": 17
                },
                {
                    "date": 1736944639824,
                    "wpm": 24.636510500807756,
                    "exoID": 1,
                    "acc": 0.9836065573770492,
                    "errors": {
                        "3": 1
                    },
                    "duration": 60000,
                    "number_of_words": 17
                }
            ],
            "challenges": [],
            "customExos": [],
            "join_date": 1735376300664,
            "last_login_date": 1736986550777,
            "theme": "light",
            "avatar_path": "data:image/webp;base64,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",
            "bio": "I am an Admin alex",
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
            "last_login_date": 1736986550778,
            "theme": "dark",
            "avatar_path": "../landing/16.jpeg",
            "bio": "Nothing about me yet",
            "role": "Admin",
            "recommendations": []
        },
        "Nelson": {
            "username": "Nelson",
            "password": "nelson",
            "email": "nobody@nothing.empty",
            "perf": [],
            "challenges": [],
            "customExos": [],
            "join_date": 1736745930787,
            "last_login_date": 1736986550778,
            "theme": "light",
            "avatar_path": "../landing/16.jpeg",
            "bio": "Nothing about me yet",
            "role": "User",
            "recommendations": [
                "Focus on accuracy not on speed"
            ]
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
            "last_login_date": 1736986550778,
            "theme": "light",
            "avatar_path": "../landing/16.jpeg",
            "bio": "Nothing about me yet",
            "role": "User",
            "recommendations": [
                "Focus on accuracy not on speed"
            ]
        },
        "Simon": {
            "username": "Simon",
            "password": 1234,
            "email": "nobody@nothing.empty",
            "perf": [],
            "challenges": [],
            "customExos": [],
            "join_date": 1736962342729,
            "last_login_date": 1736986550778,
            "theme": "light",
            "avatar_path": "../landing/16.jpeg",
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
            "title": "Alex and the Code",
            "exoID": 1,
            "text": "Alex is a boy in ING 3 EN at IUSJC. He likes programming and many other things. One day, while working on his computer, he encountered a problem. His program wasn’t running correctly. He stared at the screen, puzzled. The code had errors.\n\nHe reviewed the lines carefully. The first part was fine. The variables were declared. But then he noticed something. The logic was off. He corrected it.\n\nBut the program still didn’t work. It was frustrating. Alex decided to take a break and come back later with fresh eyes.\n\nLater that evening, he sat down again, feeling determined. He started debugging. Step by step, he tracked the error. It was a missing semicolon, a tiny mistake, but it caused everything to break.\n\nAlex fixed it. The program ran smoothly. It wasn’t a huge achievement, but to him, it felt like solving a complex puzzle. The satisfaction of finding the problem and fixing it was rewarding.\n\nHe leaned back, thinking about how programming was not just about writing code, but about problem-solving, perseverance, and continuous learning. It was these small victories that kept him going.",
            "timesAttempted": 16,
            "last_modified_date": 1736981935363
        },
        "2": {
            "title": "The Treasure of Friendship",
            "exoID": 2,
            "text": "Max found a box. It was red. He had a key. He tried it. It worked! Inside was a note. Find the cave. The map showed a path. Max grabbed his bag and left.\n\nThe trail was rocky. Max climbed a hill. In the distance, a cave appeared. He walked for hours until he reached the entrance.\n\nThe cave was cold and dark. Max used a flashlight. He saw something shiny: a golden compass! It had symbols: @, #, &, %. It pointed east. Max followed.\n\nWho enters my cave? a voice boomed. Max replied, I’m an explorer!\n\nAnswer this riddle, the voice said. What is greater than gold, cannot be bought, but is free to give?\n\nMax thought. Is it... friendship?\n\nCorrect! the voice said. A door opened. Inside was a chest filled with gems and a scroll: Adventure is the true treasure. Share it with the world!",
            "timesAttempted": 5,
            "last_modified_date": 1736981703018
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
            "text": "Sam had a box. It was red. It had a lid. Inside was a small key. Sam tried the key. The lid opened. Inside was a map. The map showed a trail to a hut.\n\nSam walked fast. The path was easy. He saw the hut. It had a door. Sam opened it. It was dark inside. He lit a lamp. On the table was a note.\n\nThe note said: \"Find the code.\" Sam searched. He moved a rug. Under it was a trapdoor. He opened it. There was a chest with symbols: a1, b2, c3.\n\nSam thought. He tried b2c3a1. The chest opened. Inside was another note with symbols: @, %, &. Sam checked the map again. It led to a cave.\n\nSam packed his bag and walked through the woods. The path was narrow. The trees were tall. He found the cave. Inside, there were strange drawings. One showed a sun, another a key.\n\nSam found a door with buttons: @, #, $, %, &. He pressed the buttons in the order: @, %, &, #. The door opened, revealing a glowing crystal.\n\nThe crystal filled the cave with light. Sam smiled. The mystery was solved, and the journey was the real prize@achievement.",
            "timesAttempted": 5,
            "last_modified_date": 1736981515038
        },
        "5": {
            "title": "Happiness Is A Poblem",
            "exoID": 5,
            "text": "About twenty-five hundred years ago, in the Himalayan foothills of present-day Nepal, there lived in a great palace a king who was going to have a son.\nFor this son the king had a particularly grand idea: he would make the child’s\nlife perfect. The child would never know a moment of suffering every need,\nevery desire, would be accounted for at all times.\nThe king built high walls around the palace that prevented the prince\nfrom knowing the outside world. He spoiled the child, lavishing him with\nfood and gifts, surrounding him with servants who catered to his every whim.\nAnd just as planned, the child grew up ignorant of the routine cruelties of human existence.\nAll of the prince’s childhood went on like this. But despite the endless\nluxury and opulence, the prince became kind of a pissed-off young man.\nSoon, every experience felt empty and valueless. The problem was that no\nmatter what his father gave him, it never seemed enough, never meant\nanything.\nSo late one night, the prince snuck out of the palace to see what was\nbeyond its walls. He had a servant drive him through the local village, and\nwhat he saw horrified him.\nFor the first time in his life, the prince saw human suffering. He saw sick\npeople, old people, homeless people, people in pain, even people dying.\nThe prince returned to the palace and found himself in a sort of existential\ncrisis. Not knowing how to process what he’d seen, he got all emo about\neverything and complained a lot. And, as is so typical of young men, the\nprince ended up blaming his father for the very things his father had tried to\ndo for him. It was the riches, the prince thought, that had made him so\nmiserable, that had made life seem so meaningless. He decided to run away.\nBut the prince was more like his father than he knew. He had grand ideas\ntoo. He wouldn’t just run away; he would give up his royalty, his family, and\nall of his possessions and live in the streets, sleeping in dirt like an animal.\nThere he would starve himself, torture himself, and beg for scraps of food\nfrom strangers for the rest of his life.\nThe next night, the prince snuck out of the palace again, this time never to\nreturn. For years he lived as a bum, a discarded and forgotten remnant of\nsociety, the dog shit caked to the bottom of the social totem pole. And as\nplanned, the prince suffered greatly. He suffered through disease, hunger,\npain, loneliness, and decay. He confronted the brink of death itself, often\nlimited to eating a single nut each day.\nA few years went by. Then a few more. And then . . . nothing happened.\nThe prince began to notice that this life of suffering wasn’t all that it was\ncracked up to be. It wasn’t bringing him the insight he had desired. It wasn’t\nrevealing any deeper mystery of the world or its ultimate purpose.\nIn fact, the prince came to know what the rest of us have always kind of\nknown: that suffering totally sucks. And it’s not necessarily that meaningful\neither. As with being rich, there is no value in suffering when it’s done\nwithout purpose. And soon the prince came to the conclusion that his grand\nidea, like his father’s, was in fact a fucking terrible idea and he should\nprobably go do something else instead.\nTotally confused, the prince cleaned himself up and went and found a big\ntree near a river. He decided that he would sit under that tree and not get up\nuntil he came up with another grand idea.\nAs the legend goes, the confused prince sat under that tree for forty-nine\ndays. We won’t delve into the biological viability of sitting in the same spot\nfor forty-nine days, but let’s just say that in that time the prince came to a\nnumber of profound realizations.\nOne of those realizations was this: that life itself is a form of suffering.\nThe rich suffer because of their riches. The poor suffer because of their\npoverty. People without a family suffer because they have no family. People\nwith a family suffer because of their family. People who pursue worldly\npleasures suffer because of their worldly pleasures. People who abstain from\nworldly pleasures suffer because of their abstention.\nThis isn’t to say that all suffering is equal. Some suffering is certainly\nmore painful than other suffering. But we all must suffer nonetheless.\nYears later, the prince would build his own philosophy and share it with\nthe world, and this would be its first and central tenet: that pain and loss are\ninevitable and we should let go of trying to resist them. The prince would\nlater become known as the Buddha. And in case you haven’t heard of him, he\nwas kind of a big deal.",
            "timesAttempted": 0,
            "last_modified_date": "2025-01-14T13:17:59.653Z"
        },
        "6": {
            "title": "The Brave Quest of Cat and Dog",
            "exoID": 6,
            "text": "The cat ran as the sun set, its glow painting the sky red. A dog sat nearby, and soon they met. Together, they climbed a hill and saw a massive tree, where the dog unearthed a mysterious map. The map led them to a shadowy, frigid cave with towering stone walls. Inside, they discovered glimmering gold, radiant gems, and a fluttering bat that startled the dog, causing the cat to hiss. Deep in the cavern, they encountered an ancient chest with a riddle: I am not alive, but I can grow. I do not breathe, but I need air. I do not drink, but I need water. The dog triumphantly answered, A fire! and the chest creaked open, revealing an intricately designed golden key. The key fit perfectly into an ornate, concealed door, which swung open to unveil a resplendent chamber overflowing with treasures@jewels! Magnificent crowns#elaborate-rings&swordspriceless-coins glittered brilliantly. Overwhelmed with awe, the cat and dog basked in the magnificence of their discovery, cherishing their extraordinary bravery#unwavering-teamwork% as they departed the cave as celebrated adventurers&inseparable-companionsforever.",
            "timesAttempted": 0,
            "last_modified_date": "2025-01-15T22:28:58.047Z"
        },
        "7": {
            "title": "The Quest for the Enchanted River",
            "exoID": 7,
            "text": "The bird flew. The rabbit ran. The bird stopped. The rabbit stopped too. The rabbit spoke. There is a river, it said. It is special. The bird looked down. They both walked. The air was still. The path was long.\n\nThey came to a hill. The river stretched below, glowing like liquid silver. The bird and the rabbit walked down the slope. They reached the riverbank.\n\nThe rabbit jumped into the river. The bird flew low. They followed the river as it twisted through the forest. The river sang a soft song, calling them forward. The river led them to a stone with ancient symbols. The rabbit deciphered the runes. They spoke of hidden treasure beneath the water's surface.\n\nThe bird and rabbit dove into the cold, clear water, diving deep into a cavern hidden beneath the river. The cavern sparkled with ethereal light, and the walls were lined with precious gems and glittering metals. The treasure was vast—golden coins, ornate jewelry, and priceless relics from an ancient civilization.\n\nThe bird and rabbit marveled at the treasures@unfathomable. The bond of their friendship, tested by time and perseverance, had led them to this extraordinary place, a place where the weight of their bravery#determination would be forever etched in the sands of time~and their adventure would be remembered as legendary.",
            "timesAttempted": 0,
            "last_modified_date": "2025-01-15T22:37:43.466Z"
        },
        "8": {
            "title": "The Secret of the Hidden Meadow",
            "exoID": 8,
            "text": "The fox ran fast. The sun set. The wind blew. The fox stopped. It saw a rock. The rock was big. The fox moved the rock. Under it was a box. The box had a key. The fox took the key. It looked around. There was a tree. The tree had a hole. The key fit. The tree opened. Inside, there was a book. The book was old.\n\nThe book told of treasure. The fox walked to the treasure. It passed through the field. The field was large and wild. The fox found a cave. The cave was dark, but inside, the walls shimmered. There was a large chest. The chest was heavy. The fox opened the chest. Inside were coins. There were gems. There were crowns, and ornate rings.\n\nThe fox smiled. It had uncovered a vast treasure@astonishing. The journey was long but full of challenges, which it overcame through courage#perseverance. The treasure was beyond riches~it was a symbol of its daring adventure.",
            "timesAttempted": 0,
            "last_modified_date": "2025-01-15T22:38:31.063Z"
        }
    },
    "numExos": 8,
    "numUser": 5,
    "exercises_today": 0,
    "avg_speed": 0,
    "today_logins": 0
}
// The line below is to initialise the data Base. Uncomment it if it is the first time you use this
// localStorage.setItem("DB", `{"users":{"Alex":{"username":"Alex","password":"alex","perf":[{"date":1735376300664,"wpm":22,"exoID":1,"acc":0.95,"errors":{"a":11},"duration":60000},{"date":1735490125131,"wpm":15.523932729624839,"exoID":2,"acc":0.8333333333333334,"errors":{"M":1,"s":2,"w":2,"a":1," ":3,"I":1,"In":1,"ns":1,"b":1,"o":1},"duration":60000,"number_of_words":22},{"date":1735569990392,"wpm":18.566889047864645,"exoID":4,"acc":0.8817204301075269,"errors":{" ":3,"H":1,"Ha":1,"ew":1,"?":1,"Sa":1},"duration":60000,"number_of_words":29},{"date":1735572535274,"wpm":0.8839616213329404,"exoID":4,"acc":1,"errors":{"h":1,"s":3,"w":1,"b":1,".":1,"m":1,"S":1,"d":1,"p":1,"e":1,"I":1},"duration":60000,"number_of_words":20},{"date":1735572634996,"wpm":19.303802716462958,"exoID":4,"acc":0.9896907216494846,"errors":{"h":1,"s":3,"w":1,"b":1,".":1,"m":1,"S":1,"d":1,"p":1,"e":1,"I":1},"duration":60000,"number_of_words":50},{"date":1735577851413,"wpm":21.63121550791758,"exoID":3,"acc":1,"errors":{"S":1,"d":2," ":1,"l":1,"h":1,"e":1,"w":1,"q":1,"u":1,"O":1,"g":1,"s":1},"duration":180000,"number_of_words":97},{"date":1735578676451,"wpm":20.952736384719962,"exoID":4,"acc":0.9809160305343512,"errors":{"1":1,"T":2,"o":1,".":3,"H":1,"s":4,"k":1,"D":1,"e":1,"f":1,"a":6,"w":3," ":2,"S":3,"n":1,"t":1,",":1,"u":1,"m":1,"?":1},"duration":300000,"number_of_words":141},{"date":1735580947528,"wpm":16.973408326954438,"exoID":2,"acc":0.9764705882352941,"errors":{"M":5,"x":2," ":1,"I":2,"k":3,",":2,"t":2,"d":1,".":2,"l":2,"v":1,"m":1,"r":2,"“":8,"T":1},"duration":180000,"number_of_words":68},{"date":1735581066949,"wpm":20.763663588719744,"exoID":4,"acc":0.9903846153846154,"errors":{"e":1,"h":1," ":1,".":1,"s":1,"a":1,"w":1,"I":1},"duration":60000,"number_of_words":31},{"date":1735727562417,"wpm":24.483702413535706,"exoID":3,"acc":0.975609756097561,"errors":{"s":1,".":2,"H":1,"e":1},"duration":60000,"number_of_words":40},{"date":1735727672330,"wpm":20.762972698687342,"exoID":2,"acc":0.9711538461538461,"errors":{"b":2,".":2,"I":1,"f":1," ":1,"'":1},"duration":60000,"number_of_words":29},{"date":1735728079621,"wpm":23.59190011429409,"exoID":3,"acc":0.976271186440678,"errors":{"u":2,"t":3,".":3," ":5,"p":1,"h":1,"s":4,"w":6,"a":4,"e":2,"o":3,"I":2,"d":1,"k":1,"b":2,"i":1,"y":1},"duration":300000,"number_of_words":160},{"date":1735728292152,"wpm":24.953420282140005,"exoID":3,"acc":0.912,"errors":{"T":2,"a":3,"s":2,"h":1,"O":1," ":1,"?":2,"o":1,".":2,"H":1,"e":1,"w":1,"b":1},"duration":60000,"number_of_words":40},{"date":1735728663840,"wpm":25.75232892747403,"exoID":1,"acc":0.9772727272727273,"errors":{"3":1,"I":1,"N":1},"duration":60000,"number_of_words":13}],"challenges":[],"customExos":[]},"Paule":{"username":"Paule","password":"paule","perf":[{"date":1735491222052,"wpm":9.383578737209884,"exoID":1,"acc":0.9148936170212766,"errors":{"3":1," ":4,"H":2},"duration":60000,"number_of_words":12},{"date":1735491350597,"wpm":11.939110536265046,"exoID":2,"acc":0.95,"errors":{"h":1,"t":1,".":1,"I":1},"duration":60000,"number_of_words":18},{"date":1735491733869,"wpm":12.875622288421937,"exoID":2,"acc":0.8850931677018633,"errors":{"a":1,"o":3," ":8,"In":1,"It":1,".":1,",":2,"F":1,"h":1,"e":1,"Th":1,"Te":1,"t":1,"tt":1,"hr":1,"ea":1,"c":1,"u":1,"n":1,"“":1},"duration":300000,"number_of_words":81},{"date":1735523551326,"wpm":14.527363184079604,"exoID":3,"acc":0.958904109589041,"errors":{"d":2,"p":1," ":13,"C":1,"Sa":1},"duration":60000,"number_of_words":24}],"challenges":[],"customExos":[],"avg_speed":0,"avg_acc":0},"Nelson":{"username":"Nelson","password":"nelson","perf":[],"challenges":[],"customExos":[],"avg_speed":0,"avg_acc":0},"alera joe":{"username":"alera joe","password":"alera","perf":[{"date":1735578163920,"wpm":8.384628181666944,"exoID":1,"acc":0.5714285714285714,"errors":{"A":1,"I":2,"N":2,"G":1," ":2,"E":1,"a":1,"U":1,"S":1,"J":1,"C":1,".":1,"H":1,"e":1,"l":1,"s":1,"p":1,"m":1,"i":1},"duration":60000,"number_of_words":12},{"date":1735578285108,"wpm":6.568471337579619,"exoID":1,"acc":0.8787878787878788,"errors":{"3":1," ":1,".":2},"duration":60000,"number_of_words":11}],"challenges":[],"customExos":[]}},"exos":{"1":{"exoID":1,"text":"Alex is a boy in ING 3 EN at IUSJC. He likes programming","duration":60000,"timesAttempted":4},"2":{"exoID":2,"text":"Max saw a box. It was red. He had a key. Does it fit? He tried. It worked!  Inside the box, Max found a note. It said, 'Find the cave.' The map showed a path. Max felt brave. He grabbed his bag and left.  The trail was rocky, but Max kept going. He climbed a tall hill and looked around. In the distance, he saw a dark cave. “That must be the place,” he thought. Max walked for hours until he reached the entrance.  The cave was cold, damp, and silent—except for the sound of dripping water. Max used a flashlight (battery-powered) to explore. Suddenly, he saw a shiny object: a golden compass! The compass had strange symbols: @, #, &, and %. It pointed east, so Max followed.  “Who enters my cave?” a voice boomed. Startled, Max replied, “I’m just an explorer!”  “Then solve this riddle,” the voice said. “What is greater than gold, cannot be bought, but is free to give?”  Max thought hard. “Is it... friendship?”  “Correct!” the voice said. A hidden door opened, revealing a treasure chest. Inside were priceless gems and a scroll that read: Adventure is the true treasure. Share it with the world!  ","duration":300000,"timesAttempted":5},"3":{"exoID":3,"text":"Sam had a map. The map was old. It led to a hill. On the hill was a hut. Can Sam find it?  Sam set off on the path. The day was hot. He felt the wind blow. As he walked, he saw the hut. It was small but looked safe.  Sam went inside the hut. The room was dark and quiet. On the table was a locked box. He found a note next to it. The note said to find a key.  Sam searched the hut for the key. He moved the rug and saw a trapdoor. Inside was a chest with strange symbols. It had letters and numbers like a1b2 and c3d4. Sam tried many codes until one worked.  Inside the chest was another map. It showed a cave deep in the forest. Sam packed his bag and set out. The trail was marked with symbols @, #, and &. He kept walking until he saw a glowing light.","duration":300000,"timesAttempted":5},"4":{"exoID":4,"text":"Sam had a box. The box was red. It had a lid.  He saw a key. The key was small. Does it fit?  Sam tried the key. The lid opened. Inside was a map.  The map was old. It showed a trail. The trail led to a hut.  Sam walked fast. The path was flat. He saw the hut.  The hut had a door. Sam pushed the door. It was dark inside.  He lit a lamp. The room had a table. On the table was a note.  The note said, 'Find the code.' The code opens the chest.  Sam looked for the chest. He moved the rug. Under the rug was a trapdoor.  Sam opened the trapdoor. A chest was there. The chest had symbols on it.  The symbols were letters and numbers: a1, b2, c3. What could they mean?  Sam thought hard. He tried the code b2c3a1. The chest clicked open.  Inside the chest was another note. This note had strange shapes.  The shapes were like @, &, and %. Sam needed a clue.  He checked the map again. The map pointed to a cave in the woods.  Sam packed his bag. He walked through the woods. The path was narrow and rough.  The trees were tall, and the air was cool. Sam kept going.  Finally, he saw the cave. It was dark and quiet.  Sam used a flashlight. The cave walls had drawings.  One drawing showed a sun. Another showed a key.  Sam found a stone door in the cave. On the door were buttons.  The buttons had symbols: @, #, $, %, and &.  Sam pressed the buttons in the order on the note: @, %, &, and #.  The door opened slowly. Behind it was a glowing crystal.  The crystal was bright and warm. It filled the cave with light.  Sam smiled. He had solved the mystery. The journey was the real prize.","duration":300000,"timesAttempted":5}},"numExos":4,"numUser":4}`.replaceAll("\n", " "))
let jsonDB = DB.load()
// jsonDB = JSON.parse(jsonDB)
console.log(jsonDB);
