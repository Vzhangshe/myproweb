
const observer=

new IntersectionObserver(

entries=>{

entries.forEach(

entry=>{

if(

entry.isIntersecting

){

entry.target.classList.add(

"show"

)

}

}

)

}

)

document

.querySelectorAll(

".card,.product-grid,.details"

)

.forEach(

el=>observer.observe(el)

)
