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


    getProducts();


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
    $.ajax({
        url: "/api/authenticate",
        type: "POST",
        data,
        success: function (res) {
            if (res) {
                console.log("RESPONCE", res)
                if (res.error) {
                    console.error(res.message);
                } else {
                    const url = window.location.origin;
                    window.location = `${url}/`
                }
            }
        },
        error: function (err) {
            console.log(err)
        }
    })
}


function getProducts(){
    $.ajax({
        url: "/amazon/getItemsTest",
        type: "GET",
        success: function(html){
            $(".amazon-item-select").html(html);
        },
        error: function(err){
            console.log(err)
        },
        complete: function(){
            console.log("done.")
        }
    })
}
