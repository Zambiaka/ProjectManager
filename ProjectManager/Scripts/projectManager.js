getData();


function getData() {

    function resolve() {

    }


    function reject() {

    }
    //let userId =JSON.stringify([1]);
    //return new Promise(function (resolve, reject) {
    $.ajax({
        type: "POST",
        url: "/Projects/GetProjects",
        data: JSON.stringify([1]),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: resolve,
        error: reject
    });
    //});
}