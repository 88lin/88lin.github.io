"user strict";

$(document).ready(function() {
    //menu header bar
    //更多模板：HttP://www.bootstrapmb.com
    $(".header-bar").on("click", function(e) {
        $(".main-menu, .header-bar").toggleClass("active");
    });
    $(".main-menu li a").on("click", function(e) {
        var element = $(this).parent("li");
        if (element.hasClass("open")) {
            element.removeClass("open");
            element.find("li").removeClass("open");
            element.find("ul").slideUp(300, "swing");
        } else {
            element.addClass("open");
            element.children("ul").slideDown(300, "swing");
            element.siblings("li").children("ul").slideUp(300, "swing");
            element.siblings("li").removeClass("open");
            element.siblings("li").find("li").removeClass("open");
            element.siblings("li").find("ul").slideUp(300, "swing");
        }
    });
    //menu header bar
    //menu top fixed bar
    var fixed_top = $(".header-section");
    $(window).on("scroll", function() {
        if ($(this).scrollTop() > 220) {
            fixed_top.addClass("menu-fixed animated fadeInDown");
            fixed_top.removeClass("slideInUp");
            $("body").addClass("body-padding");
        } else {
            fixed_top.removeClass("menu-fixed fadeInDown");
            fixed_top.addClass("slideInUp");
            $("body").removeClass("body-padding");
        }
    });
    //menu top fixed bar
    // click even scroll bar
    $(window).on("scroll", function() {
        if ($(this).scrollTop() > 300) {
            $(".scrollToTop").fadeIn();
        } else {
            $(".scrollToTop").fadeOut();
        }
    });
    // click even scroll bar
    // scroll top bottom bar
    $(".scrollToTop").on("click", function() {
        $("html, body").animate({
                scrollTop: 0,
            },
            700
        );
        return false;
    });
    // scroll top bottom bar
    /*-- Odometer Counting Start--*/
    $(".odometer-item").each(function() {
        $(this).isInViewport(function(status) {
            if (status === "entered") {
                for (
                    var i = 0; i < document.querySelectorAll(".odometer").length; i++
                ) {
                    var el = document.querySelectorAll(".odometer")[i];
                    el.innerHTML = el.getAttribute("data-odometer-final");
                }
            }
        });
    });
    /*-- Odometer Counting End--*/
    // wow animation
    new WOW().init();
    // wow animation
    // scroll top bottom
    let calcScrollValue = () => {
        let scrollProgress = document.getElementById("progress");
        let progressValue = document.getElementById("valu");
        let pos = document.documentElement.scrollTop;
        let calcHeight =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;
        let scrollValue = Math.round((pos * 250) / calcHeight);

        if (pos > 250) {
            scrollProgress.style.display = "grid";
        } else {
            scrollProgress.style.display = "none";
        }
        scrollProgress.addEventListener("click", () => {
            document.documentElement.scrollTop = 0;
        });
    };
    window.onscroll = calcScrollValue;
    window.onload = calcScrollValue;
    // scroll top bottom
    //preloader
    setTimeout(function() {
        $('.bg-load').fadeToggle();
    }, 1500);
    //preloader

    //Tabbing tab
    const tabs = document.querySelectorAll(".tab");
    const tabContent = document.querySelectorAll(".tab-content");
    let tabNo = 0;
    let contentNo = 0;
    tabs.forEach((tab) => {
        tab.dataset.id = tabNo;
        tabNo++;
        tab.addEventListener("click", function() {
            tabs.forEach((tab) => {
                tab.classList.remove("active");
                tab.classList.add("non-active");
            });
            this.classList.remove("non-active");
            this.classList.add("active");
            tabContent.forEach((content) => {
                content.classList.add("hidden");
                if (content.dataset.id === tab.dataset.id) {
                    content.classList.remove("hidden");
                }
            });
        });
    });
    tabContent.forEach((content) => {
        content.dataset.id = contentNo;
        contentNo++;
    });

    //Filtering
    var navbtn = document.querySelectorAll('.button'),
        i; // select all items to become filter

    [].forEach.call(navbtn, function(al) {
            al.addEventListener('click', function() {

                document.querySelector('.is-checked').classList.remove('is-checked') //remove the active class
                this.classList.add('is-checked') //add the active class to this, the clicked element

                var match = this.dataset.filter // store the data-filter of the clicked element in a variable

                var project = document.querySelectorAll('.item'); // create a variable for element to filter
                [].forEach.call(project, function(el) {
                    el.classList.add('fade')
                    setTimeout(function() {
                            el.classList.add('none')
                        }, 300) //fade and hide all items
                    if (el.classList.contains(match)) { //if one or several items contains the variable of this.datafilter in ther class, show it and fade it in.
                        setTimeout(function() {
                            el.classList.remove('none')
                        }, 300)
                        setTimeout(function() {
                            el.classList.remove('fade')
                        }, 400)
                    }
                    if (match === "*") { // if * show all
                        setTimeout(function() {
                            el.classList.remove('none')
                        }, 300)
                        setTimeout(function() {
                            el.classList.remove('fade')
                        }, 400)
                    }
                })
            })
        })
        //Filtering

    //Nice select
    $('select').niceSelect();

});