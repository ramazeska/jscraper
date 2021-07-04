function get_resource(){
    fetch("http://localhost:3000/q/search.aspx?keyword=ball")
    .then(
        function (response){
            console.log("response:"+ response.body)
        })
    .catch(err => {
            console.error(err)
        })

}
