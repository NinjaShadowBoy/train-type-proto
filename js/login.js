import { DB, User } from "./model.js"

$(document).ready(function () {
    let db = DB.load()

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
                    const pathParts = window.location.pathname.split("/");
                    pathParts[pathParts.length - 1] = "dash.html";
                    window.location.href = pathParts.join("/")
                    console.log(user);
                }, 800)
            }
        } else {
            db.addUser(new User(username, password))
        }
    });
});