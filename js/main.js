const proxyUrl = "http://localhost:3000/q/wholesale";
const regex = new RegExp('\{"mods".*\}')

const clearIcon = document.querySelector(".clear-icon");
const searchBar = document.querySelector(".search");

let sharedObject = {}

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

function log(msg){console.log(msg)}

function buildUrl(param, nextPage){
    const defParam = "SearchText"
    url = new URL(proxyUrl)
    url.searchParams.append(defParam, param)
    if (!nextPage) {
        return  url
    }
    
    if (sharedObject.pageNav.currentPage+1 <= sharedObject.pageNav.maxPage) {
        sharedObject.pageNav.currentPage = sharedObject.pageNav.currentPage+1;
        url.searchParams.append("page", sharedObject.pageNav.currentPage)
        //log(url)
        return url
    } else {
        alert("Already on last page")
    }
    
}

function ClearParentElem() {
    let parentElem = document.getElementsByClassName("topLevelDiv").item(0)
    if (parentElem) {
        parentElem.remove()
        return true
    }
    return false
}

function CreateParentElem(){
        let parentElem = document.createElement("div")
        parentElem.classList.add("topLevelDiv")
        document.body.appendChild(parentElem)
        return parentElem
}


async function Main(){
        log('debug')
        let input = document.querySelector("input").value
        let url = buildUrl(input)
        await get_resource(url)
        await FilterResults()
        sharedObject['newView'] = true;
        await buildView()
    
}

async function FilterResults(){
    log(JSON.stringify(sharedObject))
   sharedObject['mods'] = sharedObject['mods'].mods.itemList.content.map(function (mods){
        try {
            return {
                "image": "https:" + mods.image.imgUrl, "price": mods.prices.salePrice.minPrice,
                "currency": mods.prices.salePrice.currencyCode,
                "storeName": mods.store.storeName, "storeUrl": "https:" + mods.store.storeUrl,
                "title": mods.title.displayTitle,
                "sold": mods.trade.tradeDesc
            }
        }
        catch(err){

            return {
                "image": "https:" + mods.image.imgUrl, "price": mods.prices.salePrice.minPrice,
                "currency": mods.prices.salePrice.currencyCode,
                "storeName": mods.store.storeName, "storeUrl": "https:" + mods.store.storeUrl,
                "title": mods.title.displayTitle

            }

        }

    })
}

function CreateBtn(){
    let btn = document.createElement("div");
    btn.classList = "container"
    if (sharedObject.pageNav.currentPage <= sharedObject.pageNav.maxPage) {
        btn.innerHTML = `<h4>currently you have viewed the ${sharedObject.pageNav.currentPage} page out of ${sharedObject.pageNav.maxPage}</h4>\n`
            + "<p>do you want to see more ?</p>\n" +
            "<button onclick=\"LoadMore()\">Load more</button>\n"
    } else {
        btn.innerHTML = "<h4>You've reached the last page for this search</h4>\n" +
        "<h4>try a new search?</h4>"    
    }
    return btn
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
        `        <div><p>${item.currency} ${item.price}</div>\n` 
    
    if ('sold' in item){
        tpl = tpl + `<div><p>sold: ${item.sold}</p></div>\n`
        }
    
    tpl = tpl + "      </div>\n"

    container.innerHTML=tpl
    return container
}

function buildResultDiv(){
    let myDiv = document.createElement("div")
    myDiv.classList.add("resultContainer")
    
    for (let item of sharedObject['mods']) {
        let subDiv = document.createElement("div")
        subDiv.classList.add("childItem")
        subDiv.appendChild(genContainer(item))
        myDiv.appendChild(subDiv)
    }
    myDiv.appendChild(CreateBtn())
    return myDiv
}

async function LoadMore(){
    let input = document.querySelector("input").value
    let url = buildUrl(input, true)
    await get_resource(url)
    await FilterResults()
    sharedObject['addView'] = true;
    btn = document.querySelector("button")
    btn.parentElement.remove()
    await buildView()
}

async function buildView(){
    
    const myDiv = buildResultDiv();
    let parentElem;
    if ('newView' in sharedObject && sharedObject.newView === true) {
       
        ClearParentElem()
        parentElem = CreateParentElem()
        delete sharedObject.newView
        
        } else if ('addView' in sharedObject && sharedObject.addView === true){
        
        parentElem = document.getElementsByClassName("topLevelDiv").item(0)
        delete sharedObject.addView
    }
   
    parentElem.appendChild(myDiv)
    document.getElementsByClassName("main").item(0).appendChild(parentElem)
    
    
}

async function get_resource(url){
    log(url.toString())
    fetch(url.toString())
    .then(
        function (response){
            log(response.status)
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
                sharedObject['mods'] = JSON.parse(windowsParams)
                
                let newregex = new RegExp('(pageNav: )(\{.*\})')
                let configs = item.innerText.match(newregex)
                if (configs){
                    sharedObject['pageNav'] = JSON.parse(configs[2])
                }
                break;
            }
        }



    }).catch(err => {log(err)})


}

