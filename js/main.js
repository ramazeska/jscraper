const proxyUrl = "http://localhost:3000/q";
const modsPattern = '/\{\"mods\":.*\}/gm';
async function Main(){
    document.addEventListener("submit", async () => {
        let input = document.querySelector("input").value
        let result = await get_resource(input)
        log("main")
        log(JSON.parse(result[0]));
        //document.body.innerHTML = await get_resource(input).body.innerHTML;

    })
}

function log(msg){console.log(msg)}

function buildUrl(param){
    return proxyUrl + "/wholesale?SearchText="+param;
    //return proxyUrl + "/search.aspx?keyword="+param;
}

async function get_resource(val){
    url = buildUrl(val)
    return fetch(url)
    .then(
        function (response){
            log("response:"+ response.statusCode)
            return response.text()
        })
    .then(function (data){
        const parser = new DOMParser();
        return parser.parseFromString(data, "text/html")
        
    }).then(function (html){
        
        let windowsParams;
        let scripts = html.querySelectorAll("script");
        for (let item of scripts){
            if (item.innerText.toLowerCase().includes("window.runparams")) {
                windowsParams = item.innerText;
                let regex = new RegExp('\{"mods".*\}')
                windowsParams = item.innerText.match(regex)
                break;
            }
        }


           
        return windowsParams;
    })
    .catch(err => {
            console.error(err)
        })
    
}
