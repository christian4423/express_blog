﻿window.onload = (function () {


    console.info("Js onload function invoked");
    if (window.io) {

        var socket = io.connect('http://localhost:8081');
        socket.on('connect', function (data) {
            socket.emit('join', 'Hello World from client');
        });


        socket.on('new_blog', function (data) {
            $(".blog_container").prepend(data)
        });
        socket.on('blog_pop', function (data) {
            let $s = $(`[data-shoveit_badge=${data.blog_id}]`);
            let $d = $(`[data-digit_badge=${data.blog_id}]`);
            $s.text(data.negative);
            if (data.negative === 0) {
                $s.removeClass("badge--red");
            } else {
                $s.addClass("badge--red");
            }
            $d.text(data.positive)
            if (data.positive === 0) {
                $d.removeClass("badge--green");
            } else {
                $d.addClass("badge--green");
            }
            $(`[data-digit=${data.blog_id}]`).off();
            $(`[data-shoveit=${data.blog_id}]`).off();
        });
    }
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

    $("[data-shoveit]").off();
    $("[data-shoveit]").on("click", function (e) {
        let blog_id = $(this).data().shoveit;
        return updateBlogPopularity(blog_id, false);
    });
    $("[data-digit]").off();
    $("[data-digit]").on("click", function (e) {
        let blog_id = $(this).data().digit;
        return updateBlogPopularity(blog_id, true);
    });

    $("[data-blog_comment]").off();
    $("[data-blog_comment]").on("click", function (e) {
        let blog_id = $(this).data().blog_comment;
        return getblogComments(blog_id);
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
        let $confirm = $("#confirm_modal")
        $confirm.modal("show")
        let yes_btn = $confirm.find("[data-confirm=true]")
        let no_btn = $confirm.find("[data-confirm=false]")
        no_btn.on("click", function () {
            $confirm.modal("hide")
        })
        yes_btn.on("click", function () {
            $.ajax({
                url: `/blog/delete/`,
                type: "POST",
                data: {
                    blog_id: id
                },
                success: function () {
                    $confirm.modal("hide")
                    $(`[data-blog=${id}]`).slideUp(300, function () {
                        $(`[data-blog=${id}]`).remove();
                    });
                },
                error: function () {
                    $confirm.modal("hide")
                    alert("could not delete blog");
                }
            })
        })
    });


    $("[data-blog_edit]").off();
    $("[data-blog_edit]").on("click", function () {
        let $this = $(this);
        invokeBlogEdit_btn($this);
    });

    $("[data-action=submit_new_blog]").off();
    $("[data-action=submit_new_blog]").on("click", function () {
        let $this = $(this);
        let $parent = $this.parent();
        let $form = $($this.data().form)
        let data = $form.serialize();
        $.ajax({
            url: "/blog/postBlog",
            type: "POST",
            data: data,
            complete: function () {
                $("#blog_form").slideToggle();
                let inputs = $form.find("input");
                let textarea = $form.find("textarea");
                $.each(inputs, function (i, input) {
                    $(input).val("");
                    $(input).text("");
                })
                $.each(textarea, function (i, input) {
                    $(textarea).val("");
                    $(textarea).text("");
                })
            }
        })
    });

    $("[data-action=search_amazon_api]").off();
    $("[data-action=search_amazon_api]").on("click", function () {
        let $this = $(this);
        let btn_data = $this.data();
        let $form = $(btn_data.form);
        let input = $form.find("input[name=VariationPage]")
        input.val("1")
        let data = $form.serialize();
        searchAmazon(data)
    });

    $("[data-setItemPage]").off();
    $("[data-setItemPage]").on("click", function () {
        let $this = $(this);        
        let parent = $this.parent()
        let prev = parent.find(".active")
        let btn_data = $this.data();
        prev.removeClass("active");
        $this.addClass("active");
        let $form = $(btn_data.form);
        let input = $form.find("input[name=ItemPage]")
        let val = btn_data.setitempage;
        input.val(val);
        let data = $form.serialize();
        searchAmazon(data)

    });

    getBlogProducts();

})();


function getBlogProducts(){
    let products = $("[data-getBlogProduct]");
    $.each(products, function(i, product){
        let $p = $(product);
        let $p_data = $p.data();
        getSingleProduct($p, $p_data.getblogproduct);        
    })
}
function getSingleProduct($p, asin){
        return $.ajax({
            url: "/amazon/searchForOne",
            type: "GET",
            data: {product_id: asin},
            success: function (responce) {
                $p.parent().html(responce)
                return false;
            }
        });
}
function searchAmazon(data){
        return $.ajax({
            url: "/amazon/search",
            type: "GET",
            data: data,
            success: function (responce) {
                $("[data-placement=product_modal_results]").html(responce);
                invokeProductToBlog()
                return false;
            }
        });
}
function invokeProductToBlog(){
$("[data-product-to-blog]").off();
$("[data-product-to-blog]").on("click", function(){
    $("input[name=product_id]").val($(this).data().productToBlog);
    $("#spanBlogText").text(" Product Selected")
})
}


function getblogComments(blog_id) {
    $.ajax({
        url: "/blog/comments",
        type: "GET",
        data: { blog_id: blog_id },
        success: function (data) {
            let $comment_area = $(`[data-place_comments=${blog_id}]`);
            $comment_area.html(data);
            let $text_area = $comment_area.find("textarea");
            setTimeout(function () {
                if ($comment_area.css("display") === "none") {
                    $comment_area.slideDown(200, function () {
                        $text_area.focus();
                    });
                }
                else {
                    $text_area.focus();
                }
            }, 100)
            let $form = $comment_area.find("form");


            let $btn = $form.find("[data-post_comment]");
            $btn.on("click", function () {
                let data = $form.serialize();
                $form.parent().parent().slideUp();
                $(this).off();
                postComment(data, $comment_area, blog_id);
            })
        }
    });
}

function postComment(data, comment_area, blog_id) {
    $.ajax({
        url: "/blog/comment",
        type: "POST",
        data: data,
        success: function (data) {
            console.log(data);
        }
    });
}
function updateBlogPopularity(blog_id, digShoveBool) {
    $.ajax({
        url: "/blog/popularity",
        type: "POST",
        data: { blog_id: blog_id, upvote: digShoveBool }
    });
};


function invokeBlogEdit_btn($e) {
    let edit_promise = new Promise((resolve, reject) => {
        let id = $e.data().blog_edit;
        let url = `/blog/edit/${id}`
        $.ajax({
            url,
            type: "GET",
            success: function (html) {
                let res_arr = [html, id]
                resolve(res_arr);
            },
            error: function (error) {
                reject(error);
            }
        })
    });

    edit_promise.then((arr) => {
        let html = arr[0];
        let id = arr[1];
        let $blog = $(`[data-blog=${id}]`);
        let oldHtml = $blog.html();
        $blog.fadeOut(400, function () {
            $blog.html(html);
            $blog.fadeIn();
            handleEditFormActions($blog, id, oldHtml);
        });
    });
    edit_promise.catch((error) => {
        alert("Error, see log");
        console.error(error);
    });
}
function handleEditFormActions($blog, id, oldHtml) {
    let tag_action = $blog.find("[data-action=tags_input]");
    let cancel_action = $blog.find("[data-blog_edit_cancel]");
    let tag_delete_action = $blog.find("[data-action=delete_tag]");
    let submit_action = $blog.find("[data-submit_blog]");
    invokeTagAction(tag_action);
    invokeTagDeleteAction(tag_delete_action);
    invokeTagCancelAction(cancel_action, $blog, oldHtml);
    invokeBlogEditSubmitAction(submit_action, id, $blog);
}

function invokeTagAction($e) {
    $e.off();
    $e.on("click", function () {
        let $this = $(this);
        handleTagAction($this);
    });
}
function handleTagAction($e) {
    let $input = $e.find("input");
    $input.hide();
    $input.attr("type", "text");
    $input.fadeToggle();
    $e.off();
    let $addBtn = $e.find("i")
    $addBtn.toggleClass("fa-plus")
    $addBtn.toggleClass("fa-times")
    $addBtn.off();
    $addBtn.on("click", function () {
        let $this = $(this)
        $this.toggleClass("fa-plus")
        $this.toggleClass("fa-times")
        $input.fadeToggle();
    })
}
function invokeTagCancelAction($e, $blog, oldHtml) {
    $e.off();
    $e.on("click", function () {
        handleTagCancelAction($(this), $blog, oldHtml)
    });
}
function handleTagCancelAction($e, $blog, oldHtml) {
    $blog.fadeOut(400, function () {
        $blog.html(oldHtml);
        $blog.fadeIn();
        let editBtn = $blog.find("[data-blog_edit]");
        editBtn.off();
        editBtn.on("click", function () {
            let $this = $(this);
            invokeBlogEdit_btn($this);
        });
        let delete_blog_btn = $blog.find("[data-blog_delete]");
        delete_blog_btn.off();
        delete_blog_btn.on("click", function () {
            let $this = $(this);
            let id = $this.data().blog_delete;
            let $confirm = $("#confirm_modal")
            $confirm.modal("show")
            let yes_btn = $confirm.find("[data-confirm=true]")
            let no_btn = $confirm.find("[data-confirm=false]")
            no_btn.on("click", function () {
                $confirm.modal("hide")
            })
            yes_btn.on("click", function () {
                $.ajax({
                    url: `/blog/delete/`,
                    type: "POST",
                    data: {
                        blog_id: id
                    },
                    success: function () {
                        $confirm.modal("hide")
                        $(`[data-blog=${id}]`).slideUp(300, function () {
                            $(`[data-blog=${id}]`).remove();
                        });
                    },
                    error: function () {
                        $confirm.modal("hide")
                        alert("could not delete blog");
                    }
                })
            })
        });
    })

}

function invokeTagDeleteAction($e, $blog, oldHtml) {
    $e.off();
    $e.on("click", function () {
        handleTagDeleteAction($(this))
    });
}
function handleTagDeleteAction($e) {
    $e.parent().remove();
}
function invokeBlogEditSubmitAction($e, id, $blog) {
    $e.off();
    $e.on("click", function () {
        handleBlogEditSubmitAction($(this), $blog)
    });
}
function handleBlogEditSubmitAction($e, $blog) {
    let original_tags = $blog.find(".orig_tag");
    let new_tags = $blog.find("input.tag_input_edit");
    let str = ""
    if (new_tags.val() !== "") {
        str = new_tags.val().trim() + " ";
    }
    if (original_tags.length > 0) {
        $.each(original_tags, function (i, tag) {
            let $tag = $(tag);
            str += `${$tag.text().trim()} `;
        });
    }
    let success_ele = $blog.find("[data-success=blog]");
    var error_ele = $blog.find("[data-error=blog]");
    if (str === "") {
        success_ele.hide();
        let bold_text = error_ele.find("strong");
        let message_text = error_ele.find("span");
        bold_text.text("Tag Error! ");
        message_text.text("At least one tag is needed.");
        error_ele.fadeIn(200);
        return false;
    } else {
        submitBlogPromise($blog, str, success_ele, error_ele);
    }
}


function submitBlogPromise($blog, tags, $success_ele, $error_ele) {
    const url = "/blog/edit/";
    const type = "POST";
    let subject = $blog.find("input[name=subject]");
    let body = $blog.find("textarea[name=body]");
    let user_updated = $blog.find("input[name=user_updated]");
    let blog_id = $blog.find("input[name=blog_id]");

    const data = {
        subject: parseString(subject.val()),
        body: parseString(body.val()),
        tags: parseString(tags),
        user_updated: parseString(user_updated.val()),
        blog_id: parseInt(blog_id.val())
    }

    let blogEditPostPromise = new Promise((resolve, reject) => {
        $.ajax({
            url,
            type,
            data,
            success: function (html) {
                resolve(html)
            },
            error: function (error) {
                reject(error)
            }
        })
    });
    blogEditPostPromise.then(function (html) {
        $blog.fadeOut(400, function () {
            $blog.html(html);
            $blog.fadeIn(function () {
                let editBtn = $blog.find("[data-blog_edit]");
                editBtn.off();
                editBtn.on("click", function () {
                    let $this = $(this);
                    invokeBlogEdit_btn($this);
                });
                let delete_blog_btn = $blog.find("[data-blog_delete]");
                delete_blog_btn.off();
                delete_blog_btn.on("click", function () {
                    let $this = $(this);
                    let id = $this.data().blog_delete;
                    let $confirm = $("#confirm_modal")
                    $confirm.modal("show")
                    let yes_btn = $confirm.find("[data-confirm=true]")
                    let no_btn = $confirm.find("[data-confirm=false]")
                    no_btn.on("click", function () {
                        $confirm.modal("hide")
                    })
                    yes_btn.on("click", function () {
                        $.ajax({
                            url: `/blog/delete/`,
                            type: "POST",
                            data: {
                                blog_id: id
                            },
                            success: function () {
                                $confirm.modal("hide")
                                $(`[data-blog=${id}]`).slideUp(300, function () {
                                    $(`[data-blog=${id}]`).remove();
                                });
                            },
                            error: function () {
                                $confirm.modal("hide")
                                alert("could not delete blog");
                            }
                        })
                    })
                });
            })
        })
    });
    blogEditPostPromise.catch(function (error) {
        alert("Error, see log.")
        return console.error(error.message)
    });

}

function parseString(str) {
    return str.trim().replace(/\'/g, '&apos;');
}

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
