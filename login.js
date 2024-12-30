import { DB, User } from "./model.js"

let jsonDB = localStorage.getItem("DB")
jsonDB = JSON.parse(jsonDB)
let db = new DB(jsonDB.users, jsonDB.exos)

$(".login-form").on("submit", function (event) {
    event.preventDefault();

    let action = $(document.activeElement).val()
    let username = $(".username")[0].value
    let password = $(".password")[0].value

    if (action === "LOGIN") {
        let user = db.authenticateUser(username, password)
        if (user) {
            sessionStorage.setItem("user", JSON.stringify(user))
            $("body").css("transition", "all 1s ease")
                .css("transform", "translateX(100vw)")

            setTimeout(function () {
                window.location.href = "dash.html"
                console.log(user);
            }, 1000)
            
        }
    } else {
        db.addUser(new User(username, password))
    }
});