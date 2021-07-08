const proxyUrl = "http://localhost:3000/q";
const regex = new RegExp('\{"mods".*\}')

const clearIcon = document.querySelector(".clear-icon");
const searchBar = document.querySelector(".search");

searchBar.addEventListener("keyup", () => {
    if(searchBar.value && clearIcon.style.visibility != "visible"){
        clearIcon.style.visibility = "visible";
    } else if(!searchBar.value) {
        clearIcon.style.visibility = "hidden";
    }
});

clearIcon.addEventListener("click", () => {
    searchBar.value = "";
    clearIcon.style.visibility = "hidden";
})

const formObj = document.querySelector("form")
formObj.addEventListener("submit", Main);


async function Main(){
    //document.addEventListener("submit", async () => {
        let input = document.querySelector("input").value
        let result = await get_resource(input)
        log("main")
        // log(result['mods']);
        const filtered = result.mods.itemList.content.map(function (mods){

            return {
                "image":"https:"+mods.image.imgUrl, "price": mods.prices.salePrice.minPrice,
                "currency": mods.prices.salePrice.currencyCode,
                "storeName": mods.store.storeName, "storeUrl": "https:"+mods.store.storeUrl,
                "title": mods.title.displayTitle,
                "sold": mods.trade.tradeDesc
            }
            // return obj
        })
        log(filtered)
        await buildView(filtered)
        //document.body.innerHTML = await get_resource(input).body.innerHTML;


}

function genName(){
    const chars = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"]
    return [...Array(10)].map(i=>chars[Math.random()*chars.length|0]).join``;
}

function genContainer(item){
    let container = document.createElement("div")
    container.classList.add("container")
    let tpl = `<div class=${genName()}>\n` +
        `        <div><img src=${item.image} alt=${item.title}></div>\n` +
        `        <div><a href=${item.storeUrl}>${item.storeName}</a></div>\n` +
        `        <div><p>${item.title}</div>\n` +
        `        <div><p>${item.currency} ${item.price}</div>\n` +
        `        <div><p>sold: ${item.sold}</div>\n` +
        "      </div>"

    container.innerHTML=tpl
    return container
}

async function buildView(srcJson){
    let parentElem = document.getElementsByClassName("topLevelDiv").item(0)
    myDiv = document.createElement("div")
    myDiv.classList.add("resultContainer")
    for (let item of srcJson){
        let subDiv = document.createElement("div")
        subDiv.classList.add("childItem")
        subDiv.appendChild(genContainer(item))
        myDiv.appendChild(subDiv)
    }
    parentElem.appendChild(myDiv)

}

function log(msg){console.log(msg)}

function buildUrl(param){
    return proxyUrl + "/wholesale?SearchText="+param;
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

                windowsParams = item.innerText.match(regex)
                break;
            }
        }


        return JSON.parse(windowsParams);
    })
    .catch(err => {
            console.error(err)
        })

}
