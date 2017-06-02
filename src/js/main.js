window.onload = (function () {
    console.info("Js onload function invoked");
    $("[data-users=signup]").off();
    $("[data-users=signup]").on("click", function (e) {
        e.preventDefault();
        const fname = $("[data-users=firstname]").val().trim();
        const lname = $("[data-users=lastname]").val().trim();
        const email = $("[data-users=email]").val().trim();
        const password = $("[data-users=password]").val().trim();
        addUser(fname, lname, email, password);
        return false;
    });

    $("[data-users=login]").off();
    $("[data-users=login]").on("click", function (e) {
        e.preventDefault();
        const email = $("[data-users=email]").val().trim();
        const password = $("[data-users=password]").val().trim();
        logIn(email, password);
        return false;
    });

    $("[data-action=toggle_blog_form]").off();
    $("[data-action=toggle_blog_form]").on("click", (e) => {
        $("#blog_form").slideToggle();
        return true;
    });


    $("[data-blog_delete]").off();
    $("[data-blog_delete]").on("click", function () {
        let $this = $(this);
        let id = $this.data().blog_delete;
        $(`[data-blog=${id}]`).slideToggle();
    });

    $("[data-blog_edit]").off();
    $("[data-blog_edit]").on("click", function () {
        let $this = $(this);
        console.log("edit func hit");
        let edit_promise = new Promise((resolve, reject) => {
            let id = $this.data().blog_edit;
            let url = `/blog/edit/${id}`
            $.ajax({
                url,
                type: "GET",
                success: function (html) {
                    let res_arr = [html, id]
                    resolve(res_arr);
                },
                error: function (error) {
                    console.log(error);
                    reject(error);
                }
            })
        });

        edit_promise.then((arr) => {
            let html = arr[0];
            let id = arr[1];
            let $blog = $(`[data-blog=${id}]`);
            $blog.fadeOut();

            setTimeout(function () {
                let oldHtml = $blog.html();
                $blog.html(html);
                $blog.fadeIn();
                let tag_action = $blog.find("[data-action=tags_input]");
                console.log(tag_action)
                tag_action.off();
                tag_action.on("click", function () {
                    let $this = $(this);
                    console.log("tag action invoked")
                    let $input = $this.find("input");
                    $input.hide();
                    $input.attr("type", "text");
                    $input.fadeToggle();
                    $this.off();
                    let $addBtn = $this.find("i")
                    $addBtn.toggleClass("fa-plus")
                    $addBtn.toggleClass("fa-times")
                    $addBtn.off();
                    $addBtn.on("click", function () {
                        let $this = $(this)
                        $this.toggleClass("fa-plus")
                        $this.toggleClass("fa-times")
                        $input.fadeToggle();
                    })
                })
                let cancel_action = $blog.find("[data-blog_edit_cancel]");
                console.log(tag_action)
                cancel_action.off();
                cancel_action.on("click", function () {
                    $blog.html(oldHtml);
                })
            }, 250)

        });
        edit_promise.catch((error) => {
            alert("Error, see log");
            console.error(error);
        });
    });
})();

function addUser(firstname, lastname, email, password) {
    const data = { firstname, lastname, email, password };
    $.ajax({
        url: "/users/addUser",
        type: "post",
        data,
        success: function (res) {
            if (res) {
                // const url = window.location.origin;
                // window.location = `${url}/`
                console.log("RESPONCE", res)
                if (res.error) {
                    console.error(res.message);
                }
            }
        },
        error: function (err) {
            console.log(err)
        }
    })
}

function logIn(email, password) {
    const data = { email, password };

    const AUTH = new Promise((resolve, reject) => {
        $.ajax({
            url: "/api/authenticate",
            type: "POST",
            data,
            success: function (res) {
                resolve(res)
            },
            error: function (err) {
                reject(err);
            }
        })
    });


    AUTH.then(function (res) {  // set token
        let token = JSON.stringify(res);
        return token;
    }).then(function (token) {
        var d = new Date();
        d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        return document.cookie = `token=${token}; ${expires}; path=/`;
    }).then(function () {
        return window.location = "/"; // go home
    }).catch(errCallback);
}

function errCallback(err) {
    return console.error(err);
}


function getProducts() {
    $.ajax({
        url: "/amazon/getItemsTest",
        type: "GET",
        success: function (html) {
            $(".amazon-item-select").html(html);
        },
        error: function (err) {
            console.log(err)
        },
        complete: function () {
            console.log("done.")
        }
    })
}
